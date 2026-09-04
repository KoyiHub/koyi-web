import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * The activity feed — `frontend-integration.md` §4.6. `label`/`description`
 * are server-authored and rendered verbatim, never reconstructed from ids.
 */
describe('ActivityPage', () => {
  it('renders server-authored labels for real seed events', async () => {
    renderRoute(paths.schoolAdmin.activity);

    await screen.findByRole('heading', { name: 'Activity' });

    // Whichever events sort first, their labels are rendered verbatim — never
    // reconstructed from an id — so match the pattern, not one fixed row.
    const rows = await screen.findAllByText(
      /^(New teacher added|Class created|Student enrolled|Assessment published|Assessment closed):/,
    );
    expect(rows.length).toBeGreaterThan(0);
  });

  it('is cursor-paginated: a large seed offers a "load more" rather than page numbers', async () => {
    const { user } = renderRoute(paths.schoolAdmin.activity);

    await screen.findByRole('heading', { name: 'Activity' });
    expect(screen.queryByRole('navigation', { name: /page/i })).not.toBeInTheDocument();

    const loadMore = await screen.findByRole('button', { name: 'Load more' });
    await user.click(loadMore);

    // The seed is large enough that one page never exhausts it.
    expect(await screen.findByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });
});
