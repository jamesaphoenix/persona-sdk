/**
 * Bootstrap Few-Shot Optimizer
 * Based on DSPy's BootstrapFewShot implementation
 */

import type {
  Module,
  Example,
  BootstrapConfig,
  OptimizationResult,
  OptimizationRound,
  LanguageModel
} from '../types/index.js';
import { BaseOptimizer } from '../types/index.js';
import { ExactMatch } from '../metrics/index.js';

export class BootstrapOptimizer extends BaseOptimizer {
  private bootstrapConfig: Required<BootstrapConfig>;

  constructor(config: BootstrapConfig = {}) {
    super(config);
    
    this.bootstrapConfig = {
      ...this.config,
      maxLabeled: config.maxLabeled ?? 16,
      maxBootstrapped: config.maxBootstrapped ?? 4,
      bootstrapThreshold: config.bootstrapThreshold ?? 0.7,
      teacherModel: config.teacherModel ?? null,
      metric: config.metric ?? ExactMatch,
    } as Required<BootstrapConfig>;
  }

  async optimize(
    student: Module,
    trainset: Example[],
    valset: Example[] = []
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const history: OptimizationRound[] = [];
    
    if (this.bootstrapConfig.verbose) {
      console.log('🚀 Starting Bootstrap Few-Shot Optimization');
      console.log(`📊 Training set size: ${trainset.length}`);
      console.log(`📊 Validation set size: ${valset.length}`);
    }

    // Step 1: Select labeled examples
    const labeledExamples = this.selectLabeledExamples(trainset);
    
    if (this.bootstrapConfig.verbose) {
      console.log(`📝 Selected ${labeledExamples.length} labeled examples`);
    }

    // Step 2: Generate bootstrapped examples using teacher model
    let bootstrappedExamples: Example[] = [];
    if (this.bootstrapConfig.teacherModel && this.bootstrapConfig.maxBootstrapped > 0) {
      bootstrappedExamples = await this.generateBootstrappedExamples(
        student,
        trainset,
        this.bootstrapConfig.teacherModel
      );
      
      if (this.bootstrapConfig.verbose) {
        console.log(`🎯 Generated ${bootstrappedExamples.length} bootstrapped examples`);
      }
    }

    // Step 3: Combine labeled and bootstrapped examples
    const combinedExamples = [
      ...labeledExamples,
      ...bootstrappedExamples,
    ];

    // Step 4: Create optimized module with demonstrations
    const optimizedModule = await this.createOptimizedModule(student, combinedExamples);

    // Step 5: Evaluate the optimized module
    const evaluationSet = valset.length > 0 ? valset : trainset;
    const finalEvaluation = await this.evaluate(
      optimizedModule,
      evaluationSet,
      this.bootstrapConfig.metric
    );

    const round: OptimizationRound = {
      round: 1,
      score: finalEvaluation.score,
      prompt: optimizedModule.getPrompt(),
      timeMs: Date.now() - startTime,
      metadata: {
        labeledExamples: labeledExamples.length,
        bootstrappedExamples: bootstrappedExamples.length,
        totalExamples: combinedExamples.length,
        usage: finalEvaluation.usage,
      },
    };

    history.push(round);

    if (this.bootstrapConfig.verbose) {
      console.log(`✅ Bootstrap optimization completed with score: ${finalEvaluation.score.toFixed(3)}`);
    }

    return {
      optimizedModule,
      finalScore: finalEvaluation.score,
      roundsCompleted: 1,
      history,
      optimizationTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Select the best labeled examples from the training set
   */
  private selectLabeledExamples(trainset: Example[]): Example[] {
    // Simple strategy: take the first maxLabeled examples
    // In a more sophisticated implementation, we could use diversity sampling
    return trainset.slice(0, this.bootstrapConfig.maxLabeled);
  }

  /**
   * Generate bootstrapped examples using a teacher model
   */
  private async generateBootstrappedExamples(
    student: Module,
    trainset: Example[],
    teacher: LanguageModel
  ): Promise<Example[]> {
    const bootstrappedExamples: Example[] = [];
    const maxAttempts = this.bootstrapConfig.maxBootstrapped * 3; // Try 3x to account for failures
    let attempts = 0;

    // Get remaining examples not used as labeled
    const remainingExamples = trainset.slice(this.bootstrapConfig.maxLabeled);

    while (bootstrappedExamples.length < this.bootstrapConfig.maxBootstrapped && attempts < maxAttempts) {
      attempts++;

      if (remainingExamples.length === 0) {
        break;
      }

      // Randomly select an example for bootstrapping
      const randomIndex = Math.floor(Math.random() * remainingExamples.length);
      const example = remainingExamples[randomIndex];

      try {
        // Generate teacher prediction
        const teacherPrompt = this.createTeacherPrompt(example);
        const teacherOutput = await teacher.generate(teacherPrompt);

        // Create bootstrapped example
        const bootstrappedExample: Example = {
          input: example.input,
          output: teacherOutput.trim(),
          metadata: {
            ...example.metadata,
            bootstrapped: true,
            teacherGenerated: true,
          },
        };

        // Validate the bootstrapped example
        const studentPrediction = await student.predict(bootstrappedExample.input);
        const score = this.bootstrapConfig.metric.evaluate(
          bootstrappedExample,
          studentPrediction
        );

        if (score >= this.bootstrapConfig.bootstrapThreshold) {
          bootstrappedExamples.push(bootstrappedExample);
          
          if (this.bootstrapConfig.verbose) {
            console.log(`✨ Added bootstrapped example ${bootstrappedExamples.length}/${this.bootstrapConfig.maxBootstrapped} (score: ${score.toFixed(3)})`);
          }
        }
      } catch (error) {
        if (this.bootstrapConfig.verbose) {
          console.warn(`⚠️ Failed to generate bootstrapped example: ${error}`);
        }
      }
    }

    return bootstrappedExamples;
  }

  /**
   * Create a prompt for the teacher model to generate examples
   */
  private createTeacherPrompt(example: Example): string {
    const inputStr = typeof example.input === 'string' ? example.input : JSON.stringify(example.input);
    
    return `You are an expert teacher model. Given the following input, provide a high-quality, accurate output.

Input: ${inputStr}

Provide only the output, without any additional explanation:`;
  }

  /**
   * Create an optimized module with demonstrations
   */
  private async createOptimizedModule(student: Module, demonstrations: Example[]): Promise<Module> {
    const optimizedModule = student.clone();
    
    // Create few-shot prompt with demonstrations
    const currentPrompt = student.getPrompt();
    const demonstrationPrompt = this.createDemonstrationPrompt(demonstrations);
    
    const newPrompt = `${currentPrompt}

Here are some examples to guide your responses:

${demonstrationPrompt}

Now, please respond to the following input:`;

    optimizedModule.setPrompt(newPrompt);
    
    return optimizedModule;
  }

  /**
   * Create a demonstration prompt from examples
   */
  private createDemonstrationPrompt(examples: Example[]): string {
    return examples.map((example, index) => {
      const inputStr = typeof example.input === 'string' ? example.input : JSON.stringify(example.input);
      const outputStr = typeof example.output === 'string' ? example.output : JSON.stringify(example.output);
      
      return `Example ${index + 1}:
Input: ${inputStr}
Output: ${outputStr}`;
    }).join('\n\n');
  }

  /**
   * Get the configuration for this optimizer
   */
  getBootstrapConfig(): Required<BootstrapConfig> {
    return { ...this.bootstrapConfig };
  }
}