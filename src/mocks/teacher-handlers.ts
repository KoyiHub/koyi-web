import { http, HttpResponse } from 'msw';

import {
  assessmentStore,
  computeCoverage,
  createAssessment,
  createSection,
  findStored,
  findStoredSection,
  publish,
  toAssessment,
} from '@/mocks/data/assessment-seed';
import {
  assignStudents,
  getAssignments,
  listClasses,
  sendGuardianLinks,
  type StoredAssignment,
  withdrawAssignment,
} from '@/mocks/data/assignment-seed';
import { bankQuestions } from '@/mocks/data/bank-seed';
import {
  computeAnalytics,
  computeReviewQueue,
  computeStudentSkills,
  findStudentResult,
  getResults,
  toAnalyticsRosterRow,
  toResultsRow,
  toStudentResponses,
} from '@/mocks/data/results-seed';
import { skills } from '@/mocks/data/taxonomy-seed';
import { activity, classPerformance, priorityCounts } from '@/mocks/data/teacher-activity-seed';
import {
  attentionRows,
  bandLabels,
  dashboard,
  insights,
  levelCounts,
  students,
  teacherProfile,
} from '@/mocks/data/teacher-seed';

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

/** Assignment rows carry the child's own name and code — `frontend-integration.md` §5.4. */
function toAssignmentRow(assignment: StoredAssignment) {
  const student = students.find((entry) => entry.id === assignment.student_id);
  return {
    id: assignment.id,
    student: assignment.student_id,
    student_name: student?.full_name ?? 'Unknown student',
    student_id: student?.student_code ?? '',
    school_class: student?.class_name ?? '',
    code: assignment.code,
    status: assignment.status,
    started_at: assignment.started_at,
    submitted_at: assignment.submitted_at,
    link_sent_at: assignment.link_sent_at,
  };
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
  /* Taxonomy and question bank — frontend-integration.md §5.2             */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/bank/skills/`, ({ request }) => {
    const url = new URL(request.url);
    const domain = filterValue(url, 'domain');
    const filtered = domain ? skills.filter((skill) => skill.domain === domain) : skills;
    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE}/bank/questions/`, ({ request }) => {
    const url = new URL(request.url);
    const term = searchTerm(url);
    const domain = filterValue(url, 'domain');
    const skillId = filterValue(url, 'skill');
    const subskillId = filterValue(url, 'subskill');
    const flnLevel = filterValue(url, 'fln_level');
    const type = filterValue(url, 'type');

    const filtered = bankQuestions.filter((question) => {
      if (term && !matches(`${question.content} ${question.skill_name}`, term)) return false;
      if (domain && question.domain !== domain) return false;
      if (skillId) {
        // The mock bank does not carry a separate skill id on each question;
        // `skill` filters by the skill's own id via the taxonomy lookup below.
        const bySkillId = skills.find((skill) => skill.id === skillId);
        if (bySkillId?.name !== question.skill_name) return false;
      }
      if (subskillId && question.subskill.id !== subskillId) return false;
      if (flnLevel && String(question.fln_level) !== flnLevel) return false;
      if (type && question.type !== type) return false;
      return true;
    });

    return HttpResponse.json(paginate(filtered, url, 10));
  }),

  http.get(`${BASE}/bank/questions/:questionId/`, ({ params }) => {
    const question = bankQuestions.find((candidate) => candidate.id === params.questionId);
    if (!question) return notFound('That bank question does not exist.');
    return HttpResponse.json(question);
  }),

  /* ---------------------------------------------------------------------- */
  /* Assessments — draft, then publish. frontend-integration.md §5.3        */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/assessments/`, ({ request }) => {
    const url = new URL(request.url);
    const term = searchTerm(url);
    const status = filterValue(url, 'status');

    const filtered = assessmentStore.filter((assessment) => {
      if (term && !matches(assessment.name, term)) return false;
      if (status && assessment.status !== status) return false;
      return true;
    });

    const page = paginate(filtered, url, 25);
    return HttpResponse.json({ ...page, results: page.results.map(toAssessment) });
  }),

  http.post(`${BASE}/assessments/`, async ({ request }) => {
    const body = await readBody(request);
    const name = asString(body.name);
    if (!name) return validationError({ name: ['Give the assessment a name.'] });

    const created = createAssessment({
      name,
      instructions: asString(body.instructions),
      opens_at: (body.opens_at as string | null) ?? null,
      closes_at: (body.closes_at as string | null) ?? null,
    });

    return HttpResponse.json(toAssessment(created), { status: 201 });
  }),

  http.get(`${BASE}/assessments/:assessmentId/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    return HttpResponse.json(toAssessment(assessment));
  }),

  http.patch(`${BASE}/assessments/:assessmentId/`, async ({ params, request }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    if (assessment.status !== 'draft') {
      return validationError({ status: ['A published assessment cannot be edited.'] });
    }

    const body = await readBody(request);
    if (typeof body.name === 'string') assessment.name = body.name;
    if (typeof body.instructions === 'string') assessment.instructions = body.instructions;
    if ('opens_at' in body) assessment.opens_at = body.opens_at as string | null;
    if ('closes_at' in body) assessment.closes_at = body.closes_at as string | null;

    return HttpResponse.json(toAssessment(assessment));
  }),

  http.delete(`${BASE}/assessments/:assessmentId/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    if (assessment.status !== 'draft') {
      return validationError({ status: ['A published assessment cannot be deleted.'] });
    }
    const index = assessmentStore.indexOf(assessment);
    assessmentStore.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/assessments/:assessmentId/sections/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    return HttpResponse.json(toAssessment(assessment).sections);
  }),

  http.post(`${BASE}/assessments/:assessmentId/sections/`, async ({ params, request }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    const body = await readBody(request);
    const domain = asString(body.domain);
    const name = asString(body.name);
    const detail: Record<string, string[]> = {};
    if (domain !== 'literacy' && domain !== 'numeracy')
      detail.domain = ['Choose either literacy or numeracy.'];
    if (!name) detail.name = ['Give the section a name.'];
    if (Object.keys(detail).length > 0) return validationError(detail);

    const section = createSection(assessment, {
      domain,
      name,
      instructions: asString(body.instructions),
      timer: (body.timer as string | null) ?? null,
      covers: Array.isArray(body.covers) ? (body.covers as string[]) : [],
    });

    return HttpResponse.json(
      toAssessment(assessment).sections.find((candidate) => candidate.id === section.id),
      {
        status: 201,
      },
    );
  }),

  http.delete(`${BASE}/assessments/:assessmentId/sections/:sectionId/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const index = assessment.sections.findIndex((section) => section.id === params.sectionId);
    if (index === -1) return notFound('That section does not exist.');
    assessment.sections.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/assessments/:assessmentId/sections/:sectionId/questions/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const section = findStoredSection(assessment, String(params.sectionId));
    if (!section) return notFound('That section does not exist.');
    return HttpResponse.json({ questions: section.questions });
  }),

  http.put(
    `${BASE}/assessments/:assessmentId/sections/:sectionId/questions/`,
    async ({ params, request }) => {
      const assessment = findStored(String(params.assessmentId));
      if (!assessment) return notFound('That assessment does not exist.');
      const section = findStoredSection(assessment, String(params.sectionId));
      if (!section) return notFound('That section does not exist.');

      const body = await readBody(request);
      const submitted = Array.isArray(body.questions) ? body.questions : [];

      // The client owns the ordered array and sends it whole — this replaces
      // the section's questions entirely rather than appending or patching.
      section.questions = submitted.map((entry, index) => {
        const raw = entry as Record<string, unknown>;
        return {
          id: asString(raw.id) || `q-${String(Date.now())}-${String(index)}`,
          subskill_id: asString(raw.subskill_id),
          fln_level: Number(raw.fln_level ?? 1) as never,
          question_type: (asString(raw.question_type) || 'single_choice') as never,
          layout: (raw.layout ?? null) as never,
          text: asString(raw.text),
          description: asString(raw.description),
          point: asString(raw.point) || '1.00',
          source_question_id: (raw.source_question_id as string | null) ?? null,
          contents: (raw.contents ?? []) as never,
          options: (raw.options ?? []) as never,
          answer: (raw.answer ?? null) as never,
        };
      });

      return HttpResponse.json({ questions: section.questions });
    },
  ),

  http.get(`${BASE}/assessments/:assessmentId/coverage/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    return HttpResponse.json(computeCoverage(assessment));
  }),

  http.post(`${BASE}/assessments/:assessmentId/publish/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    const result = publish(assessment);
    if (!result.ok) return validationError({ status: [result.message] });

    return HttpResponse.json(toAssessment(assessment));
  }),

  /* ---------------------------------------------------------------------- */
  /* Assignment and guardian links — frontend-integration.md §5.4           */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/assessments/:assessmentId/assignments/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    return HttpResponse.json(getAssignments(assessment.id).map(toAssignmentRow));
  }),

  http.post(`${BASE}/assessments/:assessmentId/assignments/`, async ({ params, request }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    if (assessment.status === 'draft') {
      return validationError({ status: ['Publish this paper before assigning it.'] });
    }

    const body = await readBody(request);
    const input = {
      student_ids: Array.isArray(body.student_ids) ? (body.student_ids as string[]) : undefined,
      class_ids: Array.isArray(body.class_ids) ? (body.class_ids as string[]) : undefined,
      all_my_students: body.all_my_students === true,
    };
    if (!input.student_ids?.length && !input.class_ids?.length && !input.all_my_students) {
      return validationError({
        non_field_errors: ['Choose at least one student, class, or "everyone".'],
      });
    }

    const created = assignStudents(assessment.id, input);
    return HttpResponse.json(created.map(toAssignmentRow), { status: 201 });
  }),

  http.delete(`${BASE}/assessments/:assessmentId/assignments/:assignmentId/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const result = withdrawAssignment(assessment.id, String(params.assignmentId));
    if (!result.ok) return validationError({ status: [result.message] });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/assessments/:assessmentId/assignments/roster/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');

    const rows = getAssignments(assessment.id).map((assignment) => {
      const student = students.find((entry) => entry.id === assignment.student_id);
      return {
        student_name: student?.full_name ?? 'Unknown student',
        student_id: student?.student_code ?? '',
        school_class: student?.class_name ?? '',
        code: assignment.code,
        status: assignment.status,
      };
    });

    return HttpResponse.json({
      assessment_id: assessment.id,
      assessment_name: assessment.name,
      assessment_code: assessment.code,
      opens_at: assessment.opens_at,
      closes_at: assessment.closes_at,
      rows,
    });
  }),

  http.post(
    `${BASE}/assessments/:assessmentId/assignments/:assignmentId/send-link/`,
    ({ params }) => {
      const assessment = findStored(String(params.assessmentId));
      if (!assessment) return notFound('That assessment does not exist.');
      const result = sendGuardianLinks(assessment.id, [String(params.assignmentId)]);
      return HttpResponse.json(result);
    },
  ),

  http.post(
    `${BASE}/assessments/:assessmentId/assignments/send-links/`,
    async ({ params, request }) => {
      const assessment = findStored(String(params.assessmentId));
      if (!assessment) return notFound('That assessment does not exist.');
      const body = await readBody(request);
      const ids = Array.isArray(body.assignment_ids) ? (body.assignment_ids as string[]) : [];
      const result = sendGuardianLinks(assessment.id, ids);
      return HttpResponse.json(result);
    },
  ),

  /* ---------------------------------------------------------------------- */
  /* Classes                                                                */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/classes/`, () => HttpResponse.json(listClasses())),

  /* ---------------------------------------------------------------------- */
  /* Results, analytics and review — frontend-integration.md §5.5           */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/assessments/:assessmentId/results/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const results = getResults(assessment.id);
    return HttpResponse.json((results?.students ?? []).map(toResultsRow));
  }),

  http.get(`${BASE}/assessments/:assessmentId/results/:studentId/responses/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const result = findStudentResult(assessment.id, String(params.studentId));
    if (!result) return notFound('That child is not assigned to this paper.');
    if (!result.submitted) {
      return validationError({ status: ['This child has not submitted this paper yet.'] });
    }
    return HttpResponse.json(toStudentResponses(assessment, result));
  }),

  http.get(`${BASE}/assessments/:assessmentId/review-queue/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const results = getResults(assessment.id);
    return HttpResponse.json(results ? computeReviewQueue(results) : []);
  }),

  http.get(`${BASE}/assessments/:assessmentId/analytics/`, ({ params, request }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const results = getResults(assessment.id);
    if (!results) return notFound('That assessment does not exist.');

    const url = new URL(request.url);
    const includeNarrative = url.searchParams.get('narrative') !== 'false';
    return HttpResponse.json(computeAnalytics(results, includeNarrative));
  }),

  http.get(`${BASE}/assessments/:assessmentId/analytics/roster/`, ({ params, request }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const results = getResults(assessment.id);
    if (!results) return HttpResponse.json([]);

    const url = new URL(request.url);
    const domain = filterValue(url, 'domain');
    const level = filterValue(url, 'level');

    const rows = results.students
      .filter((student) => student.submitted)
      .map(toAnalyticsRosterRow)
      .filter((row) => {
        if (domain === 'literacy' && row.literacy_level === null) return false;
        if (domain === 'numeracy' && row.numeracy_level === null) return false;
        if (level) {
          const target = Number(level);
          if (row.literacy_level !== target && row.numeracy_level !== target) return false;
        }
        return true;
      });

    return HttpResponse.json(rows);
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

  http.get(`${BASE}/students/:studentId/skills/`, ({ params }) => {
    const studentId = String(params.studentId);
    if (!students.some((entry) => entry.id === studentId)) {
      return notFound('That student is not in your class.');
    }
    const studentSkills = computeStudentSkills(studentId);
    if (!studentSkills) return notFound('This child has not sat an assessment yet.');
    return HttpResponse.json(studentSkills);
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
