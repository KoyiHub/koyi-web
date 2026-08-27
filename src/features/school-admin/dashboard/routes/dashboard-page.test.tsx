import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { school } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * The dashboard pulls in the chart library, so it is by far the slowest route
 * to compile in jsdom — hence the generous waits. Keeping these assertions
 * here means the auth tests do not have to pay that cost to prove a redirect.
 */
const SLOW_ROUTE = { timeout: 15_000 };

describe('School Admin DashboardPage', () => {
  it('renders the school summary once the analytics resolve', async () => {
    renderRoute(paths.schoolAdmin.dashboard, { authenticated: false });

    expect(
      await screen.findByRole('heading', { name: 'School Summary' }, SLOW_ROUTE),
    ).toBeInTheDocument();
  });

  it('names the school in the shell, under the product logo', async () => {
    renderRoute(paths.schoolAdmin.dashboard, { authenticated: false });

    expect(await screen.findByText(school.name, undefined, SLOW_ROUTE)).toBeInTheDocument();
  });
});
