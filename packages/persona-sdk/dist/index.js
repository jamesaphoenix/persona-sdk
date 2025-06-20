/**
 * Minimal Persona SDK - Core Primitives Only
 *
 * A lightweight SDK for creating personas with AI-powered features:
 * - Persona creation and management
 * - Structured output generation
 * - Prompt optimization
 * - Statistical distributions
 */
// Core Classes
export { Persona } from './persona';
export { PersonaBuilder } from './persona-builder';
export { PersonaGroup } from './persona-group';
// AI Features
export { PersonaAI } from './ai/persona-ai';
// Distributions
export { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution } from './distributions';
// Export base distribution separately
export { BaseDistribution } from './distributions/base';
// Tools
export { StructuredOutputGenerator } from './tools/structured-output-generator';
export { DistributionSelector } from './tools/distribution-selector';
// Schemas for validation
export { BasePersonaAttributesSchema, PersonaAttributesSchema, SexSchema } from './types';
//# sourceMappingURL=index.js.map