// Plans and evaluations of the four strategies, for comparison.
import { completePlan, evaluatePlan } from './planEvaluation.js'
import { verifyOptimalPlan } from './optimizer.js'
import { chasePlan, levelPlan } from './strategies.js'

export const STRATEGIES = [
  { key: 'chase', label: 'Chase' },
  { key: 'level', label: 'Level' },
  { key: 'mixed', label: 'Mixed' },
  { key: 'optimal', label: 'Optimal' },
]

// Returns { chase, level, mixed, optimal }, each { plan, evaluation }.
// The optimal entry also has the solver result and the independent check;
// its plan and evaluation are null when the LP is infeasible.
export function computeStrategyResults(project, optimalResult) {
  const withEvaluation = (plan) => ({ plan, evaluation: evaluatePlan(project, plan) })
  const check = optimalResult.feasible ? verifyOptimalPlan(project, optimalResult) : null

  return {
    chase: withEvaluation(chasePlan(project)),
    level: withEvaluation(levelPlan(project)),
    mixed: withEvaluation(completePlan(project, project.mixedPlan)),
    optimal: {
      plan: optimalResult.plan,
      evaluation: check?.evaluation ?? null,
      result: optimalResult,
      check,
    },
  }
}

// Savings of the optimal plan relative to another plan, in % of that plan's cost.
export function savingsPercent(cost, optimalCost) {
  if (cost === 0) return 0
  return ((cost - optimalCost) / cost) * 100
}
