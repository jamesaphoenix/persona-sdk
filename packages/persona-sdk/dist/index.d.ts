/**
 * @module @open-persona/persona-sdk
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
 * - **Persona groups** for managing collections
 * - **AI-powered analysis** using LangChain and OpenAI
 * - **Fluent builder API** for easy persona construction
 *
 * ## Quick Start
 *
 * ```typescript
 * import { PersonaBuilder, PersonaGroup, NormalDistribution } from '@open-persona/persona-sdk';
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
export { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution, CorrelatedDistribution, CommonCorrelations, PersonaCorrelationPresets } from './distributions';
export type { AttributeValue, BasePersonaAttributes, PersonaAttributes, Sex, Distribution, DistributionSpec, DistributionMap, PersonaGroupOptions, StructuredOutput, AttributeCorrelation } from './types';
export type { ConditionalDistribution } from './distributions/correlated-distribution';
export { BasePersonaAttributesSchema, PersonaAttributesSchema, SexSchema } from './types';
export * from './tools';
export declare const VERSION = "0.1.0";
//# sourceMappingURL=index.d.ts.map