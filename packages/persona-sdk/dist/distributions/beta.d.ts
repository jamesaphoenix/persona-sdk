import { BaseDistribution } from './base';
/**
 * Beta distribution using random-js
 */
export declare class BetaDistribution extends BaseDistribution<number> {
    /**
     * Alpha parameter (α > 0)
     */
    private readonly alpha;
    /**
     * Beta parameter (β > 0)
     */
    private readonly beta;
    constructor(
    /**
     * Alpha parameter (α > 0)
     */
    alpha: number, 
    /**
     * Beta parameter (β > 0)
     */
    beta: number, 
    /**
     * Optional seed for reproducibility
     */
    seed?: number);
    /**
     * Sample from beta distribution
     * Using the relationship: Beta(α,β) = Gamma(α) / (Gamma(α) + Gamma(β))
     */
    sample(): number;
    /**
     * Simple gamma sampling for beta distribution
     */
    private sampleGamma;
    /**
     * Get the mean of the distribution
     */
    mean(): number;
    /**
     * Get the variance of the distribution
     */
    variance(): number;
    /**
     * Get string representation
     */
    toString(): string;
}
//# sourceMappingURL=beta.d.ts.map