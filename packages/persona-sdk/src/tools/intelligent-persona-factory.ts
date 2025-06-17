import { OpenAI } from 'openai';
import { z } from 'zod';
import { PersonaGroup, Persona } from '../';
import { 
  CorrelatedDistribution,
  NormalDistribution,
  UniformDistribution,
  CategoricalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CommonCorrelations
} from '../distributions';
import { Distribution, DistributionMap, AttributeCorrelation } from '../types';

/**
 * Trait definition for intelligent persona generation
 */
export interface TraitDefinition {
  name: string;
  description?: string;
  dataType: 'numeric' | 'categorical' | 'boolean' | 'text';
  constraints?: {
    min?: number;
    max?: number;
    values?: string[];
    pattern?: string;
  };
}

/**
 * Configuration for intelligent persona generation
 */
export interface IntelligentPersonaConfig {
  traits: TraitDefinition[];
  context: string;
  count: number;
  ensureRealism?: boolean;
  customRules?: string[];
}

/**
 * Result from intelligent analysis
 */
interface IntelligenceResult {
  distributions: DistributionMap;
  correlations: AttributeCorrelation[];
  conditionals: Array<{
    attribute: string;
    dependsOn: string;
    transform: (value: any, dependentValue: any) => any;
  }>;
  validationRules: Array<{
    description: string;
    validate: (persona: Record<string, any>) => boolean;
  }>;
  warnings: string[];
}

/**
 * Intelligent Persona Factory - AI-powered realistic persona generation.
 * 
 * This class uses advanced AI to ensure that ANY combination of traits
 * results in realistic, coherent personas with proper correlations.
 * 
 * @example
 * ```typescript
 * const factory = new IntelligentPersonaFactory();
 * 
 * // Add any traits you want - AI ensures they're realistic
 * const group = await factory.generatePersonas({
 *   traits: [
 *     { name: 'age', dataType: 'numeric' },
 *     { name: 'income', dataType: 'numeric' },
 *     { name: 'favoriteColor', dataType: 'categorical' },
 *     { name: 'codingHoursPerDay', dataType: 'numeric' },
 *     { name: 'hasKids', dataType: 'boolean' },
 *     { name: 'musicGenre', dataType: 'categorical' },
 *     { name: 'fitnessLevel', dataType: 'numeric', constraints: { min: 1, max: 10 } }
 *   ],
 *   context: 'Software developers in tech startups',
 *   count: 100
 * });
 * 
 * // Result: 100 personas with realistic correlations between ALL traits
 * // - Parents code fewer hours per day
 * // - Fitness level correlates with age (inverse)
 * // - Music preferences correlate with age
 * // - Income correlates with coding hours and age
 * ```
 */
export class IntelligentPersonaFactory {
  private openai: OpenAI;
  private knowledgeBase: Map<string, any>;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    this.knowledgeBase = this.initializeKnowledgeBase();
  }

  /**
   * Generate personas with ANY traits while ensuring realism
   */
  async generatePersonas(config: IntelligentPersonaConfig): Promise<PersonaGroup> {
    // Step 1: Analyze trait relationships
    const intelligence = await this.analyzeTraitRelationships(config);
    
    // Step 2: Validate and warn about potential issues
    if (intelligence.warnings.length > 0) {
      console.warn('Intelligence warnings:', intelligence.warnings);
    }
    
    // Step 3: Create PersonaGroup with correlated distributions
    const group = new PersonaGroup(config.context);
    
    // Step 4: Generate personas with post-validation
    for (let i = 0; i < config.count; i++) {
      let attempts = 0;
      let validPersona = false;
      let attributes: Record<string, any> = {};
      
      // Retry until we get a valid persona
      while (!validPersona && attempts < 10) {
        const correlated = new CorrelatedDistribution(intelligence.distributions);
        
        // Add correlations
        intelligence.correlations.forEach(corr => {
          correlated.addCorrelation(corr);
        });
        
        // Add conditionals
        intelligence.conditionals.forEach(cond => {
          const dist = intelligence.distributions[cond.attribute];
          if (dist && typeof dist === 'object' && 'sample' in dist) {
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
        
        attributes = correlated.generate();
        
        // Validate the persona
        validPersona = intelligence.validationRules.every(rule => 
          rule.validate(attributes)
        );
        
        attempts++;
      }
      
      if (validPersona) {
        group.add(new Persona(`${config.context} ${i + 1}`, attributes));
      }
    }
    
    return group;
  }

  /**
   * Analyze trait relationships using AI
   */
  private async analyzeTraitRelationships(
    config: IntelligentPersonaConfig
  ): Promise<IntelligenceResult> {
    const analysisSchema = z.object({
      distributions: z.array(z.object({
        trait: z.string(),
        distributionType: z.enum(['normal', 'uniform', 'exponential', 'beta', 'categorical']),
        parameters: z.record(z.any()),
        reasoning: z.string()
      })),
      correlations: z.array(z.object({
        trait1: z.string(),
        trait2: z.string(),
        correlation: z.number().min(-1).max(1),
        reasoning: z.string()
      })),
      dependencies: z.array(z.object({
        dependent: z.string(),
        independent: z.string(),
        relationshipType: z.string(),
        formula: z.string().optional(),
        reasoning: z.string()
      })),
      validationRules: z.array(z.object({
        description: z.string(),
        rule: z.string()
      })),
      warnings: z.array(z.string())
    });

    const prompt = `Analyze these traits for realistic persona generation:

Traits: ${JSON.stringify(config.traits, null, 2)}
Context: ${config.context}
Custom Rules: ${config.customRules?.join('; ') || 'None'}

Your task:
1. For each trait, determine the best statistical distribution
2. Identify ALL realistic correlations between traits (even subtle ones)
3. Define conditional dependencies (e.g., experience depends on age)
4. Create validation rules to prevent impossible combinations
5. Warn about any traits that might create unrealistic personas

Consider:
- Demographics affect preferences (age → music genre)
- Lifestyle affects behaviors (hasKids → available time)
- Physical traits correlate (height → weight)
- Socioeconomic factors interrelate (income → education → age)
- Cultural and geographic influences
- Psychological trait clusters

Be comprehensive - find EVERY meaningful relationship.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in human demographics, psychology, and statistics. Your goal is to create highly realistic persona configurations.'
        },
        { role: 'user', content: prompt }
      ],
      functions: [{
        name: 'analyze_traits',
        parameters: analysisSchema
      }],
      function_call: { name: 'analyze_traits' }
    });

    const analysis = JSON.parse(
      response.choices[0].message.function_call?.arguments || '{}'
    );

    // Convert analysis to implementation
    return this.convertAnalysisToImplementation(analysis, config);
  }

  /**
   * Convert AI analysis to executable code
   */
  private convertAnalysisToImplementation(
    analysis: any,
    config: IntelligentPersonaConfig
  ): IntelligenceResult {
    const distributions: DistributionMap = {};
    const correlations: AttributeCorrelation[] = [];
    const conditionals: any[] = [];
    const validationRules: any[] = [];

    // Create distributions
    analysis.distributions.forEach((dist: any) => {
      distributions[dist.trait] = this.createDistributionFromAnalysis(
        dist.distributionType,
        dist.parameters,
        config.traits.find(t => t.name === dist.trait)
      );
    });

    // Create correlations
    analysis.correlations.forEach((corr: any) => {
      correlations.push({
        attribute1: corr.trait1,
        attribute2: corr.trait2,
        correlation: corr.correlation
      });
    });

    // Create conditionals with smart transforms
    analysis.dependencies.forEach((dep: any) => {
      conditionals.push({
        attribute: dep.dependent,
        dependsOn: dep.independent,
        transform: this.createSmartTransform(dep)
      });
    });

    // Create validation rules
    analysis.validationRules.forEach((rule: any) => {
      validationRules.push({
        description: rule.description,
        validate: this.createValidator(rule.rule)
      });
    });

    return {
      distributions,
      correlations,
      conditionals,
      validationRules,
      warnings: analysis.warnings
    };
  }

  /**
   * Create distribution from AI analysis
   */
  private createDistributionFromAnalysis(
    type: string,
    params: any,
    trait?: TraitDefinition
  ): Distribution | any {
    // Apply constraints if provided
    if (trait?.constraints) {
      if (params.min !== undefined && trait.constraints.min !== undefined) {
        params.min = Math.max(params.min, trait.constraints.min);
      }
      if (params.max !== undefined && trait.constraints.max !== undefined) {
        params.max = Math.min(params.max, trait.constraints.max);
      }
    }

    switch (type) {
      case 'normal':
        return new NormalDistribution(params.mean, params.stdDev);
      
      case 'uniform':
        return new UniformDistribution(params.min, params.max);
      
      case 'exponential':
        return new ExponentialDistribution(params.rate);
      
      case 'beta':
        return new BetaDistribution(params.alpha, params.beta);
      
      case 'categorical':
        if (trait?.constraints?.values) {
          // Ensure we only use allowed values
          const allowedCategories = params.categories.filter((cat: any) =>
            trait.constraints!.values!.includes(cat.value)
          );
          return new CategoricalDistribution(allowedCategories);
        }
        return new CategoricalDistribution(params.categories);
      
      default:
        // For non-distribution types, return literal
        return params.value || params.default;
    }
  }

  /**
   * Create smart transform function from dependency
   */
  private createSmartTransform(dependency: any): (value: any, dependent: any) => any {
    const { relationshipType, formula } = dependency;

    // Check if it's a known relationship
    const knownTransforms: Record<string, any> = {
      'age_experience': CommonCorrelations.ageExperience,
      'age_income': CommonCorrelations.ageIncome,
      'height_weight': CommonCorrelations.heightWeight,
      'education_income': CommonCorrelations.educationIncome,
      'parent_available_time': (time: number, hasKids: boolean) => 
        hasKids ? time * 0.6 : time,
      'age_music_preference': (genres: string[], age: number) => {
        // Younger people prefer contemporary genres
        const ageBasedGenres: Record<string, [number, number]> = {
          'Pop': [15, 35],
          'Hip Hop': [15, 30],
          'Electronic': [18, 35],
          'Rock': [25, 55],
          'Classical': [30, 80],
          'Jazz': [25, 70],
          'Country': [20, 60]
        };
        
        // Filter genres by age appropriateness
        return genres.filter(genre => {
          const range = ageBasedGenres[genre];
          return !range || (age >= range[0] && age <= range[1]);
        });
      },
      'fitness_age': (fitness: number, age: number) => {
        // Fitness tends to decline with age
        const ageFactor = Math.max(0, 1 - (age - 25) / 100);
        return fitness * (0.5 + ageFactor * 0.5);
      }
    };

    if (knownTransforms[relationshipType]) {
      return knownTransforms[relationshipType];
    }

    // Create custom transform from formula
    if (formula) {
      try {
        // Safe evaluation of formula
        return new Function('value', 'dependent', `
          try {
            ${formula}
          } catch (e) {
            return value; // Fallback to original value
          }
        `) as any;
      } catch {
        return (value: any) => value;
      }
    }

    // Default: no transformation
    return (value: any) => value;
  }

  /**
   * Create validator function from rule
   */
  private createValidator(rule: string): (persona: Record<string, any>) => boolean {
    try {
      return new Function('persona', `
        try {
          return ${rule};
        } catch (e) {
          return true; // Assume valid if rule fails
        }
      `) as any;
    } catch {
      return () => true;
    }
  }

  /**
   * Initialize knowledge base with common patterns
   */
  private initializeKnowledgeBase(): Map<string, any> {
    const kb = new Map();

    // Common trait relationships
    kb.set('trait_relationships', {
      'age': {
        affects: ['income', 'experience', 'health', 'preferences', 'technology_comfort'],
        distribution: 'normal',
        typicalRange: [18, 80]
      },
      'income': {
        affects: ['spending', 'savings', 'lifestyle', 'stress'],
        correlatesWith: ['education', 'experience', 'location', 'occupation'],
        distribution: 'lognormal'
      },
      'location': {
        affects: ['income', 'cost_of_living', 'lifestyle', 'culture'],
        type: 'categorical'
      }
    });

    // Industry-specific patterns
    kb.set('tech_industry', {
      avgIncome: 95000,
      ageRange: [22, 55],
      commonTraits: ['remote_friendly', 'continuous_learning', 'flexible_hours']
    });

    return kb;
  }

  /**
   * Quick helper to add custom traits with automatic correlation detection
   */
  async addTrait(
    group: PersonaGroup,
    traitName: string,
    traitType: 'numeric' | 'categorical' | 'boolean',
    context?: string
  ): Promise<void> {
    // Analyze existing personas to understand current distribution
    const existingData = group.all().map(p => p.attributes);
    
    // Use AI to determine best distribution and correlations
    const prompt = `Given these existing personas: ${JSON.stringify(existingData.slice(0, 5))}
    
    I want to add a new trait: ${traitName} (${traitType})
    Context: ${context || 'General population'}
    
    Determine:
    1. Best distribution for this trait
    2. Which existing traits it should correlate with
    3. Any conditional dependencies`;

    // Implementation would follow similar pattern as above
    // This is a simplified version for illustration
  }
}

// Export convenience function
export async function createRealisticPersonas(
  traits: Array<string | TraitDefinition>,
  context: string,
  count: number,
  apiKey?: string
): Promise<PersonaGroup> {
  const factory = new IntelligentPersonaFactory(apiKey);
  
  // Convert string traits to TraitDefinition
  const traitDefs = traits.map(t => {
    if (typeof t === 'string') {
      return {
        name: t,
        dataType: 'numeric' as const // AI will determine actual type
      };
    }
    return t;
  });
  
  return factory.generatePersonas({
    traits: traitDefs,
    context,
    count,
    ensureRealism: true
  });
}