import { type InputHTMLAttributes, useId } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

/** Labelled text input with accessible error wiring, shared by auth forms. */
export function TextField({ label, error, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-koyi-text text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'border-koyi-border rounded-koyi-md text-koyi-text h-11 border bg-white px-3 text-sm',
          'placeholder:text-koyi-muted focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
          error && 'border-koyi-danger',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
