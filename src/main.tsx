import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers';
import { routes } from '@/app/routes';
import { env } from '@/config/env';

async function enableMocking(): Promise<void> {
  // `import.meta.env.DEV` is inlined as `false` in production builds, so the
  // dynamic import below is dead code there and MSW never enters the bundle.
  if (!import.meta.env.DEV || !env.VITE_ENABLE_MOCKS) return;

  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

const router = createBrowserRouter(routes);

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
