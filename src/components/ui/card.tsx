import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface CardProps {
  /** Omit for a bare panel with no heading row. */
  title?: string;
  subtitle?: string;
  /** Optional leading icon rendered in a tinted disc beside the title. */
  icon?: ReactNode;
  /** Controls aligned to the right of the heading row. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Heading level, so a page's cards nest correctly under its `h1`. */
  as?: 'h2' | 'h3';
}

/**
 * The white rounded panel every School Admin screen is built from. Keeping it
 * in one place means the border, radius and heading rhythm stay identical
 * across the dashboard, list, detail and settings screens.
 */
export function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
  bodyClassName,
  as: Heading = 'h2',
}: CardProps) {
  return (
    <section
      className={cn('rounded-koyi-xl border-koyi-border bg-koyi-card border p-5', className)}
    >
      {(title ?? action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon && (
              <span
                aria-hidden="true"
                className="bg-koyi-nav-active text-koyi-primary flex size-9 shrink-0 items-center justify-center rounded-full"
              >
                {icon}
              </span>
            )}
            {title && (
              <div>
                <Heading className="text-koyi-text font-display text-base font-bold">
                  {title}
                </Heading>
                {subtitle && <p className="text-koyi-muted mt-0.5 text-xs">{subtitle}</p>}
              </div>
            )}
          </div>
          {action}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
