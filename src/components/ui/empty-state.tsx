import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Shared "nothing here" panel for lists, search results and empty rosters. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-koyi-xl border-koyi-border bg-koyi-card flex flex-col items-center border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="bg-koyi-nav-active text-koyi-primary mb-4 flex size-12 items-center justify-center rounded-full"
        >
          {icon}
        </span>
      )}

      <p className="text-koyi-text text-base font-bold">{title}</p>
      {description && <p className="text-koyi-muted mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
