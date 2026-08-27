import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { LayersIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { gradesQuery } from '@/features/school-admin/api/queries';
import { useCreateClass } from '@/features/school-admin/classes/api/mutations';
import { type AddClassFormValues, addClassSchema } from '@/features/school-admin/classes/schemas';
import { FormPage, FormRow, FormSection } from '@/features/school-admin/components/form-page';
import { toApiError } from '@/lib/api/errors';

/**
 * Add Class (spec: grade select + class name).
 *
 * Grades come from the server rather than a hard-coded list, because a school
 * on the `grade` class system labels them differently from a `primary` one.
 */
export function AddClassPage() {
  const navigate = useNavigate();
  const createClass = useCreateClass();
  const grades = useQuery(gradesQuery());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddClassFormValues>({
    resolver: zodResolver(addClassSchema),
    defaultValues: { gradeId: '', name: '' },
  });

  const gradeOptions = (grades.data ?? []).map((grade) => ({
    value: grade.id,
    label: grade.name,
  }));

  async function onSubmit(values: AddClassFormValues) {
    try {
      const created = await createClass.mutateAsync(values);
      void navigate(paths.schoolAdmin.classes.detail(created.id));
    } catch {
      // Surfaced through the form's error slot.
    }
  }

  return (
    <FormPage
      title="Add New Class"
      backTo={paths.schoolAdmin.classes.list}
      backLabel="Back to Classes"
      submitLabel="Save Class"
      isSubmitting={createClass.isPending}
      errorMessage={createClass.isError ? toApiError(createClass.error).message : null}
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <FormSection
        title="Class Details"
        icon={<LayersIcon className="size-4" />}
        description="A class is one stream inside a grade — for example Primary 3, Class A."
      >
        <FormRow>
          <SelectField
            label="Grade *"
            placeholder={grades.isPending ? 'Loading grades…' : 'Select a grade'}
            options={gradeOptions}
            disabled={grades.isPending}
            error={errors.gradeId?.message}
            {...register('gradeId')}
          />
          <TextField
            label="Class Name *"
            placeholder="Class A"
            hint="Shown alongside the grade, e.g. “Primary 3 · Class A”."
            error={errors.name?.message}
            {...register('name')}
          />
        </FormRow>
      </FormSection>
    </FormPage>
  );
}
