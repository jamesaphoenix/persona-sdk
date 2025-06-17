/**
 * Metrics for evaluating prompt optimization results
 * Based on DSPy's metrics system
 */
import type { Example, Prediction, Metric } from '../types/index.js';
/**
 * Checks if the predicted answer exactly matches the expected answer
 * Supports both string and array answers with optional fraction matching
 */
export declare function answerExactMatch(example: Example, prediction: Prediction, trace?: any, frac?: number): number;
/**
 * Checks if the predicted answer appears in any of the provided passages/context
 */
export declare function answerPassageMatch(example: Example, prediction: Prediction, trace?: any): number;
/**
 * Fuzzy answer matching using edit distance with configurable threshold
 */
export declare function answerFuzzyMatch(example: Example, prediction: Prediction, trace?: any, threshold?: number): number;
/**
 * Checks if predicted answer contains the expected answer as a substring
 */
export declare function answerContainsMatch(example: Example, prediction: Prediction, trace?: any): number;
/**
 * Numeric answer matching with tolerance
 */
export declare function answerNumericMatch(example: Example, prediction: Prediction, trace?: any, tolerance?: number): number;
/**
 * Creates a composite metric that combines multiple metrics
 */
export declare function createCompositeMetric(metrics: {
    metric: Metric;
    weight: number;
}[]): Metric;
export declare const ExactMatch: Metric;
export declare const PassageMatch: Metric;
export declare const FuzzyMatch: Metric;
export declare const ContainsMatch: Metric;
export declare const NumericMatch: Metric;
/**
 * Factory function to create custom exact match metric with specific fraction
 */
export declare function createExactMatchMetric(frac?: number): Metric;
/**
 * Factory function to create custom fuzzy match metric with specific threshold
 */
export declare function createFuzzyMatchMetric(threshold?: number): Metric;
/**
 * Factory function to create custom numeric match metric with specific tolerance
 */
export declare function createNumericMatchMetric(tolerance?: number): Metric;
//# sourceMappingURL=index.d.ts.map