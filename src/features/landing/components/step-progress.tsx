import { landingStepCount, landingSteps, stepNumber } from '@/config/landing-steps';
import { cn } from '@/lib/utils/cn';

interface StepProgressProps {
  /** Key of the step currently being shown, from `@/config/landing-steps`. */
  stepKey: string;
  /**
   * `inline` — compact, label-left/bars-right, used in the Welcome hero.
   * `block` — full-width, counter above the bars, used on the centred steps.
   */
  variant?: 'inline' | 'block';
}

/**
 * Journey progress. Rendered as a real `progressbar` so assistive tech
 * announces "3 of 6" rather than reading six anonymous divs; the segments
 * themselves are decorative.
 */
export function StepProgress({ stepKey, variant = 'block' }: StepProgressProps) {
  const current = stepNumber(stepKey);
  const label = landingSteps.find((step) => step.key === stepKey)?.label ?? '';
  const counter = `Step ${String(current)} of ${String(landingStepCount)}`;

  const segments = (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={landingStepCount}
      aria-valuetext={counter}
      className={cn('flex items-center gap-1.5', variant === 'inline' ? 'w-32' : 'w-full')}
    >
      {landingSteps.map((step, index) => (
        <span
          key={step.key}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-colors',
            index + 1 < current && 'bg-koyi-accent/40',
            index + 1 === current && 'bg-koyi-primary',
            index + 1 > current && 'bg-koyi-border',
          )}
        />
      ))}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4">
        <p className="text-koyi-accent text-xs font-semibold tracking-wide uppercase">{counter}</p>
        {segments}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-koyi-text text-sm font-medium">{counter}</p>
        <p className="text-koyi-primary text-sm font-semibold">{label}</p>
      </div>
      {segments}
    </div>
  );
}
