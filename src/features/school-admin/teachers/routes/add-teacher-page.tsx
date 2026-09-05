import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { KeyIcon, LayersIcon, MailIcon, UsersIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { FormPage, FormRow, FormSection } from '@/features/school-admin/components/form-page';
import { useCreateTeacher } from '@/features/school-admin/teachers/api/mutations';
import {
  type AddTeacherFormValues,
  addTeacherSchema,
} from '@/features/school-admin/teachers/schemas';
import { toApiError } from '@/lib/api/errors';

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/**
 * Builds a 12-character starter password from the platform CSPRNG.
 *
 * This is a first credential the admin reads out to the teacher, who is asked
 * to change it — not a stored secret. `crypto.getRandomValues` is used rather
 * than `Math.random`, which is not safe for anything credential-shaped.
 */
function generatePassword(): string {
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes]
    .map((byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length] ?? '')
    .join('');
}

/**
 * Add Teacher (spec: firstname, lastname, class assigned, password, email),
 * laid out with the same field styling as the login form.
 */
export function AddTeacherPage() {
  const navigate = useNavigate();
  const createTeacher = useCreateTeacher();
  const classesQuery = useQuery(classListQuery('all'));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddTeacherFormValues>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', classId: '' },
  });

  const classOptions = (classesQuery.data ?? []).map((schoolClass) => ({
    value: schoolClass.id,
    label: schoolClass.label,
  }));

  async function onSubmit(values: AddTeacherFormValues) {
    try {
      const teacher = await createTeacher.mutateAsync(values);
      void navigate(paths.schoolAdmin.teachers.detail(teacher.id));
    } catch {
      // Surfaced through the form's error slot.
    }
  }

  return (
    <FormPage
      title="Add New Teacher"
      backTo={paths.schoolAdmin.teachers.list}
      backLabel="Back to Teachers"
      submitLabel="Save Teacher"
      isSubmitting={createTeacher.isPending}
      errorMessage={createTeacher.isError ? toApiError(createTeacher.error).message : null}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <FormSection title="Basic Information" icon={<UsersIcon className="size-4" />}>
        <FormRow>
          <TextField
            label="First Name *"
            placeholder="Adaeze"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            label="Last Name *"
            placeholder="Nwosu"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </FormRow>

        <TextField
          label="Email Address *"
          type="email"
          placeholder="teacher@school.edu"
          autoComplete="email"
          icon={<MailIcon />}
          hint="The teacher signs in with the teacher ID generated on save, not this address."
          error={errors.email?.message}
          {...register('email')}
        />
      </FormSection>

      <FormSection title="Class Assignment" icon={<LayersIcon className="size-4" />}>
        <FormRow>
          <SelectField
            label="Class Assigned *"
            placeholder={classesQuery.isPending ? 'Loading classes…' : 'Select a class'}
            options={classOptions}
            disabled={classesQuery.isPending}
            error={errors.classId?.message}
            {...register('classId')}
          />
        </FormRow>
      </FormSection>

      <FormSection
        title="Sign-in Credentials"
        icon={<KeyIcon className="size-4" />}
        description="The teacher should change this password after their first login."
      >
        <PasswordField
          label="Password *"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          labelAction={
            <button
              type="button"
              className="text-koyi-primary text-xs font-bold hover:underline"
              onClick={() => {
                setValue('password', generatePassword(), { shouldValidate: true });
              }}
            >
              Generate password
            </button>
          }
          {...register('password')}
        />
      </FormSection>
    </FormPage>
  );
}
