import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { createQueryClient } from '@/lib/query-client';

/**
 * All app-wide context lives here so `main.tsx` stays a three-line entry point
 * and tests can mount the same provider tree around any component.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // useState (not a module-level const) keeps one client per app instance —
  // important for tests and StrictMode double-mounts.
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
