import { z } from 'zod';
import { PersonaGroup } from '../persona-group';
import { StructuredOutput } from '../types';
/**
 * Generate structured outputs from PersonaGroup using LangChain.
 *
 * This class provides AI-powered analysis of persona groups, generating
 * insights, distributions, and segmentations using OpenAI models through
 * LangChain's structured output capabilities.
 *
 * @example
 * ```typescript
 * const generator = new StructuredOutputGenerator();
 *
 * // Generate custom insights
 * const InsightSchema = z.object({
 *   targetAudience: z.string(),
 *   keyTraits: z.array(z.string()),
 *   marketingAdvice: z.string()
 * });
 *
 * const insights = await generator.generateCustom(
 *   personaGroup,
 *   InsightSchema,
 *   "Analyze for marketing campaign targeting"
 * );
 * ```
 */
export declare class StructuredOutputGenerator {
    private model;
    /**
     * Create a new StructuredOutputGenerator.
     *
     * @param apiKey - OpenAI API key (optional, uses OPENAI_API_KEY env var if not provided)
     * @param modelName - OpenAI model to use (default: 'gpt-4-turbo-preview')
     */
    constructor(apiKey?: string, modelName?: string);
    /**
     * Generate structured output from a PersonaGroup using LangChain's withStructuredOutput.
     *
     * This is the core method that other generation methods build upon.
     * It analyzes the persona group and generates insights according to
     * the provided Zod schema.
     *
     * @template T - Type of the structured output
     * @param group - The PersonaGroup to analyze
     * @param schema - Zod schema defining the output structure
     * @param prompt - Custom analysis prompt (optional)
     * @returns Promise resolving to structured output with metadata
     */
    generate<T = any>(group: PersonaGroup, schema: z.ZodSchema<T>, prompt?: string): Promise<StructuredOutput<T>>;
    /**
     * Generate distribution-based insights using LangChain structured output.
     *
     * Analyzes the statistical properties of persona attributes and recommends
     * appropriate statistical distributions for modeling each attribute.
     *
     * @param group - The PersonaGroup to analyze
     * @param attributes - Array of attribute names to analyze
     * @returns Promise resolving to distribution recommendations and insights
     *
     * @example
     * ```typescript
     * const insights = await generator.generateDistributionInsights(
     *   group,
     *   ['age', 'income', 'satisfaction']
     * );
     *
     * // Use the recommendations to create new distributions
     * insights.data.distributions.forEach(dist => {
     *   console.log(`${dist.attribute}: ${dist.suggestedDistribution}`);
     *   console.log(`Parameters: ${JSON.stringify(dist.parameters)}`);
     *   console.log(`Reasoning: ${dist.reasoning}`);
     * });
     * ```
     */
    generateDistributionInsights(group: PersonaGroup, attributes: string[]): Promise<StructuredOutput<{
        distributions: Array<{
            attribute: string;
            suggestedDistribution: string;
            parameters: Record<string, any>;
            reasoning: string;
        }>;
        summary: string;
        recommendations: string[];
    }>>;
    /**
     * Generate market segments from persona group.
     *
     * Uses AI to identify distinct segments within the persona group,
     * providing detailed characteristics and typical personas for each segment.
     *
     * @param group - The PersonaGroup to segment
     * @param segmentCount - Number of segments to create (default: 3)
     * @returns Promise resolving to market segments with strategy and insights
     *
     * @example
     * ```typescript
     * const segmentation = await generator.generateSegments(group, 4);
     *
     * segmentation.data.segments.forEach(segment => {
     *   console.log(`Segment: ${segment.name}`);
     *   console.log(`Size: ${segment.size} personas`);
     *   console.log(`Key traits: ${segment.keyCharacteristics.join(', ')}`);
     * });
     * ```
     */
    generateSegments(group: PersonaGroup, segmentCount?: number): Promise<StructuredOutput<{
        segments: Array<{
            name: string;
            description: string;
            size: number;
            keyCharacteristics: string[];
            typicalPersona: {
                attributes: Record<string, any>;
            };
        }>;
        segmentationStrategy: string;
        insights: string[];
    }>>;
    /**
     * Generate custom structured output based on user-defined schema.
     *
     * Provides maximum flexibility by allowing any Zod schema and custom
     * analysis prompt. This is the method to use for domain-specific analyses.
     *
     * @template T - Type of the structured output
     * @param group - The PersonaGroup to analyze
     * @param schema - Custom Zod schema defining the output structure
     * @param analysisPrompt - Custom prompt describing the analysis to perform
     * @returns Promise resolving to structured output matching the schema
     *
     * @example
     * ```typescript
     * // Define a custom schema for your use case
     * const ProductFitSchema = z.object({
     *   productMarketFit: z.number().min(0).max(10),
     *   targetFeatures: z.array(z.string()),
     *   pricingTier: z.enum(['basic', 'pro', 'enterprise']),
     *   adoptionChallenges: z.array(z.string()),
     *   opportunities: z.array(z.object({
     *     feature: z.string(),
     *     impact: z.enum(['low', 'medium', 'high']),
     *     rationale: z.string()
     *   }))
     * });
     *
     * const analysis = await generator.generateCustom(
     *   group,
     *   ProductFitSchema,
     *   "Analyze product-market fit for a B2B SaaS collaboration tool"
     * );
     * ```
     */
    generateCustom<T = any>(group: PersonaGroup, schema: z.ZodSchema<T>, analysisPrompt: string): Promise<StructuredOutput<T>>;
}
//# sourceMappingURL=structured-output-generator.d.ts.map