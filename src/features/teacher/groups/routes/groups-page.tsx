import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { useFormGroups } from '@/features/teacher/groups/api/mutations';
import { groupListQuery } from '@/features/teacher/groups/api/queries';
import { CreateGroupModal } from '@/features/teacher/groups/components/create-group-modal';
import { GroupCard } from '@/features/teacher/groups/components/group-card';
import { StudentsGroupsNav } from '@/features/teacher/groups/components/students-groups-nav';
import { ApiError } from '@/lib/api/errors';

/**
 * Groups overview — `frontend-integration.md` §5.6. Unpaginated: a group is
 * a small working set by design, never a whole-school roster.
 */
export function GroupsPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const groups = useQuery(groupListQuery());
  const formGroups = useFormGroups();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <StudentsGroupsNav />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Groups Overview</h1>
          <p className="text-koyi-muted mt-1 text-sm">Manage and monitor your learning groups.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            isLoading={formGroups.isPending}
            onClick={() => {
              formGroups.mutate();
            }}
          >
            Form groups automatically
          </Button>
          <Button
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            Create New Group
          </Button>
        </div>
      </header>

      {formGroups.isError && (
        <p role="alert" className="text-koyi-danger text-sm">
          {formGroups.error instanceof ApiError
            ? formGroups.error.message
            : 'Could not form groups automatically.'}
        </p>
      )}

      {groups.isPending && <PageSpinner />}

      {groups.isError && (
        <ErrorState
          error={groups.error}
          onRetry={() => {
            void groups.refetch();
          }}
        />
      )}

      {groups.data?.length === 0 && (
        <EmptyState
          title="No groups yet"
          description="Create one with criteria, or form groups automatically from shared weaknesses."
        />
      )}

      {groups.data && groups.data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.data.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
        onCreated={(groupId) => {
          setCreateOpen(false);
          void navigate(paths.teacher.groups.detail(groupId));
        }}
      />
    </div>
  );
}
