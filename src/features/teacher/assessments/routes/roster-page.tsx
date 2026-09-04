import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { PrinterIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { rosterQuery } from '@/features/teacher/assessments/api/queries';
import { ASSIGNMENT_STATUS_LABEL } from '@/lib/api/format';

/**
 * The printable code sheet — `frontend-integration.md` §5.4, §7.4. With a
 * code per child there is no longer one thing to write on a board, so this is
 * the classroom path: the paper code once at the top, then a slip per child,
 * legible at arm's length and easy to cut apart.
 */
export function RosterPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const roster = useQuery({ ...rosterQuery(assessmentId ?? ''), enabled: Boolean(assessmentId) });

  if (roster.isPending) return <PageSpinner />;
  if (roster.isError || !roster.data) {
    return <ErrorState error={roster.error} onRetry={() => void roster.refetch()} />;
  }

  const data = roster.data;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-koyi-text text-2xl font-bold">{data.assessment_name}</h1>
          <p className="text-koyi-muted text-sm">One slip per child — cut along the lines.</p>
        </div>
        <Button
          onClick={() => {
            window.print();
          }}
        >
          <PrinterIcon className="size-4" />
          Print
        </Button>
      </div>

      <div className="border-koyi-border rounded-koyi-md mb-6 border p-6 text-center print:rounded-none print:border-2 print:border-black">
        <p className="text-koyi-muted text-xs font-semibold tracking-widest uppercase">
          Assessment code
        </p>
        <p className="font-display text-koyi-text mt-1 text-5xl font-extrabold tracking-[0.3em]">
          {data.assessment_code}
        </p>
        <p className="text-koyi-muted mt-2 text-sm">{data.assessment_name}</p>
      </div>

      {data.rows.length === 0 ? (
        <p className="text-koyi-muted text-sm">No children are assigned to this paper yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
          {data.rows.map((row) => (
            <div
              key={row.code}
              className="border-koyi-border rounded-koyi-md flex items-center justify-between gap-3 border border-dashed p-4 print:break-inside-avoid print:rounded-none"
            >
              <div className="min-w-0">
                <p className="text-koyi-text truncate font-bold">{row.student_name}</p>
                <p className="text-koyi-muted text-xs">
                  {row.student_id} · {row.school_class}
                </p>
                <p className="text-koyi-muted text-xs print:hidden">
                  {ASSIGNMENT_STATUS_LABEL[row.status]}
                </p>
              </div>
              <p className="font-display text-koyi-text shrink-0 text-2xl font-extrabold tracking-widest">
                {row.code}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
