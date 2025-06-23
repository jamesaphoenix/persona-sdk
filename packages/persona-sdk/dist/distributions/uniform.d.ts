import { BaseDistribution } from './base.js';
/**
 * Uniform distribution over [min, max]
 */
export declare class UniformDistribution extends BaseDistribution<number> {
    /**
     * Minimum value (inclusive)
     */
    private readonly min;
    /**
     * Maximum value (inclusive)
     */
    private readonly max;
    constructor(
    /**
     * Minimum value (inclusive)
     */
    min: number, 
    /**
     * Maximum value (inclusive)
     */
    max: number, 
    /**
     * Optional seed for reproducibility
     */
    seed?: number);
    /**
     * Sample uniformly from [min, max]
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
//# sourceMappingURL=uniform.d.ts.map