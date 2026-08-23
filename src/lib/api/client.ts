import axios, { type AxiosRequestConfig } from 'axios';
import type { z } from 'zod';

import { env } from '@/config/env';
import { ApiError, toApiError } from '@/lib/api/errors';
import { clearAuthToken, getAuthToken } from '@/lib/auth/token-store';

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

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

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
