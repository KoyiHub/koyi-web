/**
 * PROVISIONAL question bank seed.
 *
 * Every entry mirrors the `AssessmentQuestion` model the backend team supplied:
 * a prompt made of ordered `contents` blocks (text / image / audio / video),
 * a `question_type`, an optional `layout`, and `options` where the type is
 * option-based.
 *
 * SECURITY BOUNDARY: no `is_correct` flag and no answer value appears anywhere
 * in this file. The bank is a library of prompts, not an answer key — a child
 * uses the student app in the same browser.
 *
 * Media is synthesised at module load as data URIs so the mock has real,
 * self-contained images and audio rather than dead URLs. Nothing here ships to
 * production; the real API will return media-library URLs.
 */

import type {
  AssessmentQuestion,
  QuestionContent,
  QuestionLayout,
  QuestionOption,
  QuestionType,
} from '@/features/teacher/api/shared.schema';

/**
 * LEGACY bank-question shape, kept local now that
 * `@/features/teacher/bank/api/bank.schema` answers the real contract instead
 * (`frontend-integration.md` §5.2). This file only still exists to feed
 * `teacher-assessment-seed.ts` and `teacher-student-seed.ts`'s question-log
 * demo data — see the note at the top of `teacher-assessment-seed.ts`.
 */
interface BankQuestion extends Omit<AssessmentQuestion, 'order'> {
  reference: string;
  skill: string;
  difficulty: 'foundation' | 'core' | 'stretch';
  status: 'production_ready' | 'needs_review' | 'retired';
  usage_count: number;
  updated_label: string;
}

/* -------------------------------------------------------------------------- */
/* Synthetic media                                                            */
/* -------------------------------------------------------------------------- */

const TONES = ['#1D6AE5', '#0F9D58', '#E8710A', '#7B4FD8', '#C2185B', '#00838F'] as const;

/** A labelled tile, as a self-contained SVG data URI. Stands in for a picture card. */
function imageAsset(id: string, label: string, index: number) {
  const tone = TONES[index % TONES.length] as string;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" rx="14" fill="${tone}" fill-opacity="0.12"/><rect x="6" y="6" width="228" height="168" rx="10" fill="none" stroke="${tone}" stroke-opacity="0.35" stroke-width="2"/><text x="120" y="98" font-family="Segoe UI, sans-serif" font-size="30" font-weight="600" fill="${tone}" text-anchor="middle">${label}</text></svg>`;

  return {
    id,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    type: 'image' as const,
    file_name: `${id}.svg`,
    duration_seconds: null,
  };
}

/** One short silent clip, shared by every audio asset so the seed stays small. */
function buildSilentClip(seconds: number): string {
  const sampleRate = 8000;
  const samples = sampleRate * seconds;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      bytes[offset + index] = value.charCodeAt(index);
    }
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  writeText(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeText(36, 'data');
  view.setUint32(40, samples, true);
  bytes.fill(128, 44);

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}

const SILENT_CLIP = buildSilentClip(3);

function audioAsset(id: string, fileName: string, duration: number) {
  return {
    id,
    url: SILENT_CLIP,
    type: 'audio' as const,
    file_name: fileName,
    duration_seconds: duration,
  };
}

function videoAsset(id: string, fileName: string, duration: number, label: string, index: number) {
  return {
    id,
    // Poster-only in the mock: the builder renders a thumbnail, not a player.
    url: imageAsset(`${id}-poster`, label, index).url,
    type: 'video' as const,
    file_name: fileName,
    duration_seconds: duration,
  };
}

/* -------------------------------------------------------------------------- */
/* Content and option builders                                                */
/* -------------------------------------------------------------------------- */

let contentSeq = 0;
let optionSeq = 0;

function textBlock(order: number, text: string): QuestionContent {
  contentSeq += 1;
  return {
    id: `qc-${String(contentSeq).padStart(4, '0')}`,
    display_order: order,
    type: 'text',
    text_content: text,
    media: null,
    alt_text: null,
    caption: null,
  };
}

function imageBlock(
  order: number,
  label: string,
  altText: string,
  caption?: string,
): QuestionContent {
  contentSeq += 1;
  const id = `qc-${String(contentSeq).padStart(4, '0')}`;
  return {
    id,
    display_order: order,
    type: 'image',
    text_content: null,
    media: imageAsset(`med-${id}`, label, contentSeq),
    alt_text: altText,
    caption: caption ?? null,
  };
}

function audioBlock(
  order: number,
  fileName: string,
  duration: number,
  caption: string,
): QuestionContent {
  contentSeq += 1;
  const id = `qc-${String(contentSeq).padStart(4, '0')}`;
  return {
    id,
    display_order: order,
    type: 'audio',
    text_content: null,
    media: audioAsset(`med-${id}`, fileName, duration),
    alt_text: null,
    caption,
  };
}

function videoBlock(
  order: number,
  fileName: string,
  duration: number,
  caption: string,
): QuestionContent {
  contentSeq += 1;
  const id = `qc-${String(contentSeq).padStart(4, '0')}`;
  return {
    id,
    display_order: order,
    type: 'video',
    text_content: null,
    media: videoAsset(`med-${id}`, fileName, duration, '▶', contentSeq),
    alt_text: null,
    caption,
  };
}

function textOptions(values: string[]): QuestionOption[] {
  return values.map((value) => {
    optionSeq += 1;
    return {
      id: `qo-${String(optionSeq).padStart(4, '0')}`,
      value,
      type: 'text' as const,
      media: null,
    };
  });
}

function imageOptions(values: string[]): QuestionOption[] {
  return values.map((value) => {
    optionSeq += 1;
    const id = `qo-${String(optionSeq).padStart(4, '0')}`;
    return {
      id,
      value,
      type: 'image' as const,
      media: imageAsset(`med-${id}`, value.slice(0, 12), optionSeq),
    };
  });
}

function audioOptions(values: string[]): QuestionOption[] {
  return values.map((value) => {
    optionSeq += 1;
    const id = `qo-${String(optionSeq).padStart(4, '0')}`;
    return {
      id,
      value,
      type: 'audio' as const,
      media: audioAsset(`med-${id}`, `${value.toLowerCase().replace(/\s+/g, '-')}.wav`, 2),
    };
  });
}

/** True/false is option-based on the backend, so it is seeded as two options. */
function trueFalseOptions(): QuestionOption[] {
  return ['True', 'False'].map((value) => {
    optionSeq += 1;
    return {
      id: `qo-${String(optionSeq).padStart(4, '0')}`,
      value,
      type: 'true_false' as const,
      media: null,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* The bank                                                                   */
/* -------------------------------------------------------------------------- */

interface BankDraft {
  text: string;
  description?: string;
  subject: 'literacy' | 'numeracy';
  level: number;
  point: number;
  question_type: QuestionType;
  layout: QuestionLayout | null;
  skill: string;
  difficulty: 'foundation' | 'core' | 'stretch';
  status: 'production_ready' | 'needs_review' | 'retired';
  usage_count: number;
  updated_label: string;
  contents: QuestionContent[];
  options: QuestionOption[];
}

const DRAFTS: BankDraft[] = [
  {
    text: 'Which picture shows the word "basket"?',
    description: 'Read the word aloud once, then let the child choose without further prompting.',
    subject: 'literacy',
    level: 4,
    point: 1,
    question_type: 'single_choice',
    layout: 'MEDIA_GRID_CHOICE',
    skill: 'Word reading',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 14,
    updated_label: 'Updated Aug 12, 2026',
    contents: [textBlock(1, 'Which picture shows the word "basket"?')],
    options: imageOptions(['Basket', 'Bucket', 'Blanket', 'Bracelet']),
  },
  {
    text: 'Listen to the sound. Which letter makes it?',
    subject: 'literacy',
    level: 3,
    point: 1,
    question_type: 'single_choice',
    layout: 'MEDIA_LIST_CHOICE',
    skill: 'Letter sounds',
    difficulty: 'foundation',
    status: 'production_ready',
    usage_count: 22,
    updated_label: 'Updated Aug 9, 2026',
    contents: [
      textBlock(1, 'Listen to the sound, then choose the letter that makes it.'),
      audioBlock(2, 'letter-sound-m.wav', 3, 'Played once. The child may replay it twice.'),
    ],
    options: textOptions(['m', 'n', 'w', 'h']),
  },
  {
    text: 'Read the passage, then answer: why did Ada go to the market?',
    description: 'The passage stays on screen while the child answers.',
    subject: 'literacy',
    level: 4,
    point: 2,
    question_type: 'single_choice',
    layout: 'PASSAGE_COMPREHENSION_CHOICE',
    skill: 'Reading comprehension',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 31,
    updated_label: 'Updated Aug 15, 2026',
    contents: [
      textBlock(
        1,
        'Ada woke early on Saturday. Her mother had no yam left for the evening meal, so she gave Ada two hundred naira and sent her to the market. Ada walked past the school, past the church, and found the yam seller under the mango tree.',
      ),
      textBlock(2, 'Why did Ada go to the market?'),
    ],
    options: textOptions([
      'To buy yam for the evening meal',
      'To meet her friends from school',
      'To sit under the mango tree',
      'To take money to her mother',
    ]),
  },
  {
    text: 'Say the word you see in the picture.',
    description: 'Recorded response. Mark against the spoken-word rubric.',
    subject: 'literacy',
    level: 4,
    point: 2,
    question_type: 'audio',
    layout: 'SPEECH_RESPONSE_PROMPT',
    skill: 'Word reading',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 9,
    updated_label: 'Updated Aug 4, 2026',
    contents: [
      textBlock(1, 'Look at the picture and say the word out loud.'),
      imageBlock(2, 'Lantern', 'A hurricane lantern with a glass chimney', 'Say the word clearly.'),
    ],
    options: [],
  },
  {
    text: 'Which two words rhyme with "cat"?',
    subject: 'literacy',
    level: 3,
    point: 2,
    question_type: 'multiple_choice',
    layout: 'MEDIA_LIST_CHOICE',
    skill: 'Letter sounds',
    difficulty: 'foundation',
    status: 'production_ready',
    usage_count: 18,
    updated_label: 'Updated Jul 30, 2026',
    contents: [textBlock(1, 'Choose the two words that rhyme with "cat".')],
    options: textOptions(['hat', 'mat', 'cup', 'dog']),
  },
  {
    text: 'Write one sentence about what you did before school today.',
    subject: 'literacy',
    level: 4,
    point: 3,
    question_type: 'text',
    layout: null,
    skill: 'Writing',
    difficulty: 'stretch',
    status: 'needs_review',
    usage_count: 4,
    updated_label: 'Updated Aug 16, 2026',
    contents: [
      textBlock(1, 'Write one full sentence about what you did before school today.'),
      textBlock(2, 'Start with a capital letter and end with a full stop.'),
    ],
    options: [],
  },
  {
    text: 'The letter "b" and the letter "d" face the same way.',
    subject: 'literacy',
    level: 3,
    point: 1,
    question_type: 'true_false',
    layout: null,
    skill: 'Letter recognition',
    difficulty: 'foundation',
    status: 'production_ready',
    usage_count: 27,
    updated_label: 'Updated Jul 22, 2026',
    contents: [textBlock(1, 'The letter "b" and the letter "d" face the same way.')],
    options: trueFalseOptions(),
  },
  {
    text: 'Listen to both readings. Which one reads the sentence correctly?',
    description: 'Comparison layout: the two clips sit side by side.',
    subject: 'literacy',
    level: 4,
    point: 2,
    question_type: 'single_choice',
    layout: 'COMPARISON_PANEL_CHOICE',
    skill: 'Word reading',
    difficulty: 'stretch',
    status: 'needs_review',
    usage_count: 3,
    updated_label: 'Updated Aug 17, 2026',
    contents: [
      textBlock(1, 'The sentence is: "The goat ran into the yard."'),
      textBlock(2, 'Listen to both readings, then choose the one that reads it correctly.'),
    ],
    options: audioOptions(['Reading A', 'Reading B']),
  },
  {
    text: 'How many mangoes are on the tray?',
    subject: 'numeracy',
    level: 3,
    point: 1,
    question_type: 'number',
    layout: null,
    skill: 'Counting and number sense',
    difficulty: 'foundation',
    status: 'production_ready',
    usage_count: 25,
    updated_label: 'Updated Aug 2, 2026',
    contents: [
      textBlock(1, 'Count the mangoes on the tray and type the number.'),
      imageBlock(2, '7 mangoes', 'A tray holding seven mangoes', 'Count carefully.'),
    ],
    options: [],
  },
  {
    text: 'What is 40 − 17?',
    subject: 'numeracy',
    level: 4,
    point: 1,
    question_type: 'single_choice',
    layout: 'MEDIA_LIST_CHOICE',
    skill: 'Subtraction',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 33,
    updated_label: 'Updated Aug 14, 2026',
    contents: [textBlock(1, 'What is 40 − 17?')],
    options: textOptions(['23', '27', '33', '37']),
  },
  {
    text: 'What is 305 − 128?',
    description: 'Borrowing across a zero — the item the class most often misses.',
    subject: 'numeracy',
    level: 4,
    point: 2,
    question_type: 'number',
    layout: null,
    skill: 'Subtraction',
    difficulty: 'stretch',
    status: 'production_ready',
    usage_count: 11,
    updated_label: 'Updated Aug 14, 2026',
    contents: [
      textBlock(1, 'Work out 305 − 128 and type your answer.'),
      textBlock(2, 'You may use paper. Show your working to your teacher afterwards.'),
    ],
    options: [],
  },
  {
    text: 'Which number is in the tens place in 476?',
    subject: 'numeracy',
    level: 4,
    point: 1,
    question_type: 'single_choice',
    layout: 'MEDIA_GRID_CHOICE',
    skill: 'Place value',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 19,
    updated_label: 'Updated Aug 6, 2026',
    contents: [
      textBlock(1, 'Look at the number 476.'),
      textBlock(2, 'Which digit is in the tens place?'),
    ],
    options: textOptions(['4', '7', '6', 'None of them']),
  },
  {
    text: 'Watch the shopkeeper. How much change should she give?',
    subject: 'numeracy',
    level: 4,
    point: 3,
    question_type: 'number',
    layout: null,
    skill: 'Money and change',
    difficulty: 'stretch',
    status: 'needs_review',
    usage_count: 2,
    updated_label: 'Updated Aug 18, 2026',
    contents: [
      textBlock(1, 'Watch the clip, then type the change the shopkeeper should give.'),
      videoBlock(2, 'market-change.mp4', 24, 'A customer pays ₦500 for goods costing ₦320.'),
    ],
    options: [],
  },
  {
    text: 'Choose all the shapes with four equal sides.',
    subject: 'numeracy',
    level: 3,
    point: 2,
    question_type: 'multiple_choice',
    layout: 'MEDIA_GRID_CHOICE',
    skill: 'Shapes',
    difficulty: 'core',
    status: 'production_ready',
    usage_count: 16,
    updated_label: 'Updated Jul 28, 2026',
    contents: [textBlock(1, 'Choose every shape that has four equal sides.')],
    options: imageOptions(['Square', 'Rectangle', 'Rhombus', 'Triangle']),
  },
  {
    text: 'Seven plus five is greater than ten.',
    subject: 'numeracy',
    level: 3,
    point: 1,
    question_type: 'true_false',
    layout: null,
    skill: 'Basic addition',
    difficulty: 'foundation',
    status: 'production_ready',
    usage_count: 21,
    updated_label: 'Updated Jul 19, 2026',
    contents: [textBlock(1, 'Seven plus five is greater than ten.')],
    options: trueFalseOptions(),
  },
  {
    text: 'Photograph your working for 24 × 3.',
    description: 'Upload item. Use only where children have a shared device with a camera.',
    subject: 'numeracy',
    level: 4,
    point: 3,
    question_type: 'file_upload',
    layout: null,
    skill: 'Multiplication',
    difficulty: 'stretch',
    status: 'needs_review',
    usage_count: 1,
    updated_label: 'Updated Aug 18, 2026',
    contents: [
      textBlock(1, 'Work out 24 × 3 on paper, then upload a photo of your working.'),
      textBlock(2, 'Make sure every step is visible in the photo.'),
    ],
    options: [],
  },
];

const REFERENCE_START = 1042;

export const bankQuestions: BankQuestion[] = DRAFTS.map((draft, index) => ({
  id: `bq-${String(index + 1).padStart(3, '0')}`,
  reference: `KOYI-${String(REFERENCE_START + index)}`,
  text: draft.text,
  description: draft.description ?? null,
  subject: draft.subject,
  level: draft.level,
  point: draft.point,
  question_type: draft.question_type,
  layout: draft.layout,
  contents: draft.contents,
  options: draft.options,
  skill: draft.skill,
  difficulty: draft.difficulty,
  status: draft.status,
  usage_count: draft.usage_count,
  updated_label: draft.updated_label,
}));

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Single choice',
  multiple_choice: 'Multiple choice',
  text: 'Written answer',
  audio: 'Spoken answer',
  number: 'Number answer',
  true_false: 'True or false',
  file_upload: 'File upload',
};

export const questionTypeLabels = QUESTION_TYPE_LABELS;

function countBy<T extends string | number>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return counts;
}

const typeCounts = countBy(bankQuestions.map((question) => question.question_type));
const levelCounts = countBy(bankQuestions.map((question) => question.level));

/** Derived from the seeded questions so the rail can never disagree with the list. */
export const bankSummary = {
  total: bankQuestions.length,
  production_ready: bankQuestions.filter((question) => question.status === 'production_ready')
    .length,
  needs_review: bankQuestions.filter((question) => question.status === 'needs_review').length,
  by_subject: [
    {
      subject: 'literacy' as const,
      label: 'Literacy',
      count: bankQuestions.filter((question) => question.subject === 'literacy').length,
    },
    {
      subject: 'numeracy' as const,
      label: 'Numeracy',
      count: bankQuestions.filter((question) => question.subject === 'numeracy').length,
    },
  ],
  by_question_type: (Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((questionType) => ({
    question_type: questionType,
    label: QUESTION_TYPE_LABELS[questionType],
    count: typeCounts.get(questionType) ?? 0,
  })),
  by_level: [...levelCounts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, count]) => ({ level, label: `Primary ${String(level)}`, count })),
};

/** The `QuestionLayout` lookup table, as the builder's layout dropdown reads it. */
export const questionLayouts = [
  {
    id: 'lay-media-grid',
    name: 'MEDIA_GRID_CHOICE' as const,
    label: 'Picture grid',
    description: 'Options as a grid of cards. Best for four short picture or word choices.',
  },
  {
    id: 'lay-media-list',
    name: 'MEDIA_LIST_CHOICE' as const,
    label: 'Stacked list',
    description: 'Options stacked in one column. Best for longer text or audio options.',
  },
  {
    id: 'lay-comparison',
    name: 'COMPARISON_PANEL_CHOICE' as const,
    label: 'Side-by-side panels',
    description: 'Two options shown together for comparison. Use with exactly two options.',
  },
  {
    id: 'lay-speech',
    name: 'SPEECH_RESPONSE_PROMPT' as const,
    label: 'Speaking prompt',
    description: 'A prompt with a record button. Use for spoken answers.',
  },
  {
    id: 'lay-passage',
    name: 'PASSAGE_COMPREHENSION_CHOICE' as const,
    label: 'Passage and question',
    description: 'Passage stays on screen beside the question. Use for comprehension.',
  },
];

/** Copies a bank question into an assessment question at a given position. */
export function toAssessmentQuestion(question: BankQuestion, order: number): AssessmentQuestion {
  return {
    id: question.id,
    text: question.text,
    description: question.description,
    subject: question.subject,
    level: question.level,
    order,
    point: question.point,
    question_type: question.question_type,
    layout: question.layout,
    contents: question.contents,
    options: question.options,
  };
}
