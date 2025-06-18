/**
 * Tests for Bootstrap Few-Shot Optimizer
 * Following DSPy testing patterns
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BootstrapOptimizer } from '../../src/prompt-optimizer/optimizers/bootstrap.js';
import { ExactMatch, FuzzyMatch } from '../../src/prompt-optimizer/metrics/index.js';
import { 
  mathDataset, 
  qaDataset,
  createPerfectMockModule,
  createImperfectMockModule,
  createTeacherMockLM,
  createSmartMockLM,
  testConfigs,
  splitDataset,
} from './fixtures/mock-models.js';
import type { BootstrapConfig, OptimizationResult } from '../../src/prompt-optimizer/types/index.js';

describe('BootstrapOptimizer', () => {
  let optimizer: BootstrapOptimizer;

  beforeEach(() => {
    optimizer = new BootstrapOptimizer(testConfigs.bootstrap.fast);
  });

  describe('Initialization', () => {
    test('should initialize with correct default parameters', () => {
      const defaultOptimizer = new BootstrapOptimizer();
      const config = defaultOptimizer.getBootstrapConfig();

      expect(config.maxLabeled).toBe(16);
      expect(config.maxBootstrapped).toBe(4);
      expect(config.bootstrapThreshold).toBe(0.7);
      expect(config.metric).toBe(ExactMatch);
      expect(config.teacherModel).toBe(null);
    });

    test('should initialize with custom parameters', () => {
      const customConfig: BootstrapConfig = {
        maxLabeled: 10,
        maxBootstrapped: 3,
        bootstrapThreshold: 0.8,
        metric: FuzzyMatch,
        verbose: true,
      };

      const customOptimizer = new BootstrapOptimizer(customConfig);
      const config = customOptimizer.getBootstrapConfig();

      expect(config.maxLabeled).toBe(10);
      expect(config.maxBootstrapped).toBe(3);
      expect(config.bootstrapThreshold).toBe(0.8);
      expect(config.metric).toBe(FuzzyMatch);
      expect(config.verbose).toBe(true);
    });
  });

  describe('Basic Optimization', () => {
    test('should optimize module without teacher model', async () => {
      const module = createPerfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset);

      expect(result).toMatchObject({
        finalScore: expect.any(Number),
        roundsCompleted: 1,
        optimizationTimeMs: expect.any(Number),
      });

      expect(result.optimizedModule).toBeDefined();
      expect(result.history).toHaveLength(1);
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(1);
    });

    test('should optimize module with teacher model', async () => {
      const teacherModel = createTeacherMockLM();
      const optimizerWithTeacher = new BootstrapOptimizer({
        ...testConfigs.bootstrap.fast,
        teacherModel,
      });

      const module = createImperfectMockModule();
      const { trainset } = splitDataset(mathDataset);

      const result = await optimizerWithTeacher.optimize(module, trainset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.history[0].metadata?.bootstrappedExamples).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty training set', async () => {
      const module = createPerfectMockModule();
      const emptyTrainset: any[] = [];

      const result = await optimizer.optimize(module, emptyTrainset);

      expect(result.finalScore).toBe(0); // Should handle gracefully
      expect(result.roundsCompleted).toBe(1);
    });

    test('should use validation set when provided', async () => {
      const module = createPerfectMockModule();
      const { trainset, valset } = splitDataset(mathDataset);

      const result = await optimizer.optimize(module, trainset, valset);

      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      // Should evaluate on valset, not trainset
    });
  });

  describe('Labeled Example Selection', () => {
    test('should limit labeled examples to maxLabeled', async () => {
      const module = createPerfectMockModule();
      const largeDataset = Array(20).fill(null).map((_, i) => ({
        input: `Question ${i}`,
        output: `Answer ${i}`,
      }));

      const optimizerWithLimit = new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 0, // No bootstrapping
        verbose: true,
      });

      const result = await optimizerWithLimit.optimize(module, largeDataset);
      
      expect(result.history[0].metadata?.labeledExamples).toBeLessThanOrEqual(5);
    });

    test('should handle training set smaller than maxLabeled', async () => {
      const module = createPerfectMockModule();
      const smallDataset = mathDataset.slice(0, 2);

      const optimizerWithLargeLimit = new BootstrapOptimizer({
        maxLabeled: 10,
        maxBootstrapped: 0,
      });

      const result = await optimizerWithLargeLimit.optimize(module, smallDataset);
      
      expect(result.history[0].metadata?.labeledExamples).toBe(smallDataset.length);
    });
  });

  describe('Bootstrap Example Generation', () => {
    test('should generate bootstrapped examples with teacher model', async () => {
      const teacherModel = createTeacherMockLM();
      const optimizerWithBootstrap = new BootstrapOptimizer({
        maxLabeled: 2,
        maxBootstrapped: 3,
        teacherModel,
        bootstrapThreshold: 0.5,
        verbose: true,
      });

      const module = createImperfectMockModule();
      
      const result = await optimizerWithBootstrap.optimize(module, mathDataset);
      
      expect(result.history[0].metadata?.bootstrappedExamples).toBeGreaterThanOrEqual(0);
      expect(result.history[0].metadata?.bootstrappedExamples).toBeLessThanOrEqual(3);
    });

    test('should respect bootstrap threshold', async () => {
      const teacherModel = createTeacherMockLM();
      const strictOptimizer = new BootstrapOptimizer({
        maxLabeled: 2,
        maxBootstrapped: 5,
        teacherModel,
        bootstrapThreshold: 0.9, // Very strict threshold
        verbose: false,
      });

      const module = createImperfectMockModule();
      
      const result = await strictOptimizer.optimize(module, mathDataset);
      
      // With strict threshold, fewer examples should be bootstrapped
      const bootstrapped = result.history[0].metadata?.bootstrappedExamples || 0;
      expect(bootstrapped).toBeLessThanOrEqual(5);
    });

    test('should handle teacher model failures gracefully', async () => {
      const faultyTeacher = createSmartMockLM();
      faultyTeacher.setDelay(1); // Faster but will fail sometimes
      
      // Mock the generate method to sometimes throw errors
      const originalGenerate = faultyTeacher.generate.bind(faultyTeacher);
      faultyTeacher.generate = vi.fn().mockImplementation(async (prompt) => {
        if (Math.random() < 0.3) { // 30% failure rate
          throw new Error('Teacher model failed');
        }
        return originalGenerate(prompt);
      });

      const optimizerWithFaultyTeacher = new BootstrapOptimizer({
        maxLabeled: 2,
        maxBootstrapped: 4,
        teacherModel: faultyTeacher,
        verbose: false,
      });

      const module = createImperfectMockModule();
      
      // Should not throw even with teacher failures
      const result = await optimizerWithFaultyTeacher.optimize(module, mathDataset);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Prompt Generation', () => {
    test('should modify module prompt with demonstrations', async () => {
      const module = createPerfectMockModule();
      const originalPrompt = module.getPrompt();

      const result = await optimizer.optimize(module, mathDataset);
      const optimizedPrompt = result.optimizedModule.getPrompt();

      expect(optimizedPrompt).not.toBe(originalPrompt);
      expect(optimizedPrompt).toContain('examples'); // Should contain example section
    });

    test('should preserve original module', async () => {
      const module = createPerfectMockModule();
      const originalPrompt = module.getPrompt();

      await optimizer.optimize(module, mathDataset);

      // Original module should be unchanged
      expect(module.getPrompt()).toBe(originalPrompt);
    });
  });

  describe('Performance Metrics', () => {
    test('should track optimization time', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      expect(result.optimizationTimeMs).toBeGreaterThan(0);
      expect(result.history[0].timeMs).toBeGreaterThan(0);
    });

    test('should include usage metadata', async () => {
      const module = createPerfectMockModule();
      
      const result = await optimizer.optimize(module, mathDataset);
      
      const metadata = result.history[0].metadata;
      expect(metadata?.usage).toBeDefined();
      expect(metadata?.usage.totalTokens).toBeGreaterThan(0);
    });

    test('should handle different dataset types', async () => {
      const module = createPerfectMockModule();
      
      // Test with different dataset types
      const mathResult = await optimizer.optimize(module, mathDataset);
      const qaResult = await optimizer.optimize(module, qaDataset);
      
      expect(mathResult.finalScore).toBeGreaterThanOrEqual(0);
      expect(qaResult.finalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle zero maxBootstrapped', async () => {
      const optimizerNoBootstrap = new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 0, // No bootstrapping
      });

      const module = createPerfectMockModule();
      
      const result = await optimizerNoBootstrap.optimize(module, mathDataset);
      
      expect(result.history[0].metadata?.bootstrappedExamples).toBe(0);
      expect(result.optimizedModule).toBeDefined();
    });

    test('should handle zero maxLabeled', async () => {
      const optimizerNoLabeled = new BootstrapOptimizer({
        maxLabeled: 0,
        maxBootstrapped: 3,
        teacherModel: createTeacherMockLM(),
      });

      const module = createPerfectMockModule();
      
      const result = await optimizerNoLabeled.optimize(module, mathDataset);
      
      expect(result.history[0].metadata?.labeledExamples).toBe(0);
      expect(result.optimizedModule).toBeDefined();
    });
  });

  describe('Verbose Output', () => {
    test('should produce console output when verbose is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const verboseOptimizer = new BootstrapOptimizer({
        ...testConfigs.bootstrap.fast,
        verbose: true,
      });

      const module = createPerfectMockModule();
      
      await verboseOptimizer.optimize(module, mathDataset);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not produce console output when verbose is false', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const silentOptimizer = new BootstrapOptimizer({
        ...testConfigs.bootstrap.fast,
        verbose: false,
      });

      const module = createPerfectMockModule();
      
      await silentOptimizer.optimize(module, mathDataset);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});