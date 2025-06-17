import { Random, MersenneTwister19937 } from 'random-js';
/**
 * Base class for all distributions
 */
export class BaseDistribution {
    random;
    seed;
    constructor(seed) {
        this.seed = seed;
        const engine = seed !== undefined
            ? MersenneTwister19937.seed(seed)
            : MersenneTwister19937.autoSeed();
        this.random = new Random(engine);
    }
}
//# sourceMappingURL=base.js.map