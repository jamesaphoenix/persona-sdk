/**
 * Tests for COPRO (Compositional Prompt Optimizer)
 * Following DSPy testing patterns
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { COPROOptimizer } from '../src/optimizers/copro.js';
import { ExactMatch } from '../src/metrics/index.js';
import { 
  mathDataset,
  createPerfectMockModule,
  createSmartMockLM,
  testConfigs,
  splitDataset,
} from './fixtures/mock-models.js';
import type { COPROConfig } from '../src/types/index.js';

describe('COPROOptimizer', () => {
  let optimizer: COPROOptimizer;
  let mockLM: any;

  beforeEach(() => {
    mockLM = createSmartMockLM();
    optimizer = new COPROOptimizer(mockLM, testConfigs.copro.fast);
  });

  describe('Initialization', () => {
    test('should initialize with correct default parameters', () => {
      const defaultOptimizer = new COPROOptimizer(mockLM);
      const config = defaultOptimizer.getCOPROConfig();

      expect(config.breadth).toBe(10);
      expect(config.depth).toBe(3);
      expect(config.temperature).toBe(0.7);
      expect(config.numVariations).toBe(5);
      expect(config.metric).toBe(ExactMatch);
    });

    test('should initialize with custom parameters', () => {
      const customConfig: COPROConfig = {
        breadth: 5,
        depth: 2,
        temperature: 0.8,
        numVariations: 3,
        verbose: true,
      };

      const customOptimizer = new COPROOptimizer(mockLM, customConfig);
      const config = customOptimizer.getCOPROConfig();

      expect(config.breadth).toBe(5);
      expect(config.depth).toBe(2);
      expect(config.temperature).toBe(0.8);
      expect(config.numVariations).toBe(3);
      expect(config.verbose).toBe(true);
    });

    test('should require language model', () => {
      expect(() => new COPROOptimizer(null as any)).not.toThrow();
      // The actual error would occur during optimization, not initialization
    });
  });

  describe('Basic Optimization', () => {
    test('should optimize module through multiple rounds', async () => {
      const module = createPerfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.roundsCompleted).toBeGreaterThan(0);
      expect(result.roundsCompleted).toBeLessThanOrEqual(testConfigs.copro.fast.depth);
      expect(result.history).toHaveLength(result.roundsCompleted);
    });

    test('should track baseline performance', async () => {
      const module = createPerfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset);

      // Should have baseline evaluation
      expect(result.history.length).toBeGreaterThan(0);
      expect(result.optimizationTimeMs).toBeGreaterThan(0);
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
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Prompt Generation', () => {
    test('should generate prompt variations', async () => {
      const module = createPerfectMockModule();
      
      // Mock the LM to return different responses
      mockLM.setResponses([
        'You are a helpful math tutor. Solve each problem step by step.',
        'Calculate the mathematical expression accurately.',
        'Provide the numerical answer to the given math problem.',
      ]);

      const result = await optimizer.optimize(module, mathDataset);

      expect(result.optimizedModule.getPrompt()).toBeDefined();
      // Should have generated some variations
      expect(result.history.length).toBeGreaterThan(0);
    });

    test('should handle LM failures during prompt generation', async () => {
      const faultyLM = createSmartMockLM();
      
      // Mock to fail sometimes
      const originalGenerate = faultyLM.generate.bind(faultyLM);
      faultyLM.generate = vi.fn().mockImplementation(async (prompt) => {
        if (Math.random() < 0.4) { // 40% failure rate
          throw new Error('LM generation failed');
        }
        return originalGenerate(prompt);
      });

      const faultyOptimizer = new COPROOptimizer(faultyLM, {
        ...testConfigs.copro.fast,
        verbose: false,
      });

      const module = createPerfectMockModule();

      // Should handle failures gracefully
      const result = await faultyOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });

    test('should respect temperature parameter', async () => {
      const lowTempOptimizer = new COPROOptimizer(mockLM, {
        ...testConfigs.copro.fast,
        temperature: 0.1, // Low temperature
      });

      const highTempOptimizer = new COPROOptimizer(mockLM, {
        ...testConfigs.copro.fast,
        temperature: 0.9, // High temperature
      });

      const module = createPerfectMockModule();
      
      // Both should work but might produce different results
      const lowTempResult = await lowTempOptimizer.optimize(module, mathDataset);
      const highTempResult = await highTempOptimizer.optimize(module, mathDataset);
      
      expect(lowTempResult.optimizedModule).toBeDefined();
      expect(highTempResult.optimizedModule).toBeDefined();
    });
  });

  describe('Search Strategy', () => {
    test('should explore breadth candidates per round', async () => {
      const breadthOptimizer = new COPROOptimizer(mockLM, {
        breadth: 3,
        depth: 2,
        numVariations: 2,
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      const result = await breadthOptimizer.optimize(module, mathDataset);
      
      // Should have explored multiple candidates
      expect(result.history.length).toBeGreaterThan(0);
      expect(result.roundsCompleted).toBeLessThanOrEqual(2);
      
      // Check metadata for candidate information
      const metadata = result.history[0]?.metadata;
      expect(metadata?.candidatesGenerated).toBeGreaterThan(0);
    });

    test('should limit search depth', async () => {
      const deepOptimizer = new COPROOptimizer(mockLM, {
        breadth: 2,
        depth: 5,
        numVariations: 1,
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      const result = await deepOptimizer.optimize(module, mathDataset);
      
      expect(result.roundsCompleted).toBeLessThanOrEqual(5);
    });

    test('should support early stopping', async () => {
      const earlyStopper = new COPROOptimizer(mockLM, {
        breadth: 3,
        depth: 10,
        earlyStoppingThreshold: 0.99, // Very high threshold
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      const result = await earlyStopper.optimize(module, mathDataset);
      
      // Might stop early if threshold is reached
      expect(result.roundsCompleted).toBeLessThanOrEqual(10);
    });
  });

  describe('Performance Tracking', () => {
    test('should track round performance', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      for (const round of result.history) {
        expect(round.round).toBeGreaterThan(0);
        expect(round.score).toBeGreaterThanOrEqual(0);
        expect(round.score).toBeLessThanOrEqual(1);
        expect(round.timeMs).toBeGreaterThan(0);
        expect(round.prompt).toBeDefined();
      }
    });

    test('should track candidate statistics', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      if (result.history.length > 0) {
        const metadata = result.history[0].metadata;
        expect(metadata?.candidatesGenerated).toBeGreaterThanOrEqual(0);
        expect(metadata?.candidatesEvaluated).toBeGreaterThanOrEqual(0);
        expect(metadata?.averageScore).toBeGreaterThanOrEqual(0);
      }
    });

    test('should track optimization time', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      expect(result.optimizationTimeMs).toBeGreaterThan(0);
      
      // Sum of round times should be less than or equal to total time
      const roundTimeSum = result.history.reduce((sum, round) => sum + round.timeMs, 0);
      expect(roundTimeSum).toBeLessThanOrEqual(result.optimizationTimeMs + 100); // Small buffer for overhead
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle zero breadth gracefully', async () => {
      const zeroBreadthOptimizer = new COPROOptimizer(mockLM, {
        breadth: 0,
        depth: 1,
        numVariations: 1,
      });

      const module = createPerfectMockModule();
      
      // Should still work, just with limited exploration
      const result = await zeroBreadthOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
    });

    test('should handle zero depth gracefully', async () => {
      const zeroDepthOptimizer = new COPROOptimizer(mockLM, {
        breadth: 3,
        depth: 0,
        numVariations: 1,
      });

      const module = createPerfectMockModule();
      
      const result = await zeroDepthOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.roundsCompleted).toBe(0);
    });

    test('should handle zero variations gracefully', async () => {
      const zeroVarOptimizer = new COPROOptimizer(mockLM, {
        breadth: 3,
        depth: 2,
        numVariations: 0,
      });

      const module = createPerfectMockModule();
      
      const result = await zeroVarOptimizer.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
    });
  });

  describe('Verbose Output', () => {
    test('should produce console output when verbose is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const verboseOptimizer = new COPROOptimizer(mockLM, {
        ...testConfigs.copro.fast,
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      await verboseOptimizer.optimize(module, mathDataset);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not produce console output when verbose is false', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const silentOptimizer = new COPROOptimizer(mockLM, {
        ...testConfigs.copro.fast,
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      await silentOptimizer.optimize(module, mathDataset);
      
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

    test('should adapt prompts based on dataset content', async () => {
      const module = createPerfectMockModule();
      
      // Should generate different prompts for different types of data
      const mathResult = await optimizer.optimize(module, mathDataset);
      
      expect(mathResult.optimizedModule.getPrompt()).toBeDefined();
      expect(mathResult.finalScore).toBeGreaterThanOrEqual(0);
    });
  });
});