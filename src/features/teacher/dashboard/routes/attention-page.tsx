import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { AlertCircleIcon, ArrowLeftIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import { analyticsRosterQuery, assessmentsQuery } from '@/features/teacher/assessments/api/queries';
import { DataTable } from '@/features/teacher/components/data-table';
import { DOMAIN_LABEL, domainLevelLabel } from '@/lib/fln/level';

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'literacy', label: 'Literacy' },
  { key: 'numeracy', label: 'Numeracy' },
  { key: 'gaps', label: 'Weak subskills' },
  { key: 'open', label: 'Open profile', align: 'right' as const, labelHidden: true },
];

const DOMAIN_OPTIONS = [
  { value: '', label: 'Both domains' },
  { value: 'literacy', label: DOMAIN_LABEL.literacy },
  { value: 'numeracy', label: DOMAIN_LABEL.numeracy },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Any level' },
  ...[1, 2, 3, 4, 5].map((level) => ({ value: String(level), label: `Level ${String(level)}` })),
];

/**
 * Who needs help — `frontend-integration.md` §5.5's `analytics/roster/`
 * endpoint, scoped to one assessment (there is no cross-assessment
 * "attention" endpoint; the dashboard's own capped preview is the only
 * other place this data shows up). Defaults to the most recently created
 * assessment, since that's usually the one a teacher just marked.
 */
export function AttentionPage() {
  const [assessmentId, setAssessmentId] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');

  const assessments = useQuery(assessmentsQuery({ page: 1 }));
  const effectiveAssessmentId = assessmentId || (assessments.data?.results[0]?.id ?? '');

  const roster = useQuery({
    ...analyticsRosterQuery(effectiveAssessmentId, {
      domain: domain || undefined,
      level: level || undefined,
    }),
    enabled: Boolean(effectiveAssessmentId),
  });

  const assessmentOptions = (assessments.data?.results ?? []).map((assessment) => ({
    value: assessment.id,
    label: assessment.name,
  }));

  return (
    <div className="space-y-6">
      <Link
        to={paths.teacher.dashboard}
        className="text-koyi-muted hover:text-koyi-text inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to dashboard
      </Link>

      <PageHeader
        title="Students needing attention"
        subtitle="Who a paper's results flag, and where the gap is — per assessment."
      />

      {assessments.data && assessmentOptions.length === 0 && (
        <EmptyState
          icon={<AlertCircleIcon className="size-6" />}
          title="No assessments yet"
          description="Publish and mark a paper to see who needs help."
        />
      )}

      {assessmentOptions.length > 0 && (
        <Card bodyClassName="grid gap-3 sm:grid-cols-3">
          <SelectField
            label="Assessment"
            options={assessmentOptions}
            value={effectiveAssessmentId}
            onChange={(event) => {
              setAssessmentId(event.target.value);
            }}
          />
          <SelectField
            label="Domain"
            options={DOMAIN_OPTIONS}
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
            }}
          />
          <SelectField
            label="Level"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
            }}
          />
        </Card>
      )}

      {roster.isPending && effectiveAssessmentId && <PageSpinner />}

      {roster.isError && (
        <ErrorState
          error={roster.error}
          onRetry={() => {
            void roster.refetch();
          }}
        />
      )}

      {roster.data && (
        <Card title="Roster" subtitle={`${String(roster.data.length)} children match this filter`}>
          {roster.data.length === 0 ? (
            <EmptyState
              icon={<AlertCircleIcon className="size-6" />}
              title="Nobody matches this filter"
              description="Try a different domain or level."
            />
          ) : (
            <DataTable
              caption="Children this assessment flags, with their weak subskills"
              columns={COLUMNS}
              minWidthClassName="min-w-200"
            >
              {roster.data.map((row) => (
                <tr key={row.student_id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={row.full_name} />
                      <div className="min-w-0">
                        <p className="text-koyi-text truncate font-bold">{row.full_name}</p>
                        <p className="text-koyi-muted text-xs">{row.school_class}</p>
                      </div>
                    </div>
                  </td>

                  <td className="text-koyi-muted px-5 py-4">
                    {row.literacy_level ? domainLevelLabel('literacy', row.literacy_level) : '—'}
                  </td>
                  <td className="text-koyi-muted px-5 py-4">
                    {row.numeracy_level ? domainLevelLabel('numeracy', row.numeracy_level) : '—'}
                  </td>

                  <td className="text-koyi-text max-w-72 px-5 py-4">
                    {row.weak_subskills.length > 0 ? row.weak_subskills.join(', ') : '—'}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      to={paths.teacher.students.detail(row.student_id)}
                      className="border-koyi-primary text-koyi-primary hover:bg-koyi-nav-active inline-flex h-9 items-center rounded-md border px-3 text-xs font-bold transition-colors"
                    >
                      View profile
                      <span className="sr-only"> for {row.full_name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      )}
    </div>
  );
}
