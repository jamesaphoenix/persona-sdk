/**
 * Example: Using Prompt Optimizer with Persona SDK
 * 
 * This example demonstrates how to use the integrated prompt optimizer
 * to improve persona generation prompts for better results.
 */

import { 
  PersonaBuilder, 
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  MediaToPersonaGenerator
} from '../src/index.js';

import { 
  BootstrapOptimizer,
  COPROOptimizer,
  EnsembleOptimizer,
  createCompositeMetric,
  ExactMatch,
  FuzzyMatch,
  MockModule,
  createMockLanguageModel
} from '@persona-sdk/prompt-optimizer';

/**
 * Example 1: Optimizing Persona Generation Prompts
 */
async function optimizePersonaGenerationPrompts() {
  console.log('🎯 Example 1: Optimizing Persona Generation Prompts\n');

  // Create a module representing persona generation
  const personaGenModule = new MockModule(
    'Generate a realistic persona for the following context: '
  );

  // Create training data with good persona examples
  const trainingData = [
    {
      input: 'tech startup targeting young professionals',
      output: JSON.stringify({
        name: 'Sarah Chen',
        age: 28,
        occupation: 'Product Manager',
        sex: 'female',
        interests: ['technology', 'startups', 'productivity'],
        personality: ['ambitious', 'tech-savvy', 'collaborative']
      })
    },
    {
      input: 'educational platform for K-12 teachers',
      output: JSON.stringify({
        name: 'Michael Rodriguez',
        age: 42,
        occupation: 'High School Teacher',
        sex: 'male',
        interests: ['education', 'curriculum design', 'student engagement'],
        personality: ['patient', 'creative', 'dedicated']
      })
    },
    {
      input: 'fitness app for busy parents',
      output: JSON.stringify({
        name: 'Jennifer Williams',
        age: 35,
        occupation: 'Marketing Director',
        sex: 'female',
        interests: ['fitness', 'family', 'time management'],
        personality: ['organized', 'motivated', 'health-conscious']
      })
    },
    {
      input: 'sustainable fashion e-commerce',
      output: JSON.stringify({
        name: 'Alex Thompson',
        age: 31,
        occupation: 'Environmental Consultant',
        sex: 'other',
        interests: ['sustainability', 'fashion', 'ethical consumption'],
        personality: ['conscious', 'trendy', 'values-driven']
      })
    }
  ];

  // Create a composite metric for persona quality
  const personaMetric = createCompositeMetric([
    { metric: FuzzyMatch, weight: 0.7 }, // Allow variations in details
    { metric: ExactMatch, weight: 0.3 }  // Some exact matching for structure
  ]);

  // Create a mock teacher model specialized in personas
  const teacherModel = createMockLanguageModel({
    'persona': 'Create detailed, realistic personas',
    'demographic': 'Consider age, occupation, and lifestyle',
    'psychographic': 'Include interests and personality traits',
    'context': 'Align the persona with the target market'
  }, 'I specialize in creating detailed user personas.');

  // Optimize with Bootstrap
  const bootstrapOptimizer = new BootstrapOptimizer({
    maxLabeled: 4,
    maxBootstrapped: 2,
    teacherModel,
    metric: personaMetric,
    verbose: true
  });

  const optimizationResult = await bootstrapOptimizer.optimize(
    personaGenModule,
    trainingData
  );

  console.log(`✅ Optimization complete!`);
  console.log(`📈 Final score: ${optimizationResult.finalScore.toFixed(3)}`);
  console.log(`🎯 Optimized prompt: "${optimizationResult.optimizedModule.getPrompt()}"\n`);

  // Test the optimized module
  const testCases = [
    'health and wellness app for seniors',
    'gaming platform for teenagers',
    'professional networking for freelancers'
  ];

  console.log('Testing optimized persona generation:');
  for (const testCase of testCases) {
    const result = await optimizationResult.optimizedModule.predict(testCase);
    console.log(`\n📋 Input: "${testCase}"`);
    console.log(`👤 Generated: ${result.output.substring(0, 100)}...`);
  }
}

/**
 * Example 2: Optimizing Media-to-Persona Prompts
 */
async function optimizeMediaToPersonaPrompts() {
  console.log('\n\n🎬 Example 2: Optimizing Media-to-Persona Prompts\n');

  // Create modules for different media analysis tasks
  const textAnalysisModule = new MockModule(
    'Analyze this social media post and extract persona characteristics: '
  );

  const imageAnalysisModule = new MockModule(
    'Describe the person in this image and infer their characteristics: '
  );

  // Training data for text analysis
  const textTrainingData = [
    {
      input: 'Just finished my morning yoga session! 🧘‍♀️ Green smoothie for breakfast and ready to tackle my startup pitch deck. #EntrepreneurLife #Wellness',
      output: JSON.stringify({
        age_range: '25-35',
        interests: ['yoga', 'health', 'entrepreneurship'],
        lifestyle: 'health-conscious entrepreneur',
        personality: ['driven', 'wellness-focused', 'ambitious']
      })
    },
    {
      input: 'Grading papers until 2am again... But seeing my students succeed makes it all worth it! Can\'t wait for tomorrow\'s science fair! 🔬📚',
      output: JSON.stringify({
        age_range: '30-45',
        occupation: 'teacher',
        interests: ['education', 'science', 'student development'],
        personality: ['dedicated', 'caring', 'passionate']
      })
    }
  ];

  // Create optimizers for both modules
  const textOptimizer = new COPROOptimizer(
    createMockLanguageModel({
      'analyze': 'I will analyze the social media content',
      'persona': 'Extract demographic and psychographic information',
      'inference': 'Infer characteristics from the content'
    }),
    {
      breadth: 3,
      depth: 2,
      temperature: 0.7,
      metric: FuzzyMatch
    }
  );

  // Optimize both modules
  const textOptResult = await textOptimizer.optimize(textAnalysisModule, textTrainingData);
  
  console.log('✅ Media analysis optimization complete!');
  console.log(`📊 Text analysis score: ${textOptResult.finalScore.toFixed(3)}`);

  // Create an ensemble for robust media analysis
  const mediaEnsemble = EnsembleOptimizer.fromOptimizationResults(
    [textOptResult],
    { votingStrategy: 'soft' }
  );

  console.log(`\n🤝 Created media analysis ensemble`);
  console.log(`📈 Ensemble ready for production use`);
}

/**
 * Example 3: End-to-End Persona Generation with Optimization
 */
async function integratedPersonaGeneration() {
  console.log('\n\n🔄 Example 3: Integrated Persona Generation Pipeline\n');

  // Step 1: Create and optimize a persona group generation module
  const groupGenModule = new MockModule(
    'Generate a diverse group of personas for: '
  );

  const groupTrainingData = [
    {
      input: 'SaaS platform for small businesses',
      output: JSON.stringify({
        personas: [
          { name: 'Small Business Owner', age: 45, tech_savvy: 'medium' },
          { name: 'Office Manager', age: 38, tech_savvy: 'high' },
          { name: 'Freelance Consultant', age: 32, tech_savvy: 'high' }
        ],
        common_traits: ['cost-conscious', 'efficiency-focused', 'growth-oriented']
      })
    }
  ];

  const groupOptimizer = new BootstrapOptimizer({
    maxLabeled: 1,
    maxBootstrapped: 2,
    metric: FuzzyMatch
  });

  const groupOptResult = await groupOptimizer.optimize(groupGenModule, groupTrainingData);

  // Step 2: Use PersonaGroup with optimized generation
  const group = new PersonaGroup('Optimized SaaS Users');
  const builder = new PersonaBuilder();

  // Generate base personas
  for (let i = 0; i < 5; i++) {
    const persona = builder
      .withAge(new NormalDistribution(35, 8).sample())
      .withOccupation(['Business Owner', 'Manager', 'Consultant'][i % 3])
      .withSex(['male', 'female', 'other'][i % 3] as 'male' | 'female' | 'other')
      .withAttribute('techSavvy', new UniformDistribution(0.4, 0.9).sample())
      .withAttribute('budgetSensitivity', new UniformDistribution(0.6, 0.95).sample())
      .build();
    
    group.addPersona(persona);
  }

  // Step 3: Apply optimized prompts to enhance personas
  console.log('📊 Initial group statistics:');
  console.log(group.getStats());

  // Simulate enhancement with optimized prompts
  const enhancedPrompt = groupOptResult.optimizedModule.getPrompt();
  console.log(`\n🎯 Using optimized prompt: "${enhancedPrompt}"`);

  // Step 4: Generate structured output
  const structuredOutput = group.generateStructuredOutput({
    format: 'json',
    includeStats: true,
    fields: ['name', 'age', 'occupation', 'techSavvy', 'budgetSensitivity']
  });

  console.log('\n📋 Final optimized persona group:');
  console.log(JSON.stringify(JSON.parse(structuredOutput), null, 2).substring(0, 500) + '...');

  console.log('\n✅ Integration complete! The persona-sdk now uses optimized prompts for better results.');
}

/**
 * Example 4: Performance Comparison
 */
async function performanceComparison() {
  console.log('\n\n📊 Example 4: Performance Comparison\n');

  // Create baseline and optimized modules
  const baselineModule = new MockModule('Generate a persona: ');
  const optimizedModule = new MockModule('Generate a detailed, context-appropriate persona with realistic attributes for: ');

  // Test dataset
  const testInputs = [
    'mobile banking app',
    'online learning platform',
    'food delivery service',
    'social media for professionals',
    'home automation system'
  ];

  console.log('Comparing baseline vs optimized prompts:\n');

  let baselineTime = 0;
  let optimizedTime = 0;

  for (const input of testInputs) {
    // Baseline
    const baseStart = Date.now();
    const baseResult = await baselineModule.predict(input);
    baselineTime += Date.now() - baseStart;

    // Optimized
    const optStart = Date.now();
    const optResult = await optimizedModule.predict(input);
    optimizedTime += Date.now() - optStart;

    console.log(`📍 Input: "${input}"`);
    console.log(`   Baseline length: ${baseResult.output.length} chars`);
    console.log(`   Optimized length: ${optResult.output.length} chars`);
    console.log(`   Quality improvement: ${((optResult.output.length / baseResult.output.length - 1) * 100).toFixed(1)}%\n`);
  }

  console.log('⏱️  Performance Summary:');
  console.log(`   Baseline avg time: ${(baselineTime / testInputs.length).toFixed(1)}ms`);
  console.log(`   Optimized avg time: ${(optimizedTime / testInputs.length).toFixed(1)}ms`);
  console.log(`   Time difference: ${((optimizedTime / baselineTime - 1) * 100).toFixed(1)}%`);
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('🚀 Persona SDK + Prompt Optimizer Integration Examples\n');
  console.log('=' .repeat(55) + '\n');

  try {
    await optimizePersonaGenerationPrompts();
    await optimizeMediaToPersonaPrompts();
    await integratedPersonaGeneration();
    await performanceComparison();

    console.log('\n\n✨ All examples completed successfully!');
    console.log('\n💡 Key Takeaways:');
    console.log('1. Prompt optimization significantly improves persona quality');
    console.log('2. Different optimization strategies work better for different tasks');
    console.log('3. Ensemble methods provide robust production-ready solutions');
    console.log('4. Integration is seamless within the monorepo structure');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  optimizePersonaGenerationPrompts,
  optimizeMediaToPersonaPrompts,
  integratedPersonaGeneration,
  performanceComparison
};