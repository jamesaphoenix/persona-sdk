import { CorrelationMatrix } from './types';

/**
 * Analyzes correlations between survey variables
 */
export class CorrelationAnalyzer {
  
  /**
   * Calculate correlation matrix for numeric variables
   */
  async calculateCorrelations(
    responses: Record<string, any>[],
    variables: string[],
    _minCorrelation: number = 0.1
  ): Promise<CorrelationMatrix> {
    // Extract data matrix
    const dataMatrix = this.createDataMatrix(responses, variables);
    
    // Calculate Pearson correlations
    const correlationMatrix = this.calculatePearsonCorrelations(dataMatrix);
    
    // Calculate p-values
    const pValues = this.calculatePValues(dataMatrix, correlationMatrix);
    
    return {
      variables,
      matrix: correlationMatrix,
      pValues,
      method: 'pearson'
    };
  }

  /**
   * Calculate Spearman rank correlations for ordinal data
   */
  async calculateSpearmanCorrelations(
    responses: Record<string, any>[],
    variables: string[]
  ): Promise<CorrelationMatrix> {
    const dataMatrix = this.createDataMatrix(responses, variables);
    const rankedMatrix = this.rankTransform(dataMatrix);
    const correlationMatrix = this.calculatePearsonCorrelations(rankedMatrix);
    
    return {
      variables,
      matrix: correlationMatrix,
      method: 'spearman'
    };
  }

  /**
   * Detect non-linear correlations using mutual information
   */
  async detectNonLinearCorrelations(
    responses: Record<string, any>[],
    variables: string[]
  ): Promise<CorrelationMatrix> {
    const dataMatrix = this.createDataMatrix(responses, variables);
    const miMatrix = this.calculateMutualInformation(dataMatrix);
    
    return {
      variables,
      matrix: miMatrix,
      method: 'mutual_information' as any
    };
  }

  /**
   * Create data matrix from responses
   */
  private createDataMatrix(
    responses: Record<string, any>[],
    variables: string[]
  ): number[][] {
    return responses.map(response => 
      variables.map(variable => {
        const value = response[variable];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      })
    );
  }

  /**
   * Calculate Pearson correlation coefficients
   */
  private calculatePearsonCorrelations(dataMatrix: number[][]): number[][] {
    const n = dataMatrix[0].length; // number of variables
    const correlationMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1.0;
        } else {
          const xi = dataMatrix.map(row => row[i]);
          const xj = dataMatrix.map(row => row[j]);
          correlationMatrix[i][j] = this.pearsonCorrelation(xi, xj);
        }
      }
    }
    
    return correlationMatrix;
  }

  /**
   * Calculate Pearson correlation between two variables
   */
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    
    if (n !== y.length || n === 0) return 0;
    
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      
      numerator += dx * dy;
      sumXSquared += dx * dx;
      sumYSquared += dy * dy;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  /**
   * Calculate p-values for correlation significance
   */
  private calculatePValues(
    dataMatrix: number[][],
    correlationMatrix: number[][]
  ): number[][] {
    const n = dataMatrix.length; // sample size
    const numVars = correlationMatrix.length;
    const pValues: number[][] = Array(numVars).fill(null).map(() => Array(numVars).fill(0));
    
    for (let i = 0; i < numVars; i++) {
      for (let j = 0; j < numVars; j++) {
        if (i === j) {
          pValues[i][j] = 0;
        } else {
          const r = correlationMatrix[i][j];
          const t = r * Math.sqrt((n - 2) / (1 - r * r));
          
          // Approximate p-value using t-distribution
          pValues[i][j] = this.approximateTTestPValue(t, n - 2);
        }
      }
    }
    
    return pValues;
  }

  /**
   * Rank transform for Spearman correlation
   */
  private rankTransform(dataMatrix: number[][]): number[][] {
    const n = dataMatrix.length;
    const numVars = dataMatrix[0].length;
    const rankedMatrix: number[][] = Array(n).fill(null).map(() => Array(numVars).fill(0));
    
    for (let j = 0; j < numVars; j++) {
      const column = dataMatrix.map((row, i) => ({ value: row[j], index: i }));
      column.sort((a, b) => a.value - b.value);
      
      for (let rank = 0; rank < column.length; rank++) {
        rankedMatrix[column[rank].index][j] = rank + 1;
      }
    }
    
    return rankedMatrix;
  }

  /**
   * Calculate mutual information matrix (simplified implementation)
   */
  private calculateMutualInformation(dataMatrix: number[][]): number[][] {
    const numVars = dataMatrix[0].length;
    const miMatrix: number[][] = Array(numVars).fill(null).map(() => Array(numVars).fill(0));
    
    for (let i = 0; i < numVars; i++) {
      for (let j = 0; j < numVars; j++) {
        if (i === j) {
          miMatrix[i][j] = 1.0;
        } else {
          const xi = dataMatrix.map(row => row[i]);
          const xj = dataMatrix.map(row => row[j]);
          miMatrix[i][j] = this.mutualInformation(xi, xj);
        }
      }
    }
    
    return miMatrix;
  }

  /**
   * Calculate mutual information between two variables (simplified)
   */
  private mutualInformation(x: number[], y: number[]): number {
    // This is a simplified implementation
    // In practice, you'd want to use proper binning and histogram estimation
    const correlation = Math.abs(this.pearsonCorrelation(x, y));
    
    // Convert correlation to mutual information approximation
    // MI = -0.5 * ln(1 - r²) for bivariate normal
    if (correlation >= 0.999) return 1.0;
    return -0.5 * Math.log(1 - correlation * correlation);
  }

  /**
   * Approximate p-value for t-test (simplified)
   */
  private approximateTTestPValue(t: number, _df: number): number {
    // Simplified p-value approximation
    // In practice, you'd use a proper t-distribution CDF
    const absT = Math.abs(t);
    
    if (absT > 3) return 0.001;
    if (absT > 2.5) return 0.01;
    if (absT > 2) return 0.05;
    if (absT > 1.5) return 0.1;
    
    return 0.2;
  }
}