import { http, HttpResponse } from 'msw';

import {
  assessments,
  type AssessmentStatus,
  classes,
  grades,
  school,
  type SeedClass,
  type SeedStudent,
  type SeedTeacher,
  sessions,
  students,
  teachers,
} from '@/mocks/data/school-admin-seed';

/**
 * MSW handlers for the School Portal API — `frontend-integration.md` §4,
 * matched field-for-field so switching to the real backend is a base-URL
 * change. Writes mutate the in-memory seed so that adding, disabling or
 * transferring something shows up in every list afterwards, exactly as the
 * real API would behave. State resets on reload.
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

/**
 * A validation failure whose whole story is one sentence — the UI reads
 * `error.message` directly rather than a per-field `detail` entry, so the
 * envelope's top-level `message` carries the specific text.
 */
function singleMessageError(field: string, message: string) {
  return HttpResponse.json(errorEnvelope('validation_error', message, { [field]: [message] }), {
    status: 400,
  });
}

const DEFAULT_PAGE_SIZE = 25;

interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  results: T[];
}

function paginate<T>(items: T[], url: URL, fallbackPageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
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

function requiredFields(
  body: Record<string, unknown>,
  fields: string[],
): Record<string, string[]> | null {
  const detail: Record<string, string[]> = {};

  for (const field of fields) {
    if (!asString(body[field])) detail[field] = ['This field is required.'];
  }

  return Object.keys(detail).length > 0 ? detail : null;
}

/** The code every two-step delete flow in this mock accepts — mirrors `MOCK_VERIFICATION_CODE`. */
const DELETE_CONFIRMATION_CODE = '123456';

/* -------------------------------------------------------------------------- */
/* Activity feed — §4.6, cursor-paginated                                     */
/* -------------------------------------------------------------------------- */

interface ActivityRef {
  id: string;
  name: string;
}

interface ActivityRow {
  id: string;
  action: string;
  label: string;
  description: string;
  teacher: ActivityRef | null;
  student: ActivityRef | null;
  school_class: ActivityRef | null;
  assessment: ActivityRef | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

let activityCounter = 0;

function nextActivityId(): string {
  activityCounter += 1;
  return `act-${String(activityCounter)}`;
}

function logActivity(row: Omit<ActivityRow, 'id'>) {
  activityLog.unshift({ id: nextActivityId(), ...row });
}

function classLabel(classId: string | null): string | null {
  return classes.find((entry) => entry.id === classId)?.label ?? null;
}

function seedActivityLog(): ActivityRow[] {
  const rows: ActivityRow[] = [];

  for (const teacher of teachers) {
    rows.push({
      id: nextActivityId(),
      action: 'teacher_added',
      label: `New teacher added: ${teacher.full_name}`,
      description: `${teacher.full_name} joined as a teacher.`,
      teacher: { id: teacher.id, name: teacher.full_name },
      student: null,
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: teacher.created_at,
    });
  }

  for (const entry of classes) {
    rows.push({
      id: nextActivityId(),
      action: 'class_created',
      label: `Class created: ${entry.label}`,
      description: `${entry.label} was added to the school.`,
      teacher: null,
      student: null,
      school_class: { id: entry.id, name: entry.label },
      assessment: null,
      metadata: {},
      occurred_at: isoNow(),
    });
  }

  for (const student of students) {
    rows.push({
      id: nextActivityId(),
      action: 'student_admitted',
      label: `Student enrolled: ${student.full_name}`,
      description: `${student.full_name} was enrolled in ${classLabel(student.class_id) ?? 'the school'}.`,
      teacher: null,
      student: { id: student.id, name: student.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: student.created_at,
    });
  }

  for (const assessment of assessments) {
    if (assessment.status === 'draft') continue;
    const teacher = teachers.find((entry) => entry.id === assessment.created_by);
    const action = assessment.status === 'closed' ? 'assessment_closed' : 'assessment_published';
    const verb = assessment.status === 'closed' ? 'closed' : 'published';

    rows.push({
      id: nextActivityId(),
      action,
      label: `Assessment ${verb}: ${assessment.name}`,
      description: `${teacher?.full_name ?? 'A teacher'} ${verb} "${assessment.name}".`,
      teacher: teacher ? { id: teacher.id, name: teacher.full_name } : null,
      student: null,
      school_class: null,
      assessment: { id: assessment.id, name: assessment.name },
      metadata: {},
      occurred_at: assessment.created_at,
    });
  }

  return rows.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
}

function isoNow(): string {
  return new Date().toISOString();
}

const activityLog: ActivityRow[] = seedActivityLog();

/* -------------------------------------------------------------------------- */
/* Serializers                                                                */
/* -------------------------------------------------------------------------- */

function classResponse(entry: SeedClass) {
  return {
    id: entry.id,
    grade: entry.grade_id,
    grade_name: entry.grade_name,
    name: entry.name,
    label: entry.label,
  };
}

function classForId(classId: string | null) {
  if (!classId) return null;
  const entry = classes.find((item) => item.id === classId);
  return entry ? classResponse(entry) : null;
}

function teacherResponse(teacher: SeedTeacher) {
  return {
    id: teacher.id,
    teacher_id: teacher.teacher_id,
    email: teacher.email,
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    full_name: teacher.full_name,
    school_class: classForId(teacher.class_id),
    is_active: teacher.is_active,
    created_at: teacher.created_at,
    updated_at: teacher.updated_at,
  };
}

function studentResponse(student: SeedStudent) {
  return {
    id: student.id,
    student_id: student.student_id,
    first_name: student.first_name,
    last_name: student.last_name,
    full_name: student.full_name,
    date_of_birth: student.date_of_birth,
    gender: student.gender,
    school_class: classForId(student.class_id),
    guardian_name: student.guardian_name,
    guardian_phone_number: student.guardian_phone_number,
    guardian_email: student.guardian_email,
    guardian_relationship: student.guardian_relationship,
    is_active: student.is_active,
    created_at: student.created_at,
    updated_at: student.updated_at,
  };
}

function studentFlnResponse(student: SeedStudent) {
  if (!student.fln) return null;

  return {
    student: { id: student.id, full_name: student.full_name, student_id: student.student_id },
    literacy_level: student.fln.literacy_level,
    numeracy_level: student.fln.numeracy_level,
    last_assessed_at: student.fln.last_assessed_at,
    recent_results: student.fln.recent_results,
  };
}

function assessmentResponse(assessment: (typeof assessments)[number]) {
  const teacher = teachers.find((entry) => entry.id === assessment.created_by);

  return {
    id: assessment.id,
    name: assessment.name,
    teacher_name: teacher?.full_name ?? null,
    code: assessment.code,
    status: assessment.status,
    opens_at: assessment.opens_at,
    closes_at: assessment.closes_at,
    assigned_count: assessment.assigned_count,
    graded_count: assessment.graded_count,
    created_at: assessment.created_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Mutable profile state                                                     */
/* -------------------------------------------------------------------------- */

const schoolProfile = { ...school };

function currentSession() {
  return sessions.find((entry) => entry.id === schoolProfile.current_session_id) ?? sessions[0]!;
}

function profileResponse() {
  return {
    id: schoolProfile.id,
    name: schoolProfile.name,
    abbreviation: schoolProfile.abbreviation,
    email: schoolProfile.email,
    email_verified: true,
    class_system: schoolProfile.class_system,
    logo: null,
    current_session: currentSession(),
  };
}

/* -------------------------------------------------------------------------- */
/* Handlers                                                                   */
/* -------------------------------------------------------------------------- */

const BASE = '*/api/v1/school';

export const schoolAdminHandlers = [
  http.get(`${BASE}/profile/`, () => HttpResponse.json(profileResponse())),

  /** `abbreviation` is read-only after registration — including it is a `400`. */
  http.patch(`${BASE}/profile/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['name']);
    if (missing) return validationError(missing);

    if (body.abbreviation !== undefined) {
      return validationError({ abbreviation: ['This field cannot be changed.'] });
    }

    if (body.current_session !== undefined) {
      const sessionEntry = sessions.find((entry) => entry.id === asString(body.current_session));
      if (!sessionEntry) return validationError({ current_session: ['Select a valid session.'] });
      schoolProfile.current_session_id = sessionEntry.id;
    }

    schoolProfile.name = asString(body.name);

    return HttpResponse.json(profileResponse());
  }),

  http.post(`${BASE}/profile/password/change/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['current_password', 'new_password', 'confirm_password']);
    if (missing) return validationError(missing);

    if (asString(body.new_password).length < 8) {
      return validationError({ new_password: ['Use at least 8 characters.'] });
    }
    if (asString(body.new_password) !== asString(body.confirm_password)) {
      return validationError({ confirm_password: ['Passwords do not match.'] });
    }
    if (asString(body.current_password) !== 'password123') {
      return validationError({ current_password: ['That password is incorrect.'] });
    }

    return HttpResponse.json({ detail: 'Your password has been updated.' });
  }),

  http.get(`${BASE}/sessions/`, () => HttpResponse.json(sessions)),

  http.get(`${BASE}/overview/`, () => {
    const levels: { literacy: Record<string, number>; numeracy: Record<string, number> } = {
      literacy: {},
      numeracy: {},
    };
    const unplaced = { literacy: 0, numeracy: 0 };

    for (const student of students) {
      if (!student.is_active) continue;
      if (!student.fln) {
        unplaced.literacy += 1;
        unplaced.numeracy += 1;
        continue;
      }
      const literacyKey = String(student.fln.literacy_level);
      const numeracyKey = String(student.fln.numeracy_level);
      levels.literacy[literacyKey] = (levels.literacy[literacyKey] ?? 0) + 1;
      levels.numeracy[numeracyKey] = (levels.numeracy[numeracyKey] ?? 0) + 1;
    }

    const statusBreakdown: Record<AssessmentStatus, number> = {
      draft: 0,
      published: 0,
      closed: 0,
    };
    for (const assessment of assessments) statusBreakdown[assessment.status] += 1;

    const gradedPercentages = students.flatMap(
      (student) =>
        student.fln?.recent_results
          .filter((result) => result.status === 'graded')
          .map((result) => Number(result.percentage)) ?? [],
    );
    const averageGradedScore =
      gradedPercentages.length > 0
        ? gradedPercentages.reduce((total, value) => total + value, 0) / gradedPercentages.length
        : 0;

    return HttpResponse.json({
      students: students.length,
      teachers: teachers.length,
      assessments: assessments.length,
      active_assessments: statusBreakdown.published,
      assessment_status_breakdown: statusBreakdown,
      level_distribution: { levels, unplaced },
      average_graded_score: averageGradedScore.toFixed(2),
      current_session: currentSession().label,
    });
  }),

  http.get(`${BASE}/activity/`, ({ request }) => {
    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacher');
    const studentId = url.searchParams.get('student');
    const classId = url.searchParams.get('school_class');
    const action = url.searchParams.get('action');
    const from = url.searchParams.get('occurred_from');
    const to = url.searchParams.get('occurred_to');

    const filtered = activityLog.filter((row) => {
      if (teacherId && row.teacher?.id !== teacherId) return false;
      if (studentId && row.student?.id !== studentId) return false;
      if (classId && row.school_class?.id !== classId) return false;
      if (action && row.action !== action) return false;
      if (from && row.occurred_at < from) return false;
      if (to && row.occurred_at > to) return false;
      return true;
    });

    const pageSize = 15;
    const cursor = Number(url.searchParams.get('cursor') ?? 0) || 0;
    const start = Math.max(0, cursor);
    const page = filtered.slice(start, start + pageSize);
    const hasNext = start + pageSize < filtered.length;

    const nextUrl = new URL(url);
    nextUrl.searchParams.set('cursor', String(start + pageSize));

    return HttpResponse.json({
      next: hasNext ? nextUrl.toString() : null,
      previous: null,
      results: page,
    });
  }),

  http.get(`${BASE}/assessments/`, ({ request }) => {
    const url = new URL(request.url);
    const sorted = [...assessments].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json(paginate(sorted.map(assessmentResponse), url));
  }),

  http.get(`${BASE}/grades/`, () => HttpResponse.json(grades)),

  http.get(`${BASE}/classes/`, ({ request }) => {
    const url = new URL(request.url);
    const gradeId = url.searchParams.get('grade');

    const filtered = classes.filter(
      (entry) => !gradeId || gradeId === 'all' || entry.grade_id === gradeId,
    );

    return HttpResponse.json(filtered.map(classResponse));
  }),

  http.post(`${BASE}/classes/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['grade', 'name']);
    if (missing) return validationError(missing);

    const grade = grades.find((entry) => entry.id === asString(body.grade));
    if (!grade) return validationError({ grade: ['Select a valid grade.'] });

    const name = asString(body.name);
    const duplicate = classes.some(
      (entry) => entry.grade_id === grade.id && entry.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      return validationError({ name: [`${grade.name} already has a class called ${name}.`] });
    }

    const created: SeedClass = {
      id: `cls-${String(Date.now())}`,
      grade_id: grade.id,
      grade_name: grade.name,
      name,
      label: `${grade.name} ${name}`,
    };

    classes.push(created);
    logActivity({
      action: 'class_created',
      label: `Class created: ${created.label}`,
      description: `${created.label} was added to the school.`,
      teacher: null,
      student: null,
      school_class: { id: created.id, name: created.label },
      assessment: null,
      metadata: {},
      occurred_at: isoNow(),
    });

    return HttpResponse.json(classResponse(created), { status: 201 });
  }),

  /** Refused with `400` while any student is still enrolled — §4.3. */
  http.delete(`${BASE}/classes/:classId/`, ({ params }) => {
    const index = classes.findIndex((item) => item.id === params.classId);
    if (index === -1) return notFound('We could not find that class.');

    const entry = classes[index]!;
    const occupied = students.some((student) => student.class_id === entry.id);
    if (occupied) {
      return singleMessageError(
        'class',
        'Transfer every student out of this class before deleting it.',
      );
    }

    classes.splice(index, 1);
    return HttpResponse.json({});
  }),

  http.get(`${BASE}/teachers/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const classId = url.searchParams.get('school_class');

    const filtered = teachers.filter((teacher) => {
      if (classId && classId !== 'all' && teacher.class_id !== classId) return false;
      if (!search) return true;
      return matches(teacher.full_name, search) || matches(teacher.teacher_id, search);
    });

    return HttpResponse.json(paginate(filtered.map(teacherResponse), url));
  }),

  http.post(`${BASE}/teachers/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['first_name', 'last_name', 'email', 'password']);
    if (missing) return validationError(missing);

    const email = asString(body.email).toLowerCase();
    if (teachers.some((teacher) => teacher.email.toLowerCase() === email)) {
      return validationError({ email: ['A teacher with this email already exists.'] });
    }

    const schoolClassId = asString(body.school_class) || null;
    const firstName = asString(body.first_name);
    const lastName = asString(body.last_name);
    const now = isoNow();

    const created: SeedTeacher = {
      id: `tch-${String(Date.now())}`,
      teacher_id: `${school.abbreviation}-T${String(teachers.length + 1).padStart(3, '0')}`,
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      class_id: schoolClassId,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    teachers.unshift(created);
    logActivity({
      action: 'teacher_added',
      label: `New teacher added: ${created.full_name}`,
      description: `${created.full_name} joined as a teacher.`,
      teacher: { id: created.id, name: created.full_name },
      student: null,
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: created.created_at,
    });

    return HttpResponse.json(teacherResponse(created), { status: 201 });
  }),

  http.get(`${BASE}/teachers/:teacherId/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    return HttpResponse.json(teacherResponse(teacher));
  }),

  http.post(`${BASE}/teachers/:teacherId/disable/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    teacher.is_active = false;
    teacher.updated_at = isoNow();
    logActivity({
      action: 'teacher_disabled',
      label: `Teacher disabled: ${teacher.full_name}`,
      description: `${teacher.full_name}'s account was disabled.`,
      teacher: { id: teacher.id, name: teacher.full_name },
      student: null,
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: teacher.updated_at,
    });
    return HttpResponse.json(teacherResponse(teacher));
  }),

  http.post(`${BASE}/teachers/:teacherId/enable/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    teacher.is_active = true;
    teacher.updated_at = isoNow();
    return HttpResponse.json(teacherResponse(teacher));
  }),

  /** Emails a reset link — §4.4. No password or mode ever reaches this response. */
  http.post(`${BASE}/teachers/:teacherId/password-reset/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    return HttpResponse.json({ sent: true });
  }),

  http.post(`${BASE}/teachers/:teacherId/delete/request/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    return HttpResponse.json({ sent: true });
  }),

  http.post(`${BASE}/teachers/:teacherId/delete/confirm/`, async ({ params, request }) => {
    const index = teachers.findIndex((item) => item.id === params.teacherId);
    if (index === -1) return notFound('We could not find that teacher.');

    const body = await readBody(request);
    if (asString(body.code) !== DELETE_CONFIRMATION_CODE) {
      return singleMessageError('code', 'That code is incorrect or has expired.');
    }

    const [removed] = teachers.splice(index, 1);
    if (removed) {
      logActivity({
        action: 'teacher_removed',
        label: `Teacher removed: ${removed.full_name}`,
        description: `${removed.full_name}'s account was removed.`,
        teacher: null,
        student: null,
        school_class: null,
        assessment: null,
        metadata: {},
        occurred_at: isoNow(),
      });
    }

    return HttpResponse.json({});
  }),

  http.get(`${BASE}/students/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const classId = url.searchParams.get('school_class');

    const filtered = students.filter((student) => {
      if (classId && classId !== 'all' && student.class_id !== classId) return false;
      if (!search) return true;
      return matches(student.full_name, search) || matches(student.student_id, search);
    });

    return HttpResponse.json(paginate(filtered.map(studentResponse), url));
  }),

  http.post(`${BASE}/students/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, [
      'first_name',
      'last_name',
      'school_class',
      'date_of_birth',
      'gender',
      'guardian_name',
      'guardian_phone_number',
      'guardian_relationship',
    ]);
    if (missing) return validationError(missing);

    const studentClass = classes.find((entry) => entry.id === asString(body.school_class));
    if (!studentClass) return validationError({ school_class: ['Select a valid class.'] });

    const dateOfBirth = asString(body.date_of_birth);
    const birthYear = Number(dateOfBirth.slice(0, 4));
    if (!birthYear || birthYear > 2026) {
      return validationError({ date_of_birth: ['Enter a valid date of birth.'] });
    }

    const firstName = asString(body.first_name);
    const lastName = asString(body.last_name);
    const guardianEmail = asString(body.guardian_email);
    const now = isoNow();

    const created: SeedStudent = {
      id: `stu-${String(Date.now())}`,
      // Always server-generated — never accepted from the request body.
      student_id: `${school.abbreviation}-${String(students.length + 1).padStart(4, '0')}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      date_of_birth: new Date(dateOfBirth).toISOString(),
      gender: asString(body.gender) === 'male' ? 'male' : 'female',
      class_id: studentClass.id,
      is_active: true,
      guardian_name: asString(body.guardian_name),
      guardian_phone_number: asString(body.guardian_phone_number),
      guardian_email: guardianEmail || null,
      guardian_relationship: asString(body.guardian_relationship),
      created_at: now,
      updated_at: now,
      // No sitting yet — the `/fln/` endpoint 404s until this student is assessed.
      fln: null,
    };

    students.unshift(created);
    logActivity({
      action: 'student_admitted',
      label: `Student enrolled: ${created.full_name}`,
      description: `${created.full_name} was enrolled in ${studentClass.label}.`,
      teacher: null,
      student: { id: created.id, name: created.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: created.created_at,
    });

    return HttpResponse.json(studentResponse(created), { status: 201 });
  }),

  http.get(`${BASE}/students/:studentId/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    return HttpResponse.json(studentResponse(student));
  }),

  http.get(`${BASE}/students/:studentId/fln/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');

    const fln = studentFlnResponse(student);
    if (!fln) return notFound('This student has not sat an assessment yet.');

    return HttpResponse.json(fln);
  }),

  http.post(`${BASE}/students/:studentId/disable/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    student.is_active = false;
    student.updated_at = isoNow();
    logActivity({
      action: 'student_disabled',
      label: `Student disabled: ${student.full_name}`,
      description: `${student.full_name}'s account was disabled.`,
      teacher: null,
      student: { id: student.id, name: student.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: student.updated_at,
    });
    return HttpResponse.json(studentResponse(student));
  }),

  http.post(`${BASE}/students/:studentId/enable/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    student.is_active = true;
    student.updated_at = isoNow();
    return HttpResponse.json(studentResponse(student));
  }),

  http.post(`${BASE}/students/:studentId/delete/request/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    return HttpResponse.json({ sent: true });
  }),

  http.post(`${BASE}/students/:studentId/delete/confirm/`, async ({ params, request }) => {
    const index = students.findIndex((item) => item.id === params.studentId);
    if (index === -1) return notFound('We could not find that student.');

    const body = await readBody(request);
    if (asString(body.code) !== DELETE_CONFIRMATION_CODE) {
      return singleMessageError('code', 'That code is incorrect or has expired.');
    }

    const [removed] = students.splice(index, 1);
    if (removed) {
      logActivity({
        action: 'student_removed',
        label: `Student removed: ${removed.full_name}`,
        description: `${removed.full_name} was removed from the school.`,
        teacher: null,
        student: null,
        school_class: null,
        assessment: null,
        metadata: {},
        occurred_at: isoNow(),
      });
    }

    return HttpResponse.json({});
  }),

  http.post(`${BASE}/students/transfer/`, async ({ request }) => {
    const body = await readBody(request);
    const studentIds = Array.isArray(body.student_ids)
      ? body.student_ids.filter((value): value is string => typeof value === 'string')
      : [];
    const toClassId = asString(body.to_class);

    const toClass = classes.find((entry) => entry.id === toClassId);
    if (!toClass) return validationError({ to_class: ['Select a valid class.'] });
    if (studentIds.length === 0) {
      return validationError({ student_ids: ['Select at least one student.'] });
    }

    let moved = 0;
    for (const student of students) {
      if (!studentIds.includes(student.id)) continue;
      student.class_id = toClass.id;
      student.updated_at = isoNow();
      moved += 1;
    }

    if (moved > 0) {
      logActivity({
        action: 'students_transferred',
        label: `${String(moved)} student(s) transferred to ${toClass.label}`,
        description: `${String(moved)} student(s) were moved to ${toClass.label}.`,
        teacher: null,
        student: null,
        school_class: { id: toClass.id, name: toClass.label },
        assessment: null,
        metadata: {},
        occurred_at: isoNow(),
      });
    }

    return HttpResponse.json({ moved, to_class: toClass.id });
  }),

  http.post(`${BASE}/students/transfer-class/`, async ({ request }) => {
    const body = await readBody(request);
    const fromClass = classes.find((entry) => entry.id === asString(body.from_class));
    const toClass = classes.find((entry) => entry.id === asString(body.to_class));

    if (!fromClass) return validationError({ from_class: ['Select a valid class.'] });
    if (!toClass) return validationError({ to_class: ['Select a valid class.'] });

    let moved = 0;
    for (const student of students) {
      if (student.class_id !== fromClass.id) continue;
      student.class_id = toClass.id;
      student.updated_at = isoNow();
      moved += 1;
    }

    // One entry for the whole move, not one per child — the feed does not itemise it.
    if (moved > 0) {
      logActivity({
        action: 'students_transferred',
        label: `${fromClass.label} transferred to ${toClass.label}`,
        description: `${String(moved)} student(s) moved from ${fromClass.label} to ${toClass.label}.`,
        teacher: null,
        student: null,
        school_class: { id: toClass.id, name: toClass.label },
        assessment: null,
        metadata: {},
        occurred_at: isoNow(),
      });
    }

    return HttpResponse.json({ moved, to_class: toClass.id });
  }),
];
