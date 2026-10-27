// Classic pure strategies: Chase and Level. Both produce only in regular
// time (no overtime, no subcontracting) and end month 12 at the ending
// inventory target, so all strategies are compared on equal terms.
import { regularUnitsPerWorker } from './model.js'
import { completePlan } from './planEvaluation.js'

// Rounds up, ignoring floating point noise such as 30.000000000000004.
function ceilWhole(value) {
  return Math.max(0, Math.ceil(value - 1e-9))
}

// Chase: each month, hire or lay off so that regular production covers that
// month's demand. Workers(t) = ⌈(demand(t) + target if t = 12 − net inventory
// carried in) ÷ units per worker⌉. Rounding up creates a small surplus that
// is carried as inventory and lowers the next month's requirement.
export function chasePlan(project) {
  const { settings, demand } = project
  const unitsPerWorker = regularUnitsPerWorker(settings)
  const lastIndex = demand.length - 1
  const decisions = []
  let net = settings.initialInventory

  demand.forEach((entry, t) => {
    const endTarget = t === lastIndex ? settings.endingInventoryTarget : 0
    const required = entry.units + endTarget - net
    const workers = ceilWhole(required / unitsPerWorker)
    decisions.push({ workers })
    net += workers * unitsPerWorker - entry.units
  })
  return completePlan(project, decisions)
}

// Level: one constant workforce for the whole horizon, hired or laid off in
// month 1. The base size is the smallest whole number covering
// total demand + ending target − initial inventory over 12 months.
// Without backorders, cumulative production must also cover cumulative demand
// in every month t: W ≥ (demand(1..t) − initial inventory) ÷ (t × units per
// worker). Taking the maximum over all months gives the same result as
// increasing W one by one until no month has a shortage.
export function levelWorkforce(project) {
  const { settings, demand } = project
  const unitsPerWorker = regularUnitsPerWorker(settings)
  const months = demand.length
  const totalDemand = demand.reduce((sum, entry) => sum + entry.units, 0)
  let workers = ceilWhole(
    (totalDemand + settings.endingInventoryTarget - settings.initialInventory)
      / (months * unitsPerWorker),
  )

  if (!settings.allowBackorders) {
    let cumulativeDemand = 0
    demand.forEach((entry, t) => {
      cumulativeDemand += entry.units
      const needed = ceilWhole((cumulativeDemand - settings.initialInventory) / ((t + 1) * unitsPerWorker))
      workers = Math.max(workers, needed)
    })
  }
  return workers
}

export function levelPlan(project) {
  const workers = levelWorkforce(project)
  return completePlan(project, project.demand.map(() => ({ workers })))
}
