// Data model for an aggregate planning project and for a plan.
// All functions here are pure and return fresh objects.

export const PLANNING_HORIZON = 12

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Keys of the project sections, in display order.
export const SETTINGS_KEYS = [
  'hoursPerWorkerPerMonth',
  'laborHoursPerUnit',
  'maxOvertimeHoursPerWorkerPerMonth',
  'initialWorkers',
  'initialInventory',
  'endingInventoryTarget',
  'allowBackorders',
]

export const COST_KEYS = [
  'wagePerWorkerPerMonth',
  'hiringCostPerWorker',
  'layoffCostPerWorker',
  'overtimeCostPerHour',
  'holdingCostPerUnitPerMonth',
  'backorderCostPerUnitPerMonth',
  'subcontractCostPerUnit',
  'maxSubcontractUnitsPerMonth',
]

// Fields of one month in a plan.
export const PLAN_MONTH_KEYS = [
  'workers',
  'hired',
  'laidOff',
  'regularProduction',
  'overtimeHours',
  'overtimeProduction',
  'subcontracted',
  'inventory',
  'backorders',
]

export function createEmptyProject() {
  return {
    settings: {
      hoursPerWorkerPerMonth: 160,
      laborHoursPerUnit: 1,
      maxOvertimeHoursPerWorkerPerMonth: 0,
      initialWorkers: 0,
      initialInventory: 0,
      endingInventoryTarget: 0,
      allowBackorders: false,
    },
    costs: {
      wagePerWorkerPerMonth: 0,
      hiringCostPerWorker: 0,
      layoffCostPerWorker: 0,
      overtimeCostPerHour: 0,
      holdingCostPerUnitPerMonth: 0,
      backorderCostPerUnitPerMonth: 0,
      subcontractCostPerUnit: 0,
      maxSubcontractUnitsPerMonth: 0,
    },
    demand: MONTH_LABELS.map((month) => ({ month, units: 0 })),
  }
}

export function createPlanMonth(values = {}) {
  const month = {}
  for (const key of PLAN_MONTH_KEYS) month[key] = values[key] ?? 0
  return month
}

export function createEmptyPlan() {
  return Array.from({ length: PLANNING_HORIZON }, () => createPlanMonth())
}

// Units one worker produces in regular time per month.
export function regularUnitsPerWorker(settings) {
  return settings.hoursPerWorkerPerMonth / settings.laborHoursPerUnit
}

// Immutable update helpers used by the input forms.
export function updateSetting(project, key, value) {
  return { ...project, settings: { ...project.settings, [key]: value } }
}

export function updateCost(project, key, value) {
  return { ...project, costs: { ...project.costs, [key]: value } }
}

export function updateDemand(project, index, units) {
  const demand = project.demand.map((entry, i) => (i === index ? { ...entry, units } : entry))
  return { ...project, demand }
}
