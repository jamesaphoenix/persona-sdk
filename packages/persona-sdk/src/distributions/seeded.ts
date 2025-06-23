/**
 * Seeded versions of all distributions for deterministic testing
 */

import { Distribution } from '../types/index.js';
import { SeedManager, DeterministicRandom } from '../utils/seed-manager.js';

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
    private _mean: number,
    private _stdDev: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.normal(this._mean, this._stdDev, this.context);
  }

  mean(): number {
    return this._mean;
  }

  variance(): number {
    return this._stdDev * this._stdDev;
  }

  toString(): string {
    return `SeededNormal(μ=${this._mean}, σ=${this._stdDev}, context=${this.context})`;
  }

  getMean(): number {
    return this._mean;
  }

  getStdDev(): number {
    return this._stdDev;
  }
}

/**
 * Seeded uniform distribution
 */
export class SeededUniformDistribution extends SeededDistribution<number> {
  constructor(
    private _min: number,
    private _max: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.uniform(this._min, this._max, this.context);
  }

  mean(): number {
    return (this._min + this._max) / 2;
  }

  variance(): number {
    return Math.pow(this._max - this._min, 2) / 12;
  }

  toString(): string {
    return `SeededUniform(min=${this._min}, max=${this._max}, context=${this.context})`;
  }

  getMin(): number {
    return this._min;
  }

  getMax(): number {
    return this._max;
  }
}

/**
 * Seeded exponential distribution
 */
export class SeededExponentialDistribution extends SeededDistribution<number> {
  constructor(
    private _lambda: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.exponential(this._lambda, this.context);
  }

  mean(): number {
    return 1 / this._lambda;
  }

  variance(): number {
    return 1 / (this._lambda * this._lambda);
  }

  toString(): string {
    return `SeededExponential(λ=${this._lambda}, context=${this.context})`;
  }

  getLambda(): number {
    return this._lambda;
  }
}

/**
 * Seeded beta distribution
 */
export class SeededBetaDistribution extends SeededDistribution<number> {
  constructor(
    private _alpha: number,
    private _beta: number,
    context: string = 'test'
  ) {
    super(context);
  }

  sample(): number {
    return DeterministicRandom.beta(this._alpha, this._beta, this.context);
  }

  mean(): number {
    return this._alpha / (this._alpha + this._beta);
  }

  variance(): number {
    const sum = this._alpha + this._beta;
    return (this._alpha * this._beta) / (sum * sum * (sum + 1));
  }

  toString(): string {
    return `SeededBeta(α=${this._alpha}, β=${this._beta}, context=${this.context})`;
  }

  getAlpha(): number {
    return this._alpha;
  }

  getBeta(): number {
    return this._beta;
  }
}

/**
 * Seeded categorical distribution
 */
export class SeededCategoricalDistribution<T> extends SeededDistribution<T> {
  private _items: T[];
  private _weights: number[];

  constructor(
    categories: Array<{ value: T; probability: number }>,
    context: string = 'test'
  ) {
    super(context);
    this._items = categories.map(c => c.value);
    this._weights = categories.map(c => c.probability);
  }

  sample(): T {
    return DeterministicRandom.categorical(this._items, this._weights, this.context);
  }

  mean(): T {
    // For categorical distributions, return the most likely item
    const maxIndex = this._weights.indexOf(Math.max(...this._weights));
    return this._items[maxIndex];
  }

  toString(): string {
    return `SeededCategorical(items=${this._items.length}, context=${this.context})`;
  }

  getCategories(): Array<{ value: T; probability: number }> {
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