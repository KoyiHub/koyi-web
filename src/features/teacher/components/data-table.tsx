import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  /** Hides the header text visually while keeping it for screen readers. */
  labelHidden?: boolean;
  className?: string;
}

interface DataTableProps {
  caption: string;
  columns: TableColumn[];
  children: ReactNode;
  /** Minimum table width before the container scrolls, e.g. `min-w-200`. */
  minWidthClassName?: string;
  className?: string;
}

/**
 * The scroll container, header row and caption shared by every Teacher table.
 *
 * Rows stay in the calling screen — each table's cells are specific enough
 * that a generic row renderer would cost more than it saves. What is shared is
 * the part that has to be identical: the horizontal scroll boundary (so a wide
 * table never pushes the page sideways) and the header styling.
 */
export function DataTable({
  caption,
  columns,
  children,
  minWidthClassName = 'min-w-180',
  className,
}: DataTableProps) {
  return (
    <div className={cn('-mx-5 overflow-x-auto px-5', className)}>
      <table className={cn('w-full border-collapse text-left text-sm', minWidthClassName)}>
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="bg-koyi-nav-active text-koyi-muted text-xs font-semibold">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-5 py-3 font-semibold',
                  column.align === 'right' && 'text-right',
                  column.className,
                )}
              >
                {column.labelHidden ? (
                  <span className="sr-only">{column.label}</span>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-koyi-border divide-y">{children}</tbody>
      </table>
    </div>
  );
}
