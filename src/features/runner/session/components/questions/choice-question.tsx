import { ListenButton } from '@/features/runner/session/components/listen-button';
import { QuestionMediaBlock } from '@/features/runner/session/components/question-media';
import { QuestionOptions } from '@/features/runner/session/components/question-options';
import { QuestionSentence } from '@/features/runner/session/components/question-sentence';
import type { QuestionViewProps } from '@/features/runner/session/components/questions/question-props';
import type { ChoiceQuestion } from '@/features/runner/session/question-types';
import { MAIN_PART } from '@/features/runner/session/question-types';
import { cn } from '@/lib/utils/cn';

/**
 * The default question shape: optional picture, an optional sentence, a
 * prompt, and one set of answers. Covers the counting, place-value, letter
 * sound, number recognition and comprehension screens.
 *
 * The only variation between them is whether the prompt sits above or below
 * the picture, which the fixture states outright rather than the component
 * guessing from the media kind.
 */
export function ChoiceQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<ChoiceQuestion>) {
  const promptAbove = (question.promptPlacement ?? 'above-media') === 'above-media';

  const prompt = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <h2
        className={cn(
          'font-display text-center text-2xl font-bold sm:text-3xl',
          question.promptTone === 'accent' ? 'text-koyi-primary' : 'text-koyi-text',
        )}
      >
        {question.prompt}
      </h2>
      {question.listen && <ListenButton prompt={question.listen} />}
    </div>
  );

  return (
    <div className="flex flex-col gap-7">
      {promptAbove && prompt}

      {question.media && (
        <QuestionMediaBlock media={question.media} className="mx-auto w-full max-w-xl" />
      )}

      {question.sentence && (
        <QuestionSentence
          sentence={question.sentence}
          className="mx-auto w-full max-w-xl text-2xl sm:text-3xl"
        />
      )}

      {!promptAbove && prompt}

      <QuestionOptions
        name={`${question.id}-${MAIN_PART}`}
        legend={question.prompt}
        options={question.options}
        shape={question.optionShape}
        columns={question.columns}
        value={response?.selections[MAIN_PART]}
        onChange={(optionId) => {
          onSelect(MAIN_PART, optionId);
        }}
        className="mx-auto w-full max-w-2xl"
      />
    </div>
  );
}
