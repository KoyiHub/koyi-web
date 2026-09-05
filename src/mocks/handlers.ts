import { http, HttpResponse } from 'msw';

import type { AuthUser } from '@/features/auth/api/auth.schema';
import { schoolAdminHandlers } from '@/mocks/school-admin-handlers';
import { studentHandlers } from '@/mocks/student-handlers';
import { teacherHandlers } from '@/mocks/teacher-handlers';

export const mockAuthUser: AuthUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'teacher@koyi.ng',
  first_name: 'Amina',
  last_name: 'Yusuf',
  full_name: 'Amina Yusuf',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
};

/** Mirrors the real envelope from `apps.common.exceptions.api_exception_handler`. */
function errorEnvelope(type: string, message: string, detail?: unknown) {
  return { error: { type, message, detail: detail ?? null, request_id: 'test-request-id' } };
}

/**
 * School onboarding and auth are not backed by a confirmed Django contract
 * yet — these handlers stand in for `frontend-integration.md` §4.1 and §5.1
 * so both journeys are fully clickable, and they deliberately model the
 * failure paths too: a wrong code is rejected rather than waved through.
 *
 * Registering does NOT return auth tokens: the visitor is not signed in by
 * completing that step alone — verifying the email is what issues them.
 */
export const MOCK_VERIFICATION_CODE = '123456';

/** The only password the mock sign-in endpoints accept. */
export const MOCK_PASSWORD = 'password123';

/**
 * Whether the mock School Admin login pretends this device needs an OTP.
 *
 * The real backend decides this per request (unknown device, missing trust
 * cookie); MSW cannot, so it is a switch. Flip to `true` to walk the OTP
 * check at "/login/verify-device" — the code is `MOCK_VERIFICATION_CODE`.
 */
export const MOCK_ADMIN_DEVICE_CHECK = false;

/** The token the mock school password-reset flow accepts — a real backend would mint one per request. */
export const MOCK_SCHOOL_RESET_TOKEN = 'mock-school-reset-token';

interface MockSchool {
  id: string;
  name: string;
  abbreviation: string;
  email: string;
}

const mockSchools = new Map<string, MockSchool>();
let schoolCounter = 0;

/**
 * Default happy-path handlers. Individual tests override one endpoint with
 * `server.use(...)` rather than editing this shared list.
 */
export const handlers = [
  ...schoolAdminHandlers,
  ...teacherHandlers,
  ...studentHandlers,

  /* ---------------------------------------------------------------------- */
  /* School registration — frontend-integration.md §4.1                     */
  /* ---------------------------------------------------------------------- */

  http.post('*/api/v1/school/auth/register/', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      abbreviation: string;
      email: string;
    };
    schoolCounter += 1;
    const id = `school-${String(schoolCounter)}`;
    mockSchools.set(body.email, {
      id,
      name: body.name,
      abbreviation: body.abbreviation.toUpperCase(),
      email: body.email,
    });

    return HttpResponse.json({ id, email: body.email, otp_sent: true }, { status: 201 });
  }),

  http.post('*/api/v1/school/auth/register/verify/', async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };

    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }

    const school = mockSchools.get(body.email);
    if (!school) {
      return HttpResponse.json(errorEnvelope('not_found', 'We could not find that school.'), {
        status: 404,
      });
    }

    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      school: {
        id: school.id,
        name: school.name,
        abbreviation: school.abbreviation,
        email: school.email,
      },
    });
  }),

  /** No resend endpoint is documented in the guide — kept as this client's best guess. */
  http.post('*/api/v1/school/auth/otp/resend/', async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (!mockSchools.has(body.email)) {
      return HttpResponse.json(errorEnvelope('not_found', 'We could not find that school.'), {
        status: 404,
      });
    }
    return HttpResponse.json({ retry_after_seconds: 30 });
  }),

  /* ---------------------------------------------------------------------- */
  /* Sign-in — frontend-integration.md §4.1, §5.1                           */
  /* ---------------------------------------------------------------------- */

  http.post('*/api/v1/teacher/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { teacher_id: string; password: string };

    // One message for a wrong password, an unknown id and a disabled account
    // alike. Distinguishing them would let the form be used to discover which
    // teacher ids exist, so the mock models the sameness too.
    if (body.password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        errorEnvelope(
          'authentication_failed',
          'No active account found with the given credentials',
        ),
        { status: 401 },
      );
    }

    // Teacher ids are case insensitive on input.
    const teacherId = body.teacher_id.toUpperCase();

    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: { id: mockAuthUser.id, email: mockAuthUser.email, role: 'teacher' },
      teacher: {
        id: mockAuthUser.id,
        teacher_id: teacherId,
        full_name: mockAuthUser.full_name,
        school: {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Greenwood Primary School',
        },
        school_class: 'Grade 2 A',
      },
    });
  }),

  http.post('*/api/v1/school/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        errorEnvelope(
          'authentication_failed',
          'No active account found with the given credentials',
        ),
        { status: 401 },
      );
    }

    if (MOCK_ADMIN_DEVICE_CHECK) {
      return HttpResponse.json({
        otp_required: true,
        challenge: 'mock-otp-challenge',
      });
    }

    return HttpResponse.json({
      otp_required: false,
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    });
  }),

  http.post('*/api/v1/school/auth/login/verify/', async ({ request }) => {
    const body = (await request.json()) as { challenge: string; code: string };

    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }

    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: { id: 'mock-admin-user', email: 'admin@school.edu', role: 'school_admin' },
      school: {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Greenwood Primary School',
        abbreviation: 'GHS',
      },
    });
  }),

  /* ---------------------------------------------------------------------- */
  /* Password reset — school admin (OTP-code, §4.1) and teacher (also       */
  /* OTP-code, §5.1 — identified by teacher_id, no separate verify step)    */
  /* ---------------------------------------------------------------------- */

  // Always 200, whether or not the address is registered — the anti-enumeration rule.
  http.post('*/api/v1/school/auth/password/reset/request/', () => new HttpResponse(null)),

  http.post('*/api/v1/school/auth/password/reset/verify/', async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };
    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }
    return HttpResponse.json({ reset_token: MOCK_SCHOOL_RESET_TOKEN });
  }),

  http.post('*/api/v1/school/auth/password/reset/confirm/', async ({ request }) => {
    const body = (await request.json()) as { reset_token: string; password: string };
    if (body.reset_token !== MOCK_SCHOOL_RESET_TOKEN) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That reset link has expired. Request a new one.'),
        { status: 400 },
      );
    }
    return new HttpResponse(null);
  }),

  // Always 200, whether or not the teacher id is registered.
  http.post('*/api/v1/teacher/auth/password/reset/request/', () => new HttpResponse(null)),

  http.post('*/api/v1/teacher/auth/password/reset/confirm/', async ({ request }) => {
    const body = (await request.json()) as { teacher_id: string; code: string; password: string };
    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }
    return new HttpResponse(null);
  }),

  http.post('*/api/v1/auth/logout/', () => new HttpResponse(null, { status: 205 })),

  http.post('*/api/v1/auth/token/refresh/', () =>
    HttpResponse.json({ access: 'mock-access-token-2', refresh: 'mock-refresh-token-2' }),
  ),

  http.get('*/api/v1/teacher/auth/me/', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (!auth) {
      return HttpResponse.json(
        errorEnvelope('not_authenticated', 'Authentication credentials were not provided.'),
        {
          status: 401,
        },
      );
    }
    // §5.1's `/me/` shape — teacher-specific, not the generic `mockAuthUser`.
    return HttpResponse.json({
      id: mockAuthUser.id,
      teacher_id: 'GHS-T-00007',
      full_name: mockAuthUser.full_name,
      email: mockAuthUser.email,
      school: {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Greenwood Primary School',
      },
    });
  }),
];
