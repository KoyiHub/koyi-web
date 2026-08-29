import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  ImageIcon,
  MicIcon,
  PlusIcon,
  TextIcon,
  TrashIcon,
  VideoIcon,
} from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { TextareaField } from '@/components/ui/textarea-field';
import {
  CONTENT_TYPE_LABEL,
  LAYOUT_HINT,
  LAYOUT_LABEL,
  OPTION_TYPE_LABEL,
  OPTION_TYPES_FOR,
  QUESTION_TYPE_HINT,
  QUESTION_TYPE_LABEL,
} from '@/features/teacher/api/format';
import type {
  QuestionContentType,
  QuestionLayout,
  QuestionOptionType,
  QuestionType,
} from '@/features/teacher/api/shared.schema';
import type { QuestionLayoutOption } from '@/features/teacher/assessments/api/assessment.schema';
import { MediaField } from '@/features/teacher/assessments/components/media-field';
import {
  type DraftContent,
  type DraftOption,
  type DraftQuestion,
  emptyContent,
  emptyOption,
  withOptionsFor,
} from '@/features/teacher/assessments/lib/draft';
import { cn } from '@/lib/utils/cn';

interface QuestionEditorProps {
  index: number;
  total: number;
  question: DraftQuestion;
  /** Server lookup table. Falls back to the enum's own labels while it loads. */
  layouts: QuestionLayoutOption[];
  error?: string | undefined;
  onChange: (question: DraftQuestion) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const QUESTION_TYPES: QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'text',
  'number',
  'audio',
  'file_upload',
];

const CONTENT_TYPES: QuestionContentType[] = ['text', 'image', 'audio', 'video'];

const CONTENT_ICON = {
  text: TextIcon,
  image: ImageIcon,
  audio: MicIcon,
  video: VideoIcon,
};

/** The label above the answer area, in the teacher's words rather than the enum's. */
const ANSWER_HEADING: Record<QuestionType, string> = {
  single_choice: 'Answer options',
  multiple_choice: 'Answer options',
  true_false: 'Answer options',
  text: 'Expected answer',
  number: 'Expected answer',
  audio: 'Expected answer',
  file_upload: 'Marking',
};

/** A small square action button used by the question and block toolbars. */
function IconAction({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-koyi-muted focus-visible:outline-koyi-primary rounded-md p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : danger
            ? 'hover:text-koyi-danger hover:bg-red-50'
            : 'hover:text-koyi-text hover:bg-koyi-surface',
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * One question box in the builder.
 *
 * Three things change what this box looks like, and they are all the teacher's
 * choice: the **question type** decides how the child answers, the **layout**
 * decides how it is arranged on their screen, and the **content blocks** are
 * the prompt itself — any number of them, in the order they will be shown.
 * That mirrors the backend exactly: `AssessmentQuestion` holds the type and a
 * layout FK, `AssessmentQuestionContent` holds an ordered list of text and
 * media, and `AssessmentQuestionOption` holds the choices where there are any.
 *
 * Marking the correct option happens here and only here. It is authoring
 * input: it travels outward with the create request and is never read back,
 * because the child's app runs in this same browser.
 */
export function QuestionEditor({
  index,
  total,
  question,
  layouts,
  error,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: QuestionEditorProps) {
  const optionTypes = OPTION_TYPES_FOR[question.question_type];
  const hasOptions = optionTypes.length > 0;
  const isTrueFalse = question.question_type === 'true_false';
  const isSingle = question.question_type === 'single_choice' || isTrueFalse;

  const layoutOptions =
    layouts.length > 0
      ? layouts.map((layout) => ({ value: layout.name, label: layout.label }))
      : (Object.keys(LAYOUT_LABEL) as QuestionLayout[]).map((name) => ({
          value: name,
          label: LAYOUT_LABEL[name],
        }));

  const patch = (fields: Partial<DraftQuestion>) => {
    onChange({ ...question, ...fields });
  };

  const patchContent = (id: string, fields: Partial<DraftContent>) => {
    patch({
      contents: question.contents.map((content) =>
        content.id === id ? { ...content, ...fields } : content,
      ),
    });
  };

  const moveContent = (position: number, direction: -1 | 1) => {
    const next = [...question.contents];
    const target = position + direction;
    const moved = next[position];
    const displaced = next[target];
    if (!moved || !displaced) return;

    next[position] = displaced;
    next[target] = moved;
    patch({ contents: next });
  };

  const patchOption = (id: string, fields: Partial<DraftOption>) => {
    patch({
      options: question.options.map((option) =>
        option.id === id ? { ...option, ...fields } : option,
      ),
    });
  };

  /** Ticking an answer. Single choice clears the others; multiple choice toggles. */
  const markCorrect = (id: string, checked: boolean) => {
    patch({
      options: question.options.map((option) =>
        isSingle
          ? { ...option, is_correct: option.id === id }
          : option.id === id
            ? { ...option, is_correct: checked }
            : option,
      ),
    });
  };

  return (
    <li
      className={cn(
        'rounded-koyi-xl bg-koyi-card overflow-hidden border',
        error ? 'border-koyi-danger' : 'border-koyi-border',
      )}
    >
      <div className="bg-koyi-surface border-koyi-border flex flex-wrap items-center gap-3 border-b px-5 py-3">
        <span className="bg-koyi-primary flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
          {index + 1}
        </span>

        <p className="text-koyi-text text-sm font-bold">
          {QUESTION_TYPE_LABEL[question.question_type]}
        </p>

        {question.source === 'bank' && question.bank_reference && (
          <span className="bg-koyi-nav-active text-koyi-primary rounded-full px-2.5 py-1 text-xs font-semibold">
            From bank · {question.bank_reference}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <IconAction
            label={`Move question ${String(index + 1)} up`}
            disabled={index === 0}
            onClick={() => {
              onMove(-1);
            }}
          >
            <ChevronUpIcon aria-hidden="true" className="size-4" />
          </IconAction>

          <IconAction
            label={`Move question ${String(index + 1)} down`}
            disabled={index === total - 1}
            onClick={() => {
              onMove(1);
            }}
          >
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          </IconAction>

          <IconAction label={`Duplicate question ${String(index + 1)}`} onClick={onDuplicate}>
            <CopyIcon aria-hidden="true" className="size-4" />
          </IconAction>

          <IconAction label={`Delete question ${String(index + 1)}`} danger onClick={onRemove}>
            <TrashIcon aria-hidden="true" className="size-4" />
          </IconAction>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {error && (
          <p role="alert" className="text-koyi-danger text-sm font-semibold">
            {error}
          </p>
        )}

        <TextField
          label="Question"
          value={question.text}
          placeholder="What is the child being asked?"
          onChange={(event) => {
            patch({ text: event.target.value });
          }}
        />

        <TextareaField
          label="Instruction for the child (optional)"
          value={question.description}
          rows={2}
          placeholder="Say it the way you would say it aloud."
          onChange={(event) => {
            patch({ description: event.target.value });
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Question type"
            value={question.question_type}
            onChange={(event) => {
              onChange(withOptionsFor(question, event.target.value as QuestionType));
            }}
            options={QUESTION_TYPES.map((type) => ({
              value: type,
              label: QUESTION_TYPE_LABEL[type],
            }))}
          />

          <SelectField
            label="Layout"
            value={question.layout}
            onChange={(event) => {
              patch({ layout: event.target.value as QuestionLayout });
            }}
            options={layoutOptions}
          />

          <TextField
            label="Points"
            type="number"
            min={1}
            value={question.point}
            onChange={(event) => {
              patch({ point: Number(event.target.value) || 1 });
            }}
          />

          <TextField
            label="Level"
            type="number"
            min={1}
            max={6}
            hint="Grade this question targets."
            value={question.level}
            onChange={(event) => {
              patch({ level: Number(event.target.value) || 1 });
            }}
          />
        </div>

        <div className="text-koyi-muted grid gap-1 text-xs sm:grid-cols-2">
          <p>{QUESTION_TYPE_HINT[question.question_type]}</p>
          <p>{LAYOUT_HINT[question.layout]}</p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Content blocks                                                   */}
        {/* ---------------------------------------------------------------- */}

        <fieldset className="border-koyi-border rounded-koyi-md border p-4">
          <legend className="text-koyi-text px-1.5 text-sm font-bold">
            What the child sees
            <span className="text-koyi-muted ml-2 font-normal">
              {question.contents.length} block{question.contents.length === 1 ? '' : 's'}, shown in
              this order
            </span>
          </legend>

          <ol className="space-y-3">
            {question.contents.map((content, position) => {
              const Icon = CONTENT_ICON[content.type];

              return (
                <li
                  key={content.id}
                  className="border-koyi-border rounded-koyi-md bg-koyi-surface/50 border p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-koyi-muted bg-koyi-card flex size-8 shrink-0 items-center justify-center rounded-md">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>

                    <SelectField
                      label={`Block ${String(position + 1)} type`}
                      labelHidden
                      value={content.type}
                      onChange={(event) => {
                        // Switching a block's type keeps its caption but drops
                        // the payload that no longer applies, so a stale file
                        // name can never be sent with a text block.
                        const type = event.target.value as QuestionContentType;
                        patchContent(content.id, {
                          type,
                          text_content: type === 'text' ? content.text_content : '',
                          media_name: type === 'text' ? '' : content.media_name,
                          media_url: type === 'text' ? '' : content.media_url,
                        });
                      }}
                      options={CONTENT_TYPES.map((type) => ({
                        value: type,
                        label: CONTENT_TYPE_LABEL[type],
                      }))}
                      wrapperClassName="w-40"
                    />

                    <div className="ml-auto flex items-center gap-1">
                      <IconAction
                        label={`Move block ${String(position + 1)} up`}
                        disabled={position === 0}
                        onClick={() => {
                          moveContent(position, -1);
                        }}
                      >
                        <ChevronUpIcon aria-hidden="true" className="size-4" />
                      </IconAction>

                      <IconAction
                        label={`Move block ${String(position + 1)} down`}
                        disabled={position === question.contents.length - 1}
                        onClick={() => {
                          moveContent(position, 1);
                        }}
                      >
                        <ChevronDownIcon aria-hidden="true" className="size-4" />
                      </IconAction>

                      <IconAction
                        label={`Remove block ${String(position + 1)}`}
                        danger
                        disabled={question.contents.length === 1}
                        onClick={() => {
                          patch({
                            contents: question.contents.filter((item) => item.id !== content.id),
                          });
                        }}
                      >
                        <TrashIcon aria-hidden="true" className="size-4" />
                      </IconAction>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {content.type === 'text' ? (
                      <TextareaField
                        label={`Block ${String(position + 1)} text`}
                        labelHidden
                        value={content.text_content}
                        placeholder="Type the passage, the sentence or the sum the child reads."
                        onChange={(event) => {
                          patchContent(content.id, { text_content: event.target.value });
                        }}
                      />
                    ) : (
                      <MediaField
                        label={CONTENT_TYPE_LABEL[content.type]}
                        kind={content.type}
                        name={content.media_name}
                        url={content.media_url}
                        onChange={(next) => {
                          patchContent(content.id, {
                            media_name: next.name,
                            media_url: next.url,
                          });
                        }}
                      />
                    )}

                    {content.type === 'image' && (
                      <TextField
                        label="Describe the picture"
                        value={content.alt_text}
                        hint="Read aloud to a child who cannot see it."
                        onChange={(event) => {
                          patchContent(content.id, { alt_text: event.target.value });
                        }}
                      />
                    )}

                    {content.type !== 'text' && (
                      <TextField
                        label="Caption (optional)"
                        value={content.caption}
                        onChange={(event) => {
                          patchContent(content.id, { caption: event.target.value });
                        }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-3 flex flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => {
              const Icon = CONTENT_ICON[type];

              return (
                <Button
                  key={type}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    patch({ contents: [...question.contents, emptyContent(type)] });
                  }}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  Add {CONTENT_TYPE_LABEL[type].toLowerCase()}
                </Button>
              );
            })}
          </div>
        </fieldset>

        {/* ---------------------------------------------------------------- */}
        {/* Answers                                                          */}
        {/* ---------------------------------------------------------------- */}

        <fieldset className="border-koyi-border rounded-koyi-md border p-4">
          <legend className="text-koyi-text px-1.5 text-sm font-bold">
            {ANSWER_HEADING[question.question_type]}
            {hasOptions && (
              <span className="text-koyi-muted ml-2 font-normal">
                {isSingle ? 'Tick the one correct answer' : 'Tick every correct answer'}
              </span>
            )}
          </legend>

          {hasOptions && (
            <>
              <ul className="space-y-3">
                {question.options.map((option, position) => (
                  <li
                    key={option.id}
                    className="border-koyi-border rounded-koyi-md flex flex-wrap items-start gap-3 border bg-white p-3"
                  >
                    <label className="mt-2.5 flex shrink-0 items-center gap-2 text-sm font-semibold">
                      <input
                        type={isSingle ? 'radio' : 'checkbox'}
                        name={`correct-${question.id}`}
                        checked={option.is_correct}
                        onChange={(event) => {
                          markCorrect(option.id, event.target.checked);
                        }}
                        className="accent-koyi-primary size-4"
                      />
                      <span className="sr-only">Mark option {position + 1} as correct</span>
                      <span aria-hidden="true" className="text-koyi-muted">
                        {String.fromCharCode(65 + position)}
                      </span>
                    </label>

                    {optionTypes.length > 1 && (
                      <SelectField
                        label={`Option ${String(position + 1)} type`}
                        labelHidden
                        value={option.type}
                        onChange={(event) => {
                          const type = event.target.value as QuestionOptionType;
                          patchOption(option.id, {
                            type,
                            media_name: type === 'text' ? '' : option.media_name,
                            media_url: type === 'text' ? '' : option.media_url,
                          });
                        }}
                        options={optionTypes.map((type) => ({
                          value: type,
                          label: OPTION_TYPE_LABEL[type],
                        }))}
                        wrapperClassName="w-32"
                      />
                    )}

                    <div className="min-w-56 flex-1 space-y-3">
                      <TextField
                        label={`Option ${String(position + 1)}`}
                        value={option.value}
                        readOnly={isTrueFalse}
                        placeholder={
                          option.type === 'text' ? 'What this option says' : 'Label for this option'
                        }
                        onChange={(event) => {
                          patchOption(option.id, { value: event.target.value });
                        }}
                      />

                      {(option.type === 'image' || option.type === 'audio') && (
                        <MediaField
                          label={OPTION_TYPE_LABEL[option.type]}
                          kind={option.type}
                          name={option.media_name}
                          url={option.media_url}
                          onChange={(next) => {
                            patchOption(option.id, {
                              media_name: next.name,
                              media_url: next.url,
                            });
                          }}
                        />
                      )}
                    </div>

                    {!isTrueFalse && (
                      <div className="mt-1.5">
                        <IconAction
                          label={`Remove option ${String(position + 1)}`}
                          danger
                          disabled={question.options.length <= 2}
                          onClick={() => {
                            patch({
                              options: question.options.filter((item) => item.id !== option.id),
                            });
                          }}
                        >
                          <TrashIcon aria-hidden="true" className="size-4" />
                        </IconAction>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {!isTrueFalse && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    patch({
                      options: [...question.options, { ...emptyOption(optionTypes[0] ?? 'text') }],
                    });
                  }}
                >
                  <PlusIcon aria-hidden="true" className="size-4" />
                  Add option
                </Button>
              )}
            </>
          )}

          {!hasOptions && question.question_type !== 'file_upload' && (
            <TextField
              label={
                question.question_type === 'audio'
                  ? 'Phrase the child should say'
                  : 'Answer you expect'
              }
              value={question.answer_value}
              hint="Held for marking. It is never sent to the child's screen."
              onChange={(event) => {
                patch({ answer_value: event.target.value });
              }}
            />
          )}

          {question.question_type === 'file_upload' && (
            <p className="text-koyi-muted text-sm">
              The child uploads a photo or file of their work, and you mark it yourself. There is no
              expected answer to set.
            </p>
          )}
        </fieldset>
      </div>
    </li>
  );
}
