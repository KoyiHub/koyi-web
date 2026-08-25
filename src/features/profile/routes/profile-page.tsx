import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { teacherProfileFixture } from '@/features/profile/data/profile-fixture';
import { clearAuthToken } from '@/lib/auth/token-store';

/**
 * PROVISIONAL: identity data is a fixture, not a Profile API. Log Out clears
 * whatever local token exists (a safe no-op today, since no login flow
 * issues one yet) and returns to /login — see CURRENT.md.
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const profile = teacherProfileFixture;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-koyi-text text-xl font-semibold">Teacher Profile</h1>
        <div className="flex gap-2">
          <Button variant="secondary" disabled title="Coming soon">
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearAuthToken();
              void navigate(paths.auth.login);
            }}
          >
            Log Out
          </Button>
        </div>
      </div>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
        <h2 className="text-koyi-text text-sm font-semibold tracking-wide uppercase">
          Personal Information
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-koyi-muted text-xs">Name</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-koyi-muted text-xs">Role</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">{profile.role}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-koyi-muted text-xs">Email</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">{profile.email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card mt-4 border p-6">
        <h2 className="text-koyi-text text-sm font-semibold tracking-wide uppercase">
          School/Class Information
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-koyi-muted text-xs">School</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">{profile.school}</dd>
          </div>
          <div>
            <dt className="text-koyi-muted text-xs">Class</dt>
            <dd className="text-koyi-text mt-1 text-sm font-medium">{profile.className}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
