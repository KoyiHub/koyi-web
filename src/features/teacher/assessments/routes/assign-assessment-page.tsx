import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { CheckCircleIcon, MailIcon, UsersIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import type {
  Assignment,
  SendLinksResult,
} from '@/features/teacher/assessments/api/assignment.schema';
import {
  useAssignStudents,
  useSendGuardianLink,
  useSendGuardianLinks,
  useWithdrawAssignment,
} from '@/features/teacher/assessments/api/mutations';
import {
  assessmentQuery,
  assignableStudentsQuery,
  assignmentsQuery,
} from '@/features/teacher/assessments/api/queries';
import { ApiError } from '@/lib/api/errors';
import { ASSIGNMENT_STATUS_CLASS, ASSIGNMENT_STATUS_LABEL } from '@/lib/api/format';

/**
 * Assigning a published paper to students — `frontend-integration.md` §5.4,
 * §7.4. Two ways of saying who: individually, or everyone. There is no
 * "by class" mode — §5.6 confirms a teacher has exactly one homeroom class
 * (`Teacher.school_class` is a single field, not a list), so "assign my
 * class" and "assign everyone I teach" are the same set; a separate mode
 * would also need class UUIDs the teacher-scoped student list doesn't
 * carry (`school_class` there is a plain string, §5.6). Assigning twice is
 * a deliberate no-op, so the result banner only speaks up when the created
 * count is lower than the selection.
 */
type Mode = 'individual' | 'everyone';

export function AssignAssessmentPage() {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId') ?? '';

  const assessment = useQuery({ ...assessmentQuery(assessmentId), enabled: Boolean(assessmentId) });
  const assignments = useQuery({
    ...assignmentsQuery(assessmentId),
    enabled: Boolean(assessmentId),
  });

  const [mode, setMode] = useState<Mode>('individual');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [assignResult, setAssignResult] = useState<string | null>(null);
  const [linkResult, setLinkResult] = useState<SendLinksResult | null>(null);

  const pickerStudents = useQuery({
    ...assignableStudentsQuery({ search, page }),
    enabled: mode === 'individual',
  });

  const assign = useAssignStudents(assessmentId);
  const withdraw = useWithdrawAssignment(assessmentId);
  const sendLink = useSendGuardianLink(assessmentId);
  const sendLinks = useSendGuardianLinks(assessmentId);

  if (!assessmentId) {
    return (
      <EmptyState
        title="No assessment chosen"
        description="Open a published paper and choose Assign to students."
        icon={<UsersIcon className="size-6" />}
        action={
          <Link to={paths.teacher.assessments.list} className="text-koyi-primary text-sm font-bold">
            Back to the library
          </Link>
        }
      />
    );
  }

  if (assessment.isPending) return <PageSpinner />;
  if (assessment.isError || !assessment.data) {
    return <ErrorState error={assessment.error} onRetry={() => void assessment.refetch()} />;
  }

  function handleAssign() {
    setAssignResult(null);
    const input =
      mode === 'everyone' ? { all_my_students: true } : { student_ids: selectedStudentIds };

    assign.mutate(input, {
      onSuccess: (created) => {
        const selectedCount = mode === 'individual' ? selectedStudentIds.length : created.length;
        setAssignResult(
          created.length === 0
            ? 'Everyone selected was already assigned.'
            : selectedCount > created.length
              ? `Assigned ${String(created.length)} of ${String(selectedCount)} selected — the rest were already assigned, outside your school, or disabled.`
              : `Assigned ${String(created.length)} student${created.length === 1 ? '' : 's'}.`,
        );
        setSelectedStudentIds([]);
      },
    });
  }

  function handleSendLinks(ids: string[]) {
    setLinkResult(null);
    sendLinks.mutate(ids, { onSuccess: setLinkResult });
  }

  const rows = assignments.data ?? [];
  const unsentIds = rows.filter((row) => !row.link_sent_at).map((row) => row.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={`Assign "${assessment.data.name}"`}
        subtitle={
          assessment.data.code
            ? `Paper code ${assessment.data.code} — children need their own personal code too.`
            : ''
        }
        actions={
          <Link
            to={paths.teacher.assessments.roster(assessmentId)}
            className="text-koyi-primary text-sm font-bold hover:underline"
          >
            Printable roster →
          </Link>
        }
      />

      <Card title="Who sits this paper">
        <SegmentedControl
          label="Assignment mode"
          value={mode}
          onChange={(next) => {
            setMode(next);
            setAssignResult(null);
          }}
          options={[
            { value: 'individual', label: 'Individual students' },
            { value: 'everyone', label: 'Everyone I teach' },
          ]}
          className="mb-5"
        />

        {mode === 'individual' && (
          <div className="space-y-3">
            <SearchInput
              label="Search students"
              placeholder="Search by name or code"
              value={search}
              onChange={(next) => {
                setSearch(next);
                setPage(1);
              }}
            />
            {pickerStudents.isPending && <PageSpinner />}
            {pickerStudents.data && (
              <>
                <div className="divide-koyi-border divide-y">
                  {pickerStudents.data.results.map((student) => (
                    <label key={student.id} className="flex items-center gap-3 px-1 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={(event) => {
                          setSelectedStudentIds((current) =>
                            event.target.checked
                              ? [...current, student.id]
                              : current.filter((id) => id !== student.id),
                          );
                        }}
                        className="size-4"
                      />
                      <span className="text-koyi-text font-semibold">{student.full_name}</span>
                      <span className="text-koyi-muted">
                        {student.student_id} · {student.school_class}
                      </span>
                    </label>
                  ))}
                </div>
                <Pagination
                  page={pickerStudents.data.page}
                  pageCount={pickerStudents.data.num_pages}
                  onPageChange={setPage}
                  totalCount={pickerStudents.data.count}
                  pageSize={pickerStudents.data.page_size}
                  itemLabel="students"
                />
                {selectedStudentIds.length > 0 && (
                  <p className="text-koyi-muted text-sm">{selectedStudentIds.length} selected</p>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'everyone' && (
          <p className="text-koyi-muted text-sm">
            Assigns every student in your classes, including any added later.
          </p>
        )}

        <Button
          onClick={handleAssign}
          isLoading={assign.isPending}
          disabled={mode === 'individual' && selectedStudentIds.length === 0}
          className="mt-5"
        >
          Assign
        </Button>

        {assignResult && (
          <p className="text-koyi-text mt-3 flex items-center gap-2 text-sm">
            <CheckCircleIcon className="text-koyi-success size-4 shrink-0" />
            {assignResult}
          </p>
        )}
        {assign.isError && (
          <p className="text-koyi-danger mt-3 text-sm">
            {assign.error instanceof ApiError ? assign.error.message : 'Could not assign.'}
          </p>
        )}
      </Card>

      <Card
        title="Assigned children"
        subtitle="Every assigned child gets their own code — send it by email, or read it off the printable roster."
        action={
          unsentIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={sendLinks.isPending}
              onClick={() => {
                handleSendLinks(unsentIds);
              }}
            >
              <MailIcon className="size-4" />
              Send links to everyone unsent ({unsentIds.length})
            </Button>
          )
        }
      >
        {linkResult && (
          <div className="bg-koyi-surface mb-4 rounded-md p-4 text-sm">
            <p className="text-koyi-text font-semibold">
              Sent {linkResult.sent} guardian link{linkResult.sent === 1 ? '' : 's'}.
            </p>
            {linkResult.failed.length > 0 && (
              <ul className="text-koyi-danger mt-2 space-y-1">
                {linkResult.failed.map((failure) => (
                  <li key={failure.assignment_id}>
                    {failure.student_name} — {failure.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {assignments.isPending && <PageSpinner />}

        {assignments.data && rows.length === 0 && (
          <EmptyState
            title="Nobody assigned yet"
            description="Choose a class, some students, or everyone above."
            icon={<UsersIcon className="size-6" />}
          />
        )}

        {rows.length > 0 && (
          <ul className="divide-koyi-border divide-y">
            {rows.map((row) => (
              <AssignmentRow
                key={row.id}
                row={row}
                onWithdraw={() => void withdraw.mutateAsync(row.id)}
                onSendLink={() => {
                  setLinkResult(null);
                  sendLink.mutate(row.id, { onSuccess: setLinkResult });
                }}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AssignmentRow({
  row,
  onWithdraw,
  onSendLink,
}: {
  row: Assignment;
  onWithdraw: () => void;
  onSendLink: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-koyi-text font-semibold">{row.student_name}</p>
        <p className="text-koyi-muted text-xs">
          {row.student_id} · {row.school_class} · code{' '}
          <span className="font-mono tracking-wider">{row.code}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-koyi-sm px-2.5 py-1 text-xs font-semibold ${ASSIGNMENT_STATUS_CLASS[row.status]}`}
        >
          {ASSIGNMENT_STATUS_LABEL[row.status]}
        </span>

        <Button variant="secondary" size="sm" onClick={onSendLink}>
          <MailIcon className="size-4" />
          {row.link_sent_at ? 'Send again' : 'Send link'}
        </Button>

        {row.status === 'not_started' && (
          <Button variant="ghost" size="sm" onClick={onWithdraw}>
            Withdraw
          </Button>
        )}
      </div>
    </li>
  );
}
