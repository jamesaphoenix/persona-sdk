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
declare class SeededRNG {
    private seed;
    private current;
    constructor(seed?: number);
    /**
     * Generate next random number between 0 and 1
     */
    next(): number;
    /**
     * Reset to original seed
     */
    reset(): void;
    /**
     * Set new seed
     */
    setSeed(seed: number): void;
}
/**
 * Global seed manager for coordinating deterministic randomness
 */
export declare class SeedManager {
    private static instance;
    private seeds;
    private rngs;
    private constructor();
    static getInstance(): SeedManager;
    /**
     * Set seed for a specific context
     */
    static setSeed(context: string, seed: number): void;
    /**
     * Get seed for a context
     */
    static getSeed(context: string): number;
    /**
     * Get random number generator for context
     */
    static getRNG(context: string): SeededRNG;
    /**
     * Generate deterministic random number for context
     */
    static random(context?: string): number;
    /**
     * Reset all seeds and RNGs
     */
    static reset(): void;
    /**
     * Reset specific context
     */
    static resetContext(context: string): void;
    /**
     * Set global test seed
     */
    static setTestSeed(seed?: number): void;
}
/**
 * Test utility for deterministic test execution
 */
export declare const testWithSeed: (name: string, fn: () => void | Promise<void>, seed?: number) => {
    name: string;
    fn: () => Promise<void>;
};
/**
 * Generate deterministic random numbers for statistical operations
 */
export declare class DeterministicRandom {
    /**
     * Box-Muller transform for normal distribution
     */
    static normal(mean?: number, stdDev?: number, context?: string): number;
    /**
     * Uniform distribution
     */
    static uniform(min?: number, max?: number, context?: string): number;
    /**
     * Exponential distribution
     */
    static exponential(lambda?: number, context?: string): number;
    /**
     * Beta distribution (using ratio of gamma variables)
     */
    static beta(alpha: number, beta: number, context?: string): number;
    /**
     * Gamma distribution (using Marsaglia and Tsang method)
     */
    static gamma(shape: number, context?: string): number;
    /**
     * Categorical selection with weights
     */
    static categorical<T>(items: T[], weights: number[], context?: string): T;
}
export {};
//# sourceMappingURL=seed-manager.d.ts.map