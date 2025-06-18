import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  PersonaBuilder, 
  PersonaGroup,
  NormalDistribution,
  UniformDistribution
} from '../src/index.js';
import { 
  BootstrapOptimizer,
  COPROOptimizer,
  EnsembleOptimizer,
  RandomSearchOptimizer,
  ExactMatch,
  FuzzyMatch,
  createCompositeMetric,
  MockModule,
  createMockLanguageModel,
  createTestDataset
} from '../src/index.js';

describe('Persona SDK + Prompt Optimizer Integration', () => {
  describe('Package imports', () => {
    it('should successfully import prompt-optimizer from workspace', () => {
      expect(BootstrapOptimizer).toBeDefined();
      expect(COPROOptimizer).toBeDefined();
      expect(EnsembleOptimizer).toBeDefined();
      expect(RandomSearchOptimizer).toBeDefined();
    });

    it('should successfully import persona-sdk modules', () => {
      expect(PersonaBuilder).toBeDefined();
      expect(PersonaGroup).toBeDefined();
      expect(NormalDistribution).toBeDefined();
      expect(UniformDistribution).toBeDefined();
    });
  });

  describe('Basic integration', () => {
    it('should create a mock module for persona generation', async () => {
      const module = new MockModule('Generate a persona for: ');
      expect(module).toBeDefined();
      expect(module.getPrompt()).toBe('Generate a persona for: ');
      
      const result = await module.predict('tech startup');
      expect(result).toBeDefined();
      expect(result.output).toBeTruthy();
    });

    it('should optimize persona generation prompts', async () => {
      const module = new MockModule('Create a user persona: ');
      const trainData = [
        { input: 'e-commerce', output: 'Online shopper, age 25-45' },
        { input: 'education', output: 'Teacher or student, age 20-50' }
      ];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 2,
        maxBootstrapped: 1,
        metric: FuzzyMatch
      });

      const result = await optimizer.optimize(module, trainData);
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Persona generation with optimized prompts', () => {
    let personaModule: MockModule;
    let optimizer: BootstrapOptimizer;
    let trainingData: Array<{ input: string; output: string }>;

    beforeEach(() => {
      personaModule = new MockModule('Generate a detailed persona for: ');
      
      trainingData = [
        {
          input: 'mobile banking app for millennials',
          output: JSON.stringify({
            name: 'Sarah Chen',
            age: 29,
            occupation: 'Marketing Manager',
            sex: 'female',
            interests: ['fintech', 'mobile apps', 'investing'],
            techSavvy: 0.9
          })
        },
        {
          input: 'fitness app for busy professionals',
          output: JSON.stringify({
            name: 'James Wilson',
            age: 35,
            occupation: 'Software Engineer',
            sex: 'male',
            interests: ['fitness', 'productivity', 'health'],
            timeConstrained: true
          })
        }
      ];

      const teacherModel = createMockLanguageModel({
        'persona': 'I will create a detailed persona',
        'demographic': 'Consider age, occupation, and lifestyle',
        'interests': 'Include relevant interests and behaviors'
      });

      optimizer = new BootstrapOptimizer({
        maxLabeled: 2,
        maxBootstrapped: 1,
        teacherModel,
        metric: createCompositeMetric([
          { metric: FuzzyMatch, weight: 0.8 },
          { metric: ExactMatch, weight: 0.2 }
        ])
      });
    });

    it('should optimize persona generation prompts successfully', async () => {
      const result = await optimizer.optimize(personaModule, trainingData);
      
      expect(result.optimizedModule).toBeDefined();
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.optimizedModule.getPrompt()).toBeTruthy();
      expect(result.optimizedModule.getPrompt()).not.toBe(personaModule.getPrompt());
    });

    it('should generate better personas with optimized prompts', async () => {
      const baselineResult = await personaModule.predict('social media for seniors');
      const optimizedResult = await optimizer.optimize(personaModule, trainingData);
      const enhancedResult = await optimizedResult.optimizedModule.predict('social media for seniors');

      expect(enhancedResult.output.length).toBeGreaterThanOrEqual(baselineResult.output.length);
      expect(enhancedResult.confidence).toBeDefined();
    });

    it('should work with PersonaBuilder and optimized attributes', async () => {
      const builder = new PersonaBuilder();
      const optimizedResult = await optimizer.optimize(personaModule, trainingData);
      
      // Use optimized module to generate attributes
      const attributeResult = await optimizedResult.optimizedModule.predict('tech-savvy young professional');
      
      // Create persona with builder
      const persona = builder
        .withName('Test User')
        .withAge(28)
        .withOccupation('Product Manager')
        .withSex('female')
        .withAttribute('generatedProfile', attributeResult.output)
        .build();

      expect(persona).toBeDefined();
      expect(persona.name).toBe('Test User');
      expect(persona.attributes.generatedProfile).toBe(attributeResult.output);
    });
  });

  describe('PersonaGroup with prompt optimization', () => {
    it('should create and optimize a persona group generation system', async () => {
      const group = new PersonaGroup('Optimized Test Group');
      const builder = new PersonaBuilder();

      // Create optimization module for group descriptions
      const groupModule = new MockModule('Describe this persona group: ');
      const groupData = [
        {
          input: 'startup employees',
          output: 'Young, tech-savvy professionals aged 25-35'
        },
        {
          input: 'healthcare workers',
          output: 'Dedicated medical professionals aged 30-50'
        }
      ];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 2,
        metric: FuzzyMatch
      });

      const optimResult = await optimizer.optimize(groupModule, groupData);
      expect(optimResult.finalScore).toBeGreaterThanOrEqual(0);

      // Generate personas for the group
      for (let i = 0; i < 5; i++) {
        const persona = builder
          .withName(`Test User ${i}`)
          .withAge(new NormalDistribution(30, 5).sample())
          .withOccupation(['Engineer', 'Designer', 'Manager'][i % 3])
          .withSex(['male', 'female', 'other'][i % 3] as 'male' | 'female' | 'other')
          .build();
        
        group.add(persona);
      }

      expect(group.size).toBe(5);
      
      // Get optimized group description
      const groupDescription = await optimResult.optimizedModule.predict('tech startup team');
      expect(groupDescription.output).toBeTruthy();
    });
  });

  describe('Ensemble optimization for personas', () => {
    it('should create an ensemble of optimizers for robust persona generation', async () => {
      const module = new MockModule('Generate persona: ');
      const trainData = createTestDataset(10, 'persona');
      
      // Create multiple optimizers
      const teacherModel = createMockLanguageModel();
      
      const bootstrapOpt = new BootstrapOptimizer({
        maxLabeled: 5,
        teacherModel,
        metric: ExactMatch
      });

      const coproOpt = new COPROOptimizer(teacherModel, {
        breadth: 3,
        depth: 2,
        metric: FuzzyMatch
      });

      const randomOpt = new RandomSearchOptimizer({
        numCandidates: 5,
        budget: 10,
        metric: ExactMatch
      }, teacherModel);

      // Optimize with each
      const [bResult, cResult, rResult] = await Promise.all([
        bootstrapOpt.optimize(module, trainData),
        coproOpt.optimize(module, trainData),
        randomOpt.optimize(module, trainData)
      ]);

      // Create ensemble
      const ensemble = EnsembleOptimizer.fromOptimizationResults(
        [bResult, cResult, rResult],
        { votingStrategy: 'soft' }
      );

      expect(ensemble).toBeDefined();
      expect(ensemble.getStats().moduleCount).toBe(3);

      // Test ensemble prediction
      const ensembleResult = await ensemble.predict('Create a persona for a fitness app');
      expect(ensembleResult.output).toBeTruthy();
      expect(ensembleResult.confidence).toBeGreaterThan(0);
    });
  });

  describe('Metrics for persona evaluation', () => {
    it('should create custom metrics for persona quality', () => {
      const personaMetric = {
        name: 'persona_completeness',
        evaluate: (example: any, prediction: any) => {
          try {
            const predicted = JSON.parse(prediction.output);
            const requiredFields = ['name', 'age', 'occupation'];
            const hasAllFields = requiredFields.every(field => field in predicted);
            return hasAllFields ? 1.0 : 0.0;
          } catch {
            return 0.0;
          }
        }
      };

      const example = { 
        input: 'test', 
        output: JSON.stringify({ name: 'Test', age: 30, occupation: 'Tester' }) 
      };
      
      const goodPrediction = { 
        output: JSON.stringify({ name: 'Alice', age: 25, occupation: 'Developer' }) 
      };
      
      const badPrediction = { 
        output: JSON.stringify({ name: 'Bob' }) 
      };

      expect(personaMetric.evaluate(example, goodPrediction)).toBe(1.0);
      expect(personaMetric.evaluate(example, badPrediction)).toBe(0.0);
    });

    it('should use composite metrics for persona evaluation', async () => {
      const compositeMetric = createCompositeMetric([
        { metric: FuzzyMatch, weight: 0.6 },
        { metric: ExactMatch, weight: 0.4 }
      ]);

      const module = new MockModule('Generate: ');
      const data = [
        { input: 'persona', output: 'A 30 year old developer' },
        { input: 'user', output: 'A 25 year old designer' }
      ];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 2,
        metric: compositeMetric
      });

      const result = await optimizer.optimize(module, data);
      expect(result.finalScore).toBeGreaterThanOrEqual(0);
      expect(result.finalScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance and memory usage', () => {
    it('should handle large-scale persona generation with optimization', { timeout: 10000 }, async () => {
      const module = new MockModule('Bulk generate personas: ');
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        input: `user type ${i}`,
        output: `persona ${i}`
      }));

      const optimizer = new RandomSearchOptimizer({
        numCandidates: 10,
        budget: 20,
        metric: FuzzyMatch
      });

      const startTime = Date.now();
      const result = await optimizer.optimize(module, largeDataset);
      const endTime = Date.now();

      expect(result.optimizedModule).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it('should efficiently generate PersonaGroups with distributions', () => {
      const group = new PersonaGroup('Performance Test');
      const startTime = Date.now();

      // Generate 100 personas with distributions
      group.generateFromDistributions(100, {
        age: new NormalDistribution(35, 10),
        income: new UniformDistribution(30000, 150000),
        occupation: 'Various',
        sex: 'other'
      });

      const endTime = Date.now();

      expect(group.personas.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      
      const stats = group.getStatistics('age');
      expect(stats.min).toBeGreaterThan(0);
      expect(stats.max).toBeLessThan(100);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid optimization inputs gracefully', async () => {
      const module = new MockModule('');
      const emptyData: any[] = [];

      const optimizer = new BootstrapOptimizer({
        maxLabeled: 1,
        metric: ExactMatch
      });

      // Empty data returns a valid result with 0 score
      const result = await optimizer.optimize(module, emptyData);
      expect(result.finalScore).toBe(0);
    });

    it('should handle mixed persona and optimization workflows', async () => {
      const builder = new PersonaBuilder();
      const persona = builder
        .withName('Test User')
        .withAge(30)
        .withOccupation('Tester')
        .withSex('other')
        .build();

      const module = new MockModule(`Enhance this persona: ${JSON.stringify(persona)}`);
      const result = await module.predict('add more details');

      expect(result.output).toBeTruthy();
      expect(result.metadata).toBeDefined();
    });
  });
});

describe('Integration patterns and best practices', () => {
  it('should demonstrate recommended integration pattern', async () => {
    // 1. Create persona generation module
    const personaGenModule = new MockModule('Generate realistic persona for: ');
    
    // 2. Prepare training data
    const trainingData = [
      {
        input: 'e-commerce platform',
        output: JSON.stringify({
          name: 'Online Shopper',
          age: 32,
          interests: ['shopping', 'deals', 'reviews']
        })
      }
    ];

    // 3. Optimize the module
    const optimizer = new BootstrapOptimizer({
      maxLabeled: 1,
      metric: FuzzyMatch
    });
    const optimized = await optimizer.optimize(personaGenModule, trainingData);

    // 4. Use with PersonaBuilder
    const builder = new PersonaBuilder();
    const generatedAttrs = await optimized.optimizedModule.predict('social media platform');
    
    // 5. Create enhanced persona
    const persona = builder
      .withName('Enhanced User')
      .withAge(28)
      .withOccupation('Social Media Manager')
      .withSex('female')
      .withAttribute('aiGenerated', generatedAttrs.output)
      .build();

    expect(persona.attributes.aiGenerated).toBeTruthy();
    expect(persona.name).toBe('Enhanced User');
  });

  it('should support async persona generation pipelines', async () => {
    const pipeline = async (context: string) => {
      // Step 1: Optimize prompt
      const module = new MockModule('Generate persona attributes: ');
      const optimizer = new BootstrapOptimizer({ maxLabeled: 1, metric: ExactMatch });
      const data = [{ input: 'test', output: 'test persona' }];
      const optimized = await optimizer.optimize(module, data);

      // Step 2: Generate attributes
      const attrs = await optimized.optimizedModule.predict(context);

      // Step 3: Create persona
      const builder = new PersonaBuilder();
      return builder
        .withName('Pipeline User')
        .withAge(30)
        .withOccupation('Unknown')
        .withSex('other')
        .withAttribute('context', context)
        .withAttribute('generated', attrs.output)
        .build();
    };

    const persona = await pipeline('gaming platform');
    expect(persona).toBeDefined();
    expect(persona.attributes.context).toBe('gaming platform');
    expect(persona.attributes.generated).toBeTruthy();
  });
});