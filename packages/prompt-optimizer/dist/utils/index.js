/**
 * Utility functions and mock implementations for testing
 */
/**
 * Mock module implementation for testing
 */
export class MockModule {
    prompt;
    responses;
    responseIndex = 0;
    constructor(prompt = 'Default prompt', responses = ['Default response']) {
        this.prompt = prompt;
        this.responses = responses;
    }
    async predict(input) {
        const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
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
                    inputTokens: Math.floor(inputStr.length / 4),
                    outputTokens: Math.floor(response.length / 4),
                    totalTokens: Math.floor((inputStr.length + response.length) / 4),
                },
            },
        };
    }
    getPrompt() {
        return this.prompt;
    }
    setPrompt(prompt) {
        this.prompt = prompt;
    }
    clone() {
        const cloned = new MockModule(this.prompt, [...this.responses]);
        cloned.responseIndex = this.responseIndex;
        return cloned;
    }
    /**
     * Set the responses this mock module will return
     */
    setResponses(responses) {
        this.responses = responses;
        this.responseIndex = 0;
    }
    /**
     * Reset the response index
     */
    resetResponseIndex() {
        this.responseIndex = 0;
    }
    /**
     * Get the current response index
     */
    getResponseIndex() {
        return this.responseIndex;
    }
}
/**
 * Mock language model implementation for testing
 */
export class MockLanguageModel {
    responses;
    responseIndex = 0;
    modelName;
    delay;
    constructor(responses = ['Mock response'], modelName = 'mock-model', delay = 50) {
        this.responses = responses;
        this.modelName = modelName;
        this.delay = delay;
    }
    async generate(prompt, options) {
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
    getModelName() {
        return this.modelName;
    }
    /**
     * Set the responses this mock model will return
     */
    setResponses(responses) {
        this.responses = responses;
        this.responseIndex = 0;
    }
    /**
     * Reset the response index
     */
    resetResponseIndex() {
        this.responseIndex = 0;
    }
    /**
     * Set the artificial delay for responses
     */
    setDelay(delay) {
        this.delay = delay;
    }
    /**
     * Add slight variation to responses for high temperature simulation
     */
    addVariation(response) {
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
export function createMockModule(qaePairs, prompt = 'Answer the question: ') {
    const responses = qaePairs.map(pair => pair.output);
    return new MockModule(prompt, responses);
}
/**
 * Factory function to create a mock language model with context-aware responses
 */
export function createMockLanguageModel(contextResponses, defaultResponse = 'I don\'t understand.', modelName = 'mock-gpt') {
    // Create a smart mock that responds based on prompt content
    const smartMock = new MockLanguageModel([defaultResponse], modelName);
    // Override the generate method to be context-aware
    const originalGenerate = smartMock.generate.bind(smartMock);
    smartMock.generate = async (prompt, options) => {
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
export function createTestDataset(size, pattern = 'math') {
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
export async function measureOptimizationPerformance(operation, label = 'Operation') {
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
            memoryUsed: memoryUsed > 0 ? memoryUsed : undefined,
        };
    }
    catch (error) {
        const endTime = Date.now();
        const timeMs = endTime - startTime;
        console.error(`❌ ${label} failed after ${timeMs}ms:`, error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map