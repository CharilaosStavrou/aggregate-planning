import { describe, expect, it } from 'vitest'
import { sampleProject } from '../data/sampleProject.js'
import { niceScale } from './chartScale.js'
import { withDefaultMixedPlan } from './mixedPlan.js'
import { optimizePlan } from './optimizer.js'
import { STRATEGIES, computeStrategyResults, savingsPercent } from './strategyResults.js'

describe('computeStrategyResults', () => {
  it('evaluates all four strategies on the sample data', () => {
    const project = withDefaultMixedPlan(sampleProject)
    const results = computeStrategyResults(project, optimizePlan(project))
    for (const { key } of STRATEGIES) {
      expect(results[key].plan).toHaveLength(12)
      expect(results[key].evaluation.totalCost).toBeGreaterThan(0)
    }
    expect(results.optimal.check.passed).toBe(true)
    // The default Mixed plan is the Level plan.
    expect(results.mixed.evaluation.totalCost).toBe(results.level.evaluation.totalCost)
  })
})

describe('savingsPercent', () => {
  it('is the cost reduction of Optimal relative to the other plan', () => {
    expect(savingsPercent(200, 150)).toBe(25)
    expect(savingsPercent(150, 150)).toBe(0)
    expect(savingsPercent(0, 0)).toBe(0)
  })
})

describe('niceScale', () => {
  it('rounds the maximum up to a nice step', () => {
    expect(niceScale(3800)).toEqual({ max: 4000, ticks: [0, 1000, 2000, 3000, 4000] })
    expect(niceScale(95)).toEqual({ max: 100, ticks: [0, 25, 50, 75, 100] })
    expect(niceScale(2594780).max).toBe(3000000)
  })

  it('handles an all-zero series', () => {
    expect(niceScale(0)).toEqual({ max: 1, ticks: [0, 1] })
  })
})
