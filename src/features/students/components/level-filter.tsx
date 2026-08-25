import { cn } from '@/lib/utils/cn';

export type LevelFilterValue = 'all' | 'strong' | 'intermediate' | 'struggling';

const filterOptions: { value: LevelFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'strong', label: 'Strong' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'struggling', label: 'Struggling' },
];

interface LevelFilterProps {
  value: LevelFilterValue;
  onChange: (value: LevelFilterValue) => void;
}

/** Local UI-only filter — selection never leaves this page. */
export function LevelFilter({ value, onChange }: LevelFilterProps) {
  return (
    <div role="group" aria-label="Filter students by level" className="flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'rounded-koyi-md border-koyi-border flex h-9 items-center border px-4 text-sm font-medium transition-colors',
              isActive
                ? 'border-koyi-primary bg-koyi-primary text-white'
                : 'bg-koyi-card text-koyi-text hover:bg-koyi-surface',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
