import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';

import { ErrorState } from '@/components/ui/error-state';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { userQuery } from '@/features/users/api/queries';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user, isPending, isError, error, refetch } = useQuery(userQuery(userId ?? ''));

  if (isPending) return <PageSpinner />;
  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <article>
      <Link to={paths.users.list} className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Back to users
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{user.name}</h1>

      <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Username</dt>
          <dd className="mt-1 text-sm text-slate-900">{user.username}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Email</dt>
          <dd className="mt-1 text-sm text-slate-900">{user.email}</dd>
        </div>
      </dl>
    </article>
  );
}
