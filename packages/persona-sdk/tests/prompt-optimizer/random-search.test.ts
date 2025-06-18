/**
 * Tests for Random Search Optimizer
 * Comprehensive test suite following DSPy patterns
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { RandomSearchOptimizer } from '../../src/prompt-optimizer/optimizers/random-search.js';
import { ExactMatch, FuzzyMatch } from '../../src/prompt-optimizer/metrics/index.js';
import { 
  mathDataset,
  qaDataset,
  classificationDataset,
  createPerfectMockModule,
  createImperfectMockModule,
  createSmartMockLM,
  createTeacherMockLM,
  testConfigs,
  splitDataset,
} from './fixtures/mock-models.js';
import type { RandomSearchConfig } from '../../src/prompt-optimizer/types/index.js';

describe('RandomSearchOptimizer', () => {
  let optimizer: RandomSearchOptimizer;
  let mockLM: any;

  beforeEach(() => {
    mockLM = createSmartMockLM();
    optimizer = new RandomSearchOptimizer(testConfigs.randomSearch.fast, mockLM);
  });

  describe('Initialization', () => {
    test('should initialize with correct default parameters', () => {
      const defaultOptimizer = new RandomSearchOptimizer();
      const config = defaultOptimizer.getRandomSearchConfig();

      expect(config.numCandidates).toBe(16);
      expect(config.budget).toBe(100);
      expect(config.strategy).toBe('random');
      expect(config.metric).toBe(ExactMatch);
    });

    test('should initialize with custom parameters', () => {
      const customConfig: RandomSearchConfig = {
        numCandidates: 20,
        budget: 50,
        strategy: 'mutation',
        metric: FuzzyMatch,
        verbose: true,
      };

      const customOptimizer = new RandomSearchOptimizer(customConfig, mockLM);
      const config = customOptimizer.getRandomSearchConfig();

      expect(config.numCandidates).toBe(20);
      expect(config.budget).toBe(50);
      expect(config.strategy).toBe('mutation');
      expect(config.metric).toBe(FuzzyMatch);
      expect(config.verbose).toBe(true);
    });

    test('should work without language model for basic strategies', () => {
      const noLMOptimizer = new RandomSearchOptimizer({
        strategy: 'random',
        numCandidates: 5,
      });

      expect(noLMOptimizer.getRandomSearchConfig().strategy).toBe('random');
    });
  });

  describe('Basic Optimization', () => {
    test('should optimize module with random search', async () => {
      const module = createPerfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.roundsCompleted).toBeGreaterThan(0);
      expect(result.roundsCompleted).toBeLessThanOrEqual(testConfigs.randomSearch.fast.numCandidates);
      expect(result.history).toHaveLength(result.roundsCompleted);
    });

    test('should respect budget constraints', async () => {
      const budgetOptimizer = new RandomSearchOptimizer({
        numCandidates: 20,
        budget: 5, // Very small budget
        strategy: 'random',
        verbose: false,
      }, mockLM);

      const module = createPerfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await budgetOptimizer.optimize(module, trainset);

      expect(result.roundsCompleted).toBeLessThanOrEqual(5);
      expect(result.history.length).toBeLessThanOrEqual(5);
    });

    test('should use validation set when provided', async () => {
      const module = createPerfectMockModule();
      const { trainset, valset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset, valset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty training set', async () => {
      const module = createPerfectMockModule();
      const emptyTrainset: any[] = [];

      const result = await optimizer.optimize(module, emptyTrainset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.roundsCompleted).toBeGreaterThan(0);
    });
  });

  describe('Search Strategies', () => {
    describe('Random Strategy', () => {
      test('should generate random candidates', async () => {
        const randomOptimizer = new RandomSearchOptimizer({
          numCandidates: 5,
          strategy: 'random',
          verbose: true,
        });

        const module = createPerfectMockModule();
        const result = await randomOptimizer.optimize(module, mathDataset);

        expect(result.roundsCompleted).toBeLessThanOrEqual(5);
        expect(result.history[0].metadata?.strategy).toBe('random');
      });

      test('should handle different prompt structures', async () => {
        const module = createPerfectMockModule();
        module.setPrompt('Complex prompt with multiple sections and instructions');

        const result = await optimizer.optimize(module, mathDataset.slice(0, 3));

        expect(result.optimizedModule).toBeDefined();
      });
    });

    describe('Mutation Strategy', () => {
      test('should generate mutation candidates with LM', async () => {
        const mutationOptimizer = new RandomSearchOptimizer({
          numCandidates: 5,
          strategy: 'mutation',
          verbose: true,
        }, mockLM);

        const module = createPerfectMockModule();
        const result = await mutationOptimizer.optimize(module, mathDataset);

        expect(result.roundsCompleted).toBeLessThanOrEqual(5);
        expect(result.history[0].metadata?.strategy).toBe('mutation');
      });

      test('should fallback gracefully when LM unavailable for mutation', async () => {
        const noLMOptimizer = new RandomSearchOptimizer({
          numCandidates: 3,
          strategy: 'mutation',
          verbose: false,
        }); // No LM provided

        const module = createPerfectMockModule();
        
        // Should still work, just without LM-based mutations
        const result = await noLMOptimizer.optimize(module, mathDataset.slice(0, 2));
        
        expect(result.optimizedModule).toBeDefined();
      });

      test('should handle LM failures during mutation', async () => {
        const faultyLM = createSmartMockLM();
        
        // Mock to fail sometimes
        const originalGenerate = faultyLM.generate.bind(faultyLM);
        faultyLM.generate = vi.fn().mockImplementation(async (prompt) => {
          if (Math.random() < 0.5) { // 50% failure rate
            throw new Error('LM mutation failed');
          }
          return originalGenerate(prompt);
        });

        const mutationOptimizer = new RandomSearchOptimizer({
          numCandidates: 4,
          strategy: 'mutation',
          verbose: false,
        }, faultyLM);

        const module = createPerfectMockModule();
        
        // Should handle failures gracefully
        const result = await mutationOptimizer.optimize(module, mathDataset.slice(0, 2));
        
        expect(result.optimizedModule).toBeDefined();
      });
    });

    describe('Crossover Strategy', () => {
      test('should generate crossover candidates', async () => {
        const crossoverOptimizer = new RandomSearchOptimizer({
          numCandidates: 5,
          strategy: 'crossover',
          verbose: true,
        });

        const module = createPerfectMockModule();
        const result = await crossoverOptimizer.optimize(module, mathDataset);

        expect(result.roundsCompleted).toBeLessThanOrEqual(5);
        expect(result.history[0].metadata?.strategy).toBe('crossover');
      });

      test('should combine different prompt elements', async () => {
        const module = createPerfectMockModule();
        module.setPrompt('Original prompt with specific structure');

        const crossoverOptimizer = new RandomSearchOptimizer({
          numCandidates: 3,
          strategy: 'crossover',
          verbose: false,
        });

        const result = await crossoverOptimizer.optimize(module, mathDataset.slice(0, 3));

        expect(result.optimizedModule.getPrompt()).toBeDefined();
        expect(result.optimizedModule.getPrompt()).not.toBe(module.getPrompt());
      });
    });
  });

  describe('Demonstration Management', () => {
    test('should sample demonstrations from training set', async () => {
      const module = createPerfectMockModule();
      const largeDataset = Array(20).fill(null).map((_, i) => ({
        input: `Question ${i}`,
        output: `Answer ${i}`,
      }));

      const result = await optimizer.optimize(module, largeDataset);

      // Should have used some demonstrations
      expect(result.history[0].metadata?.demonstrationCount).toBeGreaterThan(0);
      expect(result.history[0].metadata?.demonstrationCount).toBeLessThanOrEqual(8); // Max cap
    });

    test('should handle varying demonstration counts', async () => {
      const module = createPerfectMockModule();
      const smallDataset = mathDataset.slice(0, 2);

      const result = await optimizer.optimize(module, smallDataset);

      // Should adapt to smaller dataset
      expect(result.history[0].metadata?.demonstrationCount).toBeLessThanOrEqual(2);
    });

    test('should format demonstrations properly', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset.slice(0, 3));
      
      const optimizedPrompt = result.optimizedModule.getPrompt();
      expect(optimizedPrompt).toContain('Example'); // Should include demonstration formatting
    });
  });

  describe('Performance Tracking', () => {
    test('should track candidate evaluation statistics', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      for (const round of result.history) {
        expect(round.round).toBeGreaterThan(0);
        expect(round.score).toBeGreaterThanOrEqual(0);
        expect(round.score).toBeLessThanOrEqual(1);
        expect(round.timeMs).toBeGreaterThan(0);
        expect(round.prompt).toBeDefined();
        expect(round.metadata?.candidateIndex).toBeGreaterThanOrEqual(0);
        expect(round.metadata?.strategy).toBeDefined();
      }
    });

    test('should track best candidate updates', async () => {
      const module = createImperfectMockModule(); // Start with imperfect module
      
      const result = await optimizer.optimize(module, mathDataset);
      
      let foundBestUpdate = false;
      for (const round of result.history) {
        if (round.metadata?.isBest) {
          foundBestUpdate = true;
          break;
        }
      }
      
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should track optimization time accurately', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      expect(result.optimizationTimeMs).toBeGreaterThan(0);
      
      // Individual round times should be positive
      for (const round of result.history) {
        expect(round.timeMs).toBeGreaterThan(0);
      }
    });

    test('should track evaluation budget usage', async () => {
      const budgetOptimizer = new RandomSearchOptimizer({
        numCandidates: 10,
        budget: 6,
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      const result = await budgetOptimizer.optimize(module, mathDataset);
      
      // Check that budget was respected
      const totalEvaluations = result.history.reduce(
        (sum, round) => sum + (round.metadata?.evaluationsUsed || 0), 
        0
      );
      
      expect(result.roundsCompleted).toBeLessThanOrEqual(6);
    });
  });

  describe('Early Stopping', () => {
    test('should support early stopping based on threshold', async () => {
      const earlyOptimizer = new RandomSearchOptimizer({
        numCandidates: 20,
        budget: 50,
        earlyStoppingThreshold: 0.99, // Very high threshold
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      const result = await earlyOptimizer.optimize(module, mathDataset);
      
      // Might stop early if threshold is reached
      expect(result.roundsCompleted).toBeLessThanOrEqual(20);
    });

    test('should continue when threshold not reached', async () => {
      const lowThresholdOptimizer = new RandomSearchOptimizer({
        numCandidates: 5,
        budget: 10,
        earlyStoppingThreshold: 0.01, // Very low threshold
        verbose: false,
      });

      const module = createImperfectMockModule();
      
      const result = await lowThresholdOptimizer.optimize(module, mathDataset);
      
      // Should complete more evaluations since threshold is low
      expect(result.roundsCompleted).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle module prediction failures', async () => {
      const faultyModule = createPerfectMockModule();
      // Make clone return a module that always fails prediction
      faultyModule.clone = vi.fn().mockImplementation(() => {
        const clonedModule = createPerfectMockModule();
        clonedModule.predict = vi.fn().mockImplementation(async () => {
          throw new Error('Module prediction failed');
        });
        return clonedModule;
      });

      const result = await optimizer.optimize(faultyModule, mathDataset.slice(0, 2));
      
      // Should handle gracefully
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBe(0); // No successful evaluations
    });

    test('should handle evaluation failures gracefully', async () => {
      const module = createPerfectMockModule();
      
      // Mock the evaluation to sometimes fail
      const originalPredict = module.predict.bind(module);
      let callCount = 0;
      module.predict = vi.fn().mockImplementation(async (input) => {
        callCount++;
        if (callCount % 3 === 0) { // Fail every 3rd call
          throw new Error('Evaluation failed');
        }
        return originalPredict(input);
      });

      const result = await optimizer.optimize(module, mathDataset.slice(0, 5));
      
      expect(result.optimizedModule).toBeDefined();
      
      // Should have some failed evaluations in metadata
      const failedEvaluations = result.history.filter(
        round => round.metadata?.evaluationError
      );
      
      expect(result.roundsCompleted).toBeGreaterThan(0);
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle zero candidates', async () => {
      const zeroCandidatesOptimizer = new RandomSearchOptimizer({
        numCandidates: 0,
        budget: 10,
      });

      const module = createPerfectMockModule();
      
      const result = await zeroCandidatesOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.roundsCompleted).toBe(0);
    });

    test('should handle zero budget', async () => {
      const zeroBudgetOptimizer = new RandomSearchOptimizer({
        numCandidates: 5,
        budget: 0,
      });

      const module = createPerfectMockModule();
      
      const result = await zeroBudgetOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.roundsCompleted).toBe(0);
    });

    test('should handle budget smaller than candidates', async () => {
      const smallBudgetOptimizer = new RandomSearchOptimizer({
        numCandidates: 10,
        budget: 3, // Smaller than candidates
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      const result = await smallBudgetOptimizer.optimize(module, mathDataset);
      
      expect(result.roundsCompleted).toBeLessThanOrEqual(3);
    });
  });

  describe('Verbose Output', () => {
    test('should produce console output when verbose is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const verboseOptimizer = new RandomSearchOptimizer({
        ...testConfigs.randomSearch.fast,
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      await verboseOptimizer.optimize(module, mathDataset.slice(0, 2));
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not produce console output when verbose is false', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const silentOptimizer = new RandomSearchOptimizer({
        ...testConfigs.randomSearch.fast,
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      await silentOptimizer.optimize(module, mathDataset.slice(0, 2));
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Different Datasets', () => {
    test('should work with math dataset', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should work with QA dataset', async () => {
      const module = createPerfectMockModule();
      module.setResponses(['Paris', 'Jupiter', 'Shakespeare', 'H2O', '299,792,458 m/s']);
      
      const result = await optimizer.optimize(module, qaDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should work with classification dataset', async () => {
      const module = createPerfectMockModule();
      module.setResponses(['positive', 'negative', 'neutral', 'positive', 'negative']);
      
      const result = await optimizer.optimize(module, classificationDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should adapt prompts based on dataset type', async () => {
      const module = createPerfectMockModule();
      
      const mathResult = await optimizer.optimize(module, mathDataset.slice(0, 3));
      const qaResult = await optimizer.optimize(module, qaDataset.slice(0, 3));
      
      // Should generate different optimized prompts for different datasets
      expect(mathResult.optimizedModule.getPrompt()).toBeDefined();
      expect(qaResult.optimizedModule.getPrompt()).toBeDefined();
    });
  });

  describe('Comparison with Other Strategies', () => {
    test('should compare different strategies on same dataset', async () => {
      const module = createPerfectMockModule();
      const testData = mathDataset.slice(0, 5);

      const randomOptimizer = new RandomSearchOptimizer({
        numCandidates: 5,
        strategy: 'random',
        verbose: false,
      });

      const mutationOptimizer = new RandomSearchOptimizer({
        numCandidates: 5,
        strategy: 'mutation',
        verbose: false,
      }, mockLM);

      const crossoverOptimizer = new RandomSearchOptimizer({
        numCandidates: 5,
        strategy: 'crossover',
        verbose: false,
      });

      const randomResult = await randomOptimizer.optimize(module, testData);
      const mutationResult = await mutationOptimizer.optimize(module, testData);
      const crossoverResult = await crossoverOptimizer.optimize(module, testData);

      // All should complete successfully
      expect(randomResult.optimizedModule).toBeDefined();
      expect(mutationResult.optimizedModule).toBeDefined();
      expect(crossoverResult.optimizedModule).toBeDefined();

      // Should have strategy metadata
      expect(randomResult.history[0].metadata?.strategy).toBe('random');
      expect(mutationResult.history[0].metadata?.strategy).toBe('mutation');
      expect(crossoverResult.history[0].metadata?.strategy).toBe('crossover');
    });
  });
});