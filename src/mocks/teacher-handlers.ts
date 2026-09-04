import { http, HttpResponse } from 'msw';

import { activity, classPerformance, priorityCounts } from '@/mocks/data/teacher-activity-seed';
import {
  assessments,
  buildAnalytics,
  buildDetail,
  findAssessment,
  tabCounts,
} from '@/mocks/data/teacher-assessment-seed';
import {
  bankQuestions,
  bankSummary,
  questionLayouts,
  toAssessmentQuestion,
} from '@/mocks/data/teacher-question-seed';
import {
  attentionRows,
  bandLabels,
  dashboard,
  insights,
  levelCounts,
  students,
  teacherProfile,
} from '@/mocks/data/teacher-seed';
import { buildLearningProfile } from '@/mocks/data/teacher-student-seed';

/**
 * MSW handlers standing in for the Teacher Portal API.
 *
 * No Teacher endpoints are confirmed on the Django side — the backend ships
 * `apps.common` and `apps.users` only — so these model the contract the client
 * expects: DRF list envelopes, snake_case payloads, server-side
 * `search`/`page`/filter handling, and the shared error envelope from
 * `apps.common.exceptions.api_exception_handler`.
 *
 * Filtering happens here rather than in the browser on purpose. If the client
 * filtered a page of results, paging would be wrong the moment the list grew
 * past one page, and that bug would only appear against the real API.
 *
 * Writes mutate the in-memory seed, so creating an assessment and then
 * assigning it behaves as it will in production. State resets on reload.
 */

/** Mirrors `apps.common.exceptions.api_exception_handler`. */
function errorEnvelope(type: string, message: string, detail?: unknown) {
  return { error: { type, message, detail: detail ?? null, request_id: 'mock-request-id' } };
}

function notFound(message: string) {
  return HttpResponse.json(errorEnvelope('not_found', message), { status: 404 });
}

function validationError(detail: Record<string, string[]>) {
  return HttpResponse.json(
    errorEnvelope('validation_error', 'The data you sent is not valid.', detail),
    { status: 400 },
  );
}

interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  results: T[];
}

function paginate<T>(items: T[], url: URL, fallbackPageSize: number): Paginated<T> {
  const pageSize =
    Number(url.searchParams.get('page_size') ?? fallbackPageSize) || fallbackPageSize;
  const numPages = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = Number(url.searchParams.get('page') ?? 1) || 1;
  const page = Math.min(Math.max(1, requested), numPages);

  return {
    count: items.length,
    page,
    page_size: pageSize,
    num_pages: numPages,
    results: items.slice((page - 1) * pageSize, page * pageSize),
  };
}

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

function searchTerm(url: URL): string {
  return (url.searchParams.get('search') ?? '').trim().toLowerCase();
}

/** Reads a filter that is absent when the client means "everything". */
function filterValue(url: URL, key: string): string | null {
  const value = url.searchParams.get(key);
  return value && value !== 'all' ? value : null;
}

/** Loosely-typed read of a JSON body — every field is validated below. */
async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const BASE = '*/api/v1/teacher';

export const teacherHandlers = [
  http.get(`${BASE}/profile/`, () => HttpResponse.json(teacherProfile)),

  /* ---------------------------------------------------------------------- */
  /* Dashboard and drill-downs                                              */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/dashboard/`, () => HttpResponse.json(dashboard)),

  http.get(`${BASE}/activity/`, ({ request }) => {
    const url = new URL(request.url);
    const type = filterValue(url, 'type');
    const filtered = type ? activity.filter((item) => item.type === type) : activity;

    return HttpResponse.json(paginate(filtered, url, 8));
  }),

  http.get(`${BASE}/attention/`, ({ request }) => {
    const url = new URL(request.url);
    const priority = filterValue(url, 'priority');
    const term = searchTerm(url);

    const filtered = attentionRows.filter((row) => {
      if (priority && row.priority !== priority) return false;
      if (term && !matches(`${row.full_name} ${row.identified_issue}`, term)) return false;
      return true;
    });

    return HttpResponse.json({
      ...paginate(filtered, url, 8),
      priority_counts: priorityCounts,
    });
  }),

  http.get(`${BASE}/insights/`, () => HttpResponse.json(insights)),

  http.get(`${BASE}/class-performance/`, () => HttpResponse.json(classPerformance)),

  /* ---------------------------------------------------------------------- */
  /* Assessments                                                            */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/assessments/`, ({ request }) => {
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') ?? 'all';
    const term = searchTerm(url);
    const difficulty = filterValue(url, 'difficulty');
    const subject = filterValue(url, 'subject');
    const status = filterValue(url, 'status');
    const grade = filterValue(url, 'grade');

    const filtered = assessments.filter((assessment) => {
      if (tab === 'drafts' && assessment.status !== 'draft') return false;
      if ((tab === 'literacy' || tab === 'numeracy') && assessment.subject !== tab) return false;
      if (term && !matches(`${assessment.title} ${assessment.description}`, term)) return false;
      if (difficulty && assessment.difficulty !== difficulty) return false;
      if (subject && assessment.subject !== subject) return false;
      if (status && assessment.status !== status) return false;
      if (grade && String(assessment.grade_level) !== grade) return false;
      return true;
    });

    // `questions` stays on the detail response; the library only needs the card.
    const summaries = filtered.map(({ questions: _questions, ...summary }) => summary);

    return HttpResponse.json({ ...paginate(summaries, url, 6), tab_counts: tabCounts });
  }),

  http.post(`${BASE}/assessments/`, async ({ request }) => {
    const body = await readBody(request);
    const title = asString(body.title);
    const subject = asString(body.subject);
    const detail: Record<string, string[]> = {};

    if (!title) detail.title = ['Give the assessment a title.'];
    if (subject !== 'literacy' && subject !== 'numeracy') {
      detail.subject = ['Choose either literacy or numeracy.'];
    }
    if (Object.keys(detail).length > 0) return validationError(detail);

    const submitted = Array.isArray(body.questions) ? body.questions : [];
    const questions = submitted.map((entry, index) => {
      const raw = entry as Record<string, unknown>;
      const source = bankQuestions.find((question) => question.id === asString(raw.id));

      if (source) return toAssessmentQuestion(source, index + 1);

      return {
        id: `q-new-${String(Date.now())}-${String(index)}`,
        text: asString(raw.text),
        description: asString(raw.description) || null,
        subject: subject as 'literacy' | 'numeracy',
        level: Number(raw.level ?? 4),
        order: index + 1,
        point: Number(raw.point ?? 1),
        question_type: (asString(raw.question_type) || 'single_choice') as 'single_choice',
        layout: (raw.layout as null) ?? null,
        contents: (raw.contents ?? []) as never[],
        options: (raw.options ?? []) as never[],
      };
    });

    const created = {
      id: `asm-new-${String(assessments.length + 1)}`,
      title,
      description: asString(body.description),
      subject: subject as 'literacy' | 'numeracy',
      assessment_type: (asString(body.assessment_type) || 'practice') as 'practice',
      status: 'draft' as const,
      difficulty: (asString(body.difficulty) || 'core') as 'core',
      grade_label: asString(body.grade_label) || 'Primary 4',
      grade_level: Number(body.grade_level ?? 4),
      question_count: questions.length,
      time_limit_minutes:
        body.time_limit_minutes === null ? null : Number(body.time_limit_minutes ?? 30),
      assigned_count: 0,
      completed_count: 0,
      updated_at: new Date().toISOString(),
      updated_label: 'Draft · just now',
      questions,
    };

    assessments.unshift(created);
    tabCounts.all += 1;
    tabCounts.drafts += 1;
    tabCounts[created.subject] += 1;

    return HttpResponse.json(
      {
        id: created.id,
        title: created.title,
        status: created.status,
        question_count: created.question_count,
        questions: created.questions,
      },
      { status: 201 },
    );
  }),

  http.get(`${BASE}/assessments/:assessmentId/analytics/`, ({ params }) => {
    const assessment = findAssessment(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    return HttpResponse.json(buildAnalytics(assessment));
  }),

  http.post(`${BASE}/assessments/:assessmentId/assign/`, async ({ params, request }) => {
    const assessment = findAssessment(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    const body = await readBody(request);
    const studentIds = Array.isArray(body.student_ids) ? body.student_ids : [];
    const saveAsDraft = body.save_as_draft === true;

    if (!saveAsDraft && studentIds.length === 0) {
      return validationError({ student_ids: ['Choose at least one student.'] });
    }
    if (!saveAsDraft && !asString(body.starts_at)) {
      return validationError({ starts_at: ['Choose when the assessment opens.'] });
    }

    assessment.assigned_count = studentIds.length;
    assessment.status = saveAsDraft ? 'draft' : 'published';
    assessment.updated_at = new Date().toISOString();
    assessment.updated_label = saveAsDraft ? 'Draft · just now' : 'Scheduled · just now';

    return HttpResponse.json({
      id: assessment.id,
      status: assessment.status,
      assigned_count: assessment.assigned_count,
    });
  }),

  http.get(`${BASE}/assessments/:assessmentId/`, ({ params }) => {
    const assessment = findAssessment(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    return HttpResponse.json(buildDetail(assessment));
  }),

  /* ---------------------------------------------------------------------- */
  /* Builder lookups and the question bank                                  */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/question-layouts/`, () =>
    HttpResponse.json({ count: questionLayouts.length, results: questionLayouts }),
  ),

  http.get(`${BASE}/question-bank/summary/`, () => HttpResponse.json(bankSummary)),

  http.get(`${BASE}/question-bank/`, ({ request }) => {
    const url = new URL(request.url);
    const term = searchTerm(url);
    const subject = filterValue(url, 'subject');
    const questionType = filterValue(url, 'question_type');
    const level = filterValue(url, 'level');
    const difficulty = filterValue(url, 'difficulty');

    const filtered = bankQuestions.filter((question) => {
      if (term && !matches(`${question.text} ${question.skill} ${question.reference}`, term)) {
        return false;
      }
      if (subject && question.subject !== subject) return false;
      if (questionType && question.question_type !== questionType) return false;
      if (level && String(question.level) !== level) return false;
      if (difficulty && question.difficulty !== difficulty) return false;
      return true;
    });

    return HttpResponse.json(paginate(filtered, url, 8));
  }),

  /* ---------------------------------------------------------------------- */
  /* Students                                                               */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/students/`, ({ request }) => {
    const url = new URL(request.url);
    const term = searchTerm(url);
    const level = filterValue(url, 'level');

    const filtered = students.filter((student) => {
      if (term && !matches(`${student.full_name} ${student.student_code}`, term)) return false;
      if (level && student.level !== level) return false;
      return true;
    });

    const rows = filtered.map((student) => ({
      id: student.id,
      full_name: student.full_name,
      student_code: student.student_code,
      class_name: student.class_name,
      level: student.level,
      level_label: bandLabels[student.level],
      avatar_url: student.avatar_url,
      latest_score: student.latest_score,
      last_assessed: student.last_assessed,
      last_assessed_label: student.last_assessed_label,
      primary_gap: student.primary_gap,
      needs_attention: student.needs_attention,
    }));

    return HttpResponse.json({ ...paginate(rows, url, 10), level_counts: levelCounts });
  }),

  http.get(`${BASE}/students/:studentId/learning-profile/`, ({ params }) => {
    const profile = buildLearningProfile(String(params.studentId));
    if (!profile) return notFound('That student is not in your class.');

    return HttpResponse.json(profile);
  }),

  http.get(`${BASE}/students/:studentId/`, ({ params }) => {
    const student = students.find((entry) => entry.id === String(params.studentId));
    if (!student) return notFound('That student is not in your class.');

    return HttpResponse.json({
      id: student.id,
      full_name: student.full_name,
      student_code: student.student_code,
      class_name: student.class_name,
      level: student.level,
      avatar_url: student.avatar_url,
    });
  }),
];
