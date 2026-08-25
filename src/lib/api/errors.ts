import axios from 'axios';
import { z } from 'zod';

/**
 * A normalized error every layer above the API client can rely on, regardless
 * of whether the failure came from the network, the server, or validation.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId: string | undefined;

  constructor(
    message: string,
    options: { status: number; code: string; details?: unknown; requestId?: string },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** 5xx and network failures are the ones worth retrying. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

/**
 * The Django backend's global exception handler (`apps.common.exceptions`)
 * wraps every non-2xx response in this envelope — never a bare DRF
 * `{detail: "..."}`. `detail` carries either field-level validation errors
 * (an object/array) or is absent when `message` already summarizes a single
 * DRF `detail` string.
 */
export const apiErrorEnvelopeSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
    detail: z.unknown().nullish(),
    request_id: z.string().optional(),
  }),
});

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;

    if (!error.response) {
      return new ApiError('Network unavailable. Check your connection and try again.', {
        status: 0,
        code: error.code ?? 'NETWORK_ERROR',
      });
    }

    const parsed = apiErrorEnvelopeSchema.safeParse(error.response.data);
    if (parsed.success) {
      const { error: envelope } = parsed.data;
      return new ApiError(envelope.message || defaultMessageFor(status), {
        status,
        code: envelope.type,
        details: envelope.detail,
        ...(envelope.request_id ? { requestId: envelope.request_id } : {}),
      });
    }

    return new ApiError(defaultMessageFor(status), {
      status,
      code: `HTTP_${String(status)}`,
    });
  }

  return new ApiError(error instanceof Error ? error.message : 'Something went wrong.', {
    status: 0,
    code: 'UNKNOWN',
  });
}

function defaultMessageFor(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 422) return 'Some of the submitted values are invalid.';
  if (status >= 500) return 'The server ran into a problem. Please try again shortly.';
  return 'Request failed.';
}
