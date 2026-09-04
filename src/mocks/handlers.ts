import { http, HttpResponse } from 'msw';

import type { AuthUser } from '@/features/auth/api/auth.schema';
import { schoolAdminHandlers } from '@/mocks/school-admin-handlers';
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
 * School onboarding is not backed by a confirmed Django contract yet (see
 * `src/features/landing/api/endpoints.ts`). These handlers stand in for it so
 * the journey is fully clickable in development, and they deliberately model
 * the failure paths too — a wrong code is rejected rather than waved through.
 *
 * Registering does NOT return auth tokens: the visitor is not signed in by
 * completing this flow, and nothing here should imply otherwise.
 */
export const MOCK_VERIFICATION_CODE = '123456';

/** The only password the mock sign-in endpoints accept. */
export const MOCK_PASSWORD = 'password123';

/**
 * Whether the mock School Admin login pretends this device is unrecognised.
 *
 * The real backend decides this per request (unknown device, missing trust
 * cookie); MSW cannot, so it is a switch. Flip to `true` to walk the device
 * check at "/login/verify-device" — the code is `MOCK_VERIFICATION_CODE`.
 */
export const MOCK_ADMIN_DEVICE_CHECK = false;

const mockSchools = new Map<string, { schoolName: string; schoolEmail: string }>();

/**
 * Default happy-path handlers. Individual tests override one endpoint with
 * `server.use(...)` rather than editing this shared list.
 */
export const handlers = [
  ...schoolAdminHandlers,
  ...teacherHandlers,

  http.post('*/api/v1/school/auth/register/', async ({ request }) => {
    const body = (await request.json()) as { schoolName: string; schoolEmail: string };
    const schoolId = `school-${String(mockSchools.size + 1)}`;
    mockSchools.set(schoolId, { schoolName: body.schoolName, schoolEmail: body.schoolEmail });

    return HttpResponse.json(
      {
        schoolId,
        schoolName: body.schoolName,
        schoolEmail: body.schoolEmail,
        verificationRequired: true,
      },
      { status: 201 },
    );
  }),

  http.post('*/api/v1/school/auth/register/verify/', async ({ request }) => {
    const body = (await request.json()) as { schoolId: string; code: string };

    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }

    return HttpResponse.json({ schoolId: body.schoolId, verified: true });
  }),

  http.post('*/api/v1/school/auth/otp/resend/', async ({ request }) => {
    const body = (await request.json()) as { schoolId: string };
    const school = mockSchools.get(body.schoolId);

    if (!school) {
      return HttpResponse.json(errorEnvelope('not_found', 'We could not find that school.'), {
        status: 404,
      });
    }

    return HttpResponse.json({ schoolEmail: school.schoolEmail, retryAfterSeconds: 30 });
  }),

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
        verification_required: true,
        challenge_id: 'mock-device-challenge',
        email: body.email,
      });
    }

    return HttpResponse.json({
      verification_required: false,
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    });
  }),

  http.post('*/api/v1/school/auth/login/verify/', async ({ request }) => {
    const body = (await request.json()) as { challenge_id: string; code: string };

    if (body.code !== MOCK_VERIFICATION_CODE) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'That code is incorrect or has expired.', {
          code: ['Invalid verification code.'],
        }),
        { status: 400 },
      );
    }

    return HttpResponse.json({ access: 'mock-access-token', refresh: 'mock-refresh-token' });
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
    return HttpResponse.json(mockAuthUser);
  }),
];
