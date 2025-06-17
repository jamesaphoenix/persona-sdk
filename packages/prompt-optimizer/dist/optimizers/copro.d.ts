/**
 * COPRO (Compositional Prompt Optimizer)
 * Based on DSPy's COPRO implementation
 */
import type { Module, Example, COPROConfig, OptimizationResult, LanguageModel } from '../types/index.js';
import { BaseOptimizer } from '../types/index.js';
export declare class COPROOptimizer extends BaseOptimizer {
    private coproConfig;
    private llm;
    constructor(llm: LanguageModel, config?: COPROConfig);
    optimize(module: Module, trainset: Example[], valset?: Example[]): Promise<OptimizationResult>;
    /**
     * Generate new prompt candidates based on current best candidates
     */
    private generatePromptCandidates;
    /**
     * Generate a variation of a prompt
     */
    private generatePromptVariation;
    /**
     * Sample random examples from the training set
     */
    private sampleExamples;
    /**
     * Format examples for prompt generation context
     */
    private formatExamplesForPromptGeneration;
    /**
     * Evaluate a list of prompt candidates
     */
    private evaluateCandidates;
    /**
     * Get the configuration for this optimizer
     */
    getCOPROConfig(): Required<COPROConfig>;
}
//# sourceMappingURL=copro.d.ts.map