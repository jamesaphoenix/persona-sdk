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
export { Persona } from './persona';
export { PersonaGroup } from './persona-group';
export { PersonaBuilder } from './persona-builder';
export { PersonaAI } from './ai/persona-ai';
export type { AIOptions } from './ai/persona-ai';
export { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, BinomialDistribution, CategoricalDistribution, CorrelatedDistribution, CommonCorrelations, PersonaCorrelationPresets } from './distributions';
export type { AttributeValue, BasePersonaAttributes, PersonaAttributes, Sex, Distribution, DistributionSpec, DistributionMap, PersonaGroupOptions, StructuredOutput, AttributeCorrelation } from './types';
export type { ConditionalDistribution } from './distributions/correlated-distribution';
export { BasePersonaAttributesSchema, PersonaAttributesSchema, SexSchema } from './types';
export { DistributionSelector } from './tools/distribution-selector';
export { DistributionSelectorLangChain } from './tools/distribution-selector-langchain';
export { StructuredOutputGenerator } from './tools/structured-output-generator';
export { CorrelationAwareSelector } from './tools/correlation-aware-selector';
export { IntelligentPersonaFactory, createRealisticPersonas } from './tools/intelligent-persona-factory';
export { AutoCorrelationGenerator, generateWithAutoCorrelations } from './tools/auto-correlation-generator';
export { MediaToPersonaGenerator } from './tools/media-to-persona';
export { MediaProcessor } from './media/media-processor';
export { MediaDietManager } from './media/media-diet';
export type { MediaContent, UsageMetadata, MediaProcessingResult } from './media/media-processor';
export type { MediaDietItem, MediaConsumptionPattern, MediaDietConfig, MediaInfluenceResult } from './media/media-diet';
export type { MediaToPersonaOptions, MediaToPersonaResult } from './tools/media-to-persona';
export type { DistributionTool, OutputSchema, DistributionSelectionParams, TraitDefinition, IntelligentPersonaConfig, CorrelationAwareSelectionParams, CorrelationAwareResult, AutoCorrelationOptions, AutoCorrelationConfig } from './tools';
export { SUPPORTED_MEDIA_TYPES } from './media/media-processor';
export * from './prompt-optimizer/index.js';
export { PostgresAdapter } from './adapters/postgres/adapter.js';
export type { DatabaseClient, QueryResult, } from './adapters/postgres/adapter.js';
export type { DatabaseConfig, PersonaRecord, PersonaGroupRecord, PersonaQuery, PersonaGroupQuery, CreatePersonaInput as CreatePersonaDbInput, UpdatePersonaInput as UpdatePersonaDbInput, CreatePersonaGroupInput as CreatePersonaGroupDbInput, UpdatePersonaGroupInput as UpdatePersonaGroupDbInput, PaginatedResult, } from './adapters/postgres/types.js';
export { createServer, startServer } from './api/server.js';
export type { ServerOptions } from './api/server.js';
export { PersonaApiClient } from './api/client.js';
export type { ApiClientConfig } from './api/client.js';
export * from './api/schemas.js';
export * from './api/react/hooks.js';
export { PgDatabaseClient } from './adapters/postgres/clients/pg.js';
export { SupabaseDatabaseClient } from './adapters/postgres/clients/supabase.js';
export { PrismaDatabaseClient } from './adapters/postgres/clients/prisma.js';
export { SeedManager, testWithSeed, DeterministicRandom } from './utils/seed-manager';
export { SeededNormalDistribution, SeededUniformDistribution, SeededExponentialDistribution, SeededBetaDistribution, SeededCategoricalDistribution, SeededDistributionFactory } from './distributions/seeded';
export { TypedPersonaBuilder } from './builders/typed-persona-builder';
export type { ExtractAttributes, ExtractPersona } from './builders/typed-persona-builder';
export { TypedPersonaGroup } from './groups/typed-persona-group';
export type { ExtractGroupAttributes, ExtractGroupPersonas } from './groups/typed-persona-group';
export * from './schemas/validation';
export * from './survey';
export declare const VERSION = "0.4.0";
//# sourceMappingURL=index.d.ts.map