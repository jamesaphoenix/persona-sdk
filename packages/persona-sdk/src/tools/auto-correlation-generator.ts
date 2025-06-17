import { OpenAI } from 'openai';
import { z } from 'zod';
import { 
  AttributeCorrelation, 
  Distribution,
  DistributionSpec,
  DistributionMap
} from '../types';
import { CommonCorrelations } from '../distributions/correlated-distribution';

/**
 * Schema for the auto-generated correlation configuration
 */
export const AutoCorrelationSchema = z.object({
  correlations: z.array(z.object({
    attribute1: z.string(),
    attribute2: z.string(),
    correlation: z.number().min(-1).max(1),
    reasoning: z.string()
  })),
  conditionals: z.array(z.object({
    attribute: z.string(),
    dependsOn: z.string(),
    transformType: z.enum(['age_income', 'age_experience', 'height_weight', 'education_income', 'custom']),
    customFormula: z.string().optional(),
    reasoning: z.string()
  }))
});

export type AutoCorrelationConfig = z.infer<typeof AutoCorrelationSchema>;

/**
 * Configuration for auto-generating correlations
 */
export interface AutoCorrelationOptions {
  attributes: Record<string, DistributionSpec>;
  context?: string;
  domain?: string;
  apiKey?: string;
  model?: string;
}

/**
 * Automatically generates correlations and conditionals for persona attributes using AI
 * 
 * @example
 * ```typescript
 * const generator = new AutoCorrelationGenerator();
 * 
 * const config = await generator.generate({
 *   attributes: {
 *     age: new UniformDistribution(18, 80),
 *     income: new NormalDistribution(50000, 20000),
 *     yearsExperience: new UniformDistribution(0, 40),
 *     fitnessLevel: new UniformDistribution(1, 10),
 *     occupation: 'Professional'
 *   },
 *   context: 'Technology professionals in Silicon Valley',
 *   domain: 'workplace'
 * });
 * 
 * // Use with PersonaBuilder
 * const persona = PersonaBuilder.create()
 *   .withAttributes(attributes)
 *   .buildWithCorrelations(config);
 * ```
 */
export class AutoCorrelationGenerator {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate correlations and conditionals for the given attributes
   */
  async generate(options: AutoCorrelationOptions): Promise<AutoCorrelationConfig> {
    const { attributes, context = 'General population', domain = 'general' } = options;
    
    // Extract attribute names and types
    const attributeInfo = Object.entries(attributes).map(([name, spec]) => ({
      name,
      type: this.getAttributeType(spec),
      description: this.getAttributeDescription(spec)
    }));

    const prompt = `Analyze these persona attributes and generate realistic correlations and dependencies:

Attributes:
${attributeInfo.map(a => `- ${a.name}: ${a.type} (${a.description})`).join('\n')}

Context: ${context}
Domain: ${domain}

Your task:
1. Identify ALL realistic correlations between numeric attributes (correlation coefficient between -1 and 1)
2. Identify conditional dependencies (e.g., experience depends on age)
3. Consider domain-specific patterns and real-world relationships
4. Be comprehensive - find every meaningful relationship

Consider these types of relationships:
- Demographic correlations (age affects many things)
- Physical correlations (height/weight, fitness/health)
- Socioeconomic correlations (education/income, location/cost)
- Behavioral correlations (lifestyle choices)
- Domain-specific patterns

For conditionals, use these transform types when applicable:
- age_income: Income increases with age until retirement
- age_experience: Experience is bounded by age
- height_weight: BMI-based weight correlation
- education_income: Higher education correlates with income
- custom: Provide a formula for other relationships`;

    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in human demographics, psychology, and statistics. Generate realistic correlations and dependencies for persona attributes.'
        },
        { role: 'user', content: prompt }
      ],
      functions: [{
        name: 'generate_correlations',
        description: 'Generate correlations and conditional dependencies',
        parameters: {
          type: 'object',
          properties: {
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
                  dependsOn: { type: 'string' },
                  transformType: { 
                    type: 'string', 
                    enum: ['age_income', 'age_experience', 'height_weight', 'education_income', 'custom'] 
                  },
                  customFormula: { type: 'string' },
                  reasoning: { type: 'string' }
                },
                required: ['attribute', 'dependsOn', 'transformType', 'reasoning']
              }
            }
          },
          required: ['correlations', 'conditionals']
        }
      }],
      function_call: { name: 'generate_correlations' }
    });

    const result = JSON.parse(
      response.choices[0].message.function_call?.arguments || '{}'
    );

    return AutoCorrelationSchema.parse(result);
  }

  /**
   * Convert the auto-generated config to the format expected by buildWithCorrelations
   */
  toBuildConfig(config: AutoCorrelationConfig): {
    correlations: AttributeCorrelation[];
    conditionals: Array<{
      attribute: string;
      dependsOn: string;
      transform: (value: number, dependentValue: any) => number;
    }>;
  } {
    return {
      correlations: config.correlations.map(c => ({
        attribute1: c.attribute1,
        attribute2: c.attribute2,
        correlation: c.correlation
      })),
      conditionals: config.conditionals.map(c => ({
        attribute: c.attribute,
        dependsOn: c.dependsOn,
        transform: this.getTransformFunction(c.transformType, c.customFormula)
      }))
    };
  }

  /**
   * Get the transform function based on type
   */
  private getTransformFunction(
    type: string, 
    customFormula?: string
  ): (value: number, dependentValue: any) => number {
    switch (type) {
      case 'age_income':
        return CommonCorrelations.ageIncome;
      case 'age_experience':
        return CommonCorrelations.ageExperience;
      case 'height_weight':
        return CommonCorrelations.heightWeight;
      case 'education_income':
        return CommonCorrelations.educationIncome;
      case 'custom':
        if (customFormula) {
          return new Function('value', 'dependent', customFormula) as any;
        }
        return (value) => value;
      default:
        return (value) => value;
    }
  }

  /**
   * Get attribute type description
   */
  private getAttributeType(spec: DistributionSpec): string {
    if (typeof spec === 'string') return 'categorical';
    if (typeof spec === 'number') return 'numeric';
    if (typeof spec === 'boolean') return 'boolean';
    if (spec && typeof spec === 'object' && 'sample' in spec) {
      return 'numeric distribution';
    }
    return 'unknown';
  }

  /**
   * Get attribute description
   */
  private getAttributeDescription(spec: DistributionSpec): string {
    if (typeof spec === 'string') return `fixed value: ${spec}`;
    if (typeof spec === 'number') return `fixed value: ${spec}`;
    if (typeof spec === 'boolean') return `fixed value: ${spec}`;
    if (spec && typeof spec === 'object' && 'toString' in spec) {
      return spec.toString();
    }
    return 'custom distribution';
  }
}

/**
 * Convenience function to generate personas with automatic correlations
 * 
 * @example
 * ```typescript
 * const personas = await generateWithAutoCorrelations({
 *   attributes: {
 *     age: new UniformDistribution(25, 65),
 *     income: new NormalDistribution(60000, 20000),
 *     yearsExperience: new UniformDistribution(0, 30)
 *   },
 *   count: 100,
 *   context: 'Tech workers in San Francisco'
 * });
 * ```
 */
export async function generateWithAutoCorrelations(options: {
  attributes: DistributionMap;
  count: number;
  context?: string;
  domain?: string;
  groupName?: string;
  apiKey?: string;
  model?: string;
}): Promise<import('../persona-group').PersonaGroup> {
  const { PersonaGroup } = await import('../persona-group');
  const generator = new AutoCorrelationGenerator(options.apiKey);
  
  // Generate correlations
  const correlationConfig = await generator.generate({
    attributes: options.attributes,
    context: options.context,
    domain: options.domain,
    apiKey: options.apiKey,
    model: options.model
  });
  
  // Convert to build config
  const buildConfig = generator.toBuildConfig(correlationConfig);
  
  // Create persona group
  const group = new PersonaGroup(options.groupName || 'Auto-correlated Group');
  
  // Generate with correlations
  group.generateWithCorrelations(options.count, {
    attributes: options.attributes,
    correlations: buildConfig.correlations,
    conditionals: buildConfig.conditionals
  });
  
  return group;
}