import { formatCurrency } from '../lib/format.js'
import { INTEGER_TIMEOUT_MS, verifyOptimalPlan } from '../lib/optimizer.js'
import PlanTable from './PlanTable.jsx'

// Cost-optimal plan from the linear program, with the independent check.
function OptimalPlanPanel({ project, result }) {
  if (!result.feasible) {
    return (
      <section className="panel">
        <h2>Optimal plan</h2>
        <p className="status statusError">The linear program has no feasible solution for these inputs.</p>
      </section>
    )
  }
  const check = verifyOptimalPlan(project, result)

  return (
    <section className="panel">
      <h2>Optimal plan</h2>
      {!result.integer && (
        <p className="status statusWarning">
          The integer solve did not finish within {INTEGER_TIMEOUT_MS / 1000} s. Showing the continuous
          solution: workers, hires and layoffs may be fractional.
        </p>
      )}
      <PlanTable demand={project.demand} plan={result.plan} evaluation={check.evaluation} />
      <p className={check.passed ? 'status statusOk' : 'status statusError'}>
        Check with evaluatePlan: solver objective {formatCurrency(result.objective)}, evaluated cost{' '}
        {formatCurrency(check.evaluation.totalCost)}
        {check.costMatches ? ' (match)' : ' (mismatch)'}, {check.evaluation.violations.length} violations.
      </p>
    </section>
  )
}

export default OptimalPlanPanel
