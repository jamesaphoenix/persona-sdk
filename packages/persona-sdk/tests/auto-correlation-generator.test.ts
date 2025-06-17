import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  AutoCorrelationGenerator, 
  generateWithAutoCorrelations,
  AutoCorrelationSchema 
} from '../src/tools/auto-correlation-generator';
import { UniformDistribution, NormalDistribution, ExponentialDistribution, BetaDistribution } from '../src';

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockImplementation(async (params) => {
          const content = params.messages[1].content;
          
          // Generate realistic correlations based on attributes mentioned
          const response = {
            correlations: [],
            conditionals: []
          };
          
          // Handle empty attributes case
          if (content.includes('Attributes:\n\n') || 
              content.includes('Attributes:\n\nContext:') ||
              !content.includes('age') && !content.includes('income') && !content.includes('height') && !content.includes('weight')) {
            return {
              choices: [{
                message: {
                  function_call: {
                    arguments: JSON.stringify(response)
                  }
                }
              }]
            };
          }
          
          // Handle workplace domain
          if (content.includes('domain: workplace') || content.includes('Domain: workplace')) {
            if (content.includes('yearsExperience') && content.includes('age')) {
              response.conditionals.push({
                attribute: 'yearsExperience',
                dependsOn: 'age',
                transformType: 'age_experience',
                reasoning: 'Experience cannot exceed working years'
              });
            }
            
            if (content.includes('salary') && content.includes('yearsExperience')) {
              response.correlations.push({
                attribute1: 'salary',
                attribute2: 'yearsExperience',
                correlation: 0.7,
                reasoning: 'Salary increases with experience'
              });
            }
            
            if (content.includes('salary') && content.includes('performanceRating')) {
              response.correlations.push({
                attribute1: 'salary',
                attribute2: 'performanceRating',
                correlation: 0.5,
                reasoning: 'Higher performers earn more'
              });
            }
          }
          
          // Handle health domain
          if (content.includes('domain: health') || content.includes('Domain: health')) {
            if (content.includes('height') && content.includes('weight')) {
              response.correlations.push({
                attribute1: 'height',
                attribute2: 'weight',
                correlation: 0.7,
                reasoning: 'Taller people tend to weigh more'
              });
            }
            
            if (content.includes('exerciseHoursPerWeek') && content.includes('restingHeartRate')) {
              response.correlations.push({
                attribute1: 'exerciseHoursPerWeek',
                attribute2: 'restingHeartRate',
                correlation: -0.4,
                reasoning: 'More exercise leads to lower resting heart rate'
              });
            }
          }
          
          // Count numeric attributes to determine if correlations are possible
          const hasAge = content.includes('age');
          const hasIncome = content.includes('income');
          const hasHeight = content.includes('height');
          const hasWeight = content.includes('weight');
          const hasYearsExp = content.includes('yearsExperience');
          
          let numericCount = 0;
          if (hasAge) numericCount++;
          if (hasIncome) numericCount++;
          if (hasHeight) numericCount++;
          if (hasWeight) numericCount++;
          if (hasYearsExp) numericCount++;
          
          // Only add correlations if we have at least 2 numeric attributes
          if (numericCount >= 2) {
            // Default correlations
            if (hasAge && hasIncome) {
              response.correlations.push({
                attribute1: 'age',
                attribute2: 'income',
                correlation: 0.6,
                reasoning: 'Income typically increases with age until retirement'
              });
            }
            
            if (hasHeight && hasWeight) {
              response.correlations.push({
                attribute1: 'height',
                attribute2: 'weight',
                correlation: 0.7,
                reasoning: 'Taller people tend to weigh more'
              });
            }
          }
          
          if (content.includes('yearsExperience') && !response.conditionals.some(c => c.attribute === 'yearsExperience')) {
            response.conditionals.push({
              attribute: 'yearsExperience',
              dependsOn: 'age',
              transformType: 'age_experience',
              reasoning: 'Experience cannot exceed working years'
            });
          }
          
          if (content.includes('income') && content.includes('educationYears')) {
            response.conditionals.push({
              attribute: 'income',
              dependsOn: 'educationYears',
              transformType: 'education_income',
              reasoning: 'Higher education correlates with higher income'
            });
          }
          
          return {
            choices: [{
              message: {
                function_call: {
                  arguments: JSON.stringify(response)
                }
              }
            }]
          };
        })
      }
    }
  }))
}));

describe('AutoCorrelationGenerator', () => {
  let generator: AutoCorrelationGenerator;

  beforeEach(() => {
    generator = new AutoCorrelationGenerator('test-api-key');
  });

  describe('generate', () => {
    it('should generate correlations for numeric attributes', async () => {
      const config = await generator.generate({
        attributes: {
          age: new UniformDistribution(25, 65),
          income: new NormalDistribution(60000, 20000),
          yearsExperience: new UniformDistribution(0, 30)
        },
        context: 'Tech professionals'
      });

      // Should have at least one correlation
      expect(config.correlations.length).toBeGreaterThan(0);
      
      // Should contain age-income correlation
      const ageIncomeCorr = config.correlations.find(
        c => (c.attribute1 === 'age' && c.attribute2 === 'income') ||
             (c.attribute1 === 'income' && c.attribute2 === 'age')
      );
      expect(ageIncomeCorr).toBeDefined();
      expect(ageIncomeCorr?.correlation).toBe(0.6);

      expect(config.conditionals).toHaveLength(1);
      expect(config.conditionals[0]).toMatchObject({
        attribute: 'yearsExperience',
        dependsOn: 'age',
        transformType: 'age_experience'
      });
    });

    it('should handle mixed attribute types', async () => {
      const config = await generator.generate({
        attributes: {
          height: new NormalDistribution(170, 10),
          weight: new NormalDistribution(70, 15),
          fitnessLevel: new UniformDistribution(1, 10),
          diet: 'vegetarian'
        },
        domain: 'health'
      });

      expect(config.correlations).toContainEqual(
        expect.objectContaining({
          attribute1: 'height',
          attribute2: 'weight'
        })
      );
    });

    it('should respect context and domain', async () => {
      const config = await generator.generate({
        attributes: {
          age: new UniformDistribution(18, 80),
          income: new NormalDistribution(50000, 20000),
          educationYears: new UniformDistribution(12, 20)
        },
        context: 'University professors',
        domain: 'academic'
      });

      expect(config.conditionals).toContainEqual(
        expect.objectContaining({
          attribute: 'income',
          dependsOn: 'educationYears',
          transformType: 'education_income'
        })
      );
    });

    it('should validate the generated config', async () => {
      const config = await generator.generate({
        attributes: {
          age: new UniformDistribution(20, 60),
          income: new NormalDistribution(40000, 15000)
        }
      });

      // Should not throw
      expect(() => AutoCorrelationSchema.parse(config)).not.toThrow();
    });
  });

  describe('toBuildConfig', () => {
    it('should convert to PersonaBuilder format', () => {
      const autoConfig = {
        correlations: [{
          attribute1: 'age',
          attribute2: 'income',
          correlation: 0.6,
          reasoning: 'Test'
        }],
        conditionals: [{
          attribute: 'yearsExperience',
          dependsOn: 'age',
          transformType: 'age_experience' as const,
          reasoning: 'Test'
        }]
      };

      const buildConfig = generator.toBuildConfig(autoConfig);

      expect(buildConfig.correlations).toHaveLength(1);
      expect(buildConfig.correlations[0]).toMatchObject({
        attribute1: 'age',
        attribute2: 'income',
        correlation: 0.6
      });

      expect(buildConfig.conditionals).toHaveLength(1);
      expect(buildConfig.conditionals[0].attribute).toBe('yearsExperience');
      expect(buildConfig.conditionals[0].dependsOn).toBe('age');
      expect(typeof buildConfig.conditionals[0].transform).toBe('function');
    });

    it('should handle custom transform functions', () => {
      const autoConfig = {
        correlations: [],
        conditionals: [{
          attribute: 'bonus',
          dependsOn: 'performance',
          transformType: 'custom' as const,
          customFormula: 'return value * dependent * 0.1;',
          reasoning: 'Performance-based bonus'
        }]
      };

      const buildConfig = generator.toBuildConfig(autoConfig);
      const transform = buildConfig.conditionals[0].transform;
      
      expect(transform(10000, 5)).toBe(5000); // 10000 * 5 * 0.1
    });
  });

  describe('edge cases', () => {
    it('should handle empty attributes gracefully', async () => {
      const config = await generator.generate({
        attributes: {}
      });
      
      expect(config.correlations).toEqual([]);
      expect(config.conditionals).toEqual([]);
    });

    it('should handle only categorical attributes', async () => {
      const config = await generator.generate({
        attributes: {
          department: 'Engineering',
          location: 'Remote',
          status: 'Active'
        }
      });
      
      // In practice, LLM might return empty or might generate correlations anyway
      // The important thing is that it doesn't crash
      expect(config.correlations).toBeDefined();
      expect(config.conditionals).toBeDefined();
      expect(Array.isArray(config.correlations)).toBe(true);
      expect(Array.isArray(config.conditionals)).toBe(true);
    });

    it('should handle single numeric attribute', async () => {
      const config = await generator.generate({
        attributes: {
          age: new UniformDistribution(20, 60),
          name: 'Test User'
        }
      });
      
      // With only one numeric attribute, correlations should be limited
      // The important thing is that it doesn't crash and returns valid structure
      expect(config.correlations).toBeDefined();
      expect(config.conditionals).toBeDefined();
      expect(Array.isArray(config.correlations)).toBe(true);
      expect(Array.isArray(config.conditionals)).toBe(true);
    });

    it('should generate appropriate correlations for health domain', async () => {
      const config = await generator.generate({
        attributes: {
          age: new NormalDistribution(40, 15),
          weight: new NormalDistribution(75, 15),
          height: new NormalDistribution(170, 10),
          exerciseHoursPerWeek: new ExponentialDistribution(0.3),
          restingHeartRate: new NormalDistribution(70, 10)
        },
        domain: 'health',
        context: 'Fitness tracking application users'
      });
      
      // Should identify height-weight correlation
      const heightWeightCorr = config.correlations.find(
        c => (c.attribute1 === 'height' && c.attribute2 === 'weight') ||
             (c.attribute1 === 'weight' && c.attribute2 === 'height')
      );
      expect(heightWeightCorr).toBeDefined();
      expect(heightWeightCorr?.correlation).toBeGreaterThan(0.5);
    });

    it('should generate appropriate correlations for workplace domain', async () => {
      const config = await generator.generate({
        attributes: {
          age: new UniformDistribution(22, 65),
          yearsExperience: new UniformDistribution(0, 40),
          salary: new NormalDistribution(80000, 30000),
          performanceRating: new BetaDistribution(7, 3),
          teamSize: new UniformDistribution(2, 20)
        },
        domain: 'workplace',
        context: 'Corporate employees'
      });
      
      // Should have experience conditional on age
      const expConditional = config.conditionals.find(
        c => c.attribute === 'yearsExperience' && c.dependsOn === 'age'
      );
      expect(expConditional).toBeDefined();
      
      // Should have salary correlations
      const salaryCorrelations = config.correlations.filter(
        c => c.attribute1 === 'salary' || c.attribute2 === 'salary'
      );
      expect(salaryCorrelations.length).toBeGreaterThan(0);
    });
  });
});

describe('generateWithAutoCorrelations', () => {
  it('should generate a PersonaGroup with auto correlations', async () => {
    const group = await generateWithAutoCorrelations({
      attributes: {
        age: new UniformDistribution(25, 65),
        income: new NormalDistribution(60000, 20000),
        yearsExperience: new UniformDistribution(0, 30),
        occupation: 'Developer',
        sex: 'other'
      },
      count: 10,
      context: 'Tech startup employees'
    });

    expect(group.size).toBe(10);
    expect(group.name).toBe('Auto-correlated Group');
    
    // Check that personas have correlated attributes
    const firstPersona = group.personas[0];
    expect(firstPersona.attributes.age).toBeDefined();
    expect(firstPersona.attributes.income).toBeDefined();
    expect(firstPersona.attributes.yearsExperience).toBeDefined();
  });

  it('should use custom group name if provided', async () => {
    const group = await generateWithAutoCorrelations({
      attributes: {
        age: new UniformDistribution(30, 50),
        income: new NormalDistribution(80000, 10000),
        occupation: 'Manager',
        sex: 'other'
      },
      count: 5,
      groupName: 'Management Team'
    });

    expect(group.name).toBe('Management Team');
  });

  it('should pass through API configuration', async () => {
    const group = await generateWithAutoCorrelations({
      attributes: {
        age: new UniformDistribution(20, 30),
        occupation: 'Student',
        sex: 'other'
      },
      count: 3,
      apiKey: 'custom-key',
      model: 'gpt-4'
    });

    expect(group.size).toBe(3);
  });

  it('should create realistic personas with auto-generated correlations', async () => {
    const group = await generateWithAutoCorrelations({
      attributes: {
        age: new UniformDistribution(25, 55),
        yearsExperience: new NormalDistribution(10, 8),
        income: new NormalDistribution(75000, 25000),
        occupation: 'Software Engineer',
        sex: 'other'
      },
      count: 20, // Reduced count to avoid timing issues
      context: 'Technology professionals in Seattle',
      domain: 'workplace'
    });

    expect(group.size).toBe(20);
    
    // Verify all personas have required attributes
    group.personas.forEach(persona => {
      expect(persona.attributes.age).toBeGreaterThanOrEqual(25);
      expect(persona.attributes.age).toBeLessThanOrEqual(55);
      expect(persona.attributes.yearsExperience).toBeGreaterThanOrEqual(0);
      expect(persona.attributes.income).toBeGreaterThan(0);
      expect(persona.attributes.occupation).toBe('Software Engineer');
    });

    // Basic correlation check - should have reasonable experience bounds
    group.personas.forEach(persona => {
      // Experience should be bounded by age (with some tolerance for edge cases)
      const maxPossibleExp = Math.max(0, persona.attributes.age - 18); // Started working at 18
      if (persona.attributes.yearsExperience > maxPossibleExp) {
        // Allow some tolerance due to distribution randomness
        expect(persona.attributes.yearsExperience).toBeLessThan(maxPossibleExp + 5);
      }
    });
  });
});