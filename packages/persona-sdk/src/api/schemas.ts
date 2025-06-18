/**
 * Zod schemas for API validation
 */

import { z } from 'zod';

// Base schemas
export const personaAttributesSchema = z.record(z.any()).default({});
export const metadataSchema = z.record(z.any()).default({});

// Persona schemas
export const createPersonaSchema = z.object({
  name: z.string().min(1).max(255),
  age: z.number().int().min(0).max(150).nullable().optional(),
  occupation: z.string().min(0).max(255).nullable().optional(),
  sex: z.enum(['male', 'female', 'other']).nullable().optional(),
  attributes: personaAttributesSchema.optional(),
  metadata: metadataSchema.optional(),
});

export const updatePersonaSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  age: z.number().int().min(0).max(150).nullable().optional(),
  occupation: z.string().max(255).nullable().optional(),
  sex: z.enum(['male', 'female', 'other']).nullable().optional(),
  attributes: personaAttributesSchema.optional(),
  metadata: metadataSchema.optional(),
});

export const personaQuerySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  age: z.union([
    z.string().transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }),
    z.object({
      min: z.number().int().optional(),
      max: z.number().int().optional(),
    })
  ]).refine((data) => {
    // Apply validation to the final parsed result
    if (typeof data === 'object' && data && 'min' in data && 'max' in data) {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
    }
    return true;
  }, {
    message: "Min age must be less than or equal to max age",
  }).optional(),
  occupation: z.string().optional(),
  sex: z.string().optional(),
  attributes: personaAttributesSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  orderBy: z.enum(['name', 'age', 'created_at', 'updated_at']).default('created_at'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Persona Group schemas
export const createPersonaGroupSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  metadata: metadataSchema.optional(),
});

export const updatePersonaGroupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  metadata: metadataSchema.optional(),
});

export const personaGroupQuerySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  includeStats: z.boolean().default(false),
  includeMembers: z.boolean().default(false),
});

// Bulk operations
export const bulkCreatePersonasSchema = z.object({
  personas: z.array(createPersonaSchema).min(1).max(1000),
  groupId: z.string().uuid().optional(),
});

export const generatePersonasSchema = z.object({
  count: z.number().int().min(1).max(1000),
  distributionId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  attributes: personaAttributesSchema.optional(),
});

// Group membership
export const addToGroupSchema = z.object({
  personaId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export const removeFromGroupSchema = z.object({
  personaId: z.string().uuid(),
  groupId: z.string().uuid(),
});

// Response schemas
export const personaResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  age: z.number().nullable(),
  occupation: z.string().nullable(),
  sex: z.string().nullable(),
  attributes: personaAttributesSchema,
  metadata: metadataSchema,
  created_at: z.date(),
  updated_at: z.date(),
});

export const personaGroupResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  metadata: metadataSchema,
  created_at: z.date(),
  updated_at: z.date(),
});

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
  });

export const statsResponseSchema = z.object({
  totalPersonas: z.number(),
  totalGroups: z.number(),
  avgGroupSize: z.number(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// Type exports
export type CreatePersonaInput = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
export type PersonaQuery = z.infer<typeof personaQuerySchema>;
export type CreatePersonaGroupInput = z.infer<typeof createPersonaGroupSchema>;
export type UpdatePersonaGroupInput = z.infer<typeof updatePersonaGroupSchema>;
export type PersonaGroupQuery = z.infer<typeof personaGroupQuerySchema>;
export type BulkCreatePersonasInput = z.infer<typeof bulkCreatePersonasSchema>;
export type GeneratePersonasInput = z.infer<typeof generatePersonasSchema>;
export type PersonaResponse = z.infer<typeof personaResponseSchema>;
export type PersonaGroupResponse = z.infer<typeof personaGroupResponseSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;