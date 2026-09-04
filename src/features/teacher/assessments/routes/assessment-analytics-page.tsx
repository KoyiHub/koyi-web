import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { AlertCircleIcon, ArrowRightIcon, SparklesIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import {
  analyticsQuery,
  assessmentQuery,
  resultsQuery,
} from '@/features/teacher/assessments/api/queries';
import { DataTable } from '@/features/teacher/components/data-table';
import { ASSIGNMENT_STATUS_CLASS, ASSIGNMENT_STATUS_LABEL } from '@/lib/api/format';
import { DOMAIN_LABEL, levelDistributionRows, levelLabel } from '@/lib/fln/level';

/**
 * Assessment analytics — `frontend-integration.md` §5.5, §7.4.
 *
 * Ordered the way the guide says to read it: `marking_status`/`warnings`
 * first (A.2 — a teacher opening this early is looking at settling numbers),
 * then `level_distribution` as the headline rather than an average
 * (both domains, every level keyed even at zero), the skill × level matrix,
 * `most_missed`, the narrative (null-safe throughout — A.3), and only then
 * the per-student results table. The results endpoint has no separate route
 * — the guide's own page table never adds one — so it lives here.
 */
const DOMAINS = ['literacy', 'numeracy'] as const;

export function AssessmentAnalyticsPage() {
  const { assessmentId = '' } = useParams();
  const assessment = useQuery({ ...assessmentQuery(assessmentId), enabled: Boolean(assessmentId) });
  const analytics = useQuery({ ...analyticsQuery(assessmentId), enabled: Boolean(assessmentId) });
  const results = useQuery({ ...resultsQuery(assessmentId), enabled: Boolean(assessmentId) });

  if (assessment.isPending || analytics.isPending) return <PageSpinner />;
  if (assessment.isError || !assessment.data) {
    return <ErrorState error={assessment.error} onRetry={() => void assessment.refetch()} />;
  }
  if (analytics.isError || !analytics.data) {
    return <ErrorState error={analytics.error} onRetry={() => void analytics.refetch()} />;
  }

  const data = analytics.data;
  const maxDistribution = Math.max(
    1,
    ...DOMAINS.flatMap((domain) =>
      levelDistributionRows(data.level_distribution[domain]).map((row) => row.students),
    ),
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title={assessment.data.name}
        subtitle={`${String(data.participation.submitted)} of ${String(data.participation.assigned)} assigned children have submitted.`}
        actions={
          <Link
            to={paths.teacher.assessments.reviewQueue(assessmentId)}
            className="text-koyi-primary text-sm font-bold hover:underline"
          >
            Review queue →
          </Link>
        }
      />

      {(data.marking_status.pending > 0 || data.warnings.length > 0) && (
        <div className="rounded-koyi-md space-y-1.5 border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertCircleIcon className="size-4 shrink-0" />
            {data.marking_status.marked} of {data.marking_status.total} answers marked
            {data.marking_status.pending > 0 &&
              ` — ${String(data.marking_status.pending)} still settling`}
          </p>
          {data.warnings.map((warning) => (
            <p key={warning} className="text-sm text-amber-800">
              {warning}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {DOMAINS.map((domain) => (
          <Card key={domain} title={`${DOMAIN_LABEL[domain]} — level distribution`}>
            <div className="space-y-3">
              {levelDistributionRows(data.level_distribution[domain]).map((row) => (
                <StatBar
                  key={row.level}
                  label={levelLabel(row.level)}
                  valueLabel={`${String(row.students)} ${row.students === 1 ? 'child' : 'children'}`}
                  percentage={(row.students / maxDistribution) * 100}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {data.skill_matrix.length > 0 && (
        <Card
          title="Skill × level matrix"
          subtitle="How many children passed each skill, at each level probed."
        >
          <DataTable
            caption="Skill by level pass rate"
            columns={[
              { key: 'skill', label: 'Skill' },
              { key: 'levels', label: 'Levels probed' },
            ]}
          >
            {data.skill_matrix.map((skill) => (
              <tr key={`${skill.domain}-${skill.skill_name}`} className="hover:bg-koyi-surface/60">
                <td className="px-5 py-3">
                  <p className="text-koyi-text font-semibold">{skill.skill_name}</p>
                  <p className="text-koyi-muted text-xs">{DOMAIN_LABEL[skill.domain]}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(skill.levels)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([level, counts]) => (
                        <span
                          key={level}
                          className="bg-koyi-surface text-koyi-text rounded-full px-2.5 py-1 text-xs font-medium"
                        >
                          L{level}: {counts.passed}/{counts.total}
                        </span>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}

      {data.most_missed.length > 0 && (
        <Card
          title="Most missed"
          subtitle="By subskill at a level — teachable, unlike a bare question number."
        >
          <ul className="space-y-2">
            {data.most_missed.map((entry) => (
              <li
                key={`${entry.subskill_name}-${String(entry.fln_level)}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-koyi-text">
                  {entry.subskill_name} at Level {entry.fln_level}
                </span>
                <span className="text-koyi-muted font-semibold">{entry.failed_pct}% missed</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.narrative && (
        <Card
          title="AI interpretation"
          icon={<SparklesIcon className="size-5" />}
          bodyClassName="space-y-3"
        >
          <p className="text-koyi-text text-sm leading-relaxed">{data.narrative.summary}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-koyi-muted text-xs font-bold uppercase">Needs attention</p>
              <p className="text-koyi-text text-sm">{data.narrative.attention}</p>
            </div>
            <div>
              <p className="text-koyi-muted text-xs font-bold uppercase">Strength</p>
              <p className="text-koyi-text text-sm">{data.narrative.strength}</p>
            </div>
          </div>
        </Card>
      )}

      <Card
        title="Every assigned child"
        subtitle="Progress, score and level — 'not yet submitted' is normal, not an error."
      >
        {results.isPending && <PageSpinner />}
        {results.data?.rows.length === 0 && (
          <p className="text-koyi-muted text-sm">Nobody is assigned to this paper yet.</p>
        )}
        {results.data && results.data.rows.length > 0 && (
          <DataTable
            caption="Results by student"
            columns={[
              { key: 'student', label: 'Student' },
              { key: 'status', label: 'Status' },
              { key: 'items', label: 'Items correct' },
              { key: 'score', label: 'Score', align: 'right' },
              { key: 'open', label: 'Open', align: 'right', labelHidden: true },
            ]}
          >
            {results.data.rows.map((row) => (
              <tr key={row.student_id} className="hover:bg-koyi-surface/60">
                <td className="px-5 py-3">
                  <p className="text-koyi-text font-semibold">{row.full_name}</p>
                  <p className="text-koyi-muted text-xs">{row.school_class}</p>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-koyi-sm px-2.5 py-1 text-xs font-semibold ${ASSIGNMENT_STATUS_CLASS[row.status]}`}
                  >
                    {ASSIGNMENT_STATUS_LABEL[row.status]}
                  </span>
                </td>
                <td className="text-koyi-muted px-5 py-3">
                  {row.items_correct} / {row.items_attempted}
                </td>
                <td className="text-koyi-text px-5 py-3 text-right font-bold">
                  {row.percentage ? `${row.percentage}%` : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  {(row.status === 'finished' || row.status === 'graded') && (
                    <Link
                      aria-label={`Review ${row.full_name}'s paper`}
                      to={paths.teacher.assessments.responses(assessmentId, row.student_id)}
                      className="text-koyi-primary inline-flex items-center gap-1 text-sm font-bold hover:underline"
                    >
                      Review
                      <ArrowRightIcon aria-hidden="true" className="size-4" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  );
}
