import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import type { GroupDetail } from '@/features/teacher/groups/api/group.schema';
import {
  useAddGroupMember,
  useArchiveGroup,
  useGenerateGroupLessonPlan,
  useLessonPlanFeedback,
  useRemoveGroupMember,
} from '@/features/teacher/groups/api/mutations';
import { groupDetailQuery, groupLessonPlanQuery } from '@/features/teacher/groups/api/queries';
import { studentListQuery } from '@/features/teacher/students/api/queries';
import { ApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/api/format';
import { DOMAIN_LABEL } from '@/lib/fln/level';

const RESOURCE_TIER_LABEL = { minimal: 'Minimal', basic: 'Basic', equipped: 'Equipped' };

const backLink = (
  <Link
    to={paths.teacher.groups.list}
    className="text-koyi-primary flex h-11 w-fit items-center text-sm font-semibold"
  >
    <span aria-hidden="true" className="mr-1">
      ←
    </span>{' '}
    Back to Groups
  </Link>
);

function CriteriaList({ group }: { group: GroupDetail }) {
  return (
    <Card title="Criteria" subtitle="All ANDed — a child must match every one.">
      <ul className="space-y-2 text-sm">
        {group.criteria.map((criterion, index) => (
          <li key={index} className="text-koyi-text">
            {criterion.type === 'level' &&
              `Level ${criterion.comparator === 'eq' ? '=' : criterion.comparator === 'gte' ? '≥' : '≤'} ${String(criterion.level)}`}
            {criterion.type === 'skill' && `Skill: ${criterion.skill}`}
            {criterion.type === 'subskill' && `Subskill: ${criterion.subskill}`}
            {criterion.type === 'class' && `Class: ${criterion.class}`}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function useGroup(groupId: string) {
  return useQuery(groupDetailQuery(groupId));
}

function MembersPanel({ groupId }: { groupId: string }) {
  const [currentOnly, setCurrentOnly] = useState(true);
  const group = useGroup(groupId);
  const remove = useRemoveGroupMember();
  const add = useAddGroupMember();
  const [studentToAdd, setStudentToAdd] = useState('');

  const students = useQuery(studentListQuery({ page: 1 }));
  const memberIds = new Set((group.data?.members ?? []).map((member) => member.student_id));
  const addableStudents = (students.data?.results ?? []).filter(
    (student) => !memberIds.has(student.id),
  );

  const rows = (group.data?.members ?? []).filter(
    (member) => !currentOnly || member.left_at === null,
  );

  return (
    <Card
      title="Students in This Group"
      action={
        <button
          type="button"
          className="text-koyi-primary text-xs font-semibold hover:underline"
          onClick={() => {
            setCurrentOnly((value) => !value);
          }}
        >
          {currentOnly ? 'Show full history' : 'Show current only'}
        </button>
      }
    >
      <div className="mb-4 flex items-end gap-2">
        <SelectField
          label="Add a student"
          labelHidden
          placeholder="Select a student to add"
          value={studentToAdd}
          options={addableStudents.map((student) => ({
            value: student.id,
            label: student.full_name,
          }))}
          onChange={(event) => {
            setStudentToAdd(event.target.value);
          }}
          wrapperClassName="flex-1"
        />
        <Button
          variant="secondary"
          disabled={!studentToAdd}
          isLoading={add.isPending}
          onClick={() => {
            add.mutate(
              { groupId, studentId: studentToAdd },
              { onSuccess: () => setStudentToAdd('') },
            );
          }}
        >
          Add
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-koyi-muted text-sm">No members yet.</p>
      ) : (
        <ul className="border-koyi-border divide-y">
          {rows.map((member) => (
            <li
              key={`${member.student_id}-${member.joined_at}`}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="text-koyi-text text-sm font-medium">{member.full_name}</p>
                <p className="text-koyi-muted text-xs">
                  {member.join_reason === 'matched' ? 'Matched by criteria' : 'Added by hand'} ·
                  Joined {formatDate(member.joined_at)}
                  {member.left_at && ` · Left ${formatDate(member.left_at)}`}
                </p>
              </div>
              {member.left_at === null && (
                <button
                  type="button"
                  className="text-koyi-danger text-xs font-semibold hover:underline"
                  onClick={() => {
                    remove.mutate({ groupId, studentId: member.student_id });
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function LessonPlanPanel({ groupId }: { groupId: string }) {
  const plan = useQuery(groupLessonPlanQuery(groupId));
  const generate = useGenerateGroupLessonPlan();
  const feedback = useLessonPlanFeedback();

  if (plan.isPending) return <PageSpinner />;

  if (plan.isError) {
    if (plan.error instanceof ApiError && plan.error.isNotFound) {
      return (
        <Card title="Lesson plan">
          <p className="text-koyi-muted mb-4 text-sm">No plan has been generated yet.</p>
          <Button isLoading={generate.isPending} onClick={() => generate.mutate(groupId)}>
            Generate lesson plan
          </Button>
        </Card>
      );
    }
    return <ErrorState error={plan.error} onRetry={() => void plan.refetch()} />;
  }

  const data = plan.data;

  return (
    <Card
      title="Lesson plan"
      subtitle={data.status === 'fallback' ? 'Canonical plan — adaptation did not apply' : ''}
      action={
        <Button
          variant="secondary"
          size="sm"
          isLoading={generate.isPending}
          onClick={() => generate.mutate(groupId)}
        >
          Regenerate
        </Button>
      }
    >
      {data.status === 'generating' && (
        <p className="text-koyi-muted text-sm">Generating — this can take a little while.</p>
      )}

      {data.status === 'failed' && (
        <p className="text-koyi-muted text-sm">Nothing could be generated for this group.</p>
      )}

      {(data.status === 'ready' || data.status === 'fallback') && data.content && (
        <div className="space-y-4 text-sm">
          <p className="text-koyi-text font-semibold">{data.content.objective}</p>
          <p className="text-koyi-muted text-xs">
            {data.content.duration_minutes} minutes · {data.content.materials.join(', ')}
          </p>

          <ol className="space-y-3">
            {data.content.steps.map((step, index) => (
              <li key={index} className="border-koyi-border border-l-2 pl-3">
                <p className="text-koyi-text font-medium">
                  {index + 1}. {step.teacher_does} ({step.minutes} min)
                </p>
                <p className="text-koyi-muted text-xs">{step.children_do}</p>
              </li>
            ))}
          </ol>

          {data.content.checks.length > 0 && (
            <div>
              <p className="text-koyi-text text-xs font-bold uppercase">Checks</p>
              <ul className="text-koyi-muted list-inside list-disc text-xs">
                {data.content.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>
          )}

          {data.content.note && (
            <p className="text-koyi-muted text-xs italic">{data.content.note}</p>
          )}

          <div className="border-koyi-border flex items-center gap-3 border-t pt-4">
            <span className="text-koyi-muted text-xs">Was this plan helpful?</span>
            <button
              type="button"
              className="text-koyi-success text-sm font-semibold hover:underline"
              onClick={() => {
                feedback.mutate({ lessonPlanId: data.id, wasHelpful: true });
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="text-koyi-danger text-sm font-semibold hover:underline"
              onClick={() => {
                feedback.mutate({ lessonPlanId: data.id, wasHelpful: false });
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function GroupDetailPage() {
  const { groupId = '' } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const group = useGroup(groupId);
  const archive = useArchiveGroup();

  if (group.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {backLink}
        <PageSpinner />
      </div>
    );
  }

  if (group.isError || !group.data) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {backLink}
        <ErrorState error={group.error} onRetry={() => void group.refetch()} />
      </div>
    );
  }

  const data = group.data;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {backLink}

      <header className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">{data.name}</h1>
            {data.is_thin && <Badge tone="warning">This group has got small</Badge>}
          </div>
          <p className="text-koyi-muted mt-1 text-sm">
            {DOMAIN_LABEL[data.domain]} · {data.size} students ·{' '}
            {RESOURCE_TIER_LABEL[data.resource_tier]} · Stable until {formatDate(data.stable_until)}
          </p>
        </div>

        <Button
          variant="secondary"
          className="text-koyi-danger"
          isLoading={archive.isPending}
          onClick={() => {
            archive.mutate(groupId, {
              onSuccess: () => {
                void navigate(paths.teacher.groups.list);
              },
            });
          }}
        >
          Archive group
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MembersPanel groupId={groupId} />
          <LessonPlanPanel groupId={groupId} />
        </div>

        <CriteriaList group={data} />
      </div>
    </div>
  );
}
