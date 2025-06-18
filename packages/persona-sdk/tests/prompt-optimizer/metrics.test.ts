/**
 * Tests for metrics system
 * Following DSPy testing patterns for metrics
 */

import { describe, test, expect } from 'vitest';
import {
  answerExactMatch,
  answerPassageMatch,
  answerFuzzyMatch,
  answerContainsMatch,
  answerNumericMatch,
  createCompositeMetric,
  ExactMatch,
  PassageMatch,
  FuzzyMatch,
  ContainsMatch,
  NumericMatch,
  createExactMatchMetric,
  createFuzzyMatchMetric,
  createNumericMatchMetric,
} from '../../src/prompt-optimizer/metrics/index.js';
import type { Example, Prediction } from '../../src/prompt-optimizer/types/index.js';

describe('Answer Exact Match', () => {
  test('should return 1.0 for exact string matches', () => {
    const example: Example = { input: 'test', output: 'correct answer' };
    const prediction: Prediction = { output: 'correct answer' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return 0.0 for non-matching strings', () => {
    const example: Example = { input: 'test', output: 'correct answer' };
    const prediction: Prediction = { output: 'wrong answer' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle case insensitive matching', () => {
    const example: Example = { input: 'test', output: 'CORRECT ANSWER' };
    const prediction: Prediction = { output: 'correct answer' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should normalize whitespace', () => {
    const example: Example = { input: 'test', output: '  correct   answer  ' };
    const prediction: Prediction = { output: 'correct answer' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle array answers', () => {
    const example: Example = { input: 'test', output: ['answer1', 'answer2', 'answer3'] };
    const prediction: Prediction = { output: 'answer2' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle fractional matching for arrays', () => {
    const example: Example = { input: 'test', output: ['answer1', 'answer2'] };
    const prediction: Prediction = { output: 'answer1' };

    const score = answerExactMatch(example, prediction, undefined, 0.5);
    expect(score).toBe(1.0); // 1 match out of 2 * 0.5 = 1.0
  });

  test('should handle object inputs/outputs', () => {
    const example: Example = { input: 'test', output: { answer: 'correct' } };
    const prediction: Prediction = { output: 'correct' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });
});

describe('Answer Passage Match', () => {
  test('should return 1.0 when answer appears in context', () => {
    const example: Example = { input: 'test', output: 'Paris' };
    const prediction: Prediction = { 
      output: 'Paris',
      metadata: { context: ['The capital of France is Paris, a beautiful city.'] }
    };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return 0.0 when answer not in context', () => {
    const example: Example = { input: 'test', output: 'London' };
    const prediction: Prediction = { 
      output: 'London',
      metadata: { context: ['The capital of France is Paris, a beautiful city.'] }
    };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle multiple context passages', () => {
    const example: Example = { input: 'test', output: 'Jupiter' };
    const prediction: Prediction = { 
      output: 'Jupiter',
      metadata: { 
        context: [
          'Mercury is the closest planet.',
          'Jupiter is the largest planet in our solar system.',
          'Mars is known as the red planet.'
        ]
      }
    };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return 0.0 when no context available', () => {
    const example: Example = { input: 'test', output: 'answer' };
    const prediction: Prediction = { output: 'answer' };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle context from example', () => {
    const example: Example = { 
      input: 'test', 
      output: 'Rome',
      context: ['Rome is the capital of Italy and has ancient history.']
    };
    const prediction: Prediction = { output: 'Rome' };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle case insensitive context matching', () => {
    const example: Example = { input: 'test', output: 'PYTHON' };
    const prediction: Prediction = { 
      output: 'PYTHON',
      metadata: { context: ['Python is a popular programming language.'] }
    };

    const score = answerPassageMatch(example, prediction);
    expect(score).toBe(1.0);
  });
});

describe('Answer Fuzzy Match', () => {
  test('should return 1.0 for exact matches', () => {
    const example: Example = { input: 'test', output: 'exact match' };
    const prediction: Prediction = { output: 'exact match' };

    const score = answerFuzzyMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return high score for similar strings', () => {
    const example: Example = { input: 'test', output: 'color' };
    const prediction: Prediction = { output: 'colour' }; // British vs American spelling

    const score = answerFuzzyMatch(example, prediction, undefined, 0.8);
    expect(score).toBeGreaterThan(0.8);
  });

  test('should return 0.0 for very different strings', () => {
    const example: Example = { input: 'test', output: 'completely different' };
    const prediction: Prediction = { output: 'xyz' };

    const score = answerFuzzyMatch(example, prediction, undefined, 0.8);
    expect(score).toBe(0.0);
  });

  test('should handle threshold parameter', () => {
    const example: Example = { input: 'test', output: 'hello world' };
    const prediction: Prediction = { output: 'hello word' }; // typo

    const strictScore = answerFuzzyMatch(example, prediction, undefined, 0.95);
    const lenientScore = answerFuzzyMatch(example, prediction, undefined, 0.7);

    expect(lenientScore).toBeGreaterThan(strictScore);
  });

  test('should handle empty strings', () => {
    const example: Example = { input: 'test', output: '' };
    const prediction: Prediction = { output: '' };

    const score = answerFuzzyMatch(example, prediction);
    expect(score).toBe(1.0);
  });
});

describe('Answer Contains Match', () => {
  test('should return 1.0 when prediction contains expected answer', () => {
    const example: Example = { input: 'test', output: 'Paris' };
    const prediction: Prediction = { output: 'The capital is Paris and it is beautiful.' };

    const score = answerContainsMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return 0.0 when prediction does not contain expected answer', () => {
    const example: Example = { input: 'test', output: 'London' };
    const prediction: Prediction = { output: 'The capital is Paris.' };

    const score = answerContainsMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle case insensitive matching', () => {
    const example: Example = { input: 'test', output: 'PYTHON' };
    const prediction: Prediction = { output: 'I love programming in python' };

    const score = answerContainsMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle partial word matches', () => {
    const example: Example = { input: 'test', output: 'program' };
    const prediction: Prediction = { output: 'I am a programmer' };

    const score = answerContainsMatch(example, prediction);
    expect(score).toBe(1.0);
  });
});

describe('Answer Numeric Match', () => {
  test('should return 1.0 for exact numeric matches', () => {
    const example: Example = { input: 'test', output: '42' };
    const prediction: Prediction = { output: '42' };

    const score = answerNumericMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should return 1.0 for numbers within tolerance', () => {
    const example: Example = { input: 'test', output: '3.14159' };
    const prediction: Prediction = { output: '3.14160' }; // Very close

    const score = answerNumericMatch(example, prediction, undefined, 0.01);
    expect(score).toBe(1.0);
  });

  test('should return 0.0 for numbers outside tolerance', () => {
    const example: Example = { input: 'test', output: '100' };
    const prediction: Prediction = { output: '50' };

    const score = answerNumericMatch(example, prediction, undefined, 0.01);
    expect(score).toBe(0.0);
  });

  test('should return 0.0 for non-numeric strings', () => {
    const example: Example = { input: 'test', output: 'not a number' };
    const prediction: Prediction = { output: 'also not a number' };

    const score = answerNumericMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle mixed numeric and text', () => {
    const example: Example = { input: 'test', output: '42' };
    const prediction: Prediction = { output: 'not numeric' };

    const score = answerNumericMatch(example, prediction);
    expect(score).toBe(0.0);
  });

  test('should handle floating point precision', () => {
    const example: Example = { input: 'test', output: '0.1' };
    const prediction: Prediction = { output: '0.10000000000001' }; // Floating point error

    const score = answerNumericMatch(example, prediction, undefined, 0.001);
    expect(score).toBe(1.0);
  });
});

describe('Composite Metrics', () => {
  test('should combine multiple metrics with weights', () => {
    const exactMetric = { metric: ExactMatch, weight: 0.7 };
    const fuzzyMetric = { metric: FuzzyMatch, weight: 0.3 };
    
    const composite = createCompositeMetric([exactMetric, fuzzyMetric]);

    const example: Example = { input: 'test', output: 'hello' };
    const exactPrediction: Prediction = { output: 'hello' }; // Exact match
    const score = composite.evaluate(example, exactPrediction);

    expect(score).toBeGreaterThan(0.7); // Should be weighted toward exact match
    expect(composite.name).toContain('composite');
  });

  test('should handle equal weights', () => {
    const metric1 = { metric: ExactMatch, weight: 1.0 };
    const metric2 = { metric: ContainsMatch, weight: 1.0 };
    
    const composite = createCompositeMetric([metric1, metric2]);

    const example: Example = { input: 'test', output: 'test' };
    const prediction: Prediction = { output: 'this is a test' }; // Contains but not exact

    const score = composite.evaluate(example, prediction);
    expect(score).toBe(0.5); // Average of 0 and 1
  });
});

describe('Pre-built Metric Instances', () => {
  test('ExactMatch instance should work correctly', () => {
    const example: Example = { input: 'test', output: 'answer' };
    const prediction: Prediction = { output: 'answer' };

    const score = ExactMatch.evaluate(example, prediction);
    expect(score).toBe(1.0);
    expect(ExactMatch.name).toBe('exact_match');
  });

  test('PassageMatch instance should work correctly', () => {
    const example: Example = { input: 'test', output: 'answer' };
    const prediction: Prediction = { 
      output: 'answer',
      metadata: { context: ['The answer is correct.'] }
    };

    const score = PassageMatch.evaluate(example, prediction);
    expect(score).toBe(1.0);
    expect(PassageMatch.name).toBe('passage_match');
  });

  test('FuzzyMatch instance should work correctly', () => {
    const example: Example = { input: 'test', output: 'color' };
    const prediction: Prediction = { output: 'colour' };

    const score = FuzzyMatch.evaluate(example, prediction);
    expect(score).toBeGreaterThan(0.8);
    expect(FuzzyMatch.name).toBe('fuzzy_match');
  });

  test('ContainsMatch instance should work correctly', () => {
    const example: Example = { input: 'test', output: 'key' };
    const prediction: Prediction = { output: 'the key to success' };

    const score = ContainsMatch.evaluate(example, prediction);
    expect(score).toBe(1.0);
    expect(ContainsMatch.name).toBe('contains_match');
  });

  test('NumericMatch instance should work correctly', () => {
    const example: Example = { input: 'test', output: '3.14159' };
    const prediction: Prediction = { output: '3.14160' };

    const score = NumericMatch.evaluate(example, prediction);
    expect(score).toBe(1.0);
    expect(NumericMatch.name).toBe('numeric_match');
  });
});

describe('Factory Functions', () => {
  test('createExactMatchMetric should create metric with custom fraction', () => {
    const metric = createExactMatchMetric(0.5);
    
    expect(metric.name).toBe('exact_match_0.5');
    
    const example: Example = { input: 'test', output: ['a', 'b'] };
    const prediction: Prediction = { output: 'a' };
    
    const score = metric.evaluate(example, prediction);
    expect(score).toBe(1.0); // 1 match out of 2 with frac=0.5
  });

  test('createFuzzyMatchMetric should create metric with custom threshold', () => {
    const metric = createFuzzyMatchMetric(0.9);
    
    expect(metric.name).toBe('fuzzy_match_0.9');
    
    const example: Example = { input: 'test', output: 'test' };
    const prediction: Prediction = { output: 'tests' }; // Small difference
    
    const score = metric.evaluate(example, prediction);
    expect(score).toBeGreaterThanOrEqual(0.0);
  });

  test('createNumericMatchMetric should create metric with custom tolerance', () => {
    const metric = createNumericMatchMetric(0.1);
    
    expect(metric.name).toBe('numeric_match_0.1');
    
    const example: Example = { input: 'test', output: '1.0' };
    const prediction: Prediction = { output: '1.05' }; // Within 10% tolerance
    
    const score = metric.evaluate(example, prediction);
    expect(score).toBe(1.0);
  });
});

describe('Edge Cases', () => {
  test('should handle null and undefined inputs gracefully', () => {
    const example: Example = { input: 'test', output: null as any };
    const prediction: Prediction = { output: undefined as any };

    expect(() => answerExactMatch(example, prediction)).not.toThrow();
    expect(() => answerFuzzyMatch(example, prediction)).not.toThrow();
    expect(() => answerContainsMatch(example, prediction)).not.toThrow();
  });

  test('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const example: Example = { input: 'test', output: longString };
    const prediction: Prediction = { output: longString };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle special characters and unicode', () => {
    const example: Example = { input: 'test', output: '🎉 Special chars: áéíóú' };
    const prediction: Prediction = { output: '🎉 Special chars: áéíóú' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });

  test('should handle complex nested objects', () => {
    const complexObject = {
      nested: { value: 'test', array: [1, 2, 3] },
      answer: 'complex'
    };
    
    const example: Example = { input: 'test', output: complexObject };
    const prediction: Prediction = { output: 'complex' };

    const score = answerExactMatch(example, prediction);
    expect(score).toBe(1.0);
  });
});