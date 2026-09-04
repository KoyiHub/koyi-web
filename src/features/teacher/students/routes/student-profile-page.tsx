import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { InitialsAvatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { BookOpenIcon, CalculatorIcon, SparklesIcon, UserIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { studentSkillsQuery } from '@/features/teacher/students/api/queries';
import type { SkillBreakdown } from '@/features/teacher/students/api/skills.schema';
import type { Domain, FlnLevel } from '@/lib/api/contracts';
import { ApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/api/format';
import { DOMAIN_LABEL, levelCaption, levelLabel, MOVEMENT_LABEL } from '@/lib/fln/level';

/**
 * One child, by skill — `frontend-integration.md` §5.5, rebuilt on
 * `GET /v1/teacher/students/{id}/skills/`.
 *
 * Replaces the pre-refactor learning-profile page: no overall score, no
 * single band, no "strengths"/"learning gaps" framing (§9). Literacy and
 * numeracy are shown side by side and never combined; every level reads as
 * *working on*, never *completed* (A.1); movement — including a drop — is
 * described the same neutral way regardless of direction (§5.5: "`down` is
 * not a failure to hide").
 */
const DOMAIN_ICON: Record<Domain, typeof BookOpenIcon> = {
  literacy: BookOpenIcon,
  numeracy: CalculatorIcon,
};

function DomainLevelCard({ domain, level }: { domain: Domain; level: FlnLevel }) {
  const Icon = DOMAIN_ICON[domain];
  return (
    <Card bodyClassName="flex items-center gap-4">
      <span
        aria-hidden="true"
        className="bg-koyi-nav-active text-koyi-primary grid size-11 shrink-0 place-items-center rounded-full"
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-koyi-muted text-xs font-semibold uppercase">{DOMAIN_LABEL[domain]}</p>
        <p className="text-koyi-text font-display text-lg font-bold">{levelLabel(level)}</p>
        <p className="text-koyi-muted text-xs">{levelCaption(level)}</p>
      </div>
    </Card>
  );
}

function SkillRow({ skill }: { skill: SkillBreakdown }) {
  return (
    <li className="border-koyi-border rounded-koyi-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-koyi-text font-bold">{skill.skill_name}</p>
        <span className="text-koyi-muted text-xs font-semibold uppercase">
          {DOMAIN_LABEL[skill.domain]}
        </span>
      </div>
      <p className="text-koyi-muted mt-1 text-sm">
        {skill.highest_level_passed
          ? `Passed through Level ${String(skill.highest_level_passed)}`
          : 'Not yet passed at any probed level'}
        {skill.broke_down_at && ` — breaks down at Level ${String(skill.broke_down_at)}`}
      </p>
      {skill.weak_subskills.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {skill.weak_subskills.map((item) => (
            <li
              key={item}
              className="bg-koyi-surface text-koyi-text rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function StudentProfilePage() {
  const { studentId = '' } = useParams();
  const skills = useQuery(studentSkillsQuery(studentId));

  if (skills.isPending) return <PageSpinner />;

  if (skills.isError) {
    if (skills.error instanceof ApiError && skills.error.isNotFound) {
      return (
        <EmptyState
          icon={<UserIcon className="size-6" />}
          title="Not yet assessed"
          description="This child hasn't sat an assessment yet — their levels and skill breakdown will appear here once they have."
        />
      );
    }
    return (
      <ErrorState
        error={skills.error}
        onRetry={() => {
          void skills.refetch();
        }}
      />
    );
  }

  const data = skills.data;
  const literacySkills = data.skills.filter((skill) => skill.domain === 'literacy');
  const numeracySkills = data.skills.filter((skill) => skill.domain === 'numeracy');

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.full_name}
        subtitle={
          data.last_assessed_at
            ? `Last assessed ${formatDate(data.last_assessed_at)}`
            : 'Not yet assessed'
        }
      />

      <Card bodyClassName="flex flex-wrap items-center gap-5">
        <InitialsAvatar name={data.full_name} className="size-16 text-lg" />
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <DomainLevelCard domain="literacy" level={data.literacy_level} />
          <DomainLevelCard domain="numeracy" level={data.numeracy_level} />
        </div>
      </Card>

      {data.movement.length > 0 && (
        <Card title="Since the last assessment" bodyClassName="space-y-2">
          {data.movement.map((entry) => (
            <p key={entry.domain} className="text-koyi-text text-sm">
              <span className="font-semibold">{DOMAIN_LABEL[entry.domain]}:</span>{' '}
              {MOVEMENT_LABEL[entry.direction]}
              {entry.direction !== 'new' &&
                entry.previous !== null &&
                ` (from Level ${String(entry.previous)} to Level ${String(entry.current)})`}
            </p>
          ))}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Literacy skills">
          {literacySkills.length === 0 ? (
            <p className="text-koyi-muted text-sm">No literacy skills probed yet.</p>
          ) : (
            <ul className="space-y-3">
              {literacySkills.map((skill) => (
                <SkillRow key={skill.skill_name} skill={skill} />
              ))}
            </ul>
          )}
        </Card>

        <Card title="Numeracy skills">
          {numeracySkills.length === 0 ? (
            <p className="text-koyi-muted text-sm">No numeracy skills probed yet.</p>
          ) : (
            <ul className="space-y-3">
              {numeracySkills.map((skill) => (
                <SkillRow key={skill.skill_name} skill={skill} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
