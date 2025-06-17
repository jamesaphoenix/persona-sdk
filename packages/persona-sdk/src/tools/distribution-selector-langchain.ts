/**
 * AI-powered distribution selector using LangChain
 * @module tools/distribution-selector-langchain
 */

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution
} from '../distributions/index.js';
import { Distribution } from '../types/index.js';
import { DistributionSelectionParams } from './types.js';
import { UsageMetadata } from '../media/media-processor.js';
import { encoding_for_model } from 'tiktoken';

/**
 * Distribution selection schema
 */
const DistributionSelectionSchema = z.object({
  distribution_type: z.enum([
    'normal',
    'uniform',
    'exponential',
    'beta',
    'categorical'
  ]),
  parameters: z.object({
    // Normal distribution
    mean: z.number().optional(),
    std_dev: z.number().optional(),
    
    // Uniform distribution
    min: z.number().optional(),
    max: z.number().optional(),
    
    // Exponential distribution
    rate: z.number().optional(),
    
    // Beta distribution
    alpha: z.number().optional(),
    beta: z.number().optional(),
    
    // Categorical distribution
    categories: z.array(z.object({
      value: z.string(),
      probability: z.number()
    })).optional()
  }),
  reasoning: z.string()
});

/**
 * Distribution recommendation schema
 */
const DistributionRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    attribute: z.string(),
    distribution_type: z.string(),
    parameters: z.record(z.any()),
    reasoning: z.string()
  }))
});

/**
 * AI-powered distribution selector using LangChain
 */
export class DistributionSelectorLangChain {
  private model: ChatOpenAI;
  private tokenEncoder: any;

  constructor(apiKey?: string, modelName: string = 'gpt-4-turbo-preview') {
    this.model = new ChatOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      modelName,
      temperature: 0.3 // Lower temperature for more consistent selections
    });
    
    try {
      this.tokenEncoder = encoding_for_model('gpt-4');
    } catch {
      this.tokenEncoder = encoding_for_model('gpt-4');
    }
  }

  /**
   * Count tokens in text
   */
  private countTokens(text: string): number {
    return this.tokenEncoder.encode(text).length;
  }

  /**
   * Select appropriate distribution based on context
   */
  async selectDistribution(params: DistributionSelectionParams): Promise<{
    distribution: Distribution;
    usage: UsageMetadata;
    reasoning: string;
  }> {
    const systemPrompt = `You are an expert in statistical distributions and data modeling.
Select the most appropriate distribution for generating realistic persona attributes.

Consider:
- The nature of the attribute (continuous vs discrete, bounded vs unbounded)
- Real-world patterns (e.g., ages follow normal distribution, incomes often follow log-normal)
- The context provided
- Any constraints specified

Distribution types available:
- normal: For bell-curve distributed values (age, height, IQ)
- uniform: For evenly distributed values (random selection, dice rolls)
- exponential: For time between events, decay processes
- beta: For probabilities, percentages (0-1 bounded)
- categorical: For discrete choices (occupation, preferences)`;

    const userPrompt = `
Attribute: ${params.attribute}
Context: ${params.context || 'General population'}
Constraints: ${params.constraints ? JSON.stringify(params.constraints) : 'None'}

Select the best distribution type and parameters.`;

    const structuredModel = this.model.withStructuredOutput(DistributionSelectionSchema);
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const result = await structuredModel.invoke(messages);

    // Create the distribution based on the selection
    let distribution: Distribution;
    
    switch (result.distribution_type) {
      case 'normal':
        distribution = new NormalDistribution(
          result.parameters.mean || 0,
          result.parameters.std_dev || 1
        );
        break;
      
      case 'uniform':
        distribution = new UniformDistribution(
          result.parameters.min || 0,
          result.parameters.max || 1
        );
        break;
      
      case 'exponential':
        distribution = new ExponentialDistribution(
          result.parameters.rate || 1
        );
        break;
      
      case 'beta':
        distribution = new BetaDistribution(
          result.parameters.alpha || 2,
          result.parameters.beta || 2
        );
        break;
      
      case 'categorical':
        const categories = result.parameters.categories;
        distribution = new CategoricalDistribution(
          (!categories || categories.length === 0) ? [
            { value: 'default', probability: 1.0 }
          ] : categories
        ) as any;
        break;
      
      default:
        // Fallback to normal distribution
        distribution = new NormalDistribution(50, 10);
    }

    // Calculate token usage
    const inputTokens = this.countTokens(systemPrompt + userPrompt);
    const outputTokens = this.countTokens(JSON.stringify(result));
    
    const usage: UsageMetadata = {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens
    };

    return {
      distribution,
      usage,
      reasoning: result.reasoning
    };
  }

  /**
   * Recommend distributions for multiple attributes
   */
  async recommendDistributions(
    attributes: string[],
    context?: string
  ): Promise<{
    distributions: Map<string, Distribution>;
    usage: UsageMetadata;
    recommendations: any[];
  }> {
    const systemPrompt = `You are an expert in statistical modeling for persona generation.
Recommend appropriate distributions for multiple attributes, considering their relationships.`;

    const userPrompt = `
Attributes: ${attributes.join(', ')}
Context: ${context || 'General persona generation'}

For each attribute, recommend:
1. The most appropriate distribution type
2. Suitable parameters
3. Brief reasoning

Consider relationships between attributes (e.g., age affects income).`;

    const structuredModel = this.model.withStructuredOutput(DistributionRecommendationSchema);
    
    const result = await structuredModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const distributions = new Map<string, Distribution>();
    
    // Create distributions from recommendations
    result.recommendations.forEach(rec => {
      let dist: Distribution;
      
      switch (rec.distribution_type) {
        case 'normal':
          dist = new NormalDistribution(
            rec.parameters.mean || 0,
            rec.parameters.std_dev || 1
          );
          break;
        
        case 'uniform':
          dist = new UniformDistribution(
            rec.parameters.min || 0,
            rec.parameters.max || 1
          );
          break;
        
        case 'exponential':
          dist = new ExponentialDistribution(
            rec.parameters.rate || 1
          );
          break;
        
        case 'beta':
          dist = new BetaDistribution(
            rec.parameters.alpha || 2,
            rec.parameters.beta || 2
          );
          break;
        
        case 'categorical':
          dist = new CategoricalDistribution(
            rec.parameters.categories || []
          );
          break;
        
        default:
          dist = new NormalDistribution(50, 10);
      }
      
      distributions.set(rec.attribute, dist);
    });

    // Calculate usage
    const inputTokens = this.countTokens(systemPrompt + userPrompt);
    const outputTokens = this.countTokens(JSON.stringify(result));
    
    const usage: UsageMetadata = {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens
    };

    return {
      distributions,
      usage,
      recommendations: result.recommendations
    };
  }

  /**
   * Create distribution from natural language description
   */
  async fromDescription(description: string): Promise<{
    distribution: Distribution;
    usage: UsageMetadata;
    interpretation: string;
  }> {
    const systemPrompt = `Convert natural language descriptions into statistical distributions.
Examples:
- "mostly young adults" → Normal(25, 5)
- "evenly spread from 0 to 100" → Uniform(0, 100)
- "rare events" → Exponential(0.1)
- "success rate around 70%" → Beta(7, 3)
- "job titles" → Categorical with appropriate probabilities`;

    const structuredModel = this.model.withStructuredOutput(DistributionSelectionSchema);
    
    const result = await structuredModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Convert this description to a distribution: "${description}"` }
    ]);

    // Create the distribution
    let distribution: Distribution;
    
    switch (result.distribution_type) {
      case 'normal':
        distribution = new NormalDistribution(
          result.parameters.mean || 0,
          result.parameters.std_dev || 1
        );
        break;
      
      case 'uniform':
        distribution = new UniformDistribution(
          result.parameters.min || 0,
          result.parameters.max || 1
        );
        break;
      
      case 'exponential':
        distribution = new ExponentialDistribution(
          result.parameters.rate || 1
        );
        break;
      
      case 'beta':
        distribution = new BetaDistribution(
          result.parameters.alpha || 2,
          result.parameters.beta || 2
        );
        break;
      
      case 'categorical':
        distribution = new CategoricalDistribution(
          result.parameters.categories || []
        ) as any;
        break;
      
      default:
        distribution = new NormalDistribution(50, 10);
    }

    // Calculate usage
    const inputTokens = this.countTokens(systemPrompt + description);
    const outputTokens = this.countTokens(JSON.stringify(result));
    
    const usage: UsageMetadata = {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens
    };

    return {
      distribution,
      usage,
      interpretation: result.reasoning
    };
  }

  /**
   * Estimate API cost for distribution selection
   */
  estimateCost(
    attributeCount: number,
    model: string = 'gpt-4-turbo-preview'
  ): {
    estimatedTokens: number;
    estimatedCost: number;
  } {
    // Rough estimate: ~200 tokens per attribute
    const tokensPerAttribute = 200;
    const estimatedTokens = attributeCount * tokensPerAttribute;
    
    const usage: UsageMetadata = {
      input_tokens: estimatedTokens * 0.6,
      output_tokens: estimatedTokens * 0.4,
      total_tokens: estimatedTokens
    };

    // Pricing (simplified)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    const inputCost = (usage.input_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.output_tokens / 1000) * modelPricing.output;
    
    return {
      estimatedTokens,
      estimatedCost: Math.round((inputCost + outputCost) * 10000) / 10000
    };
  }
}