import { BaseDistribution } from './base.js';
/**
 * Exponential distribution
 */
export class ExponentialDistribution extends BaseDistribution {
    lambda;
    constructor(
    /**
     * Rate parameter (λ)
     */
    lambda, 
    /**
     * Optional seed for reproducibility
     */
    seed) {
        super(seed);
        this.lambda = lambda;
        if (lambda <= 0) {
            throw new Error('Lambda must be positive');
        }
    }
    /**
     * Sample from exponential distribution
     */
    sample() {
        // Using inverse transform method
        const u = this.random.real(0, 1, false);
        return -Math.log(1 - u) / this.lambda;
    }
    /**
     * Get the mean of the distribution
     */
    mean() {
        return 1 / this.lambda;
    }
    /**
     * Get the variance of the distribution
     */
    variance() {
        return 1 / (this.lambda * this.lambda);
    }
    /**
     * Get string representation
     */
    toString() {
        return `Exponential(λ=${this.lambda})`;
    }
}
//# sourceMappingURL=exponential.js.map