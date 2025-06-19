/**
 * Tests for validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  PersonaSchema,
  PersonaGroupSchema,
  NormalDistributionSchema,
  UniformDistributionSchema,
  ExponentialDistributionSchema,
  BetaDistributionSchema,
  CategoricalDistributionSchema,
  DistributionSchema,
  CorrelationConfigSchema,
  GroupGenerationConfigSchema,
  validatePersona,
  safeParsePersona,
  safeParseDistribution
} from '../src/schemas/validation';

describe('Validation Schemas', () => {
  describe('PersonaSchema', () => {
    it('should validate valid persona', () => {
      const validPersona = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        attributes: {
          age: 30,
          occupation: 'Developer',
          sex: 'male'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = PersonaSchema.safeParse(validPersona);
      expect(result.success).toBe(true);
    });

    it('should reject invalid persona', () => {
      const invalidPersona = {
        id: 'not-a-uuid',
        name: '', // Empty name
        attributes: 'not-an-object',
        createdAt: 'not-a-date',
        updatedAt: new Date()
      };

      const result = PersonaSchema.safeParse(invalidPersona);
      expect(result.success).toBe(false);
    });

    it('should work with validation helper', () => {
      const validPersona = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane Doe',
        attributes: { age: 25 },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const persona = validatePersona(validPersona);
      expect(persona.name).toBe('Jane Doe');
    });
  });

  describe('Distribution Schemas', () => {
    it('should validate normal distribution', () => {
      const valid = {
        type: 'normal',
        mean: 100,
        stdDev: 15,
        seed: 12345
      };

      const result = NormalDistributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate uniform distribution', () => {
      const valid = {
        type: 'uniform',
        min: 0,
        max: 100
      };

      const result = UniformDistributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject uniform with min > max', () => {
      const invalid = {
        type: 'uniform',
        min: 100,
        max: 0
      };

      const result = UniformDistributionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate exponential distribution', () => {
      const valid = {
        type: 'exponential',
        lambda: 0.5
      };

      const result = ExponentialDistributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate beta distribution', () => {
      const valid = {
        type: 'beta',
        alpha: 2,
        beta: 5
      };

      const result = BetaDistributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate categorical distribution', () => {
      const valid = {
        type: 'categorical',
        categories: [
          { value: 'A', probability: 0.5 },
          { value: 'B', probability: 0.3 },
          { value: 'C', probability: 0.2 }
        ]
      };

      const result = CategoricalDistributionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject categorical with probabilities not summing to 1', () => {
      const invalid = {
        type: 'categorical',
        categories: [
          { value: 'A', probability: 0.5 },
          { value: 'B', probability: 0.5 },
          { value: 'C', probability: 0.5 }
        ]
      };

      const result = CategoricalDistributionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should work with discriminated union', () => {
      const distributions = [
        { type: 'normal', mean: 0, stdDev: 1 },
        { type: 'uniform', min: 0, max: 1 },
        { type: 'exponential', lambda: 1 },
        { type: 'beta', alpha: 1, beta: 1 },
        { type: 'categorical', categories: [{ value: 'X', probability: 1 }] }
      ];

      distributions.forEach(dist => {
        const result = DistributionSchema.safeParse(dist);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Correlation and Conditional Schemas', () => {
    it('should validate correlation config', () => {
      const valid = {
        attribute1: 'age',
        attribute2: 'income',
        correlation: 0.7
      };

      const result = CorrelationConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject correlation outside [-1, 1]', () => {
      const invalid = {
        attribute1: 'age',
        attribute2: 'income',
        correlation: 1.5
      };

      const result = CorrelationConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Group Generation Config Schema', () => {
    it('should validate basic config', () => {
      const valid = {
        size: 100
      };

      const result = GroupGenerationConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate complex config', () => {
      const valid = {
        size: 1000,
        attributes: {
          age: { type: 'normal', mean: 30, stdDev: 5 },
          category: 'test'
        },
        segments: [
          {
            name: 'Segment A',
            weight: 0.6,
            attributes: { level: 1 }
          },
          {
            name: 'Segment B',
            weight: 0.4,
            attributes: { level: 2 }
          }
        ],
        correlations: [
          {
            attribute1: 'age',
            attribute2: 'income',
            correlation: 0.6
          }
        ]
      };

      const result = GroupGenerationConfigSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject negative size', () => {
      const invalid = {
        size: -10
      };

      const result = GroupGenerationConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer size', () => {
      const invalid = {
        size: 10.5
      };

      const result = GroupGenerationConfigSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Safe Parsing Helpers', () => {
    it('should safely parse valid data', () => {
      const validPersona = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test',
        attributes: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = safeParsePersona(validPersona);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test');
      }
    });

    it('should safely parse invalid data', () => {
      const invalidPersona = {
        id: 'invalid',
        name: 123, // Wrong type
        attributes: null
      };

      const result = safeParsePersona(invalidPersona);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should safely parse distributions', () => {
      const validDist = {
        type: 'normal',
        mean: 50,
        stdDev: 10
      };

      const result = safeParseDistribution(validDist);
      expect(result.success).toBe(true);
    });
  });
});