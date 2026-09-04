import type {
  AuthoredQuestion,
  QuestionContent,
  QuestionOption,
} from '@/features/teacher/assessments/api/assessment.schema';
import {
  isOptionBased,
  type LevelRange,
  type QuestionLayout,
  type QuestionType,
} from '@/lib/api/contracts';

/**
 * The question authoring form's own draft shape, plus the client-side mirror
 * of every `400` rule in `frontend-integration.md` §5.3.
 *
 * These checks are a courtesy, not the source of truth — the server validates
 * for real, and anything this misses still surfaces as the server's message.
 * The point is to stop a teacher hitting "Save" and only then discovering a
 * rule that a bound picker or a disabled control could have shown up front.
 */

/** A content block or option carries a client-only `key` so React can track it before a save. */
export interface DraftContent extends QuestionContent {
  key: string;
}

export interface DraftOption extends QuestionOption {
  key: string;
}

export interface QuestionDraft {
  key: string;
  id?: string | undefined;
  subskill_id: string;
  subskill_name: string;
  level_range: LevelRange;
  fln_level: number | null;
  question_type: QuestionType;
  layout: QuestionLayout | null;
  text: string;
  description: string;
  point: string;
  source_question_id: string | null;
  contents: DraftContent[];
  options: DraftOption[];
  answer_value: string;
}

let keyCounter = 0;
export function nextKey(): string {
  keyCounter += 1;
  return `draft-${String(keyCounter)}-${String(Date.now())}`;
}

export function emptyQuestionDraft(
  subskillId: string,
  subskillName: string,
  range: LevelRange,
): QuestionDraft {
  return {
    key: nextKey(),
    subskill_id: subskillId,
    subskill_name: subskillName,
    level_range: range,
    fln_level: range[0],
    question_type: 'single_choice',
    layout: 'media_grid_choice',
    text: '',
    description: '',
    point: '1.00',
    source_question_id: null,
    contents: [],
    options: [
      { key: nextKey(), type: 'text', value: '', is_correct: true },
      { key: nextKey(), type: 'text', value: '', is_correct: false },
    ],
    answer_value: '',
  };
}

/** Layouts valid for a given question type — `speech_response_prompt` only for `audio`, never otherwise. */
export function layoutsFor(type: QuestionType): QuestionLayout[] {
  if (type === 'audio') return ['speech_response_prompt'];
  return [
    'media_grid_choice',
    'media_list_choice',
    'comparison_panel_choice',
    'passage_comprehension_choice',
  ];
}

/**
 * Narrows an arbitrary layout string (the bank's `layout` is a loose string —
 * see `bank.schema.ts`) to one valid for `type`, falling back to that type's
 * first allowed layout when it isn't. Used when prefilling a draft from the
 * bank, since the draft form only ever offers `layoutsFor(type)` as options.
 */
export function resolveLayout(type: QuestionType, layout: string | null): QuestionLayout {
  const allowed = layoutsFor(type);
  const match = allowed.find((candidate) => candidate === layout);
  return match ?? allowed[0]!;
}

export interface FieldErrors {
  fln_level?: string;
  layout?: string;
  options?: string;
  answer_value?: string;
  text?: string;
}

/** Mirrors the §5.3 validation table. Returns an empty object when the draft would be accepted. */
export function validateQuestionDraft(draft: QuestionDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.text.trim()) {
    errors.text = 'The question needs prompt text.';
  }

  if (draft.fln_level === null) {
    errors.fln_level = 'Choose a level.';
  } else if (draft.fln_level < draft.level_range[0] || draft.fln_level > draft.level_range[1]) {
    errors.fln_level = `${draft.subskill_name} is only assessed at levels ${String(draft.level_range[0])} to ${String(draft.level_range[1])}.`;
  }

  if (draft.question_type === 'audio') {
    if (draft.layout !== 'speech_response_prompt') {
      errors.layout = 'A speech prompt cannot carry any other layout.';
    }
    if (draft.options.length > 0) {
      errors.options = 'A speech prompt cannot carry answer options.';
    }
  } else if (draft.layout === 'speech_response_prompt') {
    errors.layout = 'This layout renders options, but this question type has none.';
  }

  const optionBased = isOptionBased(draft.question_type);

  if (optionBased) {
    const filled = draft.options.filter((option) => option.value.trim().length > 0);
    if (filled.length === 0) {
      errors.options = 'Add at least one option.';
    } else if (!filled.some((option) => option.is_correct)) {
      errors.options = 'Mark one option as correct.';
    }

    if (draft.layout === 'comparison_panel_choice' && (filled.length < 2 || filled.length > 3)) {
      errors.options = 'A comparison panel compares two or three things.';
    }
  } else if (draft.options.some((option) => option.value.trim().length > 0)) {
    errors.options = 'Text, number and file questions carry no options.';
  }

  if (draft.question_type === 'number' && !draft.answer_value.trim()) {
    errors.answer_value = 'Give the expected answer, or this item can never be marked.';
  }

  return errors;
}

export function isDraftValid(draft: QuestionDraft): boolean {
  return Object.keys(validateQuestionDraft(draft)).length === 0;
}

/** Converts an editable draft into the payload shape the section's `PUT` expects. */
export function draftToAuthoredQuestion(draft: QuestionDraft): AuthoredQuestion {
  const optionBased = isOptionBased(draft.question_type);

  return {
    ...(draft.id ? { id: draft.id } : {}),
    subskill_id: draft.subskill_id,
    fln_level: (draft.fln_level ?? draft.level_range[0]) as AuthoredQuestion['fln_level'],
    question_type: draft.question_type,
    layout: draft.layout,
    text: draft.text.trim(),
    description: draft.description.trim(),
    point: draft.point.trim() || '1.00',
    source_question_id: draft.source_question_id,
    contents: draft.contents.map(({ key: _key, ...content }) => content),
    options: optionBased
      ? draft.options
          .filter((option) => option.value.trim().length > 0)
          .map(({ key: _key, ...option }) => option)
      : [],
    answer:
      draft.question_type === 'number' && draft.answer_value.trim()
        ? { value: draft.answer_value.trim() }
        : null,
  };
}
