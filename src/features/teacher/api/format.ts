import type {
  QuestionContentType,
  QuestionLayout,
  QuestionOptionType,
  QuestionType,
} from '@/features/teacher/api/shared.schema';
import type { Difficulty } from '@/features/teacher/assessments/api/assessment.schema';
import type { BankStatus } from '@/features/teacher/bank/api/question-bank.schema';
import type {
  AttentionPriority,
  InsightKind,
} from '@/features/teacher/dashboard/api/dashboard.schema';

/**
 * Teacher presentation helpers.
 *
 * The FLN vocabulary shared with the School Admin app lives in
 * `@/lib/api/format` and is re-exported here so a screen imports one module.
 * Everything added below is Teacher-only: question shapes, layouts, insight
 * kinds and the attention list's priority scale.
 *
 * Nothing here derives a band, a score or a grade — these map values the
 * server already decided onto words and colours.
 */

export {
  ASSESSMENT_STATUS_CLASS,
  ASSESSMENT_STATUS_LABEL,
  ASSESSMENT_TYPE_LABEL,
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  BAND_LABEL,
  formatDate,
  LEVEL_CHIP_CLASS,
  LEVEL_LABEL,
  SUBJECT_LABEL,
} from '@/lib/api/format';

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: 'numeric',
  minute: '2-digit',
});

/** Formats an ISO datetime as "9:12 AM". Falls back to an em dash. */
export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? '—' : timeFormatter.format(parsed);
}

/** "+6" / "−3" / "0". Uses a real minus sign so figures line up in a column. */
export function formatChange(change: number): string {
  if (change > 0) return `+${String(change)}`;
  if (change < 0) return `−${String(Math.abs(change))}`;
  return '0';
}

/* -------------------------------------------------------------------------- */
/* Questions                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * How each answer shape is described to a teacher. The API values are the
 * backend's `question_type` choices; these are the words a teacher uses.
 */
export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: 'Single choice',
  multiple_choice: 'Multiple choice',
  text: 'Written answer',
  audio: 'Spoken answer',
  number: 'Number answer',
  true_false: 'True or false',
  file_upload: 'File upload',
};

/** One line explaining what the child actually does, shown under the type select. */
export const QUESTION_TYPE_HINT: Record<QuestionType, string> = {
  single_choice: 'The child picks one option.',
  multiple_choice: 'The child picks every option that applies.',
  text: 'The child types their answer.',
  audio: 'The child records themselves speaking.',
  number: 'The child enters a number.',
  true_false: 'The child chooses true or false.',
  file_upload: 'The child uploads a photo or file of their work.',
};

/** Which option types a question of each shape can carry. Empty means no options. */
export const OPTION_TYPES_FOR: Record<QuestionType, QuestionOptionType[]> = {
  single_choice: ['text', 'image', 'audio'],
  multiple_choice: ['text', 'image', 'audio'],
  true_false: ['true_false'],
  text: [],
  audio: [],
  number: [],
  file_upload: [],
};

export const OPTION_TYPE_LABEL: Record<QuestionOptionType, string> = {
  text: 'Text',
  image: 'Picture',
  audio: 'Sound',
  true_false: 'True / false',
};

export const CONTENT_TYPE_LABEL: Record<QuestionContentType, string> = {
  text: 'Text',
  image: 'Picture',
  audio: 'Sound',
  video: 'Video',
};

export const LAYOUT_LABEL: Record<QuestionLayout, string> = {
  MEDIA_GRID_CHOICE: 'Picture grid',
  MEDIA_LIST_CHOICE: 'Stacked list',
  COMPARISON_PANEL_CHOICE: 'Side-by-side panels',
  SPEECH_RESPONSE_PROMPT: 'Speaking prompt',
  PASSAGE_COMPREHENSION_CHOICE: 'Passage and question',
};

/**
 * What each layout does to the child's screen. Written for a teacher choosing
 * one, not for a developer reading the enum.
 */
export const LAYOUT_HINT: Record<QuestionLayout, string> = {
  MEDIA_GRID_CHOICE: 'Options as large tappable tiles, two per row.',
  MEDIA_LIST_CHOICE: 'Options stacked full width, one per row.',
  COMPARISON_PANEL_CHOICE: 'Two options side by side, for choosing between a pair.',
  SPEECH_RESPONSE_PROMPT: 'A prompt with a big record button underneath.',
  PASSAGE_COMPREHENSION_CHOICE: 'A passage the child reads, with the question below it.',
};

/* -------------------------------------------------------------------------- */
/* Library and bank                                                           */
/* -------------------------------------------------------------------------- */

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  foundation: 'Foundation',
  core: 'Core',
  stretch: 'Stretch',
};

export const DIFFICULTY_CHIP_CLASS: Record<Difficulty, string> = {
  foundation: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
  core: 'bg-koyi-nav-active text-koyi-primary',
  stretch: 'bg-amber-100 text-amber-800',
};

export const BANK_STATUS_LABEL: Record<BankStatus, string> = {
  production_ready: 'Ready to use',
  needs_review: 'Needs review',
  retired: 'Retired',
};

export const BANK_STATUS_CHIP_CLASS: Record<BankStatus, string> = {
  production_ready: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  needs_review: 'bg-amber-100 text-amber-800',
  retired: 'bg-koyi-surface text-koyi-muted',
};

/* -------------------------------------------------------------------------- */
/* Dashboard drill-downs                                                      */
/* -------------------------------------------------------------------------- */

export const PRIORITY_LABEL: Record<AttentionPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_CHIP_CLASS: Record<AttentionPriority, string> = {
  high: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
};

export const INSIGHT_KIND_LABEL: Record<InsightKind, string> = {
  emerging_gap: 'Emerging gap',
  common_mistake: 'Common mistake',
  teaching_activity: 'Teaching activity',
  positive_trend: 'Positive trend',
};

export const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  assessment_completed: 'Assessment completed',
  assessment_assigned: 'Assessment assigned',
  student_flagged: 'Student flagged',
  group_updated: 'Group updated',
  report_exported: 'Report exported',
  insight_generated: 'Insight generated',
};
