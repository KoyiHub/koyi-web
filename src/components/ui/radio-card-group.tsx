import { useId } from 'react';

import { cn } from '@/lib/utils/cn';

export interface RadioCardOption {
  value: string;
  label: string;
  /** Short clarifying line, e.g. the naming a school actually uses. */
  hint?: string;
}

export interface RadioCardGroupProps {
  legend: string;
  name: string;
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}

/**
 * A small set of mutually exclusive choices rendered as selectable cards.
 * Built on real radio inputs (visually hidden, not `display:none`) so arrow-key
 * roving, form submission and screen-reader announcement all come for free —
 * a div-with-onClick would have to reimplement every one of those.
 */
export function RadioCardGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
}: RadioCardGroupProps) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-koyi-text mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-3" {...(error ? { 'aria-describedby': errorId } : {})}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'rounded-koyi-md flex cursor-pointer flex-col justify-center border px-4 py-3 transition-colors',
                'focus-within:outline-koyi-primary focus-within:outline-2 focus-within:outline-offset-2',
                selected
                  ? 'border-koyi-primary bg-koyi-primary/5'
                  : 'border-koyi-border hover:border-koyi-primary/40 bg-white',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => {
                  onChange(option.value);
                }}
                className="sr-only"
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  selected ? 'text-koyi-primary' : 'text-koyi-text',
                )}
              >
                {option.label}
              </span>
              {option.hint && <span className="text-koyi-muted mt-0.5 text-xs">{option.hint}</span>}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      )}
    </fieldset>
  );
}
