import { Random } from 'random-js';
import { Distribution } from '../types';
/**
 * Base class for all distributions
 */
export declare abstract class BaseDistribution<T = number> implements Distribution<T> {
    protected random: Random;
    readonly seed?: number;
    constructor(seed?: number);
    abstract sample(): T;
    abstract mean(): T;
    abstract toString(): string;
}
//# sourceMappingURL=base.d.ts.map