import { BaseDistribution } from './base.js';

/**
 * Uniform distribution over [min, max]
 */
export class UniformDistribution extends BaseDistribution<number> {
  constructor(
    /**
     * Minimum value (inclusive)
     */
    private readonly min: number,
    /**
     * Maximum value (inclusive)
     */
    private readonly max: number,
    /**
     * Optional seed for reproducibility
     */
    seed?: number
  ) {
    super(seed);
    if (min > max) {
      throw new Error('Min must be less than or equal to max');
    }
  }

  /**
   * Sample uniformly from [min, max]
   */
  sample(): number {
    // Handle single point distribution
    if (this.min === this.max) {
      return this.min;
    }
    return this.random.real(this.min, this.max, true);
  }

  /**
   * Get the mean of the distribution
   */
  mean(): number {
    return (this.min + this.max) / 2;
  }

  /**
   * Get the variance of the distribution
   */
  variance(): number {
    const range = this.max - this.min;
    // Single point distribution has zero variance
    if (range === 0) {
      return 0;
    }
    return (range * range) / 12;
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `Uniform(${this.min}, ${this.max})`;
  }
}