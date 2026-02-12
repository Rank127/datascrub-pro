import { describe, it, expect } from 'vitest'
import {
  calculateProtectionScore,
  calculateRiskScore,
  calculateWeekOverWeekChange,
  calculateTimeSaved,
  determineBrokerStatus,
  calculateCategoryProgress,
} from './calculations'

describe('calculateProtectionScore', () => {
  it('returns 100 when no exposures', () => {
    expect(calculateProtectionScore(0, 0)).toBe(100)
  })

  it('returns 0 when no removals', () => {
    expect(calculateProtectionScore(10, 0)).toBe(0)
  })

  it('returns 50 when half removed', () => {
    expect(calculateProtectionScore(10, 5)).toBe(50)
  })

  it('returns 100 when all removed', () => {
    expect(calculateProtectionScore(10, 10)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateProtectionScore(3, 1)).toBe(33)
  })
})

describe('calculateRiskScore', () => {
  it('returns 0 when no exposures', () => {
    expect(calculateRiskScore(0, 0, 0, 0)).toBe(0)
  })

  it('calculates base score without severity', () => {
    expect(calculateRiskScore(10, 5, 0, 0)).toBe(50)
  })

  it('adds severity penalties', () => {
    // Base: 50% + 1 critical (10) + 2 high (10) = 70
    expect(calculateRiskScore(10, 5, 1, 2)).toBe(70)
  })

  it('caps at 100', () => {
    expect(calculateRiskScore(10, 10, 10, 10)).toBe(100)
  })

  it('returns 0 when no active exposures', () => {
    expect(calculateRiskScore(10, 0, 0, 0)).toBe(0)
  })

  it('handles only critical exposures', () => {
    // Base: 10% + 3 critical (30) = 40
    expect(calculateRiskScore(10, 1, 3, 0)).toBe(40)
  })
})

describe('calculateWeekOverWeekChange', () => {
  it('returns 100 when previous is 0 and current > 0', () => {
    expect(calculateWeekOverWeekChange(5, 0)).toBe(100)
  })

  it('returns 0 when both are 0', () => {
    expect(calculateWeekOverWeekChange(0, 0)).toBe(0)
  })

  it('calculates positive change', () => {
    expect(calculateWeekOverWeekChange(15, 10)).toBe(50)
  })

  it('calculates negative change', () => {
    expect(calculateWeekOverWeekChange(5, 10)).toBe(-50)
  })

  it('calculates 100% increase (doubled)', () => {
    expect(calculateWeekOverWeekChange(20, 10)).toBe(100)
  })

  it('calculates 100% decrease (halved)', () => {
    expect(calculateWeekOverWeekChange(0, 10)).toBe(-100)
  })
})

describe('calculateTimeSaved', () => {
  it('calculates correctly for 0 removals', () => {
    expect(calculateTimeSaved(0)).toEqual({
      minutes: 0,
      hours: 0,
      estimatedValue: 0,
    })
  })

  it('calculates correctly for multiple removals', () => {
    // 10 removals * 45 min = 450 min = 7.5 hours ≈ 8 hours
    // 8 hours * $15 = $120
    const result = calculateTimeSaved(10)
    expect(result.minutes).toBe(450)
    expect(result.hours).toBe(8)
    expect(result.estimatedValue).toBe(120)
  })

  it('calculates correctly for single removal', () => {
    // 1 removal * 45 min = 45 min ≈ 1 hour
    // 1 hour * $15 = $15
    const result = calculateTimeSaved(1)
    expect(result.minutes).toBe(45)
    expect(result.hours).toBe(1)
    expect(result.estimatedValue).toBe(15)
  })

  it('handles large number of removals', () => {
    // 100 removals * 45 min = 4500 min = 75 hours
    // 75 hours * $15 = $1125
    const result = calculateTimeSaved(100)
    expect(result.minutes).toBe(4500)
    expect(result.hours).toBe(75)
    expect(result.estimatedValue).toBe(1125)
  })
})

describe('determineBrokerStatus', () => {
  it('returns PENDING when no progress', () => {
    expect(determineBrokerStatus(5, 0, 0)).toBe('PENDING')
  })

  it('returns IN_PROGRESS when some in progress', () => {
    expect(determineBrokerStatus(5, 0, 2)).toBe('IN_PROGRESS')
  })

  it('returns PARTIAL when some completed', () => {
    expect(determineBrokerStatus(5, 2, 0)).toBe('PARTIAL')
  })

  it('returns COMPLETED when all done', () => {
    expect(determineBrokerStatus(5, 5, 0)).toBe('COMPLETED')
  })

  it('returns PENDING when exposure count is 0', () => {
    expect(determineBrokerStatus(0, 0, 0)).toBe('PENDING')
  })

  it('returns PARTIAL when some completed and some in progress', () => {
    expect(determineBrokerStatus(5, 2, 1)).toBe('PARTIAL')
  })
})

describe('calculateCategoryProgress', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateCategoryProgress(0, 0)).toBe(0)
  })

  it('calculates percentage correctly', () => {
    expect(calculateCategoryProgress(10, 7)).toBe(70)
  })

  it('returns 0 when no completed', () => {
    expect(calculateCategoryProgress(10, 0)).toBe(0)
  })

  it('returns 100 when all completed', () => {
    expect(calculateCategoryProgress(10, 10)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateCategoryProgress(3, 1)).toBe(33)
  })
})
