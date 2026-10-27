import { levelPlan } from './strategies.js'

// The Mixed plan is defined by the user's monthly decisions
// { workers, overtimeHours, subcontracted }; completePlan derives the rest.

export const MIXED_INPUT_KEYS = ['workers', 'overtimeHours', 'subcontracted']

export function decisionsFromPlan(plan) {
  return plan.map(({ workers, overtimeHours, subcontracted }) => ({ workers, overtimeHours, subcontracted }))
}

export function updateDecision(decisions, index, key, value) {
  return decisions.map((decision, i) => (i === index ? { ...decision, [key]: value } : decision))
}

// Returns the project with a mixedPlan, pre-filled from the Level plan when
// the project has none.
export function withDefaultMixedPlan(project) {
  if (project.mixedPlan) return project
  return { ...project, mixedPlan: decisionsFromPlan(levelPlan(project)) }
}
