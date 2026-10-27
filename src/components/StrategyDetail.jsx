import { formatCurrency } from '../lib/format.js'
import { updateDecision } from '../lib/mixedPlan.js'
import { INTEGER_TIMEOUT_MS } from '../lib/optimizer.js'
import PlanCharts from './PlanCharts.jsx'
import PlanTable from './PlanTable.jsx'
import ViolationList from './ViolationList.jsx'

function OptimalNotes({ result, check }) {
  return (
    <>
      {!result.integer && (
        <p className="status statusWarning">
          The integer solve did not finish within {INTEGER_TIMEOUT_MS / 1000} s. Showing the continuous
          solution: workers, hires and layoffs may be fractional.
        </p>
      )}
      <p className={check.passed ? 'status statusOk' : 'status statusError'}>
        Check with evaluatePlan: solver objective {formatCurrency(result.objective)}, evaluated cost{' '}
        {formatCurrency(check.evaluation.totalCost)}
        {check.costMatches ? ' (match)' : ' (mismatch)'}, {check.evaluation.violations.length} violations.
      </p>
    </>
  )
}

// Charts and monthly table of one strategy. The Mixed plan is editable.
function StrategyDetail({ strategyKey, project, entry, onProjectChange, onResetMixed }) {
  if (!entry.plan) {
    return <p className="status statusError">The linear program has no feasible solution for these inputs.</p>
  }
  const isMixed = strategyKey === 'mixed'
  const editMixed = (index, key, value) =>
    onProjectChange({ ...project, mixedPlan: updateDecision(project.mixedPlan, index, key, value) })

  return (
    <div className="strategyDetail">
      <div className="strategySummary">
        <span>Total cost <strong>{formatCurrency(entry.evaluation.totalCost)}</strong></span>
        {isMixed && <button type="button" onClick={onResetMixed}>Reset to Level plan</button>}
      </div>
      {strategyKey === 'optimal'
        ? <OptimalNotes result={entry.result} check={entry.check} />
        : <ViolationList violations={entry.evaluation.violations} />}
      <PlanCharts demand={project.demand} plan={entry.plan} />
      {isMixed && <p className="hint">Edit workers, overtime hours and subcontracted units (blue columns). The rest is calculated.</p>}
      <PlanTable
        demand={project.demand}
        plan={entry.plan}
        evaluation={entry.evaluation}
        editable={isMixed}
        onEdit={editMixed}
      />
    </div>
  )
}

export default StrategyDetail
