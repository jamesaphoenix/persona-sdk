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
export { Persona } from './persona.js';
export { PersonaBuilder } from './persona-builder.js';
export { PersonaGroup } from './persona-group.js';

// AI Features
export { PersonaAI } from './ai/persona-ai.js';

// Distributions
export {
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution
} from './distributions/index.js';

// Export base distribution separately
export { BaseDistribution } from './distributions/base.js';

// Tools
export { StructuredOutputGenerator } from './tools/structured-output-generator.js';
export { DistributionSelector } from './tools/distribution-selector.js';

// Core Types
export type {
  PersonaAttributes,
  Sex,
  StructuredOutput,
  Distribution,
  BasePersonaAttributes
} from './types/index.js';

// Schemas for validation
export {
  BasePersonaAttributesSchema,
  PersonaAttributesSchema,
  SexSchema
} from './types/index.js';