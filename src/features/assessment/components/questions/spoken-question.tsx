import { ListenButton } from '@/features/assessment/components/listen-button';
import { MicButton } from '@/features/assessment/components/mic-button';
import { QuestionMediaBlock } from '@/features/assessment/components/question-media';
import { QuestionSentence } from '@/features/assessment/components/question-sentence';
import type { QuestionViewProps } from '@/features/assessment/components/questions/question-props';
import type { SpokenQuestion } from '@/features/assessment/data/fln-session-fixture';

/**
 * Questions the child answers with their voice: word recognition,
 * pronunciation and sentence reading.
 *
 * The child hears the word (Listen), then says it (microphone). Where the
 * Listen control sits differs per screen — on the picture, under the word, or
 * beside the microphone — so the fixture names the placement.
 */
export function SpokenQuestionView({
  question,
  response,
  onRecorded,
  onClearRecording,
}: QuestionViewProps<SpokenQuestion>) {
  const listen = <ListenButton prompt={question.listen} />;

  return (
    <div className="flex flex-col items-center gap-6">
      {question.heading && (
        <h2 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
          {question.heading}
        </h2>
      )}

      <QuestionMediaBlock
        media={question.media}
        overlay={
          question.listenPlacement === 'on-media' ? (
            <ListenButton prompt={question.listen} variant="chip" />
          ) : undefined
        }
        className="w-full max-w-xl"
      />

      <QuestionSentence
        sentence={question.sentence}
        className="w-full max-w-xl text-3xl tracking-wide sm:text-4xl"
      />

      {question.listenPlacement === 'below-word' && listen}

      {question.instruction && (
        <p className="text-koyi-muted text-center text-base sm:text-lg">{question.instruction}</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-6">
        {question.listenPlacement === 'beside-mic' && listen}
        <MicButton
          label={question.micLabel}
          recording={response?.recording}
          onRecorded={onRecorded}
          onClear={onClearRecording}
        />
      </div>
    </div>
  );
}
