import type { DraftQuestion } from '@/features/teacher/assessments/lib/draft';
import type { BankQuestion } from '@/features/teacher/question-bank/api/question-bank.schema';

/**
 * Turns a bank question into a builder question box.
 *
 * The copy keeps its bank id, because that is what the create request sends:
 * a reference, not a body. Re-sending the whole question would let a stale
 * copy in this tab overwrite the canonical one in the bank.
 *
 * `is_correct` comes back `false` on every option, and that is correct — the
 * bank never ships answer keys to the browser. The server still holds them,
 * and a referenced question is marked with the server's copy.
 */
export function toDraftQuestion(question: BankQuestion): DraftQuestion {
  return {
    id: question.id,
    source: 'bank',
    bank_reference: question.reference,
    text: question.text,
    description: question.description ?? '',
    subject: question.subject,
    level: question.level,
    point: question.point,
    question_type: question.question_type,
    layout: question.layout ?? 'MEDIA_GRID_CHOICE',
    contents: question.contents.map((content) => ({
      id: content.id,
      type: content.type,
      text_content: content.text_content ?? '',
      media_url: content.media?.url ?? '',
      media_name: content.media?.file_name ?? '',
      alt_text: content.alt_text ?? '',
      caption: content.caption ?? '',
    })),
    options: question.options.map((option) => ({
      id: option.id,
      value: option.value,
      type: option.type,
      media_url: option.media?.url ?? '',
      media_name: option.media?.file_name ?? '',
      is_correct: false,
    })),
    answer_value: '',
  };
}
