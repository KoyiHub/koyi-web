import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  /** Optional leading icon (decorative — the `label` already names the field). */
  icon?: ReactNode;
  /**
   * Right-aligned content on the label row, e.g. a "Forgot password?" link.
   * Sits in the label row rather than floating over the field, so it stays
   * reachable by keyboard and never overlaps a long label.
   */
  labelAction?: ReactNode;
  /** Content pinned inside the field's trailing edge, e.g. a reveal toggle. */
  trailing?: ReactNode;
  /** Small hint under the field, shown when there is no error to show. */
  hint?: string | undefined;
}

/** Labelled text input with accessible error wiring, shared by auth forms. */
export function TextField({
  label,
  error,
  icon,
  labelAction,
  trailing,
  hint,
  className,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn('flex items-center gap-3', labelAction && 'justify-between')}>
        <label htmlFor={inputId} className="text-koyi-text text-sm font-medium">
          {label}
        </label>
        {labelAction}
      </div>
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
          aria-describedby={describedBy}
          className={cn(
            'border-koyi-border rounded-koyi-md text-koyi-text h-11 w-full border bg-white px-3 text-sm',
            'placeholder:text-koyi-muted focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            icon && 'pl-9',
            trailing && 'pr-11',
            error && 'border-koyi-danger',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span>
        )}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-koyi-muted text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
