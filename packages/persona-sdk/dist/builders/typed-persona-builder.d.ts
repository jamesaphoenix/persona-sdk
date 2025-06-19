/**
 * Type-safe persona builder with full inference
 */
import { Persona } from '../persona';
import type { BuilderAttributes, BuilderState, InferAttributes, CorrelationConfig, ConditionalConfig } from '../types/inference';
import type { Distribution } from '../types/distribution';
/**
 * Type-safe persona builder with method chaining and inference
 */
export declare class TypedPersonaBuilder<T extends BuilderAttributes = {}> {
    private state;
    constructor(name?: string);
    /**
     * Set the persona name
     */
    withName(name: string): TypedPersonaBuilder<T>;
    /**
     * Add a single attribute with type inference
     */
    withAttribute<K extends string, V>(key: K, value: V): TypedPersonaBuilder<T & Record<K, V>>;
    /**
     * Add multiple attributes at once
     */
    withAttributes<A extends BuilderAttributes>(attributes: A): TypedPersonaBuilder<T & A>;
    /**
     * Add age attribute with proper typing
     */
    withAge(age: number | Distribution<number>): TypedPersonaBuilder<T & {
        age: number | Distribution<number>;
    }>;
    /**
     * Add occupation attribute
     */
    withOccupation(occupation: string | Distribution<string>): TypedPersonaBuilder<T & {
        occupation: string | Distribution<string>;
    }>;
    /**
     * Add sex attribute
     */
    withSex(sex: 'male' | 'female' | 'other' | Distribution<'male' | 'female' | 'other'>): TypedPersonaBuilder<T & {
        sex: 'male' | 'female' | 'other' | Distribution<'male' | 'female' | 'other'>;
    }>;
    /**
     * Add income attribute
     */
    withIncome(income: number | Distribution<number>): TypedPersonaBuilder<T & {
        income: number | Distribution<number>;
    }>;
    /**
     * Build the persona with inferred types
     */
    build(): Persona<InferAttributes<T>>;
    /**
     * Build with correlations
     */
    buildWithCorrelations(config: {
        correlations?: CorrelationConfig[];
        conditionals?: ConditionalConfig[];
    }): Promise<Persona<InferAttributes<T>>>;
    /**
     * Build multiple personas
     */
    buildMany(count: number): Array<Persona<InferAttributes<T>>>;
    /**
     * Get current state (for debugging)
     */
    getState(): BuilderState<T>;
    /**
     * Static factory method
     */
    static create(name?: string): TypedPersonaBuilder<{}>;
}
/**
 * Helper type to extract attribute type from builder
 */
export type ExtractAttributes<T> = T extends TypedPersonaBuilder<infer A> ? InferAttributes<A> : never;
/**
 * Helper type to extract persona type from builder
 */
export type ExtractPersona<T> = T extends TypedPersonaBuilder<infer A> ? Persona<InferAttributes<A>> : never;
//# sourceMappingURL=typed-persona-builder.d.ts.map