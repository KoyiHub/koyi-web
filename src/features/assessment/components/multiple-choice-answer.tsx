import type { QuestionOption } from '@/features/assessment/data/assessment-session-fixture';
import { cn } from '@/lib/utils/cn';

interface MultipleChoiceAnswerProps {
  questionId: string;
  options: QuestionOption[];
  selected: string | undefined;
  onSelect: (optionId: string) => void;
}

/** Native radios so keyboard/AT behaviour and required-selection semantics come for free. */
export function MultipleChoiceAnswer({
  questionId,
  options,
  selected,
  onSelect,
}: MultipleChoiceAnswerProps) {
  return (
    <fieldset>
      <legend className="sr-only">Answer choices</legend>
      <div className="space-y-3">
        {options.map((option) => {
          const inputId = `${questionId}-${option.id}`;
          const isSelected = selected === option.id;

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={cn(
                'rounded-koyi-md border-koyi-border flex min-h-11 cursor-pointer items-center gap-3 border px-4 py-2 text-sm font-medium',
                isSelected ? 'border-koyi-primary bg-koyi-surface' : 'bg-koyi-card',
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={questionId}
                value={option.id}
                checked={isSelected}
                onChange={() => {
                  onSelect(option.id);
                }}
                className="border-koyi-border size-5 shrink-0"
              />
              {option.text}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
