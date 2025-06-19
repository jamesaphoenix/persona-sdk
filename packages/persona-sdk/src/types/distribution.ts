/**
 * Distribution type definitions
 */

/**
 * Base distribution interface
 */
export interface Distribution<T = number> {
  sample(): T;
  mean(): T;
  variance?(): number;
  toString(): string;
}

/**
 * Numeric distribution with additional statistical methods
 */
export interface NumericDistribution extends Distribution<number> {
  variance(): number;
  stdDev(): number;
  median?(): number;
  mode?(): number;
  percentile?(p: number): number;
}

/**
 * Categorical distribution for discrete values
 */
export interface CategoricalDistribution<T> extends Distribution<T> {
  getCategories(): Array<{ value: T; probability: number }>;
  getProbability(value: T): number;
}

/**
 * Distribution with seed support
 */
export interface SeededDistribution<T> extends Distribution<T> {
  setSeed(seed: number): void;
  getSeed(): number | undefined;
}

/**
 * Conditional distribution that depends on other values
 */
export interface ConditionalDistribution<T, D = any> extends Distribution<T> {
  sample(dependencies: D): T;
  getDependencies(): string[];
}

/**
 * Correlated distribution
 */
export interface CorrelatedDistribution<T> extends Distribution<T> {
  setCorrelation(attribute: string, correlation: number): void;
  getCorrelations(): Map<string, number>;
}

/**
 * Distribution factory type
 */
export type DistributionFactory<T> = {
  create(params: any): Distribution<T>;
  fromJSON(json: any): Distribution<T>;
};

/**
 * Distribution type discriminator
 */
export enum DistributionType {
  Normal = 'normal',
  Uniform = 'uniform',
  Exponential = 'exponential',
  Beta = 'beta',
  Categorical = 'categorical',
  Custom = 'custom'
}

/**
 * Serialized distribution format
 */
export interface SerializedDistribution {
  type: DistributionType;
  params: Record<string, any>;
  seed?: number;
}