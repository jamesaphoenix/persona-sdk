/**
 * Ensemble Optimizer
 * Combines multiple optimized modules for improved performance
 */
export class EnsembleOptimizer {
    config;
    modules = [];
    constructor(config) {
        this.config = {
            size: config.size,
            reducer: config.reducer ?? this.defaultReducer,
            votingStrategy: config.votingStrategy ?? 'hard',
        };
    }
    /**
     * Create an ensemble from multiple optimization results
     */
    static fromOptimizationResults(results, config = {}) {
        const ensemble = new EnsembleOptimizer({
            size: results.length,
            ...config,
        });
        // Sort by final score and take the best modules
        const sortedResults = results.sort((a, b) => b.finalScore - a.finalScore);
        const selectedResults = sortedResults.slice(0, ensemble.config.size);
        ensemble.modules = selectedResults.map(result => result.optimizedModule);
        return ensemble;
    }
    /**
     * Create an ensemble by optimizing multiple modules
     */
    static async fromMultipleOptimizers(baseModule, trainset, optimizers, config = {}) {
        const results = [];
        for (const optimizer of optimizers) {
            try {
                const result = await optimizer.optimize(baseModule, trainset);
                results.push(result);
            }
            catch (error) {
                console.warn(`Failed to optimize with optimizer: ${error}`);
            }
        }
        return EnsembleOptimizer.fromOptimizationResults(results, config);
    }
    /**
     * Add a module to the ensemble
     */
    addModule(module) {
        if (this.modules.length >= this.config.size) {
            throw new Error(`Ensemble is full (max size: ${this.config.size})`);
        }
        this.modules.push(module);
    }
    /**
     * Predict using the ensemble
     */
    async predict(input) {
        if (this.modules.length === 0) {
            throw new Error('No modules in ensemble');
        }
        // Get predictions from all modules
        const predictions = await Promise.all(this.modules.map(async (module, index) => {
            try {
                const prediction = await module.predict(input);
                return { ...prediction, moduleIndex: index };
            }
            catch (error) {
                console.warn(`Module ${index} failed to predict: ${error}`);
                return {
                    output: '',
                    confidence: 0,
                    metadata: { error: String(error), moduleIndex: index },
                };
            }
        }));
        // Combine predictions using the configured reducer
        const combinedOutput = this.config.reducer(predictions.map(p => p.output));
        // Calculate ensemble confidence
        const validPredictions = predictions.filter(p => !p.metadata?.error);
        const averageConfidence = validPredictions.length > 0
            ? validPredictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / validPredictions.length
            : 0;
        return {
            output: combinedOutput,
            confidence: averageConfidence,
            metadata: {
                ensembleSize: this.modules.length,
                validPredictions: validPredictions.length,
                predictions,
                votingStrategy: this.config.votingStrategy,
            },
        };
    }
    /**
     * Evaluate the ensemble on a dataset
     */
    async evaluate(dataset, metric) {
        const ensembleScores = [];
        const moduleScores = Array(this.modules.length).fill(null).map(() => []);
        for (const example of dataset) {
            // Get ensemble prediction
            const ensemblePrediction = await this.predict(example.input);
            const ensembleScore = metric.evaluate(example, ensemblePrediction);
            ensembleScores.push(ensembleScore);
            // Get individual module scores
            for (let i = 0; i < this.modules.length; i++) {
                try {
                    const modulePrediction = await this.modules[i].predict(example.input);
                    const moduleScore = metric.evaluate(example, modulePrediction);
                    moduleScores[i].push(moduleScore);
                }
                catch (error) {
                    moduleScores[i].push(0);
                }
            }
        }
        const averageEnsembleScore = ensembleScores.reduce((sum, score) => sum + score, 0) / ensembleScores.length;
        return {
            score: averageEnsembleScore,
            individualScores: ensembleScores,
            moduleScores,
        };
    }
    /**
     * Get ensemble statistics
     */
    getStats() {
        return {
            size: this.config.size,
            moduleCount: this.modules.length,
            config: { ...this.config },
        };
    }
    /**
     * Default reducer for combining outputs
     */
    defaultReducer(outputs) {
        if (outputs.length === 0) {
            return '';
        }
        // For string outputs, use majority voting
        if (outputs.every(output => typeof output === 'string')) {
            return this.majorityVote(outputs);
        }
        // For numeric outputs, use average
        if (outputs.every(output => typeof output === 'number')) {
            return outputs.reduce((sum, output) => sum + output, 0) / outputs.length;
        }
        // For boolean outputs, use majority voting
        if (outputs.every(output => typeof output === 'boolean')) {
            const trueCount = outputs.filter(Boolean).length;
            return trueCount > outputs.length / 2;
        }
        // For object outputs, return the first valid one
        const validOutputs = outputs.filter(output => output != null && output !== '');
        return validOutputs.length > 0 ? validOutputs[0] : outputs[0];
    }
    /**
     * Majority voting for categorical outputs
     */
    majorityVote(outputs) {
        if (outputs.length === 0) {
            return '';
        }
        // Count occurrences
        const counts = new Map();
        for (const output of outputs) {
            counts.set(output, (counts.get(output) || 0) + 1);
        }
        // Find the most common output
        let maxCount = 0;
        let majorityOutput = outputs[0];
        for (const [output, count] of counts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                majorityOutput = output;
            }
        }
        return majorityOutput;
    }
    /**
     * Clone the ensemble
     */
    clone() {
        const cloned = new EnsembleOptimizer(this.config);
        cloned.modules = this.modules.map(module => module.clone());
        return cloned;
    }
}
//# sourceMappingURL=ensemble.js.map