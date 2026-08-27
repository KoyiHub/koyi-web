import { useState } from 'react';

import { PageHeader } from '@/components/ui/page-header';
import {
  AcademicSetupTab,
  AccountSecurityTab,
  SchoolProfileTab,
} from '@/features/school-admin/settings/components/settings-forms';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { id: 'school', label: 'School profile' },
  { id: 'academic', label: 'Academic setup' },
  { id: 'account', label: 'Admin account & security' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/**
 * School Admin settings.
 *
 * Three areas, matching what an administrator actually owns: the school
 * record the rest of the app reads, the academic calendar that drives terms
 * and assessment windows, and their own account and password. Each tab loads
 * its own query so opening Settings does not fetch all three.
 */
export function SchoolAdminSettingsPage() {
  const [tab, setTab] = useState<TabId>('school');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your school record, academic calendar and your own account."
      />

      <div
        role="tablist"
        aria-label="Settings sections"
        className="border-koyi-border flex gap-1 border-b"
      >
        {TABS.map((item) => {
          const isActive = item.id === tab;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`settings-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`settings-panel-${item.id}`}
              onClick={() => {
                setTab(item.id);
              }}
              className={cn(
                'rounded-t-md px-4 py-3 text-sm font-semibold',
                'focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:-outline-offset-2',
                isActive
                  ? 'border-koyi-primary text-koyi-primary border-b-2'
                  : 'text-koyi-muted hover:text-koyi-text',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
        className="mx-auto w-full max-w-220"
      >
        {tab === 'school' && <SchoolProfileTab />}
        {tab === 'academic' && <AcademicSetupTab />}
        {tab === 'account' && <AccountSecurityTab />}
      </div>
    </div>
  );
}
