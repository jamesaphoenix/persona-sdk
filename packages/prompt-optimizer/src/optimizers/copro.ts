/**
 * COPRO (Compositional Prompt Optimizer)
 * Based on DSPy's COPRO implementation
 */

import type {
  Module,
  Example,
  COPROConfig,
  OptimizationResult,
  OptimizationRound,
  LanguageModel,
  Metric,
} from '../types/index.js';
import { BaseOptimizer } from '../types/index.js';
import { ExactMatch } from '../metrics/index.js';

interface PromptCandidate {
  prompt: string;
  score: number;
  metadata: Record<string, any>;
}

export class COPROOptimizer extends BaseOptimizer {
  private coproConfig: Required<COPROConfig>;
  private llm: LanguageModel;

  constructor(llm: LanguageModel, config: COPROConfig = {}) {
    super(config);
    
    this.llm = llm;
    this.coproConfig = {
      ...this.config,
      breadth: config.breadth ?? 10,
      depth: config.depth ?? 3,
      temperature: config.temperature ?? 0.7,
      numVariations: config.numVariations ?? 5,
      metric: config.metric ?? ExactMatch,
    } as Required<COPROConfig>;
  }

  async optimize(
    module: Module,
    trainset: Example[],
    valset: Example[] = []
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const history: OptimizationRound[] = [];
    
    if (this.coproConfig.verbose) {
      console.log('🎯 Starting COPRO Optimization');
      console.log(`📊 Training set size: ${trainset.length}`);
      console.log(`🔍 Breadth: ${this.coproConfig.breadth}, Depth: ${this.coproConfig.depth}`);
    }

    const evaluationSet = valset.length > 0 ? valset : trainset;
    let bestModule = module.clone();
    let bestScore = 0;

    // Initialize with baseline evaluation
    const baselineEvaluation = await this.evaluate(
      module,
      evaluationSet,
      this.coproConfig.metric
    );
    
    bestScore = baselineEvaluation.score;
    
    if (this.coproConfig.verbose) {
      console.log(`📊 Baseline score: ${bestScore.toFixed(3)}`);
    }

    // COPRO iterative optimization
    let currentCandidates: PromptCandidate[] = [{ 
      prompt: module.getPrompt(), 
      score: bestScore,
      metadata: { generation: 0, isBaseline: true }
    }];

    for (let round = 1; round <= this.coproConfig.depth; round++) {
      const roundStartTime = Date.now();
      
      if (this.coproConfig.verbose) {
        console.log(`🔄 Round ${round}/${this.coproConfig.depth}`);
      }

      // Generate new prompt candidates
      const newCandidates = await this.generatePromptCandidates(
        currentCandidates,
        trainset,
        round
      );

      // Evaluate all candidates
      const evaluatedCandidates = await this.evaluateCandidates(
        newCandidates,
        module,
        evaluationSet
      );

      // Select top candidates for next round
      const topCandidates = evaluatedCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, this.coproConfig.breadth);

      // Update best if we found a better candidate
      const roundBest = topCandidates[0];
      if (roundBest && roundBest.score > bestScore) {
        bestScore = roundBest.score;
        bestModule = module.clone();
        bestModule.setPrompt(roundBest.prompt);
        
        if (this.coproConfig.verbose) {
          console.log(`🎉 New best score: ${bestScore.toFixed(3)}`);
        }
      }

      // Record round history (only if we have a valid best candidate)
      if (roundBest) {
        const roundTime = Date.now() - roundStartTime;
        history.push({
          round,
          score: roundBest.score,
          prompt: roundBest.prompt,
          timeMs: roundTime,
          metadata: {
            candidatesGenerated: newCandidates.length,
            candidatesEvaluated: evaluatedCandidates.length,
            averageScore: evaluatedCandidates.length > 0 ? evaluatedCandidates.reduce((sum, c) => sum + c.score, 0) / evaluatedCandidates.length : 0,
            bestCandidate: roundBest.metadata,
          },
        });
      }

      // Prepare for next round
      currentCandidates = topCandidates;

      // Early stopping check
      if (bestScore >= this.coproConfig.earlyStoppingThreshold!) {
        if (this.coproConfig.verbose) {
          console.log(`🛑 Early stopping at round ${round} (threshold: ${this.coproConfig.earlyStoppingThreshold})`);
        }
        break;
      }

      // Break if no candidates to continue with
      if (topCandidates.length === 0) {
        if (this.coproConfig.verbose) {
          console.log(`🛑 No more candidates to explore at round ${round}`);
        }
        break;
      }
    }

    if (this.coproConfig.verbose) {
      console.log(`✅ COPRO optimization completed with final score: ${bestScore.toFixed(3)}`);
    }

    return {
      optimizedModule: bestModule,
      finalScore: bestScore,
      roundsCompleted: history.length,
      history,
      optimizationTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Generate new prompt candidates based on current best candidates
   */
  private async generatePromptCandidates(
    currentCandidates: PromptCandidate[],
    trainset: Example[],
    round: number
  ): Promise<PromptCandidate[]> {
    const newCandidates: PromptCandidate[] = [];

    for (const candidate of currentCandidates.slice(0, 3)) { // Use top 3 candidates as seeds
      for (let i = 0; i < this.coproConfig.numVariations; i++) {
        try {
          const variation = await this.generatePromptVariation(
            candidate.prompt,
            trainset,
            round,
            i
          );
          
          newCandidates.push({
            prompt: variation,
            score: 0, // Will be evaluated later
            metadata: {
              generation: round,
              parentScore: candidate.score,
              variationIndex: i,
            },
          });
        } catch (error) {
          if (this.coproConfig.verbose) {
            console.warn(`⚠️ Failed to generate prompt variation: ${error}`);
          }
        }
      }
    }

    return newCandidates;
  }

  /**
   * Generate a variation of a prompt
   */
  private async generatePromptVariation(
    basePrompt: string,
    trainset: Example[],
    round: number,
    variationIndex: number
  ): Promise<string> {
    // Sample a few examples for context
    const sampleExamples = this.sampleExamples(trainset, 3);
    const exampleContext = this.formatExamplesForPromptGeneration(sampleExamples);

    const optimizationPrompt = `You are a prompt optimization expert. Your task is to improve the given prompt to make it more effective.

Current prompt to improve:
"""
${basePrompt}
"""

Here are some example inputs and expected outputs this prompt should handle:
${exampleContext}

Please generate an improved version of the prompt that:
1. Maintains the original intent and functionality
2. Is clearer and more specific in its instructions
3. Would likely produce better outputs for the given examples
4. Uses effective prompting techniques (clear structure, examples, constraints)

Optimization round: ${round}
Variation: ${variationIndex + 1}

Improved prompt:`;

    const response = await this.llm.generate(optimizationPrompt, {
      temperature: this.coproConfig.temperature,
      maxTokens: 500,
    });

    return response.trim();
  }

  /**
   * Sample random examples from the training set
   */
  private sampleExamples(trainset: Example[], count: number): Example[] {
    const shuffled = [...trainset].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, trainset.length));
  }

  /**
   * Format examples for prompt generation context
   */
  private formatExamplesForPromptGeneration(examples: Example[]): string {
    return examples.map((example, index) => {
      const inputStr = typeof example.input === 'string' ? example.input : JSON.stringify(example.input);
      const outputStr = typeof example.output === 'string' ? example.output : JSON.stringify(example.output);
      
      return `Example ${index + 1}:
Input: ${inputStr}
Expected Output: ${outputStr}`;
    }).join('\n\n');
  }

  /**
   * Evaluate a list of prompt candidates
   */
  private async evaluateCandidates(
    candidates: PromptCandidate[],
    baseModule: Module,
    evaluationSet: Example[]
  ): Promise<PromptCandidate[]> {
    const evaluatedCandidates: PromptCandidate[] = [];

    for (const candidate of candidates) {
      try {
        // Create a temporary module with the candidate prompt
        const testModule = baseModule.clone();
        testModule.setPrompt(candidate.prompt);

        // Evaluate the module
        const evaluation = await this.evaluate(
          testModule,
          evaluationSet,
          this.coproConfig.metric
        );

        evaluatedCandidates.push({
          ...candidate,
          score: evaluation.score,
          metadata: {
            ...candidate.metadata,
            usage: evaluation.usage,
            evaluationTimeMs: evaluation.evaluationTimeMs,
          },
        });
      } catch (error) {
        if (this.coproConfig.verbose) {
          console.warn(`⚠️ Failed to evaluate candidate: ${error}`);
        }
        // Add with score 0 to not lose the candidate completely
        evaluatedCandidates.push({
          ...candidate,
          score: 0,
          metadata: {
            ...candidate.metadata,
            evaluationError: String(error),
          },
        });
      }
    }

    return evaluatedCandidates;
  }

  /**
   * Get the configuration for this optimizer
   */
  getCOPROConfig(): Required<COPROConfig> {
    return { ...this.coproConfig };
  }
}