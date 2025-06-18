/**
 * Utility functions and mock implementations for testing
 */

import type {
  Module,
  LanguageModel,
  Prediction,
  GenerationOptions,
} from '../types/index.js';

/**
 * Mock module implementation for testing
 */
export class MockModule implements Module {
  private prompt: string;
  private responses: string[];
  private responseIndex: number = 0;

  constructor(prompt: string = 'Default prompt', responses: string[] = ['Default response']) {
    this.prompt = prompt;
    this.responses = responses;
  }

  async predict(input: string | Record<string, any>): Promise<Prediction> {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input ?? '');
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Cycle through responses
    const response = this.responses[this.responseIndex % this.responses.length];
    this.responseIndex++;

    return {
      output: response,
      confidence: 0.9,
      metadata: {
        input: inputStr,
        prompt: this.prompt,
        processingTimeMs: 10,
        usage: {
          inputTokens: Math.floor((inputStr?.length || 0) / 4),
          outputTokens: Math.floor((response?.length || 0) / 4),
          totalTokens: Math.floor(((inputStr?.length || 0) + (response?.length || 0)) / 4),
        },
      },
    };
  }

  getPrompt(): string {
    return this.prompt;
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  clone(): Module {
    const cloned = new MockModule(this.prompt, [...this.responses]);
    cloned.responseIndex = this.responseIndex;
    return cloned;
  }

  /**
   * Set the responses this mock module will return
   */
  setResponses(responses: string[]): void {
    this.responses = responses;
    this.responseIndex = 0;
  }

  /**
   * Reset the response index
   */
  resetResponseIndex(): void {
    this.responseIndex = 0;
  }

  /**
   * Get the current response index
   */
  getResponseIndex(): number {
    return this.responseIndex;
  }
}

/**
 * Mock language model implementation for testing
 */
export class MockLanguageModel implements LanguageModel {
  private responses: string[];
  private responseIndex: number = 0;
  private modelName: string;
  private delay: number;

  constructor(
    responses: string[] = ['Mock response'],
    modelName: string = 'mock-model',
    delay: number = 50
  ) {
    this.responses = responses;
    this.modelName = modelName;
    this.delay = delay;
  }

  async generate(_prompt: string, options?: GenerationOptions): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    // Cycle through responses
    const response = this.responses[this.responseIndex % this.responses.length];
    this.responseIndex++;

    // Apply some basic transformations based on options
    let finalResponse = response;
    
    if (options?.maxTokens) {
      // Rough token approximation (4 chars per token)
      const maxChars = options.maxTokens * 4;
      finalResponse = finalResponse.substring(0, maxChars);
    }

    if (options?.temperature && options.temperature > 0.8) {
      // Add some variation for high temperature
      finalResponse = this.addVariation(finalResponse);
    }

    return finalResponse;
  }

  getModelName(): string {
    return this.modelName;
  }

  /**
   * Set the responses this mock model will return
   */
  setResponses(responses: string[]): void {
    this.responses = responses;
    this.responseIndex = 0;
  }

  /**
   * Reset the response index
   */
  resetResponseIndex(): void {
    this.responseIndex = 0;
  }

  /**
   * Set the artificial delay for responses
   */
  setDelay(delay: number): void {
    this.delay = delay;
  }

  /**
   * Add slight variation to responses for high temperature simulation
   */
  private addVariation(response: string): string {
    const variations = [
      response,
      response + '.',
      response.charAt(0).toUpperCase() + response.slice(1),
      response.replace(/\s+/g, ' ').trim(),
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }
}

/**
 * Factory function to create a mock module with predefined question-answer pairs
 */
export function createMockModule(
  qaePairs: Array<{ input: string; output: string }>,
  prompt: string = 'Answer the question: '
): MockModule {
  const responses = qaePairs.map(pair => pair.output);
  return new MockModule(prompt, responses);
}

/**
 * Factory function to create a mock language model with context-aware responses
 */
export function createMockLanguageModel(
  contextResponses: Record<string, string>,
  defaultResponse: string = 'I don\'t understand.',
  modelName: string = 'mock-gpt'
): MockLanguageModel {
  // Create a smart mock that responds based on prompt content
  const smartMock = new MockLanguageModel([defaultResponse], modelName);
  
  // Override the generate method to be context-aware
  const originalGenerate = smartMock.generate.bind(smartMock);
  smartMock.generate = async (prompt: string, options?: GenerationOptions) => {
    // Check if prompt contains any of the context keys
    for (const [context, response] of Object.entries(contextResponses)) {
      if (prompt.toLowerCase().includes(context.toLowerCase())) {
        return response;
      }
    }
    
    // Fall back to original behavior
    return originalGenerate(prompt, options);
  };
  
  return smartMock;
}

/**
 * Utility function to create test datasets
 */
export function createTestDataset(size: number, pattern: 'math' | 'qa' | 'classification' = 'math') {
  const examples = [];
  
  for (let i = 0; i < size; i++) {
    switch (pattern) {
      case 'math':
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        examples.push({
          input: `What is ${a} + ${b}?`,
          output: String(a + b),
        });
        break;
        
      case 'qa':
        const questions = [
          { q: 'What is the capital of France?', a: 'Paris' },
          { q: 'What is the largest planet?', a: 'Jupiter' },
          { q: 'Who wrote Romeo and Juliet?', a: 'Shakespeare' },
          { q: 'What is the chemical symbol for water?', a: 'H2O' },
        ];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        examples.push({
          input: randomQ.q,
          output: randomQ.a,
        });
        break;
        
      case 'classification':
        const sentiments = [
          { text: 'I love this product!', label: 'positive' },
          { text: 'This is terrible.', label: 'negative' },
          { text: 'It\'s okay, I guess.', label: 'neutral' },
          { text: 'Amazing quality!', label: 'positive' },
        ];
        const randomS = sentiments[Math.floor(Math.random() * sentiments.length)];
        examples.push({
          input: `Classify the sentiment: "${randomS.text}"`,
          output: randomS.label,
        });
        break;
    }
  }
  
  return examples;
}

/**
 * Utility function to measure optimization performance
 */
export async function measureOptimizationPerformance<T>(
  operation: () => Promise<T>,
  label: string = 'Operation'
): Promise<{ result: T; timeMs: number; memoryUsed?: number }> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage?.()?.heapUsed ?? 0;
  
  try {
    const result = await operation();
    const endTime = Date.now();
    const endMemory = process.memoryUsage?.()?.heapUsed ?? 0;
    
    const timeMs = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    
    console.log(`⏱️  ${label} completed in ${timeMs}ms`);
    if (memoryUsed > 0) {
      console.log(`🧠 Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return {
      result,
      timeMs,
      memoryUsed: memoryUsed,
    };
  } catch (error) {
    const endTime = Date.now();
    const timeMs = endTime - startTime;
    
    console.error(`❌ ${label} failed after ${timeMs}ms:`, error);
    throw error;
  }
}