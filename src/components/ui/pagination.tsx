import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total rows across all pages, for the "Showing 1 to 8 of 42" summary. */
  totalCount?: number;
  pageSize?: number;
  /** Plural noun for the summary line, e.g. "teachers". */
  itemLabel?: string;
  className?: string;
}

/**
 * Builds the page-number row with ellipses: first and last page are always
 * reachable, with a window around the current page in between. Returns `1` for
 * a page and `null` for a gap.
 */
function pageItems(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push(null);
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < pageCount - 1) items.push(null);

  items.push(pageCount);
  return items;
}

/**
 * Page-numbered pagination for the School Admin list screens.
 *
 * Server-paged: the caller passes the page count the API reported and this
 * only reports the page the admin asked for. It renders nothing at all when
 * there is a single page and no summary to show.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalCount,
  pageSize,
  itemLabel,
  className,
}: PaginationProps) {
  const hasSummary = totalCount !== undefined && pageSize !== undefined;
  if (pageCount <= 1 && !hasSummary) return null;

  const firstRow = totalCount === 0 ? 0 : (page - 1) * (pageSize ?? 0) + 1;
  const lastRow = Math.min(page * (pageSize ?? 0), totalCount ?? 0);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-col items-center justify-between gap-4 sm:flex-row', className)}
    >
      {hasSummary ? (
        <p className="text-koyi-muted text-sm">
          Showing {firstRow} to {lastRow} of {totalCount} {itemLabel ?? 'results'}
        </p>
      ) : (
        <p className="text-koyi-muted text-sm">
          Page {page} of {pageCount}
        </p>
      )}

      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onPageChange(Math.max(1, page - 1));
            }}
            disabled={page <= 1}
            aria-label="Previous page"
            className="border-koyi-border text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text flex size-9 items-center justify-center rounded-md border bg-white transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeftIcon />
          </button>

          {pageItems(page, pageCount).map((item, index) =>
            item === null ? (
              <span
                // Gaps have no identity of their own; position is the only key available.
                key={`gap-${String(index)}`}
                aria-hidden="true"
                className="text-koyi-muted px-1 text-sm"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onPageChange(item);
                }}
                aria-label={`Page ${String(item)}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md border text-sm transition-colors',
                  item === page
                    ? 'border-koyi-primary bg-koyi-primary font-bold text-white'
                    : 'border-koyi-border text-koyi-text hover:bg-koyi-surface bg-white font-medium',
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => {
              onPageChange(Math.min(pageCount, page + 1));
            }}
            disabled={page >= pageCount}
            aria-label="Next page"
            className="border-koyi-border text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text flex size-9 items-center justify-center rounded-md border bg-white transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </nav>
  );
}
