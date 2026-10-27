// Cost-optimal plan as a (mixed-integer) linear program, solved in the
// browser with javascript-lp-solver. Variables are non-negative by default.
import solver from 'javascript-lp-solver'
import { createPlanMonth, regularUnitsPerWorker } from './model.js'
import { evaluatePlan } from './planEvaluation.js'

// Maximum time for the integer solve before falling back to continuous.
export const INTEGER_TIMEOUT_MS = 3000

const DECISION_KEYS = [
  'workers', 'hired', 'laidOff', 'regularProduction',
  'overtimeHours', 'subcontracted', 'inventory', 'backorders',
]
const INTEGER_KEYS = ['workers', 'hired', 'laidOff']

const name = (key, t) => `${key}_${t + 1}`

// Builds the LP model. Constraint names end with the month number (1–12).
export function buildModel(project, { integer = true } = {}) {
  const { settings, costs, demand } = project
  const unitsPerWorker = regularUnitsPerWorker(settings)
  const lastIndex = demand.length - 1
  const constraints = {}
  const variables = {}
  const ints = {}

  demand.forEach((entry, t) => {
    const m = t + 1
    // Objective coefficients: the monthly cost formula.
    const objective = {
      workers: costs.wagePerWorkerPerMonth,
      hired: costs.hiringCostPerWorker,
      laidOff: costs.layoffCostPerWorker,
      regularProduction: 0,
      overtimeHours: costs.overtimeCostPerHour,
      subcontracted: costs.subcontractCostPerUnit,
      inventory: costs.holdingCostPerUnitPerMonth,
      backorders: costs.backorderCostPerUnitPerMonth,
    }
    for (const key of DECISION_KEYS) variables[name(key, t)] = { cost: objective[key] }
    const v = (key) => variables[name(key, t)]

    // Workforce balance: workers(t) − hired(t) + laidOff(t) − workers(t − 1) = 0
    constraints[`workforce_${m}`] = { equal: t === 0 ? settings.initialWorkers : 0 }
    v('workers')[`workforce_${m}`] = 1
    v('hired')[`workforce_${m}`] = -1
    v('laidOff')[`workforce_${m}`] = 1
    if (t > 0) variables[name('workers', t - 1)][`workforce_${m}`] = -1

    // Inventory balance: inv(t − 1) − bo(t − 1) + regular + overtimeHours ÷ laborHoursPerUnit
    // + subcontracted − inv(t) + bo(t) = demand(t)
    const balance = `inventory_${m}`
    constraints[balance] = { equal: entry.units - (t === 0 ? settings.initialInventory : 0) }
    v('regularProduction')[balance] = 1
    v('overtimeHours')[balance] = 1 / settings.laborHoursPerUnit
    v('subcontracted')[balance] = 1
    v('inventory')[balance] = -1
    v('backorders')[balance] = 1
    if (t > 0) {
      variables[name('inventory', t - 1)][balance] = 1
      variables[name('backorders', t - 1)][balance] = -1
    }

    // Regular production ≤ workers × hoursPerWorkerPerMonth ÷ laborHoursPerUnit
    constraints[`capacity_${m}`] = { max: 0 }
    v('regularProduction')[`capacity_${m}`] = 1
    v('workers')[`capacity_${m}`] = -unitsPerWorker

    // Overtime hours ≤ maxOvertimeHoursPerWorkerPerMonth × workers
    constraints[`overtime_${m}`] = { max: 0 }
    v('overtimeHours')[`overtime_${m}`] = 1
    v('workers')[`overtime_${m}`] = -settings.maxOvertimeHoursPerWorkerPerMonth

    // Subcontracted ≤ maxSubcontractUnitsPerMonth
    constraints[`subcontract_${m}`] = { max: costs.maxSubcontractUnitsPerMonth }
    v('subcontracted')[`subcontract_${m}`] = 1

    // Backorders = 0 when not allowed, and always in the last month.
    if (!settings.allowBackorders || t === lastIndex) {
      constraints[`noBackorders_${m}`] = { max: 0 }
      v('backorders')[`noBackorders_${m}`] = 1
    }

    if (integer) for (const key of INTEGER_KEYS) ints[name(key, t)] = 1
  })

  // Inventory(12) ≥ ending inventory target
  constraints.endingInventory = { min: settings.endingInventoryTarget }
  variables[name('inventory', lastIndex)].endingInventory = 1

  return { optimize: 'cost', opType: 'min', constraints, variables, ints, options: { timeout: INTEGER_TIMEOUT_MS } }
}

// Removes solver noise: tiny negatives become 0, integers are rounded.
function cleanValue(value, isInteger) {
  const number = value ?? 0
  if (isInteger) return Math.round(number)
  return Math.abs(number) < 1e-9 ? 0 : number
}

function toPlan(project, solution, integer) {
  return project.demand.map((_, t) => {
    const values = {}
    for (const key of DECISION_KEYS) {
      values[key] = cleanValue(solution[name(key, t)], integer && INTEGER_KEYS.includes(key))
    }
    values.overtimeProduction = values.overtimeHours / project.settings.laborHoursPerUnit
    return createPlanMonth(values)
  })
}

// Solves the model with integer workforce variables; if the solver does not
// return an integral solution in time, solves the continuous relaxation.
// { integer: false } skips the integer solve.
// Returns { feasible, integer, objective, plan }.
export function optimizePlan(project, { integer = true } = {}) {
  const integerResult = integer ? solver.Solve(buildModel(project, { integer: true })) : null
  if (integerResult?.feasible && integerResult.isIntegral) {
    return { feasible: true, integer: true, objective: integerResult.result, plan: toPlan(project, integerResult, true) }
  }
  const continuousResult = solver.Solve(buildModel(project, { integer: false }))
  if (!continuousResult.feasible || !continuousResult.bounded) {
    return { feasible: false, integer: false, objective: null, plan: null }
  }
  return { feasible: true, integer: false, objective: continuousResult.result, plan: toPlan(project, continuousResult, false) }
}

// Independent check: evaluates the solver's plan with evaluatePlan and
// compares the cost with the solver's objective value.
export function verifyOptimalPlan(project, result) {
  const evaluation = evaluatePlan(project, result.plan)
  const difference = Math.abs(evaluation.totalCost - result.objective)
  const costMatches = difference <= 1e-6 * Math.max(1, Math.abs(result.objective))
  return { evaluation, costMatches, passed: costMatches && evaluation.violations.length === 0 }
}
