import { BaseDistribution } from './base';

/**
 * Categorical distribution for discrete values.
 * 
 * The categorical distribution is a discrete probability distribution
 * that describes the probability of occurrence for a fixed set of values.
 * Each value has an associated probability, and all probabilities must sum to 1.
 * 
 * Common uses:
 * - Sex/Gender distributions
 * - Job role distributions
 * - Preference selections
 * - Any discrete choice scenarios
 * 
 * @template T - Type of the categorical values
 * 
 * @example
 * ```typescript
 * // Create a distribution for job roles
 * const roleDistribution = new CategoricalDistribution([
 *   { value: 'Developer', probability: 0.5 },
 *   { value: 'Designer', probability: 0.3 },
 *   { value: 'Manager', probability: 0.2 }
 * ]);
 * 
 * // Sample values
 * const role1 = roleDistribution.sample(); // e.g., 'Developer'
 * const role2 = roleDistribution.sample(); // e.g., 'Designer'
 * 
 * // Get the mode (most likely value)
 * console.log(roleDistribution.mean()); // 'Developer'
 * ```
 */
export class CategoricalDistribution<T> extends BaseDistribution<T> {
  private readonly cumulative: number[];
  private readonly values: T[];
  private readonly probabilities: number[];

  constructor(
    /**
     * Categories with their probabilities
     */
    categories: Array<{ value: T; probability: number }>,
    /**
     * Optional seed for reproducibility
     */
    seed?: number
  ) {
    super(seed);
    
    // Validate that we have at least one category
    if (categories.length === 0) {
      throw new Error('At least one category is required');
    }
    
    // Validate that all probabilities are positive
    for (const cat of categories) {
      if (cat.probability <= 0) {
        throw new Error('All probabilities must be positive');
      }
    }
    
    // Normalize probabilities if they don't sum to 1
    const totalProb = categories.reduce((sum, cat) => sum + cat.probability, 0);
    const normalizedCategories = categories.map(cat => ({
      ...cat,
      probability: cat.probability / totalProb
    }));

    // Store values and probabilities
    this.values = normalizedCategories.map(cat => cat.value);
    this.probabilities = normalizedCategories.map(cat => cat.probability);
    
    // Build cumulative distribution
    this.cumulative = [];
    let sum = 0;
    for (const cat of normalizedCategories) {
      sum += cat.probability;
      this.cumulative.push(sum);
    }
  }

  /**
   * Sample from the categorical distribution.
   * 
   * Uses inverse transform sampling to select a value based on
   * the defined probabilities.
   * 
   * @returns A randomly selected value according to the probabilities
   */
  sample(): T {
    const r = this.random.real(0, 1);
    for (let i = 0; i < this.cumulative.length; i++) {
      if (r <= this.cumulative[i]) {
        return this.values[i];
      }
    }
    return this.values[this.values.length - 1];
  }

  /**
   * Get the most likely value (mode).
   * 
   * For categorical distributions, returns the value with the highest probability.
   * If multiple values have the same highest probability, returns the first one.
   * 
   * @returns The value with the highest probability
   */
  mean(): T {
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < this.probabilities.length; i++) {
      if (this.probabilities[i] > maxProb) {
        maxProb = this.probabilities[i];
        maxIndex = i;
      }
    }
    return this.values[maxIndex];
  }

  /**
   * Get the probabilities as an array (for compatibility).
   * 
   * @returns Array of values with their associated probabilities
   */
  getProbabilities(): Array<{ value: T; probability: number }> {
    return this.values.map((value, i) => ({
      value,
      probability: this.probabilities[i]
    }));
  }

  /**
   * Get the probabilities as a record (for direct lookup).
   * 
   * @returns Object mapping values to their probabilities
   */
  getProbabilityMap(): Record<string, number> {
    const result: Record<string, number> = {};
    for (let i = 0; i < this.values.length; i++) {
      result[String(this.values[i])] = this.probabilities[i];
    }
    return result;
  }

  /**
   * Get string representation.
   * 
   * @returns Human-readable description showing values and percentages
   */
  toString(): string {
    const items = this.values.map((val, i) => 
      `${val}: ${(this.probabilities[i] * 100).toFixed(1)}%`
    ).join(', ');
    return `Categorical(${items})`;
  }
}