import type {
  AssessmentSubject,
  AssessmentType,
  QuestionContentType,
  QuestionLayout,
  QuestionOptionType,
  QuestionType,
} from '@/features/teacher/api/shared.schema';
import type { Difficulty } from '@/features/teacher/assessments/api/assessment.schema';

/**
 * The assessment a teacher is part-way through building.
 *
 * The builder spans three screens — details and questions, a detour to the
 * question bank, then scheduling — so the work in progress cannot live in one
 * component's state. It lives in `sessionStorage` under a single key:
 *
 *  - it survives the bank round trip and a refresh,
 *  - it dies with the tab, so a shared staff-room device never shows the next
 *    teacher what the last one was drafting,
 *  - it is never a source of truth. Nothing is saved until the create call
 *    succeeds, and the server assigns every id and every question `order`.
 *
 * One thing here that is absent from every read schema: `is_correct`. Marking
 * the right answer is what authoring *is*, so it travels outward in the create
 * payload. It is never read back — see the SECURITY BOUNDARY note on
 * `questionOptionSchema`.
 */

const DRAFT_KEY = 'koyi.teacher.assessmentDraft';

/** A prompt block: text, or a piece of media, in the order the child sees it. */
export interface DraftContent {
  /** Client-side only. The server assigns the real id on create. */
  id: string;
  type: QuestionContentType;
  text_content: string;
  /**
   * PROVISIONAL: a media upload endpoint has not been confirmed, so the
   * builder holds the object URL and file name of the chosen file and the
   * create payload sends `media_id`. Wiring a real upload replaces these two
   * fields and nothing else.
   */
  media_url: string;
  media_name: string;
  alt_text: string;
  caption: string;
}

export interface DraftOption {
  id: string;
  value: string;
  type: QuestionOptionType;
  media_url: string;
  media_name: string;
  is_correct: boolean;
}

export interface DraftQuestion {
  id: string;
  /** `bank` questions keep their reference so the teacher can see where they came from. */
  source: 'new' | 'bank';
  bank_reference: string | null;
  text: string;
  description: string;
  subject: AssessmentSubject;
  level: number;
  point: number;
  question_type: QuestionType;
  layout: QuestionLayout;
  /** Ordered. `display_order` is this array's index, sent on create. */
  contents: DraftContent[];
  options: DraftOption[];
  /** The expected answer for the types that have no options. */
  answer_value: string;
}

export interface DraftDetails {
  title: string;
  description: string;
  subject: AssessmentSubject;
  assessment_type: AssessmentType;
  grade_level: number;
  difficulty: Difficulty;
  time_limit_minutes: number;
  instructions: string;
}

export interface AssessmentDraft {
  details: DraftDetails;
  questions: DraftQuestion[];
  /**
   * Set when the builder was opened from an AI insight's "Apply focus group".
   * The assign step pre-selects these children and says why.
   */
  focus: { skill: string; student_ids: string[] } | null;
  /**
   * Set once the draft has been saved to the server, so the assign step knows
   * which assessment it is assigning. It lives in the draft rather than in
   * navigate state because a teacher who refreshes the assign page must not
   * lose the assessment they just created.
   */
  created_id: string | null;
}

let counter = 0;

/** A collision-free id for a draft row. Local to this tab, never sent. */
export function draftId(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(Date.now())}-${String(counter)}`;
}

export const DEFAULT_LAYOUT: QuestionLayout = 'MEDIA_GRID_CHOICE';

export function emptyContent(type: QuestionContentType = 'text'): DraftContent {
  return {
    id: draftId('content'),
    type,
    text_content: '',
    media_url: '',
    media_name: '',
    alt_text: '',
    caption: '',
  };
}

export function emptyOption(type: QuestionOptionType = 'text'): DraftOption {
  return {
    id: draftId('option'),
    value: '',
    type,
    media_url: '',
    media_name: '',
    is_correct: false,
  };
}

/**
 * A new question box.
 *
 * True/false arrives with both options already written, because there are only
 * ever two and typing "True" and "False" by hand is busywork. Choice questions
 * start with two blanks, the smallest number that is still a choice.
 */
export function emptyQuestion(details: DraftDetails, type: QuestionType = 'single_choice') {
  const question: DraftQuestion = {
    id: draftId('question'),
    source: 'new',
    bank_reference: null,
    text: '',
    description: '',
    subject: details.subject,
    level: details.grade_level,
    point: 1,
    question_type: type,
    layout: DEFAULT_LAYOUT,
    contents: [emptyContent('text')],
    options: [],
    answer_value: '',
  };

  return withOptionsFor(question, type);
}

/**
 * Re-shapes a question's options after its type changes.
 *
 * Switching between two choice types keeps what was typed — the options are
 * still meaningful. Switching to or from true/false, or to a type that has no
 * options at all, replaces them, because the old ones cannot be answers to the
 * new question.
 */
export function withOptionsFor(question: DraftQuestion, type: QuestionType): DraftQuestion {
  if (type === 'true_false') {
    return {
      ...question,
      question_type: type,
      layout: 'MEDIA_LIST_CHOICE',
      options: [
        { ...emptyOption('true_false'), value: 'True' },
        { ...emptyOption('true_false'), value: 'False' },
      ],
    };
  }

  if (type === 'single_choice' || type === 'multiple_choice') {
    const kept = question.options.filter((option) => option.type !== 'true_false');
    const options = kept.length > 0 ? kept : [emptyOption('text'), emptyOption('text')];

    // Only one answer can be right in a single-choice question, so collapse any
    // extra ticks the teacher made while it was multiple choice.
    if (type === 'single_choice') {
      const first = options.findIndex((option) => option.is_correct);

      return {
        ...question,
        question_type: type,
        options: options.map((option, index) => ({ ...option, is_correct: index === first })),
      };
    }

    return { ...question, question_type: type, options };
  }

  return {
    ...question,
    question_type: type,
    layout: type === 'audio' ? 'SPEECH_RESPONSE_PROMPT' : question.layout,
    options: [],
  };
}

export const emptyDetails: DraftDetails = {
  title: '',
  description: '',
  subject: 'literacy',
  assessment_type: 'practice',
  grade_level: 4,
  difficulty: 'core',
  time_limit_minutes: 30,
  instructions: '',
};

export function emptyDraft(): AssessmentDraft {
  return { details: { ...emptyDetails }, questions: [], focus: null, created_id: null };
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Reads the draft back.
 *
 * Anything unreadable — storage disabled, malformed JSON, a shape left behind
 * by an older build — is treated as "no draft" rather than thrown at the
 * teacher. Losing a draft is bad; a white screen on the builder is worse.
 */
export function readDraft(): AssessmentDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isDraft(parsed)) return null;

    // Fields added after a draft was stored default rather than come back
    // undefined, so an in-flight draft survives a deploy.
    return { ...parsed, focus: parsed.focus ?? null, created_id: parsed.created_id ?? null };
  } catch {
    return null;
  }
}

export function writeDraft(draft: AssessmentDraft): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage disabled or full — the builder keeps working from React state
    // for this screen; only the round trip to the bank would lose work.
  }
}

export function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

/** A structural check, not validation — the form owns validation. */
function isDraft(value: unknown): value is AssessmentDraft {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<AssessmentDraft>;
  return (
    typeof candidate.details === 'object' &&
    candidate.details !== null &&
    Array.isArray(candidate.questions)
  );
}

/** Makes an independent copy of a question, ids and all. Used by Duplicate. */
export function duplicateQuestion(question: DraftQuestion): DraftQuestion {
  return {
    ...question,
    id: draftId('question'),
    // A copy is authored here, so it is no longer the bank's question.
    source: 'new',
    bank_reference: null,
    contents: question.contents.map((content) => ({ ...content, id: draftId('content') })),
    options: question.options.map((option) => ({ ...option, id: draftId('option') })),
  };
}
