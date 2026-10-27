import { describe, expect, it } from 'vitest'
import { decisionsFromPlan } from './mixedPlan.js'
import { optimizePlan, verifyOptimalPlan } from './optimizer.js'
import { completePlan, evaluatePlan } from './planEvaluation.js'
import { chasePlan, levelPlan } from './strategies.js'
import { createTestProject } from './testProject.js'
import { sampleProject } from '../data/sampleProject.js'

const projects = {
  sample: sampleProject,
  'sample without backorders': { ...sampleProject, settings: { ...sampleProject.settings, allowBackorders: false } },
  test: createTestProject(),
}

describe.each(Object.entries(projects))('optimizePlan (%s)', (_, project) => {
  const result = optimizePlan(project)

  it('finds an integer plan with no violations whose cost matches the objective', () => {
    expect(result.feasible).toBe(true)
    expect(result.integer).toBe(true)
    const check = verifyOptimalPlan(project, result)
    expect(check.evaluation.violations).toEqual([])
    expect(check.costMatches).toBe(true)
    expect(check.passed).toBe(true)
  })

  it('keeps workers, hired and laid off whole', () => {
    for (const month of result.plan) {
      for (const key of ['workers', 'hired', 'laidOff']) expect(Number.isInteger(month[key])).toBe(true)
    }
  })

  it('costs no more than Chase, Level, the default Mixed plan and the sample Mixed plan', () => {
    const level = levelPlan(project)
    const defaultMixed = completePlan(project, decisionsFromPlan(level))
    const samplePlans = project.mixedPlan ? [completePlan(project, project.mixedPlan)] : []
    for (const plan of [chasePlan(project), level, defaultMixed, ...samplePlans]) {
      expect(result.objective).toBeLessThanOrEqual(evaluatePlan(project, plan).totalCost + 1e-6)
    }
  })

  it('costs no less than the continuous relaxation', () => {
    const relaxed = optimizePlan(project, { integer: false })
    expect(relaxed.integer).toBe(false)
    expect(relaxed.objective).toBeLessThanOrEqual(result.objective + 1e-6)
    expect(verifyOptimalPlan(project, relaxed).passed).toBe(true)
  })
})

describe('optimizePlan on a hand-checked case', () => {
  it('uses inventory and one month of overtime in the test project', () => {
    // Keep 10 workers (500 units/month): Jan builds 200 units for Feb (700).
    // Dec needs 570: 10 workers + 1 hire = 550, plus 40 overtime hours = 20 units.
    // Cost: 121 worker-months × 1000 + 1 hire × 200 + 40 h × 15 + (200 + 50) × 2 = 122,300.
    const result = optimizePlan(createTestProject())
    expect(result.objective).toBeCloseTo(122300, 6)
  })
})
