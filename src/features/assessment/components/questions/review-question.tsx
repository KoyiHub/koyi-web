import { CheckCircleIcon } from '@/components/ui/icons';
import { QuestionOptions } from '@/features/assessment/components/question-options';
import type { QuestionViewProps } from '@/features/assessment/components/questions/question-props';
import type { ReviewQuestion } from '@/features/assessment/data/fln-session-fixture';
import { MAIN_PART } from '@/features/assessment/data/fln-session-fixture';

/**
 * The last question. It opens with encouragement rather than a picture — the
 * child has reached the end — then gives the short story to read and the
 * inference to draw from it.
 *
 * The badge and headline are praise for finishing, not a result. No score is
 * shown here or anywhere in the player; marking is the backend's job.
 */
export function ReviewQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<ReviewQuestion>) {
  return (
    <div className="border-koyi-border mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-emerald-50">
          <CheckCircleIcon className="size-8 text-emerald-600" />
        </span>
        <h2 className="font-display text-koyi-text text-2xl font-bold sm:text-3xl">
          {question.headline}
        </h2>
        <p className="text-koyi-muted">{question.subline}</p>
      </div>

      <figure className="bg-koyi-quiz-tile border-koyi-quiz-accent mt-7 rounded-2xl border-l-4 p-5">
        <figcaption className="text-koyi-muted text-xs font-bold tracking-widest uppercase">
          {question.quoteLabel}
        </figcaption>
        <blockquote className="text-koyi-text mt-2 text-lg leading-relaxed">
          {question.quote}
        </blockquote>
      </figure>

      <h3 className="text-koyi-text mt-6 text-base font-semibold">Choose the best answer</h3>

      <QuestionOptions
        name={`${question.id}-${MAIN_PART}`}
        legend="Choose the best answer"
        options={question.options}
        shape="list"
        value={response?.selections[MAIN_PART]}
        onChange={(optionId) => {
          onSelect(MAIN_PART, optionId);
        }}
        className="mt-4"
      />
    </div>
  );
}
