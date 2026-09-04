import { MicIcon, StopIcon } from '@/components/ui/icons';
import type { QuizRecording } from '@/features/runner/session/fln-session-fixture';
import { useRecorder } from '@/features/runner/session/hooks/use-recorder';
import { cn } from '@/lib/utils/cn';

/**
 * The one-button recorder for spoken answers.
 *
 * Idle it is a large violet microphone; pressing it asks for the microphone and
 * turns the same button into a red stop control with a live timer, exactly as
 * specified. Pressing it again saves the clip and offers playback.
 *
 * The captured clip is held in the session's response so the backend can
 * receive it when an upload endpoint is confirmed. Nothing is scored here.
 */

interface MicButtonProps {
  label: string;
  recording: QuizRecording | undefined;
  onRecorded: (recording: QuizRecording) => void;
  onClear: () => void;
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins)}:${String(secs).padStart(2, '0')}`;
}

export function MicButton({ label, recording, onRecorded, onClear }: MicButtonProps) {
  const recorder = useRecorder(onRecorded);
  const { isRecording, status, elapsedSeconds, message } = recorder;

  const busy = status === 'requesting';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (isRecording) {
            recorder.stop();
          } else {
            onClear();
            recorder.start();
          }
        }}
        aria-label={isRecording ? 'Stop recording' : label}
        className={cn(
          'relative flex size-20 items-center justify-center rounded-full text-white shadow-lg transition',
          'focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:cursor-wait disabled:opacity-70',
          isRecording
            ? 'bg-koyi-quiz-recording focus-visible:ring-koyi-quiz-recording/40 hover:brightness-95'
            : 'bg-koyi-quiz-accent hover:bg-koyi-quiz-accent-hover focus-visible:ring-koyi-quiz-accent/40',
        )}
      >
        {isRecording && (
          <span
            aria-hidden="true"
            className="bg-koyi-quiz-recording/30 absolute inset-0 animate-ping rounded-full motion-reduce:animate-none"
          />
        )}
        {isRecording ? <StopIcon className="relative size-8" /> : <MicIcon className="size-9" />}
      </button>

      <p
        aria-live="polite"
        className={cn(
          'text-sm font-semibold',
          isRecording ? 'text-koyi-quiz-recording' : 'text-koyi-muted',
        )}
      >
        {isRecording
          ? `Recording… ${formatElapsed(elapsedSeconds)} — tap to stop`
          : busy
            ? 'Waiting for microphone…'
            : label}
      </p>

      {message && (
        <p role="status" className="max-w-sm text-center text-sm text-amber-700">
          {message}
        </p>
      )}

      {recording && !isRecording && (
        <div className="flex flex-col items-center gap-2">
          <audio controls src={recording.url} className="h-9 max-w-full">
            <track kind="captions" />
          </audio>
          <button
            type="button"
            onClick={onClear}
            className="text-koyi-quiz-accent min-h-11 text-sm font-semibold underline underline-offset-4"
          >
            Record again
          </button>
        </div>
      )}
    </div>
  );
}
