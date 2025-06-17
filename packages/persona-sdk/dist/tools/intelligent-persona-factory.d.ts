import { PersonaGroup } from '../';
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
export declare class IntelligentPersonaFactory {
    private openai;
    constructor(apiKey?: string);
    /**
     * Generate personas with ANY traits while ensuring realism
     */
    generatePersonas(config: IntelligentPersonaConfig): Promise<PersonaGroup>;
    /**
     * Analyze trait relationships using AI
     */
    private analyzeTraitRelationships;
    /**
     * Convert AI analysis to executable code
     */
    private convertAnalysisToImplementation;
    /**
     * Create distribution from AI analysis
     */
    private createDistributionFromAnalysis;
    /**
     * Create smart transform function from dependency
     */
    private createSmartTransform;
    /**
     * Create validator function from rule
     */
    private createValidator;
    /**
     * Quick helper to add custom traits with automatic correlation detection
     */
    addTrait(_group: PersonaGroup, _traitName: string, _traitType: 'numeric' | 'categorical' | 'boolean', _context?: string): Promise<void>;
}
export declare function createRealisticPersonas(traits: Array<string | TraitDefinition>, context: string, count: number, apiKey?: string): Promise<PersonaGroup>;
//# sourceMappingURL=intelligent-persona-factory.d.ts.map