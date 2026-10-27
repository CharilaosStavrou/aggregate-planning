// Small project used by the unit tests. 100 h ÷ 2 h/unit = 50 units per
// worker per month. Total demand = 400 + 700 + 9 × 500 + 520 = 6,120.
import { MONTH_LABELS } from './model.js'

export function createTestProject(overrides = {}) {
  const units = overrides.demandUnits ?? [400, 700, 500, 500, 500, 500, 500, 500, 500, 500, 500, 520]
  return {
    settings: {
      hoursPerWorkerPerMonth: 100,
      laborHoursPerUnit: 2,
      maxOvertimeHoursPerWorkerPerMonth: 10,
      initialWorkers: 10,
      initialInventory: 100,
      endingInventoryTarget: 50,
      allowBackorders: true,
      ...overrides.settings,
    },
    costs: {
      wagePerWorkerPerMonth: 1000,
      hiringCostPerWorker: 200,
      layoffCostPerWorker: 300,
      overtimeCostPerHour: 15,
      holdingCostPerUnitPerMonth: 2,
      backorderCostPerUnitPerMonth: 5,
      subcontractCostPerUnit: 40,
      maxSubcontractUnitsPerMonth: 100,
      ...overrides.costs,
    },
    demand: MONTH_LABELS.map((month, i) => ({ month, units: units[i] })),
  }
}
