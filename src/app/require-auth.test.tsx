import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('route auth guards', () => {
  it('redirects an unauthenticated visitor away from a teacher route to /login', async () => {
    renderRoute('/dashboard', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('renders a teacher route for an authenticated visitor', async () => {
    renderRoute('/dashboard', { authenticated: true });

    expect(await screen.findByText('Total Students')).toBeInTheDocument();
  });

  it('redirects an already-authenticated visitor away from the public welcome page to the dashboard', async () => {
    renderRoute('/', { authenticated: true });

    expect(await screen.findByText('Total Students')).toBeInTheDocument();
  });

  it('lets an unauthenticated visitor see the public welcome page at /', async () => {
    renderRoute('/', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome to Koyi' })).toBeInTheDocument();
  });

  it('redirects an authenticated visitor away from /login to the dashboard', async () => {
    renderRoute('/login', { authenticated: true });

    expect(await screen.findByText('Total Students')).toBeInTheDocument();
  });

  it('lets an unauthenticated visitor reach /login', async () => {
    renderRoute('/login', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });
});
