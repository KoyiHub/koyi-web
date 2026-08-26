/**
 * Question Bank fixture — internal/teacher-facing content-QA view only.
 *
 * PROVISIONAL: the workbook counts below are the confirmed batch totals from
 * the Koyi Production Ready workbook (606 total / 524 Production Ready / 82
 * Needs Review). We do not have a bulk-import pipeline yet, so this fixture
 * intentionally lists a small representative sample rather than dumping all
 * 606 records into a component.
 *
 * `reviewStatus`/`reviewNote` are non-security content-QA metadata only:
 * they flag records a curriculum reviewer should look at again (e.g. a
 * wording or formatting issue), never anything about correctness or scoring.
 *
 * SECURITY BOUNDARY: as with the assessment session fixture, no entry here
 * carries a "Correct Answer" value, `is_correct`, or scoring logic.
 */

export type ReviewStatus = 'approved' | 'needs-review';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionBankEntry {
  id: string;
  classLevel: string;
  subject: 'Literacy' | 'Numeracy';
  category: string;
  difficulty: Difficulty;
  pedagogicalType: string;
  technicalType: string;
  prompt: string;
  optionCount: number;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
}

export const workbookSummary = {
  total: 606,
  productionReady: 524,
  needsReview: 82,
};

/**
 * Sample only — real Production Ready items already used in the assessment
 * session fixture, plus the three records that were previously flagged for a
 * duplicate-option anomaly (KOYI-0599, KOYI-0601, KOYI-0602). The curriculum
 * team has since re-reviewed those three and confirmed they are clean —
 * they now render as Production Ready/approved, not Needs review. A
 * separate, clearly-labelled placeholder sample record represents what a
 * genuine Needs review item looks like in this UI, since none of the real
 * sample content currently needs review.
 */
export const questionBankSample: QuestionBankEntry[] = [
  {
    id: 'KOYI-0117',
    classLevel: 'Primary 4',
    subject: 'Literacy',
    category: 'Vocabulary',
    difficulty: 'Medium',
    pedagogicalType: 'Context meaning',
    technicalType: 'single_choice',
    prompt: "In the sentence 'We stayed inside because it rained.', what does 'because' help show?",
    optionCount: 4,
    reviewStatus: 'approved',
  },
  {
    id: 'KOYI-0104',
    classLevel: 'Primary 4',
    subject: 'Literacy',
    category: 'Reading comprehension',
    difficulty: 'Easy',
    pedagogicalType: 'Passage question',
    technicalType: 'single_choice',
    prompt:
      'Tunde and his friends planted beans behind their classroom. What did the children plant?',
    optionCount: 4,
    reviewStatus: 'approved',
  },
  {
    id: 'KOYI-0292',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Place value',
    difficulty: 'Medium',
    pedagogicalType: 'Place value',
    technicalType: 'single_choice',
    prompt: 'What is the value of the digit 1 in 1000?',
    optionCount: 4,
    reviewStatus: 'approved',
  },
  {
    id: 'KOYI-0302',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Addition',
    difficulty: 'Easy',
    pedagogicalType: 'Addition',
    technicalType: 'single_choice',
    prompt: 'A basket has 245 oranges. Another basket has 138 oranges. How many oranges in total?',
    optionCount: 4,
    reviewStatus: 'approved',
  },
  {
    id: 'KOYI-0322',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Subtraction',
    difficulty: 'Hard',
    pedagogicalType: 'Subtraction',
    technicalType: 'single_choice',
    prompt: 'A farmer had 512 chickens and sold 275. How many chickens are left?',
    optionCount: 4,
    reviewStatus: 'approved',
  },
  {
    id: 'KOYI-0599',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Place value',
    difficulty: 'Medium',
    pedagogicalType: 'Place value',
    technicalType: 'single_choice',
    prompt: 'Content pending re-import from the curriculum workbook.',
    optionCount: 4,
    reviewStatus: 'approved',
    reviewNote:
      'Previously flagged for a duplicate-option anomaly; re-reviewed and confirmed clean.',
  },
  {
    id: 'KOYI-0601',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Place value',
    difficulty: 'Medium',
    pedagogicalType: 'Place value',
    technicalType: 'single_choice',
    prompt: 'Content pending re-import from the curriculum workbook.',
    optionCount: 4,
    reviewStatus: 'approved',
    reviewNote:
      'Previously flagged for a duplicate-option anomaly; re-reviewed and confirmed clean.',
  },
  {
    id: 'KOYI-0602',
    classLevel: 'Primary 4',
    subject: 'Numeracy',
    category: 'Place value',
    difficulty: 'Medium',
    pedagogicalType: 'Place value',
    technicalType: 'single_choice',
    prompt: 'Content pending re-import from the curriculum workbook.',
    optionCount: 4,
    reviewStatus: 'approved',
    reviewNote:
      'Previously flagged for a duplicate-option anomaly; re-reviewed and confirmed clean.',
  },
  {
    id: 'KOYI-0450',
    classLevel: 'Primary 4',
    subject: 'Literacy',
    category: 'Phonics',
    difficulty: 'Easy',
    pedagogicalType: 'Sound-letter match',
    technicalType: 'single_choice',
    prompt: 'Sample placeholder — a real Needs review record awaiting curriculum-team correction.',
    optionCount: 4,
    reviewStatus: 'needs-review',
    reviewNote:
      'Wording is unclear for this reading level. Needs curriculum-team correction before use.',
  },
];

export const subjectFilterOptions = ['All Subjects', 'Literacy', 'Numeracy'] as const;
export const difficultyFilterOptions = ['All Difficulties', 'Easy', 'Medium', 'Hard'] as const;

/** Category filter options are derived from the sample so the list never drifts from the data. */
export const categoryFilterOptions = [
  'All Categories',
  ...Array.from(new Set(questionBankSample.map((entry) => entry.category))),
] as const;
