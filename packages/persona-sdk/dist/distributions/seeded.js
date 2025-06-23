/**
 * Seeded versions of all distributions for deterministic testing
 */
import { SeedManager, DeterministicRandom } from '../utils/seed-manager.js';
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
    _mean;
    _stdDev;
    constructor(_mean, _stdDev, context = 'test') {
        super(context);
        this._mean = _mean;
        this._stdDev = _stdDev;
    }
    sample() {
        return DeterministicRandom.normal(this._mean, this._stdDev, this.context);
    }
    mean() {
        return this._mean;
    }
    variance() {
        return this._stdDev * this._stdDev;
    }
    toString() {
        return `SeededNormal(μ=${this._mean}, σ=${this._stdDev}, context=${this.context})`;
    }
    getMean() {
        return this._mean;
    }
    getStdDev() {
        return this._stdDev;
    }
}
/**
 * Seeded uniform distribution
 */
export class SeededUniformDistribution extends SeededDistribution {
    _min;
    _max;
    constructor(_min, _max, context = 'test') {
        super(context);
        this._min = _min;
        this._max = _max;
    }
    sample() {
        return DeterministicRandom.uniform(this._min, this._max, this.context);
    }
    mean() {
        return (this._min + this._max) / 2;
    }
    variance() {
        return Math.pow(this._max - this._min, 2) / 12;
    }
    toString() {
        return `SeededUniform(min=${this._min}, max=${this._max}, context=${this.context})`;
    }
    getMin() {
        return this._min;
    }
    getMax() {
        return this._max;
    }
}
/**
 * Seeded exponential distribution
 */
export class SeededExponentialDistribution extends SeededDistribution {
    _lambda;
    constructor(_lambda, context = 'test') {
        super(context);
        this._lambda = _lambda;
    }
    sample() {
        return DeterministicRandom.exponential(this._lambda, this.context);
    }
    mean() {
        return 1 / this._lambda;
    }
    variance() {
        return 1 / (this._lambda * this._lambda);
    }
    toString() {
        return `SeededExponential(λ=${this._lambda}, context=${this.context})`;
    }
    getLambda() {
        return this._lambda;
    }
}
/**
 * Seeded beta distribution
 */
export class SeededBetaDistribution extends SeededDistribution {
    _alpha;
    _beta;
    constructor(_alpha, _beta, context = 'test') {
        super(context);
        this._alpha = _alpha;
        this._beta = _beta;
    }
    sample() {
        return DeterministicRandom.beta(this._alpha, this._beta, this.context);
    }
    mean() {
        return this._alpha / (this._alpha + this._beta);
    }
    variance() {
        const sum = this._alpha + this._beta;
        return (this._alpha * this._beta) / (sum * sum * (sum + 1));
    }
    toString() {
        return `SeededBeta(α=${this._alpha}, β=${this._beta}, context=${this.context})`;
    }
    getAlpha() {
        return this._alpha;
    }
    getBeta() {
        return this._beta;
    }
}
/**
 * Seeded categorical distribution
 */
export class SeededCategoricalDistribution extends SeededDistribution {
    _items;
    _weights;
    constructor(categories, context = 'test') {
        super(context);
        this._items = categories.map(c => c.value);
        this._weights = categories.map(c => c.probability);
    }
    sample() {
        return DeterministicRandom.categorical(this._items, this._weights, this.context);
    }
    mean() {
        // For categorical distributions, return the most likely item
        const maxIndex = this._weights.indexOf(Math.max(...this._weights));
        return this._items[maxIndex];
    }
    toString() {
        return `SeededCategorical(items=${this._items.length}, context=${this.context})`;
    }
    getCategories() {
        return this._items.map((item, i) => ({
            value: item,
            probability: this._weights[i]
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