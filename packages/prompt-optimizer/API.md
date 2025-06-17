# @jamesaphoenix/prompt-optimizer API Documentation

## Overview

The `@jamesaphoenix/prompt-optimizer` package provides a comprehensive suite of tools for optimizing prompts using techniques inspired by DSPy. This API documentation covers all classes, interfaces, and functions available in the package.

## Table of Contents

- [Core Types](#core-types)
- [Optimizers](#optimizers)
- [Metrics](#metrics)
- [Utilities](#utilities)
- [Examples](#examples)

## Core Types

### Example

Represents a training example with input and expected output.

```typescript
interface Example {
  input: string | Record<string, any>;
  output: string | Record<string, any>;
  metadata?: Record<string, any>;
}
```

### Prediction

Represents a model's prediction output.

```typescript
interface Prediction {
  output: string | Record<string, any>;
  confidence?: number;
  trace?: any;
  metadata?: Record<string, any>;
}
```

### Module

Interface that all optimizable modules must implement.

```typescript
interface Module {
  predict(input: string | Record<string, any>): Promise<Prediction>;
  getPrompt(): string;
  setPrompt(prompt: string): void;
  clone(): Module;
}
```

### Metric

Interface for evaluation metrics.

```typescript
interface Metric {
  name: string;
  evaluate(example: Example, prediction: Prediction, trace?: any): number;
}
```

### LanguageModel

Interface for language models used in optimization.

```typescript
interface LanguageModel {
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  getModelName(): string;
}
```

### OptimizationResult

Result object returned by all optimizers.

```typescript
interface OptimizationResult {
  optimizedModule: Module;
  finalScore: number;
  roundsCompleted: number;
  history: OptimizationRound[];
  optimizationTimeMs: number;
}
```

## Optimizers

### BootstrapOptimizer

Implements bootstrap few-shot optimization using labeled examples and teacher-generated demonstrations.

#### Constructor

```typescript
constructor(config: BootstrapConfig = {})
```

#### Configuration

```typescript
interface BootstrapConfig extends OptimizerConfig {
  maxLabeled?: number;          // Max labeled examples (default: 16)
  maxBootstrapped?: number;     // Max bootstrapped examples (default: 4)
  bootstrapThreshold?: number;  // Quality threshold (default: 0.7)
  teacherModel?: LanguageModel; // Teacher for bootstrapping (default: null)
}
```

#### Methods

```typescript
// Optimize a module using bootstrap few-shot learning
async optimize(
  student: Module,
  trainset: Example[],
  valset?: Example[]
): Promise<OptimizationResult>

// Get current configuration
getBootstrapConfig(): Required<BootstrapConfig>
```

#### Example

```typescript
const optimizer = new BootstrapOptimizer({
  maxLabeled: 10,
  maxBootstrapped: 5,
  teacherModel: myTeacherModel,
  metric: ExactMatch,
  verbose: true
});

const result = await optimizer.optimize(module, trainset, valset);
console.log(`Final score: ${result.finalScore}`);
```

### COPROOptimizer

Implements Compositional Prompt Optimization using iterative prompt generation and evaluation.

#### Constructor

```typescript
constructor(llm: LanguageModel, config: COPROConfig = {})
```

#### Configuration

```typescript
interface COPROConfig extends OptimizerConfig {
  breadth?: number;        // Candidates per round (default: 10)
  depth?: number;          // Optimization rounds (default: 3)
  temperature?: number;    // Generation temperature (default: 0.7)
  numVariations?: number;  // Variations per candidate (default: 5)
}
```

#### Methods

```typescript
// Optimize using compositional prompt optimization
async optimize(
  module: Module,
  trainset: Example[],
  valset?: Example[]
): Promise<OptimizationResult>

// Get current configuration
getCOPROConfig(): Required<COPROConfig>
```

#### Example

```typescript
const optimizer = new COPROOptimizer(languageModel, {
  breadth: 8,
  depth: 3,
  temperature: 0.8,
  metric: FuzzyMatch
});

const result = await optimizer.optimize(module, trainset);
```

### RandomSearchOptimizer

Implements random search optimization with multiple strategies.

#### Constructor

```typescript
constructor(config: RandomSearchConfig = {}, llm?: LanguageModel)
```

#### Configuration

```typescript
interface RandomSearchConfig extends OptimizerConfig {
  numCandidates?: number;  // Number of candidates (default: 16)
  budget?: number;         // Evaluation budget (default: 100)
  strategy?: 'mutation' | 'crossover' | 'random'; // Strategy (default: 'random')
}
```

#### Methods

```typescript
// Optimize using random search
async optimize(
  module: Module,
  trainset: Example[],
  valset?: Example[]
): Promise<OptimizationResult>

// Get current configuration
getRandomSearchConfig(): Required<RandomSearchConfig>
```

#### Example

```typescript
const optimizer = new RandomSearchOptimizer({
  numCandidates: 20,
  budget: 50,
  strategy: 'mutation',
  metric: ExactMatch
}, languageModel);

const result = await optimizer.optimize(module, trainset);
```

### EnsembleOptimizer

Combines multiple optimized modules for improved performance.

#### Constructor

```typescript
constructor(config: EnsembleConfig)
```

#### Configuration

```typescript
interface EnsembleConfig {
  size: number;
  reducer?: (outputs: any[]) => any;
  votingStrategy?: 'hard' | 'soft';
}
```

#### Static Methods

```typescript
// Create ensemble from optimization results
static fromOptimizationResults(
  results: OptimizationResult[],
  config: Partial<EnsembleConfig>
): EnsembleOptimizer

// Create ensemble from multiple optimizers
static async fromMultipleOptimizers(
  baseModule: Module,
  trainset: Example[],
  optimizers: Array<{ optimize: (module: Module, trainset: Example[]) => Promise<OptimizationResult> }>,
  config: Partial<EnsembleConfig>
): Promise<EnsembleOptimizer>
```

#### Methods

```typescript
// Add module to ensemble
addModule(module: Module): void

// Make prediction using ensemble
async predict(input: string | Record<string, any>): Promise<Prediction>

// Evaluate ensemble on dataset
async evaluate(dataset: Example[], metric: Metric): Promise<{
  score: number;
  individualScores: number[];
  moduleScores: number[][];
}>

// Get ensemble statistics
getStats(): {
  size: number;
  moduleCount: number;
  config: Required<EnsembleConfig>;
}

// Clone ensemble
clone(): EnsembleOptimizer
```

#### Example

```typescript
// Create from optimization results
const ensemble = EnsembleOptimizer.fromOptimizationResults([
  bootstrapResult,
  coproResult,
  randomResult
], {
  size: 3,
  votingStrategy: 'hard'
});

// Use for prediction
const prediction = await ensemble.predict("What is 2+2?");
```

## Metrics

### Built-in Metrics

#### ExactMatch

Exact string matching with normalization.

```typescript
const ExactMatch: Metric = {
  name: 'exact_match',
  evaluate: answerExactMatch
};
```

#### FuzzyMatch

Similarity-based matching using edit distance.

```typescript
const FuzzyMatch: Metric = {
  name: 'fuzzy_match',
  evaluate: (example, prediction, trace) => answerFuzzyMatch(example, prediction, trace, 0.8)
};
```

#### PassageMatch

Context-aware matching for RAG applications.

```typescript
const PassageMatch: Metric = {
  name: 'passage_match',
  evaluate: answerPassageMatch
};
```

#### ContainsMatch

Substring matching for partial credit.

```typescript
const ContainsMatch: Metric = {
  name: 'contains_match',
  evaluate: answerContainsMatch
};
```

#### NumericMatch

Tolerance-based matching for numerical answers.

```typescript
const NumericMatch: Metric = {
  name: 'numeric_match',
  evaluate: (example, prediction, trace) => answerNumericMatch(example, prediction, trace, 0.01)
};
```

### Metric Functions

#### answerExactMatch

```typescript
function answerExactMatch(
  example: Example,
  prediction: Prediction,
  trace?: any,
  frac: number = 1.0
): number
```

#### answerFuzzyMatch

```typescript
function answerFuzzyMatch(
  example: Example,
  prediction: Prediction,
  trace?: any,
  threshold: number = 0.8
): number
```

#### answerPassageMatch

```typescript
function answerPassageMatch(
  example: Example,
  prediction: Prediction,
  trace?: any
): number
```

#### answerContainsMatch

```typescript
function answerContainsMatch(
  example: Example,
  prediction: Prediction,
  trace?: any
): number
```

#### answerNumericMatch

```typescript
function answerNumericMatch(
  example: Example,
  prediction: Prediction,
  trace?: any,
  tolerance: number = 0.01
): number
```

### Metric Factories

#### createCompositeMetric

Combines multiple metrics with weights.

```typescript
function createCompositeMetric(
  metrics: { metric: Metric; weight: number }[]
): Metric

// Example
const composite = createCompositeMetric([
  { metric: ExactMatch, weight: 0.7 },
  { metric: FuzzyMatch, weight: 0.3 }
]);
```

#### createExactMatchMetric

Creates exact match metric with custom fraction.

```typescript
function createExactMatchMetric(frac: number = 1.0): Metric

// Example
const strictExact = createExactMatchMetric(0.95);
```

#### createFuzzyMatchMetric

Creates fuzzy match metric with custom threshold.

```typescript
function createFuzzyMatchMetric(threshold: number = 0.8): Metric

// Example
const lenientFuzzy = createFuzzyMatchMetric(0.6);
```

#### createNumericMatchMetric

Creates numeric match metric with custom tolerance.

```typescript
function createNumericMatchMetric(tolerance: number = 0.01): Metric

// Example
const preciseMath = createNumericMatchMetric(0.001);
```

## Utilities

### MockModule

Mock implementation of Module interface for testing.

#### Constructor

```typescript
constructor(prompt: string = 'Default prompt', responses: string[] = ['Default response'])
```

#### Methods

```typescript
async predict(input: string | Record<string, any>): Promise<Prediction>
getPrompt(): string
setPrompt(prompt: string): void
clone(): Module
setResponses(responses: string[]): void
resetResponseIndex(): void
getResponseIndex(): number
```

#### Example

```typescript
const module = new MockModule(
  'Answer the question: ',
  ['4', '8', '12', '16', '20']
);

const prediction = await module.predict('What is 2+2?');
console.log(prediction.output); // '4'
```

### MockLanguageModel

Mock implementation of LanguageModel interface.

#### Constructor

```typescript
constructor(
  responses: string[] = ['Mock response'],
  modelName: string = 'mock-model',
  delay: number = 50
)
```

#### Methods

```typescript
async generate(prompt: string, options?: GenerationOptions): Promise<string>
getModelName(): string
setResponses(responses: string[]): void
resetResponseIndex(): void
setDelay(delay: number): void
```

#### Example

```typescript
const mockLM = new MockLanguageModel([
  'Response 1',
  'Response 2',
  'Response 3'
], 'test-model', 100);

const response = await mockLM.generate('Test prompt');
```

### Factory Functions

#### createMockModule

Creates mock module from question-answer pairs.

```typescript
function createMockModule(
  qaPairs: Array<{ input: string; output: string }>,
  prompt: string = 'Answer the question: '
): MockModule
```

#### createMockLanguageModel

Creates context-aware mock language model.

```typescript
function createMockLanguageModel(
  contextResponses: Record<string, string>,
  defaultResponse: string = 'I don\'t understand.',
  modelName: string = 'mock-gpt'
): MockLanguageModel
```

#### createTestDataset

Generates test datasets for different domains.

```typescript
function createTestDataset(
  size: number,
  pattern: 'math' | 'qa' | 'classification' = 'math'
): Example[]

// Example
const mathDataset = createTestDataset(20, 'math');
const qaDataset = createTestDataset(15, 'qa');
const classificationDataset = createTestDataset(10, 'classification');
```

### Performance Utilities

#### measureOptimizationPerformance

Measures execution time and memory usage.

```typescript
function measureOptimizationPerformance<T>(
  operation: () => Promise<T>,
  label: string = 'Operation'
): Promise<{ result: T; timeMs: number; memoryUsed?: number }>

// Example
const { result, timeMs } = await measureOptimizationPerformance(
  () => optimizer.optimize(module, trainset),
  'Bootstrap Optimization'
);
```

## Usage Patterns

### Basic Optimization

```typescript
import { BootstrapOptimizer, ExactMatch, MockModule } from '@jamesaphoenix/prompt-optimizer';

const module = new MockModule('Answer: ', ['correct', 'response']);
const trainset = [
  { input: 'Question 1', output: 'Answer 1' },
  { input: 'Question 2', output: 'Answer 2' }
];

const optimizer = new BootstrapOptimizer({
  maxLabeled: 5,
  metric: ExactMatch
});

const result = await optimizer.optimize(module, trainset);
```

### Multi-Stage Pipeline

```typescript
// Stage 1: Bootstrap
const bootstrap = new BootstrapOptimizer({ maxLabeled: 8 });
let result = await bootstrap.optimize(module, trainset);

// Stage 2: COPRO refinement
const copro = new COPROOptimizer(languageModel, { depth: 3 });
result = await copro.optimize(result.optimizedModule, trainset);

// Stage 3: Ensemble
const ensemble = EnsembleOptimizer.fromOptimizationResults([result]);
```

### Custom Metrics

```typescript
const customMetric: Metric = {
  name: 'domain_specific',
  evaluate: (example, prediction) => {
    // Custom evaluation logic
    return similarity(example.output, prediction.output);
  }
};

const optimizer = new BootstrapOptimizer({ metric: customMetric });
```

### Cross-Validation

```typescript
const folds = [trainset1, trainset2, trainset3, trainset4];
const scores: number[] = [];

for (let i = 0; i < folds.length; i++) {
  const testFold = folds[i];
  const trainFolds = folds.filter((_, index) => index !== i).flat();
  
  const result = await optimizer.optimize(module, trainFolds, testFold);
  scores.push(result.finalScore);
}

const meanScore = scores.reduce((a, b) => a + b) / scores.length;
```

## Error Handling

All optimizers handle errors gracefully:

- **Module failures**: Continue optimization with remaining candidates
- **Teacher model failures**: Fall back to labeled examples only
- **Evaluation errors**: Record failures and continue with valid results
- **Invalid configurations**: Throw descriptive errors at initialization

## Performance Considerations

- **Memory usage**: Optimizers stream results and don't hold large datasets in memory
- **Token limits**: Built-in token counting and cost estimation
- **Concurrent safety**: All optimizers support parallel execution
- **Early stopping**: Configurable thresholds prevent over-optimization

## TypeScript Support

The package provides full TypeScript support with:

- Strict type checking
- Generic type parameters for custom modules
- Comprehensive interface definitions
- Type-safe configuration objects
- IntelliSense support in IDEs

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and breaking changes.

## Contributing

See the repository README for contribution guidelines and development setup instructions.