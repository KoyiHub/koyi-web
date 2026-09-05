import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import type { Group } from '@/features/teacher/groups/api/group.schema';
import { DOMAIN_LABEL } from '@/lib/fln/level';

const RESOURCE_TIER_LABEL = { minimal: 'Minimal', basic: 'Basic', equipped: 'Equipped' };

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <article className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col gap-4 border p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-koyi-text text-base font-semibold">{group.name}</h3>
        {group.is_thin && <Badge tone="warning">Getting small</Badge>}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-koyi-muted">Domain</dt>
          <dd className="text-koyi-text font-medium">{DOMAIN_LABEL[group.domain]}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-koyi-muted">Students</dt>
          <dd className="text-koyi-text font-medium">{group.size}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-koyi-muted">Resources</dt>
          <dd className="text-koyi-text font-medium">{RESOURCE_TIER_LABEL[group.resource_tier]}</dd>
        </div>
      </dl>

      <Link
        to={paths.teacher.groups.detail(group.id)}
        className="text-koyi-primary mt-auto flex h-11 items-center text-sm font-semibold hover:underline"
      >
        View Details{' '}
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Link>
    </article>
  );
}
