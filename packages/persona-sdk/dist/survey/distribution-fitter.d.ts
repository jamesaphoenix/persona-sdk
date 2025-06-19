import { DistributionFitting } from './types';
/**
 * Fits statistical distributions to survey data
 */
export declare class DistributionFitter {
    /**
     * Default distribution candidates to try
     */
    private readonly defaultCandidates;
    /**
     * Fit best distribution to data
     */
    fitDistribution(variable: string, values: number[], candidates?: string[]): Promise<DistributionFitting>;
    /**
     * Fit a single distribution type to data
     */
    private fitSingleDistribution;
    /**
     * Fit normal distribution using method of moments
     */
    private fitNormal;
    /**
     * Fit uniform distribution
     */
    private fitUniform;
    /**
     * Fit exponential distribution using maximum likelihood
     */
    private fitExponential;
    /**
     * Fit beta distribution using method of moments
     */
    private fitBeta;
    /**
     * Fit log-normal distribution
     */
    private fitLogNormal;
    /**
     * Calculate goodness of fit using Kolmogorov-Smirnov test statistic
     */
    private calculateGoodnessOfFit;
    /**
     * Approximate CDF for a distribution (simplified implementation)
     */
    private approximateCDF;
}
//# sourceMappingURL=distribution-fitter.d.ts.map