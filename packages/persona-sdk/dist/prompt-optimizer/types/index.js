/**
 * Core types for the prompt optimizer package
 */
// Base class for all optimizers
export class BaseOptimizer {
    config;
    constructor(config = {}) {
        this.config = {
            maxRounds: 10,
            earlyStoppingThreshold: 0.95,
            verbose: false,
            ...config,
        };
    }
    /**
     * Get optimizer configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Evaluate a module on a dataset
     */
    async evaluate(module, dataset, metric) {
        const startTime = Date.now();
        const scores = [];
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        for (const example of dataset) {
            const prediction = await module.predict(example.input);
            const score = metric.evaluate(example, prediction);
            scores.push(score);
            // Track token usage if available
            if (prediction.metadata?.usage) {
                totalInputTokens += prediction.metadata.usage.inputTokens || 0;
                totalOutputTokens += prediction.metadata.usage.outputTokens || 0;
            }
        }
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const evaluationTimeMs = Date.now() - startTime;
        return {
            score: averageScore,
            individualScores: scores,
            usage: {
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
                totalTokens: totalInputTokens + totalOutputTokens,
            },
            evaluationTimeMs,
        };
    }
}
//# sourceMappingURL=index.js.map