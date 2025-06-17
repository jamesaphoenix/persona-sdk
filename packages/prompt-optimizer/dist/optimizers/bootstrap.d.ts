/**
 * Bootstrap Few-Shot Optimizer
 * Based on DSPy's BootstrapFewShot implementation
 */
import type { Module, Example, BootstrapConfig, OptimizationResult } from '../types/index.js';
import { BaseOptimizer } from '../types/index.js';
export declare class BootstrapOptimizer extends BaseOptimizer {
    private bootstrapConfig;
    constructor(config?: BootstrapConfig);
    optimize(student: Module, trainset: Example[], valset?: Example[]): Promise<OptimizationResult>;
    /**
     * Select the best labeled examples from the training set
     */
    private selectLabeledExamples;
    /**
     * Generate bootstrapped examples using a teacher model
     */
    private generateBootstrappedExamples;
    /**
     * Create a prompt for the teacher model to generate examples
     */
    private createTeacherPrompt;
    /**
     * Create an optimized module with demonstrations
     */
    private createOptimizedModule;
    /**
     * Create a demonstration prompt from examples
     */
    private createDemonstrationPrompt;
    /**
     * Get the configuration for this optimizer
     */
    getBootstrapConfig(): Required<BootstrapConfig>;
}
//# sourceMappingURL=bootstrap.d.ts.map