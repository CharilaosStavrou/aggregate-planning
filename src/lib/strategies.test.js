import { describe, expect, it } from 'vitest'
import { decisionsFromPlan, updateDecision } from './mixedPlan.js'
import { completePlan, evaluatePlan } from './planEvaluation.js'
import { chasePlan, levelPlan, levelWorkforce } from './strategies.js'
import { createTestProject } from './testProject.js'
import { sampleProject } from '../data/sampleProject.js'

const column = (plan, key) => plan.map((month) => month[key])

describe('chasePlan', () => {
  // Jan: (400 − 100 initial inventory) ÷ 50 = 6 workers, lay off 4.
  // Feb: 700 ÷ 50 = 14, hire 8. Mar–Nov: 500 ÷ 50 = 10, lay off 4 in Mar.
  // Dec: (520 + 50 target) ÷ 50 = 11.4 → 12, hire 2; inventory 600 − 520 = 80.
  const project = createTestProject()
  const plan = chasePlan(project)

  it('matches the hand-checked workforce', () => {
    expect(column(plan, 'workers')).toEqual([6, 14, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12])
    expect(column(plan, 'hired')).toEqual([0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2])
    expect(column(plan, 'laidOff')).toEqual([4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('uses no overtime or subcontracting and ends at or above target', () => {
    expect(column(plan, 'overtimeHours').every((v) => v === 0)).toBe(true)
    expect(column(plan, 'subcontracted').every((v) => v === 0)).toBe(true)
    expect(column(plan, 'inventory')).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80])
  })

  it('has the hand-checked cost', () => {
    // Wages 122 worker-months × 1000 = 122,000; hiring 10 × 200 = 2,000;
    // layoffs 8 × 300 = 2,400; holding 80 × 2 = 160. Total 126,560.
    const result = evaluatePlan(project, plan)
    expect(result.costBreakdown).toEqual({
      wages: 122000, hiring: 2000, layoffs: 2400, overtime: 0,
      holding: 160, backorders: 0, subcontracting: 0,
    })
    expect(result.totalCost).toBe(126560)
    expect(result.violations).toEqual([])
  })

  it('carries a rounding surplus into the next month', () => {
    // 60 units per worker: Jan needs 400 − 100 = 300 → 5 workers, exact.
    // Feb needs 700 → 11.67 → 12 workers, 20 units surplus; Mar needs 480 → 8.
    const plan60 = chasePlan(createTestProject({ settings: { laborHoursPerUnit: 100 / 60 } }))
    expect(column(plan60, 'workers').slice(0, 3)).toEqual([5, 12, 8])
  })

  it('needs no workers while initial inventory covers demand', () => {
    const rich = chasePlan(createTestProject({ settings: { initialInventory: 1500 } }))
    // 1500 covers Jan (400) and Feb (700), leaving 400 for Mar (needs 100 more → 2 workers).
    expect(column(rich, 'workers').slice(0, 3)).toEqual([0, 0, 2])
  })
})

describe('levelPlan', () => {
  it('matches the hand-checked plan without shortages', () => {
    // ⌈(6120 + 50 − 100) ÷ (12 × 50)⌉ = ⌈10.12⌉ = 11 workers, hire 1 in Jan.
    const project = createTestProject()
    const plan = levelPlan(project)
    expect(column(plan, 'workers').every((w) => w === 11)).toBe(true)
    expect(column(plan, 'hired')).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    // Net inventory: 100 + 550 − 400 = 250, then 250 + 550 − 700 = 100, then +50 per month, Dec +30.
    expect(column(plan, 'inventory')).toEqual([250, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 580])
    const result = evaluatePlan(project, plan)
    // Wages 132,000 + hiring 200 + holding 4,080 × 2 = 8,160 → 140,360.
    expect(result.totalCost).toBe(140360)
    expect(result.violations).toEqual([])
  })

  const frontLoaded = [900, 900, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300]

  it('lets backorders absorb early peaks when allowed', () => {
    // ⌈(4800 + 50 − 100) ÷ 600⌉ = ⌈7.92⌉ = 8 workers, 400 units per month.
    const project = createTestProject({ demandUnits: frontLoaded })
    const plan = levelPlan(project)
    expect(plan[0].workers).toBe(8)
    expect(column(plan, 'backorders')).toEqual([400, 900, 800, 700, 600, 500, 400, 300, 200, 100, 0, 0])
    expect(plan[11].inventory).toBe(100)
    expect(evaluatePlan(project, plan).violations).toEqual([])
  })

  it('raises the workforce until no month has a shortage when backorders are not allowed', () => {
    // Jan: (900 − 100) ÷ 50 = 16; Feb: (1800 − 100) ÷ 100 = 17 → 17 workers.
    const project = createTestProject({ demandUnits: frontLoaded, settings: { allowBackorders: false } })
    expect(levelWorkforce(project)).toBe(17)
    const plan = levelPlan(project)
    expect(column(plan, 'backorders').every((b) => b === 0)).toBe(true)
    expect(plan[1].inventory).toBe(0)
    expect(evaluatePlan(project, plan).violations).toEqual([])
  })
})

describe('strategies on the sample data', () => {
  it('both reach the ending inventory target without violations', () => {
    for (const plan of [chasePlan(sampleProject), levelPlan(sampleProject)]) {
      const result = evaluatePlan(sampleProject, plan)
      expect(result.violations).toEqual([])
      expect(plan[11].inventory).toBeGreaterThanOrEqual(sampleProject.settings.endingInventoryTarget)
    }
  })
})

describe('Mixed plan helpers', () => {
  it('prefilled from Level, the Mixed plan equals the Level plan', () => {
    const project = createTestProject()
    const level = levelPlan(project)
    const decisions = decisionsFromPlan(level)
    expect(completePlan(project, decisions)).toEqual(level)
    const edited = updateDecision(decisions, 2, 'overtimeHours', 20)
    expect(edited[2]).toEqual({ workers: 11, overtimeHours: 20, subcontracted: 0 })
    expect(decisions[2].overtimeHours).toBe(0)
  })
})
