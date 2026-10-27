import { updateDecision } from '../lib/mixedPlan.js'
import { completePlan, evaluatePlan } from '../lib/planEvaluation.js'
import PlanTable from './PlanTable.jsx'
import ViolationList from './ViolationList.jsx'

// User-defined plan: workers, overtime hours and subcontracted units are
// entered per month; everything else is calculated.
function MixedPlanPanel({ project, decisions, onChange, onReset }) {
  const plan = completePlan(project, decisions)
  const evaluation = evaluatePlan(project, plan)

  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Mixed plan</h2>
        <button type="button" onClick={onReset}>Reset to Level plan</button>
      </div>
      <p className="hint">Edit workers, overtime hours and subcontracted units. The rest is calculated.</p>
      <PlanTable
        demand={project.demand}
        plan={plan}
        evaluation={evaluation}
        editable
        onEdit={(index, key, value) => onChange(updateDecision(decisions, index, key, value))}
      />
      <ViolationList violations={evaluation.violations} />
    </section>
  )
}

export default MixedPlanPanel
