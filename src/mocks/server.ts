import { setupServer } from 'msw/node';

import { handlers } from '@/mocks/handlers';

/** Node-side interceptor used by Vitest. */
export const server = setupServer(...handlers);
