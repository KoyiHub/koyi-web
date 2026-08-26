import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  /** Optional leading icon (decorative — the `label` already names the field). */
  icon?: ReactNode;
}

/** Labelled text input with accessible error wiring, shared by auth forms. */
export function TextField({ label, error, icon, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-koyi-text text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="text-koyi-muted pointer-events-none absolute inset-y-0 left-3 flex items-center"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'border-koyi-border rounded-koyi-md text-koyi-text h-11 w-full border bg-white px-3 text-sm',
            'placeholder:text-koyi-muted focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            icon && 'pl-9',
            error && 'border-koyi-danger',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
