import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useLogout } from '@/features/auth/api/mutations';
import { meQuery } from '@/features/auth/api/queries';
import { teacherDashboardQuery } from '@/features/teacher/dashboard/api/queries';
import { ApiError } from '@/lib/api/errors';

/**
 * `frontend-integration.md` §5.1's `GET /v1/teacher/auth/me/` — matched
 * exactly (`id, teacher_id, full_name, email, school`). `school_class`
 * lives on the dashboard payload instead, so Teaching Context reads it
 * from there rather than a fixture.
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const me = useQuery(meQuery());
  const dashboard = useQuery(teacherDashboardQuery());

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => {
        void navigate(paths.login.teacher);
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-koyi-text text-xl font-semibold">Teacher Profile</h1>
        <div className="flex gap-2">
          <Button variant="secondary" disabled title="Coming soon">
            Edit Profile
          </Button>
          <Button variant="ghost" onClick={handleLogout} isLoading={logout.isPending}>
            Log Out
          </Button>
        </div>
      </div>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
        <h2 className="text-koyi-text text-sm font-semibold tracking-wide uppercase">
          Account Information
        </h2>

        {me.isLoading && <p className="text-koyi-muted mt-4 text-sm">Loading account details…</p>}

        {me.isError && (
          <p role="alert" className="text-koyi-danger mt-4 text-sm">
            {me.error instanceof ApiError ? me.error.message : 'Could not load account details.'}
          </p>
        )}

        {me.data && (
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-koyi-muted text-xs">Name</dt>
              <dd className="text-koyi-text mt-1 text-sm font-medium">{me.data.full_name}</dd>
            </div>
            <div>
              <dt className="text-koyi-muted text-xs">Teacher ID</dt>
              <dd className="text-koyi-text mt-1 text-sm font-medium">{me.data.teacher_id}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-koyi-muted text-xs">Email</dt>
              <dd className="text-koyi-text mt-1 text-sm font-medium">{me.data.email}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card mt-4 border p-6">
        <h2 className="text-koyi-text text-sm font-semibold tracking-wide uppercase">
          Teaching Context
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-koyi-muted text-xs">School</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">
              {me.data?.school.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-koyi-muted text-xs">Class</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">
              {dashboard.data?.school_class ?? 'Not assigned yet'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
