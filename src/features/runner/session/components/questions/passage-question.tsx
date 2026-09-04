import { QuestionMediaBlock } from '@/features/runner/session/components/question-media';
import { QuestionOptions } from '@/features/runner/session/components/question-options';
import type { QuestionViewProps } from '@/features/runner/session/components/questions/question-props';
import type { PassageQuestion } from '@/features/runner/session/fln-session-fixture';
import { MAIN_PART } from '@/features/runner/session/fln-session-fixture';

/**
 * The reading-passage screen. Two columns on desktop — the story stays on
 * screen beside the question so the child can look back at it while choosing —
 * and stacks to one column below 1024px, story first.
 */
export function PassageQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<PassageQuestion>) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
      <section className="border-koyi-border rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <QuestionMediaBlock media={question.media} />

        <h2 className="font-display text-koyi-text mt-5 text-xl font-bold">
          {question.passageTitle}
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {question.passageBody.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="text-koyi-text leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-koyi-border rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-display text-koyi-text text-xl font-bold sm:text-2xl">
          {question.prompt}
        </h3>

        <QuestionOptions
          name={`${question.id}-${MAIN_PART}`}
          legend={question.prompt}
          options={question.options}
          shape="image-tile"
          columns={2}
          value={response?.selections[MAIN_PART]}
          onChange={(optionId) => {
            onSelect(MAIN_PART, optionId);
          }}
          className="mt-5"
        />
      </section>
    </div>
  );
}
