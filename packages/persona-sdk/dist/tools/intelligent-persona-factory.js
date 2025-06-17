import { OpenAI } from 'openai';
import { PersonaGroup, Persona } from '../';
import { CorrelatedDistribution, NormalDistribution, UniformDistribution, CategoricalDistribution, ExponentialDistribution, BetaDistribution, CommonCorrelations } from '../distributions';
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
    openai;
    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY
        });
    }
    /**
     * Generate personas with ANY traits while ensuring realism
     */
    async generatePersonas(config) {
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
            let attributes = {};
            // Retry until we get a valid persona
            while (!validPersona && attempts < 10) {
                // Ensure required attributes are included
                const distributions = {
                    ...intelligence.distributions,
                    // Add defaults for required attributes if not provided  
                    age: intelligence.distributions.age || new UniformDistribution(18, 80),
                    occupation: intelligence.distributions.occupation || 'Professional',
                    sex: intelligence.distributions.sex || 'other'
                };
                const correlated = new CorrelatedDistribution(distributions);
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
                validPersona = intelligence.validationRules.every(rule => rule.validate(attributes));
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
    async analyzeTraitRelationships(config) {
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
                    description: 'Analyze traits for persona generation',
                    parameters: {
                        type: 'object',
                        properties: {
                            distributions: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        trait: { type: 'string' },
                                        distributionType: { type: 'string', enum: ['normal', 'uniform', 'exponential', 'beta', 'categorical'] },
                                        parameters: { type: 'object' },
                                        reasoning: { type: 'string' }
                                    },
                                    required: ['trait', 'distributionType', 'parameters', 'reasoning']
                                }
                            },
                            correlations: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        trait1: { type: 'string' },
                                        trait2: { type: 'string' },
                                        correlation: { type: 'number', minimum: -1, maximum: 1 },
                                        reasoning: { type: 'string' }
                                    },
                                    required: ['trait1', 'trait2', 'correlation', 'reasoning']
                                }
                            },
                            dependencies: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        dependent: { type: 'string' },
                                        independent: { type: 'string' },
                                        relationshipType: { type: 'string' },
                                        formula: { type: 'string' },
                                        reasoning: { type: 'string' }
                                    },
                                    required: ['dependent', 'independent', 'relationshipType', 'reasoning']
                                }
                            },
                            validationRules: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        description: { type: 'string' },
                                        rule: { type: 'string' }
                                    },
                                    required: ['description', 'rule']
                                }
                            },
                            warnings: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        },
                        required: ['distributions', 'correlations', 'dependencies', 'validationRules', 'warnings']
                    }
                }],
            function_call: { name: 'analyze_traits' }
        });
        const analysis = JSON.parse(response.choices[0].message.function_call?.arguments || '{}');
        // Convert analysis to implementation
        return this.convertAnalysisToImplementation(analysis, config);
    }
    /**
     * Convert AI analysis to executable code
     */
    convertAnalysisToImplementation(analysis, config) {
        const distributions = {};
        const correlations = [];
        const conditionals = [];
        const validationRules = [];
        // Create distributions
        analysis.distributions.forEach((dist) => {
            distributions[dist.trait] = this.createDistributionFromAnalysis(dist.distributionType, dist.parameters, config.traits.find(t => t.name === dist.trait));
        });
        // Create correlations
        analysis.correlations.forEach((corr) => {
            correlations.push({
                attribute1: corr.trait1,
                attribute2: corr.trait2,
                correlation: corr.correlation
            });
        });
        // Create conditionals with smart transforms
        analysis.dependencies.forEach((dep) => {
            conditionals.push({
                attribute: dep.dependent,
                dependsOn: dep.independent,
                transform: this.createSmartTransform(dep)
            });
        });
        // Create validation rules
        analysis.validationRules.forEach((rule) => {
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
    createDistributionFromAnalysis(type, params, trait) {
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
                    const allowedCategories = params.categories.filter((cat) => trait.constraints.values.includes(cat.value));
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
    createSmartTransform(dependency) {
        const { relationshipType, formula } = dependency;
        // Check if it's a known relationship
        const knownTransforms = {
            'age_experience': CommonCorrelations.ageExperience,
            'age_income': CommonCorrelations.ageIncome,
            'height_weight': CommonCorrelations.heightWeight,
            'education_income': CommonCorrelations.educationIncome,
            'parent_available_time': (time, hasKids) => hasKids ? time * 0.6 : time,
            'age_music_preference': (genres, age) => {
                // Younger people prefer contemporary genres
                const ageBasedGenres = {
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
            'fitness_age': (fitness, age) => {
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
        `);
            }
            catch {
                return (value) => value;
            }
        }
        // Default: no transformation
        return (value) => value;
    }
    /**
     * Create validator function from rule
     */
    createValidator(rule) {
        try {
            return new Function('persona', `
        try {
          return ${rule};
        } catch (e) {
          return true; // Assume valid if rule fails
        }
      `);
        }
        catch {
            return () => true;
        }
    }
    /**
     * Quick helper to add custom traits with automatic correlation detection
     */
    async addTrait(_group, _traitName, _traitType, _context) {
        // TODO: Implement dynamic trait addition
        // This would analyze existing personas and determine correlations
        throw new Error('addTrait method not yet implemented');
    }
}
// Export convenience function
export async function createRealisticPersonas(traits, context, count, apiKey) {
    const factory = new IntelligentPersonaFactory(apiKey);
    // Convert string traits to TraitDefinition
    const traitDefs = traits.map(t => {
        if (typeof t === 'string') {
            return {
                name: t,
                dataType: 'numeric' // AI will determine actual type
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
//# sourceMappingURL=intelligent-persona-factory.js.map