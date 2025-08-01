import { Persona } from './persona.js';
import { CorrelatedDistribution } from './distributions/correlated-distribution.js';
import { PersonaAI } from './ai/persona-ai.js';
/**
 * Builder class for creating personas with a fluent API.
 *
 * PersonaBuilder provides a convenient way to construct personas with
 * both static values and statistical distributions. It supports method
 * chaining for a clean, readable syntax.
 *
 * @example
 * ```typescript
 * // Build a single persona
 * const persona = PersonaBuilder.create()
 *   .withName('Alice Johnson')
 *   .withAge(new NormalDistribution(30, 5))
 *   .withOccupation('Software Engineer')
 *   .withSex('female')
 *   .withAttribute('salary', new UniformDistribution(70000, 120000))
 *   .withAttribute('yearsExperience', 5)
 *   .build();
 *
 * // Build multiple personas
 * const team = PersonaBuilder.create()
 *   .withAge(new UniformDistribution(25, 40))
 *   .withOccupation(new CategoricalDistribution([
 *     { value: 'Developer', probability: 0.6 },
 *     { value: 'Designer', probability: 0.4 }
 *   ]))
 *   .withSex('other')
 *   .buildMany(10, 'Team Member');
 * ```
 */
export class PersonaBuilder {
    /**
     * Name for the persona being built.
     * @private
     */
    name = '';
    /**
     * Static attributes for the persona.
     * @private
     */
    attributes = {};
    /**
     * Distribution-based attributes for the persona.
     * @private
     */
    distributions = {};
    /**
     * Set the persona's name.
     *
     * @param name - Name for the persona
     * @returns This builder instance for chaining
     */
    withName(name) {
        this.name = name;
        return this;
    }
    /**
     * Set the persona's age.
     *
     * @param age - Static age value or distribution
     * @returns This builder instance for chaining
     *
     * @example
     * ```typescript
     * // Static value
     * builder.withAge(35);
     *
     * // Distribution
     * builder.withAge(new NormalDistribution(30, 5));
     * ```
     */
    withAge(age) {
        if (this.isDistribution(age)) {
            this.distributions.age = age;
        }
        else {
            this.attributes.age = age;
        }
        return this;
    }
    /**
     * Set the persona's occupation.
     *
     * @param occupation - Static occupation string or distribution
     * @returns This builder instance for chaining
     *
     * @example
     * ```typescript
     * // Static value
     * builder.withOccupation('Engineer');
     *
     * // Distribution
     * builder.withOccupation(new CategoricalDistribution([
     *   { value: 'Developer', probability: 0.7 },
     *   { value: 'Manager', probability: 0.3 }
     * ]));
     * ```
     */
    withOccupation(occupation) {
        if (this.isDistribution(occupation)) {
            this.distributions.occupation = occupation;
        }
        else {
            this.attributes.occupation = occupation;
        }
        return this;
    }
    /**
     * Set the persona's sex.
     *
     * @param sex - One of 'male', 'female', 'other' or a distribution
     * @returns This builder instance for chaining
     */
    withSex(sex) {
        if (this.isDistribution(sex)) {
            this.distributions.sex = sex;
        }
        else {
            this.attributes.sex = sex;
        }
        return this;
    }
    /**
     * Add a custom attribute.
     *
     * @param key - Name of the attribute
     * @param value - Static value or distribution
     * @returns This builder instance for chaining
     *
     * @example
     * ```typescript
     * builder
     *   .withAttribute('income', 75000)
     *   .withAttribute('score', new UniformDistribution(0, 100))
     *   .withAttribute('skills', ['JavaScript', 'Python']);
     * ```
     */
    withAttribute(key, value) {
        if (this.isDistribution(value)) {
            this.distributions[key] = value;
        }
        else {
            this.attributes[key] = value;
        }
        return this;
    }
    /**
     * Add multiple custom attributes at once.
     *
     * @param attributes - Object with attribute names and values
     * @returns This builder instance for chaining
     *
     * @example
     * ```typescript
     * builder.withAttributes({
     *   department: 'Engineering',
     *   level: 'Senior',
     *   remote: true,
     *   satisfaction: new UniformDistribution(3, 5)
     * });
     * ```
     */
    withAttributes(attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (this.isDistribution(value)) {
                this.distributions[key] = value;
            }
            else {
                this.attributes[key] = value;
            }
        }
        return this;
    }
    /**
     * Build the persona.
     *
     * Creates a new Persona instance from the configured attributes.
     * If distributions are present, they will be sampled to generate values.
     *
     * @returns A new Persona instance
     * @throws {Error} If name is not set
     * @throws {Error} If required attributes (age, occupation, sex) are missing
     */
    build() {
        if (!this.name) {
            throw new Error('Persona name is required');
        }
        // If we have distributions, use fromDistributions
        if (Object.keys(this.distributions).length > 0) {
            // Merge static attributes with distributions
            const allSpecs = {};
            // Add static attributes
            for (const [key, value] of Object.entries(this.attributes)) {
                allSpecs[key] = value;
            }
            // Add distributions
            for (const [key, value] of Object.entries(this.distributions)) {
                allSpecs[key] = value;
            }
            return Persona.fromDistributions(this.name, allSpecs);
        }
        // Otherwise, create directly
        if (!this.attributes.age || !this.attributes.occupation || !this.attributes.sex) {
            throw new Error('Required attributes (age, occupation, sex) must be provided');
        }
        return new Persona(this.name, this.attributes);
    }
    /**
     * Build multiple personas.
     *
     * Creates multiple personas with the same configuration.
     * Each persona will have independently sampled values from distributions.
     *
     * @param count - Number of personas to create
     * @param namePattern - Base name for personas (defaults to configured name or 'Persona')
     * @returns Array of new Persona instances
     *
     * @example
     * ```typescript
     * const employees = builder
     *   .withAge(new UniformDistribution(22, 65))
     *   .withOccupation('Employee')
     *   .withSex('other')
     *   .buildMany(100, 'Employee');
     * // Creates: Employee 1, Employee 2, ..., Employee 100
     * ```
     */
    buildMany(count, namePattern) {
        const personas = [];
        const baseName = namePattern || this.name || 'Persona';
        for (let i = 0; i < count; i++) {
            const builder = new PersonaBuilder();
            // Copy all settings
            builder.name = `${baseName} ${i + 1}`;
            builder.attributes = { ...this.attributes };
            builder.distributions = { ...this.distributions };
            personas.push(builder.build());
        }
        return personas;
    }
    /**
     * Check if a value is a Distribution.
     * @private
     * @param value - Value to check
     * @returns True if the value implements the Distribution interface
     */
    isDistribution(value) {
        return value && typeof value.sample === 'function' && typeof value.mean === 'function';
    }
    /**
     * Build a persona with correlated attributes.
     *
     * This method ensures realistic relationships between attributes using
     * correlations and conditional distributions.
     *
     * @param config - Configuration for correlations and conditional dependencies
     * @returns A new Persona instance with correlated attributes
     *
     * @example
     * ```typescript
     * const persona = PersonaBuilder.create()
     *   .withName('Professional')
     *   .withAge(new NormalDistribution(35, 10))
     *   .withAttribute('yearsExperience', new NormalDistribution(10, 5))
     *   .withAttribute('income', new NormalDistribution(60000, 20000))
     *   .withOccupation('Developer')
     *   .withSex('other')
     *   .buildWithCorrelations({
     *     correlations: [
     *       { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
     *       { attribute1: 'age', attribute2: 'yearsExperience', correlation: 0.8 }
     *     ],
     *     conditionals: [
     *       {
     *         attribute: 'yearsExperience',
     *         dependsOn: 'age',
     *         transform: (exp, age) => Math.min(exp, Math.max(0, age - 22))
     *       }
     *     ]
     *   });
     * ```
     */
    buildWithCorrelations(config) {
        if (!this.name) {
            throw new Error('Persona name is required');
        }
        // Merge all attributes and distributions
        const allSpecs = {};
        // Add static attributes
        for (const [key, value] of Object.entries(this.attributes)) {
            allSpecs[key] = value;
        }
        // Add distributions
        for (const [key, value] of Object.entries(this.distributions)) {
            allSpecs[key] = value;
        }
        // Create correlated distribution
        const correlated = new CorrelatedDistribution(allSpecs);
        // Add correlations if provided
        if (config?.correlations) {
            config.correlations.forEach(corr => {
                correlated.addCorrelation(corr);
            });
        }
        // Add conditionals if provided
        if (config?.conditionals) {
            // Group conditionals by attribute
            const conditionalsByAttr = new Map();
            config.conditionals.forEach(cond => {
                if (!conditionalsByAttr.has(cond.attribute)) {
                    conditionalsByAttr.set(cond.attribute, []);
                }
                conditionalsByAttr.get(cond.attribute).push({
                    dependsOn: cond.dependsOn,
                    transform: cond.transform
                });
            });
            // Add each attribute's conditionals
            conditionalsByAttr.forEach((conditions, attribute) => {
                const dist = allSpecs[attribute];
                if (dist && typeof dist === 'object' && 'sample' in dist) {
                    correlated.addConditional({
                        attribute,
                        baseDistribution: dist,
                        conditions
                    });
                }
            });
        }
        const generatedAttributes = correlated.generate();
        // Ensure required attributes are present
        if (!generatedAttributes.age || !generatedAttributes.occupation || !generatedAttributes.sex) {
            throw new Error('Required attributes (age, occupation, sex) must be provided');
        }
        return new Persona(this.name, generatedAttributes);
    }
    /**
     * Create a new builder instance.
     *
     * Static factory method for creating builders.
     *
     * @returns A new PersonaBuilder instance
     *
     * @example
     * ```typescript
     * const persona = PersonaBuilder.create()
     *   .withName('Alice')
     *   .withAge(25)
     *   .withOccupation('Designer')
     *   .withSex('female')
     *   .build();
     * ```
     */
    static create() {
        return new PersonaBuilder();
    }
    /**
     * Create a persona from a text prompt using AI.
     *
     * @param prompt - Natural language description of the persona
     * @param options - AI configuration options
     * @returns Promise resolving to a new Persona instance
     *
     * @example
     * ```typescript
     * const persona = await PersonaBuilder.fromPrompt(
     *   'Create a 28-year-old tech professional in SF who loves gaming',
     *   { apiKey: process.env.OPENAI_API_KEY }
     * );
     * ```
     */
    static async fromPrompt(prompt, options) {
        return PersonaAI.fromPrompt(prompt, options);
    }
    /**
     * Generate multiple diverse personas from a prompt.
     *
     * @param prompt - Natural language description of the personas
     * @param count - Number of personas to generate
     * @param options - AI configuration options
     * @returns Promise resolving to an array of Persona instances
     *
     * @example
     * ```typescript
     * const team = await PersonaBuilder.generateMultiple(
     *   'Create diverse startup team members',
     *   5,
     *   { apiKey: process.env.OPENAI_API_KEY }
     * );
     * ```
     */
    static async generateMultiple(prompt, count, options) {
        return PersonaAI.generateMultiple(prompt, count, options);
    }
    /**
     * Optimize a prompt for better persona generation.
     *
     * @param basePrompt - Initial prompt to optimize
     * @param options - AI configuration options
     * @returns Promise resolving to an optimized prompt string
     *
     * @example
     * ```typescript
     * const optimized = await PersonaBuilder.optimizePrompt(
     *   'young developer',
     *   { apiKey: process.env.OPENAI_API_KEY }
     * );
     * // Returns: "Create a young developer aged 22-30, living in a tech hub..."
     * ```
     */
    static async optimizePrompt(basePrompt, options) {
        return PersonaAI.optimizePrompt(basePrompt, options);
    }
    /**
     * Suggest relevant attributes based on context.
     *
     * @param context - Context object describing the use case
     * @param options - AI configuration options
     * @returns Promise resolving to an array of suggested attribute names
     *
     * @example
     * ```typescript
     * const attributes = await PersonaBuilder.suggestAttributes(
     *   { industry: 'gaming', targetAudience: 'competitive' },
     *   { apiKey: process.env.OPENAI_API_KEY }
     * );
     * // Returns: ['skill_level', 'gaming_hours', 'preferred_genres', ...]
     * ```
     */
    static async suggestAttributes(context, options) {
        return PersonaAI.suggestAttributes(context, options);
    }
}
//# sourceMappingURL=persona-builder.js.map