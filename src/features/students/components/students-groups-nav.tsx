import { NavLink } from 'react-router';

import { paths } from '@/config/paths';
import { cn } from '@/lib/utils/cn';

/**
 * PROVISIONAL local navigation filling a Figma interaction gap: the design
 * treats Students and Groups as one combined section without specifying how
 * a teacher moves between them. Intentionally small — two links, not a tab
 * system — so it doesn't compete with the sidebar.
 */
export function StudentsGroupsNav() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-koyi-md flex h-9 items-center px-4 text-sm font-medium transition-colors',
      isActive
        ? 'bg-koyi-card text-koyi-primary shadow-sm'
        : 'text-koyi-muted hover:text-koyi-text',
    );

  return (
    <nav
      aria-label="Students section"
      className="bg-koyi-surface rounded-koyi-md inline-flex gap-1 p-1"
    >
      <NavLink to={paths.students.list} end className={linkClasses}>
        Students
      </NavLink>
      <NavLink to={paths.students.groups} className={linkClasses}>
        Groups
      </NavLink>
    </nav>
  );
}
