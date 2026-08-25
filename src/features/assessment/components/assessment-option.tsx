import type { AssessmentTypeOption } from '@/features/assessment/data/assessment-setup-fixture';
import { cn } from '@/lib/utils/cn';

interface AssessmentOptionProps {
  option: AssessmentTypeOption;
  selected: boolean;
  onSelect: () => void;
}

/** A single radio-backed assessment type card in the "Choose Assessment" group. */
export function AssessmentOption({ option, selected, onSelect }: AssessmentOptionProps) {
  const inputId = `assessment-type-${option.id}`;

  return (
    <div
      className={cn(
        'rounded-koyi-md border p-4',
        selected ? 'border-koyi-primary' : 'border-koyi-border',
        option.disabled && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="radio"
          name="assessment-type"
          checked={selected}
          disabled={option.disabled}
          onChange={onSelect}
          className="border-koyi-border mt-0.5 size-5 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <label
            htmlFor={inputId}
            className="text-koyi-text flex flex-wrap items-center gap-2 text-sm font-medium"
          >
            {option.label}
            {option.disabled && (
              <span className="bg-koyi-surface text-koyi-muted rounded-full px-2 py-0.5 text-xs font-medium">
                Coming soon
              </span>
            )}
          </label>

          <p className="text-koyi-muted mt-1 text-sm">{option.description}</p>

          {option.skills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {option.skills.map((skill) => (
                <li
                  key={skill}
                  className="border-koyi-border text-koyi-text rounded-full border px-2.5 py-1 text-xs font-medium"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
