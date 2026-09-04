import { PageHeader } from '@/components/ui/page-header';
import { SchoolProfileTab } from '@/features/school-admin/settings/components/settings-forms';

/**
 * School Admin settings — `frontend-integration.md` §4.2.
 *
 * One section: the school's own profile (`{name, logo, current_session}`
 * plus the read-only `abbreviation`) and the password-change action. There
 * is no documented endpoint for an administrator's own identity separate
 * from the school record, so the "Admin account & security" tab this used
 * to have was removed — nothing was left to back it.
 */
export function SchoolAdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your school record and your password." />

      <div className="mx-auto w-full max-w-220">
        <SchoolProfileTab />
      </div>
    </div>
  );
}
