# Changelog

All notable changes to @jamesaphoenix/prompt-optimizer will be documented in this file.

## [0.1.0] - 2025-06-17

### Added

#### 🎯 Core Optimization Algorithms
- **Bootstrap Few-Shot Optimizer** - Uses labeled examples and teacher model to generate bootstrapped demonstrations
- **COPRO (Compositional Prompt Optimizer)** - Iteratively generates and evaluates prompt variations using breadth-first search
- **Random Search Optimizer** - Explores optimization space through controlled randomness with multiple strategies
- **Ensemble Optimizer** - Combines multiple optimized modules for improved performance

#### 📊 Comprehensive Metrics System  
- **Exact Match** - Precise string matching with case normalization
- **Fuzzy Match** - Similarity-based matching using Levenshtein distance
- **Passage Match** - Context-aware matching for RAG applications
- **Contains Match** - Substring matching for partial credit scoring
- **Numeric Match** - Tolerance-based matching for numerical answers
- **Composite Metrics** - Weighted combination of multiple metrics

#### 🧪 Advanced Testing Infrastructure
- **Mock Implementations** - Complete mock modules and language models for testing
- **Test Data Generators** - Automatic generation of math, QA, and classification datasets
- **Performance Measurement** - Built-in timing and memory usage tracking
- **Integration Tests** - End-to-end workflows testing all components together

#### 🔧 Developer Experience
- **Full TypeScript Support** - Complete type safety with comprehensive interfaces
- **TanStack-Style API** - Clean, intuitive API design following modern patterns
- **Extensive Documentation** - Comprehensive README with examples and best practices
- **Error Handling** - Graceful degradation and detailed error reporting

### Features by Category

#### Optimization Strategies
- **Bootstrap Configuration**: Control labeled/bootstrapped example limits, quality thresholds
- **COPRO Configuration**: Adjust breadth, depth, temperature, and variation count
- **Random Search Configuration**: Choose between mutation, crossover, and random strategies
- **Early Stopping**: Configurable thresholds to prevent over-optimization

#### Metrics and Evaluation
- **Multi-Metric Support**: Use different metrics for different optimization goals
- **Custom Metric Creation**: Factory functions for domain-specific metrics
- **Evaluation Utilities**: Built-in evaluation on training and validation sets
- **Performance Tracking**: Token usage, timing, and cost estimation

#### Mock and Testing
- **Context-Aware Mocks**: Smart mocks that respond based on prompt content
- **Configurable Responses**: Set custom response patterns for testing
- **Failure Simulation**: Test error handling with controlled failures
- **Dataset Generation**: Auto-generate test data for various domains

#### Integration and Scalability
- **Ensemble Creation**: Combine results from multiple optimization runs
- **Voting Strategies**: Hard and soft voting for ensemble predictions
- **Concurrent Optimization**: Run multiple optimizers in parallel
- **Cross-Validation**: Built-in support for k-fold validation workflows

### Technical Specifications

#### Performance
- **Token Tracking**: Comprehensive usage metadata for cost monitoring
- **Memory Efficient**: Optimized for large datasets and long optimization runs
- **Concurrent Safe**: Thread-safe operations for parallel optimization
- **Scalable Architecture**: Handles datasets from small experiments to production workloads

#### Quality Assurance
- **600+ Test Cases**: Comprehensive test coverage across all components
- **Edge Case Handling**: Robust error handling for malformed data
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Integration Testing**: End-to-end workflows tested extensively

#### Compatibility
- **Node.js 18+**: Modern JavaScript runtime support
- **ESM Modules**: Native ES module support
- **LangChain Integration**: Built for modern AI application stacks
- **Framework Agnostic**: Works with any TypeScript/JavaScript project

### Examples and Documentation

#### Basic Usage
```typescript
import { BootstrapOptimizer, ExactMatch, MockModule } from '@jamesaphoenix/prompt-optimizer';

const optimizer = new BootstrapOptimizer({
  maxLabeled: 10,
  maxBootstrapped: 5,
  metric: ExactMatch
});

const result = await optimizer.optimize(module, trainset);
```

#### Advanced Workflows
```typescript
// Multi-stage optimization
const bootstrap = await bootstrapOptimizer.optimize(module, trainset);
const copro = await coproOptimizer.optimize(bootstrap.optimizedModule, trainset);
const ensemble = EnsembleOptimizer.fromOptimizationResults([bootstrap, copro]);
```

#### Custom Metrics
```typescript
const customMetric = createCompositeMetric([
  { metric: ExactMatch, weight: 0.7 },
  { metric: FuzzyMatch, weight: 0.3 }
]);
```

### Breaking Changes
- None (initial release)

### Dependencies
- `@langchain/core: ^0.3.24` - Core LangChain functionality
- `@langchain/openai: ^0.3.11` - OpenAI integration
- `zod: ^3.23.8` - Runtime type validation

### Development Dependencies
- `typescript: ^5.0.0` - TypeScript compiler
- `vitest: ^2.0.0` - Fast testing framework
- `@vitest/coverage-v8: ^2.0.0` - Coverage reporting
- `typedoc: ^0.25.0` - Documentation generation

### Known Issues
- Vitest esbuild version conflict in some environments (does not affect package functionality)
- Large ensemble sizes may require increased memory allocation

### Migration Guide
- None required (initial release)

### Credits
Inspired by the excellent work in [DSPy](https://github.com/stanfordnlp/dspy) by Stanford NLP. Adapted for TypeScript with modern developer experience and comprehensive type safety.