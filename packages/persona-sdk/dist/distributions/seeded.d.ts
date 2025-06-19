/**
 * Seeded versions of all distributions for deterministic testing
 */
import { Distribution } from '../types';
/**
 * Base class for seeded distributions
 */
declare abstract class SeededDistribution<T> implements Distribution<T> {
    protected context: string;
    constructor(context?: string);
    abstract sample(): T;
    abstract mean(): T;
    abstract toString(): string;
    /**
     * Generate multiple samples
     */
    samples(count: number): T[];
    /**
     * Set seed for this distribution's context
     */
    setSeed(seed: number): void;
}
/**
 * Seeded normal distribution
 */
export declare class SeededNormalDistribution extends SeededDistribution<number> {
    private _mean;
    private _stdDev;
    constructor(_mean: number, _stdDev: number, context?: string);
    sample(): number;
    mean(): number;
    variance(): number;
    toString(): string;
    getMean(): number;
    getStdDev(): number;
}
/**
 * Seeded uniform distribution
 */
export declare class SeededUniformDistribution extends SeededDistribution<number> {
    private _min;
    private _max;
    constructor(_min: number, _max: number, context?: string);
    sample(): number;
    mean(): number;
    variance(): number;
    toString(): string;
    getMin(): number;
    getMax(): number;
}
/**
 * Seeded exponential distribution
 */
export declare class SeededExponentialDistribution extends SeededDistribution<number> {
    private _lambda;
    constructor(_lambda: number, context?: string);
    sample(): number;
    mean(): number;
    variance(): number;
    toString(): string;
    getLambda(): number;
}
/**
 * Seeded beta distribution
 */
export declare class SeededBetaDistribution extends SeededDistribution<number> {
    private _alpha;
    private _beta;
    constructor(_alpha: number, _beta: number, context?: string);
    sample(): number;
    mean(): number;
    variance(): number;
    toString(): string;
    getAlpha(): number;
    getBeta(): number;
}
/**
 * Seeded categorical distribution
 */
export declare class SeededCategoricalDistribution<T> extends SeededDistribution<T> {
    private _items;
    private _weights;
    constructor(categories: Array<{
        value: T;
        probability: number;
    }>, context?: string);
    sample(): T;
    mean(): T;
    toString(): string;
    getCategories(): Array<{
        value: T;
        probability: number;
    }>;
}
/**
 * Factory for creating seeded distributions
 */
export declare class SeededDistributionFactory {
    /**
     * Create normal distribution with seed
     */
    static normal(mean: number, stdDev: number, seed?: number): SeededNormalDistribution;
    /**
     * Create uniform distribution with seed
     */
    static uniform(min: number, max: number, seed?: number): SeededUniformDistribution;
    /**
     * Create exponential distribution with seed
     */
    static exponential(lambda: number, seed?: number): SeededExponentialDistribution;
    /**
     * Create beta distribution with seed
     */
    static beta(alpha: number, beta: number, seed?: number): SeededBetaDistribution;
    /**
     * Create categorical distribution with seed
     */
    static categorical<T>(categories: Array<{
        value: T;
        probability: number;
    }>, seed?: number): SeededCategoricalDistribution<T>;
}
export {};
//# sourceMappingURL=seeded.d.ts.map