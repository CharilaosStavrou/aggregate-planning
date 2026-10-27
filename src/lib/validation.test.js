import { describe, expect, it } from 'vitest'
import { parseDecimal, validateNumber } from './validation.js'

describe('parseDecimal', () => {
  it('parses dot and comma decimals', () => {
    expect(parseDecimal('12.5')).toBe(12.5)
    expect(parseDecimal('12,5')).toBe(12.5)
    expect(parseDecimal(' 40 ')).toBe(40)
    expect(parseDecimal(',5')).toBe(0.5)
  })

  it('returns NaN for invalid text', () => {
    for (const text of ['', 'abc', '1,2,3', '1.2.3', '1e3', '12a']) {
      expect(parseDecimal(text)).toBeNaN()
    }
  })

  it('keeps the sign so negatives can be rejected by validation', () => {
    expect(parseDecimal('-3')).toBe(-3)
  })
})

describe('validateNumber', () => {
  it('accepts zero and positive numbers by default', () => {
    expect(validateNumber(0)).toBeNull()
    expect(validateNumber(3.5)).toBeNull()
  })

  it('rejects NaN and negatives', () => {
    expect(validateNumber(NaN)).toBe('Enter a number')
    expect(validateNumber(-1)).toBe('Cannot be negative')
  })

  it('applies positive and integer rules', () => {
    expect(validateNumber(0, { positive: true })).toBe('Must be above 0')
    expect(validateNumber(2.5, { integer: true })).toBe('Must be a whole number')
    expect(validateNumber(3, { positive: true, integer: true })).toBeNull()
  })
})
