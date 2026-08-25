import { cn } from '@/lib/utils/cn';

interface StatBarProps {
  label: string;
  valueLabel: string;
  percentage: number;
  toneClassName?: string;
  className?: string;
}

/**
 * Labelled horizontal bar shared by Group Detail (skill gaps) and Progress
 * (assessment comparison) — the numeric label is always visible, colour is
 * reinforcement only.
 */
export function StatBar({
  label,
  valueLabel,
  percentage,
  toneClassName = 'bg-koyi-primary',
  className,
}: StatBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-koyi-text font-medium">{label}</span>
        <span className="text-koyi-muted">{valueLabel}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${valueLabel}`}
        className="bg-koyi-surface mt-2 h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn('h-full rounded-full', toneClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
