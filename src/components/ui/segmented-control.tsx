import { cn } from '@/lib/utils/cn';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SegmentedControlProps<TValue extends string> {
  label: string;
  value: TValue;
  options: SegmentedOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}

/**
 * Pill segmented control — the `This Term | Last Term | YTD` switch on the
 * dashboard. A radio group rather than a row of buttons, so arrow keys move
 * between the options and screen readers announce "2 of 3" the way the
 * control actually behaves.
 */
export function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'border-koyi-border bg-koyi-card inline-flex items-center gap-1 rounded-full border p-1',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            // Roving tabindex: the group is one tab stop, arrows move within it.
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              onChange(option.value);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();

              const index = options.findIndex((entry) => entry.value === value);
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % options.length
                  : (index - 1 + options.length) % options.length;
              const target = options[next];
              if (target) onChange(target.value);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              isActive
                ? 'text-koyi-primary bg-white font-bold shadow-sm'
                : 'text-koyi-muted hover:text-koyi-text font-medium',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface UnderlineTabsProps<TValue extends string> {
  label: string;
  value: TValue;
  options: SegmentedOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}

/** Underlined tab row — the `By Grade | By Subject` switch on chart cards. */
export function UnderlineTabs<TValue extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: UnderlineTabsProps<TValue>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex items-center gap-5', className)}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'border-b-2 pb-1 text-sm transition-colors',
              isActive
                ? 'border-koyi-primary text-koyi-primary font-bold'
                : 'text-koyi-muted hover:text-koyi-text border-transparent font-medium',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
