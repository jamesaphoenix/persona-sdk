/**
 * Random Search Optimizer
 * Based on DSPy's BootstrapFewShotWithRandomSearch implementation
 */
import { BaseOptimizer } from '../types/index.js';
import { ExactMatch } from '../metrics/index.js';
export class RandomSearchOptimizer extends BaseOptimizer {
    randomSearchConfig;
    llm;
    constructor(config = {}, llm) {
        super(config);
        this.llm = llm;
        this.randomSearchConfig = {
            ...this.config,
            numCandidates: config.numCandidates ?? 16,
            budget: config.budget ?? 100,
            strategy: config.strategy ?? 'mutation',
            metric: config.metric ?? ExactMatch,
        };
    }
    async optimize(module, trainset, valset = []) {
        const startTime = Date.now();
        const history = [];
        if (this.randomSearchConfig.verbose) {
            console.log('🎲 Starting Random Search Optimization');
            console.log(`📊 Training set size: ${trainset.length}`);
            console.log(`🎯 Number of candidates: ${this.randomSearchConfig.numCandidates}`);
            console.log(`💰 Budget: ${this.randomSearchConfig.budget}`);
            console.log(`🔄 Strategy: ${this.randomSearchConfig.strategy}`);
        }
        const evaluationSet = valset.length > 0 ? valset : trainset;
        let bestCandidate = null;
        let evaluationsUsed = 0;
        // Generate initial candidates
        const candidates = await this.generateInitialCandidates(module, trainset);
        if (this.randomSearchConfig.verbose) {
            console.log(`🚀 Generated ${candidates.length} initial candidates`);
        }
        // Evaluate candidates
        for (let i = 0; i < candidates.length && evaluationsUsed < this.randomSearchConfig.budget; i++) {
            const candidate = candidates[i];
            const roundStartTime = Date.now();
            try {
                // Create module with candidate configuration
                const testModule = await this.createModuleFromCandidate(module, candidate);
                // Evaluate the candidate
                const evaluation = await this.evaluate(testModule, evaluationSet, this.randomSearchConfig.metric);
                candidate.score = evaluation.score;
                candidate.metadata.usage = evaluation.usage;
                candidate.metadata.evaluationTimeMs = evaluation.evaluationTimeMs;
                evaluationsUsed++;
                // Update best candidate
                if (!bestCandidate || candidate.score > bestCandidate.score) {
                    bestCandidate = candidate;
                    if (this.randomSearchConfig.verbose) {
                        console.log(`🎉 New best candidate ${i + 1}: score ${candidate.score.toFixed(3)}`);
                    }
                }
                // Record round
                history.push({
                    round: i + 1,
                    score: candidate.score,
                    prompt: candidate.prompt,
                    timeMs: Date.now() - roundStartTime,
                    metadata: {
                        candidateIndex: i,
                        evaluationsUsed,
                        isBest: candidate === bestCandidate,
                        strategy: this.randomSearchConfig.strategy,
                        demonstrationCount: candidate.demonstrations.length,
                        ...candidate.metadata,
                    },
                });
                // Early stopping check
                if (candidate.score >= this.randomSearchConfig.earlyStoppingThreshold) {
                    if (this.randomSearchConfig.verbose) {
                        console.log(`🛑 Early stopping at candidate ${i + 1} (threshold: ${this.randomSearchConfig.earlyStoppingThreshold})`);
                    }
                    break;
                }
            }
            catch (error) {
                if (this.randomSearchConfig.verbose) {
                    console.warn(`⚠️ Failed to evaluate candidate ${i + 1}: ${error}`);
                }
                candidate.score = 0;
                candidate.metadata.evaluationError = String(error);
            }
        }
        // Create final optimized module
        let optimizedModule;
        let finalScore;
        if (bestCandidate) {
            optimizedModule = await this.createModuleFromCandidate(module, bestCandidate);
            finalScore = bestCandidate.score;
        }
        else {
            optimizedModule = module.clone();
            finalScore = 0;
        }
        if (this.randomSearchConfig.verbose) {
            console.log(`✅ Random search completed with final score: ${finalScore.toFixed(3)}`);
            console.log(`💰 Evaluations used: ${evaluationsUsed}/${this.randomSearchConfig.budget}`);
        }
        return {
            optimizedModule,
            finalScore,
            roundsCompleted: history.length,
            history,
            optimizationTimeMs: Date.now() - startTime,
        };
    }
    /**
     * Generate initial candidates using different strategies
     */
    async generateInitialCandidates(module, trainset) {
        const candidates = [];
        for (let i = 0; i < this.randomSearchConfig.numCandidates; i++) {
            try {
                let candidate;
                switch (this.randomSearchConfig.strategy) {
                    case 'mutation':
                        candidate = await this.generateMutationCandidate(module, trainset, i);
                        break;
                    case 'crossover':
                        candidate = await this.generateCrossoverCandidate(module, trainset, i);
                        break;
                    case 'random':
                    default:
                        candidate = await this.generateRandomCandidate(module, trainset, i);
                        break;
                }
                candidates.push(candidate);
            }
            catch (error) {
                if (this.randomSearchConfig.verbose) {
                    console.warn(`⚠️ Failed to generate candidate ${i}: ${error}`);
                }
            }
        }
        return candidates;
    }
    /**
     * Generate a candidate by mutating the original prompt
     */
    async generateMutationCandidate(module, trainset, index) {
        const basePrompt = module.getPrompt();
        const demonstrations = this.sampleDemonstrations(trainset);
        let mutatedPrompt = basePrompt;
        if (this.llm) {
            mutatedPrompt = await this.mutatePrompt(basePrompt, demonstrations);
        }
        return {
            prompt: mutatedPrompt,
            score: 0,
            demonstrations,
            metadata: {
                strategy: 'mutation',
                candidateIndex: index,
                demonstrationCount: demonstrations.length,
                basedOnOriginal: true,
            },
        };
    }
    /**
     * Generate a candidate by combining elements from multiple sources
     */
    async generateCrossoverCandidate(module, trainset, index) {
        const demonstrations = this.sampleDemonstrations(trainset);
        const basePrompt = module.getPrompt();
        // Simple crossover: combine base prompt with random demonstration selection
        const crossoverPrompt = this.combinePromptElements(basePrompt, demonstrations);
        return {
            prompt: crossoverPrompt,
            score: 0,
            demonstrations,
            metadata: {
                strategy: 'crossover',
                candidateIndex: index,
                demonstrationCount: demonstrations.length,
                combinedElements: true,
            },
        };
    }
    /**
     * Generate a completely random candidate
     */
    async generateRandomCandidate(module, trainset, index) {
        const demonstrations = this.sampleDemonstrations(trainset);
        const basePrompt = module.getPrompt();
        // Create a random variation of the prompt structure
        const randomPrompt = this.randomizePromptStructure(basePrompt, demonstrations);
        return {
            prompt: randomPrompt,
            score: 0,
            demonstrations,
            metadata: {
                strategy: 'random',
                candidateIndex: index,
                demonstrationCount: demonstrations.length,
                fullyRandomized: true,
            },
        };
    }
    /**
     * Sample random demonstrations from the training set
     */
    sampleDemonstrations(trainset) {
        const maxDemos = Math.min(8, trainset.length); // Cap at 8 demonstrations
        const numDemos = Math.floor(Math.random() * maxDemos) + 1; // At least 1 demo
        const shuffled = [...trainset].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, numDemos);
    }
    /**
     * Mutate a prompt using the language model
     */
    async mutatePrompt(basePrompt, demonstrations) {
        if (!this.llm) {
            return basePrompt;
        }
        const mutationPrompt = `You are a prompt optimization expert. Please create a variation of the following prompt that maintains its core functionality but uses different wording, structure, or approach.

Original prompt:
"""
${basePrompt}
"""

Create a functionally equivalent but stylistically different version of this prompt. Focus on:
- Different wording while maintaining clarity
- Alternative instruction structure
- Improved specificity or examples

Mutated prompt:`;
        try {
            const response = await this.llm.generate(mutationPrompt, {
                temperature: 0.8,
                maxTokens: 400,
            });
            return response.trim();
        }
        catch (error) {
            if (this.randomSearchConfig.verbose) {
                console.warn(`⚠️ Failed to mutate prompt: ${error}`);
            }
            return basePrompt;
        }
    }
    /**
     * Combine prompt elements in a crossover fashion
     */
    combinePromptElements(basePrompt, demonstrations) {
        // Simple crossover: modify the demonstration section
        const demonstrationText = this.formatDemonstrations(demonstrations);
        return `${basePrompt}

Here are some examples to guide your responses:

${demonstrationText}

Please provide your response:`;
    }
    /**
     * Randomize the prompt structure
     */
    randomizePromptStructure(basePrompt, demonstrations) {
        const structures = [
            // Structure 1: Examples first
            () => {
                const demos = this.formatDemonstrations(demonstrations);
                return `Here are some examples:\n\n${demos}\n\nBased on these examples, ${basePrompt.toLowerCase()}`;
            },
            // Structure 2: Concise instructions
            () => {
                const demos = this.formatDemonstrations(demonstrations);
                return `${basePrompt}\n\nExamples:\n${demos}\n\nYour response:`;
            },
            // Structure 3: Step-by-step
            () => {
                const demos = this.formatDemonstrations(demonstrations);
                return `Task: ${basePrompt}\n\nStep 1: Review these examples\n${demos}\n\nStep 2: Apply the same pattern to your response`;
            },
        ];
        const randomStructure = structures[Math.floor(Math.random() * structures.length)];
        return randomStructure();
    }
    /**
     * Format demonstrations for inclusion in prompts
     */
    formatDemonstrations(demonstrations) {
        return demonstrations.map((demo, index) => {
            const inputStr = typeof demo.input === 'string' ? demo.input : JSON.stringify(demo.input);
            const outputStr = typeof demo.output === 'string' ? demo.output : JSON.stringify(demo.output);
            return `Example ${index + 1}:\nInput: ${inputStr}\nOutput: ${outputStr}`;
        }).join('\n\n');
    }
    /**
     * Create a module from a search candidate
     */
    async createModuleFromCandidate(baseModule, candidate) {
        const optimizedModule = baseModule.clone();
        optimizedModule.setPrompt(candidate.prompt);
        return optimizedModule;
    }
    /**
     * Get the configuration for this optimizer
     */
    getRandomSearchConfig() {
        return { ...this.randomSearchConfig };
    }
}
//# sourceMappingURL=random-search.js.map