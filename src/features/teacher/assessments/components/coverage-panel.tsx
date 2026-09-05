import { AlertCircleIcon, CheckCircleIcon } from '@/components/ui/icons';
import type { Coverage } from '@/features/teacher/assessments/api/assessment.schema';
import { DOMAIN_LABEL } from '@/lib/fln/level';

/**
 * What the paper can actually establish about a child — `frontend-integration.md`
 * §5.3. The guide calls this the single most valuable authoring screen, so it
 * is shown live inside the workspace rather than only before publishing.
 *
 * **`levels_probed` is the number that matters**, not `question_count`: a
 * paper covering one level can confirm it but cannot find where a child
 * actually sits, no matter how many questions it holds.
 */
interface CoveragePanelProps {
  coverage: Coverage;
}

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-koyi-text text-sm font-medium">
          {coverage.question_count} question{coverage.question_count === 1 ? '' : 's'} across{' '}
          {coverage.domains.map((domain) => DOMAIN_LABEL[domain]).join(' and ') || 'no domain yet'}
        </span>
        <span className="text-koyi-muted text-sm">
          Levels probed:{' '}
          {coverage.levels_probed.length > 0
            ? coverage.levels_probed.map((level) => String(level)).join(', ')
            : 'none yet'}
        </span>
      </div>

      {coverage.warnings.length > 0 && (
        <div className="border-koyi-warning/30 bg-koyi-warning/5 rounded-koyi-md space-y-1.5 border p-3">
          {coverage.warnings.map((warning) => (
            <p key={warning} className="text-koyi-text flex gap-2 text-sm">
              <AlertCircleIcon className="text-koyi-warning mt-0.5 size-4 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}

      {coverage.sections.map((section) => (
        <div key={section.section_id} className="border-koyi-border rounded-koyi-md border p-4">
          <div className="flex items-center justify-between">
            <p className="text-koyi-text text-sm font-semibold">
              {section.section_name} · {DOMAIN_LABEL[section.domain]}
            </p>
            <span className="text-koyi-muted text-xs">{section.question_count} questions</span>
          </div>

          {section.cells.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-koyi-muted text-xs">
                    <th className="pr-4 pb-2 font-medium">Subskill</th>
                    <th className="pr-4 pb-2 font-medium">Skill</th>
                    <th className="pb-2 font-medium">Level → items</th>
                  </tr>
                </thead>
                <tbody className="divide-koyi-border divide-y">
                  {section.cells.map((cell) => (
                    <tr key={`${cell.subskill_id}-${String(cell.fln_level)}`}>
                      <td className="text-koyi-text py-2 pr-4">{cell.subskill_name}</td>
                      <td className="text-koyi-muted py-2 pr-4">{cell.skill_name}</td>
                      <td className="text-koyi-text py-2">
                        Level {String(cell.fln_level)} → {cell.item_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-koyi-muted mt-2 text-sm">No questions in this section yet.</p>
          )}

          {section.gaps.length > 0 && (
            <p className="text-koyi-warning mt-3 text-xs">
              Claims to cover but carries no items for: {section.gaps.join(', ')}
            </p>
          )}
        </div>
      ))}

      {coverage.warnings.length === 0 && coverage.levels_probed.length > 1 && (
        <p className="text-koyi-success flex items-center gap-2 text-sm">
          <CheckCircleIcon className="size-4" />
          This paper probes enough levels to place a child.
        </p>
      )}
    </div>
  );
}
