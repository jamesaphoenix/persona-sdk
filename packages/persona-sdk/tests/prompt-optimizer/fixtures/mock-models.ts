/**
 * Mock models and fixtures for testing
 */

import { MockModule, MockLanguageModel, createMockModule, createMockLanguageModel } from '../../src/utils/index.js';
import type { Example } from '../../src/types/index.js';

// Standard test datasets
export const mathDataset: Example[] = [
  { input: 'What is 2 + 2?', output: '4' },
  { input: 'What is 5 + 3?', output: '8' },
  { input: 'What is 10 - 4?', output: '6' },
  { input: 'What is 3 * 3?', output: '9' },
  { input: 'What is 15 / 3?', output: '5' },
];

export const qaDataset: Example[] = [
  { input: 'What is the capital of France?', output: 'Paris' },
  { input: 'What is the largest planet?', output: 'Jupiter' },
  { input: 'Who wrote Romeo and Juliet?', output: 'Shakespeare' },
  { input: 'What is the chemical symbol for water?', output: 'H2O' },
  { input: 'What is the speed of light?', output: '299,792,458 m/s' },
];

export const classificationDataset: Example[] = [
  { input: 'I love this product!', output: 'positive' },
  { input: 'This is terrible quality.', output: 'negative' },
  { input: 'It\'s okay, nothing special.', output: 'neutral' },
  { input: 'Amazing service and fast delivery!', output: 'positive' },
  { input: 'Worst purchase ever.', output: 'negative' },
];

// Mock modules with different behaviors
export function createPerfectMockModule(): MockModule {
  // Always returns the correct answer for math problems
  const module = new MockModule('Solve this math problem: ');
  module.setResponses(['4', '8', '6', '9', '5']);
  return module;
}

export function createImperfectMockModule(): MockModule {
  // Sometimes gets answers wrong
  const module = new MockModule('Calculate: ');
  module.setResponses(['4', '7', '6', '10', '5']); // One wrong answer
  return module;
}

export function createRandomMockModule(): MockModule {
  // Returns random responses
  const module = new MockModule('Answer: ');
  module.setResponses(['42', 'maybe', 'error', 'correct', 'unknown']);
  return module;
}

// Mock language models with different capabilities
export function createSmartMockLM(): MockLanguageModel {
  return createMockLanguageModel({
    'math': 'You are a math expert. Solve problems step by step.',
    'question': 'You are a helpful assistant. Answer questions accurately.',
    'classify': 'You are a sentiment classifier. Return positive, negative, or neutral.',
    'improve': 'You are a prompt optimization expert. Make this prompt clearer and more specific.',
    'generate': 'You are a creative assistant. Generate helpful examples.',
  }, 'I need more context to help you.', 'smart-mock-gpt');
}

export function createTeacherMockLM(): MockLanguageModel {
  const responses = [
    '4', '8', '6', '9', '5', // Correct math answers
    'Paris', 'Jupiter', 'Shakespeare', 'H2O', '299,792,458 m/s', // Correct QA answers
    'positive', 'negative', 'neutral', 'positive', 'negative', // Correct classifications
  ];
  return new MockLanguageModel(responses, 'teacher-mock-gpt', 30);
}

export function createUnreliableMockLM(): MockLanguageModel {
  const responses = [
    'Error: Unable to process',
    'Please try again',
    'System overloaded',
    'Invalid request',
    'Timeout occurred',
  ];
  return new MockLanguageModel(responses, 'unreliable-mock-gpt', 100);
}

// Prompt templates for testing
export const testPrompts = {
  basic: 'Answer this question: ',
  detailed: 'You are a helpful assistant. Please provide a clear and accurate answer to the following question: ',
  structured: `You are an expert assistant. Follow these steps:
1. Read the question carefully
2. Think about the answer
3. Provide a concise response

Question: `,
  withExamples: `Answer the question based on these examples:
Example 1: Q: What is 1+1? A: 2
Example 2: Q: What is 2+2? A: 4

Question: `,
};

// Configuration presets for testing
export const testConfigs = {
  bootstrap: {
    fast: {
      maxLabeled: 3,
      maxBootstrapped: 2,
      maxRounds: 1,
      verbose: false,
    },
    thorough: {
      maxLabeled: 8,
      maxBootstrapped: 4,
      maxRounds: 3,
      verbose: true,
    },
  },
  copro: {
    fast: {
      breadth: 3,
      depth: 2,
      numVariations: 2,
      temperature: 0.5,
      verbose: false,
    },
    thorough: {
      breadth: 5,
      depth: 3,
      numVariations: 4,
      temperature: 0.7,
      verbose: true,
    },
  },
  randomSearch: {
    fast: {
      numCandidates: 5,
      budget: 10,
      strategy: 'random' as const,
      verbose: false,
    },
    thorough: {
      numCandidates: 12,
      budget: 25,
      strategy: 'mutation' as const,
      verbose: true,
    },
  },
};

// Helper functions for test setup
export function createTestModule(prompt: string = testPrompts.basic, correctAnswers: string[] = ['correct']): MockModule {
  const module = new MockModule(prompt);
  module.setResponses(correctAnswers);
  return module;
}

export function splitDataset(dataset: Example[], trainRatio: number = 0.7): { trainset: Example[]; valset: Example[] } {
  const trainSize = Math.floor(dataset.length * trainRatio);
  return {
    trainset: dataset.slice(0, trainSize),
    valset: dataset.slice(trainSize),
  };
}