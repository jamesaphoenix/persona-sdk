import { JointDistribution, MarginalDistribution, CorrelationMatrix, CopulaParameters } from './types';
import { PersonaAttributes } from '../types';
/**
 * Gaussian Copula implementation for creating joint distributions
 */
export declare class GaussianCopula implements JointDistribution {
    marginals: MarginalDistribution[];
    copula: CopulaParameters;
    constructor(marginals: MarginalDistribution[], correlationMatrix: number[][]);
    /**
     * Sample from the joint distribution
     */
    sample(n: number): PersonaAttributes[];
    /**
     * Get correlation matrix
     */
    getCorrelationMatrix(): CorrelationMatrix;
    /**
     * Generate correlated uniform random variables using Gaussian copula
     */
    private generateCorrelatedUniforms;
    /**
     * Transform uniform random variable to marginal distribution sample
     */
    private uniformToMarginal;
    /**
     * Apply correlation matrix to independent normal variables
     * Simplified implementation - in practice you'd use proper Cholesky decomposition
     */
    private applyCorrelation;
    /**
     * Generate standard normal random variable using Box-Muller transform
     */
    private normalRandom;
    /**
     * Approximate standard normal CDF
     */
    private normalCDF;
}
//# sourceMappingURL=gaussian-copula.d.ts.map