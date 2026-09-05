import {
  ClipboardIcon,
  GearIcon,
  GridIcon,
  HelpIcon,
  LayersIcon,
  TrendingUpIcon,
  UserGroupIcon,
} from '@/components/ui/icons';
import type { AppNav } from '@/config/app-nav';
import { paths } from '@/config/paths';

/**
 * Single source of truth for the Teacher shell sidebar: Dashboard, Assessment,
 * Students, Groups and Progress in the main group, with Settings and Help
 * pinned to the bottom — the same two-group rail the School Admin portal
 * uses, so a teacher who also administers a school meets one navigation
 * model.
 *
 * "Assessment" points at the assessment library (authoring and results), not
 * at the live one-child-at-a-time session. Starting a session is a topbar
 * action, because it is something you do, not somewhere you go.
 *
 * Question Bank is deliberately absent: it is reached from inside the
 * assessment builder, where picking a question actually means something.
 * Profile is reached solely from the topbar avatar.
 */
export const teacherNav: AppNav = {
  primary: [
    { label: 'Dashboard', to: paths.teacher.dashboard, end: false, Icon: GridIcon },
    { label: 'Assessment', to: paths.teacher.assessments.list, end: false, Icon: ClipboardIcon },
    { label: 'Students', to: paths.teacher.students.list, end: false, Icon: UserGroupIcon },
    { label: 'Groups', to: paths.teacher.groups.list, end: false, Icon: LayersIcon },
    { label: 'Progress', to: paths.teacher.progress, end: false, Icon: TrendingUpIcon },
  ],
  footer: [
    { label: 'Settings', to: paths.teacher.settings, end: false, Icon: GearIcon },
    { label: 'Help', to: paths.teacher.help, end: false, Icon: HelpIcon },
  ],
};

/** Flat view, for callers that just need every destination (tests, breadcrumbs). */
export const teacherNavItems = [...teacherNav.primary, ...teacherNav.footer];
