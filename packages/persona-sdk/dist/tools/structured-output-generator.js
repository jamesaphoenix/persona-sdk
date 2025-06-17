import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
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
export class StructuredOutputGenerator {
    model;
    /**
     * Create a new StructuredOutputGenerator.
     *
     * @param apiKey - OpenAI API key (optional, uses OPENAI_API_KEY env var if not provided)
     * @param modelName - OpenAI model to use (default: 'gpt-4-turbo-preview')
     */
    constructor(apiKey, modelName = 'gpt-4-turbo-preview') {
        this.model = new ChatOpenAI({
            openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
            modelName,
            temperature: 0.7
        });
    }
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
    async generate(group, schema, prompt) {
        const groupSummary = group.getSummary();
        const personas = group.personas.slice(0, 10); // Limit to avoid token limits
        const context = `You are analyzing a persona group to generate structured insights.
    
Group: ${groupSummary.name}
Size: ${groupSummary.size}
Common Attributes: ${JSON.stringify(groupSummary.commonAttributes)}

Sample Personas:
${personas.map(p => `- ${p.name}: ${JSON.stringify(p.attributes)}`).join('\n')}`;
        const userPrompt = prompt || 'Analyze this persona group and provide insights according to the schema.';
        const fullPrompt = `${context}\n\n${userPrompt}`;
        // Use LangChain's withStructuredOutput method
        const modelWithStructure = this.model.withStructuredOutput(schema);
        // Invoke the model with structured output
        const data = await modelWithStructure.invoke(fullPrompt);
        return {
            data: data,
            metadata: {
                model: this.model.modelName,
                timestamp: new Date(),
                groupSize: group.size,
                promptUsed: userPrompt
            }
        };
    }
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
    async generateDistributionInsights(group, attributes) {
        const InsightsSchema = z.object({
            distributions: z.array(z.object({
                attribute: z.string().describe('The attribute name'),
                suggestedDistribution: z.string().describe('The suggested distribution type (normal, uniform, exponential, beta, or categorical)'),
                parameters: z.record(z.any()).describe('Parameters for the distribution (e.g., mean and stdDev for normal)'),
                reasoning: z.string().describe('Why this distribution was chosen')
            })).describe('Distribution recommendations for each attribute'),
            summary: z.string().describe('Overall summary of the persona group characteristics'),
            recommendations: z.array(z.string()).describe('Strategic recommendations based on the analysis')
        });
        const stats = attributes.map(attr => ({
            attribute: attr,
            stats: group.getStatistics(attr)
        }));
        const prompt = `Based on the statistical properties of these attributes, suggest appropriate distributions for modeling:

${stats.map(s => {
            const { mean, min, max, stdDev, count } = s.stats;
            return `${s.attribute}: mean=${mean}, min=${min}, max=${max}, stdDev=${stdDev}, count=${count}`;
        }).join('\n')}

For each attribute, recommend:
1. The most appropriate statistical distribution (normal, uniform, exponential, beta, or categorical)
2. Estimated parameters for that distribution
3. Clear reasoning for the choice

Also provide an overall summary and strategic recommendations.`;
        return this.generate(group, InsightsSchema, prompt);
    }
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
    async generateSegments(group, segmentCount = 3) {
        const SegmentSchema = z.object({
            segments: z.array(z.object({
                name: z.string().describe('Descriptive name of the segment'),
                description: z.string().describe('Detailed description of the segment'),
                size: z.number().describe('Estimated number of personas in this segment'),
                keyCharacteristics: z.array(z.string()).describe('Key defining characteristics of this segment'),
                typicalPersona: z.object({
                    attributes: z.record(z.any()).describe('Typical attribute values for this segment')
                }).describe('A representative persona for this segment')
            })).length(segmentCount).describe(`Exactly ${segmentCount} market segments`),
            segmentationStrategy: z.string().describe('The strategy used for segmentation'),
            insights: z.array(z.string()).describe('Key insights and opportunities from the segmentation')
        });
        const prompt = `Analyze the persona group and create exactly ${segmentCount} distinct market segments. 
    
For each segment:
- Provide a clear, descriptive name
- Describe the segment in detail
- Estimate the size (number of personas)
- List 3-5 key characteristics
- Create a typical persona with representative attribute values

Also explain your segmentation strategy and provide actionable insights for each segment.`;
        return this.generate(group, SegmentSchema, prompt);
    }
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
    async generateCustom(group, schema, analysisPrompt) {
        return this.generate(group, schema, analysisPrompt);
    }
}
//# sourceMappingURL=structured-output-generator.js.map