/**
 * The player's own question vocabulary — what every renderer under
 * `components/questions/*` actually consumes.
 *
 * This used to live inside `fln-session-fixture.ts` alongside 13 hardcoded
 * questions. Phase 2 wires the player to the real `/v1/student/assessment/*`
 * endpoints (`frontend-integration.md` §6), so the fixture is gone —
 * `session/api/map-question.ts` builds these shapes from what the server
 * actually sends. The types stay because the renderers' visual structure is
 * still the reuse target; only where the data comes from changed.
 *
 * SECURITY BOUNDARY: nothing here carries a correct answer, `is_correct`, a
 * mark, or scoring logic. Those stay server-side. The player only ever
 * records which option a child picked and, for spoken items, the audio clip.
 */

/** Inline scene illustrations. Decorative fallback for a media block with no `imageUrl`. */
export type SceneArtKey =
  | 'cat'
  | 'sun'
  | 'boy-red-ball'
  | 'classroom-apple'
  | 'boy-blue-bag'
  | 'farm'
  | 'bedroom-wake'
  | 'classroom-uniform'
  | 'road-to-school';

/** Inline object illustrations used inside answer tiles. Decorative fallback only. */
export type ObjectArtKey =
  | 'ball'
  | 'apple'
  | 'dog'
  | 'cat'
  | 'banana'
  | 'mango'
  | 'orange'
  | 'cow'
  | 'chicken'
  | 'goat'
  | 'fish';

export interface QuizOption {
  id: string;
  label: string;
  /** Drawn fallback artwork for image tiles. Real questions never set this — see `art`'s note. */
  art?: ObjectArtKey;
  /** The option's real media, when the server sent one. Wins over `art`. */
  imageUrl?: string;
}

/** How a question's answers are laid out. */
export type OptionShape =
  /** Soft filled tiles in a grid — short text or numbers. */
  | 'tile'
  /** Full-width stacked rows with a radio marker on the right. */
  | 'list'
  /** Picture-first tiles, caption optional. */
  | 'image-tile';

export type QuestionMedia =
  | { kind: 'sticks'; count: number; imageUrl?: string }
  | { kind: 'base-ten'; tens: number; ones: number; imageUrl?: string }
  | { kind: 'letter'; upper: string; lower: string }
  | { kind: 'number-badge'; value: string }
  | {
      kind: 'scene';
      art?: SceneArtKey;
      imageUrl?: string;
      /** Caption printed inside the picture frame. */
      caption?: string;
      /** `inset` draws the pale double frame; `plain` is a single soft card. */
      frame?: 'plain' | 'inset';
    };

/** A sentence shown to the child, with one word optionally picked out in red. */
export interface QuizSentence {
  text: string;
  /** Substring of `text` rendered in the highlight colour. */
  highlight?: string;
  /** `boxed` draws the bordered sentence card. */
  variant?: 'plain' | 'boxed';
}

/** Text the Listen button speaks, or plays if the server sent a real clip. */
export interface ListenPrompt {
  text: string;
  audioUrl?: string;
  label?: string;
}

interface QuestionBase {
  id: string;
  /** The section's name, shown above the progress bar — never a per-question label (§9: no grade framing). */
  section: string;
  subject: 'Literacy' | 'Numeracy';
  /** The subskill this item probes, e.g. "Letter sounds". */
  subskillName: string;
}

export interface ChoiceQuestion extends QuestionBase {
  layout: 'choice';
  media?: QuestionMedia | undefined;
  sentence?: QuizSentence;
  prompt: string;
  /** `accent` prints the prompt in Koyi blue. */
  promptTone?: 'default' | 'accent';
  /** Prompt sits above the media or below it. */
  promptPlacement?: 'above-media' | 'below-media';
  listen?: ListenPrompt;
  optionShape: OptionShape;
  options: QuizOption[];
  /** Grid columns at desktop width. Defaults to 2. */
  columns?: 2 | 3 | 4;
}

export interface SpokenQuestion extends QuestionBase {
  layout: 'spoken';
  heading?: string;
  media?: QuestionMedia | undefined;
  /** The word or sentence the child reads aloud. */
  sentence: QuizSentence;
  instruction?: string;
  listen: ListenPrompt;
  /** Where the Listen control sits relative to the word. */
  listenPlacement: 'on-media' | 'below-word' | 'beside-mic';
  micLabel: string;
}

/**
 * A single prompt with 2–3 rich options, compared side by side.
 *
 * `comparison_panel_choice` sends **one** option set (2–3 options, each
 * optionally carrying its own media) — not two independent choices. The
 * task is seeing everything at once, so this never stacks, at any width.
 */
export interface ComparisonQuestion extends QuestionBase {
  layout: 'comparison';
  prompt: string;
  options: QuizOption[];
}

export interface StoryQuestion extends QuestionBase {
  layout: 'story';
  storyTitle: string;
  storyBody: string;
  thumbnails: { id: string; art?: SceneArtKey; imageUrl?: string; alt: string }[];
  prompt: string;
  options: QuizOption[];
}

export interface PassageQuestion extends QuestionBase {
  layout: 'passage';
  media?: QuestionMedia | undefined;
  passageTitle: string;
  passageBody: string[];
  prompt: string;
  options: QuizOption[];
}

export type FlnQuestion =
  ChoiceQuestion | SpokenQuestion | ComparisonQuestion | StoryQuestion | PassageQuestion;

/** A captured spoken answer, held until the recording-upload endpoint exists. */
export interface QuizRecording {
  /** Object URL for local playback. Revoked when the response is replaced. */
  url: string;
  mimeType: string;
  durationMs: number;
}

/**
 * One child's answer to one question.
 *
 * `selections` is keyed by option id -> selected, so a `multiple_choice`
 * question can hold more than one. Single-choice questions hold exactly one
 * key under `MAIN_PART`.
 */
export interface QuizResponse {
  questionId: string;
  selections: Record<string, string>;
  /** Spoken items only — the clip the backend will receive once upload exists. */
  recording?: QuizRecording | undefined;
}

/** The single part id every question in the real contract asks for. */
export const MAIN_PART = 'main';

export function isAnswered(question: FlnQuestion, response: QuizResponse | undefined): boolean {
  if (question.layout === 'spoken') {
    return response?.recording !== undefined;
  }
  return response?.selections[MAIN_PART] !== undefined;
}
