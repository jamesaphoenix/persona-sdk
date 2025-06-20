import { OpenAI } from 'openai';
import { NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution } from '../distributions';
import { DistributionType } from './types';
/**
 * AI-powered distribution selector
 */
export class DistributionSelector {
    openai;
    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        });
    }
    /**
     * Select appropriate distribution based on context
     */
    async selectDistribution(params) {
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'select_distribution',
                    description: 'Select the most appropriate statistical distribution for generating persona attributes',
                    parameters: {
                        type: 'object',
                        properties: {
                            distribution_type: {
                                type: 'string',
                                enum: Object.values(DistributionType),
                                description: 'The type of distribution to use'
                            },
                            parameters: {
                                type: 'object',
                                description: 'Parameters specific to the chosen distribution',
                                properties: {
                                    // Normal distribution
                                    mean: { type: 'number', description: 'Mean for normal distribution' },
                                    std_dev: { type: 'number', description: 'Standard deviation for normal distribution' },
                                    // Uniform distribution
                                    min: { type: 'number', description: 'Minimum value for uniform distribution' },
                                    max: { type: 'number', description: 'Maximum value for uniform distribution' },
                                    // Exponential distribution
                                    rate: { type: 'number', description: 'Rate parameter for exponential distribution' },
                                    // Beta distribution
                                    alpha: { type: 'number', description: 'Alpha parameter for beta distribution' },
                                    beta: { type: 'number', description: 'Beta parameter for beta distribution' },
                                    // Categorical distribution
                                    categories: {
                                        type: 'array',
                                        description: 'Categories with probabilities for categorical distribution',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                value: { type: ['string', 'number'] },
                                                probability: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            },
                            reasoning: {
                                type: 'string',
                                description: 'Explanation for why this distribution was chosen'
                            }
                        },
                        required: ['distribution_type', 'parameters', 'reasoning']
                    }
                }
            }
        ];
        const prompt = `Select the most appropriate statistical distribution for generating the "${params.attribute}" attribute in a persona.

Context: ${params.context}
${params.constraints ? `Constraints: ${JSON.stringify(params.constraints)}` : ''}

Consider:
- Normal: For naturally occurring attributes with central tendency (age, height, IQ)
- Uniform: For evenly distributed attributes (random selection, equal probability)
- Exponential: For time-based or decay attributes (time between events, waiting times)
- Beta: For probabilities or percentages (success rates, proportions)
- Categorical: For discrete choices (occupation, preference categories)`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [{ role: 'user', content: prompt }],
            tools,
            tool_choice: { type: 'function', function: { name: 'select_distribution' } }
        });
        const toolCall = response.choices[0].message.tool_calls?.[0];
        if (!toolCall) {
            throw new Error('No distribution selected');
        }
        const selection = JSON.parse(toolCall.function.arguments);
        return this.createDistribution(selection.distribution_type, selection.parameters);
    }
    /**
     * Create distribution instance from selection
     */
    createDistribution(type, params) {
        switch (type) {
            case DistributionType.Normal:
                return new NormalDistribution(params.mean, params.std_dev);
            case DistributionType.Uniform:
                return new UniformDistribution(params.min, params.max);
            case DistributionType.Exponential:
                return new ExponentialDistribution(params.rate);
            case DistributionType.Beta:
                return new BetaDistribution(params.alpha, params.beta);
            case DistributionType.Categorical:
                // Ensure categories have probabilities
                const categories = params.categories;
                if (categories && categories.length > 0) {
                    // If probabilities are missing, assign equal probabilities
                    const hasProbs = categories.every((c) => c.probability !== undefined);
                    if (!hasProbs) {
                        const equalProb = 1 / categories.length;
                        const categoriesWithProbs = categories.map((c) => ({
                            value: c.value || c,
                            probability: c.probability ?? equalProb
                        }));
                        return new CategoricalDistribution(categoriesWithProbs);
                    }
                }
                return new CategoricalDistribution(params.categories);
            default:
                throw new Error(`Unknown distribution type: ${type}`);
        }
    }
    /**
     * Get distribution recommendations for multiple attributes
     */
    async recommendDistributions(attributes, context) {
        const recommendations = new Map();
        // Process in parallel for efficiency
        const promises = attributes.map(async (attribute) => {
            const distribution = await this.selectDistribution({ attribute, context });
            return { attribute, distribution };
        });
        const results = await Promise.all(promises);
        results.forEach(({ attribute, distribution }) => {
            recommendations.set(attribute, distribution);
        });
        return recommendations;
    }
}
//# sourceMappingURL=distribution-selector.js.map