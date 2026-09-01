import { ObjectArt } from '@/features/assessment/components/illustrations/object-art';
import type { OptionShape, QuizOption } from '@/features/assessment/data/fln-session-fixture';
import { cn } from '@/lib/utils/cn';

/**
 * The answer choices, in the three shapes the delivered screens use.
 *
 * Built on native radio inputs rather than clickable divs: arrow keys move
 * within the group, space selects, and screen readers announce "3 of 4"
 * without any ARIA bookkeeping. The visible tile is styled from the input's
 * `peer` state, so what is on screen can never disagree with what is checked.
 */

interface QuestionOptionsProps {
  /** Radio group name — unique per question part. */
  name: string;
  /** Names the group for assistive technology; usually the question prompt. */
  legend: string;
  options: QuizOption[];
  shape: OptionShape;
  columns?: 2 | 3 | 4 | undefined;
  value: string | undefined;
  onChange: (optionId: string) => void;
  className?: string;
}

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

/** Shared focus and selection treatment for every shape. */
const SURFACE =
  'cursor-pointer border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-koyi-quiz-accent peer-focus-visible:ring-offset-2';
const UNSELECTED = 'border-transparent bg-koyi-quiz-tile hover:border-koyi-quiz-accent/40';
const SELECTED =
  'peer-checked:border-koyi-quiz-accent peer-checked:bg-koyi-quiz-hint peer-checked:shadow-sm';

export function QuestionOptions({
  name,
  legend,
  options,
  shape,
  columns = 2,
  value,
  onChange,
  className,
}: QuestionOptionsProps) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="sr-only">{legend}</legend>

      <div
        className={cn(
          shape === 'list' ? 'flex flex-col gap-3' : 'grid gap-3 sm:gap-4',
          shape !== 'list' && COLUMN_CLASSES[columns],
        )}
      >
        {options.map((option) => (
          <label key={option.id} className="relative flex min-w-0">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => {
                onChange(option.id);
              }}
              className="peer sr-only"
            />

            {shape === 'tile' && (
              <span
                className={cn(
                  SURFACE,
                  UNSELECTED,
                  SELECTED,
                  'flex min-h-16 w-full items-center justify-center rounded-2xl px-4 py-4',
                  'font-display text-koyi-text text-2xl font-bold',
                )}
              >
                {option.label}
              </span>
            )}

            {shape === 'list' && (
              <span
                className={cn(
                  SURFACE,
                  UNSELECTED,
                  SELECTED,
                  'flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl px-5 py-4',
                  'text-koyi-text text-lg font-semibold',
                )}
              >
                <span className="min-w-0">{option.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border-2 transition',
                    value === option.id
                      ? 'border-koyi-quiz-accent bg-koyi-quiz-accent'
                      : 'border-koyi-border bg-white',
                  )}
                >
                  <span className="size-2 rounded-full bg-white" />
                </span>
              </span>
            )}

            {shape === 'image-tile' && (
              <span
                className={cn(
                  SURFACE,
                  UNSELECTED,
                  SELECTED,
                  'flex w-full flex-col items-center gap-3 rounded-2xl px-4 py-5',
                )}
              >
                <span className="flex size-16 items-center justify-center sm:size-20">
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt="" className="size-full object-contain" />
                  ) : option.art ? (
                    <ObjectArt art={option.art} />
                  ) : null}
                </span>
                <span className="text-koyi-text text-center text-base font-semibold">
                  {option.label}
                </span>
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
