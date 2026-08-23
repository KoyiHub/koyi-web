import { setupWorker } from 'msw/browser';

import { handlers } from '@/mocks/handlers';

/** Browser worker used when VITE_ENABLE_MOCKS=true, so the UI runs backendless. */
export const worker = setupWorker(...handlers);
