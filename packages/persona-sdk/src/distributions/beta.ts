import { BaseDistribution } from './base';

/**
 * Beta distribution using random-js
 */
export class BetaDistribution extends BaseDistribution<number> {
  constructor(
    /**
     * Alpha parameter (α > 0)
     */
    private readonly alpha: number,
    /**
     * Beta parameter (β > 0)  
     */
    private readonly beta: number,
    /**
     * Optional seed for reproducibility
     */
    seed?: number
  ) {
    super(seed);
    if (alpha <= 0 || beta <= 0) {
      throw new Error('Alpha and beta must be positive');
    }
  }

  /**
   * Sample from beta distribution
   * Using the relationship: Beta(α,β) = Gamma(α) / (Gamma(α) + Gamma(β))
   */
  sample(): number {
    // For now, use a simple approximation
    // TODO: Implement proper beta sampling or use a library
    const x = this.sampleGamma(this.alpha);
    const y = this.sampleGamma(this.beta);
    return x / (x + y);
  }

  /**
   * Simple gamma sampling for beta distribution
   */
  private sampleGamma(shape: number): number {
    // Simple implementation for shape >= 1
    if (shape >= 1) {
      const d = shape - 1/3;
      const c = 1/Math.sqrt(9 * d);
      
      while (true) {
        const z = this.random.real(-5, 5); // Approximate normal
        const v = Math.pow(1 + c * z, 3);
        
        if (v > 0) {
          const u = this.random.real(0, 1);
          if (u < 1 - 0.0331 * z * z * z * z) {
            return d * v;
          }
        }
      }
    } else {
      // For shape < 1, use scaling
      return this.sampleGamma(shape + 1) * Math.pow(this.random.real(0, 1), 1/shape);
    }
  }

  /**
   * Get the mean of the distribution
   */
  mean(): number {
    return this.alpha / (this.alpha + this.beta);
  }

  /**
   * Get the variance of the distribution
   */
  variance(): number {
    const sum = this.alpha + this.beta;
    return (this.alpha * this.beta) / (sum * sum * (sum + 1));
  }

  /**
   * Get string representation
   */
  toString(): string {
    return `Beta(α=${this.alpha}, β=${this.beta})`;
  }

  /**
   * Scale the beta distribution to a different range
   * 
   * @param min - Minimum value of the new range
   * @param max - Maximum value of the new range
   * @returns A new distribution that scales beta values to the specified range
   */
  scale(min: number, max: number): BetaDistribution {
    const self = this;
    // Create a custom distribution that scales the beta values
    class ScaledBetaDistribution extends BaseDistribution<number> {
      sample(): number {
        const betaValue = self.sample();
        return min + betaValue * (max - min);
      }
      
      mean(): number {
        const betaMean = self.mean();
        return min + betaMean * (max - min);
      }
      
      variance(): number {
        const betaVar = self.variance();
        return betaVar * (max - min) ** 2;
      }
      
      toString(): string {
        return `ScaledBeta(${min}, ${max}, α=${self.alpha}, β=${self.beta})`;
      }
    }
    
    return new ScaledBetaDistribution(self.seed) as any;
  }
}