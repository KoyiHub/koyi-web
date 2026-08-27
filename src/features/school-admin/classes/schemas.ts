import { z } from 'zod';

/**
 * Add Class form validation. A class is a named stream inside a grade the
 * school already runs — the grade list comes from the server, so only its id
 * is collected here.
 */
export const addClassSchema = z.object({
  gradeId: z.string().min(1, 'Select a grade'),
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(40, 'Class name must be 40 characters or fewer'),
});

export type AddClassFormValues = z.infer<typeof addClassSchema>;
