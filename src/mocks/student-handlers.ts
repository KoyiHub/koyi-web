import { http, HttpResponse } from 'msw';

import {
  currentSession,
  findSection,
  getSections,
  MOCK_ASSESSMENT_CODE,
  MOCK_ASSIGNMENT_CODE,
  MOCK_STUDENT_NAME,
  startNewSitting,
  startSection,
  submitSection,
  verifyAttempt,
} from '@/mocks/data/runner-seed';

/** Mirrors the real envelope from `apps.common.exceptions.api_exception_handler`. */
function errorEnvelope(type: string, message: string, detail?: unknown) {
  return { error: { type, message, detail: detail ?? null, request_id: 'test-request-id' } };
}

/**
 * `frontend-integration.md` §6 — the assessment runner API. No account, no
 * password, just a sitting session carried as `X-Sitting-Session`.
 *
 * Every failure on `verify` uses the **same** message — wrong code, not
 * assigned, disabled, already finished are deliberately indistinguishable
 * (§6, §9). A `429` is its own case: the rate limiter, not a wrong code.
 */
function overviewPayload() {
  return {
    assessment_id: 'asm-runner-mock',
    name: 'Term 1 baseline',
    instructions: 'Answer each question as best you can. Ask your teacher if you need help.',
    code: MOCK_ASSESSMENT_CODE,
    student_name: MOCK_STUDENT_NAME,
    status: 'open',
    sections: getSections().map((section) => ({
      id: section.id,
      name: section.name,
      domain: section.domain,
      order: section.order,
      timer: section.timer,
      status: section.status,
      question_count: section.questions.length,
      started_at: section.started_at,
      submitted_at: section.submitted_at,
      expires_at: section.expires_at,
    })),
  };
}

function requireSession(request: Request): boolean {
  const header = request.headers.get('X-Sitting-Session');
  return Boolean(header) && header === currentSession();
}

export const studentHandlers = [
  http.post('*/api/v1/student/assessment/verify/', async ({ request }) => {
    const body = (await request.json()) as { assessment_code?: string; code?: string };
    const attempt = verifyAttempt();

    if (attempt.rateLimited) {
      return HttpResponse.json(
        errorEnvelope('throttled', 'Too many attempts. Please wait a minute and try again.'),
        { status: 429 },
      );
    }

    const matches =
      body.assessment_code?.trim().toUpperCase() === MOCK_ASSESSMENT_CODE &&
      body.code?.trim().toUpperCase() === MOCK_ASSIGNMENT_CODE;

    if (!matches) {
      return HttpResponse.json(
        errorEnvelope(
          'not_found',
          'We could not find that assessment. Check both codes with your teacher.',
        ),
        { status: 400 },
      );
    }

    const sitting = startNewSitting();
    return HttpResponse.json({ ...sitting, assessment: overviewPayload() });
  }),

  http.get('*/api/v1/student/assessment/', ({ request }) => {
    if (!requireSession(request)) {
      return HttpResponse.json(errorEnvelope('not_authenticated', 'Your sitting has expired.'), {
        status: 401,
      });
    }
    return HttpResponse.json(overviewPayload());
  }),

  http.post('*/api/v1/student/assessment/sections/:sectionId/start/', ({ request, params }) => {
    if (!requireSession(request)) {
      return HttpResponse.json(errorEnvelope('not_authenticated', 'Your sitting has expired.'), {
        status: 401,
      });
    }
    const sectionId = String(params.sectionId);
    const section = startSection(sectionId);
    if (!section) {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'This section is not available right now.'),
        { status: 400 },
      );
    }

    return HttpResponse.json({
      section: {
        id: section.id,
        name: section.name,
        domain: section.domain,
        order: section.order,
        timer: section.timer,
        status: section.status,
        question_count: section.questions.length,
        started_at: section.started_at,
        submitted_at: section.submitted_at,
        expires_at: section.expires_at,
      },
      questions: section.questions.map((question) => ({
        id: question.id,
        order: question.order,
        text: question.text,
        question_type: question.question_type,
        layout: question.layout,
        point: question.point,
        fln_level: question.fln_level,
        subskill_name: question.subskill_name,
        contents: question.contents,
        // No `is_correct` — the runner never receives the answer key.
        options: question.options,
      })),
    });
  }),

  http.put('*/api/v1/student/assessment/responses/:questionId/', ({ request }) => {
    if (!requireSession(request)) {
      return HttpResponse.json(errorEnvelope('not_authenticated', 'Your sitting has expired.'), {
        status: 401,
      });
    }
    return HttpResponse.json({ ok: true });
  }),

  http.post('*/api/v1/student/assessment/sections/:sectionId/submit/', ({ request, params }) => {
    if (!requireSession(request)) {
      return HttpResponse.json(errorEnvelope('not_authenticated', 'Your sitting has expired.'), {
        status: 401,
      });
    }
    const sectionId = String(params.sectionId);
    const section = findSection(sectionId);
    if (section?.status !== 'in_progress') {
      return HttpResponse.json(
        errorEnvelope('validation_error', 'This section has already been submitted.'),
        { status: 400 },
      );
    }

    submitSection(sectionId);
    const overview = overviewPayload();
    const finished = overview.sections.every((candidate) => candidate.status === 'submitted');

    return HttpResponse.json({
      status: finished ? 'finished' : 'in_progress',
      assessment: overview,
    });
  }),
];
