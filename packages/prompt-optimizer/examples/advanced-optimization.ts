/**
 * Advanced Prompt Optimization Examples
 * 
 * This example demonstrates advanced usage patterns including:
 * - Custom metrics and composite scoring
 * - Multi-stage optimization pipelines
 * - Cross-validation workflows
 * - Performance monitoring and cost tracking
 * - Real-world integration patterns
 */

import {
  BootstrapOptimizer,
  COPROOptimizer,
  RandomSearchOptimizer,
  EnsembleOptimizer,
  ExactMatch,
  FuzzyMatch,
  PassageMatch,
  createCompositeMetric,
  createExactMatchMetric,
  createFuzzyMatchMetric,
  MockModule,
  createMockLanguageModel,
  createTestDataset,
  measureOptimizationPerformance,
} from '../src/index.js';

// Advanced Custom Metric Examples
const WeightedAccuracyMetric = createCompositeMetric([
  { metric: ExactMatch, weight: 0.6 },      // Prioritize exact matches
  { metric: FuzzyMatch, weight: 0.3 },      // Allow some flexibility
  { metric: PassageMatch, weight: 0.1 },    // Context relevance
]);

const StrictMathMetric = createExactMatchMetric(0.95); // 95% threshold for arrays
const LenientTextMetric = createFuzzyMatchMetric(0.7); // 70% similarity threshold

// Custom Domain-Specific Metric
const SentimentAccuracyMetric = {
  name: 'sentiment_accuracy',
  evaluate: (example: any, prediction: any) => {
    const expected = String(example.output).toLowerCase();
    const actual = String(prediction.output).toLowerCase();
    
    // Exact match gets full score
    if (expected === actual) return 1.0;
    
    // Partial credit for close sentiments
    const sentimentMap: Record<string, string[]> = {
      'positive': ['good', 'great', 'excellent', 'amazing', 'wonderful'],
      'negative': ['bad', 'terrible', 'awful', 'horrible', 'disappointing'],
      'neutral': ['okay', 'fine', 'average', 'mediocre', 'mixed'],
    };
    
    for (const [sentiment, keywords] of Object.entries(sentimentMap)) {
      if (expected === sentiment && keywords.some(keyword => actual.includes(keyword))) {
        return 0.7; // Partial credit
      }
    }
    
    return 0.0;
  },
};

async function demonstrateAdvancedOptimization() {
  console.log('🚀 Advanced Prompt Optimization Demonstration\n');

  // Create comprehensive test environment
  const smartTeacher = createMockLanguageModel({
    'sentiment': 'Analyze the sentiment of this text and classify it as positive, negative, or neutral',
    'math': 'Solve this mathematical problem step by step and provide the numerical answer',
    'reasoning': 'Think through this problem logically and provide a clear, concise answer',
    'improve': 'Here is an improved version that is more specific and effective',
    'optimize': 'You are an expert assistant. Provide accurate, helpful responses',
  }, 'I need more context to provide an accurate response.', 'advanced-teacher-gpt');

  // Create diverse datasets
  const mathDataset = createTestDataset(25, 'math');
  const sentimentDataset = createTestDataset(20, 'classification');
  const qaDataset = createTestDataset(15, 'qa');

  // Combined real-world dataset
  const realWorldDataset = [
    ...mathDataset.slice(0, 15),
    ...sentimentDataset.slice(0, 12),
    ...qaDataset.slice(0, 8),
  ];

  console.log(`📊 Created comprehensive dataset: ${realWorldDataset.length} examples`);
  console.log(`   • Math problems: ${mathDataset.slice(0, 15).length}`);
  console.log(`   • Sentiment analysis: ${sentimentDataset.slice(0, 12).length}`);
  console.log(`   • Q&A pairs: ${qaDataset.slice(0, 8).length}\n`);

  // Advanced Module Setup
  const baseModule = new MockModule(
    'You are a helpful AI assistant. Please provide accurate and concise answers.',
    [
      '4', '8', '12', '16', '20', // Math answers
      'positive', 'negative', 'neutral', 'positive', 'negative', // Sentiment answers
      'Paris', 'Jupiter', 'Shakespeare', 'H2O', 'Light', // QA answers
    ]
  );

  // 1. Multi-Metric Optimization Comparison
  console.log('🎯 Multi-Metric Optimization Comparison');
  console.log('=====================================');

  const metrics = [
    { name: 'Exact Match', metric: ExactMatch },
    { name: 'Weighted Accuracy', metric: WeightedAccuracyMetric },
    { name: 'Strict Math', metric: StrictMathMetric },
    { name: 'Lenient Text', metric: LenientTextMetric },
    { name: 'Sentiment Accuracy', metric: SentimentAccuracyMetric },
  ];

  const metricResults: any[] = [];

  for (const { name, metric } of metrics) {
    const optimizer = new BootstrapOptimizer({
      maxLabeled: 8,
      maxBootstrapped: 4,
      teacherModel: smartTeacher,
      metric,
      verbose: false,
    });

    const { result, timeMs } = await measureOptimizationPerformance(
      () => optimizer.optimize(baseModule, realWorldDataset.slice(0, 20)),
      `${name} Optimization`
    );

    metricResults.push({
      name,
      score: result.finalScore,
      time: timeMs,
      rounds: result.roundsCompleted,
    });

    console.log(`✅ ${name}: ${result.finalScore.toFixed(3)} (${timeMs}ms)`);
  }

  console.log('');

  // 2. Multi-Stage Optimization Pipeline
  console.log('🔄 Multi-Stage Optimization Pipeline');
  console.log('===================================');

  let currentModule = baseModule.clone();
  const stageResults: any[] = [];

  // Stage 1: Bootstrap Foundation
  console.log('Stage 1: Bootstrap Foundation');
  const bootstrapOptimizer = new BootstrapOptimizer({
    maxLabeled: 10,
    maxBootstrapped: 6,
    teacherModel: smartTeacher,
    metric: WeightedAccuracyMetric,
    verbose: false,
  });

  let { result, timeMs } = await measureOptimizationPerformance(
    () => bootstrapOptimizer.optimize(currentModule, realWorldDataset),
    'Bootstrap Stage'
  );

  stageResults.push({ stage: 'Bootstrap', score: result.finalScore, time: timeMs });
  currentModule = result.optimizedModule;
  console.log(`   Score: ${result.finalScore.toFixed(3)}\n`);

  // Stage 2: COPRO Refinement
  console.log('Stage 2: COPRO Refinement');
  const coproOptimizer = new COPROOptimizer(smartTeacher, {
    breadth: 6,
    depth: 3,
    temperature: 0.8,
    numVariations: 4,
    metric: WeightedAccuracyMetric,
    verbose: false,
  });

  ({ result, timeMs } = await measureOptimizationPerformance(
    () => coproOptimizer.optimize(currentModule, realWorldDataset),
    'COPRO Stage'
  ));

  stageResults.push({ stage: 'COPRO', score: result.finalScore, time: timeMs });
  currentModule = result.optimizedModule;
  console.log(`   Score: ${result.finalScore.toFixed(3)}\n`);

  // Stage 3: Random Search Fine-tuning
  console.log('Stage 3: Random Search Fine-tuning');
  const randomOptimizer = new RandomSearchOptimizer({
    numCandidates: 12,
    budget: 20,
    strategy: 'mutation',
    metric: WeightedAccuracyMetric,
    verbose: false,
  }, smartTeacher);

  ({ result, timeMs } = await measureOptimizationPerformance(
    () => randomOptimizer.optimize(currentModule, realWorldDataset),
    'Random Search Stage'
  ));

  stageResults.push({ stage: 'Random Search', score: result.finalScore, time: timeMs });
  console.log(`   Score: ${result.finalScore.toFixed(3)}\n`);

  // 3. Cross-Validation Evaluation
  console.log('📊 Cross-Validation Evaluation');
  console.log('==============================');

  const foldSize = Math.floor(realWorldDataset.length / 4);
  const folds = [
    realWorldDataset.slice(0, foldSize),
    realWorldDataset.slice(foldSize, foldSize * 2),
    realWorldDataset.slice(foldSize * 2, foldSize * 3),
    realWorldDataset.slice(foldSize * 3),
  ];

  const crossValOptimizer = new BootstrapOptimizer({
    maxLabeled: 6,
    maxBootstrapped: 3,
    teacherModel: smartTeacher,
    metric: WeightedAccuracyMetric,
    verbose: false,
  });

  const foldResults: number[] = [];

  for (let i = 0; i < folds.length; i++) {
    const testFold = folds[i];
    const trainFolds = folds.filter((_, index) => index !== i).flat();

    const cvResult = await crossValOptimizer.optimize(baseModule, trainFolds, testFold);
    foldResults.push(cvResult.finalScore);

    console.log(`Fold ${i + 1}: ${cvResult.finalScore.toFixed(3)}`);
  }

  const meanCV = foldResults.reduce((sum, score) => sum + score, 0) / foldResults.length;
  const stdCV = Math.sqrt(
    foldResults.reduce((sum, score) => sum + Math.pow(score - meanCV, 2), 0) / foldResults.length
  );

  console.log(`Cross-Validation Score: ${meanCV.toFixed(3)} ± ${stdCV.toFixed(3)}\n`);

  // 4. Ensemble Creation and Evaluation
  console.log('🤝 Ensemble Creation and Evaluation');
  console.log('===================================');

  // Create ensemble from different optimization strategies
  const ensembleOptimizers = [
    new BootstrapOptimizer({
      maxLabeled: 8,
      maxBootstrapped: 4,
      teacherModel: smartTeacher,
      metric: ExactMatch,
      verbose: false,
    }),
    new COPROOptimizer(smartTeacher, {
      breadth: 4,
      depth: 2,
      numVariations: 3,
      metric: FuzzyMatch,
      verbose: false,
    }),
    new RandomSearchOptimizer({
      numCandidates: 8,
      budget: 12,
      strategy: 'crossover',
      metric: WeightedAccuracyMetric,
      verbose: false,
    }),
  ];

  console.log('Training individual ensemble members...');
  const ensembleResults = await Promise.all(
    ensembleOptimizers.map((optimizer, index) =>
      measureOptimizationPerformance(
        () => optimizer.optimize(baseModule, realWorldDataset),
        `Ensemble Member ${index + 1}`
      )
    )
  );

  console.log('Individual member scores:');
  ensembleResults.forEach(({ result }, index) => {
    console.log(`  Member ${index + 1}: ${result.finalScore.toFixed(3)}`);
  });

  // Create ensemble
  const ensemble = EnsembleOptimizer.fromOptimizationResults(
    ensembleResults.map(({ result }) => result),
    {
      size: 3,
      votingStrategy: 'hard',
      reducer: (outputs) => {
        // Custom ensemble logic for mixed outputs
        const validOutputs = outputs.filter(o => o != null && o !== '');
        if (validOutputs.length === 0) return outputs[0];
        
        // Majority voting with fallback to first valid
        const counts = new Map();
        validOutputs.forEach(output => {
          counts.set(output, (counts.get(output) || 0) + 1);
        });
        
        let maxCount = 0;
        let majorityOutput = validOutputs[0];
        for (const [output, count] of counts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            majorityOutput = output;
          }
        }
        
        return majorityOutput;
      },
    }
  );

  // Evaluate ensemble
  const ensembleEvaluation = await ensemble.evaluate(
    realWorldDataset.slice(-10), // Use last 10 examples for testing
    WeightedAccuracyMetric
  );

  console.log(`\nEnsemble Performance: ${ensembleEvaluation.score.toFixed(3)}`);
  console.log(`Ensemble Stats: ${JSON.stringify(ensemble.getStats(), null, 2)}\n`);

  // 5. Performance and Cost Analysis
  console.log('💰 Performance and Cost Analysis');
  console.log('================================');

  // Simulate token usage and cost calculation
  const totalOperations = metricResults.length + stageResults.length + foldResults.length + 3;
  const estimatedTokens = totalOperations * 1500; // Estimate 1500 tokens per operation
  const estimatedCost = (estimatedTokens / 1000) * 0.002; // $0.002 per 1K tokens

  console.log(`📊 Optimization Session Summary:`);
  console.log(`   • Total optimizations run: ${totalOperations}`);
  console.log(`   • Estimated tokens used: ${estimatedTokens.toLocaleString()}`);
  console.log(`   • Estimated cost: $${estimatedCost.toFixed(4)}`);
  console.log(`   • Total processing time: ${ensembleResults.reduce((sum, { timeMs }) => sum + timeMs, 0)}ms`);

  console.log(`\n🏆 Best Results Summary:`);
  console.log(`   • Best metric: ${metricResults.sort((a, b) => b.score - a.score)[0].name} (${metricResults[0].score.toFixed(3)})`);
  console.log(`   • Pipeline final score: ${stageResults[stageResults.length - 1].score.toFixed(3)}`);
  console.log(`   • Cross-validation: ${meanCV.toFixed(3)} ± ${stdCV.toFixed(3)}`);
  console.log(`   • Ensemble score: ${ensembleEvaluation.score.toFixed(3)}`);

  // 6. Real-world Integration Example
  console.log(`\n🌍 Real-world Integration Example`);
  console.log('================================');

  // Example of how to use this in a production environment
  const productionModule = result.optimizedModule; // Use best optimized module

  const productionInputs = [
    'What is 25 + 17?',
    'I love this new product!',
    'What is the capital of Germany?',
  ];

  console.log('Production predictions:');
  for (const input of productionInputs) {
    try {
      const prediction = await productionModule.predict(input);
      console.log(`   Input: "${input}"`);
      console.log(`   Output: "${prediction.output}"`);
      console.log(`   Confidence: ${(prediction.confidence || 0).toFixed(2)}\n`);
    } catch (error) {
      console.log(`   Error processing: ${error}\n`);
    }
  }

  console.log('✅ Advanced optimization demonstration completed!');
  console.log('\n💡 Key Takeaways:');
  console.log('   • Different metrics reveal different optimization characteristics');
  console.log('   • Multi-stage pipelines can achieve cumulative improvements');
  console.log('   • Cross-validation provides robust performance estimates');
  console.log('   • Ensembles often outperform individual optimizers');
  console.log('   • Cost tracking is essential for production deployments');
}

// Helper function for A/B testing different optimization strategies
async function performABTest() {
  console.log('\n🧪 A/B Testing Framework Example');
  console.log('=================================');

  const testDataset = createTestDataset(10, 'math');
  const baseModule = new MockModule('Calculate: ', ['4', '6', '8', '10', '12']);
  const teacher = createMockLanguageModel({ 'math': 'The answer is' });

  const strategies = [
    {
      name: 'Strategy A: Bootstrap Only',
      optimizer: new BootstrapOptimizer({
        maxLabeled: 5,
        maxBootstrapped: 3,
        teacherModel: teacher,
        metric: ExactMatch,
        verbose: false,
      }),
    },
    {
      name: 'Strategy B: COPRO Only',
      optimizer: new COPROOptimizer(teacher, {
        breadth: 3,
        depth: 2,
        numVariations: 2,
        metric: ExactMatch,
        verbose: false,
      }),
    },
    {
      name: 'Strategy C: Random Search Only',
      optimizer: new RandomSearchOptimizer({
        numCandidates: 6,
        budget: 10,
        strategy: 'mutation',
        metric: ExactMatch,
        verbose: false,
      }, teacher),
    },
  ];

  const abResults = [];

  for (const { name, optimizer } of strategies) {
    const result = await optimizer.optimize(baseModule, testDataset);
    abResults.push({
      strategy: name,
      score: result.finalScore,
      time: result.optimizationTimeMs,
    });

    console.log(`${name}: ${result.finalScore.toFixed(3)} (${result.optimizationTimeMs}ms)`);
  }

  // Statistical significance would be calculated here in a real scenario
  const winner = abResults.sort((a, b) => b.score - a.score)[0];
  console.log(`\n🏆 Winner: ${winner.strategy} with score ${winner.score.toFixed(3)}`);
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAdvancedOptimization()
    .then(() => performABTest())
    .catch(console.error);
}