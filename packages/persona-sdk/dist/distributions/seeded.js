/**
 * Seeded versions of all distributions for deterministic testing
 */
import { SeedManager, DeterministicRandom } from '../utils/seed-manager';
/**
 * Base class for seeded distributions
 */
class SeededDistribution {
    context;
    constructor(context = 'test') {
        this.context = context;
    }
    /**
     * Generate multiple samples
     */
    samples(count) {
        return Array.from({ length: count }, () => this.sample());
    }
    /**
     * Set seed for this distribution's context
     */
    setSeed(seed) {
        SeedManager.setSeed(this.context, seed);
    }
}
/**
 * Seeded normal distribution
 */
export class SeededNormalDistribution extends SeededDistribution {
    mean;
    stdDev;
    constructor(mean, stdDev, context = 'test') {
        super(context);
        this.mean = mean;
        this.stdDev = stdDev;
    }
    sample() {
        return DeterministicRandom.normal(this.mean, this.stdDev, this.context);
    }
    getMean() {
        return this.mean;
    }
    getStdDev() {
        return this.stdDev;
    }
}
/**
 * Seeded uniform distribution
 */
export class SeededUniformDistribution extends SeededDistribution {
    min;
    max;
    constructor(min, max, context = 'test') {
        super(context);
        this.min = min;
        this.max = max;
    }
    sample() {
        return DeterministicRandom.uniform(this.min, this.max, this.context);
    }
    getMin() {
        return this.min;
    }
    getMax() {
        return this.max;
    }
}
/**
 * Seeded exponential distribution
 */
export class SeededExponentialDistribution extends SeededDistribution {
    lambda;
    constructor(lambda, context = 'test') {
        super(context);
        this.lambda = lambda;
    }
    sample() {
        return DeterministicRandom.exponential(this.lambda, this.context);
    }
    getLambda() {
        return this.lambda;
    }
}
/**
 * Seeded beta distribution
 */
export class SeededBetaDistribution extends SeededDistribution {
    alpha;
    beta;
    constructor(alpha, beta, context = 'test') {
        super(context);
        this.alpha = alpha;
        this.beta = beta;
    }
    sample() {
        return DeterministicRandom.beta(this.alpha, this.beta, this.context);
    }
    getAlpha() {
        return this.alpha;
    }
    getBeta() {
        return this.beta;
    }
}
/**
 * Seeded categorical distribution
 */
export class SeededCategoricalDistribution extends SeededDistribution {
    items;
    weights;
    constructor(categories, context = 'test') {
        super(context);
        this.items = categories.map(c => c.value);
        this.weights = categories.map(c => c.probability);
    }
    sample() {
        return DeterministicRandom.categorical(this.items, this.weights, this.context);
    }
    getCategories() {
        return this.items.map((item, i) => ({
            value: item,
            probability: this.weights[i]
        }));
    }
}
/**
 * Factory for creating seeded distributions
 */
export class SeededDistributionFactory {
    /**
     * Create normal distribution with seed
     */
    static normal(mean, stdDev, seed) {
        const context = `normal_${Date.now()}_${Math.random()}`;
        const dist = new SeededNormalDistribution(mean, stdDev, context);
        if (seed !== undefined) {
            dist.setSeed(seed);
        }
        return dist;
    }
    /**
     * Create uniform distribution with seed
     */
    static uniform(min, max, seed) {
        const context = `uniform_${Date.now()}_${Math.random()}`;
        const dist = new SeededUniformDistribution(min, max, context);
        if (seed !== undefined) {
            dist.setSeed(seed);
        }
        return dist;
    }
    /**
     * Create exponential distribution with seed
     */
    static exponential(lambda, seed) {
        const context = `exponential_${Date.now()}_${Math.random()}`;
        const dist = new SeededExponentialDistribution(lambda, context);
        if (seed !== undefined) {
            dist.setSeed(seed);
        }
        return dist;
    }
    /**
     * Create beta distribution with seed
     */
    static beta(alpha, beta, seed) {
        const context = `beta_${Date.now()}_${Math.random()}`;
        const dist = new SeededBetaDistribution(alpha, beta, context);
        if (seed !== undefined) {
            dist.setSeed(seed);
        }
        return dist;
    }
    /**
     * Create categorical distribution with seed
     */
    static categorical(categories, seed) {
        const context = `categorical_${Date.now()}_${Math.random()}`;
        const dist = new SeededCategoricalDistribution(categories, context);
        if (seed !== undefined) {
            dist.setSeed(seed);
        }
        return dist;
    }
}
//# sourceMappingURL=seeded.js.map