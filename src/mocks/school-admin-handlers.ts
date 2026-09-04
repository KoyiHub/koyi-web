import { http, HttpResponse } from 'msw';

import {
  adminAccount,
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
 * MSW handlers for the School Portal API — `frontend-integration.md` §4.
 *
 * Writes mutate the in-memory seed so that adding, disabling or transferring
 * something shows up in every list afterwards, exactly as the real API would
 * behave. State resets on reload.
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

/** A wrong or expired confirmation code — the message carries the whole story. */
function invalidCodeError() {
  const message = 'That code is incorrect or has expired.';
  return HttpResponse.json(errorEnvelope('validation_error', message, { code: [message] }), {
    status: 400,
  });
}

const DEFAULT_PAGE_SIZE = 8;

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
      occurred_at: teacher.date_joined,
    });
  }

  for (const entry of classes) {
    rows.push({
      id: nextActivityId(),
      action: 'class_created',
      label: `Class created: ${entry.display_name}`,
      description: `${entry.display_name} was added to the school.`,
      teacher: null,
      student: null,
      school_class: { id: entry.id, name: entry.display_name },
      assessment: null,
      metadata: {},
      occurred_at: entry.created_at,
    });
  }

  for (const student of students) {
    rows.push({
      id: nextActivityId(),
      action: 'student_admitted',
      label: `Student enrolled: ${student.full_name}`,
      description: `${student.full_name} was enrolled in ${student.class_name}.`,
      teacher: null,
      student: { id: student.id, name: student.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: student.enrolled_on,
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
      label: `Assessment ${verb}: ${assessment.title}`,
      description: `${teacher?.full_name ?? 'A teacher'} ${verb} "${assessment.title}" for ${assessment.class_name}.`,
      teacher: teacher ? { id: teacher.id, name: teacher.full_name } : null,
      student: null,
      school_class: null,
      assessment: { id: assessment.id, name: assessment.title },
      metadata: {},
      occurred_at: assessment.created_at,
    });
  }

  return rows.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
}

const activityLog: ActivityRow[] = seedActivityLog();

/* -------------------------------------------------------------------------- */
/* Serializers                                                                */
/* -------------------------------------------------------------------------- */

function teacherListItem(teacher: SeedTeacher) {
  const formClass = teacher.classes.find((entry) => entry.is_form_teacher) ?? teacher.classes[0];

  return {
    id: teacher.id,
    teacher_id: teacher.teacher_id,
    full_name: teacher.full_name,
    email: teacher.email,
    status: teacher.status,
    class_assigned: formClass?.class_name ?? null,
    additional_class_count: Math.max(0, teacher.classes.length - 1),
  };
}

function teacherDetail(teacher: SeedTeacher) {
  const created = assessments.filter((assessment) => assessment.created_by === teacher.id);
  const scored = created.filter((assessment) => assessment.average_score !== null);
  const studentsReached = teacher.classes.reduce((total, entry) => total + entry.student_count, 0);

  return {
    ...teacherListItem(teacher),
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    phone: teacher.phone,
    qualification: teacher.qualification,
    subjects: teacher.subjects,
    date_joined: teacher.date_joined,
    last_login: teacher.last_login,
    classes: teacher.classes,
    stats: {
      assessments_created: created.length,
      classes_assigned: teacher.classes.length,
      students_reached: studentsReached,
      average_class_score:
        scored.length > 0
          ? Math.round(
              scored.reduce((total, entry) => total + (entry.average_score ?? 0), 0) /
                scored.length,
            )
          : null,
    },
    assessments: created,
  };
}

function studentListItem(student: SeedStudent) {
  return {
    id: student.id,
    student_id: student.student_id,
    full_name: student.full_name,
    age: student.age,
    class_name: student.class_name,
    grade_name: student.grade_name,
    status: student.status,
  };
}

function studentDetail(student: SeedStudent) {
  return {
    ...studentListItem(student),
    first_name: student.first_name,
    last_name: student.last_name,
    date_of_birth: student.date_of_birth,
    gender: student.gender,
    class_id: student.class_id,
    enrolled_on: student.enrolled_on,
    guardian: {
      name: student.guardian_name,
      phone: student.guardian_phone,
      email: student.guardian_email,
      relationship: student.guardian_relationship,
    },
  };
}

function studentFln(student: SeedStudent) {
  if (!student.fln) return null;

  return {
    student: { id: student.id, full_name: student.full_name, student_id: student.student_id },
    literacy_level: student.fln.literacy_level,
    numeracy_level: student.fln.numeracy_level,
    last_assessed_at: student.fln.last_assessed_at,
    recent_results: student.fln.recent_results,
  };
}

function classListItem(entry: SeedClass) {
  const classTeachers = teachers
    .filter((teacher) => teacher.classes.some((item) => item.class_id === entry.id))
    .map((teacher) => ({
      id: teacher.id,
      teacher_id: teacher.teacher_id,
      full_name: teacher.full_name,
      email: teacher.email,
      is_form_teacher: teacher.classes.some(
        (item) => item.class_id === entry.id && item.is_form_teacher,
      ),
    }));

  return {
    id: entry.id,
    name: entry.name,
    grade_id: entry.grade_id,
    grade_name: entry.grade_name,
    display_name: entry.display_name,
    term: entry.term,
    room: entry.room,
    capacity: entry.capacity,
    student_count: entry.student_count,
    average_score: entry.average_score,
    literacy_score: entry.literacy_score,
    numeracy_score: entry.numeracy_score,
    teachers: classTeachers,
  };
}

function classDetail(entry: SeedClass) {
  return {
    ...classListItem(entry),
    created_at: entry.created_at,
    students: students.filter((student) => student.class_id === entry.id).map(studentListItem),
  };
}

function recountClass(classId: string) {
  const entry = classes.find((item) => item.id === classId);
  if (entry)
    entry.student_count = students.filter((student) => student.class_id === classId).length;
}

/* -------------------------------------------------------------------------- */
/* Mutable settings state                                                     */
/* -------------------------------------------------------------------------- */

const schoolProfile = { ...school };
const account = { ...adminAccount };

function currentSession() {
  return sessions.find((entry) => entry.id === schoolProfile.current_session_id) ?? sessions[0]!;
}

function profileResponse() {
  return {
    id: schoolProfile.id,
    name: schoolProfile.name,
    abbreviation: schoolProfile.abbreviation,
    location: schoolProfile.location,
    email: schoolProfile.email,
    email_verified: true,
    phone: schoolProfile.phone,
    address: schoolProfile.address,
    logo: null,
    logo_url: null,
    motto: schoolProfile.motto,
    class_system: schoolProfile.class_system,
    current_session: currentSession(),
    current_term: schoolProfile.current_term,
    term_starts_on: schoolProfile.term_starts_on,
    term_ends_on: schoolProfile.term_ends_on,
    timezone: schoolProfile.timezone,
  };
}

/* -------------------------------------------------------------------------- */
/* Handlers                                                                   */
/* -------------------------------------------------------------------------- */

const BASE = '*/api/v1/school';

export const schoolAdminHandlers = [
  http.get(`${BASE}/profile/`, () => HttpResponse.json(profileResponse())),

  http.patch(`${BASE}/profile/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['name', 'email']);
    if (missing) return validationError(missing);

    if (body.current_session !== undefined) {
      const session = sessions.find((entry) => entry.id === asString(body.current_session));
      if (!session) return validationError({ current_session: ['Select a valid session.'] });
      schoolProfile.current_session_id = session.id;
    }

    Object.assign(schoolProfile, {
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      address: asString(body.address),
      location: asString(body.location),
      motto: asString(body.motto),
    });

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
    const distribution: { literacy: Record<string, number>; numeracy: Record<string, number> } = {
      literacy: {},
      numeracy: {},
    };

    for (const student of students) {
      if (student.status !== 'active' || !student.fln) continue;
      const literacyKey = String(student.fln.literacy_level);
      const numeracyKey = String(student.fln.numeracy_level);
      distribution.literacy[literacyKey] = (distribution.literacy[literacyKey] ?? 0) + 1;
      distribution.numeracy[numeracyKey] = (distribution.numeracy[numeracyKey] ?? 0) + 1;
    }

    const statusBreakdown: Record<AssessmentStatus, number> = {
      draft: 0,
      published: 0,
      open: 0,
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
      students_count: students.length,
      teachers_count: teachers.length,
      assessments_count: assessments.length,
      active_assessments: statusBreakdown.open,
      status_breakdown: statusBreakdown,
      level_distribution: distribution,
      average_graded_score: averageGradedScore.toFixed(2),
      current_session_label: currentSession().label,
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

  http.get(`${BASE}/grades/`, () => HttpResponse.json({ count: grades.length, results: grades })),

  http.get(`${BASE}/classes/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const gradeId = url.searchParams.get('grade');

    const filtered = classes.filter((entry) => {
      if (gradeId && gradeId !== 'all' && entry.grade_id !== gradeId) return false;
      if (!search) return true;
      return matches(entry.display_name, search) || matches(entry.grade_name, search);
    });

    const page = paginate(filtered.map(classListItem), url, 24);
    return HttpResponse.json(page);
  }),

  http.post(`${BASE}/classes/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['grade_id', 'name']);
    if (missing) return validationError(missing);

    const grade = grades.find((entry) => entry.id === asString(body.grade_id));
    if (!grade) return validationError({ grade_id: ['Select a valid grade.'] });

    const name = asString(body.name);
    const duplicate = classes.some(
      (entry) => entry.grade_id === grade.id && entry.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      return validationError({ name: [`${grade.name} already has a class called ${name}.`] });
    }

    const created: SeedClass = {
      id: `cls-${String(Date.now())}`,
      name,
      grade_id: grade.id,
      grade_name: grade.name,
      display_name: `${grade.name} - ${name}`,
      term: schoolProfile.current_term,
      room: asString(body.room) || null,
      capacity: Number(body.capacity) || 20,
      student_count: 0,
      average_score: 0,
      literacy_score: 0,
      numeracy_score: 0,
      created_at: new Date().toISOString(),
    };

    classes.push(created);
    logActivity({
      action: 'class_created',
      label: `Class created: ${created.display_name}`,
      description: `${created.display_name} was added to the school.`,
      teacher: null,
      student: null,
      school_class: { id: created.id, name: created.display_name },
      assessment: null,
      metadata: {},
      occurred_at: created.created_at,
    });

    return HttpResponse.json(classDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/classes/:classId/`, ({ params }) => {
    const entry = classes.find((item) => item.id === params.classId);
    if (!entry) return notFound('We could not find that class.');
    return HttpResponse.json(classDetail(entry));
  }),

  /** Refused with `400` while any student is still enrolled — §4.3. */
  http.delete(`${BASE}/classes/:classId/`, ({ params }) => {
    const index = classes.findIndex((item) => item.id === params.classId);
    if (index === -1) return notFound('We could not find that class.');

    const entry = classes[index]!;
    const occupied = students.some((student) => student.class_id === entry.id);
    if (occupied) {
      const message = 'Transfer every student out of this class before deleting it.';
      return HttpResponse.json(errorEnvelope('validation_error', message, { class: [message] }), {
        status: 400,
      });
    }

    classes.splice(index, 1);
    return HttpResponse.json({});
  }),

  http.get(`${BASE}/teachers/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const status = url.searchParams.get('status');

    const filtered = teachers.filter((teacher) => {
      if (status && status !== 'all' && teacher.status !== status) return false;
      if (!search) return true;
      return matches(teacher.full_name, search) || matches(teacher.teacher_id, search);
    });

    return HttpResponse.json(paginate(filtered.map(teacherListItem), url));
  }),

  http.post(`${BASE}/teachers/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['first_name', 'last_name', 'email', 'password']);
    if (missing) return validationError(missing);

    const email = asString(body.email).toLowerCase();
    if (teachers.some((teacher) => teacher.email.toLowerCase() === email)) {
      return validationError({ email: ['A teacher with this email already exists.'] });
    }

    const assignedClass = classes.find((entry) => entry.id === asString(body.class_id));
    const firstName = asString(body.first_name);
    const lastName = asString(body.last_name);

    const created: SeedTeacher = {
      id: `tch-${String(Date.now())}`,
      teacher_id: `TCH-2026-${String(teachers.length + 1).padStart(3, '0')}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email,
      phone: asString(body.phone),
      status: 'invited',
      date_joined: new Date().toISOString(),
      last_login: null,
      qualification: asString(body.qualification) || 'Not provided',
      subjects: ['Literacy', 'Numeracy'],
      classes: assignedClass
        ? [
            {
              class_id: assignedClass.id,
              class_name: assignedClass.display_name,
              grade_name: assignedClass.grade_name,
              is_form_teacher: false,
              student_count: assignedClass.student_count,
            },
          ]
        : [],
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
      occurred_at: created.date_joined,
    });

    return HttpResponse.json(teacherDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/teachers/:teacherId/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    return HttpResponse.json(teacherDetail(teacher));
  }),

  http.post(`${BASE}/teachers/:teacherId/disable/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    teacher.status = 'disabled';
    logActivity({
      action: 'teacher_disabled',
      label: `Teacher disabled: ${teacher.full_name}`,
      description: `${teacher.full_name}'s account was disabled.`,
      teacher: { id: teacher.id, name: teacher.full_name },
      student: null,
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: new Date().toISOString(),
    });
    return HttpResponse.json(teacherDetail(teacher));
  }),

  http.post(`${BASE}/teachers/:teacherId/enable/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    teacher.status = 'active';
    return HttpResponse.json(teacherDetail(teacher));
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
      return invalidCodeError();
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
        occurred_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json({});
  }),

  http.get(`${BASE}/students/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const classId = url.searchParams.get('class');
    const status = url.searchParams.get('status');

    const filtered = students.filter((student) => {
      if (classId && classId !== 'all' && student.class_id !== classId) return false;
      if (status && status !== 'all' && student.status !== status) return false;
      if (!search) return true;
      return matches(student.full_name, search) || matches(student.student_id, search);
    });

    return HttpResponse.json(paginate(filtered.map(studentListItem), url));
  }),

  http.post(`${BASE}/students/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, [
      'first_name',
      'last_name',
      'class_id',
      'date_of_birth',
      'gender',
      'guardian_name',
      'guardian_phone',
      'guardian_relationship',
    ]);
    if (missing) return validationError(missing);

    const studentClass = classes.find((entry) => entry.id === asString(body.class_id));
    if (!studentClass) return validationError({ class_id: ['Select a valid class.'] });

    const dateOfBirth = asString(body.date_of_birth);
    const birthYear = Number(dateOfBirth.slice(0, 4));
    if (!birthYear || birthYear > 2026) {
      return validationError({ date_of_birth: ['Enter a valid date of birth.'] });
    }

    const firstName = asString(body.first_name);
    const lastName = asString(body.last_name);
    const guardianEmail = asString(body.guardian_email);

    const created: SeedStudent = {
      id: `stu-${String(Date.now())}`,
      // Always server-generated — never accepted from the request body.
      student_id: `STU-2026-${String(students.length + 1).padStart(3, '0')}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      date_of_birth: new Date(dateOfBirth).toISOString(),
      age: 2026 - birthYear,
      gender: asString(body.gender) === 'male' ? 'male' : 'female',
      class_id: studentClass.id,
      class_name: studentClass.display_name,
      grade_name: studentClass.grade_name,
      status: 'active',
      enrolled_on: new Date().toISOString(),
      guardian_name: asString(body.guardian_name),
      guardian_phone: asString(body.guardian_phone),
      guardian_email: guardianEmail || null,
      guardian_relationship: asString(body.guardian_relationship),
      // No sitting yet — the `/fln/` endpoint 404s until this student is assessed.
      fln: null,
    };

    students.unshift(created);
    recountClass(studentClass.id);
    logActivity({
      action: 'student_admitted',
      label: `Student enrolled: ${created.full_name}`,
      description: `${created.full_name} was enrolled in ${created.class_name}.`,
      teacher: null,
      student: { id: created.id, name: created.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: created.enrolled_on,
    });

    return HttpResponse.json(studentDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/students/:studentId/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    return HttpResponse.json(studentDetail(student));
  }),

  http.get(`${BASE}/students/:studentId/fln/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');

    const fln = studentFln(student);
    if (!fln) return notFound('This student has not sat an assessment yet.');

    return HttpResponse.json(fln);
  }),

  http.post(`${BASE}/students/:studentId/disable/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    student.status = 'disabled';
    logActivity({
      action: 'student_disabled',
      label: `Student disabled: ${student.full_name}`,
      description: `${student.full_name}'s account was disabled.`,
      teacher: null,
      student: { id: student.id, name: student.full_name },
      school_class: null,
      assessment: null,
      metadata: {},
      occurred_at: new Date().toISOString(),
    });
    return HttpResponse.json(studentDetail(student));
  }),

  http.post(`${BASE}/students/:studentId/enable/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    student.status = 'active';
    return HttpResponse.json(studentDetail(student));
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
      return invalidCodeError();
    }

    const [removed] = students.splice(index, 1);
    if (removed) {
      recountClass(removed.class_id);
      logActivity({
        action: 'student_removed',
        label: `Student removed: ${removed.full_name}`,
        description: `${removed.full_name} was removed from the school.`,
        teacher: null,
        student: null,
        school_class: null,
        assessment: null,
        metadata: {},
        occurred_at: new Date().toISOString(),
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

    const affectedClassIds = new Set<string>([toClass.id]);
    let transferred = 0;

    for (const student of students) {
      if (!studentIds.includes(student.id)) continue;
      affectedClassIds.add(student.class_id);
      student.class_id = toClass.id;
      student.class_name = toClass.display_name;
      student.grade_name = toClass.grade_name;
      transferred += 1;
    }

    for (const classId of affectedClassIds) recountClass(classId);

    if (transferred > 0) {
      logActivity({
        action: 'students_transferred',
        label: `${String(transferred)} student(s) transferred to ${toClass.display_name}`,
        description: `${String(transferred)} student(s) were moved to ${toClass.display_name}.`,
        teacher: null,
        student: null,
        school_class: { id: toClass.id, name: toClass.display_name },
        assessment: null,
        metadata: {},
        occurred_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json({ transferred });
  }),

  http.post(`${BASE}/students/transfer-class/`, async ({ request }) => {
    const body = await readBody(request);
    const fromClass = classes.find((entry) => entry.id === asString(body.from_class));
    const toClass = classes.find((entry) => entry.id === asString(body.to_class));

    if (!fromClass) return validationError({ from_class: ['Select a valid class.'] });
    if (!toClass) return validationError({ to_class: ['Select a valid class.'] });

    let transferred = 0;
    for (const student of students) {
      if (student.class_id !== fromClass.id) continue;
      student.class_id = toClass.id;
      student.class_name = toClass.display_name;
      student.grade_name = toClass.grade_name;
      transferred += 1;
    }

    recountClass(fromClass.id);
    recountClass(toClass.id);

    // One entry for the whole move, not one per child — the feed does not itemise it.
    if (transferred > 0) {
      logActivity({
        action: 'students_transferred',
        label: `${fromClass.display_name} transferred to ${toClass.display_name}`,
        description: `${String(transferred)} student(s) moved from ${fromClass.display_name} to ${toClass.display_name}.`,
        teacher: null,
        student: null,
        school_class: { id: toClass.id, name: toClass.display_name },
        assessment: null,
        metadata: {},
        occurred_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json({ transferred });
  }),

  http.get(`${BASE}/settings/account/`, () => HttpResponse.json(account)),

  http.patch(`${BASE}/settings/account/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['first_name', 'last_name', 'email']);
    if (missing) return validationError(missing);

    const firstName = asString(body.first_name);
    const lastName = asString(body.last_name);

    Object.assign(account, {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email: asString(body.email),
      phone: asString(body.phone),
      two_factor_enabled: Boolean(body.two_factor_enabled),
    });

    return HttpResponse.json(account);
  }),
];
