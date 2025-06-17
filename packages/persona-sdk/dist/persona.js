import { PersonaAttributesSchema } from './types';
import { z } from 'zod';
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
export class Persona {
    /**
     * Unique identifier for the persona.
     * Generated automatically using timestamp and random string.
     */
    id;
    /**
     * Name of the persona.
     * Used for display and identification purposes.
     */
    name;
    /**
     * Attributes of the persona.
     * Contains both required fields (age, occupation, sex) and custom fields.
     * @private
     */
    _attributes;
    constructor(name, attributes) {
        this.id = this.generateId();
        this.name = name;
        // Check for required fields with custom error messages
        if (!('age' in attributes) || attributes.age === undefined) {
            throw new Error('Age is required');
        }
        if (!('occupation' in attributes) || attributes.occupation === undefined) {
            throw new Error('Occupation is required');
        }
        if (!('sex' in attributes) || attributes.sex === undefined) {
            throw new Error('Sex is required');
        }
        // Validate sex field values
        const validSexValues = ['male', 'female', 'other'];
        if (!validSexValues.includes(attributes.sex)) {
            throw new Error('Sex is required and must be "male", "female", or "other"');
        }
        // Validate attributes using Zod
        try {
            // Round age to integer if it's a float
            const validationAttributes = { ...attributes };
            if (typeof validationAttributes.age === 'number') {
                validationAttributes.age = Math.round(validationAttributes.age);
            }
            PersonaAttributesSchema.parse(validationAttributes);
            // Store with rounded age
            this._attributes = { ...attributes, age: validationAttributes.age };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid persona attributes: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
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
     * // Mix distributions with literal values for flexibility
     * const persona = Persona.fromDistributions('Random User', {
     *   age: new NormalDistribution(35, 5),     // Distribution: sampled
     *   occupation: 'Developer',                // Literal: fixed value
     *   sex: new CategoricalDistribution([      // Distribution: sampled
     *     { value: 'male', probability: 0.5 },
     *     { value: 'female', probability: 0.5 }
     *   ]),
     *   income: new UniformDistribution(50000, 100000), // Distribution: sampled
     *   company: 'Tech Corp',                   // Literal: fixed value
     *   remote: true                            // Literal: fixed value
     * });
     * ```
     */
    static fromDistributions(name, distributions) {
        const attributes = {};
        // Ensure required fields are included
        const requiredFields = ['age', 'occupation', 'sex'];
        for (const field of requiredFields) {
            if (!(field in distributions)) {
                throw new Error(`Required field "${field}" missing from distributions`);
            }
        }
        for (const [key, spec] of Object.entries(distributions)) {
            if (this.isDistribution(spec)) {
                let value = spec.sample();
                // Round age to integer as required by the schema
                if (key === 'age' && typeof value === 'number') {
                    value = Math.round(value);
                }
                attributes[key] = value;
            }
            else {
                attributes[key] = spec;
            }
        }
        return new Persona(name, attributes);
    }
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
     * // Generate 100 personas with mixed distributions and literal values
     * const personas = Persona.generateMany('Employee', 100, {
     *   age: new NormalDistribution(30, 5),          // Distribution: varies
     *   occupation: new CategoricalDistribution([    // Distribution: varies
     *     { value: 'Engineer', probability: 0.4 },
     *     { value: 'Designer', probability: 0.3 },
     *     { value: 'Manager', probability: 0.3 }
     *   ]),
     *   sex: 'other',                                // Literal: all will have 'other'
     *   experience: new UniformDistribution(0, 10),  // Distribution: varies
     *   department: 'Technology',                    // Literal: all in same dept
     *   location: 'San Francisco'                    // Literal: all in same location
     * });
     * ```
     */
    static generateMany(baseName, count, distributions) {
        const personas = [];
        for (let i = 0; i < count; i++) {
            personas.push(this.fromDistributions(`${baseName} ${i + 1}`, distributions));
        }
        return personas;
    }
    /**
     * Create a persona with only required fields and default values.
     *
     * Useful for quick testing or when only a minimal persona is needed.
     *
     * @param name - Name of the persona
     * @returns A new Persona with default attributes (age: 30, occupation: 'Unknown', sex: 'other')
     */
    static createDefault(name) {
        return new Persona(name, {
            age: 30,
            occupation: 'Unknown',
            sex: 'other'
        });
    }
    /**
     * Check if a value is a Distribution.
     * @private
     * @param value - Value to check
     * @returns True if the value implements the Distribution interface
     */
    static isDistribution(value) {
        return value && typeof value.sample === 'function' && typeof value.mean === 'function';
    }
    /**
     * Get a copy of persona attributes.
     *
     * Returns a shallow copy to prevent external modifications.
     *
     * @returns Copy of all persona attributes
     */
    get attributes() {
        return { ...this._attributes };
    }
    /**
     * Get required base attributes.
     *
     * Extracts only the required fields (age, occupation, sex) from attributes.
     *
     * @returns Object containing only the base attributes
     */
    get baseAttributes() {
        return {
            age: this._attributes.age,
            occupation: this._attributes.occupation,
            sex: this._attributes.sex
        };
    }
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
    updateAttributes(updates) {
        const newAttributes = { ...this._attributes, ...updates };
        // Validate the complete new attributes using Zod
        try {
            PersonaAttributesSchema.parse(newAttributes);
            // If validation passes, update attributes
            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                    this._attributes[key] = value;
                }
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid attribute update: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    }
    /**
     * Clone the persona with a new ID.
     *
     * Creates a deep copy of the persona with all attributes preserved
     * but a new unique identifier.
     *
     * @returns A new Persona instance with the same attributes
     */
    clone() {
        return new Persona(this.name, this.attributes);
    }
    /**
     * Convert to plain object.
     *
     * Serializes the persona to a simple JavaScript object.
     *
     * @returns Object representation of the persona
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            attributes: this.attributes
        };
    }
    /**
     * Convert to JSON string.
     *
     * Serializes the persona to a JSON string for storage or transmission.
     *
     * @returns JSON string representation of the persona
     */
    toJSON() {
        return JSON.stringify(this.toObject());
    }
    /**
     * Generate a unique ID.
     * @private
     * @returns A unique identifier string
     */
    generateId() {
        return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
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
    getSummary() {
        const { age, occupation, sex } = this.baseAttributes;
        return `${this.name} (${age} year old ${sex} ${occupation})`;
    }
    /**
     * Generate structured output using AI from this persona's perspective.
     *
     * The persona will respond as themselves, considering their attributes
     * and background when generating the structured output.
     *
     * @template T - Type of the structured output
     * @param schema - Zod schema defining the output structure
     * @param prompt - Custom prompt for the persona
     * @param options - Configuration options
     * @param options.apiKey - OpenAI API key (optional)
     * @param options.modelName - Model to use (default: 'gpt-4.1-mini')
     * @param options.systemPrompt - Custom system prompt (optional)
     * @param options.temperature - Model temperature (default: 0.7)
     * @returns Promise resolving to structured output
     *
     * @example
     * ```typescript
     * const OpinionSchema = z.object({
     *   productRating: z.number().min(1).max(10),
     *   likes: z.array(z.string()),
     *   dislikes: z.array(z.string()),
     *   recommendation: z.boolean()
     * });
     *
     * const opinion = await persona.generateStructuredOutput(
     *   OpinionSchema,
     *   "What do you think about our new mobile app?"
     * );
     * ```
     */
    async generateStructuredOutput(schema, prompt, options = {}) {
        const { StructuredOutputGenerator } = await import('./tools/structured-output-generator');
        // Create persona-specific system prompt
        const defaultSystemPrompt = `You are ${this.name}, ${this.getSummary()}.

Your attributes:
${Object.entries(this.attributes).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`).join('\n')}

Respond to all prompts as this persona, considering your background, age, occupation, and other attributes.
Your responses should reflect your perspective and experiences.`;
        const generator = new StructuredOutputGenerator(options.apiKey, options.modelName, options.systemPrompt || defaultSystemPrompt, options.temperature);
        // Create a temporary PersonaGroup with just this persona
        const { PersonaGroup } = await import('./persona-group');
        const tempGroup = new PersonaGroup(`${this.name} Individual`, [this]);
        const result = await generator.generate(tempGroup, schema, prompt);
        return {
            ...result,
            metadata: {
                ...result.metadata,
                personaId: this.id,
                personaName: this.name
            }
        };
    }
}
//# sourceMappingURL=persona.js.map