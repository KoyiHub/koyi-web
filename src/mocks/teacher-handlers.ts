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
  sendGuardianLinks,
  type StoredAssignment,
  withdrawAssignment,
} from '@/mocks/data/assignment-seed';
import { bankQuestions } from '@/mocks/data/bank-seed';
import {
  addMember,
  archiveGroup,
  findGroup,
  generateGroupLessonPlan,
  getGroupLessonPlan,
  getStudentLessonPlan,
  groups,
  removeMember,
  type SeedGroup,
  setLessonPlanFeedback,
} from '@/mocks/data/groups-seed';
import {
  computeAnalytics,
  computeStudentSkills,
  findStudentResult,
  getResults,
  toAnalyticsRosterRow,
  toResultsRow,
  toStudentResponses,
} from '@/mocks/data/results-seed';
import { skills } from '@/mocks/data/taxonomy-seed';
import { activity, classPerformance } from '@/mocks/data/teacher-activity-seed';
import { dashboard, insights, students } from '@/mocks/data/teacher-seed';

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

/** Below 4 current members, a group is flagged rather than dissolved — §5.6. */
function toGroupResponse(group: SeedGroup) {
  const currentSize = group.members.filter((member) => member.left_at === null).length;
  return {
    id: group.id,
    name: group.name,
    domain: group.domain,
    resource_tier: group.resource_tier,
    criteria: group.criteria,
    size: currentSize,
    stable_until: group.stable_until,
    is_thin: currentSize < 4,
    archived: group.archived,
  };
}

function toGroupDetailResponse(group: SeedGroup) {
  return { ...toGroupResponse(group), members: group.members };
}

const BASE = '*/api/v1/teacher';

export const teacherHandlers = [
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
    return HttpResponse.json(section.questions);
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

      return HttpResponse.json(section.questions);
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
  /* Results, analytics and review — frontend-integration.md §5.5           */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/assessments/:assessmentId/results/`, ({ params }) => {
    const assessment = findStored(String(params.assessmentId));
    if (!assessment) return notFound('That assessment does not exist.');
    const results = getResults(assessment.id);
    return HttpResponse.json({
      assessment_id: assessment.id,
      assessment_name: assessment.name,
      rows: (results?.students ?? []).map(toResultsRow),
    });
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

  /**
   * §5.6 — Paginated, no documented filters. `search` is still accepted
   * (harmless, and the assign-picker sends it) but the students page itself
   * filters client-side, matching the documented contract.
   */
  http.get(`${BASE}/students/`, ({ request }) => {
    const url = new URL(request.url);
    const term = searchTerm(url);

    const filtered = students.filter(
      (student) => !term || matches(`${student.full_name} ${student.student_id}`, term),
    );

    const rows = filtered.map((student) => ({
      id: student.id,
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      full_name: student.full_name,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      school_class: student.class_name,
    }));

    return HttpResponse.json(paginate(rows, url, 25));
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

  http.get(`${BASE}/students/:studentId/lesson-plan/`, ({ params }) => {
    const plan = getStudentLessonPlan(String(params.studentId));
    if (!plan) return notFound('The group plan already covers this child.');
    return HttpResponse.json(plan);
  }),

  /* ---------------------------------------------------------------------- */
  /* Groups and lesson plans — frontend-integration.md §5.6                 */
  /* ---------------------------------------------------------------------- */

  http.get(`${BASE}/groups/`, ({ request }) => {
    const url = new URL(request.url);
    const status = filterValue(url, 'status');
    const filtered =
      status === 'archived'
        ? groups.filter((group) => group.archived)
        : groups.filter((group) => !group.archived);
    return HttpResponse.json(filtered.map(toGroupResponse));
  }),

  http.post(`${BASE}/groups/`, async ({ request }) => {
    const body = (await readBody(request)) as {
      name?: string;
      domain?: string;
      resource_tier?: string;
      criteria?: unknown[];
    };
    if (!Array.isArray(body.criteria) || body.criteria.length === 0) {
      return validationError({ criteria: ['A group needs at least one criterion.'] });
    }
    if (!asString(body.name)) return validationError({ name: ['This field is required.'] });

    const created: SeedGroup = {
      id: `grp-${String(Date.now())}`,
      name: asString(body.name),
      domain: body.domain === 'numeracy' ? 'numeracy' : 'literacy',
      resource_tier:
        body.resource_tier === 'minimal' || body.resource_tier === 'equipped'
          ? body.resource_tier
          : 'basic',
      criteria: body.criteria as Record<string, unknown>[],
      stable_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      archived: false,
      members: [],
    };
    groups.push(created);
    return HttpResponse.json(toGroupDetailResponse(created), { status: 201 });
  }),

  http.post(`${BASE}/groups/form/`, () =>
    HttpResponse.json(groups.filter((g) => !g.archived).map(toGroupResponse)),
  ),

  http.get(`${BASE}/groups/:groupId/`, ({ params }) => {
    const group = findGroup(String(params.groupId));
    if (!group) return notFound('That group does not exist.');
    return HttpResponse.json(toGroupDetailResponse(group));
  }),

  http.delete(`${BASE}/groups/:groupId/`, ({ params }) => {
    const ok = archiveGroup(String(params.groupId));
    if (!ok) return notFound('That group does not exist.');
    return HttpResponse.json({});
  }),

  http.get(`${BASE}/groups/:groupId/members/`, ({ params, request }) => {
    const group = findGroup(String(params.groupId));
    if (!group) return notFound('That group does not exist.');
    const url = new URL(request.url);
    const currentOnly = url.searchParams.get('current') === 'true';
    const rows = currentOnly ? group.members.filter((m) => m.left_at === null) : group.members;
    return HttpResponse.json(rows);
  }),

  http.post(`${BASE}/groups/:groupId/members/`, async ({ params, request }) => {
    const body = (await readBody(request)) as { student_id?: string };
    const created = addMember(String(params.groupId), asString(body.student_id));
    if (!created) return notFound('That group or student does not exist.');
    return HttpResponse.json(created, { status: 201 });
  }),

  http.delete(`${BASE}/groups/:groupId/members/:studentId/`, ({ params }) => {
    const ok = removeMember(String(params.groupId), String(params.studentId));
    if (!ok) return notFound('That student is not a current member of this group.');
    return HttpResponse.json({});
  }),

  http.get(`${BASE}/groups/:groupId/lesson-plan/`, ({ params }) => {
    const plan = getGroupLessonPlan(String(params.groupId));
    if (!plan) return notFound('No plan has been generated yet.');
    return HttpResponse.json(plan);
  }),

  http.post(`${BASE}/groups/:groupId/lesson-plan/`, ({ params }) => {
    const group = findGroup(String(params.groupId));
    if (!group) return notFound('That group does not exist.');
    // Instant in the mock, but the shape still carries `status` correctly
    // so the polling UI is exercised by tests.
    const plan = generateGroupLessonPlan(group.id);
    return HttpResponse.json(plan, { status: 202 });
  }),

  http.post(`${BASE}/lesson-plans/:lessonPlanId/feedback/`, async ({ params, request }) => {
    const body = (await readBody(request)) as { was_helpful?: boolean };
    const ok = setLessonPlanFeedback(String(params.lessonPlanId), Boolean(body.was_helpful));
    if (!ok) return notFound('That lesson plan does not exist.');
    return HttpResponse.json({});
  }),
];
