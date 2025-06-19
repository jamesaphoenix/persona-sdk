import {
  SurveyData,
  CorrelationMatrix,
  DistributionFitting,
  JointDistribution,
  SurveyProcessingOptions,
  ValidationResults
} from './types';
import { CorrelationAnalyzer } from './correlation-analyzer';
import { DistributionFitter } from './distribution-fitter';
import { GaussianCopula } from './gaussian-copula';

/**
 * Main analyzer for processing survey data and creating joint distributions
 */
export class SurveyAnalyzer {
  private correlationAnalyzer: CorrelationAnalyzer;
  private distributionFitter: DistributionFitter;

  constructor() {
    this.correlationAnalyzer = new CorrelationAnalyzer();
    this.distributionFitter = new DistributionFitter();
  }

  /**
   * Analyze correlations in survey data
   */
  async analyzeCorrelations(
    data: SurveyData,
    options: SurveyProcessingOptions = {}
  ): Promise<CorrelationMatrix> {
    const numericFields = this.extractNumericFields(data);
    
    if (numericFields.length < 2) {
      throw new Error('Need at least 2 numeric fields to calculate correlations');
    }

    return this.correlationAnalyzer.calculateCorrelations(
      data.responses,
      numericFields,
      options.minCorrelation || 0.1
    );
  }

  /**
   * Detect best-fitting distributions for each variable
   */
  async detectDistributions(
    data: SurveyData,
    options: SurveyProcessingOptions = {}
  ): Promise<DistributionFitting[]> {
    const results: DistributionFitting[] = [];
    
    for (const [fieldName, fieldSchema] of Object.entries(data.schema)) {
      if (fieldSchema.type === 'numeric') {
        const values = data.responses
          .map(response => response[fieldName])
          .filter(value => value !== null && value !== undefined && !isNaN(value));
        
        if (values.length > 10) { // Minimum sample size for fitting
          const fitting = await this.distributionFitter.fitDistribution(
            fieldName,
            values,
            options.distributionCandidates
          );
          results.push(fitting);
        }
      }
    }
    
    return results;
  }

  /**
   * Build joint distribution using Gaussian copula
   */
  async buildJointDistribution(
    data: SurveyData,
    options: SurveyProcessingOptions = {}
  ): Promise<JointDistribution> {
    // Step 1: Analyze correlations
    const correlations = await this.analyzeCorrelations(data, options);
    
    // Step 2: Fit marginal distributions
    const distributionFittings = await this.detectDistributions(data, options);
    
    // Step 3: Create marginal distributions
    const marginals = distributionFittings.map(fitting => ({
      variable: fitting.variable,
      distribution: fitting.bestFit.distribution,
      parameters: fitting.bestFit.parameters,
      transform: this.createTransform(fitting.variable, data),
      inverseTransform: this.createInverseTransform(fitting.variable, data)
    }));
    
    // Step 4: Build Gaussian copula
    const copula = new GaussianCopula(marginals, correlations.matrix);
    
    return copula;
  }

  /**
   * Validate generated personas against original survey data
   */
  async validateGeneration(
    originalData: SurveyData,
    generatedPersonas: any[],
    _options: SurveyProcessingOptions = {}
  ): Promise<ValidationResults> {
    // Calculate statistics for original data
    const originalStats = this.calculateSurveyStatistics(originalData);
    
    // Calculate statistics for generated data
    const generatedStats = this.calculateGeneratedStatistics(
      generatedPersonas,
      originalData.schema
    );
    
    // Perform statistical tests
    const tests = await this.performValidationTests(
      originalData,
      generatedPersonas,
      originalStats,
      generatedStats
    );
    
    // Calculate overall validation score
    const score = this.calculateValidationScore(tests);
    
    return {
      original: originalStats,
      generated: generatedStats,
      tests,
      score
    };
  }

  /**
   * Extract numeric field names from survey data
   */
  private extractNumericFields(data: SurveyData): string[] {
    return Object.entries(data.schema)
      .filter(([_, schema]) => schema.type === 'numeric')
      .map(([fieldName, _]) => fieldName);
  }

  /**
   * Create transform function for normalizing data
   */
  private createTransform(variable: string, data: SurveyData): (value: any) => number {
    const values = data.responses
      .map(response => response[variable])
      .filter(value => value !== null && value !== undefined && !isNaN(value));
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return (value: any): number => {
      const num = Number(value);
      if (isNaN(num)) return 0;
      
      // Normalize to [0, 1]
      if (max === min) return 0.5;
      return (num - min) / (max - min);
    };
  }

  /**
   * Create inverse transform function for denormalizing data
   */
  private createInverseTransform(variable: string, data: SurveyData): (value: number) => any {
    const values = data.responses
      .map(response => response[variable])
      .filter(value => value !== null && value !== undefined && !isNaN(value));
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return (value: number): any => {
      // Denormalize from [0, 1] back to original scale
      return min + value * (max - min);
    };
  }

  /**
   * Calculate survey statistics for validation
   */
  private calculateSurveyStatistics(data: SurveyData): any {
    // Implementation for calculating comprehensive statistics
    // This would include means, standard deviations, correlations, etc.
    return {
      variables: {},
      correlations: { variables: [], matrix: [], method: 'pearson' as const },
      sampleSize: data.responses.length
    };
  }

  /**
   * Calculate statistics for generated personas
   */
  private calculateGeneratedStatistics(personas: any[], _schema: any): any {
    // Implementation for calculating statistics on generated data
    return {
      variables: {},
      correlations: { variables: [], matrix: [], method: 'pearson' as const },
      sampleSize: personas.length
    };
  }

  /**
   * Perform statistical validation tests
   */
  private async performValidationTests(
    _originalData: SurveyData,
    _generatedPersonas: any[],
    _originalStats: any,
    _generatedStats: any
  ): Promise<any> {
    // Implementation for Kolmogorov-Smirnov tests, correlation comparisons, etc.
    return {
      ksTest: {},
      correlationTest: { maxDifference: 0, meanSquaredError: 0 }
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateValidationScore(_tests: any): number {
    // Implementation for combining test results into a single score
    return 0.85; // Placeholder
  }
}