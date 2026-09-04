import { SpeakerIcon } from '@/components/ui/icons';
import { useSpeech } from '@/features/runner/session/hooks/use-speech';
import type { ListenPrompt } from '@/features/runner/session/question-types';
import { cn } from '@/lib/utils/cn';

/**
 * The Listen control. Speaks the question's prompt aloud so a child who cannot
 * yet decode the word still gets the item read to them.
 *
 * `pill` is the standalone control that sits beside a prompt or under a word;
 * `chip` is the compact version that floats on top of a picture card.
 *
 * Each button owns its own speech instance, so moving between questions or
 * pressing a second Listen cancels the first — two voices never overlap.
 */

interface ListenButtonProps {
  prompt: ListenPrompt;
  variant?: 'pill' | 'chip';
  className?: string;
}

export function ListenButton({ prompt, variant = 'pill', className }: ListenButtonProps) {
  const { speak, stop, isPlaying } = useSpeech();
  const label = prompt.label ?? 'Listen';

  return (
    <button
      type="button"
      onClick={() => {
        if (isPlaying) {
          stop();
        } else {
          speak(prompt);
        }
      }}
      aria-label={isPlaying ? `Stop ${label.toLowerCase()}` : label}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full font-semibold transition',
        'focus-visible:ring-koyi-quiz-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        variant === 'pill' &&
          'bg-koyi-quiz-hint text-koyi-quiz-accent hover:bg-koyi-quiz-track px-5 py-2.5 text-sm',
        variant === 'chip' &&
          'text-koyi-quiz-accent bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200 hover:bg-slate-50',
        className,
      )}
    >
      <SpeakerIcon className={cn('size-5 shrink-0', isPlaying && 'animate-pulse')} />
      <span>{label}</span>
    </button>
  );
}
