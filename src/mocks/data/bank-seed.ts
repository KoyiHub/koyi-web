/**
 * The seed behind `/v1/teacher/bank/questions/` — read-only reviewed
 * questions a teacher can prefill into a paper. Shaped exactly like an
 * authored question plus the reviewer metadata in
 * `frontend-integration.md` §5.2, `is_correct` included: a bank item is not
 * a lesser copy of an assessment question, and the teacher surface is where
 * that key legitimately lives.
 */
import type { BankQuestion } from '@/features/teacher/bank/api/bank.schema';
import { skills } from '@/mocks/data/taxonomy-seed';

function bankQuestion(
  subskillId: string,
  flnLevel: number,
  content: string,
  options: { value: string; is_correct: boolean }[],
): BankQuestion {
  const resolved = skills
    .flatMap((skill) => skill.subskills.map((subskill) => ({ skill, subskill })))
    .find((entry) => entry.subskill.id === subskillId);
  if (!resolved) throw new Error(`Unknown seed subskill: ${subskillId}`);

  return {
    id: `bank-${subskillId}-${String(flnLevel)}-${String(options.length)}`,
    content,
    type: 'single_choice',
    layout: 'media_grid_choice',
    fln_level: flnLevel as BankQuestion['fln_level'],
    subskill: {
      id: resolved.subskill.id,
      code: resolved.subskill.code,
      name: resolved.subskill.name,
      level_range: resolved.subskill.level_range,
    },
    skill_name: resolved.skill.name,
    domain: resolved.skill.domain,
    contents: [
      { type: 'text', display_order: 1, text_content: content, media_id: null, caption: null },
    ],
    options: options.map((option) => ({
      type: 'text',
      value: option.value,
      is_correct: option.is_correct,
      media_id: null,
    })),
  };
}

export const bankQuestions: BankQuestion[] = [
  bankQuestion('sub-letter-sounds', 1, 'Which letter makes this sound?', [
    { value: 'B', is_correct: true },
    { value: 'D', is_correct: false },
    { value: 'P', is_correct: false },
  ]),
  bankQuestion('sub-letter-sounds', 2, 'Which letter starts "sun"?', [
    { value: 'S', is_correct: true },
    { value: 'F', is_correct: false },
    { value: 'Z', is_correct: false },
  ]),
  bankQuestion('sub-familiar-words', 2, 'Which word says "cat"?', [
    { value: 'cat', is_correct: true },
    { value: 'cot', is_correct: false },
    { value: 'can', is_correct: false },
  ]),
  bankQuestion('sub-nonword-decoding', 3, 'Read the made-up word: "vun". Which matches it?', [
    { value: 'vun', is_correct: true },
    { value: 'van', is_correct: false },
    { value: 'vin', is_correct: false },
  ]),
  bankQuestion('sub-literal-comprehension', 3, 'What did the boy in the story pick up?', [
    { value: 'An umbrella', is_correct: true },
    { value: 'A bag', is_correct: false },
    { value: 'A ball', is_correct: false },
  ]),
  bankQuestion('sub-inference', 4, 'Why did David pick up his umbrella?', [
    { value: 'It was likely going to rain', is_correct: true },
    { value: 'He wanted to play', is_correct: false },
  ]),
  bankQuestion('sub-number-identification', 1, 'Which number is this?', [
    { value: '7', is_correct: true },
    { value: '9', is_correct: false },
    { value: '1', is_correct: false },
  ]),
  bankQuestion('sub-quantity-comparison', 1, 'Which group has more?', [
    { value: 'Group A', is_correct: false },
    { value: 'Group B', is_correct: true },
  ]),
  bankQuestion('sub-missing-numbers', 2, 'What number comes next: 4, 5, 6, __?', [
    { value: '7', is_correct: true },
    { value: '8', is_correct: false },
    { value: '9', is_correct: false },
  ]),
  bankQuestion('sub-place-value', 3, 'How many tens and ones are in 34?', [
    { value: '3 tens + 4 ones', is_correct: true },
    { value: '4 tens + 3 ones', is_correct: false },
  ]),
  bankQuestion('sub-addition', 2, 'What is 2 + 3?', [
    { value: '5', is_correct: true },
    { value: '6', is_correct: false },
    { value: '4', is_correct: false },
  ]),
  bankQuestion('sub-subtraction', 3, 'What is 9 − 4?', [
    { value: '5', is_correct: true },
    { value: '4', is_correct: false },
    { value: '6', is_correct: false },
  ]),
  bankQuestion(
    'sub-oral-word-problems',
    4,
    'Tunde has 3 mangoes. His mother gives him 2 more. How many now?',
    [
      { value: '5', is_correct: true },
      { value: '6', is_correct: false },
      { value: '4', is_correct: false },
    ],
  ),
];
