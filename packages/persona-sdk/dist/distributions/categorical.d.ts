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
export declare class CategoricalDistribution<T> extends BaseDistribution<T> {
    private readonly cumulative;
    private readonly values;
    private readonly probabilities;
    constructor(
    /**
     * Categories with their probabilities
     */
    categories: Array<{
        value: T;
        probability: number;
    }>, 
    /**
     * Optional seed for reproducibility
     */
    seed?: number);
    /**
     * Sample from the categorical distribution.
     *
     * Uses inverse transform sampling to select a value based on
     * the defined probabilities.
     *
     * @returns A randomly selected value according to the probabilities
     */
    sample(): T;
    /**
     * Get the most likely value (mode).
     *
     * For categorical distributions, returns the value with the highest probability.
     * If multiple values have the same highest probability, returns the first one.
     *
     * @returns The value with the highest probability
     */
    mean(): T;
    /**
     * Get the probabilities.
     *
     * @returns Array of values with their associated probabilities
     */
    getProbabilities(): Array<{
        value: T;
        probability: number;
    }>;
    /**
     * Get string representation.
     *
     * @returns Human-readable description showing values and percentages
     */
    toString(): string;
}
//# sourceMappingURL=categorical.d.ts.map