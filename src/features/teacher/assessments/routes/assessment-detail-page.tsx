import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { buttonClasses } from '@/components/ui/button-variants';
import { ErrorState } from '@/components/ui/error-state';
import { ClipboardIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { assessmentQuery, coverageQuery } from '@/features/teacher/assessments/api/queries';
import { CoveragePanel } from '@/features/teacher/assessments/components/coverage-panel';
import { ASSESSMENT_STATUS_CLASS, ASSESSMENT_STATUS_LABEL } from '@/lib/api/format';
import { DOMAIN_LABEL } from '@/lib/fln/level';

/**
 * One paper's own page — `frontend-integration.md` §7.4: "Extend. Publish
 * control, the code, coverage summary."
 *
 * Publishing itself happens inside the authoring workspace (`create-assessment-page`,
 * step 5) — this page is where a teacher lands afterwards, or returns to check
 * a paper's state. Editing a still-draft paper reopens the same workspace at
 * `?assessmentId=`, so there is exactly one place sections and questions are
 * ever edited.
 */
export function AssessmentDetailPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const assessment = useQuery({
    ...assessmentQuery(assessmentId ?? ''),
    enabled: Boolean(assessmentId),
  });
  const coverage = useQuery({
    ...coverageQuery(assessmentId ?? ''),
    enabled: Boolean(assessmentId),
  });

  if (assessment.isPending) return <PageSpinner />;
  if (assessment.isError || !assessment.data) {
    return <ErrorState error={assessment.error} onRetry={() => void assessment.refetch()} />;
  }

  const data = assessment.data;
  const isDraft = data.status === 'draft';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={data.name}
        subtitle={data.instructions || 'No instructions written yet.'}
        actions={
          isDraft ? (
            <Link
              to={`${paths.teacher.assessments.create}?assessmentId=${data.id}`}
              className={buttonClasses()}
            >
              Continue building
            </Link>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link
                to={paths.teacher.assessments.roster(data.id)}
                className={buttonClasses('secondary')}
              >
                Printable roster
              </Link>
              <Link to={paths.teacher.assessments.assignFor(data.id)} className={buttonClasses()}>
                Assign to students
              </Link>
            </div>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-koyi-sm px-2.5 py-1 text-xs font-semibold ${ASSESSMENT_STATUS_CLASS[data.status]}`}
        >
          {ASSESSMENT_STATUS_LABEL[data.status]}
        </span>
        {data.code && (
          <span className="border-koyi-border text-koyi-text inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold tracking-widest">
            <ClipboardIcon className="size-4" />
            {data.code}
          </span>
        )}
      </div>

      <div className="border-koyi-border rounded-koyi-md border p-5">
        <p className="text-koyi-text mb-3 text-sm font-semibold">Sections</p>
        {data.sections.length === 0 ? (
          <p className="text-koyi-muted text-sm">No sections yet.</p>
        ) : (
          <ul className="divide-koyi-border divide-y">
            {data.sections.map((section) => (
              <li key={section.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-koyi-text">
                  {section.name} · {DOMAIN_LABEL[section.domain]}
                </span>
                <span className="text-koyi-muted">
                  {section.question_count} question{section.question_count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {coverage.data && (
        <div className="border-koyi-border rounded-koyi-md border p-5">
          <p className="text-koyi-text mb-3 text-sm font-semibold">Coverage</p>
          <CoveragePanel coverage={coverage.data} />
        </div>
      )}
    </div>
  );
}
