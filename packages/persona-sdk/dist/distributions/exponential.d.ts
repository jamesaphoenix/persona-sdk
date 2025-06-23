import { BaseDistribution } from './base.js';
/**
 * Exponential distribution
 */
export declare class ExponentialDistribution extends BaseDistribution<number> {
    /**
     * Rate parameter (λ)
     */
    private readonly lambda;
    constructor(
    /**
     * Rate parameter (λ)
     */
    lambda: number, 
    /**
     * Optional seed for reproducibility
     */
    seed?: number);
    /**
     * Sample from exponential distribution
     */
    sample(): number;
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
//# sourceMappingURL=exponential.d.ts.map