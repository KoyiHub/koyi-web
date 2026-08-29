import { type TextareaHTMLAttributes, useId } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  /** Hides the label visually but keeps it for screen readers. */
  labelHidden?: boolean;
}

/**
 * Labelled multi-line input. The textarea counterpart of `TextField`, with the
 * same error and hint wiring so a form can mix the two without the fields
 * drifting apart.
 */
export function TextareaField({
  label,
  error,
  hint,
  labelHidden = false,
  className,
  id,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className={cn('text-koyi-text text-sm font-medium', labelHidden && 'sr-only')}
      >
        {label}
      </label>

      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          'border-koyi-border rounded-koyi-md text-koyi-text w-full border bg-white px-3 py-2.5 text-sm',
          'placeholder:text-koyi-muted focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
          error && 'border-koyi-danger',
          className,
        )}
        {...props}
      />

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
