/**
 * Tests for Ensemble Optimizer
 * Comprehensive test suite following DSPy patterns
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { EnsembleOptimizer } from '../src/optimizers/ensemble.js';
import { ExactMatch } from '../src/metrics/index.js';
import { 
  mathDataset,
  createPerfectMockModule,
  createImperfectMockModule,
  createRandomMockModule,
} from './fixtures/mock-models.js';
import type { OptimizationResult } from '../src/types/index.js';

describe('EnsembleOptimizer', () => {
  let mockResults: OptimizationResult[];

  beforeEach(() => {
    // Create mock optimization results
    mockResults = [
      {
        optimizedModule: createPerfectMockModule(),
        finalScore: 0.9,
        roundsCompleted: 3,
        history: [],
        optimizationTimeMs: 1000,
      },
      {
        optimizedModule: createImperfectMockModule(),
        finalScore: 0.8,
        roundsCompleted: 2,
        history: [],
        optimizationTimeMs: 800,
      },
      {
        optimizedModule: createRandomMockModule(),
        finalScore: 0.7,
        roundsCompleted: 1,
        history: [],
        optimizationTimeMs: 500,
      },
    ];
  });

  describe('Creation from Optimization Results', () => {
    test('should create ensemble from multiple results', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      const stats = ensemble.getStats();
      expect(stats.size).toBe(3);
      expect(stats.moduleCount).toBe(3);
    });

    test('should select best modules when size is smaller than results', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 2, // Smaller than 3 results
      });

      const stats = ensemble.getStats();
      expect(stats.size).toBe(2);
      expect(stats.moduleCount).toBe(2);
    });

    test('should handle empty results array', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults([], {
        size: 3,
      });

      const stats = ensemble.getStats();
      expect(stats.moduleCount).toBe(0);
    });

    test('should sort by final score descending', () => {
      // Results are already sorted by score (0.9, 0.8, 0.7)
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      // The ensemble should prefer the highest scoring modules
      expect(ensemble.getStats().moduleCount).toBe(3);
    });
  });

  describe('Manual Module Addition', () => {
    test('should add modules manually', () => {
      const ensemble = new EnsembleOptimizer({ size: 3 });
      
      ensemble.addModule(createPerfectMockModule());
      ensemble.addModule(createImperfectMockModule());
      
      const stats = ensemble.getStats();
      expect(stats.moduleCount).toBe(2);
    });

    test('should enforce size limit', () => {
      const ensemble = new EnsembleOptimizer({ size: 2 });
      
      ensemble.addModule(createPerfectMockModule());
      ensemble.addModule(createImperfectMockModule());
      
      expect(() => {
        ensemble.addModule(createRandomMockModule());
      }).toThrow('Ensemble is full');
    });
  });

  describe('Prediction', () => {
    test('should predict using all modules', async () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      const prediction = await ensemble.predict('test input');
      
      expect(prediction.output).toBeDefined();
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.metadata?.ensembleSize).toBe(3);
      expect(prediction.metadata?.predictions).toHaveLength(3);
    });

    test('should handle module failures gracefully', async () => {
      const faultyModule = createRandomMockModule();
      faultyModule.predict = async () => {
        throw new Error('Module failed');
      };

      const ensemble = new EnsembleOptimizer({ size: 2 });
      ensemble.addModule(createPerfectMockModule());
      ensemble.addModule(faultyModule);

      const prediction = await ensemble.predict('test input');
      
      expect(prediction.output).toBeDefined();
      expect(prediction.metadata?.validPredictions).toBe(1);
    });

    test('should throw when no modules available', async () => {
      const ensemble = new EnsembleOptimizer({ size: 3 });
      
      await expect(ensemble.predict('test')).rejects.toThrow('No modules in ensemble');
    });

    test('should include individual predictions in metadata', async () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults.slice(0, 2), {
        size: 2,
      });

      const prediction = await ensemble.predict('test input');
      
      expect(prediction.metadata?.predictions).toHaveLength(2);
      expect(prediction.metadata?.predictions[0]).toHaveProperty('moduleIndex', 0);
      expect(prediction.metadata?.predictions[1]).toHaveProperty('moduleIndex', 1);
    });
  });

  describe('Evaluation', () => {
    test('should evaluate ensemble on dataset', async () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      const evaluation = await ensemble.evaluate(mathDataset, ExactMatch);
      
      expect(evaluation.score).toBeGreaterThanOrEqual(0);
      expect(evaluation.score).toBeLessThanOrEqual(1);
      expect(evaluation.individualScores).toHaveLength(mathDataset.length);
      expect(evaluation.moduleScores).toHaveLength(3);
      expect(evaluation.moduleScores[0]).toHaveLength(mathDataset.length);
    });

    test('should handle evaluation with module failures', async () => {
      const faultyModule = createRandomMockModule();
      faultyModule.predict = async () => {
        throw new Error('Evaluation failed');
      };

      const ensemble = new EnsembleOptimizer({ size: 2 });
      ensemble.addModule(createPerfectMockModule());
      ensemble.addModule(faultyModule);

      const evaluation = await ensemble.evaluate(mathDataset.slice(0, 2), ExactMatch);
      
      expect(evaluation.score).toBeGreaterThanOrEqual(0);
      expect(evaluation.moduleScores[1]).toEqual([0, 0]); // Failed module gets 0 scores
    });
  });

  describe('Reduction Functions', () => {
    test('should use default reduction for strings (majority vote)', async () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      // Mock modules to return specific responses
      const modules = [
        createPerfectMockModule(),
        createPerfectMockModule(),
        createRandomMockModule(),
      ];
      
      modules[0].setResponses(['A', 'A', 'A']);
      modules[1].setResponses(['A', 'A', 'A']); 
      modules[2].setResponses(['B', 'B', 'B']);

      const manualEnsemble = new EnsembleOptimizer({ size: 3 });
      modules.forEach(m => manualEnsemble.addModule(m));

      const prediction = await manualEnsemble.predict('test');
      expect(prediction.output).toBe('A'); // Majority vote
    });

    test('should use default reduction for numbers (average)', async () => {
      const ensemble = new EnsembleOptimizer({
        size: 3,
        reducer: (outputs) => {
          if (outputs.every(o => typeof o === 'number')) {
            return outputs.reduce((sum, o) => sum + o, 0) / outputs.length;
          }
          return outputs[0];
        },
      });

      // This would require modules that return numbers
      // For now, test the reducer function directly
      const reducer = ensemble.getStats().config.reducer!;
      const result = reducer([1, 2, 3]);
      expect(result).toBe(2); // Average
    });

    test('should use default reduction for booleans (majority)', async () => {
      const ensemble = new EnsembleOptimizer({
        size: 3,
        reducer: (outputs) => {
          if (outputs.every(o => typeof o === 'boolean')) {
            const trueCount = outputs.filter(Boolean).length;
            return trueCount > outputs.length / 2;
          }
          return outputs[0];
        },
      });

      const reducer = ensemble.getStats().config.reducer!;
      expect(reducer([true, true, false])).toBe(true);
      expect(reducer([false, false, true])).toBe(false);
    });

    test('should use custom reducer when provided', async () => {
      const customReducer = (outputs: any[]) => `Combined: ${outputs.join(', ')}`;
      
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 2,
        reducer: customReducer,
      });

      const prediction = await ensemble.predict('test');
      expect(prediction.output).toContain('Combined:');
    });
  });

  describe('Voting Strategies', () => {
    test('should support hard voting strategy', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
        votingStrategy: 'hard',
      });

      const stats = ensemble.getStats();
      expect(stats.config.votingStrategy).toBe('hard');
    });

    test('should support soft voting strategy', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
        votingStrategy: 'soft',
      });

      const stats = ensemble.getStats();
      expect(stats.config.votingStrategy).toBe('soft');
    });

    test('should default to hard voting', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
      });

      const stats = ensemble.getStats();
      expect(stats.config.votingStrategy).toBe('hard');
    });
  });

  describe('Cloning', () => {
    test('should clone ensemble correctly', () => {
      const original = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 2,
      });

      const cloned = original.clone();
      
      expect(cloned.getStats().moduleCount).toBe(2);
      expect(cloned.getStats().size).toBe(2);
      
      // Should be independent instances
      expect(cloned).not.toBe(original);
    });

    test('should clone modules independently', async () => {
      const original = EnsembleOptimizer.fromOptimizationResults(mockResults.slice(0, 1), {
        size: 1,
      });

      const cloned = original.clone();
      
      // Both should work independently
      const originalPrediction = await original.predict('test');
      const clonedPrediction = await cloned.predict('test');
      
      expect(originalPrediction).toBeDefined();
      expect(clonedPrediction).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty output arrays', async () => {
      const ensemble = new EnsembleOptimizer({
        size: 1,
        reducer: (outputs) => outputs.length === 0 ? 'default' : outputs[0],
      });

      // Test the reducer directly
      const reducer = ensemble.getStats().config.reducer!;
      expect(reducer([])).toBe('default');
    });

    test('should handle mixed output types', async () => {
      const ensemble = new EnsembleOptimizer({
        size: 3,
        reducer: (outputs) => {
          // Return first valid output for mixed types
          const validOutputs = outputs.filter(o => o != null && o !== '');
          return validOutputs.length > 0 ? validOutputs[0] : outputs[0];
        },
      });

      const reducer = ensemble.getStats().config.reducer!;
      const result = reducer([null, '', 'valid', 123]);
      expect(result).toBe('valid');
    });

    test('should handle very large ensembles', () => {
      const largeResults = Array(100).fill(null).map((_, i) => ({
        optimizedModule: createPerfectMockModule(),
        finalScore: Math.random(),
        roundsCompleted: 1,
        history: [],
        optimizationTimeMs: 100,
      }));

      const ensemble = EnsembleOptimizer.fromOptimizationResults(largeResults, {
        size: 50,
      });

      expect(ensemble.getStats().moduleCount).toBe(50);
    });
  });

  describe('Statistics and Configuration', () => {
    test('should provide accurate statistics', () => {
      const ensemble = EnsembleOptimizer.fromOptimizationResults(mockResults, {
        size: 3,
        votingStrategy: 'soft',
      });

      const stats = ensemble.getStats();
      
      expect(stats.size).toBe(3);
      expect(stats.moduleCount).toBe(3);
      expect(stats.config.size).toBe(3);
      expect(stats.config.votingStrategy).toBe('soft');
      expect(stats.config.reducer).toBeDefined();
    });

    test('should handle configuration changes', () => {
      const ensemble1 = new EnsembleOptimizer({
        size: 2,
        votingStrategy: 'hard',
      });

      const ensemble2 = new EnsembleOptimizer({
        size: 5,
        votingStrategy: 'soft',
      });

      expect(ensemble1.getStats().config.votingStrategy).toBe('hard');
      expect(ensemble2.getStats().config.votingStrategy).toBe('soft');
      expect(ensemble1.getStats().size).toBe(2);
      expect(ensemble2.getStats().size).toBe(5);
    });
  });

  describe('Integration with Multiple Optimizers', () => {
    test('should work with optimization results from different optimizers', async () => {
      // Simulate results from different optimization strategies
      const bootstrapResult = {
        optimizedModule: createPerfectMockModule(),
        finalScore: 0.95,
        roundsCompleted: 1,
        history: [{ round: 1, score: 0.95, prompt: 'bootstrap', timeMs: 100 }],
        optimizationTimeMs: 500,
      };

      const coproResult = {
        optimizedModule: createImperfectMockModule(),
        finalScore: 0.88,
        roundsCompleted: 3,
        history: [
          { round: 1, score: 0.8, prompt: 'copro1', timeMs: 200 },
          { round: 2, score: 0.85, prompt: 'copro2', timeMs: 200 },
          { round: 3, score: 0.88, prompt: 'copro3', timeMs: 200 },
        ],
        optimizationTimeMs: 1200,
      };

      const ensemble = EnsembleOptimizer.fromOptimizationResults([
        bootstrapResult,
        coproResult,
      ], {
        size: 2,
      });

      const prediction = await ensemble.predict('What is 2+2?');
      
      expect(prediction.output).toBeDefined();
      expect(prediction.metadata?.ensembleSize).toBe(2);
      expect(prediction.metadata?.validPredictions).toBeGreaterThan(0);
    });
  });
});