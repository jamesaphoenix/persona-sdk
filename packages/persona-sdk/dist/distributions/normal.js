import { BaseDistribution } from './base.js';
/**
 * Normal (Gaussian) distribution implementation.
 *
 * The normal distribution is a continuous probability distribution
 * characterized by its bell curve shape. It's defined by two parameters:
 * mean (μ) and standard deviation (σ).
 *
 * Common uses:
 * - Age distributions in populations
 * - Income distributions
 * - Height and weight distributions
 * - Test scores and performance metrics
 *
 * @example
 * ```typescript
 * // Create a normal distribution for age with mean 35 and std dev 7
 * const ageDistribution = new NormalDistribution(35, 7);
 *
 * // Sample values
 * const age1 = ageDistribution.sample(); // e.g., 32.5
 * const age2 = ageDistribution.sample(); // e.g., 38.2
 *
 * // Get distribution properties
 * console.log(ageDistribution.mean());     // 35
 * console.log(ageDistribution.variance());  // 49
 * ```
 */
export class NormalDistribution extends BaseDistribution {
    mu;
    sigma;
    constructor(
    /**
     * Mean (μ) of the distribution
     */
    mu, 
    /**
     * Standard deviation (σ) of the distribution
     */
    sigma, 
    /**
     * Optional seed for reproducibility
     */
    seed) {
        super(seed);
        this.mu = mu;
        this.sigma = sigma;
        if (sigma <= 0) {
            throw new Error('Standard deviation must be positive');
        }
    }
    /**
     * Sample from normal distribution using Box-Muller transform.
     *
     * Generates a random value following the normal distribution.
     *
     * @returns A random number sampled from N(μ, σ²)
     */
    sample() {
        // Using random-js for uniform random numbers
        const u1 = this.random.real(0, 1, true);
        const u2 = this.random.real(0, 1, true);
        // Box-Muller transform
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * this.sigma + this.mu;
    }
    /**
     * Get the mean of the distribution.
     *
     * @returns The mean (μ) parameter
     */
    mean() {
        return this.mu;
    }
    /**
     * Get the variance of the distribution.
     *
     * @returns The variance (σ²)
     */
    variance() {
        return this.sigma * this.sigma;
    }
    /**
     * Get string representation.
     *
     * @returns Human-readable description of the distribution
     */
    toString() {
        return `Normal(μ=${this.mu}, σ=${this.sigma})`;
    }
}
//# sourceMappingURL=normal.js.map