/**
 * Seeded versions of all distributions for deterministic testing
 */

import { Distribution } from '../types';
import { SeedManager, DeterministicRandom } from '../utils/seed-manager';

/**
 * Base class for seeded distributions
 */
abstract class SeededDistribution<T> implements Distribution<T> {
  protected context: string;

  constructor(context: string = 'test') {
    this.context = context;
  }

  abstract sample(): T;
  abstract mean(): T;
  abstract toString(): string;
  
  variance?(): number {
    return undefined;
  }

  /**
   * Generate multiple samples
   */
  samples(count: number): T[] {
    return Array.from({ length: count }, () => this.sample());
  }

  /**
   * Set seed for this distribution's context
   */
  setSeed(seed: number): void {
    SeedManager.setSeed(this.context, seed);
  }
}

/**
 * Seeded normal distribution
 */
export class SeededNormalDistribution extends SeededDistribution<number> {
  constructor(
    private mean: number,
    private stdDev: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.normal(this.mean, this.stdDev, this.context);
  }

  mean(): number {
    return this.mean;
  }

  variance(): number {
    return this.stdDev * this.stdDev;
  }

  toString(): string {
    return `SeededNormal(μ=${this.mean}, σ=${this.stdDev}, context=${this.context})`;
  }

  getMean(): number {
    return this.mean;
  }

  getStdDev(): number {
    return this.stdDev;
  }
}

/**
 * Seeded uniform distribution
 */
export class SeededUniformDistribution extends SeededDistribution<number> {
  constructor(
    private min: number,
    private max: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.uniform(this.min, this.max, this.context);
  }

  mean(): number {
    return (this.min + this.max) / 2;
  }

  variance(): number {
    return Math.pow(this.max - this.min, 2) / 12;
  }

  toString(): string {
    return `SeededUniform(min=${this.min}, max=${this.max}, context=${this.context})`;
  }

  getMin(): number {
    return this.min;
  }

  getMax(): number {
    return this.max;
  }
}

/**
 * Seeded exponential distribution
 */
export class SeededExponentialDistribution extends SeededDistribution<number> {
  constructor(
    private lambda: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.exponential(this.lambda, this.context);
  }

  mean(): number {
    return 1 / this.lambda;
  }

  variance(): number {
    return 1 / (this.lambda * this.lambda);
  }

  toString(): string {
    return `SeededExponential(λ=${this.lambda}, context=${this.context})`;
  }

  getLambda(): number {
    return this.lambda;
  }
}

/**
 * Seeded beta distribution
 */
export class SeededBetaDistribution extends SeededDistribution<number> {
  constructor(
    private alpha: number,
    private beta: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.beta(this.alpha, this.beta, this.context);
  }

  mean(): number {
    return this.alpha / (this.alpha + this.beta);
  }

  variance(): number {
    const sum = this.alpha + this.beta;
    return (this.alpha * this.beta) / (sum * sum * (sum + 1));
  }

  toString(): string {
    return `SeededBeta(α=${this.alpha}, β=${this.beta}, context=${this.context})`;
  }

  getAlpha(): number {
    return this.alpha;
  }

  getBeta(): number {
    return this.beta;
  }
}

/**
 * Seeded categorical distribution
 */
export class SeededCategoricalDistribution<T> extends SeededDistribution<T> {
  private items: T[];
  private weights: number[];

  constructor(
    categories: Array<{ value: T; probability: number }>,
    context: string = 'test'
  ) {
    super(context);
    this.items = categories.map(c => c.value);
    this.weights = categories.map(c => c.probability);
  }

  sample(): T {
    return DeterministicRandom.categorical(this.items, this.weights, this.context);
  }

  mean(): T {
    // For categorical distributions, return the most likely item
    const maxIndex = this.weights.indexOf(Math.max(...this.weights));
    return this.items[maxIndex];
  }

  toString(): string {
    return `SeededCategorical(items=${this.items.length}, context=${this.context})`;
  }

  getCategories(): Array<{ value: T; probability: number }> {
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
  static normal(mean: number, stdDev: number, seed?: number): SeededNormalDistribution {
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
  static uniform(min: number, max: number, seed?: number): SeededUniformDistribution {
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
  static exponential(lambda: number, seed?: number): SeededExponentialDistribution {
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
  static beta(alpha: number, beta: number, seed?: number): SeededBetaDistribution {
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
  static categorical<T>(
    categories: Array<{ value: T; probability: number }>,
    seed?: number
  ): SeededCategoricalDistribution<T> {
    const context = `categorical_${Date.now()}_${Math.random()}`;
    const dist = new SeededCategoricalDistribution(categories, context);
    if (seed !== undefined) {
      dist.setSeed(seed);
    }
    return dist;
  }
}