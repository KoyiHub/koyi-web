import { type SelectHTMLAttributes, useId } from 'react';

import { ChevronDownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  label: string;
  options: SelectOption[];
  error?: string | undefined;
  /** Shown as a disabled first option when the field has no value yet. */
  placeholder?: string;
  /** Keeps the label for screen readers but hides it visually (toolbar filters). */
  labelHidden?: boolean;
  /** Classes for the wrapper, so callers can size the whole control. */
  wrapperClassName?: string;
}

/**
 * Labelled select that matches `TextField`'s height, border and error wiring
 * so mixed rows of inputs and dropdowns line up exactly. The native chevron is
 * suppressed (`appearance-none`) in favour of our own icon — browsers render
 * the default arrow at wildly different sizes.
 */
export function SelectField({
  label,
  options,
  error,
  placeholder,
  labelHidden,
  wrapperClassName,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      <label
        htmlFor={selectId}
        className={cn('text-koyi-text text-sm font-medium', labelHidden && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'border-koyi-border rounded-koyi-md text-koyi-text h-11 w-full appearance-none border bg-white pr-9 pl-3 text-sm',
            'focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            error && 'border-koyi-danger',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="text-koyi-muted pointer-events-none absolute inset-y-0 right-3 flex items-center"
        >
          <ChevronDownIcon />
        </span>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
