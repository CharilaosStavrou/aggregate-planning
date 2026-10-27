import { describe, expect, it } from 'vitest'
import { sampleProject } from '../data/sampleProject.js'
import { decisionsFromPlan } from './mixedPlan.js'
import {
  STORAGE_KEY, loadFromStorage, parseProjectJson, saveToStorage, serializeProject, validateProject,
} from './projectIO.js'
import { levelPlan } from './strategies.js'

function fakeStorage() {
  const items = {}
  return {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => { items[key] = value },
    items,
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value))

describe('validateProject', () => {
  it('accepts the sample and keeps its Mixed plan', () => {
    const { project, error } = validateProject(clone(sampleProject))
    expect(error).toBeNull()
    expect(project.mixedPlan).toEqual(sampleProject.mixedPlan)
  })

  it('fills a missing Mixed plan from Level', () => {
    const { mixedPlan: _, ...data } = clone(sampleProject)
    expect(validateProject(data).project.mixedPlan).toEqual(decisionsFromPlan(levelPlan(sampleProject)))
  })

  it('keeps a valid Mixed plan and drops unknown fields', () => {
    const data = { ...clone(sampleProject), extra: 1, mixedPlan: Array(12).fill({ workers: 3, overtimeHours: 1.5, subcontracted: 0 }) }
    const { project } = validateProject(data)
    expect(project.extra).toBeUndefined()
    expect(project.mixedPlan[0]).toEqual({ workers: 3, overtimeHours: 1.5, subcontracted: 0 })
  })

  it.each([
    ['not an object', [], 'settings and costs'],
    ['negative cost', { costs: { wagePerWorkerPerMonth: -1 } }, 'costs.wagePerWorkerPerMonth: cannot be negative'],
    ['zero labor hours', { settings: { laborHoursPerUnit: 0 } }, 'settings.laborHoursPerUnit: must be above 0'],
    ['text instead of number', { settings: { initialWorkers: '5' } }, 'settings.initialWorkers must be a number'],
    ['backorder flag', { settings: { allowBackorders: 'yes' } }, 'settings.allowBackorders must be true or false'],
    ['short demand', { demand: [{ month: 'Jan', units: 1 }] }, 'demand must be a list of 12 months'],
    ['fractional Mixed workers', { mixedPlan: Array(12).fill({ workers: 2.5, overtimeHours: 0, subcontracted: 0 }) }, 'mixedPlan[0].workers: must be a whole number'],
  ])('rejects %s', (_, change, message) => {
    const data = Array.isArray(change) ? change : {
      ...clone(sampleProject),
      ...change,
      settings: { ...sampleProject.settings, ...change.settings },
      costs: { ...sampleProject.costs, ...change.costs },
    }
    const { project, error } = validateProject(data)
    expect(project).toBeNull()
    expect(error).toContain(message)
  })
})

describe('JSON and storage', () => {
  it('round-trips a project through JSON', () => {
    const { project } = validateProject(clone(sampleProject))
    expect(parseProjectJson(serializeProject(project)).project).toEqual(project)
  })

  it('reports invalid JSON', () => {
    expect(parseProjectJson('{ not json').error).toBe('The file is not valid JSON.')
  })

  it('saves to and loads from storage', () => {
    const storage = fakeStorage()
    const { project } = validateProject(clone(sampleProject))
    expect(saveToStorage(storage, project)).toBe(true)
    expect(loadFromStorage(storage)).toEqual(project)
  })

  it('returns null for missing or corrupt saved data and survives storage errors', () => {
    const storage = fakeStorage()
    expect(loadFromStorage(storage)).toBeNull()
    storage.items[STORAGE_KEY] = '{"settings":1}'
    expect(loadFromStorage(storage)).toBeNull()
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('full') } }
    expect(loadFromStorage(broken)).toBeNull()
    expect(saveToStorage(broken, sampleProject)).toBe(false)
  })
})
