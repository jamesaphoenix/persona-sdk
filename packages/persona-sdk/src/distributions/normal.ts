import { BaseDistribution } from './base';

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
export class NormalDistribution extends BaseDistribution<number> {
  constructor(
    /**
     * Mean (μ) of the distribution
     */
    private readonly mu: number,
    /**
     * Standard deviation (σ) of the distribution
     */
    private readonly sigma: number,
    /**
     * Optional seed for reproducibility
     */
    seed?: number
  ) {
    super(seed);
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
  sample(): number {
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
  mean(): number {
    return this.mu;
  }

  /**
   * Get the variance of the distribution.
   * 
   * @returns The variance (σ²)
   */
  variance(): number {
    return this.sigma * this.sigma;
  }

  /**
   * Get string representation.
   * 
   * @returns Human-readable description of the distribution
   */
  toString(): string {
    return `Normal(μ=${this.mu}, σ=${this.sigma})`;
  }
}