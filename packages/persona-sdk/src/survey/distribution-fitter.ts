import { DistributionFitting } from './types';
import { 
  NormalDistribution, 
  UniformDistribution, 
  ExponentialDistribution, 
  BetaDistribution 
} from '../distributions';
import { Distribution } from '../types/distribution';

/**
 * Fits statistical distributions to survey data
 */
export class DistributionFitter {
  
  /**
   * Default distribution candidates to try
   */
  private readonly defaultCandidates = [
    'normal',
    'uniform', 
    'exponential',
    'beta',
    'lognormal'
  ];

  /**
   * Fit best distribution to data
   */
  async fitDistribution(
    variable: string,
    values: number[],
    candidates?: string[]
  ): Promise<DistributionFitting> {
    const candidateList = candidates || this.defaultCandidates;
    const fittingResults = [];
    
    for (const candidateName of candidateList) {
      try {
        const result = await this.fitSingleDistribution(candidateName, values);
        if (result) {
          fittingResults.push({
            name: candidateName,
            ...result
          });
        }
      } catch (error) {
        // Skip distributions that fail to fit
        console.warn(`Failed to fit ${candidateName} to ${variable}:`, error);
      }
    }
    
    if (fittingResults.length === 0) {
      throw new Error(`Could not fit any distribution to variable ${variable}`);
    }
    
    // Sort by goodness of fit (higher is better)
    fittingResults.sort((a, b) => b.goodnessOfFit - a.goodnessOfFit);
    
    const bestFit = fittingResults[0];
    const alternatives = fittingResults.slice(1);
    
    return {
      variable,
      bestFit: {
        name: bestFit.name,
        distribution: bestFit.distribution,
        parameters: bestFit.parameters,
        goodnessOfFit: bestFit.goodnessOfFit
      },
      alternatives: alternatives.map(alt => ({
        name: alt.name,
        parameters: alt.parameters,
        goodnessOfFit: alt.goodnessOfFit
      }))
    };
  }

  /**
   * Fit a single distribution type to data
   */
  private async fitSingleDistribution(
    distributionName: string,
    values: number[]
  ): Promise<{
    distribution: Distribution;
    parameters: Record<string, number>;
    goodnessOfFit: number;
  } | null> {
    
    const cleanValues = values.filter(v => !isNaN(v) && isFinite(v));
    
    if (cleanValues.length < 3) {
      return null; // Need minimum sample size
    }
    
    switch (distributionName) {
      case 'normal':
        return this.fitNormal(cleanValues);
      
      case 'uniform':
        return this.fitUniform(cleanValues);
      
      case 'exponential':
        return this.fitExponential(cleanValues);
      
      case 'beta':
        return this.fitBeta(cleanValues);
      
      case 'lognormal':
        return this.fitLogNormal(cleanValues);
      
      default:
        return null;
    }
  }

  /**
   * Fit normal distribution using method of moments
   */
  private fitNormal(values: number[]) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);
    
    if (stdDev <= 0) return null;
    
    const distribution = new NormalDistribution(mean, stdDev);
    const goodnessOfFit = this.calculateGoodnessOfFit(values, distribution);
    
    return {
      distribution,
      parameters: { mean, stdDev },
      goodnessOfFit
    };
  }

  /**
   * Fit uniform distribution
   */
  private fitUniform(values: number[]) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) {
      // Single point - add small epsilon
      const eps = 0.001;
      const distribution = new UniformDistribution(min - eps, max + eps);
      return {
        distribution,
        parameters: { min: min - eps, max: max + eps },
        goodnessOfFit: 0.5 // Moderate fit for single point
      };
    }
    
    const distribution = new UniformDistribution(min, max);
    const goodnessOfFit = this.calculateGoodnessOfFit(values, distribution);
    
    return {
      distribution,
      parameters: { min, max },
      goodnessOfFit
    };
  }

  /**
   * Fit exponential distribution using maximum likelihood
   */
  private fitExponential(values: number[]) {
    // Exponential only works for positive values
    const positiveValues = values.filter(v => v > 0);
    
    if (positiveValues.length < values.length * 0.8) {
      return null; // Too many non-positive values
    }
    
    const mean = positiveValues.reduce((sum, v) => sum + v, 0) / positiveValues.length;
    const lambda = 1 / mean;
    
    if (lambda <= 0) return null;
    
    const distribution = new ExponentialDistribution(lambda);
    const goodnessOfFit = this.calculateGoodnessOfFit(positiveValues, distribution);
    
    return {
      distribution,
      parameters: { lambda },
      goodnessOfFit
    };
  }

  /**
   * Fit beta distribution using method of moments
   */
  private fitBeta(values: number[]) {
    // Beta works for values in [0, 1], so normalize first
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) return null;
    
    const normalizedValues = values.map(v => (v - min) / (max - min));
    
    const mean = normalizedValues.reduce((sum, v) => sum + v, 0) / normalizedValues.length;
    const variance = normalizedValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (normalizedValues.length - 1);
    
    if (variance <= 0 || mean <= 0 || mean >= 1) return null;
    
    // Method of moments estimation
    const commonFactor = (mean * (1 - mean)) / variance - 1;
    const alpha = mean * commonFactor;
    const beta = (1 - mean) * commonFactor;
    
    if (alpha <= 0 || beta <= 0) return null;
    
    const distribution = new BetaDistribution(alpha, beta);
    const goodnessOfFit = this.calculateGoodnessOfFit(normalizedValues, distribution);
    
    return {
      distribution,
      parameters: { alpha, beta, min, max },
      goodnessOfFit
    };
  }

  /**
   * Fit log-normal distribution
   */
  private fitLogNormal(values: number[]) {
    // Log-normal only works for positive values
    const positiveValues = values.filter(v => v > 0);
    
    if (positiveValues.length < values.length * 0.8) {
      return null; // Too many non-positive values
    }
    
    const logValues = positiveValues.map(v => Math.log(v));
    const meanLog = logValues.reduce((sum, v) => sum + v, 0) / logValues.length;
    const varLog = logValues.reduce((sum, v) => sum + (v - meanLog) ** 2, 0) / (logValues.length - 1);
    const sigmaLog = Math.sqrt(varLog);
    
    if (sigmaLog <= 0) return null;
    
    // Create a wrapper for log-normal using normal distribution of log values
    const distribution = new NormalDistribution(meanLog, sigmaLog);
    const goodnessOfFit = this.calculateGoodnessOfFit(logValues, distribution);
    
    return {
      distribution,
      parameters: { muLog: meanLog, sigmaLog },
      goodnessOfFit
    };
  }

  /**
   * Calculate goodness of fit using Kolmogorov-Smirnov test statistic
   */
  private calculateGoodnessOfFit(
    values: number[],
    distribution: Distribution
  ): number {
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    
    let maxDifference = 0;
    
    for (let i = 0; i < n; i++) {
      const empiricalCDF = (i + 1) / n;
      const theoreticalCDF = this.approximateCDF(sortedValues[i], distribution);
      
      const difference = Math.abs(empiricalCDF - theoreticalCDF);
      maxDifference = Math.max(maxDifference, difference);
    }
    
    // Convert KS statistic to goodness of fit score (1 - KS statistic)
    return Math.max(0, 1 - maxDifference);
  }

  /**
   * Approximate CDF for a distribution (simplified implementation)
   */
  private approximateCDF(value: number, distribution: Distribution): number {
    // This is a simplified implementation
    // In practice, you'd implement proper CDF calculations for each distribution
    
    // Generate samples and estimate CDF empirically
    const samples = Array.from({ length: 1000 }, () => distribution.sample());
    const sortedSamples = samples.sort((a, b) => a - b);
    
    // Find position of value in sorted samples
    let position = 0;
    for (const sample of sortedSamples) {
      if (sample <= value) {
        position++;
      } else {
        break;
      }
    }
    
    return position / sortedSamples.length;
  }
}