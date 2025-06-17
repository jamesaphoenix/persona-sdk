/**
 * @module @jamesaphoenix/prompt-optimizer
 *
 * A TypeScript package for optimizing prompts using techniques inspired by DSPy.
 *
 * This package provides tools for automatically improving prompts through various
 * optimization strategies including bootstrap sampling, compositional optimization,
 * random search, and ensemble methods.
 *
 * ## Key Features
 *
 * - **Type-safe prompt optimization** with comprehensive TypeScript support
 * - **Multiple optimization strategies** (Bootstrap, COPRO, Random Search, Ensemble)
 * - **Comprehensive metrics system** for evaluating prompt performance
 * - **TanStack-style API** for clean, intuitive usage
 * - **Extensive testing** with high coverage guarantees
 *
 * ## Quick Start
 *
 * ```typescript
 * import { BootstrapOptimizer, ExactMatch, MockModule } from '@jamesaphoenix/prompt-optimizer';
 *
 * // Create a module to optimize
 * const module = new MockModule("Answer the question: ");
 *
 * // Create training data
 * const trainset = [
 *   { input: "What is 2+2?", output: "4" },
 *   { input: "What is 3+3?", output: "6" }
 * ];
 *
 * // Optimize the module
 * const optimizer = new BootstrapOptimizer({
 *   maxLabeled: 10,
 *   maxBootstrapped: 5,
 *   metric: ExactMatch
 * });
 *
 * const result = await optimizer.optimize(module, trainset);
 * console.log(`Optimized score: ${result.finalScore}`);
 * ```
 *
 * ## Main Components
 *
 * - {@link BootstrapOptimizer} - Bootstrap few-shot optimization
 * - {@link COPROOptimizer} - Compositional prompt optimization
 * - {@link RandomSearchOptimizer} - Random search optimization
 * - {@link EnsembleOptimizer} - Ensemble methods for combining models
 * - {@link ExactMatch} - Exact string matching metric
 * - {@link FuzzyMatch} - Fuzzy string matching metric
 * - {@link PassageMatch} - Context-based matching metric
 */

// Core types and interfaces
export type {
  Example,
  Prediction,
  Metric,
  Module,
  LanguageModel,
  GenerationOptions,
  OptimizerConfig,
  OptimizationResult,
  OptimizationRound,
  BootstrapConfig,
  COPROConfig,
  RandomSearchConfig,
  EnsembleConfig,
  UsageMetadata,
  EvaluationResult,
} from './types/index.js';

export { BaseOptimizer } from './types/index.js';

// Optimizers
export {
  BootstrapOptimizer,
  COPROOptimizer,
  RandomSearchOptimizer,
  EnsembleOptimizer,
} from './optimizers/index.js';

// Metrics
export {
  answerExactMatch,
  answerPassageMatch,
  answerFuzzyMatch,
  answerContainsMatch,
  answerNumericMatch,
  createCompositeMetric,
  ExactMatch,
  PassageMatch,
  FuzzyMatch,
  ContainsMatch,
  NumericMatch,
  createExactMatchMetric,
  createFuzzyMatchMetric,
  createNumericMatchMetric,
} from './metrics/index.js';

// Utilities
export {
  MockModule,
  MockLanguageModel,
  createMockModule,
  createMockLanguageModel,
} from './utils/index.js';

// Version
export const VERSION = '0.1.0';