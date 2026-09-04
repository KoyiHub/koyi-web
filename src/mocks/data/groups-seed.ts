/**
 * The in-memory store behind `/v1/teacher/groups/*` and the lesson-plan
 * endpoints — `frontend-integration.md` §5.6. No JSON example is given for
 * the group/member response shapes (only the `POST` create body and prose),
 * so this mock is written directly against this client's own reading of
 * that prose — see the comment at the top of `group.schema.ts`.
 *
 * Membership here is curated by name, not computed live from criteria
 * against real FLN levels: the seed world doesn't track per-student FLN
 * levels outside the school-admin surface, so inventing that machinery for
 * a mock would risk asserting a contract the guide never gave. The criteria
 * shown are illustrative of what actually placed these children.
 */
import { students } from '@/mocks/data/teacher-seed';

export type LessonPlanStatus = 'ready' | 'fallback' | 'failed' | 'generating';

export interface SeedGroupMember {
  student_id: string;
  full_name: string;
  join_reason: 'matched' | 'added';
  joined_at: string;
  left_at: string | null;
}

export interface SeedGroup {
  id: string;
  name: string;
  domain: 'literacy' | 'numeracy';
  resource_tier: 'minimal' | 'basic' | 'equipped';
  criteria: Record<string, unknown>[];
  stable_until: string;
  archived: boolean;
  members: SeedGroupMember[];
}

function findStudentId(fullName: string): string {
  return students.find((student) => student.full_name === fullName)?.id ?? '';
}

function member(fullName: string, reason: 'matched' | 'added', joinedAt: string): SeedGroupMember {
  return {
    student_id: findStudentId(fullName),
    full_name: fullName,
    join_reason: reason,
    joined_at: joinedAt,
    left_at: null,
  };
}

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter)}`;
}

function initialGroups(): SeedGroup[] {
  return [
    {
      id: 'grp-word-reading',
      name: 'Word Reading Focus',
      domain: 'literacy',
      resource_tier: 'basic',
      criteria: [{ type: 'level', level: 2, comparator: 'lte' }],
      stable_until: '2026-09-01T00:00:00Z',
      archived: false,
      members: [
        member('Fatima Bello', 'matched', '2026-08-18T09:00:00Z'),
        member('Samuel Ojo', 'matched', '2026-08-18T09:00:00Z'),
        member('Blessing Eze', 'matched', '2026-08-18T09:00:00Z'),
        member('Amina Yusuf', 'added', '2026-08-20T10:00:00Z'),
      ],
    },
    {
      id: 'grp-subtraction-support',
      name: 'Subtraction Support',
      domain: 'numeracy',
      resource_tier: 'minimal',
      criteria: [{ type: 'level', level: 2, comparator: 'lte' }],
      // Stability window still open, and below 4 children — flagged, not dissolved.
      stable_until: '2026-09-10T00:00:00Z',
      archived: false,
      members: [
        member('Samuel Ojo', 'matched', '2026-08-14T14:10:00Z'),
        member('Emeka Nnamdi', 'matched', '2026-08-14T14:10:00Z'),
      ],
    },
  ];
}

export const groups: SeedGroup[] = initialGroups();

/** Called from `afterEach` in `src/test/setup.ts` so one test's edits don't leak into the next. */
export function resetGroupsState(): void {
  groups.splice(0, groups.length, ...initialGroups());
  groupPlans.clear();
  studentPlans.clear();
}

export function findGroup(groupId: string): SeedGroup | undefined {
  return groups.find((group) => group.id === groupId && !group.archived);
}

export function archiveGroup(groupId: string): boolean {
  const group = groups.find((entry) => entry.id === groupId);
  if (!group) return false;
  group.archived = true;
  return true;
}

export function addMember(groupId: string, studentId: string): SeedGroupMember | null {
  const group = findGroup(groupId);
  const student = students.find((entry) => entry.id === studentId);
  if (!group || !student) return null;
  if (group.members.some((entry) => entry.student_id === studentId && entry.left_at === null)) {
    return group.members.find((entry) => entry.student_id === studentId) ?? null;
  }
  const newMember = member(student.full_name, 'added', new Date().toISOString());
  group.members.push(newMember);
  return newMember;
}

export function removeMember(groupId: string, studentId: string): boolean {
  const group = findGroup(groupId);
  const current = group?.members.find(
    (entry) => entry.student_id === studentId && entry.left_at === null,
  );
  if (!current) return false;
  current.left_at = new Date().toISOString();
  return true;
}

/* -------------------------------------------------------------------------- */
/* Lesson plans                                                               */
/* -------------------------------------------------------------------------- */

export interface SeedLessonPlanContent {
  objective: string;
  duration_minutes: number;
  materials: string[];
  steps: { teacher_does: string; children_do: string; minutes: number }[];
  checks: string[];
  common_errors: string[];
  success_criteria: string[];
  note: string | null;
}

export interface SeedLessonPlan {
  id: string;
  status: LessonPlanStatus;
  content: SeedLessonPlanContent | null;
  member_snapshot: { student_id: string; full_name: string }[];
  was_helpful: boolean | null;
  opened_at: string | null;
  generated_at: string;
}

const groupPlans = new Map<string, SeedLessonPlan>();
const studentPlans = new Map<string, SeedLessonPlan>();

function canonicalPlan(groupId: string, status: LessonPlanStatus): SeedLessonPlan {
  const group = groups.find((entry) => entry.id === groupId);
  return {
    id: id('plan'),
    status,
    content: {
      objective:
        group?.domain === 'numeracy'
          ? 'Build confidence borrowing across zero in two-digit subtraction.'
          : 'Blend two-syllable words fluently, moving from sounds to whole words.',
      duration_minutes: 15,
      materials: ['Printed word/number cards', 'Whiteboard'],
      steps: [
        {
          teacher_does: 'Model one worked example aloud.',
          children_do: 'Watch and repeat.',
          minutes: 5,
        },
        {
          teacher_does: 'Guide two paired examples.',
          children_do: 'Work in pairs, teacher circulates.',
          minutes: 7,
        },
        {
          teacher_does: 'Pose one independent check.',
          children_do: 'Complete it alone, hand in.',
          minutes: 3,
        },
      ],
      checks: ['Can the child complete the independent check unaided?'],
      common_errors: ['Skipping the regrouping step under time pressure.'],
      success_criteria: ['3 of 4 paired examples correct without a prompt.'],
      note:
        status === 'fallback'
          ? 'Adapted plan failed to generate — this is the canonical plan.'
          : null,
    },
    member_snapshot: (group?.members ?? [])
      .filter((entry) => entry.left_at === null)
      .map((entry) => ({ student_id: entry.student_id, full_name: entry.full_name })),
    was_helpful: null,
    opened_at: null,
    generated_at: new Date().toISOString(),
  };
}

export function getGroupLessonPlan(groupId: string): SeedLessonPlan | null {
  const existing = groupPlans.get(groupId);
  if (existing?.opened_at === null) existing.opened_at = new Date().toISOString();
  return existing ?? null;
}

export function generateGroupLessonPlan(groupId: string): SeedLessonPlan {
  // The second group in the seed exercises the `fallback` path deliberately.
  const status: LessonPlanStatus = groupId === 'grp-subtraction-support' ? 'fallback' : 'ready';
  const plan = canonicalPlan(groupId, status);
  groupPlans.set(groupId, plan);
  return plan;
}

export function setLessonPlanFeedback(lessonPlanId: string, wasHelpful: boolean): boolean {
  for (const plan of [...groupPlans.values(), ...studentPlans.values()]) {
    if (plan.id === lessonPlanId) {
      plan.was_helpful = wasHelpful;
      return true;
    }
  }
  return false;
}

/** Only one seed student has a personal note — a `404` (group plan covers them) is the normal case. */
export function getStudentLessonPlan(studentId: string): SeedLessonPlan | null {
  if (studentId !== findStudentId('Fatima Bello')) return null;
  const existing = studentPlans.get(studentId);
  if (existing) {
    existing.opened_at ??= new Date().toISOString();
    return existing;
  }
  const plan: SeedLessonPlan = {
    id: id('plan-student'),
    status: 'ready',
    content: {
      objective: 'A short daily decoding routine, alongside the Word Reading Focus group plan.',
      duration_minutes: 5,
      materials: ['Word cards'],
      steps: [
        {
          teacher_does: 'Read a word aloud, syllable by syllable.',
          children_do: 'Repeat and blend.',
          minutes: 5,
        },
      ],
      checks: [],
      common_errors: [],
      success_criteria: [],
      note: 'Diverges from the group plan: needs extra syllable-level practice.',
    },
    member_snapshot: [],
    was_helpful: null,
    opened_at: new Date().toISOString(),
    generated_at: new Date().toISOString(),
  };
  studentPlans.set(studentId, plan);
  return plan;
}
