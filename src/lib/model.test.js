import { describe, expect, it } from 'vitest'
import {
  COST_KEYS,
  PLAN_MONTH_KEYS,
  PLANNING_HORIZON,
  SETTINGS_KEYS,
  createEmptyPlan,
  createEmptyProject,
  createPlanMonth,
  regularUnitsPerWorker,
} from './model.js'
import { sampleProject } from '../data/sampleProject.js'

describe('data model', () => {
  it('creates an empty project with all sections and 12 demand months', () => {
    const project = createEmptyProject()
    expect(Object.keys(project.settings)).toEqual(SETTINGS_KEYS)
    expect(Object.keys(project.costs)).toEqual(COST_KEYS)
    expect(project.demand).toHaveLength(PLANNING_HORIZON)
  })

  it('creates a plan of 12 months with every field set to 0', () => {
    const plan = createEmptyPlan()
    expect(plan).toHaveLength(PLANNING_HORIZON)
    for (const month of plan) {
      expect(Object.keys(month)).toEqual(PLAN_MONTH_KEYS)
      expect(Object.values(month).every((value) => value === 0)).toBe(true)
    }
  })

  it('fills a plan month from partial values', () => {
    expect(createPlanMonth({ workers: 5 })).toMatchObject({ workers: 5, hired: 0 })
  })

  it('returns fresh objects on every call', () => {
    expect(createEmptyProject()).not.toBe(createEmptyProject())
  })

  it('computes regular units per worker', () => {
    expect(regularUnitsPerWorker(sampleProject.settings)).toBe(40)
  })

  it('sample project matches the data model', () => {
    expect(Object.keys(sampleProject.settings)).toEqual(SETTINGS_KEYS)
    expect(Object.keys(sampleProject.costs)).toEqual(COST_KEYS)
    expect(sampleProject.demand).toHaveLength(PLANNING_HORIZON)
  })
})
