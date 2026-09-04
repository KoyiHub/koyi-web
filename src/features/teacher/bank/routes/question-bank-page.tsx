import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { Pagination } from '@/components/ui/pagination';
import { SelectField } from '@/components/ui/select-field';
import { bankQuestionsQuery, skillsQuery } from '@/features/teacher/bank/api/queries';
import { DOMAIN_LABEL } from '@/lib/fln/level';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

/**
 * The question bank — `frontend-integration.md` §7.4: "Change. Read-only
 * browse + 'use this question' prefill. No create/edit here."
 *
 * There is no create or edit action on this page on purpose: a bank item is
 * selected inside an assessment's Questions step (see
 * `BankPicker`/`create-assessment-page`), where "use" means prefilling that
 * paper's authoring form — never writing back to the bank itself. This page is
 * for browsing what exists.
 */
export function QuestionBankPage() {
  const [domain, setDomain] = useState('');
  const [skillId, setSkillId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const skills = useQuery(skillsQuery(domain || undefined));
  const questions = useQuery(
    bankQuestionsQuery({
      domain: domain || undefined,
      skill: skillId || undefined,
      search: debouncedSearch || undefined,
      page,
    }),
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader
        title="Question Bank"
        subtitle="Browse every reviewed question. Add one to a paper from that paper's Questions step."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SelectField
          label="Domain"
          placeholder="Every domain"
          options={[
            { value: 'literacy', label: 'Literacy' },
            { value: 'numeracy', label: 'Numeracy' },
          ]}
          value={domain}
          onChange={(event) => {
            setDomain(event.target.value);
            setSkillId('');
            setPage(1);
          }}
        />
        <SelectField
          label="Skill"
          placeholder="Every skill"
          options={(skills.data ?? []).map((skill) => ({ value: skill.id, label: skill.name }))}
          value={skillId}
          onChange={(event) => {
            setSkillId(event.target.value);
            setPage(1);
          }}
        />
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search question text"
          aria-label="Search the bank"
          className="border-koyi-border h-11 flex-1 rounded-full border bg-white px-4 text-sm"
        />
      </div>

      {questions.isPending && <PageSpinner />}
      {questions.isError && (
        <ErrorState error={questions.error} onRetry={() => void questions.refetch()} />
      )}

      {questions.data && (
        <div className="border-koyi-border rounded-koyi-md divide-koyi-border divide-y border">
          {questions.data.results.map((question) => (
            <div key={question.id} className="p-4">
              <p className="text-koyi-text text-sm font-medium">{question.content}</p>
              <p className="text-koyi-muted mt-1 text-xs">
                {DOMAIN_LABEL[question.domain]} · {question.skill_name} · {question.subskill.name} ·
                Level {String(question.fln_level)}
              </p>
            </div>
          ))}
          {questions.data.results.length === 0 && (
            <p className="text-koyi-muted p-4 text-sm">No questions match yet.</p>
          )}
        </div>
      )}

      {questions.data && (
        <Pagination
          page={questions.data.page}
          pageCount={questions.data.num_pages}
          onPageChange={setPage}
          totalCount={questions.data.count}
          pageSize={questions.data.page_size}
          itemLabel="questions"
        />
      )}
    </div>
  );
}
