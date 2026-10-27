// Sample case: a garden equipment manufacturer (lawn mowers, trimmers) with
// a strong spring peak. Costs in EUR.
//
// Unit economics (4 labor hours per unit, 160 h per worker → 40 units/month):
// - regular time:   3,200 € ÷ 40 units      = 80 €/unit (fixed once hired)
// - overtime:       26 €/h × 4 h            = 104 €/unit, capped at 16 h/worker
// - subcontracting: 112 €/unit, capped at 250 units/month
// - holding:        8 €/unit/month, so stock built 3 months ahead adds 24 €/unit
// - hiring + layoff of one worker for the season: 3,000 + 4,500 = 7,500 €
// Overtime is cheaper per unit than subcontracting but limited by the cap,
// so in the peak months the optimal plan uses overtime first and
// subcontracting on top of it.
export const sampleProject = {
  settings: {
    hoursPerWorkerPerMonth: 160,
    laborHoursPerUnit: 4,
    maxOvertimeHoursPerWorkerPerMonth: 16,
    initialWorkers: 50,
    initialInventory: 400,
    endingInventoryTarget: 400,
    allowBackorders: true,
  },
  costs: {
    wagePerWorkerPerMonth: 3200,
    hiringCostPerWorker: 3000,
    layoffCostPerWorker: 4500,
    overtimeCostPerHour: 26,
    holdingCostPerUnitPerMonth: 8,
    backorderCostPerUnitPerMonth: 35,
    subcontractCostPerUnit: 112,
    maxSubcontractUnitsPerMonth: 250,
  },
  demand: [
    { month: 'Jan', units: 1600 },
    { month: 'Feb', units: 1800 },
    { month: 'Mar', units: 2600 },
    { month: 'Apr', units: 3400 },
    { month: 'May', units: 3800 },
    { month: 'Jun', units: 3000 },
    { month: 'Jul', units: 2200 },
    { month: 'Aug', units: 1800 },
    { month: 'Sep', units: 1500 },
    { month: 'Oct', units: 1400 },
    { month: 'Nov', units: 1500 },
    { month: 'Dec', units: 1700 },
  ],
  // A planner's hand-made Mixed plan: 58 workers through the season with
  // overtime at the cap in Apr–Jun and subcontracting in May–Jun, then 46
  // workers from September.
  mixedPlan: [58, 58, 58, 58, 58, 58, 58, 58, 46, 46, 46, 46].map((workers, t) => ({
    workers,
    overtimeHours: t >= 3 && t <= 5 ? 928 : 0,
    subcontracted: t === 4 || t === 5 ? 250 : 0,
  })),
}
