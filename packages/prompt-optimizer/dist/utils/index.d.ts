/**
 * Utility functions and mock implementations for testing
 */
import type { Module, LanguageModel, Prediction, GenerationOptions } from '../types/index.js';
/**
 * Mock module implementation for testing
 */
export declare class MockModule implements Module {
    private prompt;
    private responses;
    private responseIndex;
    constructor(prompt?: string, responses?: string[]);
    predict(input: string | Record<string, any>): Promise<Prediction>;
    getPrompt(): string;
    setPrompt(prompt: string): void;
    clone(): Module;
    /**
     * Set the responses this mock module will return
     */
    setResponses(responses: string[]): void;
    /**
     * Reset the response index
     */
    resetResponseIndex(): void;
    /**
     * Get the current response index
     */
    getResponseIndex(): number;
}
/**
 * Mock language model implementation for testing
 */
export declare class MockLanguageModel implements LanguageModel {
    private responses;
    private responseIndex;
    private modelName;
    private delay;
    constructor(responses?: string[], modelName?: string, delay?: number);
    generate(prompt: string, options?: GenerationOptions): Promise<string>;
    getModelName(): string;
    /**
     * Set the responses this mock model will return
     */
    setResponses(responses: string[]): void;
    /**
     * Reset the response index
     */
    resetResponseIndex(): void;
    /**
     * Set the artificial delay for responses
     */
    setDelay(delay: number): void;
    /**
     * Add slight variation to responses for high temperature simulation
     */
    private addVariation;
}
/**
 * Factory function to create a mock module with predefined question-answer pairs
 */
export declare function createMockModule(qaePairs: Array<{
    input: string;
    output: string;
}>, prompt?: string): MockModule;
/**
 * Factory function to create a mock language model with context-aware responses
 */
export declare function createMockLanguageModel(contextResponses: Record<string, string>, defaultResponse?: string, modelName?: string): MockLanguageModel;
/**
 * Utility function to create test datasets
 */
export declare function createTestDataset(size: number, pattern?: 'math' | 'qa' | 'classification'): {
    input: string;
    output: string;
}[];
/**
 * Utility function to measure optimization performance
 */
export declare function measureOptimizationPerformance<T>(operation: () => Promise<T>, label?: string): Promise<{
    result: T;
    timeMs: number;
    memoryUsed?: number;
}>;
//# sourceMappingURL=index.d.ts.map