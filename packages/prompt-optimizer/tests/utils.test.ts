/**
 * Tests for utility functions and mock implementations
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  MockModule,
  MockLanguageModel,
  createMockModule,
  createMockLanguageModel,
  createTestDataset,
  measureOptimizationPerformance,
} from '../src/utils/index.js';
import type { GenerationOptions } from '../src/types/index.js';

describe('MockModule', () => {
  let mockModule: MockModule;

  beforeEach(() => {
    mockModule = new MockModule('Test prompt', ['response1', 'response2', 'response3']);
  });

  describe('Basic Functionality', () => {
    test('should initialize with prompt and responses', () => {
      expect(mockModule.getPrompt()).toBe('Test prompt');
    });

    test('should predict with cycling responses', async () => {
      const prediction1 = await mockModule.predict('input1');
      const prediction2 = await mockModule.predict('input2');
      const prediction3 = await mockModule.predict('input3');
      const prediction4 = await mockModule.predict('input4'); // Should cycle back

      expect(prediction1.output).toBe('response1');
      expect(prediction2.output).toBe('response2');
      expect(prediction3.output).toBe('response3');
      expect(prediction4.output).toBe('response1'); // Cycled back
    });

    test('should handle string and object inputs', async () => {
      const stringPrediction = await mockModule.predict('string input');
      const objectPrediction = await mockModule.predict({ key: 'value' });

      expect(stringPrediction.output).toBe('response1');
      expect(objectPrediction.output).toBe('response2');
      expect(stringPrediction.metadata?.input).toBe('string input');
      expect(objectPrediction.metadata?.input).toBe('{"key":"value"}');
    });

    test('should return metadata with predictions', async () => {
      const prediction = await mockModule.predict('test');

      expect(prediction.confidence).toBe(0.9);
      expect(prediction.metadata).toBeDefined();
      expect(prediction.metadata?.prompt).toBe('Test prompt');
      expect(prediction.metadata?.usage).toBeDefined();
      expect(prediction.metadata?.usage.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('Prompt Management', () => {
    test('should allow prompt modification', () => {
      mockModule.setPrompt('New prompt');
      expect(mockModule.getPrompt()).toBe('New prompt');
    });

    test('should include updated prompt in metadata', async () => {
      mockModule.setPrompt('Updated prompt');
      const prediction = await mockModule.predict('test');

      expect(prediction.metadata?.prompt).toBe('Updated prompt');
    });
  });

  describe('Response Management', () => {
    test('should allow response modification', () => {
      mockModule.setResponses(['new1', 'new2']);
      
      expect(mockModule.predict('test')).resolves.toMatchObject({
        output: 'new1'
      });
    });

    test('should reset response index', async () => {
      await mockModule.predict('test'); // response1
      await mockModule.predict('test'); // response2
      
      mockModule.resetResponseIndex();
      const prediction = await mockModule.predict('test');
      
      expect(prediction.output).toBe('response1'); // Back to first
    });

    test('should track response index', async () => {
      expect(mockModule.getResponseIndex()).toBe(0);
      
      await mockModule.predict('test');
      expect(mockModule.getResponseIndex()).toBe(1);
      
      await mockModule.predict('test');
      expect(mockModule.getResponseIndex()).toBe(2);
    });
  });

  describe('Cloning', () => {
    test('should clone module correctly', async () => {
      await mockModule.predict('test'); // Advance index
      mockModule.setPrompt('Modified prompt');
      
      const cloned = mockModule.clone();
      
      expect(cloned.getPrompt()).toBe('Modified prompt');
      expect(cloned.getResponseIndex()).toBe(1); // Should copy index
      
      // Original and clone should be independent
      cloned.setPrompt('Clone prompt');
      expect(mockModule.getPrompt()).toBe('Modified prompt');
    });

    test('should clone responses array', () => {
      const cloned = mockModule.clone();
      cloned.setResponses(['cloned response']);
      
      // Original should be unchanged
      expect(mockModule.predict('test')).resolves.toMatchObject({
        output: 'response1'
      });
    });
  });
});

describe('MockLanguageModel', () => {
  let mockLM: MockLanguageModel;

  beforeEach(() => {
    mockLM = new MockLanguageModel(['response1', 'response2'], 'test-model', 10);
  });

  describe('Basic Functionality', () => {
    test('should generate responses with cycling', async () => {
      const response1 = await mockLM.generate('prompt1');
      const response2 = await mockLM.generate('prompt2');
      const response3 = await mockLM.generate('prompt3'); // Should cycle

      expect(response1).toBe('response1');
      expect(response2).toBe('response2');
      expect(response3).toBe('response1'); // Cycled back
    });

    test('should return model name', () => {
      expect(mockLM.getModelName()).toBe('test-model');
    });

    test('should respect artificial delay', async () => {
      mockLM.setDelay(50);
      
      const startTime = Date.now();
      await mockLM.generate('test');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // Account for timing variations
    });
  });

  describe('Generation Options', () => {
    test('should handle maxTokens option', async () => {
      mockLM.setResponses(['This is a very long response that should be truncated']);
      
      const response = await mockLM.generate('test', { maxTokens: 5 }); // ~20 chars
      
      expect(response.length).toBeLessThanOrEqual(20);
    });

    test('should handle high temperature variation', async () => {
      mockLM.setResponses(['base response']);
      
      const lowTempResponse = await mockLM.generate('test', { temperature: 0.1 });
      const highTempResponse = await mockLM.generate('test', { temperature: 0.9 });
      
      expect(lowTempResponse).toBe('base response');
      expect(highTempResponse).toContain('base response'); // Should contain original but might be modified
    });

    test('should handle other generation options', async () => {
      const options: GenerationOptions = {
        temperature: 0.5,
        maxTokens: 100,
        stopSequences: ['STOP'],
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      };
      
      // Should not throw with various options
      expect(mockLM.generate('test', options)).resolves.toBeDefined();
    });
  });

  describe('Response Management', () => {
    test('should allow response modification', async () => {
      mockLM.setResponses(['new response']);
      
      const response = await mockLM.generate('test');
      expect(response).toBe('new response');
    });

    test('should reset response index', async () => {
      await mockLM.generate('test'); // First response
      
      mockLM.resetResponseIndex();
      const response = await mockLM.generate('test');
      
      expect(response).toBe('response1'); // Back to first
    });

    test('should handle delay changes', async () => {
      mockLM.setDelay(0); // No delay
      
      const startTime = Date.now();
      await mockLM.generate('test');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});

describe('Factory Functions', () => {
  describe('createMockModule', () => {
    test('should create module from QA pairs', () => {
      const qaPairs = [
        { input: 'What is 2+2?', output: '4' },
        { input: 'What is 3+3?', output: '6' },
      ];
      
      const module = createMockModule(qaPairs, 'Math solver: ');
      
      expect(module.getPrompt()).toBe('Math solver: ');
      
      // Should predict with the provided outputs
      expect(module.predict('test')).resolves.toMatchObject({ output: '4' });
    });

    test('should use default prompt when not provided', () => {
      const qaPairs = [{ input: 'test', output: 'result' }];
      const module = createMockModule(qaPairs);
      
      expect(module.getPrompt()).toBe('Answer the question: ');
    });
  });

  describe('createMockLanguageModel', () => {
    test('should create context-aware model', async () => {
      const contextResponses = {
        'math': 'I can help with math problems',
        'science': 'I know about science topics',
      };
      
      const model = createMockLanguageModel(contextResponses, 'I don\'t know', 'smart-model');
      
      expect(model.getModelName()).toBe('smart-model');
      
      const mathResponse = await model.generate('Help me with math problem');
      const scienceResponse = await model.generate('Explain this science concept');
      const unknownResponse = await model.generate('Random topic');
      
      expect(mathResponse).toBe('I can help with math problems');
      expect(scienceResponse).toBe('I know about science topics');
      expect(unknownResponse).toBe('I don\'t know');
    });

    test('should handle case insensitive context matching', async () => {
      const contextResponses = { 'MATH': 'Math response' };
      const model = createMockLanguageModel(contextResponses);
      
      const response = await model.generate('help with math');
      expect(response).toBe('Math response');
    });
  });
});

describe('Test Dataset Creation', () => {
  describe('createTestDataset', () => {
    test('should create math dataset', () => {
      const dataset = createTestDataset(5, 'math');
      
      expect(dataset).toHaveLength(5);
      
      for (const example of dataset) {
        expect(example.input).toMatch(/What is \d+ \+ \d+\?/);
        expect(example.output).toMatch(/^\d+$/);
      }
    });

    test('should create QA dataset', () => {
      const dataset = createTestDataset(3, 'qa');
      
      expect(dataset).toHaveLength(3);
      
      for (const example of dataset) {
        expect(typeof example.input).toBe('string');
        expect(typeof example.output).toBe('string');
        expect(example.input.endsWith('?')).toBe(true);
      }
    });

    test('should create classification dataset', () => {
      const dataset = createTestDataset(4, 'classification');
      
      expect(dataset).toHaveLength(4);
      
      for (const example of dataset) {
        expect(example.input).toMatch(/Classify the sentiment:/);
        expect(['positive', 'negative', 'neutral']).toContain(example.output);
      }
    });

    test('should default to math pattern', () => {
      const dataset = createTestDataset(2);
      
      expect(dataset).toHaveLength(2);
      expect(dataset[0].input).toMatch(/What is \d+ \+ \d+\?/);
    });
  });
});

describe('Performance Measurement', () => {
  describe('measureOptimizationPerformance', () => {
    test('should measure successful operation', async () => {
      const testOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { result: 'success' };
      };
      
      const measurement = await measureOptimizationPerformance(testOperation, 'Test Op');
      
      expect(measurement.result).toEqual({ result: 'success' });
      expect(measurement.timeMs).toBeGreaterThanOrEqual(40);
      expect(measurement.memoryUsed).toBeGreaterThanOrEqual(0);
    });

    test('should handle operation failures', async () => {
      const failingOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Operation failed');
      };
      
      await expect(
        measureOptimizationPerformance(failingOperation, 'Failing Op')
      ).rejects.toThrow('Operation failed');
    });

    test('should use default label when not provided', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const quickOperation = async () => 'done';
      
      await measureOptimizationPerformance(quickOperation);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Operation completed')
      );
      
      consoleSpy.mockRestore();
    });

    test('should log memory usage when available', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock process.memoryUsage to return different values
      const originalMemoryUsage = process.memoryUsage;
      let callCount = 0;
      process.memoryUsage = vi.fn().mockImplementation(() => {
        callCount++;
        return {
          heapUsed: callCount === 1 ? 1000000 : 2000000, // 1MB increase
          rss: 0,
          heapTotal: 0,
          external: 0,
          arrayBuffers: 0,
        };
      });
      
      const memoryOperation = async () => 'done';
      
      await measureOptimizationPerformance(memoryOperation, 'Memory Test');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Memory used:')
      );
      
      process.memoryUsage = originalMemoryUsage;
      consoleSpy.mockRestore();
    });
  });
});