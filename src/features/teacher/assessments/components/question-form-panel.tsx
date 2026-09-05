import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { TextareaField } from '@/components/ui/textarea-field';
import {
  type FieldErrors,
  layoutsFor,
  nextKey,
  type QuestionDraft,
} from '@/features/teacher/assessments/lib/question-form';
import { isOptionBased, type QuestionType } from '@/lib/api/contracts';

/**
 * The per-question authoring form.
 *
 * Mirrors every §5.3 validation rule with a bound control rather than letting
 * the teacher discover the limit through a `400`: the level select is clamped
 * to the subskill's `level_range`, the layout list narrows to what the chosen
 * `question_type` allows, and the options editor switches between a single-
 * answer radio and a multi-answer checkbox set for `single_choice` /
 * `true_false` versus `multiple_choice`.
 *
 * `contents` is kept deliberately simple: one text prompt is enough for most
 * items, and a "Media ID" field stands in for a real upload flow, since no
 * media upload endpoint is confirmed yet. Wiring one in only touches
 * `addMediaContent` below.
 */

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: 'Single choice — one right answer, marked instantly',
  multiple_choice: 'Multiple choice — several right answers, marked instantly',
  true_false: 'True or false — marked instantly',
  number: 'Number — typed, marked instantly against the answer given below',
  text: 'Text — typed, marked by the AI marker, so results settle after submission',
  audio: 'Spoken — recorded, transcribed then marked by the AI, so results settle after submission',
  file_upload: 'File upload — never auto-marked, always waits for a teacher',
};

const LAYOUT_LABEL: Record<string, string> = {
  media_grid_choice: 'Grid — short options, a picture or a number as the stimulus',
  media_list_choice: 'List — sentence-length options',
  comparison_panel_choice: 'Comparison panel — the child compares two or three things',
  speech_response_prompt: 'Speech prompt — the task is spoken',
  passage_comprehension_choice: 'Passage — a passage, story or numbered image sequence',
};

interface QuestionFormPanelProps {
  draft: QuestionDraft;
  errors: FieldErrors;
  onChange: (draft: QuestionDraft) => void;
  onRemove: () => void;
}

export function QuestionFormPanel({ draft, errors, onChange, onRemove }: QuestionFormPanelProps) {
  const optionBased = isOptionBased(draft.question_type);
  const levelOptions = Array.from(
    { length: draft.level_range[1] - draft.level_range[0] + 1 },
    (_, index) => draft.level_range[0] + index,
  ).map((level) => ({ value: String(level), label: `Level ${String(level)}` }));

  function setType(type: QuestionType) {
    const allowedLayouts = layoutsFor(type);
    onChange({
      ...draft,
      question_type: type,
      layout: allowedLayouts[0] ?? null,
      options: type === 'audio' ? [] : draft.options,
    });
  }

  function updateOption(key: string, patch: Partial<QuestionDraft['options'][number]>) {
    const isExclusive =
      draft.question_type === 'single_choice' || draft.question_type === 'true_false';
    onChange({
      ...draft,
      options: draft.options.map((option) => {
        if (option.key !== key) {
          // Exclusive types behave as radios: marking one correct clears the rest.
          return isExclusive && patch.is_correct ? { ...option, is_correct: false } : option;
        }
        return { ...option, ...patch };
      }),
    });
  }

  function addOption() {
    onChange({
      ...draft,
      options: [...draft.options, { key: nextKey(), type: 'text', value: '', is_correct: false }],
    });
  }

  function removeOption(key: string) {
    onChange({ ...draft, options: draft.options.filter((option) => option.key !== key) });
  }

  return (
    <div className="border-koyi-border rounded-koyi-md space-y-4 border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-koyi-muted text-xs font-semibold tracking-wide uppercase">
          {draft.subskill_name} · Level {String(draft.fln_level ?? draft.level_range[0])}
          {draft.source_question_id && ' · From the bank'}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="text-koyi-danger inline-flex items-center gap-1 text-xs font-medium hover:underline"
        >
          <TrashIcon className="size-3.5" />
          Remove
        </button>
      </div>

      <TextareaField
        label="Question text"
        labelHidden
        placeholder="What is the child asked?"
        rows={2}
        value={draft.text}
        onChange={(event) => {
          onChange({ ...draft, text: event.target.value });
        }}
      />
      {errors.text && <p className="text-koyi-danger text-xs">{errors.text}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          label="Level"
          options={levelOptions}
          value={String(draft.fln_level ?? '')}
          onChange={(event) => {
            onChange({ ...draft, fln_level: Number(event.target.value) });
          }}
          error={errors.fln_level}
        />
        <SelectField
          label="Question type"
          options={Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
          value={draft.question_type}
          onChange={(event) => {
            setType(event.target.value as QuestionType);
          }}
        />
        <SelectField
          label="Layout"
          options={layoutsFor(draft.question_type).map((layout) => ({
            value: layout,
            label: LAYOUT_LABEL[layout] ?? layout,
          }))}
          value={draft.layout ?? ''}
          onChange={(event) => {
            onChange({ ...draft, layout: event.target.value as QuestionDraft['layout'] });
          }}
          error={errors.layout}
        />
      </div>

      {draft.question_type === 'number' && (
        <TextField
          label="Expected answer"
          placeholder="e.g. 22"
          hint="Compared numerically — surrounding spaces don't matter. Without this the item can never be marked."
          value={draft.answer_value}
          onChange={(event) => {
            onChange({ ...draft, answer_value: event.target.value });
          }}
          error={errors.answer_value}
        />
      )}

      {optionBased && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-koyi-text text-sm font-medium">Options</p>
            <button
              type="button"
              onClick={addOption}
              className="text-koyi-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <PlusIcon className="size-3.5" />
              Add option
            </button>
          </div>

          {draft.options.map((option) => {
            const exclusive =
              draft.question_type === 'single_choice' || draft.question_type === 'true_false';
            return (
              <div key={option.key} className="flex items-center gap-2">
                <input
                  type={exclusive ? 'radio' : 'checkbox'}
                  name={`correct-${draft.key}`}
                  checked={option.is_correct}
                  onChange={(event) => {
                    updateOption(option.key, { is_correct: event.target.checked });
                  }}
                  aria-label="Correct option"
                  className="border-koyi-border text-koyi-primary size-4"
                />
                <input
                  type="text"
                  aria-label="Option text"
                  placeholder="Option text"
                  value={option.value}
                  onChange={(event) => {
                    updateOption(option.key, { value: event.target.value });
                  }}
                  className="border-koyi-border rounded-koyi-md h-10 flex-1 border bg-white px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    removeOption(option.key);
                  }}
                  aria-label="Remove option"
                  className="text-koyi-muted hover:text-koyi-danger p-1"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            );
          })}
          {errors.options && <p className="text-koyi-danger text-xs">{errors.options}</p>}
        </div>
      )}
    </div>
  );
}
