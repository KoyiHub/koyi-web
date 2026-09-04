import axios, { type AxiosRequestConfig } from 'axios';
import type { z } from 'zod';

import { env } from '@/config/env';
import { ApiError, toApiError } from '@/lib/api/errors';
import { clearSitting, getSittingSession } from '@/lib/api/sitting-store';

/**
 * The API client for the assessment runner — the surface a child touches.
 *
 * A separate axios instance rather than a mode on the main client, because
 * every one of that client's behaviours is wrong here:
 *
 * - **Credential.** A child holds a sitting session, sent as `X-Sitting-Session`.
 *   It is a capability, not an identity, and the two schemes are not
 *   interchangeable — neither is accepted where the other belongs.
 * - **Refresh.** There is nothing to refresh. A sitting expires and that is the
 *   end of it.
 * - **What a 401 means.** Not "your token went stale" but "your sitting ended".
 *   The child re-enters their two codes at `/assessment`; they are never sent
 *   to a login page, because they have no account to log in to.
 *
 * Re-entering the codes **resumes**: the server still holds the section as
 * `in_progress` with every answer already saved, and the section timer keeps
 * its original `expires_at` rather than restarting. Nothing of the child's work
 * is lost, and nothing is gained by losing a session.
 *
 * SECURITY BOUNDARY: nothing reached through this client carries a correct
 * answer. The runner's schemas are written longhand rather than derived from a
 * teacher schema with `is_correct` omitted — an `.omit()` someone later deletes
 * fails silently, a separate schema fails loudly. `eslint.config.js` also
 * forbids `features/runner/**` from importing teacher or school modules at all.
 */

export const runnerAxios = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

runnerAxios.interceptors.request.use((config) => {
  const session = getSittingSession();
  if (session) {
    config.headers.set('X-Sitting-Session', session);
  }
  return config;
});

/**
 * Called when a sitting turns out to be over, so the runner can send the child
 * back to the code entry screen.
 *
 * A callback rather than a router import: this module must stay free of React
 * and of the route table, and the runner registers its handler on mount.
 */
type ExpiryHandler = () => void;
let onSittingExpired: ExpiryHandler | null = null;

export function setSittingExpiredHandler(handler: ExpiryHandler | null): void {
  onSittingExpired = handler;
}

runnerAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

    if (apiError.isUnauthorized) {
      // The sitting is over. Clear it once here so every screen agrees, then
      // let the runner navigate — no refresh, no retry.
      clearSitting();
      onSittingExpired?.();
    }

    return Promise.reject(apiError);
  },
);

/**
 * Thin typed wrapper. Identical in shape to `api` in `client.ts` so a screen
 * reads the same either side of the boundary, but wired to the runner instance.
 */
async function request<TSchema extends z.ZodType>(
  schema: TSchema,
  config: AxiosRequestConfig,
): Promise<z.infer<TSchema>> {
  const response = await runnerAxios.request<unknown>(config);
  const parsed = schema.safeParse(response.data);

  if (!parsed.success) {
    if (env.isDev) {
      console.error(
        `Runner response validation failed for ${config.url ?? '<unknown>'}`,
        parsed.error,
      );
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

export const runnerApi = {
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
};
