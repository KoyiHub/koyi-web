/**
 * The in-memory store behind `/v1/student/assessment/*` —
 * `frontend-integration.md` §6. One published, assigned paper a child can
 * sit: two sections (one per domain), enough question layouts to exercise
 * every renderer.
 *
 * SECURITY BOUNDARY: nothing below carries `is_correct`. This mirrors the
 * real runner contract, not the teacher/bank seed — the two are never wired
 * together.
 */

export const MOCK_ASSESSMENT_CODE = 'KRPX7T';
export const MOCK_ASSIGNMENT_CODE = '9M4X2B';
export const MOCK_STUDENT_NAME = 'Amina Yusuf';
export const MOCK_SITTING_SESSION = 'mock-sitting-session';
export const SITTING_TTL_MS = 3 * 60 * 60 * 1000;

/** Attempts allowed before `verify` starts answering `429` — real limit is 10/min. */
export const VERIFY_RATE_LIMIT = 5;

export interface SeedContent {
  type: 'text' | 'image' | 'audio' | 'video';
  display_order: number;
  text_content?: string;
  caption?: string;
  media?: { id: string; url: string; type: string };
}

export interface SeedOption {
  id: string;
  type: string;
  value: string;
  media?: { id: string; url: string; type: string };
}

export interface SeedQuestion {
  id: string;
  order: number;
  text: string;
  question_type: string;
  layout: string;
  point: string;
  fln_level: number;
  subskill_name: string;
  contents: SeedContent[];
  options: SeedOption[];
}

interface SectionSeed {
  id: string;
  name: string;
  domain: 'literacy' | 'numeracy';
  order: number;
  timer: string | null;
  questions: SeedQuestion[];
}

interface SectionRuntime extends SectionSeed {
  status: 'locked' | 'unlocked' | 'in_progress' | 'submitted';
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
}

const SECTION_SEEDS: SectionSeed[] = [
  {
    id: 'sec-reading',
    name: 'Reading',
    domain: 'literacy',
    order: 1,
    timer: '00:15:00',
    questions: [
      {
        id: 'q-letter-sound',
        order: 1,
        text: "Which one starts with the same sound as 'B'?",
        question_type: 'single_choice',
        layout: 'media_grid_choice',
        point: '1.00',
        fln_level: 1,
        subskill_name: 'Letter sounds',
        contents: [{ type: 'audio', display_order: 1, caption: 'Letter sound' }],
        options: [
          { id: 'opt-ball', type: 'text', value: 'Ball', media: img('ball') },
          { id: 'opt-dog', type: 'text', value: 'Dog', media: img('dog') },
          { id: 'opt-cat', type: 'text', value: 'Cat', media: img('cat') },
        ],
      },
      {
        id: 'q-say-word',
        order: 2,
        text: 'Say the word you see.',
        question_type: 'audio',
        layout: 'speech_response_prompt',
        point: '1.00',
        fln_level: 2,
        subskill_name: 'Familiar word reading',
        contents: [{ type: 'text', display_order: 1, text_content: 'CAT' }],
        options: [],
      },
      {
        id: 'q-short-story',
        order: 3,
        text: 'Where did Amaka go?',
        question_type: 'single_choice',
        layout: 'passage_comprehension_choice',
        point: '1.00',
        fln_level: 3,
        subskill_name: 'Literal comprehension',
        contents: [
          {
            type: 'text',
            display_order: 1,
            text_content: 'Amaka woke up early. She put on her school uniform.',
          },
          {
            type: 'image',
            display_order: 2,
            caption: 'Amaka waking up',
            media: img('bedroom-wake'),
          },
          {
            type: 'image',
            display_order: 3,
            caption: 'Amaka in uniform',
            media: img('classroom-uniform'),
          },
        ],
        options: [
          { id: 'opt-market', type: 'text', value: 'Market' },
          { id: 'opt-school', type: 'text', value: 'School' },
          { id: 'opt-park', type: 'text', value: 'Park' },
        ],
      },
      {
        id: 'q-farm-passage',
        order: 4,
        text: 'What did the child feed?',
        question_type: 'single_choice',
        layout: 'passage_comprehension_choice',
        point: '1.00',
        fln_level: 4,
        subskill_name: 'Simple inference',
        contents: [
          { type: 'image', display_order: 1, caption: 'A day at the farm', media: img('farm') },
          {
            type: 'text',
            display_order: 2,
            text_content:
              "On Saturday, Tom went to visit his uncle's farm. The sun was shining brightly in the sky. He saw many animals during his visit. First, he saw a big brown cow chewing grass near the fence.",
          },
          {
            type: 'text',
            display_order: 3,
            text_content:
              'Then, he walked over to the barn. His uncle gave him a small bucket of seeds. Tom carefully threw the seeds on the ground, and soon, five happy chickens ran over to eat them.',
          },
        ],
        options: [
          { id: 'opt-cow', type: 'text', value: 'Cow', media: img('cow') },
          { id: 'opt-chickens', type: 'text', value: 'Chickens', media: img('chicken') },
          { id: 'opt-goat', type: 'text', value: 'Goat', media: img('goat') },
        ],
      },
    ],
  },
  {
    id: 'sec-numbers',
    name: 'Numbers',
    domain: 'numeracy',
    order: 2,
    timer: null,
    questions: [
      {
        id: 'q-number-recognition',
        order: 1,
        text: 'Which number is this?',
        question_type: 'single_choice',
        layout: 'media_grid_choice',
        point: '1.00',
        fln_level: 1,
        subskill_name: 'Number identification',
        contents: [{ type: 'text', display_order: 1, text_content: '7' }],
        options: [
          { id: 'opt-four', type: 'text', value: 'FOUR' },
          { id: 'opt-nine', type: 'text', value: 'NINE' },
          { id: 'opt-seven', type: 'text', value: 'SEVEN' },
          { id: 'opt-one', type: 'text', value: 'ONE' },
        ],
      },
      {
        id: 'q-place-value',
        order: 2,
        text: 'How many tens and ones are in 34?',
        question_type: 'single_choice',
        layout: 'media_list_choice',
        point: '1.00',
        fln_level: 3,
        subskill_name: 'Place value',
        contents: [],
        options: [
          { id: 'opt-3t4o', type: 'text', value: '3 tens + 4 ones' },
          { id: 'opt-4t3o', type: 'text', value: '4 tens + 3 ones' },
        ],
      },
      {
        id: 'q-more-group',
        order: 3,
        text: 'Which group has MORE?',
        question_type: 'single_choice',
        layout: 'comparison_panel_choice',
        point: '1.00',
        fln_level: 1,
        subskill_name: 'Quantity comparison',
        contents: [],
        options: [
          { id: 'opt-group-a', type: 'text', value: 'Group A' },
          { id: 'opt-group-b', type: 'text', value: 'Group B' },
        ],
      },
      {
        id: 'q-addition',
        order: 4,
        text: 'What is 2 + 3?',
        question_type: 'single_choice',
        layout: 'media_grid_choice',
        point: '1.00',
        fln_level: 2,
        subskill_name: 'Addition',
        contents: [],
        options: [
          { id: 'opt-4', type: 'text', value: '4' },
          { id: 'opt-5', type: 'text', value: '5' },
          { id: 'opt-6', type: 'text', value: '6' },
          { id: 'opt-7', type: 'text', value: '7' },
        ],
      },
    ],
  },
];

function img(seedName: string): { id: string; url: string; type: string } {
  return { id: `media-${seedName}`, url: `/mock-assets/${seedName}.svg`, type: 'image' };
}

function freshSections(): SectionRuntime[] {
  return SECTION_SEEDS.map((section, index) => ({
    ...section,
    status: index === 0 ? 'unlocked' : 'locked',
    started_at: null,
    submitted_at: null,
    expires_at: null,
  }));
}

interface RunnerState {
  session: string | null;
  sections: SectionRuntime[];
  verifyAttempts: number;
  forceExpiredNextStart: boolean;
}

const state: RunnerState = {
  session: null,
  sections: freshSections(),
  verifyAttempts: 0,
  forceExpiredNextStart: false,
};

/** Called from `afterEach` in `src/test/setup.ts` so no test's sitting leaks into the next. */
export function resetRunnerState(): void {
  state.session = null;
  state.sections = freshSections();
  state.verifyAttempts = 0;
  state.forceExpiredNextStart = false;
}

export function verifyAttempt(): { ok: boolean; rateLimited: boolean } {
  state.verifyAttempts += 1;
  if (state.verifyAttempts > VERIFY_RATE_LIMIT) {
    return { ok: false, rateLimited: true };
  }
  return { ok: true, rateLimited: false };
}

export function startNewSitting(): { session: string; expires_at: string } {
  state.session = MOCK_SITTING_SESSION;
  return {
    session: state.session,
    expires_at: new Date(Date.now() + SITTING_TTL_MS).toISOString(),
  };
}

export function currentSession(): string | null {
  return state.session;
}

/** Test hook: simulate a `401` — the sitting is over from the server's point of view. */
export function invalidateSession(): void {
  state.session = null;
}

/** Test hook: the next `start/` hands back a section whose clock already ran out (B.5). */
export function forceExpiredOnNextStart(): void {
  state.forceExpiredNextStart = true;
}

export function getSections(): SectionRuntime[] {
  return state.sections;
}

export function findSection(sectionId: string): SectionRuntime | undefined {
  return state.sections.find((section) => section.id === sectionId);
}

export function startSection(sectionId: string): SectionRuntime | null {
  const section = findSection(sectionId);
  if (!section) return null;
  if (section.status === 'submitted') return null;
  if (section.status === 'locked') return null;

  if (section.status === 'unlocked') {
    section.status = 'in_progress';
    section.started_at = new Date().toISOString();
    if (section.timer) {
      const [h, m, s] = section.timer.split(':').map(Number);
      const durationMs = ((h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0)) * 1000;
      const expiresAt = state.forceExpiredNextStart ? Date.now() - 1000 : Date.now() + durationMs;
      section.expires_at = new Date(expiresAt).toISOString();
    }
    state.forceExpiredNextStart = false;
  }
  // Resuming an `in_progress` section: `expires_at` is left untouched — the
  // clock does not restart (B.5).
  return section;
}

export function submitSection(sectionId: string): SectionRuntime | null {
  const section = findSection(sectionId);
  if (section?.status !== 'in_progress') return null;

  section.status = 'submitted';
  section.submitted_at = new Date().toISOString();

  const nextSection = state.sections.find((candidate) => candidate.order === section.order + 1);
  if (nextSection?.status === 'locked') {
    nextSection.status = 'unlocked';
  }

  const finished = state.sections.every((candidate) => candidate.status === 'submitted');
  return finished ? { ...section, status: 'submitted' } : section;
}

export function allSubmitted(): boolean {
  return state.sections.every((section) => section.status === 'submitted');
}
