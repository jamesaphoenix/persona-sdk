/**
 * Basic Prompt Optimization Example
 * 
 * This example demonstrates how to use the prompt optimizer package
 * to improve prompts using different optimization strategies.
 */

import {
  BootstrapOptimizer,
  COPROOptimizer,
  RandomSearchOptimizer,
  EnsembleOptimizer,
  ExactMatch,
  FuzzyMatch,
  MockModule,
  MockLanguageModel,
  createMockLanguageModel,
  createTestDataset,
  measureOptimizationPerformance,
} from '../src/index.js';

async function main() {
  console.log('🚀 Starting Prompt Optimization Example\n');

  // Create test data
  console.log('📊 Creating test datasets...');
  const mathDataset = createTestDataset(20, 'math');
  const trainset = mathDataset.slice(0, 15);
  const valset = mathDataset.slice(15);
  
  console.log(`Created ${trainset.length} training examples and ${valset.length} validation examples\n`);

  // Create a module to optimize
  const baseModule = new MockModule(
    'Solve this math problem step by step: ',
    ['4', '6', '8', '10', '12'] // Some correct answers
  );

  // Create a smart teacher model
  const teacherModel = createMockLanguageModel({
    'math': 'Let me solve this step by step. The answer is',
    'add': 'Adding these numbers gives us',
    'what is': 'The result is',
  }, 'I need to calculate this carefully.', 'teacher-gpt');

  console.log('🎯 Baseline Performance');
  console.log('========================');
  
  // Evaluate baseline performance
  const baselineEval = await evaluateModule(baseModule, valset, 'Baseline');
  console.log('');

  // 1. Bootstrap Optimization
  console.log('🔄 Bootstrap Optimization');
  console.log('==========================');
  
  const bootstrapOptimizer = new BootstrapOptimizer({
    maxLabeled: 8,
    maxBootstrapped: 4,
    teacherModel,
    metric: ExactMatch,
    verbose: true,
  });

  const { result: bootstrapResult, timeMs: bootstrapTime } = await measureOptimizationPerformance(
    () => bootstrapOptimizer.optimize(baseModule, trainset, valset),
    'Bootstrap Optimization'
  );

  console.log(`✅ Bootstrap completed: score ${bootstrapResult.finalScore.toFixed(3)} in ${bootstrapTime}ms\n`);

  // 2. COPRO Optimization
  console.log('🎨 COPRO Optimization');
  console.log('=====================');
  
  const coproOptimizer = new COPROOptimizer(teacherModel, {
    breadth: 5,
    depth: 3,
    temperature: 0.7,
    numVariations: 3,
    metric: ExactMatch,
    verbose: true,
  });

  const { result: coproResult, timeMs: coproTime } = await measureOptimizationPerformance(
    () => coproOptimizer.optimize(baseModule, trainset, valset),
    'COPRO Optimization'
  );

  console.log(`✅ COPRO completed: score ${coproResult.finalScore.toFixed(3)} in ${coproTime}ms\n`);

  // 3. Random Search Optimization
  console.log('🎲 Random Search Optimization');
  console.log('=============================');
  
  const randomSearchOptimizer = new RandomSearchOptimizer({
    numCandidates: 10,
    budget: 20,
    strategy: 'mutation',
    metric: ExactMatch,
    verbose: true,
  }, teacherModel);

  const { result: randomResult, timeMs: randomTime } = await measureOptimizationPerformance(
    () => randomSearchOptimizer.optimize(baseModule, trainset, valset),
    'Random Search Optimization'
  );

  console.log(`✅ Random Search completed: score ${randomResult.finalScore.toFixed(3)} in ${randomTime}ms\n`);

  // 4. Ensemble Optimization
  console.log('🤝 Ensemble Creation');
  console.log('====================');
  
  const ensemble = EnsembleOptimizer.fromOptimizationResults([
    bootstrapResult,
    coproResult,
    randomResult,
  ], {
    size: 3,
    votingStrategy: 'hard',
  });

  const ensembleEval = await evaluateModule(ensemble, valset, 'Ensemble');
  console.log('');

  // 5. Compare Results
  console.log('📈 Results Summary');
  console.log('==================');
  
  const results = [
    { name: 'Baseline', score: baselineEval.score, time: 0 },
    { name: 'Bootstrap', score: bootstrapResult.finalScore, time: bootstrapTime },
    { name: 'COPRO', score: coproResult.finalScore, time: coproTime },
    { name: 'Random Search', score: randomResult.finalScore, time: randomTime },
    { name: 'Ensemble', score: ensembleEval.score, time: 0 },
  ];

  results.sort((a, b) => b.score - a.score);

  console.log('Ranking by performance:');
  results.forEach((result, index) => {
    const timeStr = result.time > 0 ? ` (${result.time}ms)` : '';
    console.log(`  ${index + 1}. ${result.name}: ${result.score.toFixed(3)}${timeStr}`);
  });

  // 6. Demonstrate Advanced Features
  console.log('\n🔬 Advanced Features Demo');
  console.log('=========================');
  
  // Custom metric demonstration
  const customMetric = {
    name: 'custom_partial_match',
    evaluate: (example: any, prediction: any) => {
      const expected = String(example.output);
      const actual = String(prediction.output);
      return actual.includes(expected) ? 1.0 : 0.5; // Partial credit
    },
  };

  console.log('Testing with custom metric...');
  const customBootstrap = new BootstrapOptimizer({
    maxLabeled: 5,
    maxBootstrapped: 2,
    metric: customMetric,
    teacherModel,
    verbose: false,
  });

  const customResult = await customBootstrap.optimize(baseModule, trainset.slice(0, 5));
  console.log(`Custom metric result: ${customResult.finalScore.toFixed(3)}`);

  // Multiple metrics comparison
  console.log('\nComparing different metrics:');
  const metrics = [
    { name: 'Exact Match', metric: ExactMatch },
    { name: 'Fuzzy Match', metric: FuzzyMatch },
    { name: 'Custom Partial', metric: customMetric },
  ];

  for (const { name, metric } of metrics) {
    const score = await evaluateWithMetric(baseModule, valset.slice(0, 3), metric);
    console.log(`  ${name}: ${score.toFixed(3)}`);
  }

  console.log('\n🎉 Example completed successfully!');
  console.log('\n💡 Key Takeaways:');
  console.log('   • Different optimizers work better for different scenarios');
  console.log('   • Ensembles often provide the most robust performance');
  console.log('   • Custom metrics allow domain-specific evaluation');
  console.log('   • Always validate on held-out data');
}

// Helper function to evaluate a module
async function evaluateModule(module: any, dataset: any[], name: string) {
  const scores: number[] = [];
  
  for (const example of dataset) {
    const prediction = await module.predict(example.input);
    const score = ExactMatch.evaluate(example, prediction);
    scores.push(score);
  }
  
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  console.log(`${name} evaluation: ${avgScore.toFixed(3)} (${scores.length} examples)`);
  
  return { score: avgScore, scores };
}

// Helper function to evaluate with specific metric
async function evaluateWithMetric(module: any, dataset: any[], metric: any) {
  const scores: number[] = [];
  
  for (const example of dataset) {
    const prediction = await module.predict(example.input);
    const score = metric.evaluate(example, prediction);
    scores.push(score);
  }
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}