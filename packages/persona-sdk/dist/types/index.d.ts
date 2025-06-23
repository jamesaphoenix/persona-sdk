import { z } from 'zod';
/**
 * Represents any value that can be used as a persona attribute.
 *
 * Supports primitive types, arrays, and nested objects to allow
 * for flexible persona modeling.
 *
 * @example
 * ```typescript
 * const attributes: Record<string, AttributeValue> = {
 *   name: 'John',              // string
 *   age: 35,                   // number
 *   isActive: true,            // boolean
 *   skills: ['JS', 'Python'],  // string[]
 *   scores: [85, 92, 88],      // number[]
 *   preferences: {             // Record<string, any>
 *     theme: 'dark',
 *     notifications: true
 *   }
 * };
 * ```
 */
export type AttributeValue = string | number | boolean | string[] | number[] | Record<string, any>;
/**
 * Zod schema for sex field.
 *
 * Provides three options following modern inclusive practices.
 */
export declare const SexSchema: z.ZodEnum<["male", "female", "other"]>;
/**
 * Type for sex field values.
 */
export type Sex = z.infer<typeof SexSchema>;
/**
 * Zod schema for base persona attributes.
 *
 * Defines the required fields that every persona must have:
 * - age: Positive integer up to 150
 * - occupation: Non-empty string up to 100 characters
 * - sex: One of 'male', 'female', or 'other'
 */
export declare const BasePersonaAttributesSchema: z.ZodObject<{
    age: z.ZodNumber;
    occupation: z.ZodString;
    sex: z.ZodEnum<["male", "female", "other"]>;
}, "strip", z.ZodTypeAny, {
    age: number;
    occupation: string;
    sex: "male" | "female" | "other";
}, {
    age: number;
    occupation: string;
    sex: "male" | "female" | "other";
}>;
/**
 * Required base attributes for all personas.
 *
 * Type-safe interface derived from the Zod schema.
 */
export type BasePersonaAttributes = z.infer<typeof BasePersonaAttributesSchema>;
/**
 * Zod schema for extended persona attributes.
 *
 * Uses passthrough to allow custom fields beyond the base requirements.
 */
export declare const PersonaAttributesSchema: z.ZodObject<{
    age: z.ZodNumber;
    occupation: z.ZodString;
    sex: z.ZodEnum<["male", "female", "other"]>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    age: z.ZodNumber;
    occupation: z.ZodString;
    sex: z.ZodEnum<["male", "female", "other"]>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    age: z.ZodNumber;
    occupation: z.ZodString;
    sex: z.ZodEnum<["male", "female", "other"]>;
}, z.ZodTypeAny, "passthrough">>;
/**
 * Extended persona attributes with custom fields.
 *
 * Combines required base attributes with any custom attributes.
 * This allows personas to have domain-specific properties while
 * ensuring core fields are always present.
 */
export type PersonaAttributes = z.infer<typeof PersonaAttributesSchema> & Record<string, AttributeValue>;
/**
 * Distribution interface for generating random values.
 *
 * All statistical distributions must implement this interface
 * to ensure consistent behavior across the SDK.
 *
 * @template T - Type of values the distribution generates (default: number)
 */
export interface Distribution<T = number> {
    /**
     * Sample a value from the distribution
     */
    sample(): T;
    /**
     * Get the mean/expected value of the distribution
     */
    mean(): T;
    /**
     * Get the variance of the distribution (if applicable)
     */
    variance?(): number;
    /**
     * Get a human-readable description of the distribution
     */
    toString(): string;
}
/**
 * Distribution specification that can include static values.
 *
 * Allows flexibility in persona generation by accepting either
 * a distribution (for random sampling) or a static value.
 */
export type DistributionSpec = Distribution | AttributeValue;
/**
 * Collection of distributions for generating persona attributes.
 *
 * Maps attribute names to their generation specifications.
 *
 * @example
 * ```typescript
 * const distributions: DistributionMap = {
 *   age: new NormalDistribution(30, 5),
 *   occupation: 'Developer',  // Static value
 *   sex: new CategoricalDistribution([
 *     { value: 'male', probability: 0.5 },
 *     { value: 'female', probability: 0.5 }
 *   ])
 * };
 * ```
 */
export type DistributionMap = Record<string, DistributionSpec>;
/**
 * Options for creating a PersonaGroup.
 *
 * Configure group behavior and defaults.
 */
export interface PersonaGroupOptions {
    /**
     * Maximum number of personas allowed in the group
     */
    maxSize?: number;
    /**
     * Default distributions to use when generating personas
     */
    defaultDistributions?: DistributionMap;
}
/**
 * Result from PersonaGroup structured output generation.
 *
 * Contains both the generated data and metadata about the generation process.
 *
 * @template T - Type of the generated data structure
 */
export interface StructuredOutput<T = any> {
    /**
     * The generated output data
     */
    data: T;
    /**
     * Metadata about the generation process
     */
    metadata: {
        /**
         * Distribution used for generation
         */
        distribution?: string;
        /**
         * Model used for generation
         */
        model?: string;
        /**
         * Timestamp of generation
         */
        timestamp: Date;
        /**
         * Additional metadata
         */
        [key: string]: any;
    };
}
/**
 * Represents a correlation between two attributes
 */
export interface AttributeCorrelation {
    attribute1: string;
    attribute2: string;
    correlation: number;
    type?: 'linear' | 'exponential' | 'logarithmic';
}
export * from './branded.js';
export * from './inference.js';
export * from './distribution.js';
//# sourceMappingURL=index.d.ts.map