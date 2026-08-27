import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Controls aligned to the right of the title on wide viewports. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The oversized title block every School Admin screen opens with. Actions wrap
 * below the title on narrow viewports rather than squeezing it.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-koyi-text font-display lg:text-koyi-page-title text-3xl leading-tight font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && <p className="text-koyi-muted mt-1.5 text-sm">{subtitle}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3 lg:shrink-0">{actions}</div>}
    </header>
  );
}
