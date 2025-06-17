import { Random, MersenneTwister19937 } from 'random-js';
import { Distribution } from '../types';

/**
 * Base class for all distributions
 */
export abstract class BaseDistribution<T = number> implements Distribution<T> {
  protected random: Random;

  constructor(seed?: number) {
    const engine = seed !== undefined 
      ? MersenneTwister19937.seed(seed)
      : MersenneTwister19937.autoSeed();
    this.random = new Random(engine);
  }

  abstract sample(): T;
  abstract mean(): T;
  abstract toString(): string;
}