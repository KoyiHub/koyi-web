import type { ButtonHTMLAttributes } from 'react';

import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/button-variants';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={cn(buttonClasses(variant, size), className)}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
