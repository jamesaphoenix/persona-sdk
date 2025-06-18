import { Persona } from './persona';
import { PersonaGroupOptions, DistributionMap, StructuredOutput, PersonaAttributes, AttributeCorrelation } from './types';
import { z } from 'zod';
/**
 * Represents a group of personas for collective analysis and generation.
 *
 * PersonaGroup allows you to manage collections of personas, generate them
 * from distributions, analyze their attributes statistically, and create
 * structured outputs using AI.
 *
 * @template T - Type of persona attributes
 *
 * @example
 * ```typescript
 * // Create a group and add personas
 * const group = new PersonaGroup('Marketing Audience');
 * group.add(new Persona('Alice', { age: 25, occupation: 'Designer', sex: 'female' }));
 *
 * // Generate personas from distributions
 * group.generateFromDistributions(100, {
 *   age: new NormalDistribution(30, 5),
 *   occupation: new CategoricalDistribution([
 *     { value: 'Developer', probability: 0.6 },
 *     { value: 'Manager', probability: 0.4 }
 *   ]),
 *   sex: 'other'
 * });
 *
 * // Get statistics
 * const ageStats = group.getStatistics('age');
 * console.log(`Average age: ${ageStats.mean}`);
 * ```
 */
export declare class PersonaGroup<T extends PersonaAttributes = PersonaAttributes> {
    /**
     * Name of the persona group.
     * Used for identification and when generating persona names.
     */
    readonly name: string;
    /**
     * Internal storage for personas.
     * @private
     */
    private _personas;
    /**
     * Options for the group.
     * Includes settings like maxSize and defaultDistributions.
     * @private
     */
    private options;
    /**
     * Create a new PersonaGroup.
     *
     * @param name - Name of the group
     * @param personas - Initial personas to add to the group
     * @param options - Configuration options
     * @param options.maxSize - Maximum number of personas allowed in the group
     * @param options.defaultDistributions - Default distributions for generation
     */
    constructor(name: string, personas?: Persona<T>[], options?: PersonaGroupOptions);
    /**
     * Get all personas in the group.
     *
     * Returns a copy of the personas array to prevent external modifications.
     *
     * @returns Array of all personas in the group
     */
    get personas(): Persona<T>[];
    /**
     * Get the number of personas in the group.
     *
     * @returns Current size of the group
     */
    get size(): number;
    /**
     * Add a persona to the group.
     *
     * @param persona - Persona to add
     * @throws {Error} If the group has reached its maximum size
     */
    add(persona: Persona<T>): void;
    /**
     * Add a raw persona object to the group.
     *
     * @param rawPersona - Raw persona object with id, name, and attributes
     */
    addRaw(rawPersona: {
        id: string;
        name: string;
        attributes: T;
    }): void;
    /**
     * Remove a persona by ID.
     *
     * @param personaId - ID of the persona to remove
     * @returns True if a persona was removed, false otherwise
     */
    remove(personaId: string): boolean;
    /**
     * Find a persona by ID.
     *
     * @param personaId - ID of the persona to find
     * @returns The persona if found, undefined otherwise
     */
    find(personaId: string): Persona<T> | undefined;
    /**
     * Filter personas by a predicate function.
     *
     * @param predicate - Function to test each persona
     * @returns Array of personas that match the predicate
     *
     * @example
     * ```typescript
     * // Find all personas over 30
     * const seniors = group.filter(p => p.attributes.age > 30);
     *
     * // Find all engineers
     * const engineers = group.filter(p => p.attributes.occupation === 'Engineer');
     * ```
     */
    filter(predicate: (persona: Persona<T>) => boolean): Persona<T>[];
    /**
     * Clear all personas from the group.
     *
     * Removes all personas, resetting the group to empty state.
     */
    clear(): void;
    /**
     * Generate personas from distributions.
     *
     * Creates multiple personas by sampling from provided distributions.
     * If no distributions are provided, uses the default distributions
     * set in the group options.
     *
     * @param count - Number of personas to generate
     * @param distributions - Map of attribute distributions (optional)
     * @throws {Error} If no distributions are available
     *
     * @example
     * ```typescript
     * // You can mix distributions with literal values
     * // Distributions will be sampled for each persona
     * // Literal values will be the same for all personas
     * group.generateFromDistributions(50, {
     *   age: new NormalDistribution(35, 7),      // Distribution: varies
     *   occupation: 'Analyst',                   // Literal: constant
     *   sex: new CategoricalDistribution([       // Distribution: varies
     *     { value: 'male', probability: 0.45 },
     *     { value: 'female', probability: 0.45 },
     *     { value: 'other', probability: 0.1 }
     *   ]),
     *   income: new UniformDistribution(40000, 80000), // Distribution: varies
     *   department: 'Analytics',                 // Literal: constant
     *   isFullTime: true                         // Literal: constant
     * });
     * ```
     */
    generateFromDistributions(count: number, distributions?: DistributionMap): void;
    /**
     * Generate personas with correlated attributes.
     *
     * Creates multiple personas where attributes have realistic correlations,
     * such as age correlating with income and experience.
     *
     * @param count - Number of personas to generate
     * @param config - Configuration for attributes, correlations, and conditionals
     *
     * @example
     * ```typescript
     * // Generate tech workers with realistic correlations
     * group.generateWithCorrelations(100, {
     *   attributes: {
     *     age: new NormalDistribution(32, 8),
     *     yearsExperience: new NormalDistribution(8, 4),
     *     income: new NormalDistribution(95000, 30000),
     *     height: new NormalDistribution(170, 10),
     *     weight: new NormalDistribution(70, 15),
     *     occupation: 'Software Engineer',
     *     sex: 'other'
     *   },
     *   correlations: [
     *     { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
     *     { attribute1: 'age', attribute2: 'yearsExperience', correlation: 0.8 },
     *     { attribute1: 'height', attribute2: 'weight', correlation: 0.7 }
     *   ],
     *   conditionals: [
     *     {
     *       attribute: 'yearsExperience',
     *       dependsOn: 'age',
     *       transform: (exp, age) => Math.min(exp, Math.max(0, age - 22))
     *     },
     *     {
     *       attribute: 'income',
     *       dependsOn: 'yearsExperience',
     *       transform: (income, exp) => income * (1 + exp * 0.05)
     *     }
     *   ]
     * });
     * ```
     */
    generateWithCorrelations(count: number, config: {
        attributes: DistributionMap;
        correlations?: AttributeCorrelation[];
        conditionals?: Array<{
            attribute: string;
            dependsOn: string;
            transform: (value: number, dependentValue: any) => number;
        }>;
    }): void;
    /**
     * Get statistics for a numeric attribute.
     *
     * Calculates statistical measures (mean, median, min, max, standard deviation)
     * for the specified numeric attribute across all personas.
     *
     * @param attributeName - Name of the attribute to analyze
     * @returns Statistical summary object
     *
     * @example
     * ```typescript
     * const ageStats = group.getStatistics('age');
     * console.log(`Average age: ${ageStats.mean}`);
     * console.log(`Age range: ${ageStats.min} - ${ageStats.max}`);
     * ```
     */
    getStatistics(attributeName: string): {
        mean?: number;
        median?: number;
        min?: number;
        max?: number;
        stdDev?: number;
        count: number;
    };
    /**
     * Generate structured output using AI.
     *
     * Uses LangChain's structured output feature to analyze the persona group
     * as a focus group, with each persona contributing their perspective.
     *
     * @template T - Type of the structured output
     * @param schema - Zod schema defining the output structure
     * @param prompt - Custom prompt for the AI (optional)
     * @param options - Configuration options
     * @param options.apiKey - OpenAI API key (optional, uses env var if not provided)
     * @param options.modelName - Model to use (default: 'gpt-4.1-mini')
     * @param options.systemPrompt - Custom system prompt (optional)
     * @param options.temperature - Model temperature (default: 0.7)
     * @returns Promise resolving to structured output with metadata
     *
     * @example
     * ```typescript
     * const MarketInsightSchema = z.object({
     *   targetSegment: z.string(),
     *   averageIncome: z.number(),
     *   topInterests: z.array(z.string()),
     *   recommendations: z.array(z.string())
     * });
     *
     * const insights = await group.generateStructuredOutput(
     *   MarketInsightSchema,
     *   "Analyze this audience for marketing campaign targeting",
     *   { modelName: 'gpt-4o-mini', temperature: 0.8 }
     * );
     * ```
     */
    generateStructuredOutput<T = any>(schema: z.ZodSchema<T>, prompt?: string, options?: {
        apiKey?: string;
        modelName?: string;
        systemPrompt?: string;
        temperature?: number;
    }): Promise<StructuredOutput<T>>;
    /**
     * Convert to plain object.
     *
     * Serializes the group and all its personas to a simple JavaScript object.
     *
     * @returns Object representation of the group
     */
    toObject(): {
        name: string;
        personas: Array<{
            id: string;
            name: string;
            attributes: any;
        }>;
        size: number;
    };
    /**
     * Convert to JSON string.
     *
     * Serializes the group to JSON for storage or transmission.
     *
     * @returns JSON string representation of the group
     */
    toJSON(): string;
    /**
     * Create a summary of the group.
     *
     * Analyzes the group to find common patterns and attribute distributions.
     * Identifies the most common values for each attribute when they appear
     * in more than half of the personas.
     *
     * @returns Summary object with group statistics and common attributes
     *
     * @example
     * ```typescript
     * const summary = group.getSummary();
     * console.log(`Group: ${summary.name} (${summary.size} personas)`);
     * console.log(`Common attributes:`, summary.commonAttributes);
     * ```
     */
    getSummary(): {
        name: string;
        size: number;
        attributeKeys: string[];
        commonAttributes: Record<string, any>;
    };
    /**
     * Static method to generate a PersonaGroup with segments.
     *
     * @param config - Configuration for generating the group
     * @returns Promise resolving to a new PersonaGroup
     */
    static generate<T extends PersonaAttributes = PersonaAttributes>(config: {
        size: number;
        segments: Array<{
            name?: string;
            weight: number;
            attributes: DistributionMap;
        }>;
    }): Promise<PersonaGroup<T>>;
}
//# sourceMappingURL=persona-group.d.ts.map