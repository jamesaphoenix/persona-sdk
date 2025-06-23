/**
 * Minimal Persona SDK - Core Primitives Only
 *
 * A lightweight SDK for creating personas with AI-powered features:
 * - Persona creation and management
 * - Structured output generation
 * - Prompt optimization
 * - Statistical distributions
 */
export { Persona } from './persona.js';
export { PersonaBuilder } from './persona-builder.js';
export { PersonaGroup } from './persona-group.js';
export { PersonaAI } from './ai/persona-ai.js';
export { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution } from './distributions/index.js';
export { BaseDistribution } from './distributions/base.js';
export { StructuredOutputGenerator } from './tools/structured-output-generator.js';
export { DistributionSelector } from './tools/distribution-selector.js';
export type { PersonaAttributes, Sex, StructuredOutput, Distribution, BasePersonaAttributes } from './types/index.js';
export { BasePersonaAttributesSchema, PersonaAttributesSchema, SexSchema } from './types/index.js';
//# sourceMappingURL=index.d.ts.map