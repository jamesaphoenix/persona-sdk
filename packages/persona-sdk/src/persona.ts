import { 
  BasePersonaAttributes, 
  PersonaAttributes, 
  DistributionMap, 
  Distribution, 
  AttributeValue,
  PersonaAttributesSchema
} from './types';
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
export class Persona<T extends PersonaAttributes = PersonaAttributes> {
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
  private _attributes: T;

  constructor(name: string, attributes: T) {
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
    if (!validSexValues.includes(attributes.sex as string)) {
      throw new Error('Sex is required and must be "male", "female", or "other"');
    }
    
    // Validate attributes using Zod
    try {
      PersonaAttributesSchema.parse(attributes);
      this._attributes = attributes; // Keep the original typed attributes
    } catch (error) {
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
  static fromDistributions<T extends PersonaAttributes = PersonaAttributes>(
    name: string, 
    distributions: DistributionMap
  ): Persona<T> {
    const attributes: Record<string, AttributeValue> = {};
    
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
      } else {
        attributes[key] = spec;
      }
    }
    
    return new Persona(name, attributes as T);
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
  static generateMany<T extends PersonaAttributes = PersonaAttributes>(
    baseName: string, 
    count: number, 
    distributions: DistributionMap
  ): Persona<T>[] {
    const personas: Persona<T>[] = [];
    for (let i = 0; i < count; i++) {
      personas.push(this.fromDistributions<T>(`${baseName} ${i + 1}`, distributions));
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
  static createDefault(name: string): Persona {
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
  private static isDistribution(value: any): value is Distribution {
    return value && typeof value.sample === 'function' && typeof value.mean === 'function';
  }

  /**
   * Get a copy of persona attributes.
   * 
   * Returns a shallow copy to prevent external modifications.
   * 
   * @returns Copy of all persona attributes
   */
  get attributes(): T {
    return { ...this._attributes };
  }

  /**
   * Get required base attributes.
   * 
   * Extracts only the required fields (age, occupation, sex) from attributes.
   * 
   * @returns Object containing only the base attributes
   */
  get baseAttributes(): BasePersonaAttributes {
    return {
      age: this._attributes.age,
      occupation: this._attributes.occupation,
      sex: this._attributes.sex as 'male' | 'female' | 'other'
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
  updateAttributes(updates: Partial<T>): void {
    const newAttributes = { ...this._attributes, ...updates };
    
    // Validate the complete new attributes using Zod
    try {
      PersonaAttributesSchema.parse(newAttributes);
      
      // If validation passes, update attributes
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          (this._attributes as any)[key] = value;
        }
      });
    } catch (error) {
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
  clone(): Persona<T> {
    return new Persona(this.name, this.attributes);
  }

  /**
   * Convert to plain object.
   * 
   * Serializes the persona to a simple JavaScript object.
   * 
   * @returns Object representation of the persona
   */
  toObject(): { id: string; name: string; attributes: T } {
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
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Generate a unique ID.
   * @private
   * @returns A unique identifier string
   */
  private generateId(): string {
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
  getSummary(): string {
    const { age, occupation, sex } = this.baseAttributes;
    return `${this.name} (${age} year old ${sex} ${occupation})`;
  }
}