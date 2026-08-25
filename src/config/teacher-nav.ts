import { paths } from '@/config/paths';

export interface TeacherNavItem {
  label: string;
  to: string;
  end: boolean;
}

/**
 * Single source of truth for teacher shell navigation. Sidebar (and any
 * future breadcrumb/mobile menu) reads from here instead of each hard-coding
 * its own link list. Profile is rendered separately, pinned near the bottom
 * of the sidebar, so it is not repeated here.
 */
export const teacherNavItems: TeacherNavItem[] = [
  { label: 'Dashboard', to: paths.dashboard, end: true },
  { label: 'Assessment', to: paths.assessment.setup, end: false },
  { label: 'Students/Groups', to: paths.students.list, end: false },
  { label: 'Progress', to: paths.progress, end: false },
];

export const teacherProfileNavItem: TeacherNavItem = {
  label: 'Profile',
  to: paths.profile,
  end: false,
};
