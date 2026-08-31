import type { QuizSentence } from '@/features/assessment/data/fln-session-fixture';
import { cn } from '@/lib/utils/cn';

/**
 * The sentence or word a child reads. One word can be picked out in red — the
 * target word the item is really testing, as on question 8's "red ball".
 *
 * The highlight is a colour change only, so the sentence still reads as one
 * continuous string to a screen reader.
 */

export function QuestionSentence({
  sentence,
  className,
}: {
  sentence: QuizSentence;
  className?: string;
}) {
  const { text, highlight, variant = 'plain' } = sentence;
  const index = highlight ? text.indexOf(highlight) : -1;

  const body =
    index >= 0 && highlight ? (
      <>
        {text.slice(0, index)}
        <span className="text-red-600">{highlight}</span>
        {text.slice(index + highlight.length)}
      </>
    ) : (
      text
    );

  return (
    <p
      className={cn(
        'font-display text-koyi-text text-center font-bold',
        variant === 'boxed' && 'border-koyi-border rounded-2xl border-2 bg-white px-6 py-5',
        className,
      )}
    >
      {body}
    </p>
  );
}
