import { BaseDistribution } from './base';
/**
 * Uniform distribution over [min, max]
 */
export class UniformDistribution extends BaseDistribution {
    min;
    max;
    constructor(
    /**
     * Minimum value (inclusive)
     */
    min, 
    /**
     * Maximum value (inclusive)
     */
    max, 
    /**
     * Optional seed for reproducibility
     */
    seed) {
        super(seed);
        this.min = min;
        this.max = max;
        if (min >= max) {
            throw new Error('Min must be less than max');
        }
    }
    /**
     * Sample uniformly from [min, max]
     */
    sample() {
        return this.random.real(this.min, this.max, true);
    }
    /**
     * Get the mean of the distribution
     */
    mean() {
        return (this.min + this.max) / 2;
    }
    /**
     * Get the variance of the distribution
     */
    variance() {
        const range = this.max - this.min;
        return (range * range) / 12;
    }
    /**
     * Get string representation
     */
    toString() {
        return `Uniform(${this.min}, ${this.max})`;
    }
}
//# sourceMappingURL=uniform.js.map