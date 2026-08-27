import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-koyi-primary text-white hover:bg-koyi-primary-hover',
  secondary: 'border border-koyi-border bg-koyi-card text-koyi-text hover:bg-koyi-surface',
  ghost: 'text-koyi-text hover:bg-koyi-surface',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
};

/**
 * The shared shape/colour classes, exposed so a `<Link>` can be styled as a
 * button without wrapping one element in the other.
 *
 * Kept out of `button.tsx` so that file exports components only — a module
 * mixing components with plain values breaks React Fast Refresh.
 */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}
