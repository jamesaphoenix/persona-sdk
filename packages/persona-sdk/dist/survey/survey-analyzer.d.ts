import { SurveyData, CorrelationMatrix, DistributionFitting, JointDistribution, SurveyProcessingOptions, ValidationResults } from './types';
/**
 * Main analyzer for processing survey data and creating joint distributions
 */
export declare class SurveyAnalyzer {
    private correlationAnalyzer;
    private distributionFitter;
    constructor();
    /**
     * Analyze correlations in survey data
     */
    analyzeCorrelations(data: SurveyData, options?: SurveyProcessingOptions): Promise<CorrelationMatrix>;
    /**
     * Detect best-fitting distributions for each variable
     */
    detectDistributions(data: SurveyData, options?: SurveyProcessingOptions): Promise<DistributionFitting[]>;
    /**
     * Build joint distribution using Gaussian copula
     */
    buildJointDistribution(data: SurveyData, options?: SurveyProcessingOptions): Promise<JointDistribution>;
    /**
     * Validate generated personas against original survey data
     */
    validateGeneration(originalData: SurveyData, generatedPersonas: any[], _options?: SurveyProcessingOptions): Promise<ValidationResults>;
    /**
     * Extract numeric field names from survey data
     */
    private extractNumericFields;
    /**
     * Create transform function for normalizing data
     */
    private createTransform;
    /**
     * Create inverse transform function for denormalizing data
     */
    private createInverseTransform;
    /**
     * Calculate survey statistics for validation
     */
    private calculateSurveyStatistics;
    /**
     * Calculate statistics for generated personas
     */
    private calculateGeneratedStatistics;
    /**
     * Perform statistical validation tests
     */
    private performValidationTests;
    /**
     * Calculate overall validation score
     */
    private calculateValidationScore;
}
//# sourceMappingURL=survey-analyzer.d.ts.map