// Labels, units and validation rules for the input fields.

export const SETTINGS_FIELDS = [
  { key: 'hoursPerWorkerPerMonth', label: 'Regular hours per worker', unit: 'h/month', rules: { positive: true } },
  { key: 'laborHoursPerUnit', label: 'Labor hours per unit', unit: 'h/unit', rules: { positive: true } },
  { key: 'maxOvertimeHoursPerWorkerPerMonth', label: 'Max overtime per worker', unit: 'h/month' },
  { key: 'initialWorkers', label: 'Initial workers', unit: 'workers', rules: { integer: true } },
  { key: 'initialInventory', label: 'Initial inventory', unit: 'units' },
  { key: 'endingInventoryTarget', label: 'Ending inventory target', unit: 'units' },
  { key: 'allowBackorders', label: 'Allow backorders', type: 'boolean' },
]

export const COST_FIELDS = [
  { key: 'wagePerWorkerPerMonth', label: 'Wage per worker', unit: '€/month' },
  { key: 'hiringCostPerWorker', label: 'Hiring cost', unit: '€/worker' },
  { key: 'layoffCostPerWorker', label: 'Layoff cost', unit: '€/worker' },
  { key: 'overtimeCostPerHour', label: 'Overtime cost', unit: '€/h' },
  { key: 'holdingCostPerUnitPerMonth', label: 'Holding cost', unit: '€/unit/month' },
  { key: 'backorderCostPerUnitPerMonth', label: 'Backorder cost', unit: '€/unit/month' },
  { key: 'subcontractCostPerUnit', label: 'Subcontract cost', unit: '€/unit' },
  { key: 'maxSubcontractUnitsPerMonth', label: 'Max subcontracting', unit: 'units/month' },
]

