/**
 * The Primary 4 FLN assessment session — 13 questions, one per delivered
 * design screen.
 *
 * PROVISIONAL: no assessment session API is confirmed yet, so this is a typed
 * local fixture. It is shaped as the response body the player expects, so
 * swapping it for a TanStack Query hook over the Django endpoint is a one-file
 * change and no screen is rewritten (CLAUDE.md, Backend/API readiness).
 *
 * SECURITY BOUNDARY: nothing here carries a correct answer, `is_correct`, a
 * mark, or scoring logic. Those stay server-side. The player only ever records
 * which option a child picked and, for spoken items, the audio clip.
 *
 * ARTWORK: every illustration is drawn inline as SVG (see
 * `components/illustrations`) so the flow is complete with no binary assets.
 * Each media block and image option also accepts an `imageUrl`; when the
 * backend or a designer supplies real artwork, setting that field is enough —
 * it wins over the drawn fallback and no component changes.
 */

/** Inline scene illustrations. Keys map to the scene registry. */
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

/** Inline object illustrations used inside answer tiles. */
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
  /** Drawn fallback artwork for image tiles. */
  art?: ObjectArtKey;
  /** Backend artwork. Wins over `art` when present. */
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
      art: SceneArtKey;
      imageUrl?: string;
      /** Caption printed inside the picture frame, as in the delivered screens. */
      caption?: string;
      /** `inset` draws the pale double frame; `plain` is a single soft card. */
      frame?: 'plain' | 'inset';
    };

/** A sentence shown to the child, with one word optionally picked out in red. */
export interface QuizSentence {
  text: string;
  /** Substring of `text` rendered in the highlight colour. */
  highlight?: string;
  /** `boxed` draws the bordered sentence card used on question 10. */
  variant?: 'plain' | 'boxed';
}

/** Text the Listen button speaks. Swap `audioUrl` in when the backend serves clips. */
export interface ListenPrompt {
  text: string;
  audioUrl?: string;
  label?: string;
}

interface QuestionBase {
  id: string;
  /** Section name shown above the progress bar. */
  section: string;
  subject: 'Literacy' | 'Numeracy';
  /** Backend `question_type`. Every item here is answered by choosing or speaking. */
  technicalType: 'single_choice' | 'audio';
  /** Workbook skill classification — provisional, not a closed enum. */
  pedagogicalType: string;
}

export interface ChoiceQuestion extends QuestionBase {
  layout: 'choice';
  media?: QuestionMedia;
  sentence?: QuizSentence;
  prompt: string;
  /** `accent` prints the prompt in Koyi blue, as on question 9. */
  promptTone?: 'default' | 'accent';
  /** Prompt sits above the media (questions 1, 2, 6) or below it. */
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
  media: QuestionMedia;
  /** The word or sentence the child reads aloud. */
  sentence: QuizSentence;
  instruction?: string;
  listen: ListenPrompt;
  /** Where the Listen control sits relative to the word. */
  listenPlacement: 'on-media' | 'below-word' | 'beside-mic';
  micLabel: string;
}

export interface ComparisonQuestion extends QuestionBase {
  layout: 'comparison';
  groupPrompt: string;
  groups: { id: string; label: string; count: number; art: ObjectArtKey }[];
  numberPrompt: string;
  numbers: { id: string; value: string }[];
}

export interface StoryQuestion extends QuestionBase {
  layout: 'story';
  storyTitle: string;
  storyBody: string;
  thumbnails: { id: string; art: SceneArtKey; imageUrl?: string; alt: string }[];
  hint: string;
  prompt: string;
  options: QuizOption[];
}

export interface PassageQuestion extends QuestionBase {
  layout: 'passage';
  media: QuestionMedia;
  passageTitle: string;
  passageBody: string[];
  prompt: string;
  options: QuizOption[];
}

export interface ReviewQuestion extends QuestionBase {
  layout: 'review';
  headline: string;
  subline: string;
  quoteLabel: string;
  quote: string;
  options: QuizOption[];
}

export type FlnQuestion =
  | ChoiceQuestion
  | SpokenQuestion
  | ComparisonQuestion
  | StoryQuestion
  | PassageQuestion
  | ReviewQuestion;

/** A captured spoken answer, held until the backend upload endpoint exists. */
export interface QuizRecording {
  /** Object URL for local playback. Revoked when the response is replaced. */
  url: string;
  mimeType: string;
  durationMs: number;
}

/**
 * One child's answers to one question.
 *
 * `selections` is keyed by part id because a single screen can ask two things
 * (question 5 asks which group has more *and* which number is greater).
 * Single-part questions use the key `'main'`.
 */
export interface QuizResponse {
  questionId: string;
  selections: Record<string, string>;
  /** Spoken items only — the clip the backend will receive and score. */
  recording?: QuizRecording | undefined;
}

/** The single part id used by every question that asks exactly one thing. */
export const MAIN_PART = 'main';

/** Part ids a question expects an answer for. Drives the Next button's enabled state. */
export function requiredPartIds(question: FlnQuestion): string[] {
  if (question.layout === 'comparison') {
    return ['group', 'number'];
  }
  if (question.layout === 'spoken') {
    return [];
  }
  return [MAIN_PART];
}

/**
 * The question at `index`, with the index clamped to the fixture.
 *
 * Lets the player treat the current question as always present. The throw is an
 * invariant, not a runtime path: the fixture below is never empty.
 */
export function questionAt(index: number): FlnQuestion {
  const clamped = Math.min(Math.max(index, 0), flnQuestions.length - 1);
  const question = flnQuestions[clamped];
  if (!question) {
    throw new Error('The FLN question fixture is empty.');
  }
  return question;
}

export function isAnswered(question: FlnQuestion, response: QuizResponse | undefined): boolean {
  if (question.layout === 'spoken') {
    return response?.recording !== undefined;
  }
  const selections = response?.selections ?? {};
  return requiredPartIds(question).every((partId) => selections[partId] !== undefined);
}

export const flnQuestions: FlnQuestion[] = [
  {
    id: 'KOYI-FLN-01',
    section: 'Visual Learning',
    subject: 'Numeracy',
    technicalType: 'single_choice',
    pedagogicalType: 'Counting objects',
    layout: 'choice',
    prompt: 'How many sticks are there?',
    promptPlacement: 'above-media',
    media: { kind: 'sticks', count: 5 },
    optionShape: 'tile',
    columns: 2,
    options: [
      { id: 'q1-a', label: '3' },
      { id: 'q1-b', label: '4' },
      { id: 'q1-c', label: '5' },
      { id: 'q1-d', label: '6' },
    ],
  },
  {
    id: 'KOYI-FLN-02',
    section: 'Visual Learning',
    subject: 'Numeracy',
    technicalType: 'single_choice',
    pedagogicalType: 'Place value',
    layout: 'choice',
    prompt: 'How many tens and ones are in 34?',
    promptPlacement: 'above-media',
    media: { kind: 'base-ten', tens: 3, ones: 4 },
    optionShape: 'list',
    options: [
      { id: 'q2-a', label: '3 tens + 4 ones' },
      { id: 'q2-b', label: '4 tens + 3 ones' },
    ],
  },
  {
    id: 'KOYI-FLN-03',
    section: 'Reading Assessment',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Letter sound',
    layout: 'choice',
    media: { kind: 'letter', upper: 'B', lower: 'b' },
    prompt: 'What sound does this letter make?',
    promptPlacement: 'below-media',
    listen: { text: 'Buh. B says buh.', label: 'Hear the letter sound' },
    optionShape: 'image-tile',
    columns: 4,
    options: [
      { id: 'q3-a', label: 'Ball', art: 'ball' },
      { id: 'q3-b', label: 'Apple', art: 'apple' },
      { id: 'q3-c', label: 'Dog', art: 'dog' },
      { id: 'q3-d', label: 'Cat', art: 'cat' },
    ],
  },
  {
    id: 'KOYI-FLN-04',
    section: 'Reading Learning',
    subject: 'Literacy',
    technicalType: 'audio',
    pedagogicalType: 'Word recognition',
    layout: 'spoken',
    media: { kind: 'scene', art: 'cat', frame: 'plain' },
    sentence: { text: 'CAT' },
    instruction: 'Tap the microphone and say: CAT',
    listen: { text: 'Cat', label: 'Listen' },
    listenPlacement: 'on-media',
    micLabel: 'Say the word',
  },
  {
    id: 'KOYI-FLN-05',
    section: 'Reading Assessment',
    subject: 'Numeracy',
    technicalType: 'single_choice',
    pedagogicalType: 'Comparing quantities',
    layout: 'comparison',
    groupPrompt: 'Which group has MORE?',
    groups: [
      { id: 'group-a', label: 'Group A', count: 3, art: 'apple' },
      { id: 'group-b', label: 'Group B', count: 5, art: 'apple' },
    ],
    numberPrompt: 'Which number is greater?',
    numbers: [
      { id: 'number-6', value: '6' },
      { id: 'number-9', value: '9' },
    ],
  },
  {
    id: 'KOYI-FLN-06',
    section: 'Number Recognition',
    subject: 'Numeracy',
    technicalType: 'single_choice',
    pedagogicalType: 'Number recognition',
    layout: 'choice',
    prompt: 'Which number is this?',
    promptPlacement: 'above-media',
    listen: { text: 'Seven', label: 'Listen' },
    media: { kind: 'number-badge', value: '7' },
    optionShape: 'tile',
    columns: 2,
    options: [
      { id: 'q6-a', label: 'FOUR' },
      { id: 'q6-b', label: 'NINE' },
      { id: 'q6-c', label: 'SEVEN' },
      { id: 'q6-d', label: 'ONE' },
    ],
  },
  {
    id: 'KOYI-FLN-07',
    section: 'Word Pronunciation',
    subject: 'Literacy',
    technicalType: 'audio',
    pedagogicalType: 'Word pronunciation',
    layout: 'spoken',
    heading: 'Listen and say the word',
    media: { kind: 'scene', art: 'sun', frame: 'inset', caption: 'SUN' },
    sentence: { text: 'SUN' },
    listen: { text: 'Sun', label: 'Listen' },
    listenPlacement: 'below-word',
    micLabel: 'Say the word',
  },
  {
    id: 'KOYI-FLN-08',
    section: 'Sentence Reading',
    subject: 'Literacy',
    technicalType: 'audio',
    pedagogicalType: 'Sentence reading',
    layout: 'spoken',
    media: { kind: 'scene', art: 'boy-red-ball', frame: 'plain' },
    sentence: { text: 'The boy has a red ball.', highlight: 'red' },
    instruction: 'Read the sentence aloud.',
    listen: { text: 'The boy has a red ball.', label: 'Listen' },
    listenPlacement: 'beside-mic',
    micLabel: 'Read Aloud',
  },
  {
    id: 'KOYI-FLN-09',
    section: 'Picture + Sentence Reading',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Picture comprehension',
    layout: 'choice',
    media: { kind: 'scene', art: 'classroom-apple', frame: 'inset' },
    sentence: { text: 'Ada is eating an apple.' },
    prompt: 'What is Ada eating?',
    promptTone: 'accent',
    promptPlacement: 'below-media',
    optionShape: 'image-tile',
    columns: 4,
    options: [
      { id: 'q9-a', label: 'Banana', art: 'banana' },
      { id: 'q9-b', label: 'Mango', art: 'mango' },
      { id: 'q9-c', label: 'Apple', art: 'apple' },
      { id: 'q9-d', label: 'Orange', art: 'orange' },
    ],
  },
  {
    id: 'KOYI-FLN-10',
    section: 'Simple Sentence',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Sentence comprehension',
    layout: 'choice',
    media: { kind: 'scene', art: 'boy-blue-bag', frame: 'plain' },
    sentence: { text: 'Tunde has a blue bag.', variant: 'boxed' },
    prompt: "What color is Tunde's bag?",
    promptPlacement: 'below-media',
    optionShape: 'tile',
    columns: 2,
    options: [
      { id: 'q10-a', label: 'Red' },
      { id: 'q10-b', label: 'Green' },
      { id: 'q10-c', label: 'Blue' },
      { id: 'q10-d', label: 'Yellow' },
    ],
  },
  {
    id: 'KOYI-FLN-11',
    section: 'Simple Sentence',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Short story comprehension',
    layout: 'story',
    storyTitle: 'Short Story',
    storyBody:
      '"Amaka woke up early. She put on her school uniform. Then she walked to school with her brother."',
    thumbnails: [
      { id: 'thumb-1', art: 'bedroom-wake', alt: 'Amaka waking up early in her bedroom' },
      { id: 'thumb-2', art: 'classroom-uniform', alt: 'Amaka wearing her school uniform' },
      { id: 'thumb-3', art: 'road-to-school', alt: 'Amaka and her brother walking to school' },
    ],
    hint: 'Read the story carefully and look at the pictures to help you answer the question below!',
    prompt: 'Where did Amaka go?',
    options: [
      { id: 'q11-a', label: 'Market' },
      { id: 'q11-b', label: 'School' },
      { id: 'q11-c', label: 'Park' },
      { id: 'q11-d', label: 'Farm' },
    ],
  },
  {
    id: 'KOYI-FLN-12',
    section: 'Find the Details',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Passage question',
    layout: 'passage',
    media: {
      kind: 'scene',
      art: 'farm',
      frame: 'inset',
      caption: 'Comprehension: Find the Detail',
    },
    passageTitle: 'A Day at the Farm',
    passageBody: [
      'On Saturday, Tom went to visit his uncle’s farm. The sun was shining brightly in the sky. He saw many animals during his visit. First, he saw a big brown cow chewing grass near the fence.',
      'Then, he walked over to the barn. His uncle gave him a small bucket of seeds. Tom carefully threw the seeds on the ground, and soon, five happy chickens ran over to eat them.',
      'He also saw a goat eating leaves, and some small fish in the pond. Tom had a wonderful day helping out on the farm.',
    ],
    prompt: 'What did the child feed?',
    options: [
      { id: 'q12-a', label: 'Cow', art: 'cow' },
      { id: 'q12-b', label: 'Chickens', art: 'chicken' },
      { id: 'q12-c', label: 'Goat', art: 'goat' },
      { id: 'q12-d', label: 'Fish', art: 'fish' },
    ],
  },
  {
    id: 'KOYI-FLN-13',
    section: 'Find the Details',
    subject: 'Literacy',
    technicalType: 'single_choice',
    pedagogicalType: 'Inference',
    layout: 'review',
    headline: "Great Job! Let's review the final question.",
    subline: "You've reached the end of the Primary 4 Inference section.",
    quoteLabel: 'Read the story',
    quote:
      '"David looked outside and saw dark clouds. He picked up his umbrella before leaving the house."',
    options: [
      { id: 'q13-a', label: 'He wanted to play' },
      { id: 'q13-b', label: 'It was likely going to rain' },
    ],
  },
];
