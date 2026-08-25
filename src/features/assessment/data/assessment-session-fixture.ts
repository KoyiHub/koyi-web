/**
 * Assessment session fixture, aligned to the confirmed backend technical
 * contract (Joshua's technical document) where possible. Still PROVISIONAL:
 * no assessment session/response API contract is confirmed yet, so this
 * remains a typed local fixture, not Axios/TanStack Query.
 *
 * `technicalType` mirrors the backend `question_type` values: single_choice,
 * multiple_choice, text, audio, number, true_false, file_upload. Only
 * `single_choice` has a renderer today — the rest are documented in the
 * union below purely so the type stays representative of the contract; do
 * not build speculative UI for them ahead of confirmed product need.
 *
 * `pedagogicalType` is unrelated, separate metadata: the Production Ready
 * workbook's "Question Type" column (e.g. "Addition", "Passage question",
 * "Place value", "Context meaning"). It is curriculum/skill classification,
 * not the backend response type — the two must never be merged into one
 * field.
 *
 * The five questions below are real Primary 4 items from the Koyi
 * Production Ready workbook (KOYI-0117, KOYI-0104, KOYI-0292, KOYI-0302,
 * KOYI-0322).
 *
 * SECURITY BOUNDARY: student-facing question payloads must never include a
 * "Correct Answer" value, `is_correct`, scoring logic, or an answer key —
 * those stay server-side (see CLAUDE.md, Backend/API readiness). This
 * fixture and `QuestionResponse` intentionally carry no such field; the
 * frontend only ever records which option a student picked.
 */

export interface SessionStudent {
  id: string;
  name: string;
}

export const sessionStudents: SessionStudent[] = [
  { id: 'stu-amina-yusuf', name: 'Amina Yusuf' },
  { id: 'stu-ibrahim-musa', name: 'Ibrahim Musa' },
];

export const defaultSessionStudentIndex = 0;

export type QuestionSubject = 'Literacy' | 'Numeracy';

/**
 * Backend `question_type` contract values. Only 'single_choice' is
 * implemented as a renderer in this batch — the remaining members exist so
 * this type stays representative of the confirmed contract for future work.
 */
export type QuestionTechnicalType =
  'single_choice' | 'multiple_choice' | 'text' | 'audio' | 'number' | 'true_false' | 'file_upload';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface SingleChoiceQuestion {
  id: string;
  technicalType: 'single_choice';
  classLevel: string;
  subject: QuestionSubject;
  koyiLevel: string;
  skill: string;
  /** PROVISIONAL workbook metadata, e.g. "Addition", "Passage question" — not a closed enum yet. */
  pedagogicalType: string;
  difficulty: string;
  prompt: string;
  options: QuestionOption[];
}

// Only 'single_choice' is implemented; this stays a union of one so adding
// a second technical-type renderer later is a type-safe, additive change.
export type AssessmentQuestion = SingleChoiceQuestion;

export interface SingleChoiceResponse {
  questionId: string;
  technicalType: 'single_choice';
  selectedOptionId: string;
}

export type QuestionResponse = SingleChoiceResponse;

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'KOYI-0117',
    technicalType: 'single_choice',
    classLevel: 'Primary 4',
    subject: 'Literacy',
    koyiLevel: 'Sentence',
    skill: 'Vocabulary',
    pedagogicalType: 'Context meaning',
    difficulty: 'Medium',
    prompt: "In the sentence 'We stayed inside because it rained.', what does 'because' help show?",
    options: [
      { id: 'KOYI-0117-a', text: 'a number' },
      { id: 'KOYI-0117-b', text: 'a colour' },
      { id: 'KOYI-0117-c', text: 'meaning/relationship in the sentence' },
      { id: 'KOYI-0117-d', text: "a person's name" },
    ],
  },
  {
    id: 'KOYI-0104',
    technicalType: 'single_choice',
    classLevel: 'Primary 4',
    subject: 'Literacy',
    koyiLevel: 'Paragraph',
    skill: 'Reading comprehension',
    pedagogicalType: 'Passage question',
    difficulty: 'Medium',
    prompt:
      'Tunde and his friends planted beans behind their classroom. They watered the plants every morning. After several weeks, small green leaves appeared. What did the children plant?',
    options: [
      { id: 'KOYI-0104-a', text: 'rice' },
      { id: 'KOYI-0104-b', text: 'yam' },
      { id: 'KOYI-0104-c', text: 'maize' },
      { id: 'KOYI-0104-d', text: 'beans' },
    ],
  },
  {
    id: 'KOYI-0292',
    technicalType: 'single_choice',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    koyiLevel: 'Number Recognition 10–99',
    skill: 'Place value',
    pedagogicalType: 'Place value',
    difficulty: 'Medium',
    prompt: 'What is the value of the digit 1 in 1000?',
    options: [
      { id: 'KOYI-0292-a', text: '10' },
      { id: 'KOYI-0292-b', text: '1' },
      { id: 'KOYI-0292-c', text: '1000' },
      { id: 'KOYI-0292-d', text: '100' },
    ],
  },
  {
    id: 'KOYI-0302',
    technicalType: 'single_choice',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    koyiLevel: 'Addition',
    skill: 'Basic addition',
    pedagogicalType: 'Addition',
    difficulty: 'Medium',
    prompt: 'What is 125 + 75?',
    options: [
      { id: 'KOYI-0302-a', text: '200' },
      { id: 'KOYI-0302-b', text: '210' },
      { id: 'KOYI-0302-c', text: '190' },
      { id: 'KOYI-0302-d', text: '300' },
    ],
  },
  {
    id: 'KOYI-0322',
    technicalType: 'single_choice',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    koyiLevel: 'Multiplication',
    skill: 'Basic multiplication',
    pedagogicalType: 'Multiplication',
    difficulty: 'Medium',
    prompt: 'What is 6 × 4?',
    options: [
      { id: 'KOYI-0322-a', text: '24' },
      { id: 'KOYI-0322-b', text: '25' },
      { id: 'KOYI-0322-c', text: '23' },
      { id: 'KOYI-0322-d', text: '29' },
    ],
  },
];
