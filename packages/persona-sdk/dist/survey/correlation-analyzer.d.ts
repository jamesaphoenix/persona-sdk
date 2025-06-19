import { CorrelationMatrix } from './types';
/**
 * Analyzes correlations between survey variables
 */
export declare class CorrelationAnalyzer {
    /**
     * Calculate correlation matrix for numeric variables
     */
    calculateCorrelations(responses: Record<string, any>[], variables: string[], _minCorrelation?: number): Promise<CorrelationMatrix>;
    /**
     * Calculate Spearman rank correlations for ordinal data
     */
    calculateSpearmanCorrelations(responses: Record<string, any>[], variables: string[]): Promise<CorrelationMatrix>;
    /**
     * Detect non-linear correlations using mutual information
     */
    detectNonLinearCorrelations(responses: Record<string, any>[], variables: string[]): Promise<CorrelationMatrix>;
    /**
     * Create data matrix from responses
     */
    private createDataMatrix;
    /**
     * Calculate Pearson correlation coefficients
     */
    private calculatePearsonCorrelations;
    /**
     * Calculate Pearson correlation between two variables
     */
    private pearsonCorrelation;
    /**
     * Calculate p-values for correlation significance
     */
    private calculatePValues;
    /**
     * Rank transform for Spearman correlation
     */
    private rankTransform;
    /**
     * Calculate mutual information matrix (simplified implementation)
     */
    private calculateMutualInformation;
    /**
     * Calculate mutual information between two variables (simplified)
     */
    private mutualInformation;
    /**
     * Approximate p-value for t-test (simplified)
     */
    private approximateTTestPValue;
}
//# sourceMappingURL=correlation-analyzer.d.ts.map