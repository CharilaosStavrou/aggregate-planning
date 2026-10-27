// Validation, JSON import/export and localStorage persistence of a project.
import { COST_FIELDS, SETTINGS_FIELDS } from './fields.js'
import { MIXED_INPUT_KEYS, withDefaultMixedPlan } from './mixedPlan.js'
import { PLANNING_HORIZON } from './model.js'
import { validateNumber } from './validation.js'

export const STORAGE_KEY = 'aggregatePlanning.project'

const MIXED_RULES = { workers: { integer: true }, overtimeHours: {}, subcontracted: {} }

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function checkNumber(value, rules, path) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `${path} must be a number`
  const error = validateNumber(value, rules)
  return error ? `${path}: ${error.toLowerCase()}` : null
}

function checkMonths(list, path) {
  if (!Array.isArray(list) || list.length !== PLANNING_HORIZON) {
    return `${path} must be a list of ${PLANNING_HORIZON} months`
  }
  return null
}

// Checks that data is a complete, valid project. Returns { project, error }:
// a clean copy (known fields only, mixedPlan filled in if missing) or an error message.
export function validateProject(data) {
  if (!isObject(data) || !isObject(data.settings) || !isObject(data.costs)) {
    return { project: null, error: 'The file does not contain settings and costs of a project.' }
  }
  const errors = []
  const settings = {}
  for (const field of SETTINGS_FIELDS) {
    const value = data.settings[field.key]
    if (field.type === 'boolean') {
      if (typeof value !== 'boolean') errors.push(`settings.${field.key} must be true or false`)
    } else {
      errors.push(checkNumber(value, field.rules, `settings.${field.key}`))
    }
    settings[field.key] = value
  }
  const costs = {}
  for (const field of COST_FIELDS) {
    errors.push(checkNumber(data.costs[field.key], field.rules, `costs.${field.key}`))
    costs[field.key] = data.costs[field.key]
  }

  const demandError = checkMonths(data.demand, 'demand')
  errors.push(demandError)
  const demand = demandError ? [] : data.demand.map((entry, i) => {
    if (!isObject(entry) || typeof entry.month !== 'string') errors.push(`demand[${i}].month must be text`)
    errors.push(checkNumber(entry?.units, {}, `demand[${i}].units`))
    return { month: entry?.month, units: entry?.units }
  })

  let mixedPlan
  if (data.mixedPlan !== undefined) {
    const mixedError = checkMonths(data.mixedPlan, 'mixedPlan')
    errors.push(mixedError)
    if (!mixedError) {
      mixedPlan = data.mixedPlan.map((entry, i) => {
        const decision = {}
        for (const key of MIXED_INPUT_KEYS) {
          errors.push(checkNumber(entry?.[key], MIXED_RULES[key], `mixedPlan[${i}].${key}`))
          decision[key] = entry?.[key]
        }
        return decision
      })
    }
  }

  const firstError = errors.find(Boolean)
  if (firstError) return { project: null, error: firstError }
  const project = { settings, costs, demand }
  if (mixedPlan) project.mixedPlan = mixedPlan
  return { project: withDefaultMixedPlan(project), error: null }
}

export function parseProjectJson(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { project: null, error: 'The file is not valid JSON.' }
  }
  return validateProject(data)
}

export function serializeProject(project) {
  return JSON.stringify(project, null, 2)
}

// Storage access can throw (private mode, blocked storage); failures are ignored.
export function loadFromStorage(storage) {
  try {
    const text = storage.getItem(STORAGE_KEY)
    return text ? parseProjectJson(text).project : null
  } catch {
    return null
  }
}

export function saveToStorage(storage, project) {
  try {
    storage.setItem(STORAGE_KEY, serializeProject(project))
    return true
  } catch {
    return false
  }
}
