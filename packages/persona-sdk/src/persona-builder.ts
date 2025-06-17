import { 
  PersonaAttributes, 
  AttributeValue,
  DistributionMap,
  Distribution,
  SexSchema
} from './types';
import { Persona } from './persona';
import { z } from 'zod';
import { CorrelatedDistribution } from './distributions/correlated-distribution';

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
  private name: string = '';
  
  /**
   * Static attributes for the persona.
   * @private
   */
  private attributes: Record<string, AttributeValue> = {};
  
  /**
   * Distribution-based attributes for the persona.
   * @private
   */
  private distributions: DistributionMap = {};

  /**
   * Set the persona's name.
   * 
   * @param name - Name for the persona
   * @returns This builder instance for chaining
   */
  withName(name: string): PersonaBuilder {
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
  withAge(age: number | Distribution<number>): PersonaBuilder {
    if (this.isDistribution(age)) {
      this.distributions.age = age;
    } else {
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
  withOccupation(occupation: string | Distribution<string>): PersonaBuilder {
    if (this.isDistribution(occupation)) {
      this.distributions.occupation = occupation;
    } else {
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
  withSex(sex: z.infer<typeof SexSchema> | Distribution<z.infer<typeof SexSchema>>): PersonaBuilder {
    if (this.isDistribution(sex)) {
      this.distributions.sex = sex;
    } else {
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
  withAttribute(key: string, value: AttributeValue | Distribution): PersonaBuilder {
    if (this.isDistribution(value)) {
      this.distributions[key] = value;
    } else {
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
  withAttributes(attributes: Record<string, AttributeValue | Distribution>): PersonaBuilder {
    for (const [key, value] of Object.entries(attributes)) {
      if (this.isDistribution(value)) {
        this.distributions[key] = value;
      } else {
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
  build(): Persona<PersonaAttributes> {
    if (!this.name) {
      throw new Error('Persona name is required');
    }

    // If we have distributions, use fromDistributions
    if (Object.keys(this.distributions).length > 0) {
      // Merge static attributes with distributions
      const allSpecs: DistributionMap = {};
      
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

    return new Persona(this.name, this.attributes as PersonaAttributes);
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
  buildMany(count: number, namePattern?: string): Persona<PersonaAttributes>[] {
    const personas: Persona<PersonaAttributes>[] = [];
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
  private isDistribution(value: any): value is Distribution {
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
  buildWithCorrelations(config?: {
    correlations?: Array<{
      attribute1: string;
      attribute2: string;
      correlation: number;
    }>;
    conditionals?: Array<{
      attribute: string;
      dependsOn: string;
      transform: (value: number, dependentValue: any) => number;
    }>;
  }): Persona<PersonaAttributes> {
    if (!this.name) {
      throw new Error('Persona name is required');
    }

    // Merge all attributes and distributions
    const allSpecs: DistributionMap = {};
    
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
      config.conditionals.forEach(cond => {
        const dist = allSpecs[cond.attribute];
        if (dist && typeof dist === 'object' && 'sample' in dist) {
          correlated.addConditional({
            attribute: cond.attribute,
            baseDistribution: dist,
            conditions: [{
              dependsOn: cond.dependsOn,
              transform: cond.transform
            }]
          });
        }
      });
    }
    
    const generatedAttributes = correlated.generate();
    
    // Ensure required attributes are present
    if (!generatedAttributes.age || !generatedAttributes.occupation || !generatedAttributes.sex) {
      throw new Error('Required attributes (age, occupation, sex) must be provided');
    }
    
    return new Persona(this.name, generatedAttributes as PersonaAttributes);
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
  static create(): PersonaBuilder {
    return new PersonaBuilder();
  }
}