import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { z } from 'zod';

import { env } from '@/config/env';
import { refreshResponseSchema } from '@/features/auth/api/auth.schema';
import { ApiError, toApiError } from '@/lib/api/errors';
import {
  clearAuthToken,
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/auth/token-store';

export const axiosClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
  // Send cookies for session/refresh-token auth. Harmless for bearer-token APIs.
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.setAuthorization(`Bearer ${token}`);
  }
  return config;
});

// The auth endpoints themselves must never trigger a refresh-and-retry —
// a failed login/register/refresh call is a terminal failure, not a stale
// session.
const AUTH_ENDPOINTS = [
  '/v1/teacher/auth/login/',
  '/v1/school/auth/login/',
  '/v1/school/auth/login/verify/',
  '/v1/school/auth/register/',
  '/v1/school/auth/register/verify/',
  '/v1/auth/token/refresh/',
];

function isAuthEndpoint(url: string | undefined): boolean {
  return Boolean(url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint)));
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Concurrent 401s share one in-flight refresh instead of each firing their
// own — avoids racing SimpleJWT's rotate-and-blacklist behaviour into a
// corrupted token pair.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available.');

  const response = await axios.post<unknown>(
    `${env.VITE_API_URL}/v1/auth/token/refresh/`,
    { refresh },
    { headers: { 'Content-Type': 'application/json' } },
  );
  const parsed = refreshResponseSchema.parse(response.data);
  setAuthTokens(parsed);
  return parsed.access;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error)
      ? (error.config as RetriableConfig | undefined)
      : undefined;

    const canAttemptRefresh =
      apiError.isUnauthorized && config && !config._retried && !isAuthEndpoint(config.url);

    if (canAttemptRefresh) {
      config._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const access = await refreshPromise;
        config.headers.setAuthorization(`Bearer ${access}`);
        return await axiosClient.request(config);
      } catch {
        clearAuthToken();
        return Promise.reject(apiError);
      }
    }

    // A dead session is global state, not a per-caller concern: clear it once
    // here so every screen sees a consistent logged-out world.
    if (apiError.isUnauthorized) {
      clearAuthToken();
    }

    return Promise.reject(apiError);
  },
);

/**
 * Thin typed wrapper over axios. Every response is parsed with a Zod schema so
 * a backend contract change surfaces here as one clear error, rather than as an
 * `undefined` render crash three components deep.
 */
async function request<TSchema extends z.ZodType>(
  schema: TSchema,
  config: AxiosRequestConfig,
): Promise<z.infer<TSchema>> {
  const response = await axiosClient.request<unknown>(config);
  const parsed = schema.safeParse(response.data);

  if (!parsed.success) {
    if (env.isDev) {
      console.error(`Response validation failed for ${config.url ?? '<unknown>'}`, parsed.error);
    }
    throw new ApiError('The server returned an unexpected response.', {
      status: response.status,
      code: 'RESPONSE_VALIDATION_FAILED',
      details: parsed.error.issues,
    });
  }

  return parsed.data;
}

type Options = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>;

export const api = {
  get: <TSchema extends z.ZodType>(url: string, schema: TSchema, options?: Options) =>
    request(schema, { ...options, url, method: 'GET' }),

  post: <TSchema extends z.ZodType>(
    url: string,
    schema: TSchema,
    data?: unknown,
    options?: Options,
  ) => request(schema, { ...options, url, method: 'POST', data }),

  put: <TSchema extends z.ZodType>(
    url: string,
    schema: TSchema,
    data?: unknown,
    options?: Options,
  ) => request(schema, { ...options, url, method: 'PUT', data }),

  patch: <TSchema extends z.ZodType>(
    url: string,
    schema: TSchema,
    data?: unknown,
    options?: Options,
  ) => request(schema, { ...options, url, method: 'PATCH', data }),

  delete: <TSchema extends z.ZodType>(url: string, schema: TSchema, options?: Options) =>
    request(schema, { ...options, url, method: 'DELETE' }),
};
