/**
 * Integration Example: Using Prompt Optimizer with Persona SDK
 * 
 * This example demonstrates how to use the prompt optimizer package
 * to optimize prompts for persona generation and analysis tasks.
 */

import {
  BootstrapOptimizer,
  COPROOptimizer,
  EnsembleOptimizer,
  ExactMatch,
  FuzzyMatch,
  createCompositeMetric,
  MockModule,
  createMockLanguageModel,
  createTestDataset,
  measureOptimizationPerformance,
} from '../src/index.js';

// Import persona SDK types (would be actual imports in real usage)
type PersonaAttributes = {
  name: string;
  age: number;
  occupation: string;
  sex: 'male' | 'female' | 'other';
  location?: string;
  interests?: string[];
  personality?: string[];
};

type PersonaGenerationPrompt = {
  context: string;
  requirements: string;
  format: string;
};

// Mock persona generation module
class PersonaGenerationModule {
  private prompt: string;
  private personas: PersonaAttributes[];

  constructor(prompt: string) {
    this.prompt = prompt;
    this.personas = [
      { name: 'Alice Johnson', age: 28, occupation: 'Software Engineer', sex: 'female', location: 'San Francisco' },
      { name: 'Bob Smith', age: 35, occupation: 'Teacher', sex: 'male', location: 'New York' },
      { name: 'Charlie Davis', age: 42, occupation: 'Designer', sex: 'other', location: 'Austin' },
      { name: 'Diana Lee', age: 31, occupation: 'Doctor', sex: 'female', location: 'Boston' },
      { name: 'Ethan Wilson', age: 26, occupation: 'Artist', sex: 'male', location: 'Portland' },
    ];
  }

  async predict(input: string | Record<string, any>): Promise<any> {
    // Simulate persona generation based on input
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Simple logic to select persona based on input
    let selectedPersona = this.personas[0];
    
    if (inputStr.includes('teacher') || inputStr.includes('education')) {
      selectedPersona = this.personas[1];
    } else if (inputStr.includes('creative') || inputStr.includes('art')) {
      selectedPersona = this.personas[4];
    } else if (inputStr.includes('healthcare') || inputStr.includes('medical')) {
      selectedPersona = this.personas[3];
    } else if (inputStr.includes('design')) {
      selectedPersona = this.personas[2];
    }

    return {
      output: JSON.stringify(selectedPersona),
      confidence: 0.85,
      metadata: {
        inputLength: inputStr.length,
        persona: selectedPersona,
        prompt: this.prompt,
        usage: {
          inputTokens: Math.floor(inputStr.length / 4),
          outputTokens: Math.floor(JSON.stringify(selectedPersona).length / 4),
          totalTokens: Math.floor((inputStr.length + JSON.stringify(selectedPersona).length) / 4),
        },
      },
    };
  }

  getPrompt(): string {
    return this.prompt;
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  clone(): PersonaGenerationModule {
    return new PersonaGenerationModule(this.prompt);
  }
}

// Persona analysis module
class PersonaAnalysisModule {
  private prompt: string;

  constructor(prompt: string) {
    this.prompt = prompt;
  }

  async predict(input: string | Record<string, any>): Promise<any> {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Mock analysis based on persona data
    let analysis = 'balanced_profile';
    
    if (inputStr.includes('Software Engineer') || inputStr.includes('tech')) {
      analysis = 'tech_oriented';
    } else if (inputStr.includes('Teacher') || inputStr.includes('education')) {
      analysis = 'education_focused';
    } else if (inputStr.includes('Doctor') || inputStr.includes('medical')) {
      analysis = 'healthcare_professional';
    } else if (inputStr.includes('Artist') || inputStr.includes('creative')) {
      analysis = 'creative_type';
    }

    return {
      output: analysis,
      confidence: 0.9,
      metadata: {
        analysisType: 'persona_classification',
        prompt: this.prompt,
        usage: {
          inputTokens: Math.floor(inputStr.length / 4),
          outputTokens: Math.floor(analysis.length / 4),
          totalTokens: Math.floor((inputStr.length + analysis.length) / 4),
        },
      },
    };
  }

  getPrompt(): string {
    return this.prompt;
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  clone(): PersonaAnalysisModule {
    return new PersonaAnalysisModule(this.prompt);
  }
}

// Create persona-specific datasets
const personaGenerationDataset = [
  {
    input: 'Generate a persona for a tech startup user',
    output: JSON.stringify({ name: 'Alice Johnson', age: 28, occupation: 'Software Engineer', sex: 'female', location: 'San Francisco' })
  },
  {
    input: 'Create a persona for an education platform',
    output: JSON.stringify({ name: 'Bob Smith', age: 35, occupation: 'Teacher', sex: 'male', location: 'New York' })
  },
  {
    input: 'Generate a creative industry persona',
    output: JSON.stringify({ name: 'Ethan Wilson', age: 26, occupation: 'Artist', sex: 'male', location: 'Portland' })
  },
  {
    input: 'Create a healthcare professional persona',
    output: JSON.stringify({ name: 'Diana Lee', age: 31, occupation: 'Doctor', sex: 'female', location: 'Boston' })
  },
  {
    input: 'Generate a design-focused persona',
    output: JSON.stringify({ name: 'Charlie Davis', age: 42, occupation: 'Designer', sex: 'other', location: 'Austin' })
  },
];

const personaAnalysisDataset = [
  {
    input: JSON.stringify({ name: 'Alice Johnson', age: 28, occupation: 'Software Engineer', sex: 'female' }),
    output: 'tech_oriented'
  },
  {
    input: JSON.stringify({ name: 'Bob Smith', age: 35, occupation: 'Teacher', sex: 'male' }),
    output: 'education_focused'
  },
  {
    input: JSON.stringify({ name: 'Diana Lee', age: 31, occupation: 'Doctor', sex: 'female' }),
    output: 'healthcare_professional'
  },
  {
    input: JSON.stringify({ name: 'Ethan Wilson', age: 26, occupation: 'Artist', sex: 'male' }),
    output: 'creative_type'
  },
  {
    input: JSON.stringify({ name: 'Charlie Davis', age: 42, occupation: 'Designer', sex: 'other' }),
    output: 'creative_type'
  },
];

// Domain-specific metrics for persona tasks
const PersonaGenerationMetric = createCompositeMetric([
  { metric: FuzzyMatch, weight: 0.7 },  // Allow for variations in persona details
  { metric: ExactMatch, weight: 0.3 },  // Some exact matching for key fields
]);

const PersonaAnalysisMetric = {
  name: 'persona_classification_accuracy',
  evaluate: (example: any, prediction: any) => {
    const expected = String(example.output).toLowerCase();
    const actual = String(prediction.output).toLowerCase();
    
    // Exact match gets full score
    if (expected === actual) return 1.0;
    
    // Partial credit for related categories
    const categoryMap: Record<string, string[]> = {
      'tech_oriented': ['software', 'engineer', 'developer', 'tech'],
      'education_focused': ['teacher', 'educator', 'academic', 'education'],
      'healthcare_professional': ['doctor', 'nurse', 'medical', 'healthcare'],
      'creative_type': ['artist', 'designer', 'creative', 'artistic'],
    };
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (expected === category && keywords.some(keyword => actual.includes(keyword))) {
        return 0.6; // Partial credit for related terms
      }
    }
    
    return 0.0;
  },
};

async function demonstratePersonaSDKIntegration() {
  console.log('🎭 Persona SDK + Prompt Optimizer Integration Demo\n');

  // Create persona-specific language model
  const personaLM = createMockLanguageModel({
    'persona': 'You are an expert persona generator. Create realistic, detailed personas based on the given context.',
    'generate': 'Based on the requirements, I will create a comprehensive persona with realistic attributes.',
    'analysis': 'I will analyze this persona and classify their primary characteristics and focus areas.',
    'demographic': 'Consider age, occupation, location, and psychographic factors when creating personas.',
    'optimize': 'Here is an improved prompt that will generate more accurate and detailed personas',
  }, 'I specialize in creating realistic personas for user research and marketing.', 'persona-expert-gpt');

  // 1. Optimize Persona Generation
  console.log('🎯 Optimizing Persona Generation Prompts');
  console.log('=========================================');

  const personaGenModule = new PersonaGenerationModule(
    'Generate a realistic persona based on the given context and requirements.'
  );

  const genOptimizer = new BootstrapOptimizer({
    maxLabeled: 5,
    maxBootstrapped: 3,
    teacherModel: personaLM,
    metric: PersonaGenerationMetric,
    verbose: true,
  });

  const { result: genResult, timeMs: genTime } = await measureOptimizationPerformance(
    () => genOptimizer.optimize(personaGenModule, personaGenerationDataset),
    'Persona Generation Optimization'
  );

  console.log(`✅ Persona generation optimized: ${genResult.finalScore.toFixed(3)} (${genTime}ms)`);
  console.log(`📈 Improved persona accuracy and detail\n`);

  // 2. Optimize Persona Analysis
  console.log('🔍 Optimizing Persona Analysis Prompts');
  console.log('======================================');

  const personaAnalysisModule = new PersonaAnalysisModule(
    'Analyze the given persona and classify their primary characteristics.'
  );

  const analysisOptimizer = new COPROOptimizer(personaLM, {
    breadth: 4,
    depth: 2,
    temperature: 0.6,
    numVariations: 3,
    metric: PersonaAnalysisMetric,
    verbose: true,
  });

  const { result: analysisResult, timeMs: analysisTime } = await measureOptimizationPerformance(
    () => analysisOptimizer.optimize(personaAnalysisModule, personaAnalysisDataset),
    'Persona Analysis Optimization'
  );

  console.log(`✅ Persona analysis optimized: ${analysisResult.finalScore.toFixed(3)} (${analysisTime}ms)`);
  console.log(`🎯 Enhanced classification accuracy\n`);

  // 3. Create Persona Ensemble System
  console.log('🤝 Creating Persona Ensemble System');
  console.log('===================================');

  const personaEnsemble = EnsembleOptimizer.fromOptimizationResults([
    genResult,
    analysisResult,
  ], {
    size: 2,
    votingStrategy: 'soft',
    reducer: (outputs) => {
      // Custom reducer for persona tasks
      const validOutputs = outputs.filter(o => o && o !== '');
      if (validOutputs.length === 0) return 'Unable to generate persona';
      
      // For persona generation, prefer the most detailed output
      return validOutputs.reduce((best, current) => {
        const currentStr = String(current);
        const bestStr = String(best);
        return currentStr.length > bestStr.length ? current : best;
      });
    },
  });

  console.log(`🎭 Persona ensemble created with ${personaEnsemble.getStats().moduleCount} specialized modules\n`);

  // 4. Test Integrated Workflow
  console.log('🔄 Testing Integrated Persona Workflow');
  console.log('======================================');

  const testScenarios = [
    {
      name: 'Tech Startup User Research',
      input: 'Generate a persona for a SaaS platform targeting young professionals',
      expectedType: 'tech_oriented'
    },
    {
      name: 'Educational Platform Target',
      input: 'Create a persona for an online learning platform',
      expectedType: 'education_focused'
    },
    {
      name: 'Healthcare Application User',
      input: 'Generate a persona for a medical app targeting healthcare workers',
      expectedType: 'healthcare_professional'
    },
    {
      name: 'Creative Tools User',
      input: 'Create a persona for a design software platform',
      expectedType: 'creative_type'
    },
  ];

  console.log('Integrated workflow results:');
  
  for (const scenario of testScenarios) {
    try {
      // Step 1: Generate persona
      const generatedPersona = await genResult.optimizedModule.predict(scenario.input);
      
      // Step 2: Analyze generated persona
      const analysis = await analysisResult.optimizedModule.predict(generatedPersona.output);
      
      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log(`🎯 Input: "${scenario.input}"`);
      console.log(`👤 Generated Persona: ${generatedPersona.output.substring(0, 100)}...`);
      console.log(`🔍 Analysis: ${analysis.output}`);
      console.log(`✅ Expected: ${scenario.expectedType} | Actual: ${analysis.output}`);
      console.log(`📊 Confidence: Generation ${(generatedPersona.confidence || 0).toFixed(2)}, Analysis ${(analysis.confidence || 0).toFixed(2)}`);
      
    } catch (error) {
      console.log(`❌ Error in scenario "${scenario.name}": ${error}`);
    }
  }

  // 5. Performance and ROI Analysis
  console.log('\n💰 Persona SDK Integration Benefits');
  console.log('===================================');

  const totalOptimizationTime = genTime + analysisTime;
  const avgScoreImprovement = ((genResult.finalScore + analysisResult.finalScore) / 2) - 0.65; // Assume 0.65 baseline
  
  console.log(`📈 Performance Improvements:`);
  console.log(`   • Persona generation score: ${genResult.finalScore.toFixed(3)}`);
  console.log(`   • Persona analysis score: ${analysisResult.finalScore.toFixed(3)}`);
  console.log(`   • Average improvement: ${(avgScoreImprovement * 100).toFixed(1)}% over baseline`);
  console.log(`   • Total optimization time: ${totalOptimizationTime}ms`);

  console.log(`\n🎯 Business Value for Persona SDK:`);
  console.log(`   • More accurate persona generation reduces user research time`);
  console.log(`   • Better classification improves targeting and personalization`);
  console.log(`   • Automated optimization reduces manual prompt engineering`);
  console.log(`   • Ensemble methods provide robust, production-ready personas`);

  // 6. Usage Recommendations
  console.log(`\n💡 Integration Recommendations:`);
  console.log(`============================`);
  console.log(`1. **Development**: Use prompt optimizer during persona model development`);
  console.log(`2. **A/B Testing**: Compare optimized vs baseline persona generation`);
  console.log(`3. **Continuous Improvement**: Regular re-optimization with new data`);
  console.log(`4. **Domain Adaptation**: Customize metrics for specific industries`);
  console.log(`5. **Production Deployment**: Use ensemble for robust persona generation`);

  console.log('\n✅ Persona SDK + Prompt Optimizer integration demonstration completed!');
}

// Utility function for persona validation
function validatePersona(persona: any): boolean {
  try {
    const parsed = typeof persona === 'string' ? JSON.parse(persona) : persona;
    return !!(parsed.name && parsed.age && parsed.occupation && parsed.sex);
  } catch {
    return false;
  }
}

// Example of custom persona metric
const PersonaCompletenessMetric = {
  name: 'persona_completeness',
  evaluate: (example: any, prediction: any) => {
    const expectedPersona = typeof example.output === 'string' ? 
      JSON.parse(example.output) : example.output;
    
    try {
      const predictedPersona = typeof prediction.output === 'string' ? 
        JSON.parse(prediction.output) : prediction.output;
      
      const requiredFields = ['name', 'age', 'occupation', 'sex'];
      const optionalFields = ['location', 'interests', 'personality'];
      
      let score = 0;
      const maxScore = requiredFields.length + optionalFields.length;
      
      // Check required fields
      for (const field of requiredFields) {
        if (predictedPersona[field] && expectedPersona[field]) {
          score += 1;
        }
      }
      
      // Check optional fields (partial credit)
      for (const field of optionalFields) {
        if (predictedPersona[field]) {
          score += 0.5;
        }
      }
      
      return Math.min(score / maxScore, 1.0);
      
    } catch {
      return 0.0;
    }
  },
};

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstratePersonaSDKIntegration().catch(console.error);
}