/**
 * @module @jamesaphoenix/persona-sdk
 *
 * A TypeScript SDK for generating personas from statistical distributions.
 *
 * This SDK provides tools for creating realistic personas using statistical
 * distributions, managing groups of personas, and generating AI-powered
 * insights about audience segments.
 *
 * ## Key Features
 *
 * - **Type-safe persona creation** with required and custom attributes
 * - **Statistical distributions** for realistic data generation
 * - **Auto-correlation generation** using AI for realistic relationships
 * - **Persona groups** for managing collections
 * - **AI-powered analysis** using LangChain and OpenAI
 * - **Fluent builder API** for easy persona construction
 *
 * ## Quick Start
 *
 * ```typescript
 * import { PersonaBuilder, PersonaGroup, NormalDistribution } from '@jamesaphoenix/persona-sdk';
 *
 * // Create a single persona
 * const persona = PersonaBuilder.create()
 *   .withName('Alice Johnson')
 *   .withAge(28)
 *   .withOccupation('Software Engineer')
 *   .withSex('female')
 *   .build();
 *
 * // Create personas with distributions
 * const group = new PersonaGroup('Tech Workers');
 * group.generateFromDistributions(100, {
 *   age: new NormalDistribution(32, 5),
 *   occupation: 'Developer',
 *   sex: 'other',
 *   yearsExperience: new UniformDistribution(1, 10)
 * });
 *
 * // Generate AI insights
 * const insights = await group.generateStructuredOutput(
 *   MarketingInsightSchema,
 *   'Analyze for product positioning'
 * );
 * ```
 *
 * ## Main Components
 *
 * - {@link Persona} - Individual persona with attributes
 * - {@link PersonaGroup} - Collection of personas with analysis tools
 * - {@link PersonaBuilder} - Fluent API for building personas
 * - {@link NormalDistribution} - Gaussian distribution
 * - {@link UniformDistribution} - Uniform random distribution
 * - {@link CategoricalDistribution} - Discrete probability distribution
 * - {@link StructuredOutputGenerator} - AI-powered analysis
 */
// Core classes
export { Persona } from './persona';
export { PersonaGroup } from './persona-group';
export { PersonaBuilder } from './persona-builder';
// AI functionality
export { PersonaAI } from './ai/persona-ai';
// Distributions
export { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution, CorrelatedDistribution, CommonCorrelations, PersonaCorrelationPresets } from './distributions';
export { BasePersonaAttributesSchema, PersonaAttributesSchema, SexSchema } from './types';
// Tools
export { DistributionSelector } from './tools/distribution-selector';
export { DistributionSelectorLangChain } from './tools/distribution-selector-langchain';
export { StructuredOutputGenerator } from './tools/structured-output-generator';
export { CorrelationAwareSelector } from './tools/correlation-aware-selector';
export { IntelligentPersonaFactory, createRealisticPersonas } from './tools/intelligent-persona-factory';
export { AutoCorrelationGenerator, generateWithAutoCorrelations } from './tools/auto-correlation-generator';
export { MediaToPersonaGenerator } from './tools/media-to-persona';
// Media processing
export { MediaProcessor } from './media/media-processor';
export { MediaDietManager } from './media/media-diet';
// Constants
export { SUPPORTED_MEDIA_TYPES } from './media/media-processor';
// Prompt Optimizer - Re-export everything from prompt-optimizer module
export * from './prompt-optimizer/index.js';
// Database Adapter
export { PostgresAdapter } from './adapters/postgres/adapter.js';
// API Server
export { createServer, startServer } from './api/server.js';
// API Client
export { PersonaApiClient } from './api/client.js';
// API Schemas
export * from './api/schemas.js';
// React Hooks
export * from './api/react/hooks.js';
// Database Clients
export { PgDatabaseClient } from './adapters/postgres/clients/pg.js';
export { SupabaseDatabaseClient } from './adapters/postgres/clients/supabase.js';
export { PrismaDatabaseClient } from './adapters/postgres/clients/prisma.js';
// Seeding Utilities
export { SeedManager, testWithSeed, DeterministicRandom } from './utils/seed-manager';
export { SeededNormalDistribution, SeededUniformDistribution, SeededExponentialDistribution, SeededBetaDistribution, SeededCategoricalDistribution, SeededDistributionFactory } from './distributions/seeded';
// Enhanced Type-Safe Builders
export { TypedPersonaBuilder } from './builders/typed-persona-builder';
// Typed Persona Group
export { TypedPersonaGroup } from './groups/typed-persona-group';
// Validation Schemas
export * from './schemas/validation';
// Survey Data Pipeline
export * from './survey';
// Version
export const VERSION = '0.4.0';
//# sourceMappingURL=index.js.map