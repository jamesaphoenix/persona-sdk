/**
 * Type-safe persona builder with full inference
 */

import { Persona } from '../persona';
import { PersonaId, createPersonaId } from '../types/branded';
import type { 
  BuilderAttributes, 
  BuilderState, 
  InferAttributes,
  InferPersona,
  AttributeValue,
  CorrelationConfig,
  ConditionalConfig
} from '../types/inference';
import type { Distribution } from '../types/distribution';
import { PersonaBuilder } from '../persona-builder';

/**
 * Type-safe persona builder with method chaining and inference
 */
export class TypedPersonaBuilder<T extends BuilderAttributes = {}> {
  private state: BuilderState<T>;
  
  constructor(name?: string) {
    this.state = {
      name,
      attributes: {} as T
    };
  }

  /**
   * Set the persona name
   */
  withName(name: string): TypedPersonaBuilder<T> {
    this.state.name = name;
    return this;
  }

  /**
   * Add a single attribute with type inference
   */
  withAttribute<K extends string, V>(
    key: K,
    value: V
  ): TypedPersonaBuilder<T & Record<K, V>> {
    const newState = {
      ...this.state,
      attributes: {
        ...this.state.attributes,
        [key]: value
      } as T & Record<K, V>
    };
    
    return new TypedPersonaBuilder<T & Record<K, V>>()
      .withName(this.state.name || '')
      .withAttributes(newState.attributes);
  }

  /**
   * Add multiple attributes at once
   */
  withAttributes<A extends BuilderAttributes>(
    attributes: A
  ): TypedPersonaBuilder<T & A> {
    const newAttributes = {
      ...this.state.attributes,
      ...attributes
    } as T & A;
    
    const builder = new TypedPersonaBuilder<T & A>();
    builder.state = {
      name: this.state.name,
      attributes: newAttributes
    };
    
    return builder;
  }

  /**
   * Add age attribute with proper typing
   */
  withAge(age: number | Distribution<number>): TypedPersonaBuilder<T & { age: number | Distribution<number> }> {
    return this.withAttribute('age', age);
  }

  /**
   * Add occupation attribute
   */
  withOccupation(occupation: string | Distribution<string>): TypedPersonaBuilder<T & { occupation: string | Distribution<string> }> {
    return this.withAttribute('occupation', occupation);
  }

  /**
   * Add sex attribute
   */
  withSex(sex: 'male' | 'female' | 'other' | Distribution<'male' | 'female' | 'other'>): TypedPersonaBuilder<T & { sex: 'male' | 'female' | 'other' | Distribution<'male' | 'female' | 'other'> }> {
    return this.withAttribute('sex', sex);
  }

  /**
   * Add income attribute
   */
  withIncome(income: number | Distribution<number>): TypedPersonaBuilder<T & { income: number | Distribution<number> }> {
    return this.withAttribute('income', income);
  }

  /**
   * Build the persona with inferred types
   */
  build(): Persona<InferAttributes<T>> {
    const name = this.state.name || 'Anonymous';
    const id = createPersonaId();
    
    // Sample from distributions
    const sampledAttributes = {} as InferAttributes<T>;
    
    for (const [key, value] of Object.entries(this.state.attributes)) {
      if (value && typeof value === 'object' && 'sample' in value) {
        (sampledAttributes as any)[key] = value.sample();
      } else {
        (sampledAttributes as any)[key] = value;
      }
    }
    
    return new Persona(name, sampledAttributes, id as string);
  }

  /**
   * Build with correlations
   */
  async buildWithCorrelations(config: {
    correlations?: CorrelationConfig[];
    conditionals?: ConditionalConfig[];
  }): Promise<Persona<InferAttributes<T>>> {
    const name = this.state.name || 'Anonymous';
    
    // Create a builder and apply correlations
    const builder = PersonaBuilder.create().withName(name);
    
    // Add all attributes
    for (const [key, value] of Object.entries(this.state.attributes)) {
      builder.withAttribute(key, value);
    }
    
    // Build with correlations
    const result = await builder.buildWithCorrelations({
      correlations: config.correlations,
      conditionals: config.conditionals
    });
    
    return new Persona(name, result.attributes as InferAttributes<T>);
  }

  /**
   * Build multiple personas
   */
  buildMany(count: number): Array<Persona<InferAttributes<T>>> {
    return Array.from({ length: count }, () => this.build());
  }

  /**
   * Get current state (for debugging)
   */
  getState(): BuilderState<T> {
    return { ...this.state };
  }

  /**
   * Static factory method
   */
  static create(name?: string): TypedPersonaBuilder<{}> {
    return new TypedPersonaBuilder(name);
  }
}

/**
 * Helper type to extract attribute type from builder
 */
export type ExtractAttributes<T> = T extends TypedPersonaBuilder<infer A> ? InferAttributes<A> : never;

/**
 * Helper type to extract persona type from builder
 */
export type ExtractPersona<T> = T extends TypedPersonaBuilder<infer A> ? Persona<InferAttributes<A>> : never;