import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, CheckCircleIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import {
  useTransferClass,
  useTransferStudents,
} from '@/features/school-admin/students/api/mutations';
import { studentListQuery } from '@/features/school-admin/students/api/queries';
import { ApiError } from '@/lib/api/errors';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

type Mode = 'individual' | 'class';

/**
 * Student transfer — `frontend-integration.md` §4.5. Two modes: move a
 * hand-picked set of students, or move everyone out of one class into
 * another (e.g. after a class is retired). Linked from a refused class
 * delete and from the students list as a bulk action.
 */
export function TransferStudentsPage() {
  const [mode, setMode] = useState<Mode>('individual');
  const classesQuery = useQuery(classListQuery({ gradeId: 'all' }));
  const classOptions = (classesQuery.data?.results ?? []).map((entry) => ({
    value: entry.id,
    label: entry.display_name,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        to={paths.schoolAdmin.students.list}
        className="text-koyi-primary inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Back to Students
      </Link>

      <PageHeader title="Transfer Students" subtitle="Move students between classes." />

      <Card bodyClassName="space-y-5">
        <SegmentedControl
          label="Transfer mode"
          value={mode}
          options={[
            { value: 'individual', label: 'Choose students' },
            { value: 'class', label: 'Whole class' },
          ]}
          onChange={setMode}
        />

        {mode === 'individual' ? (
          <IndividualTransfer classOptions={classOptions} />
        ) : (
          <ClassTransfer classOptions={classOptions} />
        )}
      </Card>
    </div>
  );
}

interface ClassOption {
  value: string;
  label: string;
}

function IndividualTransfer({ classOptions }: { classOptions: ClassOption[] }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toClass, setToClass] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const students = useQuery(
    studentListQuery({ search: debouncedSearch, page: 1, classId: 'all', status: 'active' }),
  );
  const transfer = useTransferStudents();

  return (
    <div className="space-y-4">
      <SearchInput
        label="Search students"
        placeholder="Search by name or student ID"
        value={search}
        onChange={setSearch}
      />

      {students.isPending && <PageSpinner />}
      {students.data && (
        <div className="divide-koyi-border max-h-80 divide-y overflow-y-auto">
          {students.data.results.map((student) => (
            <label key={student.id} className="flex items-center gap-3 px-1 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(student.id)}
                onChange={(event) => {
                  setSelectedIds((current) =>
                    event.target.checked
                      ? [...current, student.id]
                      : current.filter((id) => id !== student.id),
                  );
                }}
                className="size-4"
              />
              <span className="text-koyi-text font-semibold">{student.full_name}</span>
              <span className="text-koyi-muted">
                {student.student_id} · {student.class_name}
              </span>
            </label>
          ))}
        </div>
      )}

      {selectedIds.length > 0 && (
        <p className="text-koyi-muted text-sm">{selectedIds.length} selected</p>
      )}

      <SelectField
        label="Transfer to"
        placeholder="Select a class"
        options={classOptions}
        value={toClass}
        onChange={(event) => {
          setToClass(event.target.value);
        }}
      />

      <Button
        disabled={selectedIds.length === 0 || !toClass}
        isLoading={transfer.isPending}
        onClick={() => {
          setResult(null);
          transfer.mutate(
            { studentIds: selectedIds, toClass },
            {
              onSuccess: (data) => {
                setResult(`Transferred ${data.transferred} student(s).`);
                setSelectedIds([]);
              },
            },
          );
        }}
      >
        Transfer selected
      </Button>

      {result && (
        <p className="text-koyi-text flex items-center gap-2 text-sm">
          <CheckCircleIcon className="text-koyi-success size-4" />
          {result}
        </p>
      )}
      {transfer.isError && (
        <p role="alert" className="text-koyi-danger text-sm">
          {transfer.error instanceof ApiError ? transfer.error.message : 'Could not transfer.'}
        </p>
      )}
    </div>
  );
}

function ClassTransfer({ classOptions }: { classOptions: ClassOption[] }) {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const transfer = useTransferClass();

  return (
    <div className="space-y-4">
      <SelectField
        label="From class"
        placeholder="Select a class"
        options={classOptions}
        value={fromClass}
        onChange={(event) => {
          setFromClass(event.target.value);
        }}
      />
      <SelectField
        label="To class"
        placeholder="Select a class"
        options={classOptions.filter((option) => option.value !== fromClass)}
        value={toClass}
        onChange={(event) => {
          setToClass(event.target.value);
        }}
      />

      <Button
        disabled={!fromClass || !toClass}
        isLoading={transfer.isPending}
        onClick={() => {
          setResult(null);
          transfer.mutate(
            { fromClass, toClass },
            {
              onSuccess: (data) => {
                setResult(`Transferred ${data.transferred} student(s).`);
              },
            },
          );
        }}
      >
        Transfer whole class
      </Button>

      {result && (
        <p className="text-koyi-text flex items-center gap-2 text-sm">
          <CheckCircleIcon className="text-koyi-success size-4" />
          {result}
        </p>
      )}
      {transfer.isError && (
        <p role="alert" className="text-koyi-danger text-sm">
          {transfer.error instanceof ApiError ? transfer.error.message : 'Could not transfer.'}
        </p>
      )}
    </div>
  );
}
