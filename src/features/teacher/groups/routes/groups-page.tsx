import { Button } from '@/components/ui/button';
import { GroupCard } from '@/features/teacher/groups/components/group-card';
import { StudentsGroupsNav } from '@/features/teacher/groups/components/students-groups-nav';
import { groups } from '@/features/teacher/groups/data/groups-fixture';

export function GroupsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <StudentsGroupsNav />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Groups Overview</h1>
          <p className="text-koyi-muted mt-1 text-sm">
            Manage and monitor your learning groups for Primary 4.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button disabled title="Group creation is not available yet">
            Create New Group
          </Button>
          <span className="text-koyi-muted text-xs font-medium">Coming soon</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
