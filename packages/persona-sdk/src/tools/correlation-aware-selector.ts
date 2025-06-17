import { OpenAI } from 'openai';
import { 
  Distribution,
  DistributionMap,
  AttributeCorrelation
} from '../types';
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution,
  CorrelatedDistribution,
  CommonCorrelations
} from '../distributions';

/**
 * Parameters for correlation-aware distribution selection
 */
export interface CorrelationAwareSelectionParams {
  attributes: string[];
  context: string;
  existingAttributes?: Record<string, any>;
  constraints?: Record<string, { min?: number; max?: number }>;
}

/**
 * Result from correlation-aware selection
 */
export interface CorrelationAwareResult {
  distributions: DistributionMap;
  correlations: AttributeCorrelation[];
  conditionals: Array<{
    attribute: string;
    dependsOn: string;
    transform: (value: number, dependentValue: any) => number;
    reasoning: string;
  }>;
  reasoning: string;
}

/**
 * AI-powered correlation-aware distribution selector.
 * 
 * This class uses OpenAI to intelligently select distributions and correlations
 * that create realistic personas with proper relationships between attributes.
 * 
 * @example
 * ```typescript
 * const selector = new CorrelationAwareSelector();
 * 
 * const result = await selector.selectCorrelatedDistributions({
 *   attributes: ['age', 'income', 'yearsExperience', 'height', 'weight'],
 *   context: 'Software engineers in Silicon Valley',
 *   existingAttributes: { location: 'San Francisco', occupation: 'Engineer' }
 * });
 * 
 * // Use the result to generate realistic personas
 * const group = new PersonaGroup('Engineers');
 * group.generateWithCorrelations(100, result);
 * ```
 */
export class CorrelationAwareSelector {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  /**
   * Select correlated distributions for multiple attributes
   */
  async selectCorrelatedDistributions(
    params: CorrelationAwareSelectionParams
  ): Promise<CorrelationAwareResult> {
    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'select_correlated_distributions',
          description: 'Select distributions and correlations for realistic persona generation',
          parameters: {
            type: 'object',
            properties: {
              distributions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    attribute: { type: 'string' },
                    distribution_type: {
                      type: 'string',
                      enum: ['normal', 'uniform', 'exponential', 'beta', 'categorical']
                    },
                    parameters: {
                      type: 'object',
                      properties: {
                        // Normal
                        mean: { type: 'number' },
                        std_dev: { type: 'number' },
                        // Uniform
                        min: { type: 'number' },
                        max: { type: 'number' },
                        // Exponential
                        rate: { type: 'number' },
                        // Beta
                        alpha: { type: 'number' },
                        beta: { type: 'number' },
                        // Categorical
                        categories: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              value: { type: 'string' },
                              probability: { type: 'number' }
                            }
                          }
                        }
                      }
                    },
                    reasoning: { type: 'string' }
                  },
                  required: ['attribute', 'distribution_type', 'parameters', 'reasoning']
                }
              },
              correlations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    attribute1: { type: 'string' },
                    attribute2: { type: 'string' },
                    correlation: { type: 'number', minimum: -1, maximum: 1 },
                    reasoning: { type: 'string' }
                  },
                  required: ['attribute1', 'attribute2', 'correlation', 'reasoning']
                }
              },
              conditionals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    attribute: { type: 'string' },
                    depends_on: { type: 'string' },
                    relationship_type: {
                      type: 'string',
                      enum: ['age_experience', 'age_income', 'height_weight', 'education_income', 'location_income', 'custom']
                    },
                    custom_formula: { type: 'string' },
                    reasoning: { type: 'string' }
                  },
                  required: ['attribute', 'depends_on', 'relationship_type', 'reasoning']
                }
              },
              overall_reasoning: { type: 'string' }
            },
            required: ['distributions', 'correlations', 'conditionals', 'overall_reasoning']
          }
        }
      }
    ];

    const prompt = `Select realistic distributions and correlations for persona attributes.

Context: ${params.context}
Attributes to generate: ${params.attributes.join(', ')}
${params.existingAttributes ? `Existing attributes: ${JSON.stringify(params.existingAttributes)}` : ''}
${params.constraints ? `Constraints: ${JSON.stringify(params.constraints)}` : ''}

Consider real-world relationships:
- Age typically correlates with income (0.5-0.7) and experience (0.7-0.9)
- Height and weight should correlate (0.6-0.8) following BMI patterns
- Education years correlate with income (0.4-0.6)
- Experience cannot exceed age minus education start age
- Location affects income (urban areas pay 20-50% more)
- Physical attributes follow biological patterns

For each attribute:
1. Choose appropriate distribution based on real-world data
2. Set realistic parameters (e.g., average software engineer income ~$95k)
3. Define correlations with other attributes
4. Add conditional relationships where one attribute limits another

Ensure the personas will be diverse but realistic.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      tools,
      tool_choice: { type: 'function', function: { name: 'select_correlated_distributions' } }
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No distributions selected');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Convert to our format
    const distributions: DistributionMap = {};
    const correlations: AttributeCorrelation[] = [];
    const conditionals: any[] = [];

    // Process distributions
    for (const dist of result.distributions) {
      distributions[dist.attribute] = this.createDistribution(
        dist.distribution_type,
        dist.parameters
      );
    }

    // Process correlations
    for (const corr of result.correlations) {
      correlations.push({
        attribute1: corr.attribute1,
        attribute2: corr.attribute2,
        correlation: corr.correlation
      });
    }

    // Process conditionals
    for (const cond of result.conditionals) {
      const transform = this.getTransformFunction(
        cond.relationship_type,
        cond.custom_formula
      );
      
      conditionals.push({
        attribute: cond.attribute,
        dependsOn: cond.depends_on,
        transform,
        reasoning: cond.reasoning
      });
    }

    return {
      distributions,
      correlations,
      conditionals,
      reasoning: result.overall_reasoning
    };
  }

  /**
   * Analyze existing personas and recommend improvements
   */
  async analyzeAndImprove(
    existingAttributes: Record<string, any>[],
    context: string
  ): Promise<{
    issues: string[];
    recommendations: CorrelationAwareResult;
  }> {
    // Analyze the existing data for unrealistic patterns
    const analysisPrompt = `Analyze these persona attributes for unrealistic patterns:

${JSON.stringify(existingAttributes.slice(0, 10), null, 2)}

Context: ${context}

Identify:
1. Missing correlations (e.g., age not correlated with income)
2. Impossible combinations (e.g., 5 years old with PhD)
3. Unrealistic distributions (e.g., all incomes exactly $50k)
4. Missing diversity in categorical attributes`;

    const analysisResponse = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      max_tokens: 500
    });

    const issues = analysisResponse.choices[0].message.content?.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]\s*/, '').trim()) || [];

    // Get all unique attributes
    const allAttributes = new Set<string>();
    existingAttributes.forEach(attrs => {
      Object.keys(attrs).forEach(key => allAttributes.add(key));
    });

    // Recommend improvements
    const recommendations = await this.selectCorrelatedDistributions({
      attributes: Array.from(allAttributes),
      context,
      constraints: this.inferConstraints(existingAttributes)
    });

    return { issues, recommendations };
  }

  /**
   * Create distribution instance from type and parameters
   */
  private createDistribution(type: string, params: any): Distribution {
    switch (type) {
      case 'normal':
        return new NormalDistribution(params.mean, params.std_dev);
      
      case 'uniform':
        return new UniformDistribution(params.min, params.max);
      
      case 'exponential':
        return new ExponentialDistribution(params.rate);
      
      case 'beta':
        return new BetaDistribution(params.alpha, params.beta);
      
      case 'categorical':
        return new CategoricalDistribution(
          params.categories.map((c: any) => ({
            value: c.value,
            probability: c.probability
          }))
        );
      
      default:
        throw new Error(`Unknown distribution type: ${type}`);
    }
  }

  /**
   * Get transform function for conditional relationships
   */
  private getTransformFunction(
    type: string,
    customFormula?: string
  ): (value: number, dependentValue: any) => number {
    switch (type) {
      case 'age_experience':
        return CommonCorrelations.ageExperience;
      
      case 'age_income':
        return CommonCorrelations.ageIncome;
      
      case 'height_weight':
        return CommonCorrelations.heightWeight;
      
      case 'education_income':
        return CommonCorrelations.educationIncome;
      
      case 'location_income':
        return (income, location) => {
          const multipliers: Record<string, number> = {
            'San Francisco': 1.4,
            'New York': 1.3,
            'Seattle': 1.25,
            'Austin': 1.15,
            'Denver': 1.1,
            'Chicago': 1.05,
            'Remote': 0.95
          };
          return income * (multipliers[location as string] || 1);
        };
      
      case 'custom':
        // Parse and create custom function
        // This is simplified - in production, use a safe expression parser
        return new Function('value', 'dependent', customFormula || 'return value') as any;
      
      default:
        return (value) => value;
    }
  }

  /**
   * Infer constraints from existing data
   */
  private inferConstraints(
    data: Record<string, any>[]
  ): Record<string, { min?: number; max?: number }> {
    const constraints: Record<string, { min?: number; max?: number }> = {};

    // Find numeric attributes and their ranges
    const numericAttrs = new Set<string>();
    data.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericAttrs.add(key);
        }
      });
    });

    // Calculate min/max for each numeric attribute
    numericAttrs.forEach(attr => {
      const values = data
        .map(item => item[attr])
        .filter(v => typeof v === 'number') as number[];
      
      if (values.length > 0) {
        constraints[attr] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    return constraints;
  }
}

/**
 * Helper function to quickly generate correlated personas
 */
export async function generateRealisticPersonas(
  count: number,
  context: string,
  options?: {
    apiKey?: string;
    attributes?: string[];
    existingAttributes?: Record<string, any>;
  }
): Promise<CorrelatedDistribution> {
  const selector = new CorrelationAwareSelector(options?.apiKey);
  
  const defaultAttributes = [
    'age', 'income', 'yearsExperience', 
    'height', 'weight', 'educationYears'
  ];
  
  const result = await selector.selectCorrelatedDistributions({
    attributes: options?.attributes || defaultAttributes,
    context,
    existingAttributes: options?.existingAttributes
  });
  
  // Create correlated distribution
  const correlated = new CorrelatedDistribution({
    ...result.distributions,
    ...options?.existingAttributes
  });
  
  // Add correlations
  result.correlations.forEach(corr => {
    correlated.addCorrelation(corr);
  });
  
  // Add conditionals
  result.conditionals.forEach(cond => {
    const dist = result.distributions[cond.attribute];
    if (dist) {
      correlated.addConditional({
        attribute: cond.attribute,
        baseDistribution: dist,
        conditions: [{
          dependsOn: cond.dependsOn,
          transform: cond.transform
        }]
      });
    }
  });
  
  return correlated;
}