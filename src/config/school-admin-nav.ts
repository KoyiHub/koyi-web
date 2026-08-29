import {
  GearIcon,
  GridIcon,
  HelpIcon,
  TrendingUpIcon,
  UserGroupIcon,
  UsersIcon,
} from '@/components/ui/icons';
import type { AppNav, AppNavItem } from '@/config/app-nav';
import { paths } from '@/config/paths';

export type { AppNavItem };

/**
 * Single source of truth for the School Admin shell sidebar (design reference
 * pages 9-12): Dashboard, Teachers, Students and Classes in the main group,
 * with Settings and Help pinned to the bottom of the rail.
 *
 * The sidebar renders whatever these arrays contain, so the same component can
 * later drive the Teacher shell from its own nav config — no shell rewrite.
 */
export const schoolAdminNav: AppNav = {
  primary: [
    { label: 'Dashboard', to: paths.schoolAdmin.dashboard, end: true, Icon: GridIcon },
    { label: 'Teachers', to: paths.schoolAdmin.teachers.list, end: false, Icon: UsersIcon },
    { label: 'Students', to: paths.schoolAdmin.students.list, end: false, Icon: UserGroupIcon },
    { label: 'Classes', to: paths.schoolAdmin.classes.list, end: false, Icon: TrendingUpIcon },
  ],
  footer: [
    { label: 'Settings', to: paths.schoolAdmin.settings, end: false, Icon: GearIcon },
    { label: 'Help', to: paths.schoolAdmin.help, end: false, Icon: HelpIcon },
  ],
};

/** Flat view, for callers that just need every destination (tests, breadcrumbs). */
export const schoolAdminNavItems: AppNavItem[] = [
  ...schoolAdminNav.primary,
  ...schoolAdminNav.footer,
];
