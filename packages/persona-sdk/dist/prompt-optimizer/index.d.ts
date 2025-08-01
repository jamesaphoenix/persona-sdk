/**
 * Prompt Optimizer - Optimize prompts using techniques inspired by DSPy
 *
 * This module provides tools for automatically improving prompts through various
 * optimization strategies including bootstrap sampling, compositional optimization,
 * random search, and ensemble methods.
 *
 * @module prompt-optimizer
 */
export { BootstrapOptimizer } from './optimizers/bootstrap.js';
export { COPROOptimizer } from './optimizers/copro.js';
export { RandomSearchOptimizer } from './optimizers/random-search.js';
export { EnsembleOptimizer } from './optimizers/ensemble.js';
export { ExactMatch, FuzzyMatch, PassageMatch, ContainsMatch, NumericMatch, createCompositeMetric, type Metric, type CompositeMetricConfig } from './metrics/index.js';
export type { Module, LanguageModel, Example, Prediction, OptimizationResult, OptimizerConfig, BootstrapConfig as BootstrapOptimizerOptions, COPROConfig as COPROOptimizerOptions, RandomSearchConfig as RandomSearchOptimizerOptions, EnsembleConfig as EnsembleOptimizerOptions } from './types/index.js';
export type SearchStrategy = 'mutation' | 'crossover' | 'random';
export { MockModule, MockLanguageModel, createMockModule, createMockLanguageModel, createTestDataset, measureOptimizationPerformance } from './utils/index.js';
//# sourceMappingURL=index.d.ts.map