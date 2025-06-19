import { describe, it, expect, vi } from 'vitest'
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BinomialDistribution
} from '@jamesaphoenix/persona-sdk'

// Override the global mock for this specific test file
vi.mock('@jamesaphoenix/persona-sdk', async () => {
  const actual = await vi.importActual('@jamesaphoenix/persona-sdk')
  return {
    ...actual,
    // Keep all distributions as actual implementations
    NormalDistribution: actual.NormalDistribution,
    UniformDistribution: actual.UniformDistribution,
    ExponentialDistribution: actual.ExponentialDistribution,
    BinomialDistribution: actual.BinomialDistribution
  }
})

describe('Statistical Distributions', () => {
  describe('NormalDistribution', () => {
    it('generates values with correct parameters', () => {
      const dist = new NormalDistribution(100, 15)
      const samples = Array.from({ length: 10 }, () => dist.sample())
      
      // All samples should be numbers
      samples.forEach(sample => {
        expect(typeof sample).toBe('number')
      })
      
      // Most values should be within 3 standard deviations
      const inRange = samples.filter(s => s >= 55 && s <= 145)
      expect(inRange.length).toBeGreaterThan(8)
    })

    it('calculates mean correctly', () => {
      const dist = new NormalDistribution(50, 10)
      expect(dist.mean()).toBe(50)
    })

    it('calculates variance correctly', () => {
      const dist = new NormalDistribution(50, 10)
      expect(dist.variance()).toBe(100) // variance = stdDev^2
    })
  })

  describe('UniformDistribution', () => {
    it('generates values within bounds', () => {
      const dist = new UniformDistribution(10, 20)
      const samples = Array.from({ length: 20 }, () => dist.sample())
      
      samples.forEach(sample => {
        expect(sample).toBeGreaterThanOrEqual(10)
        expect(sample).toBeLessThanOrEqual(20)
      })
    })

    it('calculates mean correctly', () => {
      const dist = new UniformDistribution(0, 100)
      expect(dist.mean()).toBe(50)
    })
  })

  describe('ExponentialDistribution', () => {
    it('generates non-negative values', () => {
      const dist = new ExponentialDistribution(2)
      const samples = Array.from({ length: 10 }, () => dist.sample())
      
      samples.forEach(sample => {
        expect(sample).toBeGreaterThanOrEqual(0)
      })
    })

    it('calculates mean correctly', () => {
      const dist = new ExponentialDistribution(0.5)
      expect(dist.mean()).toBe(2) // mean = 1/lambda
    })
  })

  describe('BinomialDistribution', () => {
    it('generates values within valid range', () => {
      const dist = new BinomialDistribution(10, 0.5)
      const samples = Array.from({ length: 20 }, () => dist.sample())
      
      samples.forEach(sample => {
        expect(sample).toBeGreaterThanOrEqual(0)
        expect(sample).toBeLessThanOrEqual(10)
        expect(Number.isInteger(sample)).toBe(true)
      })
    })

    it('calculates mean correctly', () => {
      const dist = new BinomialDistribution(20, 0.3)
      expect(dist.mean()).toBe(6) // mean = n * p
    })

    it('calculates variance correctly', () => {
      const dist = new BinomialDistribution(20, 0.3)
      expect(dist.variance()).toBeCloseTo(4.2, 1) // variance = n * p * (1-p)
    })
  })
})