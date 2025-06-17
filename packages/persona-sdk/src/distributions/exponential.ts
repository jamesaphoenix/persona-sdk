import { BaseDistribution } from './base';

/**
 * Exponential distribution
 */
export class ExponentialDistribution extends BaseDistribution<number> {
  constructor(
    /**
     * Rate parameter (λ)
     */
    private readonly lambda: number,
    /**
     * Optional seed for reproducibility
     */
    seed?: number
  ) {
    super(seed);
    if (lambda <= 0) {
      throw new Error('Rate parameter must be positive');
    }
  }

  /**
   * Sample from exponential distribution
   */
  sample(): number {
    // Using inverse transform method
    const u = this.random.real(0, 1, false);
    return -Math.log(1 - u) / this.lambda;
  }

  /**
   * Get the mean of the distribution
   */
  mean(): number {
    return 1 / this.lambda;
  }

  /**
   * Get the variance of the distribution
   */
  variance(): number {
    return 1 / (this.lambda * this.lambda);
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `Exponential(λ=${this.lambda})`;
  }
}