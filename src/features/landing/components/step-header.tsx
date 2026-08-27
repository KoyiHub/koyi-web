import type { ReactNode } from 'react';

import { StepProgress } from '@/features/landing/components/step-progress';

interface StepHeaderProps {
  stepKey: string;
  title: ReactNode;
  subtitle: string;
}

/**
 * The shared masthead for the centred journey steps (2 through 6): progress
 * bar, headline, supporting line. Welcome (step 1) uses a split hero instead
 * and deliberately does not use this.
 */
export function StepHeader({ stepKey, title, subtitle }: StepHeaderProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <StepProgress stepKey={stepKey} />
      </div>
      <h1 className="text-koyi-text mt-8 text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="text-koyi-muted mt-3 max-w-xl text-center text-base text-pretty">{subtitle}</p>
    </div>
  );
}
