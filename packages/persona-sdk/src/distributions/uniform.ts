import { BaseDistribution } from './base';

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
    if (min >= max) {
      throw new Error('Min must be less than max');
    }
  }

  /**
   * Sample uniformly from [min, max]
   */
  sample(): number {
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
    return (range * range) / 12;
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `Uniform(${this.min}, ${this.max})`;
  }
}