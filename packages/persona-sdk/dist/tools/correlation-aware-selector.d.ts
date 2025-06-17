import { DistributionMap, AttributeCorrelation } from '../types';
import { CorrelatedDistribution } from '../distributions';
/**
 * Parameters for correlation-aware distribution selection
 */
export interface CorrelationAwareSelectionParams {
    attributes: string[];
    context: string;
    existingAttributes?: Record<string, any>;
    constraints?: Record<string, {
        min?: number;
        max?: number;
    }>;
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
export declare class CorrelationAwareSelector {
    private openai;
    constructor(apiKey?: string);
    /**
     * Select correlated distributions for multiple attributes
     */
    selectCorrelatedDistributions(params: CorrelationAwareSelectionParams): Promise<CorrelationAwareResult>;
    /**
     * Analyze existing personas and recommend improvements
     */
    analyzeAndImprove(existingAttributes: Record<string, any>[], context: string): Promise<{
        issues: string[];
        recommendations: CorrelationAwareResult;
    }>;
    /**
     * Create distribution instance from type and parameters
     */
    private createDistribution;
    /**
     * Get transform function for conditional relationships
     */
    private getTransformFunction;
    /**
     * Infer constraints from existing data
     */
    private inferConstraints;
}
/**
 * Helper function to quickly generate correlated personas
 */
export declare function generateRealisticPersonas(_count: number, context: string, options?: {
    apiKey?: string;
    attributes?: string[];
    existingAttributes?: Record<string, any>;
}): Promise<CorrelatedDistribution>;
//# sourceMappingURL=correlation-aware-selector.d.ts.map