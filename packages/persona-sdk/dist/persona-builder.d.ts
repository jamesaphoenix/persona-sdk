import { PersonaAttributes, AttributeValue, Distribution, SexSchema } from './types';
import { Persona } from './persona';
import { z } from 'zod';
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
export declare class PersonaBuilder {
    /**
     * Name for the persona being built.
     * @private
     */
    private name;
    /**
     * Static attributes for the persona.
     * @private
     */
    private attributes;
    /**
     * Distribution-based attributes for the persona.
     * @private
     */
    private distributions;
    /**
     * Set the persona's name.
     *
     * @param name - Name for the persona
     * @returns This builder instance for chaining
     */
    withName(name: string): PersonaBuilder;
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
    withAge(age: number | Distribution<number>): PersonaBuilder;
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
    withOccupation(occupation: string | Distribution<string>): PersonaBuilder;
    /**
     * Set the persona's sex.
     *
     * @param sex - One of 'male', 'female', 'other' or a distribution
     * @returns This builder instance for chaining
     */
    withSex(sex: z.infer<typeof SexSchema> | Distribution<z.infer<typeof SexSchema>>): PersonaBuilder;
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
    withAttribute(key: string, value: AttributeValue | Distribution): PersonaBuilder;
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
    withAttributes(attributes: Record<string, AttributeValue | Distribution>): PersonaBuilder;
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
    build(): Persona<PersonaAttributes>;
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
    buildMany(count: number, namePattern?: string): Persona<PersonaAttributes>[];
    /**
     * Check if a value is a Distribution.
     * @private
     * @param value - Value to check
     * @returns True if the value implements the Distribution interface
     */
    private isDistribution;
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
    static create(): PersonaBuilder;
}
//# sourceMappingURL=persona-builder.d.ts.map