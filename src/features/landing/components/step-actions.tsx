import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@/components/ui/icons';
import { previousStepPath } from '@/config/landing-steps';
import { cn } from '@/lib/utils/cn';

interface StepActionsProps {
  stepKey: string;
  /** Omit for a submit button inside a form; provide for plain navigation. */
  nextTo?: string;
  nextLabel?: string;
  isPending?: boolean;
  /** Centres a lone Continue button when there is no Back link (step 2). */
  className?: string;
}

/**
 * Back/Continue pair for the journey steps. Back is derived from
 * `landing-steps` rather than hard-coded per page, so it stays correct if the
 * order changes; it renders nothing on the first step.
 */
export function StepActions({
  stepKey,
  nextTo,
  nextLabel = 'Continue',
  isPending = false,
  className,
}: StepActionsProps) {
  const back = previousStepPath(stepKey);

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        back ? 'justify-between' : 'justify-center',
        className,
      )}
    >
      {back && (
        <Link
          to={back}
          className="text-koyi-primary flex h-11 items-center text-sm font-medium hover:underline"
        >
          Back
        </Link>
      )}

      {nextTo ? (
        <Link
          to={nextTo}
          className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md inline-flex h-11 min-w-36 items-center justify-center gap-2 px-5 text-sm font-medium text-white transition-colors"
        >
          {nextLabel}
          <ArrowRightIcon />
        </Link>
      ) : (
        <Button type="submit" isLoading={isPending} className="min-w-36 gap-2">
          {nextLabel}
          {!isPending && <ArrowRightIcon />}
        </Button>
      )}
    </div>
  );
}
