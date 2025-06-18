/**
 * Prompt Optimizer - Optimize prompts using techniques inspired by DSPy
 *
 * This module provides tools for automatically improving prompts through various
 * optimization strategies including bootstrap sampling, compositional optimization,
 * random search, and ensemble methods.
 *
 * @module prompt-optimizer
 */
// Export optimizers
export { BootstrapOptimizer } from './optimizers/bootstrap.js';
export { COPROOptimizer } from './optimizers/copro.js';
export { RandomSearchOptimizer } from './optimizers/random-search.js';
export { EnsembleOptimizer } from './optimizers/ensemble.js';
// Export metrics
export { ExactMatch, FuzzyMatch, PassageMatch, ContainsMatch, NumericMatch, createCompositeMetric } from './metrics/index.js';
// Export utilities
export { MockModule, MockLanguageModel, createMockModule, createMockLanguageModel, createTestDataset, measureOptimizationPerformance } from './utils/index.js';
//# sourceMappingURL=index.js.map