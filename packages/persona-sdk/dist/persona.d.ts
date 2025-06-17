import { BasePersonaAttributes, PersonaAttributes, DistributionMap } from './types';
/**
 * Represents an individual persona with required and custom attributes.
 *
 * A Persona is the core entity in the SDK, representing a simulated individual
 * with both required attributes (age, occupation, sex) and custom attributes.
 *
 * @template T - Type of custom attributes extending the base attributes
 *
 * @example
 * ```typescript
 * // Create a basic persona
 * const person = new Persona('John Doe', {
 *   age: 35,
 *   occupation: 'Software Engineer',
 *   sex: 'male'
 * });
 *
 * // Create with custom attributes
 * const richPerson = new Persona('Jane Smith', {
 *   age: 28,
 *   occupation: 'Product Manager',
 *   sex: 'female',
 *   salary: 95000,
 *   interests: ['tech', 'design']
 * });
 * ```
 */
export declare class Persona<T extends PersonaAttributes = PersonaAttributes> {
    /**
     * Unique identifier for the persona.
     * Generated automatically using timestamp and random string.
     */
    readonly id: string;
    /**
     * Name of the persona.
     * Used for display and identification purposes.
     */
    readonly name: string;
    /**
     * Attributes of the persona.
     * Contains both required fields (age, occupation, sex) and custom fields.
     * @private
     */
    private _attributes;
    constructor(name: string, attributes: T);
    /**
     * Create a persona from distributions.
     *
     * This static factory method allows creating personas where attribute values
     * are sampled from statistical distributions rather than being fixed.
     *
     * @param name - Name of the persona
     * @param distributions - Map of attribute names to distributions or static values
     * @returns A new Persona instance with sampled attributes
     *
     * @throws {Error} If required fields (age, occupation, sex) are missing
     *
     * @example
     * ```typescript
     * const persona = Persona.fromDistributions('Random User', {
     *   age: new NormalDistribution(35, 5),
     *   occupation: 'Developer',
     *   sex: new CategoricalDistribution([
     *     { value: 'male', probability: 0.5 },
     *     { value: 'female', probability: 0.5 }
     *   ]),
     *   income: new UniformDistribution(50000, 100000)
     * });
     * ```
     */
    static fromDistributions<T extends PersonaAttributes = PersonaAttributes>(name: string, distributions: DistributionMap): Persona<T>;
    /**
     * Generate multiple personas from distributions.
     *
     * Creates a batch of personas where each has attributes sampled independently
     * from the provided distributions.
     *
     * @param baseName - Base name for personas (will be suffixed with number)
     * @param count - Number of personas to generate
     * @param distributions - Map of distributions
     * @returns Array of Persona instances
     *
     * @example
     * ```typescript
     * const personas = Persona.generateMany('Employee', 100, {
     *   age: new NormalDistribution(30, 5),
     *   occupation: new CategoricalDistribution([
     *     { value: 'Engineer', probability: 0.4 },
     *     { value: 'Designer', probability: 0.3 },
     *     { value: 'Manager', probability: 0.3 }
     *   ]),
     *   sex: 'other',
     *   experience: new UniformDistribution(0, 10)
     * });
     * ```
     */
    static generateMany<T extends PersonaAttributes = PersonaAttributes>(baseName: string, count: number, distributions: DistributionMap): Persona<T>[];
    /**
     * Create a persona with only required fields and default values.
     *
     * Useful for quick testing or when only a minimal persona is needed.
     *
     * @param name - Name of the persona
     * @returns A new Persona with default attributes (age: 30, occupation: 'Unknown', sex: 'other')
     */
    static createDefault(name: string): Persona;
    /**
     * Check if a value is a Distribution.
     * @private
     * @param value - Value to check
     * @returns True if the value implements the Distribution interface
     */
    private static isDistribution;
    /**
     * Get a copy of persona attributes.
     *
     * Returns a shallow copy to prevent external modifications.
     *
     * @returns Copy of all persona attributes
     */
    get attributes(): T;
    /**
     * Get required base attributes.
     *
     * Extracts only the required fields (age, occupation, sex) from attributes.
     *
     * @returns Object containing only the base attributes
     */
    get baseAttributes(): BasePersonaAttributes;
    /**
     * Update persona attributes.
     *
     * Validates updates before applying them to ensure persona remains valid.
     *
     * @param updates - Partial object with attributes to update
     * @throws {Error} If the update would result in invalid attributes
     *
     * @example
     * ```typescript
     * persona.updateAttributes({
     *   age: 36,
     *   city: 'New York'
     * });
     * ```
     */
    updateAttributes(updates: Partial<T>): void;
    /**
     * Clone the persona with a new ID.
     *
     * Creates a deep copy of the persona with all attributes preserved
     * but a new unique identifier.
     *
     * @returns A new Persona instance with the same attributes
     */
    clone(): Persona<T>;
    /**
     * Convert to plain object.
     *
     * Serializes the persona to a simple JavaScript object.
     *
     * @returns Object representation of the persona
     */
    toObject(): {
        id: string;
        name: string;
        attributes: T;
    };
    /**
     * Convert to JSON string.
     *
     * Serializes the persona to a JSON string for storage or transmission.
     *
     * @returns JSON string representation of the persona
     */
    toJSON(): string;
    /**
     * Generate a unique ID.
     * @private
     * @returns A unique identifier string
     */
    private generateId;
    /**
     * Get a formatted summary of the persona.
     *
     * Provides a human-readable description including key attributes.
     *
     * @returns Formatted string summary
     *
     * @example
     * ```typescript
     * console.log(persona.getSummary());
     * // Output: "John Doe (35 year old male Software Engineer)"
     * ```
     */
    getSummary(): string;
}
//# sourceMappingURL=persona.d.ts.map