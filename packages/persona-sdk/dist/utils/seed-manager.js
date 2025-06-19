/**
 * Seed Manager for deterministic random number generation in tests
 *
 * This utility ensures reproducible randomness across all distributions
 * and statistical operations, eliminating flaky tests and enabling
 * reliable performance benchmarks.
 */
/**
 * Simple Linear Congruential Generator for deterministic random numbers
 */
class SeededRNG {
    seed;
    current;
    constructor(seed = 12345) {
        this.seed = seed;
        this.current = seed;
    }
    /**
     * Generate next random number between 0 and 1
     */
    next() {
        // LCG formula: (a * x + c) % m
        // Using values from Numerical Recipes
        this.current = (this.current * 1664525 + 1013904223) % 0x100000000;
        return (this.current >>> 0) / 0x100000000;
    }
    /**
     * Reset to original seed
     */
    reset() {
        this.current = this.seed;
    }
    /**
     * Set new seed
     */
    setSeed(seed) {
        this.seed = seed;
        this.current = seed;
    }
}
/**
 * Global seed manager for coordinating deterministic randomness
 */
export class SeedManager {
    static instance;
    seeds = new Map();
    rngs = new Map();
    constructor() { }
    static getInstance() {
        if (!SeedManager.instance) {
            SeedManager.instance = new SeedManager();
        }
        return SeedManager.instance;
    }
    /**
     * Set seed for a specific context
     */
    static setSeed(context, seed) {
        const instance = SeedManager.getInstance();
        instance.seeds.set(context, seed);
        instance.rngs.set(context, new SeededRNG(seed));
    }
    /**
     * Get seed for a context
     */
    static getSeed(context) {
        const instance = SeedManager.getInstance();
        return instance.seeds.get(context) ?? 12345;
    }
    /**
     * Get random number generator for context
     */
    static getRNG(context) {
        const instance = SeedManager.getInstance();
        let rng = instance.rngs.get(context);
        if (!rng) {
            const seed = instance.seeds.get(context) ?? 12345;
            rng = new SeededRNG(seed);
            instance.rngs.set(context, rng);
        }
        return rng;
    }
    /**
     * Generate deterministic random number for context
     */
    static random(context = 'default') {
        return SeedManager.getRNG(context).next();
    }
    /**
     * Reset all seeds and RNGs
     */
    static reset() {
        const instance = SeedManager.getInstance();
        instance.seeds.clear();
        instance.rngs.clear();
    }
    /**
     * Reset specific context
     */
    static resetContext(context) {
        const instance = SeedManager.getInstance();
        const rng = instance.rngs.get(context);
        if (rng) {
            rng.reset();
        }
    }
    /**
     * Set global test seed
     */
    static setTestSeed(seed = 12345) {
        SeedManager.setSeed('test', seed);
        SeedManager.setSeed('correlation', seed + 1);
        SeedManager.setSeed('performance', seed + 2);
        SeedManager.setSeed('validation', seed + 3);
    }
}
/**
 * Test utility for deterministic test execution
 */
export const testWithSeed = (name, fn, seed = 12345) => {
    return {
        name,
        fn: async () => {
            SeedManager.setTestSeed(seed);
            try {
                await fn();
            }
            finally {
                SeedManager.reset();
            }
        }
    };
};
/**
 * Generate deterministic random numbers for statistical operations
 */
export class DeterministicRandom {
    /**
     * Box-Muller transform for normal distribution
     */
    static normal(mean = 0, stdDev = 1, context = 'test') {
        const u1 = SeedManager.random(context);
        const u2 = SeedManager.random(context);
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
    /**
     * Uniform distribution
     */
    static uniform(min = 0, max = 1, context = 'test') {
        return min + (max - min) * SeedManager.random(context);
    }
    /**
     * Exponential distribution
     */
    static exponential(lambda = 1, context = 'test') {
        const u = SeedManager.random(context);
        return -Math.log(1 - u) / lambda;
    }
    /**
     * Beta distribution (using ratio of gamma variables)
     */
    static beta(alpha, beta, context = 'test') {
        const x = DeterministicRandom.gamma(alpha, context);
        const y = DeterministicRandom.gamma(beta, context);
        return x / (x + y);
    }
    /**
     * Gamma distribution (using Marsaglia and Tsang method)
     */
    static gamma(shape, context = 'test') {
        if (shape < 1) {
            return DeterministicRandom.gamma(shape + 1, context) * Math.pow(SeedManager.random(context), 1 / shape);
        }
        const d = shape - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x;
            let v;
            do {
                x = DeterministicRandom.normal(0, 1, context);
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = SeedManager.random(context);
            if (u < 1 - 0.0331 * x * x * x * x) {
                return d * v;
            }
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
                return d * v;
            }
        }
    }
    /**
     * Categorical selection with weights
     */
    static categorical(items, weights, context = 'test') {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = SeedManager.random(context) * totalWeight;
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }
}
//# sourceMappingURL=seed-manager.js.map