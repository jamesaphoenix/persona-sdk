// @ts-nocheck
/**
 * Type-safe PersonaGroup with enhanced inference
 */

import { PersonaGroup } from '../persona-group';
import { Persona } from '../persona';
import { GroupId, createGroupId } from '../types/branded';
import type {
  DistributionMap,
  InferAttributes,
  GroupGenerationConfig,
  SegmentDefinition
} from '../types/inference';
import { PersonaBuilder } from '../persona-builder';

/**
 * Typed PersonaGroup with full type inference
 */
export class TypedPersonaGroup<T extends DistributionMap = DistributionMap> {
  private group: PersonaGroup;
  private id: GroupId;
  private generationConfig?: GroupGenerationConfig<T>;

  constructor(name: string, id?: GroupId) {
    this.group = new PersonaGroup(name);
    this.id = id || createGroupId();
  }

  /**
   * Generate personas with type inference
   */
  async generate(config: GroupGenerationConfig<T>): Promise<this> {
    this.generationConfig = config;
    
    if (config.segments) {
      // Generate segmented personas
      for (const segment of config.segments) {
        const count = Math.round(config.size * segment.weight);
        await this.generateSegment(segment, count, config);
      }
    } else if (config.attributes) {
      // Generate uniform personas
      await this.generateUniform(config.size, config.attributes, config);
    }
    
    return this;
  }

  /**
   * Generate a single segment
   */
  private async generateSegment(
    segment: SegmentDefinition<T>,
    count: number,
    config: GroupGenerationConfig<T>
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      const builder = PersonaBuilder.create()
        .withName(`${segment.name} ${i + 1}`);
      
      // Add all attributes, handling distributions
      for (const [key, value] of Object.entries(segment.attributes)) {
        // Check if value is a distribution (has a sample method)
        const sampledValue = (value && typeof value === 'object' && 'sample' in value) 
          ? value.sample() 
          : value;
        
        // Handle special builder methods for required attributes
        if (key === 'age') {
          const age = typeof sampledValue === 'number' ? Math.round(sampledValue) : sampledValue;
          builder.withAge(age);
        } else if (key === 'occupation' && typeof sampledValue === 'string') {
          builder.withOccupation(sampledValue);
        } else if (key === 'sex' && (sampledValue === 'male' || sampledValue === 'female' || sampledValue === 'other')) {
          builder.withSex(sampledValue);
        } else {
          builder.withAttribute(key, sampledValue);
        }
      }
      
      // Build with correlations if provided
      let persona: Persona;
      if (config.correlations || config.conditionals) {
        const result = await builder.buildWithCorrelations({
          correlations: config.correlations,
          conditionals: config.conditionals
        });
        persona = new Persona(
          `${segment.name} ${i + 1}`,
          result.attributes as InferAttributes<T>
        );
      } else {
        persona = builder.build();
      }
      
      this.group.add(persona);
    }
  }

  /**
   * Generate uniform personas
   */
  private async generateUniform(
    count: number,
    attributes: T,
    config: GroupGenerationConfig<T>
  ): Promise<void> {
    for (let i = 0; i < count; i++) {
      const builder = PersonaBuilder.create()
        .withName(`Persona ${i + 1}`);
      
      // Add all attributes, handling distributions
      for (const [key, value] of Object.entries(attributes)) {
        // Check if value is a distribution (has a sample method)
        const sampledValue = (value && typeof value === 'object' && 'sample' in value) 
          ? value.sample() 
          : value;
        
        // Handle special builder methods for required attributes
        if (key === 'age') {
          const age = typeof sampledValue === 'number' ? Math.round(sampledValue) : sampledValue;
          builder.withAge(age);
        } else if (key === 'occupation' && typeof sampledValue === 'string') {
          builder.withOccupation(sampledValue);
        } else if (key === 'sex' && (sampledValue === 'male' || sampledValue === 'female' || sampledValue === 'other')) {
          builder.withSex(sampledValue);
        } else {
          builder.withAttribute(key, sampledValue);
        }
      }
      
      // Build with correlations if provided
      let persona: Persona;
      if (config.correlations || config.conditionals) {
        const result = await builder.buildWithCorrelations({
          correlations: config.correlations,
          conditionals: config.conditionals
        });
        persona = new Persona(
          `Persona ${i + 1}`,
          result.attributes as InferAttributes<T>
        );
      } else {
        persona = builder.build();
      }
      
      this.group.add(persona);
    }
  }

  /**
   * Get all personas with typed attributes
   */
  getPersonas(): Array<Persona<InferAttributes<T>>> {
    return this.group.personas as Array<Persona<InferAttributes<T>>>;
  }

  /**
   * Filter personas with type safety
   */
  filter(
    predicate: (persona: Persona<InferAttributes<T>>) => boolean
  ): Array<Persona<InferAttributes<T>>> {
    return this.group.filter(predicate as any) as Array<Persona<InferAttributes<T>>>;
  }

  /**
   * Map personas with type inference
   */
  map<R>(
    mapper: (persona: Persona<InferAttributes<T>>) => R
  ): R[] {
    return this.group.personas.map(mapper as any);
  }

  /**
   * Reduce personas with type safety
   */
  reduce<R>(
    reducer: (acc: R, persona: Persona<InferAttributes<T>>) => R,
    initial: R
  ): R {
    return this.group.personas.reduce(reducer as any, initial);
  }

  /**
   * Get statistics for a numeric attribute
   */
  getStatistics(attribute: keyof InferAttributes<T>): {
    mean: number;
    median: number;
    mode: number | null;
    stdDev: number;
    min: number;
    max: number;
  } | null {
    return this.group.getStatistics(attribute as string);
  }

  /**
   * Get attribute distribution
   */
  getAttributeDistribution<K extends keyof InferAttributes<T>>(
    attribute: K
  ): Map<InferAttributes<T>[K], number> {
    const distribution = new Map<InferAttributes<T>[K], number>();
    
    for (const persona of this.getPersonas()) {
      const value = persona.attributes[attribute];
      const count = distribution.get(value) || 0;
      distribution.set(value, count + 1);
    }
    
    return distribution;
  }

  /**
   * Get size
   */
  get size(): number {
    return this.group.size;
  }

  /**
   * Get group ID
   */
  getId(): GroupId {
    return this.id;
  }

  /**
   * Get name
   */
  getName(): string {
    return this.group.name;
  }

  /**
   * Create query key for caching (TanStack style)
   */
  createQueryKey(...args: unknown[]): readonly unknown[] {
    return ['personaGroup', this.id, ...args] as const;
  }

  /**
   * Export to JSON with type preservation
   */
  toJSON(): {
    id: GroupId;
    name: string;
    personas: Array<{
      id: string;
      name: string;
      attributes: InferAttributes<T>;
    }>;
    config?: GroupGenerationConfig<T>;
  } {
    return {
      id: this.id,
      name: this.group.name,
      personas: this.getPersonas().map(p => ({
        id: p.id,
        name: p.name,
        attributes: p.attributes
      })),
      config: this.generationConfig
    };
  }

  /**
   * Static factory with type inference
   */
  static async create<T extends DistributionMap>(
    name: string,
    config: GroupGenerationConfig<T>
  ): Promise<TypedPersonaGroup<T>> {
    const group = new TypedPersonaGroup<T>(name);
    await group.generate(config);
    return group;
  }
}

/**
 * Helper type to extract attributes from typed group
 */
export type ExtractGroupAttributes<T> = T extends TypedPersonaGroup<infer A> 
  ? InferAttributes<A> 
  : never;

/**
 * Helper type to extract personas from typed group
 */
export type ExtractGroupPersonas<T> = T extends TypedPersonaGroup<infer A>
  ? Array<Persona<InferAttributes<A>>>
  : never;