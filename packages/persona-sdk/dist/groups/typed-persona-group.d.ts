/**
 * Type-safe PersonaGroup with enhanced inference
 */
import { Persona } from '../persona';
import { GroupId } from '../types/branded';
import type { DistributionMap, InferAttributes, GroupGenerationConfig } from '../types/inference';
/**
 * Typed PersonaGroup with full type inference
 */
export declare class TypedPersonaGroup<T extends DistributionMap = DistributionMap> {
    private group;
    private id;
    private generationConfig?;
    constructor(name: string, id?: GroupId);
    /**
     * Generate personas with type inference
     */
    generate(config: GroupGenerationConfig<T>): Promise<this>;
    /**
     * Generate a single segment
     */
    private generateSegment;
    /**
     * Generate uniform personas
     */
    private generateUniform;
    /**
     * Get all personas with typed attributes
     */
    getPersonas(): Array<Persona<InferAttributes<T>>>;
    /**
     * Filter personas with type safety
     */
    filter(predicate: (persona: Persona<InferAttributes<T>>) => boolean): Array<Persona<InferAttributes<T>>>;
    /**
     * Map personas with type inference
     */
    map<R>(mapper: (persona: Persona<InferAttributes<T>>) => R): R[];
    /**
     * Reduce personas with type safety
     */
    reduce<R>(reducer: (acc: R, persona: Persona<InferAttributes<T>>) => R, initial: R): R;
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
    } | null;
    /**
     * Get attribute distribution
     */
    getAttributeDistribution<K extends keyof InferAttributes<T>>(attribute: K): Map<InferAttributes<T>[K], number>;
    /**
     * Get size
     */
    get size(): number;
    /**
     * Get group ID
     */
    getId(): GroupId;
    /**
     * Get name
     */
    getName(): string;
    /**
     * Create query key for caching (TanStack style)
     */
    createQueryKey(...args: unknown[]): readonly unknown[];
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
    };
    /**
     * Static factory with type inference
     */
    static create<T extends DistributionMap>(name: string, config: GroupGenerationConfig<T>): Promise<TypedPersonaGroup<T>>;
}
/**
 * Helper type to extract attributes from typed group
 */
export type ExtractGroupAttributes<T> = T extends TypedPersonaGroup<infer A> ? InferAttributes<A> : never;
/**
 * Helper type to extract personas from typed group
 */
export type ExtractGroupPersonas<T> = T extends TypedPersonaGroup<infer A> ? Array<Persona<InferAttributes<A>>> : never;
//# sourceMappingURL=typed-persona-group.d.ts.map