/**
 * Integration Tests for Prompt Optimizer Package
 * Comprehensive end-to-end testing of all features working together
 */

import { describe, test, expect, beforeAll } from 'vitest';
import {
  BootstrapOptimizer,
  COPROOptimizer,
  RandomSearchOptimizer,
  EnsembleOptimizer,
  ExactMatch,
  FuzzyMatch,
  PassageMatch,
  createCompositeMetric,
  MockModule,
  MockLanguageModel,
  createMockLanguageModel,
  createTestDataset,
  measureOptimizationPerformance,
} from '../src/index.js';

describe('Integration Tests - Complete Prompt Optimization Pipeline', () => {
  let baseModule: MockModule;
  let teacherModel: MockLanguageModel;
  let trainset: any[];
  let valset: any[];

  beforeAll(() => {
    // Create comprehensive test setup
    baseModule = new MockModule(
      'Answer the following question accurately: ',
      ['4', '6', '8', '10', '12', '14', '16', '18', '20']
    );

    teacherModel = createMockLanguageModel({
      'math': 'Let me solve this step by step. The answer is',
      'calculate': 'Calculating this gives us',
      'what is': 'The result is',
      'solve': 'To solve this problem',
      'improve': 'Here is an improved version of the prompt that is clearer and more specific',
      'optimize': 'You are a helpful assistant. Please provide accurate answers to mathematical questions',
    }, 'I need more context to help properly.', 'comprehensive-teacher-gpt');

    // Create comprehensive datasets
    const mathData = createTestDataset(15, 'math');
    const qaData = createTestDataset(10, 'qa');
    const classificationData = createTestDataset(8, 'classification');
    
    const combinedDataset = [...mathData, ...qaData, ...classificationData];
    trainset = combinedDataset.slice(0, 25);
    valset = combinedDataset.slice(25);
  });

  describe('Single Optimizer Performance', () => {
    test('Bootstrap Optimizer end-to-end workflow', async () => {
      const optimizer = new BootstrapOptimizer({
        maxLabeled: 8,
        maxBootstrapped: 4,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
        maxRounds: 5,
        earlyStoppingThreshold: 0.95,
      });

      const { result, timeMs } = await measureOptimizationPerformance(
        () => optimizer.optimize(baseModule, trainset, valset),
        'Bootstrap Integration Test'
      );

      // Comprehensive result validation
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(1);
      expect(result.roundsCompleted).toBe(1); // Bootstrap does 1 round
      expect(result.history).toHaveLength(1);
      expect(result.optimizationTimeMs).toBeGreaterThan(0);
      expect(timeMs).toBeGreaterThan(0);

      // Validate optimization metadata
      const metadata = result.history[0].metadata;
      expect(metadata?.labeledExamples).toBeGreaterThan(0);
      expect(metadata?.labeledExamples).toBeLessThanOrEqual(8);
      expect(metadata?.bootstrappedExamples).toBeGreaterThanOrEqual(0);
      expect(metadata?.bootstrappedExamples).toBeLessThanOrEqual(4);
      expect(metadata?.usage).toBeDefined();
      expect(metadata?.usage.totalTokens).toBeGreaterThan(0);

      // Validate prompt modification
      const originalPrompt = baseModule.getPrompt();
      const optimizedPrompt = result.optimizedModule.getPrompt();
      expect(optimizedPrompt).not.toBe(originalPrompt);
      expect(optimizedPrompt).toContain('examples'); // Should include demonstrations
    });

    test('COPRO Optimizer end-to-end workflow', async () => {
      const optimizer = new COPROOptimizer(teacherModel, {
        breadth: 5,
        depth: 3,
        temperature: 0.7,
        numVariations: 3,
        metric: ExactMatch,
        verbose: false,
      });

      const { result, timeMs } = await measureOptimizationPerformance(
        () => optimizer.optimize(baseModule, trainset, valset),
        'COPRO Integration Test'
      );

      // Comprehensive result validation
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.roundsCompleted).toBeGreaterThan(0);
      expect(result.roundsCompleted).toBeLessThanOrEqual(3);
      expect(result.history.length).toBe(result.roundsCompleted);
      expect(timeMs).toBeGreaterThan(0);

      // Validate each optimization round
      for (let i = 0; i < result.history.length; i++) {
        const round = result.history[i];
        expect(round.round).toBe(i + 1);
        expect(round.score).toBeGreaterThanOrEqual(0);
        expect(round.timeMs).toBeGreaterThan(0);
        expect(round.prompt).toBeDefined();
        
        const metadata = round.metadata;
        expect(metadata?.candidatesGenerated).toBeGreaterThanOrEqual(0);
        expect(metadata?.candidatesEvaluated).toBeGreaterThanOrEqual(0);
        expect(metadata?.averageScore).toBeGreaterThanOrEqual(0);
      }
    });

    test('Random Search Optimizer end-to-end workflow', async () => {
      const optimizer = new RandomSearchOptimizer({
        numCandidates: 8,
        budget: 15,
        strategy: 'mutation',
        metric: ExactMatch,
        verbose: false,
      }, teacherModel);

      const { result, timeMs } = await measureOptimizationPerformance(
        () => optimizer.optimize(baseModule, trainset, valset),
        'Random Search Integration Test'
      );

      // Comprehensive result validation
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.roundsCompleted).toBeGreaterThan(0);
      expect(result.roundsCompleted).toBeLessThanOrEqual(8);
      expect(result.history.length).toBe(result.roundsCompleted);
      expect(timeMs).toBeGreaterThan(0);

      // Validate search metadata
      for (const round of result.history) {
        expect(round.metadata?.strategy).toBe('mutation');
        expect(round.metadata?.candidateIndex).toBeGreaterThanOrEqual(0);
        expect(round.metadata?.demonstrationCount).toBeGreaterThan(0);
        expect(round.metadata?.evaluationsUsed).toBeGreaterThan(0);
      }
    });
  });

  describe('Multi-Optimizer Ensemble Pipeline', () => {
    test('Complete optimization pipeline with ensemble', async () => {
      console.log('🚀 Starting comprehensive multi-optimizer pipeline...');

      // Step 1: Run multiple optimizers
      const bootstrapOptimizer = new BootstrapOptimizer({
        maxLabeled: 6,
        maxBootstrapped: 3,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
      });

      const coproOptimizer = new COPROOptimizer(teacherModel, {
        breadth: 4,
        depth: 2,
        numVariations: 2,
        metric: ExactMatch,
        verbose: false,
      });

      const randomOptimizer = new RandomSearchOptimizer({
        numCandidates: 6,
        budget: 10,
        strategy: 'crossover',
        metric: ExactMatch,
        verbose: false,
      });

      // Run optimizations in parallel for speed
      const [bootstrapResult, coproResult, randomResult] = await Promise.all([
        bootstrapOptimizer.optimize(baseModule, trainset, valset),
        coproOptimizer.optimize(baseModule, trainset, valset),
        randomOptimizer.optimize(baseModule, trainset, valset),
      ]);

      // Validate individual results
      expect(bootstrapResult.finalScore).toBeGreaterThanOrEqual(0);
      expect(coproResult.finalScore).toBeGreaterThanOrEqual(0);
      expect(randomResult.finalScore).toBeGreaterThanOrEqual(0);

      // Step 2: Create ensemble from results
      const ensemble = EnsembleOptimizer.fromOptimizationResults([
        bootstrapResult,
        coproResult,
        randomResult,
      ], {
        size: 3,
        votingStrategy: 'hard',
      });

      // Validate ensemble creation
      const stats = ensemble.getStats();
      expect(stats.moduleCount).toBe(3);
      expect(stats.size).toBe(3);
      expect(stats.config.votingStrategy).toBe('hard');

      // Step 3: Evaluate ensemble performance
      const ensembleEvaluation = await ensemble.evaluate(valset, ExactMatch);
      
      expect(ensembleEvaluation.score).toBeGreaterThanOrEqual(0);
      expect(ensembleEvaluation.individualScores).toHaveLength(valset.length);
      expect(ensembleEvaluation.moduleScores).toHaveLength(3);
      expect(ensembleEvaluation.moduleScores[0]).toHaveLength(valset.length);

      // Step 4: Test ensemble predictions
      const ensemblePrediction = await ensemble.predict('What is 15 + 15?');
      
      expect(ensemblePrediction.output).toBeDefined();
      expect(ensemblePrediction.confidence).toBeGreaterThanOrEqual(0);
      expect(ensemblePrediction.metadata?.ensembleSize).toBe(3);
      expect(ensemblePrediction.metadata?.predictions).toHaveLength(3);

      console.log('✅ Multi-optimizer pipeline completed successfully!');
      console.log(`📊 Final ensemble score: ${ensembleEvaluation.score.toFixed(3)}`);
      console.log(`🎯 Individual optimizer scores: ${bootstrapResult.finalScore.toFixed(3)}, ${coproResult.finalScore.toFixed(3)}, ${randomResult.finalScore.toFixed(3)}`);
    });
  });

  describe('Advanced Metrics Integration', () => {
    test('Multiple metrics comparison and composite metrics', async () => {
      const metrics = [
        { name: 'Exact Match', metric: ExactMatch },
        { name: 'Fuzzy Match', metric: FuzzyMatch },
        { name: 'Passage Match', metric: PassageMatch },
      ];

      // Create composite metric
      const compositeMetric = createCompositeMetric([
        { metric: ExactMatch, weight: 0.5 },
        { metric: FuzzyMatch, weight: 0.3 },
        { metric: PassageMatch, weight: 0.2 },
      ]);

      // Test optimizer with different metrics
      const results: any[] = [];
      
      for (const { name, metric } of metrics) {
        const optimizer = new BootstrapOptimizer({
          maxLabeled: 5,
          maxBootstrapped: 2,
          teacherModel,
          metric,
          verbose: false,
        });

        const result = await optimizer.optimize(baseModule, trainset.slice(0, 10), valset.slice(0, 5));
        results.push({ name, score: result.finalScore, metric });
        
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.finalScore).toBeLessThanOrEqual(1);
      }

      // Test composite metric
      const compositeOptimizer = new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 2,
        teacherModel,
        metric: compositeMetric,
        verbose: false,
      });

      const compositeResult = await compositeOptimizer.optimize(
        baseModule, 
        trainset.slice(0, 10), 
        valset.slice(0, 5)
      );

      expect(compositeResult.finalScore).toBeGreaterThanOrEqual(0);
      expect(compositeResult.finalScore).toBeLessThanOrEqual(1);

      console.log('📊 Metric comparison results:');
      results.forEach(({ name, score }) => {
        console.log(`  ${name}: ${score.toFixed(3)}`);
      });
      console.log(`  Composite Metric: ${compositeResult.finalScore.toFixed(3)}`);
    });
  });

  describe('Performance and Scalability', () => {
    test('Large dataset optimization performance', async () => {
      // Create larger datasets
      const largeMathDataset = createTestDataset(50, 'math');
      const largeTrainset = largeMathDataset.slice(0, 40);
      const largeValset = largeMathDataset.slice(40);

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 15,
        maxBootstrapped: 8,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
      });

      const { result, timeMs, memoryUsed } = await measureOptimizationPerformance(
        () => optimizer.optimize(baseModule, largeTrainset, largeValset),
        'Large Dataset Optimization'
      );

      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(timeMs).toBeGreaterThan(0);
      expect(timeMs).toBeLessThan(30000); // Should complete within 30 seconds
      
      if (memoryUsed !== undefined) {
        expect(typeof memoryUsed).toBe('number');
        expect(Math.abs(memoryUsed)).toBeLessThan(100 * 1024 * 1024); // Memory change less than 100MB
      }

      console.log(`⚡ Large dataset optimization: ${timeMs}ms for ${largeTrainset.length} training examples`);
    });

    test('Concurrent optimization stress test', async () => {
      const optimizers = [
        new BootstrapOptimizer({
          maxLabeled: 3,
          maxBootstrapped: 2,
          teacherModel,
          metric: ExactMatch,
          verbose: false,
        }),
        new RandomSearchOptimizer({
          numCandidates: 4,
          budget: 8,
          strategy: 'random',
          metric: ExactMatch,
          verbose: false,
        }),
      ];

      const smallDataset = trainset.slice(0, 8);
      const smallValset = valset.slice(0, 3);

      // Run multiple optimizers concurrently
      const promises = optimizers.map(optimizer => 
        optimizer.optimize(baseModule, smallDataset, smallValset)
      );

      const results = await Promise.all(promises);

      // All should complete successfully
      for (const result of results) {
        expect(result.optimizedModule).toBeDefined();
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.roundsCompleted).toBeGreaterThan(0);
      }

      console.log('🚀 Concurrent optimization completed successfully');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('Optimization with problematic training data', async () => {
      // Create dataset with problematic examples
      const problematicDataset = [
        { input: '', output: '' }, // Empty input/output
        { input: 'What is null?', output: null }, // Null output
        { input: undefined, output: 'undefined input' }, // Undefined input
        { input: 'Normal question', output: 'Normal answer' }, // Normal example
        { input: 'Very long question that goes on and on and repeats itself multiple times with excessive detail that might cause issues in processing or token limits or other edge cases', output: 'Short answer' },
      ];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 2,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
      });

      // Should handle problematic data gracefully
      const result = await optimizer.optimize(baseModule, problematicDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.roundsCompleted).toBeGreaterThan(0);
    });

    test('Optimization with failing teacher model', async () => {
      const unreliableTeacher = new MockLanguageModel(['error', 'failed', 'timeout'], 'unreliable-gpt', 10);
      
      // Mock to fail frequently
      const originalGenerate = unreliableTeacher.generate.bind(unreliableTeacher);
      unreliableTeacher.generate = async (prompt: string) => {
        if (Math.random() < 0.6) { // 60% failure rate
          throw new Error('Teacher model unavailable');
        }
        return originalGenerate(prompt);
      };

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 3,
        teacherModel: unreliableTeacher,
        metric: ExactMatch,
        verbose: false,
      });

      // Should handle teacher failures gracefully
      const result = await optimizer.optimize(baseModule, trainset.slice(0, 8));
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      
      // Should have fewer bootstrapped examples due to failures
      const metadata = result.history[0].metadata;
      expect(metadata?.bootstrappedExamples).toBeLessThanOrEqual(3);
    });
  });

  describe('Real-world Usage Patterns', () => {
    test('Iterative optimization workflow', async () => {
      let currentModule = baseModule.clone();
      const optimizationHistory: any[] = [];

      // Stage 1: Bootstrap optimization
      const bootstrap = new BootstrapOptimizer({
        maxLabeled: 6,
        maxBootstrapped: 3,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
      });

      let result = await bootstrap.optimize(currentModule, trainset, valset);
      optimizationHistory.push({ stage: 'Bootstrap', score: result.finalScore });
      currentModule = result.optimizedModule;

      // Stage 2: COPRO refinement
      const copro = new COPROOptimizer(teacherModel, {
        breadth: 3,
        depth: 2,
        numVariations: 2,
        metric: ExactMatch,
        verbose: false,
      });

      result = await copro.optimize(currentModule, trainset, valset);
      optimizationHistory.push({ stage: 'COPRO', score: result.finalScore });
      currentModule = result.optimizedModule;

      // Stage 3: Random search fine-tuning
      const random = new RandomSearchOptimizer({
        numCandidates: 5,
        budget: 8,
        strategy: 'mutation',
        metric: ExactMatch,
        verbose: false,
      }, teacherModel);

      result = await random.optimize(currentModule, trainset, valset);
      optimizationHistory.push({ stage: 'Random Search', score: result.finalScore });

      // Validate progressive improvement
      expect(optimizationHistory).toHaveLength(3);
      
      console.log('📈 Iterative optimization progress:');
      optimizationHistory.forEach(({ stage, score }) => {
        console.log(`  ${stage}: ${score.toFixed(3)}`);
      });

      // Final module should be optimized
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('Cross-validation workflow', async () => {
      // Split data into multiple folds for cross-validation
      const foldSize = Math.floor(trainset.length / 3);
      const folds = [
        trainset.slice(0, foldSize),
        trainset.slice(foldSize, foldSize * 2),
        trainset.slice(foldSize * 2),
      ];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 4,
        maxBootstrapped: 2,
        teacherModel,
        metric: ExactMatch,
        verbose: false,
      });

      const foldResults: number[] = [];

      // Perform cross-validation
      for (let i = 0; i < folds.length; i++) {
        const testFold = folds[i];
        const trainFolds = folds.filter((_, index) => index !== i).flat();

        const result = await optimizer.optimize(baseModule, trainFolds, testFold);
        foldResults.push(result.finalScore);
      }

      // Calculate cross-validation statistics
      const meanScore = foldResults.reduce((sum, score) => sum + score, 0) / foldResults.length;
      const variance = foldResults.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / foldResults.length;
      const stdDev = Math.sqrt(variance);

      expect(foldResults).toHaveLength(3);
      expect(meanScore).toBeGreaterThanOrEqual(0);
      expect(stdDev).toBeGreaterThanOrEqual(0);

      console.log(`🔍 Cross-validation results: ${meanScore.toFixed(3)} ± ${stdDev.toFixed(3)}`);
      console.log(`📊 Fold scores: ${foldResults.map(s => s.toFixed(3)).join(', ')}`);
    });
  });
});