// Core relations of the aggregate planning model, shared by every strategy.
import { createPlanMonth, regularUnitsPerWorker } from './model.js'

// Tolerance for comparing floating point quantities (e.g. LP solver output).
const RELATIVE_TOLERANCE = 1e-6

function tolerance(reference) {
  return RELATIVE_TOLERANCE * Math.max(1, Math.abs(reference))
}

function exceeds(value, limit) {
  return value > limit + tolerance(limit)
}

function differs(a, b) {
  return Math.abs(a - b) > tolerance(Math.max(Math.abs(a), Math.abs(b)))
}

export const COST_CATEGORIES = [
  { key: 'wages', label: 'Regular wages' },
  { key: 'hiring', label: 'Hiring' },
  { key: 'layoffs', label: 'Layoffs' },
  { key: 'overtime', label: 'Overtime' },
  { key: 'holding', label: 'Inventory holding' },
  { key: 'backorders', label: 'Backorders' },
  { key: 'subcontracting', label: 'Subcontracting' },
]

// Builds a complete plan from the monthly decisions
// { workers, overtimeHours, subcontracted }. Assumes the workforce always
// produces at full regular capacity.
export function completePlan(project, decisions) {
  const { settings, demand } = project
  const unitsPerWorker = regularUnitsPerWorker(settings)
  let previousWorkers = settings.initialWorkers
  // Net inventory = inventory − backorders; it carries over between months.
  let previousNet = settings.initialInventory

  return decisions.map((decision, t) => {
    const { workers, overtimeHours = 0, subcontracted = 0 } = decision
    // Workforce balance: workers(t) = workers(t − 1) + hired(t) − laidOff(t)
    const change = workers - previousWorkers
    // Regular capacity (units) = workers × hoursPerWorkerPerMonth ÷ laborHoursPerUnit
    const regularProduction = workers * unitsPerWorker
    // Overtime production (units) = overtimeHours ÷ laborHoursPerUnit
    const overtimeProduction = overtimeHours / settings.laborHoursPerUnit
    // Inventory balance, written with net inventory:
    // net(t) = net(t − 1) + production(t) − demand(t)
    const net = previousNet + regularProduction + overtimeProduction + subcontracted - demand[t].units
    previousWorkers = workers
    previousNet = net

    return createPlanMonth({
      workers,
      hired: Math.max(change, 0),
      laidOff: Math.max(-change, 0),
      regularProduction,
      overtimeHours,
      overtimeProduction,
      subcontracted,
      inventory: Math.max(net, 0),
      backorders: Math.max(-net, 0),
    })
  })
}

// Cost of one month, split by category:
// wage × workers + hiring × hired + layoff × laidOff + overtime × overtimeHours
// + holding × inventory + backorder × backorders + subcontract × subcontracted
export function monthlyCostBreakdown(costs, month) {
  return {
    wages: costs.wagePerWorkerPerMonth * month.workers,
    hiring: costs.hiringCostPerWorker * month.hired,
    layoffs: costs.layoffCostPerWorker * month.laidOff,
    overtime: costs.overtimeCostPerHour * month.overtimeHours,
    holding: costs.holdingCostPerUnitPerMonth * month.inventory,
    backorders: costs.backorderCostPerUnitPerMonth * month.backorders,
    subcontracting: costs.subcontractCostPerUnit * month.subcontracted,
  }
}

function sumValues(object) {
  return Object.values(object).reduce((sum, value) => sum + value, 0)
}

// Checks a plan against the planning constraints and against the core
// relations above, so that plans from any source (e.g. the LP solver) are
// verified independently.
export function findViolations(project, plan) {
  const { settings, costs, demand } = project
  const unitsPerWorker = regularUnitsPerWorker(settings)
  const violations = []
  const add = (type, monthIndex, message) => {
    const prefix = monthIndex === null ? '' : `${demand[monthIndex].month}: `
    violations.push({ type, monthIndex, message: prefix + message })
  }

  plan.forEach((month, t) => {
    const previous = t === 0
      ? { workers: settings.initialWorkers, inventory: settings.initialInventory, backorders: 0 }
      : plan[t - 1]

    if (Object.values(month).some((value) => value < -tolerance(0))) {
      add('negativeValue', t, 'plan contains a negative value')
    }
    if (exceeds(month.overtimeHours, settings.maxOvertimeHoursPerWorkerPerMonth * month.workers)) {
      add('overtimeLimit', t, 'overtime above the limit per worker')
    }
    if (exceeds(month.subcontracted, costs.maxSubcontractUnitsPerMonth)) {
      add('subcontractLimit', t, 'subcontracting above the monthly limit')
    }
    if (!settings.allowBackorders && exceeds(month.backorders, 0)) {
      add('backordersNotAllowed', t, 'backorders are not allowed')
    }
    if (exceeds(month.regularProduction, month.workers * unitsPerWorker)) {
      add('regularCapacity', t, 'regular production above regular capacity')
    }
    if (differs(month.overtimeProduction, month.overtimeHours / settings.laborHoursPerUnit)) {
      add('overtimeProduction', t, 'overtime production does not match overtime hours')
    }
    if (differs(month.workers, previous.workers + month.hired - month.laidOff)) {
      add('workforceBalance', t, 'workforce balance does not hold')
    }
    const supply = previous.inventory - previous.backorders + month.regularProduction
      + month.overtimeProduction + month.subcontracted
    const use = demand[t].units + month.inventory - month.backorders
    if (differs(supply, use)) {
      add('inventoryBalance', t, 'inventory balance does not hold')
    }
  })

  const last = plan[plan.length - 1]
  if (exceeds(last.backorders, 0)) {
    add('endingBackorders', null, 'backorders left at the end of the horizon')
  }
  if (exceeds(settings.endingInventoryTarget, last.inventory)) {
    add('endingInventory', null, 'ending inventory below target')
  }
  return violations
}

// Total cost, cost breakdown by category, monthly costs and violations.
export function evaluatePlan(project, plan) {
  const monthlyBreakdowns = plan.map((month) => monthlyCostBreakdown(project.costs, month))
  const costBreakdown = Object.fromEntries(COST_CATEGORIES.map(({ key }) => [key, 0]))
  for (const breakdown of monthlyBreakdowns) {
    for (const key of Object.keys(costBreakdown)) costBreakdown[key] += breakdown[key]
  }
  const monthlyCosts = monthlyBreakdowns.map(sumValues)

  return {
    totalCost: sumValues(costBreakdown),
    costBreakdown,
    monthlyCosts,
    violations: findViolations(project, plan),
  }
}
