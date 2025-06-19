// @ts-nocheck
/**
 * Type-safe persona builder with full inference
 */
import { Persona } from '../persona';
import { createPersonaId } from '../types/branded';
import { PersonaBuilder } from '../persona-builder';
/**
 * Type-safe persona builder with method chaining and inference
 */
export class TypedPersonaBuilder {
    state;
    constructor(name) {
        this.state = {
            name,
            attributes: {}
        };
    }
    /**
     * Set the persona name
     */
    withName(name) {
        this.state.name = name;
        return this;
    }
    /**
     * Add a single attribute with type inference
     */
    withAttribute(key, value) {
        const newState = {
            ...this.state,
            attributes: {
                ...this.state.attributes,
                [key]: value
            }
        };
        return new TypedPersonaBuilder()
            .withName(this.state.name || '')
            .withAttributes(newState.attributes);
    }
    /**
     * Add multiple attributes at once
     */
    withAttributes(attributes) {
        const newAttributes = {
            ...this.state.attributes,
            ...attributes
        };
        const builder = new TypedPersonaBuilder();
        builder.state = {
            name: this.state.name,
            attributes: newAttributes
        };
        return builder;
    }
    /**
     * Add age attribute with proper typing
     */
    withAge(age) {
        return this.withAttribute('age', age);
    }
    /**
     * Add occupation attribute
     */
    withOccupation(occupation) {
        return this.withAttribute('occupation', occupation);
    }
    /**
     * Add sex attribute
     */
    withSex(sex) {
        return this.withAttribute('sex', sex);
    }
    /**
     * Add income attribute
     */
    withIncome(income) {
        return this.withAttribute('income', income);
    }
    /**
     * Build the persona with inferred types
     */
    build() {
        const name = this.state.name || 'Anonymous';
        const id = createPersonaId();
        // Sample from distributions
        const sampledAttributes = {};
        for (const [key, value] of Object.entries(this.state.attributes)) {
            if (value && typeof value === 'object' && 'sample' in value && typeof value.sample === 'function') {
                sampledAttributes[key] = value.sample();
            }
            else {
                sampledAttributes[key] = value;
            }
        }
        // Add the id to attributes
        const attributesWithId = { ...sampledAttributes, id: id };
        return new Persona(name, attributesWithId);
    }
    /**
     * Build with correlations
     */
    async buildWithCorrelations(config) {
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
        return new Persona(name, result.attributes);
    }
    /**
     * Build multiple personas
     */
    buildMany(count) {
        return Array.from({ length: count }, () => this.build());
    }
    /**
     * Get current state (for debugging)
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Static factory method
     */
    static create(name) {
        return new TypedPersonaBuilder(name);
    }
}
//# sourceMappingURL=typed-persona-builder.js.map