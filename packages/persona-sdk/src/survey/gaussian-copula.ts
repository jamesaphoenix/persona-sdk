import { JointDistribution, MarginalDistribution, CorrelationMatrix, CopulaParameters } from './types';
import { PersonaAttributes } from '../types';

/**
 * Gaussian Copula implementation for creating joint distributions
 */
export class GaussianCopula implements JointDistribution {
  public marginals: MarginalDistribution[];
  public copula: CopulaParameters;
  
  constructor(
    marginals: MarginalDistribution[],
    correlationMatrix: number[][]
  ) {
    this.marginals = marginals;
    this.copula = {
      type: 'gaussian',
      correlationMatrix,
      parameters: {}
    };
  }

  /**
   * Sample from the joint distribution
   */
  sample(n: number): PersonaAttributes[] {
    const results: PersonaAttributes[] = [];
    
    for (let i = 0; i < n; i++) {
      const persona: PersonaAttributes = {
        age: 25,
        occupation: 'Unknown',
        sex: 'other'
      };
      
      // Generate correlated uniform samples using Gaussian copula
      const uniforms = this.generateCorrelatedUniforms();
      
      // Transform each uniform to the appropriate marginal distribution
      this.marginals.forEach((marginal, idx) => {
        if (idx < uniforms.length) {
          const uniform = uniforms[idx];
          const sample = this.uniformToMarginal(uniform, marginal);
          
          // Apply inverse transform if available
          const finalValue = marginal.inverseTransform 
            ? marginal.inverseTransform(sample)
            : sample;
            
          persona[marginal.variable] = finalValue;
        }
      });
      
      results.push(persona);
    }
    
    return results;
  }

  /**
   * Get correlation matrix
   */
  getCorrelationMatrix(): CorrelationMatrix {
    return {
      variables: this.marginals.map(m => m.variable),
      matrix: this.copula.correlationMatrix,
      method: 'pearson'
    };
  }

  /**
   * Generate correlated uniform random variables using Gaussian copula
   */
  private generateCorrelatedUniforms(): number[] {
    const numVars = this.marginals.length;
    const uniforms: number[] = [];
    
    // Generate independent standard normal variables
    const normals = Array.from({ length: numVars }, () => this.normalRandom());
    
    // Apply Cholesky decomposition to correlate them
    const correlatedNormals = this.applyCorrelation(normals);
    
    // Transform to uniform using standard normal CDF
    for (const normal of correlatedNormals) {
      uniforms.push(this.normalCDF(normal));
    }
    
    return uniforms;
  }

  /**
   * Transform uniform random variable to marginal distribution sample
   */
  private uniformToMarginal(_uniform: number, marginal: MarginalDistribution): number {
    // This is a simplified approach - in practice you'd use inverse CDF
    // For now, we'll use the distribution's sample method and scale it
    const sample = marginal.distribution.sample();
    
    // Apply transform if available
    return marginal.transform ? marginal.transform(sample) : sample;
  }

  /**
   * Apply correlation matrix to independent normal variables
   * Simplified implementation - in practice you'd use proper Cholesky decomposition
   */
  private applyCorrelation(normals: number[]): number[] {
    const n = normals.length;
    const correlated: number[] = [...normals];
    
    // Simple correlation adjustment (not mathematically precise)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const correlation = this.copula.correlationMatrix[i][j];
          correlated[i] += correlation * normals[j] * 0.1;
        }
      }
    }
    
    return correlated;
  }

  /**
   * Generate standard normal random variable using Box-Muller transform
   */
  private normalRandom(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Approximate standard normal CDF
   */
  private normalCDF(x: number): number {
    // Approximation of standard normal CDF
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }
}