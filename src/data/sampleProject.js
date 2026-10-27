// Sample case: a garden equipment manufacturer (lawn mowers, trimmers)
// with a strong spring peak. Costs are in EUR. Values are tuned in Phase 6.
export const sampleProject = {
  settings: {
    hoursPerWorkerPerMonth: 160,
    laborHoursPerUnit: 4,
    maxOvertimeHoursPerWorkerPerMonth: 20,
    initialWorkers: 50,
    initialInventory: 400,
    endingInventoryTarget: 400,
    allowBackorders: true,
  },
  costs: {
    wagePerWorkerPerMonth: 3200,
    hiringCostPerWorker: 2500,
    layoffCostPerWorker: 3500,
    overtimeCostPerHour: 30,
    holdingCostPerUnitPerMonth: 8,
    backorderCostPerUnitPerMonth: 25,
    subcontractCostPerUnit: 110,
    maxSubcontractUnitsPerMonth: 300,
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
}
