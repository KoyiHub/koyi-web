import { Button } from '@/components/ui/button';
import { toApiError } from '@/lib/api/errors';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/** Uniform inline failure UI for a section that could not load. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const apiError = toApiError(error);

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">{apiError.message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
