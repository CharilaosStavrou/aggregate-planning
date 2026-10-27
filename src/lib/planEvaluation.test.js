import { describe, expect, it } from 'vitest'
import { completePlan, evaluatePlan } from './planEvaluation.js'
import { chasePlan, levelPlan } from './strategies.js'
import { createTestProject } from './testProject.js'
import { sampleProject } from '../data/sampleProject.js'

const types = (result) => result.violations.map((v) => v.type)

// Level plan for the test project (11 workers) with a change in one month.
function levelDecisions(changes = {}) {
  return Array.from({ length: 12 }, (_, t) => ({ workers: 11, ...changes[t] }))
}

describe('completePlan', () => {
  it('derives hiring, production, overtime units, inventory and backorders', () => {
    const project = createTestProject()
    const plan = completePlan(project, levelDecisions({ 0: { workers: 8, overtimeHours: 40, subcontracted: 30 } }))
    // Jan: lay off 2; 8 × 50 = 400 regular + 40 h ÷ 2 = 20 overtime + 30 sub;
    // net = 100 + 450 − 400 = 150. Feb: hire 3; net = 150 + 550 − 700 = 0.
    expect(plan[0]).toEqual({
      workers: 8, hired: 0, laidOff: 2, regularProduction: 400, overtimeHours: 40,
      overtimeProduction: 20, subcontracted: 30, inventory: 150, backorders: 0,
    })
    expect(plan[1]).toMatchObject({ hired: 3, inventory: 0, backorders: 0 })
  })
})

describe('evaluatePlan', () => {
  it('cost breakdown and monthly costs both sum to the total', () => {
    for (const project of [createTestProject(), sampleProject]) {
      for (const plan of [chasePlan(project), levelPlan(project)]) {
        const result = evaluatePlan(project, plan)
        const byCategory = Object.values(result.costBreakdown).reduce((a, b) => a + b, 0)
        const byMonth = result.monthlyCosts.reduce((a, b) => a + b, 0)
        expect(byCategory).toBeCloseTo(result.totalCost, 6)
        expect(byMonth).toBeCloseTo(result.totalCost, 6)
      }
    }
  })

  it('computes each cost category with the cost formula', () => {
    const project = createTestProject()
    const plan = completePlan(project, levelDecisions({ 0: { workers: 8, overtimeHours: 40, subcontracted: 30 } }))
    const result = evaluatePlan(project, plan)
    expect(result.monthlyCosts[0]).toBe(8 * 1000 + 2 * 300 + 40 * 15 + 150 * 2 + 30 * 40)
  })

  it('catches overtime above the limit', () => {
    // Limit = 10 h × 11 workers = 110 h.
    const project = createTestProject()
    const ok = evaluatePlan(project, completePlan(project, levelDecisions({ 2: { overtimeHours: 110 } })))
    const bad = evaluatePlan(project, completePlan(project, levelDecisions({ 2: { overtimeHours: 111 } })))
    expect(types(ok)).toEqual([])
    expect(types(bad)).toEqual(['overtimeLimit'])
    expect(bad.violations[0]).toMatchObject({ monthIndex: 2, message: 'Mar: overtime above the limit per worker' })
  })

  it('catches subcontracting above the limit', () => {
    const project = createTestProject()
    const result = evaluatePlan(project, completePlan(project, levelDecisions({ 4: { subcontracted: 101 } })))
    expect(types(result)).toEqual(['subcontractLimit'])
  })

  it('catches backorders when they are not allowed', () => {
    const project = createTestProject({ settings: { allowBackorders: false } })
    // 8 workers in Feb: net = 250 + 400 − 700 = −50; Mar: −50 + 550 − 500 = 0.
    const plan = completePlan(project, levelDecisions({ 1: { workers: 8 } }))
    expect(plan[1].backorders).toBe(50)
    const result = evaluatePlan(project, plan)
    expect(types(result)).toEqual(['backordersNotAllowed'])
    expect(result.violations[0].monthIndex).toBe(1)
  })

  it('catches backorders left in month 12', () => {
    const project = createTestProject({ settings: { endingInventoryTarget: 0 } })
    // 10 workers: cumulative production 6,000 + 100 < 6,120 demand → 20 backordered.
    const plan = completePlan(project, levelDecisions().map(() => ({ workers: 10 })))
    expect(plan[11].backorders).toBe(20)
    expect(types(evaluatePlan(project, plan))).toEqual(['endingBackorders'])
  })

  it('catches ending inventory below target', () => {
    const project = createTestProject({ settings: { endingInventoryTarget: 600 } })
    // Level plan with 11 workers ends with 580 units.
    expect(types(evaluatePlan(project, completePlan(project, levelDecisions())))).toEqual(['endingInventory'])
  })

  it('catches plans that break the core relations', () => {
    const project = createTestProject()
    const plan = levelPlan(project)
    const broken = plan.map((month, t) => (t === 5
      ? { ...month, hired: 1, regularProduction: month.regularProduction + 100, overtimeProduction: 5 }
      : month))
    expect(types(evaluatePlan(project, broken))).toEqual([
      'regularCapacity', 'overtimeProduction', 'workforceBalance', 'inventoryBalance',
    ])
  })
})
