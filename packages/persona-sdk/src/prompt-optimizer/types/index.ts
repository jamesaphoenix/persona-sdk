/**
 * Core types for the prompt optimizer package
 */

// Base example interface for training data
export interface Example {
  /** Input data for the example */
  input: string | Record<string, any>;
  /** Expected output for the example */
  output: string | Record<string, any>;
  /** Optional metadata for the example */
  metadata?: Record<string, any>;
}

// Prediction interface for model outputs
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

// Base metric interface
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

// Module interface (represents a model/program to be optimized)
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

// Language model interface
export interface LanguageModel {
  /** Generate text completion */
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  /** Get model name/identifier */
  getModelName(): string;
}

// Generation options
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Base optimizer configuration
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

// Optimization result
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

// Individual optimization round
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

// Bootstrap optimizer specific config
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

// COPRO optimizer specific config
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

// Random search optimizer specific config
export interface RandomSearchConfig extends OptimizerConfig {
  /** Number of random candidates to try */
  numCandidates?: number;
  /** Budget for optimization (e.g., number of evaluations) */
  budget?: number;
  /** Strategy for generating random prompts */
  strategy?: 'mutation' | 'crossover' | 'random';
}

// Ensemble configuration
export interface EnsembleConfig {
  /** Number of models in the ensemble */
  size: number;
  /** Reduction function for combining outputs */
  reducer?: (outputs: any[]) => any;
  /** Voting strategy for classification */
  votingStrategy?: 'hard' | 'soft';
}

// Usage metadata for tracking API costs
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

// Evaluation result
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

// Base class for all optimizers
export abstract class BaseOptimizer {
  protected config: OptimizerConfig;

  constructor(config: OptimizerConfig = {}) {
    this.config = {
      maxRounds: 10,
      earlyStoppingThreshold: 0.95,
      verbose: false,
      ...config,
    };
  }

  /**
   * Optimize a module using the given training set
   * @param module - The module to optimize
   * @param trainset - Training examples
   * @param valset - Optional validation set
   * @returns The optimization result
   */
  abstract optimize(
    module: Module,
    trainset: Example[],
    valset?: Example[]
  ): Promise<OptimizationResult>;

  /**
   * Get optimizer configuration
   */
  getConfig(): OptimizerConfig {
    return { ...this.config };
  }

  /**
   * Evaluate a module on a dataset
   */
  protected async evaluate(
    module: Module,
    dataset: Example[],
    metric: Metric
  ): Promise<EvaluationResult> {
    const startTime = Date.now();
    const scores: number[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const example of dataset) {
      const prediction = await module.predict(example.input);
      const score = metric.evaluate(example, prediction);
      scores.push(score);

      // Track token usage if available
      if (prediction.metadata?.usage) {
        totalInputTokens += prediction.metadata.usage.inputTokens || 0;
        totalOutputTokens += prediction.metadata.usage.outputTokens || 0;
      }
    }

    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const evaluationTimeMs = Date.now() - startTime;

    return {
      score: averageScore,
      individualScores: scores,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
      },
      evaluationTimeMs,
    };
  }
}