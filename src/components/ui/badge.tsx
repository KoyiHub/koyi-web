import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const tones: Record<BadgeTone, string> = {
  success: 'bg-koyi-success/10 text-koyi-success',
  warning: 'bg-koyi-warning/10 text-koyi-warning',
  danger: 'bg-koyi-danger/10 text-koyi-danger',
  info: 'bg-koyi-primary/10 text-koyi-primary',
  neutral: 'bg-koyi-surface text-koyi-muted',
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Text-first status indicator — colour is a reinforcement, never the only signal. */
export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'rounded-koyi-sm inline-flex items-center px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
