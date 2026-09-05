/**
 * The assessment runner's endpoints, grouped under `/v1/student/`.
 *
 * Paths follow `frontend-integration.md` §6 — the whole surface a child
 * touches. No account, no password, no permissions; every request after
 * `verify` carries `X-Sitting-Session` instead (see `@/lib/api/runner-client`).
 */
const BASE = '/v1/student/assessment';

export const runnerEndpoints = {
  verify: `${BASE}/verify/`,
  overview: `${BASE}/`,
  startSection: (sectionId: string) => `${BASE}/sections/${sectionId}/start/`,
  submitSection: (sectionId: string) => `${BASE}/sections/${sectionId}/submit/`,
  response: (questionId: string) => `${BASE}/responses/${questionId}/`,
};
