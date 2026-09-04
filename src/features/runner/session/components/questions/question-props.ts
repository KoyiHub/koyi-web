import type { QuizRecording, QuizResponse } from '@/features/runner/session/fln-session-fixture';

/**
 * What every question renderer receives.
 *
 * The renderers are pure: they draw a question and report what the child did.
 * All session state — which question, what has been answered, what happens on
 * Next — lives in the page above them.
 */
export interface QuestionViewProps<TQuestion> {
  question: TQuestion;
  response: QuizResponse | undefined;
  /** `partId` is `MAIN_PART` unless the screen asks more than one thing. */
  onSelect: (partId: string, optionId: string) => void;
  onRecorded: (recording: QuizRecording) => void;
  onClearRecording: () => void;
}
