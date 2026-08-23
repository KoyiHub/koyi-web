import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { renderWithProviders, screen } from '@/test/test-utils';

describe('Button', () => {
  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and marked busy while loading', () => {
    renderWithProviders(<Button isLoading>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
