import { z } from 'zod';
/**
 * Zod schema for sex field.
 *
 * Provides three options following modern inclusive practices.
 */
export const SexSchema = z.enum(['male', 'female', 'other']);
/**
 * Zod schema for base persona attributes.
 *
 * Defines the required fields that every persona must have:
 * - age: Positive integer up to 150
 * - occupation: Non-empty string up to 100 characters
 * - sex: One of 'male', 'female', or 'other'
 */
export const BasePersonaAttributesSchema = z.object({
    age: z.number().int().positive().max(150),
    occupation: z.string().min(1).max(100),
    sex: SexSchema
});
/**
 * Zod schema for extended persona attributes.
 *
 * Uses passthrough to allow custom fields beyond the base requirements.
 */
export const PersonaAttributesSchema = BasePersonaAttributesSchema.passthrough();
// Re-export branded types
export * from './branded.js';
// Re-export inference types
export * from './inference.js';
// Re-export distribution types
export * from './distribution.js';
//# sourceMappingURL=index.js.map