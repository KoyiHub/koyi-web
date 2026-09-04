import { SceneArt } from '@/features/runner/session/components/illustrations/scene-art';
import { QuestionOptions } from '@/features/runner/session/components/question-options';
import type { QuestionViewProps } from '@/features/runner/session/components/questions/question-props';
import type { StoryQuestion } from '@/features/runner/session/question-types';
import { MAIN_PART } from '@/features/runner/session/question-types';

/**
 * The short-story screen: a passage, a few pictures that retell it in order,
 * then the question — `passage_comprehension_choice` when the content is
 * short and carries more than one image (`map-question.ts`).
 *
 * The thumbnails are an ordered list because the sequence is part of the
 * story — first she wakes, then she dresses, then she walks to school.
 */
export function StoryQuestionView({
  question,
  response,
  onSelect,
}: QuestionViewProps<StoryQuestion>) {
  return (
    <div className="flex flex-col gap-6">
      <section className="border-koyi-border rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-koyi-text text-xl font-bold">{question.storyTitle}</h2>
        <p className="text-koyi-text mt-3 text-lg leading-relaxed">{question.storyBody}</p>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {question.thumbnails.map((thumbnail, index) => (
            <li key={thumbnail.id} className="flex flex-col gap-2">
              <div className="bg-koyi-quiz-tile aspect-[16/10] overflow-hidden rounded-xl">
                {thumbnail.imageUrl ? (
                  <img
                    src={thumbnail.imageUrl}
                    alt={thumbnail.alt}
                    className="size-full object-cover"
                  />
                ) : (
                  thumbnail.art && (
                    <div role="img" aria-label={thumbnail.alt} className="size-full">
                      <SceneArt art={thumbnail.art} />
                    </div>
                  )
                )}
              </div>
              <p className="text-koyi-muted text-sm font-semibold">
                {index + 1}. {thumbnail.alt}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <h3 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
        {question.prompt}
      </h3>

      <QuestionOptions
        name={`${question.id}-${MAIN_PART}`}
        legend={question.prompt}
        options={question.options}
        shape="tile"
        columns={2}
        value={response?.selections[MAIN_PART]}
        onChange={(optionId) => {
          onSelect(MAIN_PART, optionId);
        }}
        className="mx-auto w-full max-w-2xl"
      />
    </div>
  );
}
