import { Distribution } from '../types/distribution';
import { PersonaAttributes } from '../types';
/**
 * Survey data structure for ingestion
 */
export interface SurveyData {
    /** Array of survey responses */
    responses: Record<string, any>[];
    /** Schema describing each field */
    schema: SurveySchema;
    /** Metadata about the survey */
    metadata: {
        sampleSize: number;
        demographics: Record<string, any>;
        source: string;
        dateCollected?: string;
        methodology?: string;
    };
}
/**
 * Schema for survey fields
 */
export interface SurveySchema {
    [fieldName: string]: {
        type: 'numeric' | 'categorical' | 'ordinal' | 'boolean';
        description: string;
        scale?: [number, number];
        categories?: string[];
        required?: boolean;
    };
}
/**
 * Correlation matrix between variables
 */
export interface CorrelationMatrix {
    /** Variable names */
    variables: string[];
    /** Correlation coefficients matrix */
    matrix: number[][];
    /** P-values for significance testing */
    pValues?: number[][];
    /** Correlation method used */
    method: 'pearson' | 'spearman' | 'kendall';
}
/**
 * Distribution fitting results
 */
export interface DistributionFitting {
    /** Variable name */
    variable: string;
    /** Best fitting distribution */
    bestFit: {
        name: string;
        distribution: Distribution;
        parameters: Record<string, number>;
        goodnessOfFit: number;
    };
    /** Alternative distributions considered */
    alternatives: Array<{
        name: string;
        parameters: Record<string, number>;
        goodnessOfFit: number;
    }>;
}
/**
 * Marginal distribution for a single variable
 */
export interface MarginalDistribution {
    variable: string;
    distribution: Distribution;
    parameters: Record<string, number>;
    transform?: (value: any) => number;
    inverseTransform?: (value: number) => any;
}
/**
 * Joint distribution using copula approach
 */
export interface JointDistribution {
    /** Marginal distributions for each variable */
    marginals: MarginalDistribution[];
    /** Copula parameters */
    copula: CopulaParameters;
    /** Sample from joint distribution */
    sample(n: number): PersonaAttributes[];
    /** Get correlation matrix */
    getCorrelationMatrix(): CorrelationMatrix;
}
/**
 * Copula parameters for joint distribution
 */
export interface CopulaParameters {
    type: 'gaussian' | 'student-t' | 'archimedean';
    correlationMatrix: number[][];
    parameters?: Record<string, number>;
}
/**
 * Survey processing options
 */
export interface SurveyProcessingOptions {
    /** Minimum correlation threshold to consider */
    minCorrelation?: number;
    /** Maximum number of variables to include */
    maxVariables?: number;
    /** Whether to use LLM for semantic interpretation */
    useLLM?: boolean;
    /** LLM API key if using LLM */
    apiKey?: string;
    /** Custom distribution candidates */
    distributionCandidates?: string[];
    /** Validation split ratio */
    validationSplit?: number;
}
/**
 * Validation results for generated personas
 */
export interface ValidationResults {
    /** Original survey statistics */
    original: SurveyStatistics;
    /** Generated persona statistics */
    generated: SurveyStatistics;
    /** Statistical tests results */
    tests: {
        ksTest: Record<string, {
            statistic: number;
            pValue: number;
        }>;
        correlationTest: {
            maxDifference: number;
            meanSquaredError: number;
        };
    };
    /** Overall validation score */
    score: number;
}
/**
 * Survey statistics for validation
 */
export interface SurveyStatistics {
    /** Summary statistics for each variable */
    variables: Record<string, {
        mean?: number;
        std?: number;
        min?: number;
        max?: number;
        frequencies?: Record<string, number>;
    }>;
    /** Correlation matrix */
    correlations: CorrelationMatrix;
    /** Sample size */
    sampleSize: number;
}
//# sourceMappingURL=types.d.ts.map