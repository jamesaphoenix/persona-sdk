/**
 * Tests for Zod schemas validation
 */

import { describe, it, expect } from 'vitest';
import {
  createPersonaSchema,
  updatePersonaSchema,
  personaQuerySchema,
  createPersonaGroupSchema,
  updatePersonaGroupSchema,
  personaGroupQuerySchema,
  bulkCreatePersonasSchema,
  generatePersonasSchema,
  addToGroupSchema,
  removeFromGroupSchema,
  personaResponseSchema,
  personaGroupResponseSchema,
  paginatedResponseSchema,
  statsResponseSchema,
  errorResponseSchema,
} from '../../src/api/schemas.js';
import { z } from 'zod';

describe('API Schemas', () => {
  describe('createPersonaSchema', () => {
    it('should validate valid persona creation data', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        occupation: 'Engineer',
        sex: 'male',
        attributes: { skills: ['TypeScript', 'React'] },
        metadata: { source: 'test' },
      };

      const result = createPersonaSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should require name field', () => {
      const invalidData = {
        age: 30,
        occupation: 'Engineer',
      };

      const result = createPersonaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should validate age constraints', () => {
      const tooYoung = createPersonaSchema.safeParse({
        name: 'Test',
        age: -1,
      });
      expect(tooYoung.success).toBe(false);

      const tooOld = createPersonaSchema.safeParse({
        name: 'Test',
        age: 151,
      });
      expect(tooOld.success).toBe(false);

      const justRight = createPersonaSchema.safeParse({
        name: 'Test',
        age: 50,
      });
      expect(justRight.success).toBe(true);
    });

    it('should enforce string length limits', () => {
      const longName = createPersonaSchema.safeParse({
        name: 'a'.repeat(256),
      });
      expect(longName.success).toBe(false);

      const validName = createPersonaSchema.safeParse({
        name: 'a'.repeat(255),
      });
      expect(validName.success).toBe(true);
    });

    it('should handle optional fields', () => {
      const minimal = createPersonaSchema.safeParse({
        name: 'Minimal Person',
      });
      expect(minimal.success).toBe(true);
      if (minimal.success) {
        expect(minimal.data.age).toBeUndefined();
        expect(minimal.data.occupation).toBeUndefined();
        expect(minimal.data.sex).toBeUndefined();
        expect(minimal.data.attributes).toBeUndefined();
        expect(minimal.data.metadata).toBeUndefined();
      }
    });

    it('should provide default values for objects', () => {
      const withDefaults = createPersonaSchema.safeParse({
        name: 'Test',
        attributes: undefined,
        metadata: undefined,
      });
      expect(withDefaults.success).toBe(true);
    });
  });

  describe('updatePersonaSchema', () => {
    it('should allow all fields to be optional', () => {
      const emptyUpdate = updatePersonaSchema.safeParse({});
      expect(emptyUpdate.success).toBe(true);
    });

    it('should allow null values for nullable fields', () => {
      const nullUpdate = updatePersonaSchema.safeParse({
        age: null,
        occupation: null,
        sex: null,
      });
      expect(nullUpdate.success).toBe(true);
      if (nullUpdate.success) {
        expect(nullUpdate.data.age).toBeNull();
        expect(nullUpdate.data.occupation).toBeNull();
        expect(nullUpdate.data.sex).toBeNull();
      }
    });

    it('should validate field constraints when provided', () => {
      const invalidAge = updatePersonaSchema.safeParse({
        age: 200,
      });
      expect(invalidAge.success).toBe(false);

      const validUpdate = updatePersonaSchema.safeParse({
        name: 'Updated Name',
        age: 35,
      });
      expect(validUpdate.success).toBe(true);
    });
  });

  describe('personaQuerySchema', () => {
    it('should provide default pagination values', () => {
      const emptyQuery = personaQuerySchema.safeParse({});
      expect(emptyQuery.success).toBe(true);
      if (emptyQuery.success) {
        expect(emptyQuery.data.limit).toBe(20);
        expect(emptyQuery.data.offset).toBe(0);
        expect(emptyQuery.data.orderBy).toBe('created_at');
        expect(emptyQuery.data.orderDirection).toBe('desc');
      }
    });

    it('should validate UUID format', () => {
      const validUuid = personaQuerySchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(validUuid.success).toBe(true);

      const invalidUuid = personaQuerySchema.safeParse({
        id: 'not-a-uuid',
      });
      expect(invalidUuid.success).toBe(false);
    });

    it('should validate age range object', () => {
      const validRange = personaQuerySchema.safeParse({
        age: { min: 20, max: 30 },
      });
      expect(validRange.success).toBe(true);

      const partialRange = personaQuerySchema.safeParse({
        age: { min: 25 },
      });
      expect(partialRange.success).toBe(true);
    });

    it('should enforce pagination limits', () => {
      const tooManyResults = personaQuerySchema.safeParse({
        limit: 101,
      });
      expect(tooManyResults.success).toBe(false);

      const negativeOffset = personaQuerySchema.safeParse({
        offset: -1,
      });
      expect(negativeOffset.success).toBe(false);
    });

    it('should validate enum values', () => {
      const validOrder = personaQuerySchema.safeParse({
        orderBy: 'age',
        orderDirection: 'asc',
      });
      expect(validOrder.success).toBe(true);

      const invalidOrder = personaQuerySchema.safeParse({
        orderBy: 'invalid_field',
      });
      expect(invalidOrder.success).toBe(false);
    });
  });

  describe('bulkCreatePersonasSchema', () => {
    it('should validate array of personas', () => {
      const validBulk = bulkCreatePersonasSchema.safeParse({
        personas: [
          { name: 'Person 1' },
          { name: 'Person 2', age: 30 },
          { name: 'Person 3', occupation: 'Engineer' },
        ],
      });
      expect(validBulk.success).toBe(true);
    });

    it('should enforce minimum array length', () => {
      const emptyArray = bulkCreatePersonasSchema.safeParse({
        personas: [],
      });
      expect(emptyArray.success).toBe(false);
    });

    it('should enforce maximum array length', () => {
      const tooMany = bulkCreatePersonasSchema.safeParse({
        personas: Array(1001).fill({ name: 'Test' }),
      });
      expect(tooMany.success).toBe(false);
    });

    it('should validate each persona in array', () => {
      const invalidPersona = bulkCreatePersonasSchema.safeParse({
        personas: [
          { name: 'Valid' },
          { age: 30 }, // Missing name
          { name: 'Also Valid' },
        ],
      });
      expect(invalidPersona.success).toBe(false);
    });

    it('should validate optional groupId', () => {
      const withGroup = bulkCreatePersonasSchema.safeParse({
        personas: [{ name: 'Test' }],
        groupId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(withGroup.success).toBe(true);

      const invalidGroupId = bulkCreatePersonasSchema.safeParse({
        personas: [{ name: 'Test' }],
        groupId: 'not-a-uuid',
      });
      expect(invalidGroupId.success).toBe(false);
    });
  });

  describe('Response Schemas', () => {
    describe('personaResponseSchema', () => {
      it('should validate complete persona response', () => {
        const response = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          age: 30,
          occupation: 'Engineer',
          sex: 'male',
          attributes: { skills: ['TypeScript'] },
          metadata: { source: 'api' },
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = personaResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });

      it('should handle null values in response', () => {
        const response = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Jane Doe',
          age: null,
          occupation: null,
          sex: null,
          attributes: {},
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = personaResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });

    describe('paginatedResponseSchema', () => {
      it('should create schema for paginated results', () => {
        const paginatedPersonas = paginatedResponseSchema(personaResponseSchema);
        
        const validData = {
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test',
            age: null,
            occupation: null,
            sex: null,
            attributes: {},
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
          }],
          total: 100,
          page: 1,
          pageSize: 20,
          hasMore: true,
        };

        const result = paginatedPersonas.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should work with different item schemas', () => {
        const paginatedGroups = paginatedResponseSchema(personaGroupResponseSchema);
        
        const validData = {
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Group',
            description: 'A test group',
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
          }],
          total: 5,
          page: 1,
          pageSize: 20,
          hasMore: false,
        };

        const result = paginatedGroups.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('statsResponseSchema', () => {
      it('should validate statistics response', () => {
        const stats = {
          totalPersonas: 100,
          totalGroups: 10,
          avgGroupSize: 10.5,
        };

        const result = statsResponseSchema.safeParse(stats);
        expect(result.success).toBe(true);
      });

      it('should handle zero values', () => {
        const emptyStats = {
          totalPersonas: 0,
          totalGroups: 0,
          avgGroupSize: 0,
        };

        const result = statsResponseSchema.safeParse(emptyStats);
        expect(result.success).toBe(true);
      });
    });

    describe('errorResponseSchema', () => {
      it('should validate error responses', () => {
        const error = {
          error: 'Something went wrong',
          code: 'INTERNAL_ERROR',
          details: { field: 'name', issue: 'required' },
        };

        const result = errorResponseSchema.safeParse(error);
        expect(result.success).toBe(true);
      });

      it('should allow minimal error response', () => {
        const minimalError = {
          error: 'Not found',
        };

        const result = errorResponseSchema.safeParse(minimalError);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.code).toBeUndefined();
          expect(result.data.details).toBeUndefined();
        }
      });

      it('should allow any type for details', () => {
        const complexError = {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [
            { field: 'name', message: 'required' },
            { field: 'age', message: 'must be positive' },
          ],
        };

        const result = errorResponseSchema.safeParse(complexError);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle extremely long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = createPersonaSchema.safeParse({
        name: 'Test',
        attributes: { longData: longString },
      });
      expect(result.success).toBe(true);
    });

    it('should handle deeply nested objects', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep',
                },
              },
            },
          },
        },
      };

      const result = createPersonaSchema.safeParse({
        name: 'Test',
        attributes: deepObject,
      });
      expect(result.success).toBe(true);
    });

    it('should handle various special characters', () => {
      const specialChars = `Test "quotes" 'apostrophes' \\ backslash / slash
        新 中文 العربية emoji 😀 tabs\ttabs newlines\nnewlines`;

      const result = createPersonaSchema.safeParse({
        name: specialChars,
        occupation: specialChars,
        attributes: { special: specialChars },
      });
      expect(result.success).toBe(true);
    });

    it('should handle array attributes', () => {
      const result = createPersonaSchema.safeParse({
        name: 'Test',
        attributes: {
          tags: ['tag1', 'tag2', 'tag3'],
          numbers: [1, 2, 3, 4, 5],
          mixed: ['string', 123, true, null, { nested: 'object' }],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should coerce compatible types', () => {
      // Zod coerces string numbers to numbers for number fields
      const result = personaQuerySchema.safeParse({
        limit: '50' as any,
        offset: '10' as any,
      });
      expect(result.success).toBe(true); // Zod coerces with z.coerce
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(10);
      }
    });
  });

  describe('Schema Composition', () => {
    it('should compose schemas correctly', () => {
      // Test that response schemas include all required fields
      const personaData = {
        name: 'Test Person',
        age: 30,
      };

      const createResult = createPersonaSchema.safeParse(personaData);
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Simulate server adding required response fields
        const responseData = {
          ...createResult.data,
          id: '123e4567-e89b-12d3-a456-426614174000',
          age: createResult.data.age ?? null,
          occupation: createResult.data.occupation ?? null,
          sex: createResult.data.sex ?? null,
          attributes: createResult.data.attributes || {},
          metadata: createResult.data.metadata || {},
          created_at: new Date(),
          updated_at: new Date(),
        };

        const responseResult = personaResponseSchema.safeParse(responseData);
        expect(responseResult.success).toBe(true);
      }
    });
  });
});