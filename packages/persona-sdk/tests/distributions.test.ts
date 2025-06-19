import { describe, it, expect } from 'vitest';
import {
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution
} from '../src/distributions';

describe('Distributions', () => {
  describe('UniformDistribution', () => {
    it('should create uniform distribution', () => {
      const dist = new UniformDistribution(0, 10);
      expect(dist.mean()).toBe(5);
      expect(dist.variance()).toBeCloseTo(8.333, 2);
    });

    it('should sample within bounds', () => {
      const dist = new UniformDistribution(10, 20);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample();
        expect(sample).toBeGreaterThanOrEqual(10);
        expect(sample).toBeLessThanOrEqual(20);
      }
    });

    it('should handle single point distribution', () => {
      const dist = new UniformDistribution(42, 42);
      expect(dist.mean()).toBe(42);
      expect(dist.variance()).toBe(0);
      expect(dist.sample()).toBe(42);
    });

    it('should throw error for invalid range', () => {
      expect(() => new UniformDistribution(10, 5)).toThrow('Min must be less than or equal to max');
    });
  });

  describe('NormalDistribution', () => {
    it('should create normal distribution', () => {
      const dist = new NormalDistribution(100, 15);
      expect(dist.mean()).toBe(100);
      expect(dist.variance()).toBe(225);
    });

    it('should sample reasonable values', () => {
      const dist = new NormalDistribution(50, 10);
      const samples = Array.from({ length: 1000 }, () => dist.sample());
      const mean = samples.reduce((a, b) => a + b) / samples.length;
      expect(mean).toBeGreaterThan(45);
      expect(mean).toBeLessThan(55);
    });

    it('should throw error for non-positive std dev', () => {
      expect(() => new NormalDistribution(50, 0)).toThrow('Standard deviation must be positive');
      expect(() => new NormalDistribution(50, -1)).toThrow('Standard deviation must be positive');
    });
  });

  describe('ExponentialDistribution', () => {
    it('should create exponential distribution', () => {
      const lambda = 2;
      const dist = new ExponentialDistribution(lambda);
      expect(dist.mean()).toBe(0.5);
      expect(dist.variance()).toBe(0.25);
    });

    it('should sample non-negative values', () => {
      const dist = new ExponentialDistribution(1);
      for (let i = 0; i < 100; i++) {
        expect(dist.sample()).toBeGreaterThanOrEqual(0);
      }
    });

    it('should throw error for non-positive lambda', () => {
      expect(() => new ExponentialDistribution(0)).toThrow('Lambda must be positive');
      expect(() => new ExponentialDistribution(-1)).toThrow('Lambda must be positive');
    });
  });

  describe('BetaDistribution', () => {
    it('should create beta distribution', () => {
      const dist = new BetaDistribution(2, 5);
      const expectedMean = 2 / (2 + 5);
      expect(dist.mean()).toBeCloseTo(expectedMean, 5);
    });

    it('should sample in [0, 1]', () => {
      const dist = new BetaDistribution(2, 2);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample();
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }
    });

    it('should scale samples correctly', () => {
      const dist = new BetaDistribution(2, 2);
      const scaled = dist.scale(10, 20);
      for (let i = 0; i < 100; i++) {
        const sample = scaled.sample();
        expect(sample).toBeGreaterThanOrEqual(10);
        expect(sample).toBeLessThanOrEqual(20);
      }
    });

    it('should throw error for non-positive parameters', () => {
      expect(() => new BetaDistribution(0, 1)).toThrow('Alpha and beta must be positive');
      expect(() => new BetaDistribution(1, 0)).toThrow('Alpha and beta must be positive');
      expect(() => new BetaDistribution(-1, 1)).toThrow('Alpha and beta must be positive');
    });
  });

  describe('CategoricalDistribution', () => {
    it('should create categorical distribution', () => {
      const categories = [
        { value: 'A', probability: 0.5 },
        { value: 'B', probability: 0.3 },
        { value: 'C', probability: 0.2 }
      ];
      const dist = new CategoricalDistribution(categories);
      
      const probs = dist.getProbabilities();
      expect(probs).toEqual({
        'A': 0.5,
        'B': 0.3,
        'C': 0.2
      });
    });

    it('should sample valid categories', () => {
      const categories = [
        { value: 'red', probability: 0.4 },
        { value: 'blue', probability: 0.6 }
      ];
      const dist = new CategoricalDistribution(categories);
      
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample();
        expect(['red', 'blue']).toContain(sample);
      }
    });

    it('should normalize probabilities', () => {
      const categories = [
        { value: 'A', probability: 1 },
        { value: 'B', probability: 2 },
        { value: 'C', probability: 1 }
      ];
      const dist = new CategoricalDistribution(categories);
      
      const probs = dist.getProbabilities();
      expect(probs['A']).toBeCloseTo(0.25, 5);
      expect(probs['B']).toBeCloseTo(0.5, 5);
      expect(probs['C']).toBeCloseTo(0.25, 5);
    });

    it('should throw error for empty categories', () => {
      expect(() => new CategoricalDistribution([])).toThrow('At least one category is required');
    });

    it('should throw error for non-positive probabilities', () => {
      const categories = [
        { value: 'A', probability: 0 },
        { value: 'B', probability: 1 }
      ];
      expect(() => new CategoricalDistribution(categories)).toThrow('All probabilities must be positive');
    });
  });
});