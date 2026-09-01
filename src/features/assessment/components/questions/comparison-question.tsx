import { ObjectArt } from '@/features/assessment/components/illustrations/object-art';
import { QuestionOptions } from '@/features/assessment/components/question-options';
import type { QuestionViewProps } from '@/features/assessment/components/questions/question-props';
import type { ComparisonQuestion } from '@/features/assessment/data/fln-session-fixture';
import { cn } from '@/lib/utils/cn';

/**
 * The only screen that asks two things at once: which group has more, and
 * which number is greater. Each half is its own radio group and its own part
 * in the response, so Next stays disabled until both are answered.
 */
export function ComparisonQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<ComparisonQuestion>) {
  const groupValue = response?.selections.group;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <h2 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
          {question.groupPrompt}
        </h2>

        <fieldset className="mx-auto w-full max-w-3xl">
          <legend className="sr-only">{question.groupPrompt}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {question.groups.map((group) => (
              <label key={group.id} className="relative flex">
                {/* The drawn objects are decorative, so the count has to be
                    spoken here or the two choices sound identical. */}
                <input
                  type="radio"
                  name={`${question.id}-group`}
                  value={group.id}
                  checked={groupValue === group.id}
                  onChange={() => {
                    onSelect('group', group.id);
                  }}
                  aria-label={`${group.label} — ${String(group.count)} ${group.art}s`}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'bg-koyi-quiz-tile flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-transparent px-5 py-6 transition',
                    'hover:border-koyi-quiz-accent/40',
                    'peer-checked:border-koyi-quiz-accent peer-checked:bg-koyi-quiz-hint peer-checked:shadow-sm',
                    'peer-focus-visible:ring-koyi-quiz-accent peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                  )}
                >
                  <span className="font-display text-koyi-text text-lg font-bold">
                    {group.label}
                  </span>
                  <span
                    className="flex flex-wrap items-center justify-center gap-2"
                    aria-hidden="true"
                  >
                    {Array.from({ length: group.count }, (_, index) => (
                      <ObjectArt key={index} art={group.art} className="size-12 sm:size-14" />
                    ))}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <hr className="border-koyi-border mx-auto w-full max-w-3xl" />

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
          {question.numberPrompt}
        </h2>

        <QuestionOptions
          name={`${question.id}-number`}
          legend={question.numberPrompt}
          options={question.numbers.map((number) => ({ id: number.id, label: number.value }))}
          shape="tile"
          columns={2}
          value={response?.selections.number}
          onChange={(optionId) => {
            onSelect('number', optionId);
          }}
          className="mx-auto w-full max-w-md"
        />
      </section>
    </div>
  );
}
