/**
 * Binomial distribution for discrete random variables
 * Represents the number of successes in n independent trials
 */
export declare class BinomialDistribution {
    private n;
    private p;
    constructor(n: number, p: number);
    sample(): number;
    getMean(): number;
    getVariance(): number;
    mean(): number;
    variance(): number;
    getProbability(k: number): number;
    private factorial;
}
//# sourceMappingURL=binomial.d.ts.map