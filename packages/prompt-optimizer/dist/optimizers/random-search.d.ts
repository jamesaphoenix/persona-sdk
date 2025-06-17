/**
 * Random Search Optimizer
 * Based on DSPy's BootstrapFewShotWithRandomSearch implementation
 */
import type { Module, Example, RandomSearchConfig, OptimizationResult, LanguageModel } from '../types/index.js';
import { BaseOptimizer } from '../types/index.js';
export declare class RandomSearchOptimizer extends BaseOptimizer {
    private randomSearchConfig;
    private llm?;
    constructor(config?: RandomSearchConfig, llm?: LanguageModel);
    optimize(module: Module, trainset: Example[], valset?: Example[]): Promise<OptimizationResult>;
    /**
     * Generate initial candidates using different strategies
     */
    private generateInitialCandidates;
    /**
     * Generate a candidate by mutating the original prompt
     */
    private generateMutationCandidate;
    /**
     * Generate a candidate by combining elements from multiple sources
     */
    private generateCrossoverCandidate;
    /**
     * Generate a completely random candidate
     */
    private generateRandomCandidate;
    /**
     * Sample random demonstrations from the training set
     */
    private sampleDemonstrations;
    /**
     * Mutate a prompt using the language model
     */
    private mutatePrompt;
    /**
     * Combine prompt elements in a crossover fashion
     */
    private combinePromptElements;
    /**
     * Randomize the prompt structure
     */
    private randomizePromptStructure;
    /**
     * Format demonstrations for inclusion in prompts
     */
    private formatDemonstrations;
    /**
     * Create a module from a search candidate
     */
    private createModuleFromCandidate;
    /**
     * Get the configuration for this optimizer
     */
    getRandomSearchConfig(): Required<RandomSearchConfig>;
}
//# sourceMappingURL=random-search.d.ts.map