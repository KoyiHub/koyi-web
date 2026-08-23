import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { ErrorState } from '@/components/ui/error-state';
import { PageSpinner } from '@/components/ui/page-spinner';
import { paths } from '@/config/paths';
import { usersQuery } from '@/features/users/api/queries';

export function UsersPage() {
  const { data: users, isPending, isError, error, refetch } = useQuery(usersQuery());

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
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-slate-600">
        A reference feature slice: schema-validated fetch, cached query, typed route params.
      </p>

      <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              to={paths.users.detail(user.id)}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{user.name}</span>
              <span className="text-sm text-slate-500">{user.email}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
