import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  LightbulbIcon,
  TrendingUpIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { StatBar } from '@/components/ui/stat-bar';
import { paths } from '@/config/paths';
import { BAND_BAR_CLASS, formatChange, QUESTION_TYPE_LABEL } from '@/features/teacher/api/format';
import { assessmentAnalyticsQuery } from '@/features/teacher/assessments/api/queries';
import { cn } from '@/lib/utils/cn';

type Tone = 'positive' | 'watch' | 'action';

const TONE_CLASS: Record<Tone, string> = {
  positive: 'border-koyi-band-strong/40 bg-koyi-band-strong-soft',
  watch: 'border-koyi-band-intermediate/40 bg-koyi-band-intermediate-soft',
  action: 'border-koyi-band-struggling/40 bg-koyi-band-struggling-soft',
};

const TONE_INK: Record<Tone, string> = {
  positive: 'text-koyi-band-strong-ink',
  watch: 'text-koyi-band-intermediate-ink',
  action: 'text-koyi-band-struggling-ink',
};

const TONE_ICON = {
  positive: TrendingUpIcon,
  watch: LightbulbIcon,
  action: AlertCircleIcon,
};

const TONE_LABEL: Record<Tone, string> = {
  positive: 'Working well',
  watch: 'Keep an eye on',
  action: 'Needs action',
};

/**
 * The headline figure with its own dial.
 *
 * A percentage on its own reads the same at 41% and 91%; the ring makes the
 * distance to a full class visible before the number is read.
 */
function Dial({
  label,
  value,
  caption,
  change,
}: {
  label: string;
  value: number;
  caption: string;
  change?: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Card bodyClassName="flex items-center gap-5">
      <div
        role="img"
        aria-label={`${label}: ${String(value)}%`}
        className="grid size-24 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-koyi-primary) ${String(clamped * 3.6)}deg, var(--color-koyi-surface) 0deg)`,
        }}
      >
        <span className="bg-koyi-card text-koyi-text font-display grid size-18 place-items-center rounded-full text-xl font-extrabold">
          {value}%
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-koyi-text text-sm font-bold">{label}</p>
        <p className="text-koyi-muted mt-1 text-sm leading-relaxed">{caption}</p>
        {change !== undefined && (
          <p
            className={cn(
              'mt-2 text-xs font-bold',
              change > 0
                ? 'text-koyi-band-strong-ink'
                : change < 0
                  ? 'text-koyi-band-struggling-ink'
                  : 'text-koyi-muted',
            )}
          >
            {formatChange(change)} points on the previous assessment
          </p>
        )}
      </div>
    </Card>
  );
}

/**
 * The analytics view of a completed assessment.
 *
 * The detail screen answers "who"; this one answers "what went wrong and what
 * do I teach next". Everything shown is computed server-side — no score
 * becomes a band, and no missed question is paired with its correct answer.
 */
export function AssessmentAnalyticsPage() {
  const { assessmentId = '' } = useParams();
  const navigate = useNavigate();

  const analytics = useQuery(assessmentAnalyticsQuery(assessmentId));

  if (analytics.isPending) return <PageSpinner />;

  if (analytics.isError) {
    return (
      <ErrorState
        error={analytics.error}
        onRetry={() => {
          void analytics.refetch();
        }}
      />
    );
  }

  const report = analytics.data;
  const peak = Math.max(...report.score_distribution.map((bucket) => bucket.students), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment analytics"
        subtitle={`${report.title} · ${report.class_name} · ${report.completed_label}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              void navigate(paths.teacher.assessments.detail(report.id));
            }}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            Back to results
          </Button>
        }
      />

      <section aria-labelledby="trends-heading">
        <h2 id="trends-heading" className="text-koyi-text text-lg font-bold">
          Class trends and insights
        </h2>
        <p className="text-koyi-muted mt-1 text-sm">
          Written with the report, so the wording matches the numbers below.
        </p>

        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          {report.trends.map((trend) => {
            const Icon = TONE_ICON[trend.tone];

            return (
              <li
                key={trend.id}
                className={cn('rounded-koyi-xl border p-5', TONE_CLASS[trend.tone])}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 text-xs font-bold uppercase',
                    TONE_INK[trend.tone],
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {TONE_LABEL[trend.tone]}
                </p>
                <h3 className="text-koyi-text mt-3 font-bold text-balance">{trend.headline}</h3>
                <p className="text-koyi-muted mt-2 text-sm leading-relaxed">{trend.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Dial
          label="Class average score"
          value={report.class_average}
          caption={report.class_average_caption}
          change={report.class_average_change}
        />
        <Dial
          label="Participation rate"
          value={report.participation_rate}
          caption={report.participation_caption}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Score distribution"
          subtitle="How the class spread out across the score bands."
        >
          <ul className="flex h-56 items-end gap-3">
            {report.score_distribution.map((bucket) => (
              <li key={bucket.id} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <p className="text-koyi-text text-center text-sm font-bold">{bucket.students}</p>
                <div
                  role="img"
                  aria-label={`${bucket.label}: ${String(bucket.students)} children, ${String(bucket.percentage)}%`}
                  className={cn(
                    'mt-2 w-full rounded-t-md',
                    BAND_BAR_CLASS[bucket.band],
                    bucket.students === 0 && 'bg-koyi-surface',
                  )}
                  style={{
                    height: `${String(Math.max(4, (bucket.students / peak) * 100))}%`,
                  }}
                />
                <p className="text-koyi-muted mt-2 text-center text-xs font-semibold">
                  {bucket.label}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Skill performance" subtitle="Average score per skill, and the movement on it.">
          <ul className="space-y-4">
            {report.skill_performance.map((skill) => (
              <li key={skill.id}>
                <StatBar
                  label={skill.skill}
                  valueLabel={`${String(skill.average_score)}%`}
                  percentage={skill.average_score}
                />
                <p
                  className={cn(
                    'mt-1.5 text-xs font-semibold',
                    skill.change > 0
                      ? 'text-koyi-band-strong-ink'
                      : skill.change < 0
                        ? 'text-koyi-band-struggling-ink'
                        : 'text-koyi-muted',
                  )}
                >
                  {formatChange(skill.change)} points since the last assessment
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Most missed questions"
        subtitle="What the wrong answers had in common — the correct answers stay on the server."
        bodyClassName="space-y-3"
      >
        {report.most_missed.map((question) => (
          <article
            key={question.question_id}
            className="border-koyi-border rounded-koyi-lg flex flex-wrap items-start gap-4 border p-4"
          >
            <span className="bg-koyi-nav-active text-koyi-primary grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">
              {question.order}
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="text-koyi-text text-sm font-bold text-balance">{question.text}</h3>
              <p className="text-koyi-muted mt-1 text-xs font-semibold">
                {question.skill} · {QUESTION_TYPE_LABEL[question.question_type]}
              </p>
              <p className="text-koyi-muted mt-2 text-sm leading-relaxed">
                {question.common_error}
              </p>
            </div>

            <div className="w-full shrink-0 sm:w-40">
              <p className="text-koyi-band-struggling-ink text-right text-sm font-bold">
                {question.miss_rate}% missed
              </p>
              <div
                role="img"
                aria-label={`${String(question.miss_rate)}% of children answered incorrectly`}
                className="bg-koyi-surface mt-2 h-2 w-full overflow-hidden rounded-full"
              >
                <div
                  className="bg-koyi-band-struggling h-full rounded-full"
                  style={{ width: `${String(question.miss_rate)}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </Card>
    </div>
  );
}
