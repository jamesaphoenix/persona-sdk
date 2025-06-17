import { Distribution, AttributeCorrelation } from '../types';
/**
 * Configuration for conditional distributions
 */
export interface ConditionalDistribution {
    attribute: string;
    baseDistribution: Distribution;
    conditions: Array<{
        dependsOn: string;
        transform: (baseValue: number, dependentValue: any) => number;
    }>;
}
/**
 * Generates correlated values for multiple attributes
 */
export declare class CorrelatedDistribution {
    private attributes;
    private correlations;
    private conditionals;
    private baseDistributions;
    constructor(attributes: Record<string, Distribution | any>);
    /**
     * Add correlation between two attributes
     */
    addCorrelation(correlation: AttributeCorrelation): this;
    /**
     * Add conditional distribution
     */
    addConditional(conditional: ConditionalDistribution): this;
    /**
     * Generate correlated values
     */
    generate(): Record<string, any>;
    /**
     * Detect actual circular dependencies in remaining conditionals
     */
    private detectCircularDependency;
    /**
     * Apply correlations between numeric attributes
     */
    private applyCorrelations;
    /**
     * Get approximate mean for an attribute
     */
    private getMean;
    /**
     * Get variance for an attribute
     */
    private getVariance;
}
/**
 * Common correlation patterns for realistic persona generation
 */
export declare const CommonCorrelations: {
    ageIncome: (baseIncome: number, age: number) => number;
    ageExperience: (baseExp: number, age: number) => number;
    heightWeight: (baseWeight: number, height: number) => number;
    educationIncome: (baseIncome: number, educationYears: number) => number;
    urbanRuralIncome: (baseIncome: number, isUrban: boolean) => number;
};
/**
 * Preset correlation configurations for common persona types
 */
export declare class PersonaCorrelationPresets {
    static readonly REALISTIC_ADULT: CorrelatedDistribution;
    static readonly PROFESSIONAL: CorrelatedDistribution;
}
//# sourceMappingURL=correlated-distribution.d.ts.map