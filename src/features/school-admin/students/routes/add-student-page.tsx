import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { GraduationCapIcon, LayersIcon, UserGroupIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { FormPage, FormRow, FormSection } from '@/features/school-admin/components/form-page';
import { useCreateStudent } from '@/features/school-admin/students/api/mutations';
import {
  GUARDIAN_RELATIONSHIPS,
  STUDENT_GENDERS,
} from '@/features/school-admin/students/api/student.schema';
import {
  type AddStudentFormValues,
  addStudentSchema,
} from '@/features/school-admin/students/schemas';
import { toApiError } from '@/lib/api/errors';

const GENDER_OPTIONS = STUDENT_GENDERS.map((gender) => ({
  value: gender,
  label: gender === 'female' ? 'Female' : 'Male',
}));

const RELATIONSHIP_OPTIONS = GUARDIAN_RELATIONSHIPS.map((relationship) => ({
  value: relationship,
  label: relationship,
}));

/**
 * Add Student (design reference page 55).
 *
 * No email or password: a student has no login of their own, so this enrols a
 * school record and, optionally, queues their baseline diagnostic.
 */
export function AddStudentPage() {
  const navigate = useNavigate();
  const createStudent = useCreateStudent();
  const classesQuery = useQuery(classListQuery({ gradeId: 'all' }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      classId: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      triggerBaselineAssessment: true,
    },
  });

  const classOptions = (classesQuery.data?.results ?? []).map((schoolClass) => ({
    value: schoolClass.id,
    label: schoolClass.display_name,
  }));

  async function onSubmit(values: AddStudentFormValues) {
    try {
      const student = await createStudent.mutateAsync({
        ...values,
        guardianEmail: values.guardianEmail === '' ? undefined : values.guardianEmail,
      });
      void navigate(paths.schoolAdmin.students.detail(student.id));
    } catch {
      // Surfaced through the form's error slot.
    }
  }

  return (
    <FormPage
      title="Add New Student"
      backTo={paths.schoolAdmin.students.list}
      backLabel="Back to Students"
      submitLabel="Save Student"
      isSubmitting={createStudent.isPending}
      errorMessage={createStudent.isError ? toApiError(createStudent.error).message : null}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <FormSection title="Basic Information" icon={<GraduationCapIcon className="size-4" />}>
        <FormRow>
          <TextField
            label="First Name *"
            placeholder="Chiamaka"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            label="Last Name *"
            placeholder="Obi"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </FormRow>

        <FormRow>
          <SelectField
            label="Gender *"
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <TextField
            label="Date of Birth *"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </FormRow>

        <p className="text-koyi-muted text-xs">
          The student ID is generated automatically and shown once the student is saved.
        </p>
      </FormSection>

      <FormSection title="Academic Placement" icon={<LayersIcon className="size-4" />}>
        <FormRow>
          <SelectField
            label="Current Class / Grade *"
            placeholder={classesQuery.isPending ? 'Loading classes…' : 'Select a class'}
            options={classOptions}
            disabled={classesQuery.isPending}
            error={errors.classId?.message}
            {...register('classId')}
          />
        </FormRow>

        <div className="bg-koyi-nav-active rounded-koyi-md border-koyi-primary border-l-4 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="border-koyi-border text-koyi-primary mt-0.5 size-4 shrink-0 rounded-sm"
              {...register('triggerBaselineAssessment')}
            />
            <span>
              <span className="text-koyi-text block text-sm font-bold">
                Trigger Learning Level Assessment
              </span>
              <span className="text-koyi-muted mt-1 block text-xs">
                Queue a baseline diagnostic test for this student upon creation. This helps
                instantly map their foundational literacy and numeracy gaps.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      <FormSection title="Parent / Guardian Info" icon={<UserGroupIcon className="size-4" />}>
        <TextField
          label="Primary Guardian Name *"
          placeholder="Full Name"
          autoComplete="name"
          error={errors.guardianName?.message}
          {...register('guardianName')}
        />

        <FormRow>
          <TextField
            label="Phone Number *"
            type="tel"
            placeholder="+234 XXX XXXX"
            autoComplete="tel"
            hint="Informational only — never used to send an assessment link."
            error={errors.guardianPhone?.message}
            {...register('guardianPhone')}
          />
          <SelectField
            label="Relationship to Student *"
            placeholder="Select relationship"
            options={RELATIONSHIP_OPTIONS}
            error={errors.guardianRelationship?.message}
            {...register('guardianRelationship')}
          />
        </FormRow>

        <TextField
          label="Guardian Email (Optional)"
          type="email"
          placeholder="guardian@example.com"
          autoComplete="email"
          hint="Where an assessment link is sent. Many guardians won't have one — that's fine."
          error={errors.guardianEmail?.message}
          {...register('guardianEmail')}
        />
      </FormSection>
    </FormPage>
  );
}
