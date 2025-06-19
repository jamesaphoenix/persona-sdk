// @ts-nocheck
/**
 * Type-safe PersonaGroup with enhanced inference
 */
import { PersonaGroup } from '../persona-group';
import { Persona } from '../persona';
import { createGroupId } from '../types/branded';
import { PersonaBuilder } from '../persona-builder';
/**
 * Typed PersonaGroup with full type inference
 */
export class TypedPersonaGroup {
    group;
    id;
    generationConfig;
    constructor(name, id) {
        this.group = new PersonaGroup(name);
        this.id = id || createGroupId();
    }
    /**
     * Generate personas with type inference
     */
    async generate(config) {
        this.generationConfig = config;
        if (config.segments) {
            // Generate segmented personas
            for (const segment of config.segments) {
                const count = Math.round(config.size * segment.weight);
                await this.generateSegment(segment, count, config);
            }
        }
        else if (config.attributes) {
            // Generate uniform personas
            await this.generateUniform(config.size, config.attributes, config);
        }
        return this;
    }
    /**
     * Generate a single segment
     */
    async generateSegment(segment, count, config) {
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
                }
                else if (key === 'occupation' && typeof sampledValue === 'string') {
                    builder.withOccupation(sampledValue);
                }
                else if (key === 'sex' && (sampledValue === 'male' || sampledValue === 'female' || sampledValue === 'other')) {
                    builder.withSex(sampledValue);
                }
                else {
                    builder.withAttribute(key, sampledValue);
                }
            }
            // Build with correlations if provided
            let persona;
            if (config.correlations || config.conditionals) {
                const result = await builder.buildWithCorrelations({
                    correlations: config.correlations,
                    conditionals: config.conditionals
                });
                persona = new Persona(`${segment.name} ${i + 1}`, result.attributes);
            }
            else {
                persona = builder.build();
            }
            this.group.add(persona);
        }
    }
    /**
     * Generate uniform personas
     */
    async generateUniform(count, attributes, config) {
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
                }
                else if (key === 'occupation' && typeof sampledValue === 'string') {
                    builder.withOccupation(sampledValue);
                }
                else if (key === 'sex' && (sampledValue === 'male' || sampledValue === 'female' || sampledValue === 'other')) {
                    builder.withSex(sampledValue);
                }
                else {
                    builder.withAttribute(key, sampledValue);
                }
            }
            // Build with correlations if provided
            let persona;
            if (config.correlations || config.conditionals) {
                const result = await builder.buildWithCorrelations({
                    correlations: config.correlations,
                    conditionals: config.conditionals
                });
                persona = new Persona(`Persona ${i + 1}`, result.attributes);
            }
            else {
                persona = builder.build();
            }
            this.group.add(persona);
        }
    }
    /**
     * Get all personas with typed attributes
     */
    getPersonas() {
        return this.group.personas;
    }
    /**
     * Filter personas with type safety
     */
    filter(predicate) {
        return this.group.filter(predicate);
    }
    /**
     * Map personas with type inference
     */
    map(mapper) {
        return this.group.personas.map(mapper);
    }
    /**
     * Reduce personas with type safety
     */
    reduce(reducer, initial) {
        return this.group.personas.reduce(reducer, initial);
    }
    /**
     * Get statistics for a numeric attribute
     */
    getStatistics(attribute) {
        return this.group.getStatistics(attribute);
    }
    /**
     * Get attribute distribution
     */
    getAttributeDistribution(attribute) {
        const distribution = new Map();
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
    get size() {
        return this.group.size;
    }
    /**
     * Get group ID
     */
    getId() {
        return this.id;
    }
    /**
     * Get name
     */
    getName() {
        return this.group.name;
    }
    /**
     * Create query key for caching (TanStack style)
     */
    createQueryKey(...args) {
        return ['personaGroup', this.id, ...args];
    }
    /**
     * Export to JSON with type preservation
     */
    toJSON() {
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
    static async create(name, config) {
        const group = new TypedPersonaGroup(name);
        await group.generate(config);
        return group;
    }
}
//# sourceMappingURL=typed-persona-group.js.map