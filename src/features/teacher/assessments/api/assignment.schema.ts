import { z } from 'zod';

import { assignmentStatusSchema } from '@/lib/api/contracts';

/**
 * Assigning a paper and getting its codes to children —
 * `frontend-integration.md` §5.4.
 *
 * Each assignment carries **the child's own six-character code**. With a code
 * per child there is no longer one thing to write on a board, which is why the
 * printable roster exists and why guardian links exist beside it.
 *
 * The code is stored in the clear so a teacher can read it back to a child who
 * has lost theirs. It has no expiry of its own — it stops working when the
 * assessment closes.
 */

export const assignmentSchema = z.object({
  id: z.string(),
  student: z.string(),
  student_name: z.string(),
  student_id: z.string(),
  school_class: z.string(),
  /** The child's personal code, e.g. "9M4X2B". Unique within one paper. */
  code: z.string(),
  status: assignmentStatusSchema,
  started_at: z.string().nullable(),
  submitted_at: z.string().nullable(),
  /** When a guardian link was last emailed, or `null`. Drives send / send again. */
  link_sent_at: z.string().nullable().optional(),
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const assignmentListSchema = z.array(assignmentSchema);

/**
 * Who to assign to. At least one is required.
 *
 * Teachers think in classes far more often than in individuals, so all three
 * ways of saying who are accepted. Assigning twice is a deliberate no-op, which
 * is what makes adding a latecomer to an already-assigned class just work.
 */
export interface AssignInput {
  student_ids?: string[];
  class_ids?: string[];
  all_my_students?: boolean;
}

/**
 * `POST` returns **only the newly created** assignments. An empty array means
 * everyone named was already assigned — a normal outcome, not an error.
 *
 * Students outside the teacher's school, and disabled students, are silently
 * skipped. When the returned count is lower than what was selected, the UI says
 * so plainly rather than implying everyone was reached.
 */
export const createdAssignmentsSchema = z.array(assignmentSchema);

/** The printable code sheet. Render it print-first. */
export const rosterSchema = z.object({
  assessment_id: z.string(),
  assessment_name: z.string(),
  assessment_code: z.string(),
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  rows: z.array(
    z.object({
      student_name: z.string(),
      student_id: z.string(),
      school_class: z.string(),
      code: z.string(),
      status: assignmentStatusSchema,
    }),
  ),
});
export type Roster = z.infer<typeof rosterSchema>;

/**
 * The result of emailing guardian links.
 *
 * `guardian_email` is optional on a student, because many guardians will not
 * have one — so `failed` is the common and important half of this response. A
 * child who cannot be emailed needs their code printed instead, and the UI must
 * name them rather than failing silently.
 */
export const sendLinksResultSchema = z.object({
  sent: z.number(),
  failed: z.array(
    z.object({
      assignment_id: z.string(),
      student_name: z.string(),
      reason: z.string(),
    }),
  ),
});
export type SendLinksResult = z.infer<typeof sendLinksResultSchema>;
