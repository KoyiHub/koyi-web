import { SearchIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name, e.g. "Search teachers". Also used as the placeholder. */
  label: string;
  placeholder?: string;
  className?: string;
}

/** Rounded search field with a leading magnifier, per the list-page designs. */
export function SearchInput({ value, onChange, label, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <span
        aria-hidden="true"
        className="text-koyi-muted pointer-events-none absolute inset-y-0 left-3.5 flex items-center"
      >
        <SearchIcon />
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        aria-label={label}
        placeholder={placeholder ?? label}
        className="border-koyi-border text-koyi-text placeholder:text-koyi-muted focus-visible:outline-koyi-primary h-11 w-full rounded-full border bg-white pr-4 pl-10 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </div>
  );
}
