/**
 * Ensemble Optimizer
 * Combines multiple optimized modules for improved performance
 */
import type { Module, Example, Prediction, EnsembleConfig, OptimizationResult, Metric } from '../types/index.js';
export declare class EnsembleOptimizer {
    private config;
    private modules;
    constructor(config: EnsembleConfig);
    /**
     * Create an ensemble from multiple optimization results
     */
    static fromOptimizationResults(results: OptimizationResult[], config?: Partial<EnsembleConfig>): EnsembleOptimizer;
    /**
     * Create an ensemble by optimizing multiple modules
     */
    static fromMultipleOptimizers(baseModule: Module, trainset: Example[], optimizers: Array<{
        optimize: (module: Module, trainset: Example[]) => Promise<OptimizationResult>;
    }>, config?: Partial<EnsembleConfig>): Promise<EnsembleOptimizer>;
    /**
     * Add a module to the ensemble
     */
    addModule(module: Module): void;
    /**
     * Predict using the ensemble
     */
    predict(input: string | Record<string, any>): Promise<Prediction>;
    /**
     * Evaluate the ensemble on a dataset
     */
    evaluate(dataset: Example[], metric: Metric): Promise<{
        score: number;
        individualScores: number[];
        moduleScores: number[][];
    }>;
    /**
     * Get ensemble statistics
     */
    getStats(): {
        size: number;
        moduleCount: number;
        config: Required<EnsembleConfig>;
    };
    /**
     * Default reducer for combining outputs
     */
    private defaultReducer;
    /**
     * Majority voting for categorical outputs
     */
    private majorityVote;
    /**
     * Clone the ensemble
     */
    clone(): EnsembleOptimizer;
}
//# sourceMappingURL=ensemble.d.ts.map