import { http, HttpResponse } from 'msw';

import {
  adminAccount,
  assessments,
  classes,
  grades,
  school,
  type SeedClass,
  type SeedStudent,
  type SeedTeacher,
  students,
  teachers,
} from '@/mocks/data/school-admin-seed';

/**
 * MSW handlers standing in for the School Portal API.
 *
 * No School Admin endpoints are confirmed on the Django side yet — the backend
 * ships `apps.users` only — so these model what the contract is expected to
 * look like: DRF-style list envelopes, snake_case payloads, server-side
 * `search`/`page` handling, and the shared error envelope from
 * `apps.common.exceptions.api_exception_handler`.
 *
 * Writes mutate the in-memory seed so that adding a teacher, student or class
 * shows up in the lists afterwards, exactly as a real API would behave.
 * State resets on reload.
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

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Term multipliers stand in for historical aggregates the API would compute
 * server-side. FLN band counts are returned by the server; the client never
 * derives a band from a raw score.
 */
const TERM_FACTORS: Record<string, number> = {
  this_term: 1,
  last_term: 0.88,
  ytd: 0.94,
};

function scale(value: number, factor: number): number {
  return Math.round(value * factor);
}

function bandCountsFor(filter: (student: SeedStudent) => boolean, factor: number) {
  const scoped = students.filter(filter);

  const count = (level: string) =>
    scale(scoped.filter((student) => student.level === level).length, factor);

  return {
    strong: count('strong'),
    intermediate: count('intermediate'),
    // "Beginner" is the bottom of the same struggling band for chart purposes.
    struggling: count('struggling') + count('beginner'),
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function dashboardSummary(term: string) {
  const factor = TERM_FACTORS[term] ?? 1;

  const byGrade = grades.slice(0, 3).map((grade) => ({
    label: grade.name,
    ...bandCountsFor((student) => student.grade_name === grade.name, factor),
  }));

  const bySubject = [
    { key: 'reading', label: 'Reading' },
    { key: 'comprehension', label: 'Comprehension' },
    { key: 'mathematics', label: 'Mathematics' },
  ].map((domain) => {
    const scores = students.map(
      (student) => student.domain_scores.find((entry) => entry.key === domain.key)?.band,
    );

    const count = (band: string) => scale(scores.filter((entry) => entry === band).length, factor);

    return {
      label: domain.label,
      strong: count('strong'),
      intermediate: count('intermediate'),
      struggling: count('struggling'),
    };
  });

  const trend = MONTHS.map((month, index) => ({
    label: month,
    value: Math.round((52 + index * 3.2 + (index === 3 ? 4 : 0)) * factor),
  }));

  const first = trend[0]?.value ?? 0;
  const last = trend[trend.length - 1]?.value ?? 0;

  return {
    term,
    school_name: school.name,
    location: school.location,
    stats: {
      total_teachers: {
        value: scale(teachers.length, factor),
        change_percentage: 5,
      },
      total_students: {
        value: scale(students.length, factor),
        change_percentage: 12,
      },
      active_classes: {
        value: scale(classes.length, factor),
        change_percentage: null,
      },
    },
    learning_levels: { by_grade: byGrade, by_subject: bySubject },
    progress_trend: {
      points: trend,
      net_improvement_percentage: Number((last - first).toFixed(1)),
    },
  };
}

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
    level: student.level,
  };
}

function studentDetail(student: SeedStudent) {
  const latest = student.assessments[0] ?? null;

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
      relationship: student.guardian_relationship,
    },
    latest_assessment: latest
      ? { taken_on: latest.taken_on, domain_scores: student.domain_scores }
      : null,
    strengths: student.strengths,
    learning_gaps: student.learning_gaps,
    assessments: student.assessments,
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

/* -------------------------------------------------------------------------- */
/* Mutable settings state                                                     */
/* -------------------------------------------------------------------------- */

const schoolProfile = { ...school };
const account = { ...adminAccount };

const academicSettings = {
  current_session: school.current_session,
  current_term: school.current_term,
  term_starts_on: school.term_starts_on.slice(0, 10),
  term_ends_on: school.term_ends_on.slice(0, 10),
  class_system: school.class_system,
  grade_levels: grades.map((grade) => grade.name),
  assessment_window_weeks: 2,
  auto_assign_baseline: true,
};

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Server-side generation only — the browser never invents a credential. */
function generatePassword(): string {
  let password = '';
  for (let index = 0; index < 12; index += 1) {
    password += PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)];
  }
  return password;
}

/* -------------------------------------------------------------------------- */
/* Handlers                                                                   */
/* -------------------------------------------------------------------------- */

const BASE = '*/api/v1/school';

export const schoolAdminHandlers = [
  http.get(`${BASE}/school/`, () => HttpResponse.json(schoolProfile)),

  http.patch(`${BASE}/school/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['name', 'email']);
    if (missing) return validationError(missing);

    Object.assign(schoolProfile, {
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      address: asString(body.address),
      location: asString(body.location),
      motto: asString(body.motto),
    });

    return HttpResponse.json(schoolProfile);
  }),

  http.get(`${BASE}/dashboard/`, ({ request }) => {
    const url = new URL(request.url);
    const term = url.searchParams.get('term') ?? 'this_term';

    if (!(term in TERM_FACTORS)) {
      return validationError({ term: ['Select a valid term.'] });
    }

    return HttpResponse.json(dashboardSummary(term));
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

    const page = paginate(filtered.map(classListItem), url, 12);
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
      term: academicSettings.current_term,
      room: asString(body.room) || null,
      capacity: Number(body.capacity) || 20,
      student_count: 0,
      average_score: 0,
      literacy_score: 0,
      numeracy_score: 0,
      created_at: new Date().toISOString(),
    };

    classes.push(created);
    return HttpResponse.json(classDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/classes/:classId/`, ({ params }) => {
    const entry = classes.find((item) => item.id === params.classId);
    if (!entry) return notFound('We could not find that class.');
    return HttpResponse.json(classDetail(entry));
  }),

  http.get(`${BASE}/teachers/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);

    // Search covers name and teacher ID, per the School Admin brief.
    const filtered = teachers.filter(
      (teacher) =>
        !search || matches(teacher.full_name, search) || matches(teacher.teacher_id, search),
    );

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
    return HttpResponse.json(teacherDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/teachers/:teacherId/`, ({ params }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');
    return HttpResponse.json(teacherDetail(teacher));
  }),

  http.post(`${BASE}/teachers/:teacherId/reset-password/`, async ({ params, request }) => {
    const teacher = teachers.find((item) => item.id === params.teacherId);
    if (!teacher) return notFound('We could not find that teacher.');

    const body = await readBody(request);
    const mode = asString(body.mode);

    if (mode !== 'generate' && mode !== 'manual') {
      return validationError({ mode: ['Choose how the new password should be set.'] });
    }

    if (mode === 'manual') {
      const password = asString(body.password);
      if (password.length < 8) {
        return validationError({ password: ['Use at least 8 characters.'] });
      }
      if (password !== asString(body.confirm_password)) {
        return validationError({ confirm_password: ['Passwords do not match.'] });
      }

      // A manually set password is never echoed back to the client.
      return HttpResponse.json({
        mode,
        temporary_password: null,
        must_change_on_next_login: false,
        updated_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json({
      mode,
      temporary_password: generatePassword(),
      must_change_on_next_login: true,
      updated_at: new Date().toISOString(),
    });
  }),

  http.get(`${BASE}/students/`, ({ request }) => {
    const url = new URL(request.url);
    const search = searchTerm(url);
    const classId = url.searchParams.get('class');

    const filtered = students.filter((student) => {
      if (classId && classId !== 'all' && student.class_id !== classId) return false;
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

    const created: SeedStudent = {
      id: `stu-${String(Date.now())}`,
      student_id: asString(body.student_id) || `STU-2026-${String(students.length + 1)}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      date_of_birth: new Date(dateOfBirth).toISOString(),
      age: 2026 - birthYear,
      gender: asString(body.gender) === 'male' ? 'male' : 'female',
      class_id: studentClass.id,
      class_name: studentClass.display_name,
      grade_name: studentClass.grade_name,
      // A new student has no assessment yet, so no level is asserted.
      level: 'beginner',
      enrolled_on: new Date().toISOString(),
      guardian_name: asString(body.guardian_name),
      guardian_phone: asString(body.guardian_phone),
      guardian_relationship: asString(body.guardian_relationship),
      domain_scores: [],
      strengths: [],
      learning_gaps: [],
      assessments: [],
    };

    students.unshift(created);
    studentClass.student_count += 1;

    return HttpResponse.json(studentDetail(created), { status: 201 });
  }),

  http.get(`${BASE}/students/:studentId/`, ({ params }) => {
    const student = students.find((item) => item.id === params.studentId);
    if (!student) return notFound('We could not find that student.');
    return HttpResponse.json(studentDetail(student));
  }),

  http.get(`${BASE}/settings/academic/`, () => HttpResponse.json(academicSettings)),

  http.patch(`${BASE}/settings/academic/`, async ({ request }) => {
    const body = await readBody(request);
    const missing = requiredFields(body, ['current_session', 'current_term']);
    if (missing) return validationError(missing);

    Object.assign(academicSettings, {
      current_session: asString(body.current_session),
      current_term: asString(body.current_term),
      term_starts_on: asString(body.term_starts_on),
      term_ends_on: asString(body.term_ends_on),
      assessment_window_weeks: Number(body.assessment_window_weeks) || 2,
      auto_assign_baseline: Boolean(body.auto_assign_baseline),
    });

    return HttpResponse.json(academicSettings);
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

  http.post(`${BASE}/settings/account/password/`, async ({ request }) => {
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
];
