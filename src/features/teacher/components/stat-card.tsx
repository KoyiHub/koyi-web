import type { ComponentType, ReactNode, SVGProps } from 'react';

import { cn } from '@/lib/utils/cn';

export type TrendDirection = 'up' | 'down' | 'flat';

const TREND_CLASS: Record<TrendDirection, string> = {
  up: 'text-koyi-band-strong-ink',
  down: 'text-koyi-band-struggling-ink',
  flat: 'text-koyi-muted',
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Server-authored caption, e.g. "+4 since the baseline". Omit when there is nothing to say. */
  caption?: string | null;
  direction?: TrendDirection;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tailwind classes for the icon disc — each card carries its own tone. */
  chipClassName?: string;
  className?: string;
}

/**
 * A headline figure on a Teacher screen: icon disc, number, caption.
 *
 * The caption's wording and its direction both come from the API. The client
 * only picks the colour, so a phrase like "no change this week" can never be
 * rendered green by a client-side guess.
 */
export function StatCard({
  label,
  value,
  caption,
  direction = 'flat',
  Icon,
  chipClassName = 'bg-koyi-nav-active text-koyi-primary',
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-koyi-xl border-koyi-border bg-koyi-card border p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-koyi-muted text-sm font-medium">{label}</p>
          <p className="text-koyi-text font-display text-koyi-stat mt-2 leading-none font-extrabold">
            {value}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            chipClassName,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>

      {caption && (
        <p className={cn('mt-4 text-xs font-semibold', TREND_CLASS[direction])}>{caption}</p>
      )}
    </div>
  );
}
