/**
 * Core types for the prompt optimizer package
 */
export interface Example {
    /** Input data for the example */
    input: string | Record<string, any>;
    /** Expected output for the example */
    output: string | Record<string, any>;
    /** Optional metadata for the example */
    metadata?: Record<string, any>;
}
export interface Prediction {
    /** Generated output from the model */
    output: string | Record<string, any>;
    /** Confidence score if available */
    confidence?: number;
    /** Optional reasoning trace */
    _trace?: any;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
export interface Metric {
    /** Name of the metric */
    name: string;
    /**
     * Evaluate a prediction against an example
     * @param example - The ground truth example
     * @param prediction - The model's prediction
     * @param trace - Optional execution trace
     * @returns A score (higher is better)
     */
    evaluate(example: Example, prediction: Prediction, _trace?: any): number;
}
export interface Module {
    /** Generate a prediction for the given input */
    predict(input: string | Record<string, any>): Promise<Prediction>;
    /** Get the current prompt/configuration */
    getPrompt(): string;
    /** Set the prompt/configuration */
    setPrompt(prompt: string): void;
    /** Clone the module */
    clone(): Module;
}
export interface LanguageModel {
    /** Generate text completion */
    generate(prompt: string, options?: GenerationOptions): Promise<string>;
    /** Get model name/identifier */
    getModelName(): string;
}
export interface GenerationOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}
export interface OptimizerConfig {
    /** Maximum number of optimization rounds */
    maxRounds?: number;
    /** Metric to optimize for */
    metric?: Metric;
    /** Early stopping threshold */
    earlyStoppingThreshold?: number;
    /** Random seed for reproducibility */
    seed?: number;
    /** Verbose logging */
    verbose?: boolean;
}
export interface OptimizationResult {
    /** The optimized module */
    optimizedModule: Module;
    /** Final score achieved */
    finalScore: number;
    /** Number of rounds completed */
    roundsCompleted: number;
    /** Optimization history */
    history: OptimizationRound[];
    /** Total optimization time in milliseconds */
    optimizationTimeMs: number;
}
export interface OptimizationRound {
    /** Round number */
    round: number;
    /** Score achieved in this round */
    score: number;
    /** Prompt used in this round */
    prompt: string;
    /** Time taken for this round */
    timeMs: number;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
export interface BootstrapConfig extends OptimizerConfig {
    /** Maximum number of labeled examples to use */
    maxLabeled?: number;
    /** Maximum number of bootstrapped examples to generate */
    maxBootstrapped?: number;
    /** Minimum score threshold for accepting bootstrapped examples */
    bootstrapThreshold?: number;
    /** Teacher model for generating examples */
    teacherModel?: LanguageModel;
}
export interface COPROConfig extends OptimizerConfig {
    /** Breadth of search (number of candidates per round) */
    breadth?: number;
    /** Depth of search (number of rounds) */
    depth?: number;
    /** Temperature for prompt generation */
    temperature?: number;
    /** Number of prompt variations to generate */
    numVariations?: number;
}
export interface RandomSearchConfig extends OptimizerConfig {
    /** Number of random candidates to try */
    numCandidates?: number;
    /** Budget for optimization (e.g., number of evaluations) */
    budget?: number;
    /** Strategy for generating random prompts */
    strategy?: 'mutation' | 'crossover' | 'random';
}
export interface EnsembleConfig {
    /** Number of models in the ensemble */
    size: number;
    /** Reduction function for combining outputs */
    reducer?: (outputs: any[]) => any;
    /** Voting strategy for classification */
    votingStrategy?: 'hard' | 'soft';
}
export interface UsageMetadata {
    /** Number of input tokens */
    inputTokens: number;
    /** Number of output tokens */
    outputTokens: number;
    /** Total tokens used */
    totalTokens: number;
    /** Estimated cost in USD */
    estimatedCost?: number;
}
export interface EvaluationResult {
    /** Overall score */
    score: number;
    /** Individual scores per example */
    individualScores: number[];
    /** Usage metadata */
    usage: UsageMetadata;
    /** Time taken for evaluation */
    evaluationTimeMs: number;
}
export declare abstract class BaseOptimizer {
    protected config: OptimizerConfig;
    constructor(config?: OptimizerConfig);
    /**
     * Optimize a module using the given training set
     * @param module - The module to optimize
     * @param trainset - Training examples
     * @param valset - Optional validation set
     * @returns The optimization result
     */
    abstract optimize(module: Module, trainset: Example[], valset?: Example[]): Promise<OptimizationResult>;
    /**
     * Get optimizer configuration
     */
    getConfig(): OptimizerConfig;
    /**
     * Evaluate a module on a dataset
     */
    protected evaluate(module: Module, dataset: Example[], metric: Metric): Promise<EvaluationResult>;
}
//# sourceMappingURL=index.d.ts.map