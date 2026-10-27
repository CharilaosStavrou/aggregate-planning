// The Mixed plan is defined by the user's monthly decisions
// { workers, overtimeHours, subcontracted }; completePlan derives the rest.

export const MIXED_INPUT_KEYS = ['workers', 'overtimeHours', 'subcontracted']

export function decisionsFromPlan(plan) {
  return plan.map(({ workers, overtimeHours, subcontracted }) => ({ workers, overtimeHours, subcontracted }))
}

export function updateDecision(decisions, index, key, value) {
  return decisions.map((decision, i) => (i === index ? { ...decision, [key]: value } : decision))
}
