/**
 * The in-memory store behind `/v1/teacher/assessments/{id}/assignments/*` —
 * `frontend-integration.md` §5.4. Keyed per assessment, since assigning twice
 * is a deliberate no-op and withdrawal only touches one paper's roster.
 *
 * The mock world currently has one class (`CLASS_NAME` in `teacher-seed.ts`),
 * so `class_ids` and `all_my_students` resolve to the same 32 children —
 * enough to exercise both assignment modes without a second class fixture.
 */
import { mintCode } from '@/mocks/data/assessment-seed';
import { CLASS_NAME, students } from '@/mocks/data/teacher-seed';

export const MOCK_CLASS_ID = 'cls-primary-4a';

export interface TeacherClass {
  id: string;
  name: string;
  student_count: number;
}

export function listClasses(): TeacherClass[] {
  return [{ id: MOCK_CLASS_ID, name: CLASS_NAME, student_count: students.length }];
}

export interface AssignableStudent {
  id: string;
  full_name: string;
  student_code: string;
  class_name: string;
}

export function listAssignableStudents(search: string): AssignableStudent[] {
  const term = search.trim().toLowerCase();
  return students
    .filter(
      (student) =>
        !term || `${student.full_name} ${student.student_code}`.toLowerCase().includes(term),
    )
    .map((student) => ({
      id: student.id,
      full_name: student.full_name,
      student_code: student.student_code,
      class_name: student.class_name,
    }));
}

/**
 * A quarter of the roster has no guardian email on file — enough that
 * "send links" always has real failures to report, matching §5.4's rule that
 * those children need to be named rather than assumed reached.
 */
function hasGuardianEmail(studentId: string): boolean {
  const index = students.findIndex((student) => student.id === studentId);
  return index % 4 !== 0;
}

export interface StoredAssignment {
  id: string;
  student_id: string;
  code: string;
  status: 'not_started' | 'in_progress' | 'finished' | 'graded';
  started_at: string | null;
  submitted_at: string | null;
  link_sent_at: string | null;
}

const store = new Map<string, StoredAssignment[]>();
let counter = 0;

/** Called from `afterEach` in `src/test/setup.ts` so one test's assignments don't leak into the next. */
export function resetAssignmentState(): void {
  store.clear();
  counter = 0;
}

function assignmentsFor(assessmentId: string): StoredAssignment[] {
  let list = store.get(assessmentId);
  if (!list) {
    list = [];
    store.set(assessmentId, list);
  }
  return list;
}

export function getAssignments(assessmentId: string): StoredAssignment[] {
  return assignmentsFor(assessmentId);
}

export function findAssignment(
  assessmentId: string,
  assignmentId: string,
): StoredAssignment | undefined {
  return assignmentsFor(assessmentId).find((assignment) => assignment.id === assignmentId);
}

/**
 * Resolves `student_ids` / `class_ids` / `all_my_students` to a set of seed
 * student ids, then assigns only the ones not already assigned — assigning
 * twice is a deliberate no-op, so this returns just the newly created rows.
 */
export function assignStudents(
  assessmentId: string,
  input: {
    student_ids?: string[] | undefined;
    class_ids?: string[] | undefined;
    all_my_students?: boolean | undefined;
  },
): StoredAssignment[] {
  const list = assignmentsFor(assessmentId);
  const already = new Set(list.map((assignment) => assignment.student_id));

  const targetIds = new Set<string>();
  if (input.all_my_students) {
    students.forEach((student) => targetIds.add(student.id));
  }
  if (input.class_ids?.includes(MOCK_CLASS_ID)) {
    students.forEach((student) => targetIds.add(student.id));
  }
  input.student_ids?.forEach((id) => {
    if (students.some((student) => student.id === id)) targetIds.add(id);
  });

  const created: StoredAssignment[] = [];
  for (const studentId of targetIds) {
    if (already.has(studentId)) continue;
    counter += 1;
    const assignment: StoredAssignment = {
      id: `asn-${String(counter)}`,
      student_id: studentId,
      code: mintCode(),
      status: 'not_started',
      started_at: null,
      submitted_at: null,
      link_sent_at: null,
    };
    list.push(assignment);
    created.push(assignment);
  }
  return created;
}

export function withdrawAssignment(
  assessmentId: string,
  assignmentId: string,
): { ok: true } | { ok: false; message: string } {
  const list = assignmentsFor(assessmentId);
  const assignment = list.find((entry) => entry.id === assignmentId);
  if (!assignment) return { ok: false, message: 'That assignment does not exist.' };
  if (assignment.status !== 'not_started') {
    return { ok: false, message: 'This child has already started — their work would go with it.' };
  }
  store.set(
    assessmentId,
    list.filter((entry) => entry.id !== assignmentId),
  );
  return { ok: true };
}

export interface SendLinkResult {
  sent: number;
  failed: { assignment_id: string; student_name: string; reason: string }[];
}

export function sendGuardianLinks(assessmentId: string, assignmentIds: string[]): SendLinkResult {
  const list = assignmentsFor(assessmentId);
  const result: SendLinkResult = { sent: 0, failed: [] };

  for (const assignmentId of assignmentIds) {
    const assignment = list.find((entry) => entry.id === assignmentId);
    if (!assignment) continue;
    const student = students.find((entry) => entry.id === assignment.student_id);

    if (!student || !hasGuardianEmail(assignment.student_id)) {
      result.failed.push({
        assignment_id: assignment.id,
        student_name: student?.full_name ?? 'Unknown student',
        reason: 'No guardian email on file.',
      });
      continue;
    }

    assignment.link_sent_at = new Date().toISOString();
    result.sent += 1;
  }

  return result;
}
