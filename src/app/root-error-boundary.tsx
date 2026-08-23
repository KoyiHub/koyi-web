import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { ApiError } from '@/lib/api/errors';

/**
 * Rendered by the router whenever a route (or anything it renders) throws.
 * Keeps the app shell alive instead of showing a blank page.
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  const { title, message } = describe(error);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        {env.isDev && error instanceof Error && (
          <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-left text-xs text-slate-100">
            {error.stack}
          </pre>
        )}

        <Button
          className="mt-6"
          onClick={() => {
            window.location.assign('/');
          }}
        >
          Back to safety
        </Button>
      </div>
    </div>
  );
}

function describe(error: unknown): { title: string; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${String(error.status)} ${error.statusText}`,
      message: 'That page could not be loaded.',
    };
  }

  if (error instanceof ApiError) {
    return { title: 'Request failed', message: error.message };
  }

  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Try reloading the page.',
  };
}
