import { ObjectArt } from '@/features/runner/session/components/illustrations/object-art';
import type { QuestionViewProps } from '@/features/runner/session/components/questions/question-props';
import type { ComparisonQuestion } from '@/features/runner/session/question-types';
import { MAIN_PART } from '@/features/runner/session/question-types';
import { cn } from '@/lib/utils/cn';

/**
 * One prompt, 2–3 rich options compared side by side — `comparison_panel_choice`.
 *
 * Deliberately never stacks, at any width: "Which group has MORE?" *is* the
 * task of seeing everything at once, so panels shrink instead of wrapping to
 * one column on a phone.
 */
export function ComparisonQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<ComparisonQuestion>) {
  const value = response?.selections[MAIN_PART];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
        {question.prompt}
      </h2>

      <fieldset className="mx-auto w-full max-w-3xl">
        <legend className="sr-only">{question.prompt}</legend>
        <div
          className={cn(
            'grid gap-3 sm:gap-4',
            question.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
          )}
        >
          {question.options.map((option) => (
            <label key={option.id} className="relative flex min-w-0">
              <input
                type="radio"
                name={`${question.id}-${MAIN_PART}`}
                value={option.id}
                checked={value === option.id}
                onChange={() => {
                  onSelect(MAIN_PART, option.id);
                }}
                aria-label={option.label}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'bg-koyi-quiz-tile flex w-full min-w-0 cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-5 transition sm:px-5 sm:py-6',
                  'hover:border-koyi-quiz-accent/40',
                  'peer-checked:border-koyi-quiz-accent peer-checked:bg-koyi-quiz-hint peer-checked:shadow-sm',
                  'peer-focus-visible:ring-koyi-quiz-accent peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                )}
              >
                <span className="flex size-14 items-center justify-center sm:size-20">
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt="" className="size-full object-contain" />
                  ) : (
                    option.art && <ObjectArt art={option.art} className="size-full" />
                  )}
                </span>
                <span className="font-display text-koyi-text text-center text-base font-bold sm:text-lg">
                  {option.label}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
