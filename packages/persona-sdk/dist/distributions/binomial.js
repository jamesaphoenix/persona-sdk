/**
 * Binomial distribution for discrete random variables
 * Represents the number of successes in n independent trials
 */
export class BinomialDistribution {
    n;
    p;
    constructor(n, p) {
        this.n = n;
        this.p = p;
        if (n <= 0 || !Number.isInteger(n)) {
            throw new Error('Number of trials (n) must be a positive integer');
        }
        if (p < 0 || p > 1) {
            throw new Error('Probability (p) must be between 0 and 1');
        }
    }
    sample() {
        let successes = 0;
        for (let i = 0; i < this.n; i++) {
            if (Math.random() < this.p) {
                successes++;
            }
        }
        return successes;
    }
    getMean() {
        return this.n * this.p;
    }
    getVariance() {
        return this.n * this.p * (1 - this.p);
    }
    mean() {
        return this.n * this.p;
    }
    variance() {
        return this.n * this.p * (1 - this.p);
    }
    getProbability(k) {
        if (k < 0 || k > this.n || !Number.isInteger(k)) {
            return 0;
        }
        // Binomial coefficient: C(n, k) = n! / (k! * (n-k)!)
        const binomialCoeff = this.factorial(this.n) / (this.factorial(k) * this.factorial(this.n - k));
        return binomialCoeff * Math.pow(this.p, k) * Math.pow(1 - this.p, this.n - k);
    }
    factorial(n) {
        if (n <= 1)
            return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}
//# sourceMappingURL=binomial.js.map