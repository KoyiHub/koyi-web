import { useQuery } from '@tanstack/react-query';
import { type ComponentType, type SVGProps } from 'react';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LightbulbIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { INSIGHT_KIND_LABEL } from '@/features/teacher/api/format';
import type { Insight, InsightKind } from '@/features/teacher/dashboard/api/dashboard.schema';
import { insightsQuery } from '@/features/teacher/dashboard/api/queries';
import { cn } from '@/lib/utils/cn';

interface KindStyle {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  chipClassName: string;
}

const KIND_STYLE: Record<InsightKind, KindStyle> = {
  emerging_gap: {
    Icon: TargetIcon,
    chipClassName: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
  },
  common_mistake: { Icon: LightbulbIcon, chipClassName: 'bg-amber-100 text-amber-800' },
  teaching_activity: { Icon: UsersIcon, chipClassName: 'bg-koyi-nav-active text-koyi-primary' },
  positive_trend: {
    Icon: TrendingUpIcon,
    chipClassName: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  },
};

/**
 * Everything the class report noticed this week.
 *
 * The emerging gap leads, because it is the only insight that asks for a
 * decision — the rest are context. Each insight's `points` are the evidence
 * behind it; they are shown, not summarised, so a teacher can disagree with
 * the conclusion on the same screen.
 */
export function AiInsightsPage() {
  const navigate = useNavigate();
  const insights = useQuery(insightsQuery());

  const all = insights.data?.insights ?? [];
  const hero = all.find((insight) => insight.kind === 'emerging_gap') ?? all[0];
  const rest = all.filter((insight) => insight.id !== hero?.id);

  /**
   * "Apply focus group" used to pre-fill a sessionStorage assessment draft
   * with the flagged children and skill before handing off to the builder.
   *
   * That mechanism is gone: under draft-then-publish (`frontend-integration.md`
   * §5.3) the draft is a real server record from step 1, not local state a
   * dashboard screen can reach into. There is also no group endpoint yet to
   * hand the children off to (§5.6, Planned) — that lands with groups and
   * lesson plans later in the refactor. Until then this opens the builder with
   * nothing pre-filled rather than silently dropping a promise it can't keep.
   */
  const applyFocusGroup = (_insight: Insight) => {
    void navigate(paths.teacher.assessments.create);
  };

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
        title="AI insights"
        subtitle={
          insights.data
            ? `Generated from your class results · ${insights.data.generated_label}`
            : 'Generated from your class results'
        }
      />

      {insights.isPending && <PageSpinner />}

      {insights.isError && (
        <ErrorState
          error={insights.error}
          onRetry={() => {
            void insights.refetch();
          }}
        />
      )}

      {insights.data && all.length === 0 && (
        <EmptyState
          icon={<SparklesIcon className="size-6" />}
          title="No insights yet"
          description="Assess a few more children and the class report will start finding patterns."
        />
      )}

      {hero && (
        <section className="rounded-koyi-xl from-koyi-primary to-koyi-accent bg-gradient-to-br p-6 text-white sm:p-8">
          <div className="flex items-center gap-2">
            <SparklesIcon aria-hidden="true" className="size-5" />
            <p className="text-xs font-bold tracking-wide uppercase">
              {INSIGHT_KIND_LABEL[hero.kind]}
            </p>
          </div>

          <h2 className="font-display mt-4 max-w-3xl text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
            {hero.headline}
          </h2>

          <p className="mt-3 max-w-3xl leading-relaxed text-white/85">{hero.body}</p>

          {hero.points.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {hero.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-white/90">
                  <CheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                applyFocusGroup(hero);
              }}
              className="text-koyi-primary h-11 bg-white hover:bg-white/90"
            >
              Apply focus group
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </Button>

            <p className="text-sm text-white/85">
              {hero.focus_skill && <span className="font-bold">{hero.focus_skill} · </span>}
              {hero.student_ids.length} children · {hero.scope_label}
            </p>
          </div>

          <p className="mt-4 text-xs text-white/70">
            Applying a focus group starts an assessment for these children. Nothing is sent to them
            until you assign it.
          </p>
        </section>
      )}

      {rest.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {rest.map((insight) => {
            const { Icon, chipClassName } = KIND_STYLE[insight.kind];

            return (
              <Card
                key={insight.id}
                title={INSIGHT_KIND_LABEL[insight.kind]}
                subtitle={insight.scope_label}
                icon={
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      chipClassName,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                }
              >
                <h3 className="text-koyi-text font-display text-lg leading-snug font-bold text-balance">
                  {insight.headline}
                </h3>

                <p className="text-koyi-muted mt-2 text-sm leading-relaxed">{insight.body}</p>

                {insight.points.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {insight.points.map((point) => (
                      <li key={point} className="text-koyi-text flex items-start gap-2.5 text-sm">
                        <span
                          aria-hidden="true"
                          className="bg-koyi-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                {insight.student_ids.length > 0 && (
                  <p className="text-koyi-muted mt-4 text-xs font-semibold">
                    Based on {insight.student_ids.length} children
                    {insight.focus_skill && ` · ${insight.focus_skill}`}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
