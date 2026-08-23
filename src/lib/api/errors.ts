import axios from 'axios';

/**
 * A normalized error every layer above the API client can rely on, regardless
 * of whether the failure came from the network, the server, or validation.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(message: string, options: { status: number; code: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
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

interface ServerErrorBody {
  message?: string;
  detail?: string;
  code?: string;
  errors?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ServerErrorBody>(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    if (!error.response) {
      return new ApiError('Network unavailable. Check your connection and try again.', {
        status: 0,
        code: error.code ?? 'NETWORK_ERROR',
      });
    }

    return new ApiError(body?.message ?? body?.detail ?? defaultMessageFor(status), {
      status,
      code: body?.code ?? `HTTP_${String(status)}`,
      details: body?.errors ?? body,
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
