import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntelligentPersonaFactory, TraitDefinition } from '../src/tools/intelligent-persona-factory';
import { PersonaGroup } from '../src';

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockImplementation(async (params) => {
          // Return intelligent analysis based on the prompt
          const traits = params.messages[1].content.includes('age') ? 
            mockAgeRelatedAnalysis() : mockGeneralAnalysis();
          
          return {
            choices: [{
              message: {
                function_call: {
                  arguments: JSON.stringify(traits)
                }
              }
            }]
          };
        })
      }
    }
  }))
}));

function mockAgeRelatedAnalysis() {
  return {
    distributions: [
      {
        trait: 'age',
        distributionType: 'normal',
        parameters: { mean: 35, stdDev: 10 },
        reasoning: 'Normal distribution for age'
      },
      {
        trait: 'income',
        distributionType: 'normal',
        parameters: { mean: 75000, stdDev: 25000 },
        reasoning: 'Income varies with experience'
      },
      {
        trait: 'fitnessLevel',
        distributionType: 'beta',
        parameters: { alpha: 3, beta: 2 },
        reasoning: 'Skewed toward higher fitness'
      }
    ],
    correlations: [
      {
        trait1: 'age',
        trait2: 'income',
        correlation: 0.6,
        reasoning: 'Income increases with age'
      }
    ],
    dependencies: [
      {
        dependent: 'income',
        independent: 'age',
        relationshipType: 'age_income',
        reasoning: 'Income peaks at middle age'
      },
      {
        dependent: 'fitnessLevel',
        independent: 'age',
        relationshipType: 'fitness_age',
        reasoning: 'Fitness declines with age'
      }
    ],
    validationRules: [
      {
        description: 'Age must be reasonable',
        rule: 'persona.age >= 18 && persona.age <= 100'
      }
    ],
    warnings: []
  };
}

function mockGeneralAnalysis() {
  return {
    distributions: [
      {
        trait: 'score',
        distributionType: 'uniform',
        parameters: { min: 0, max: 100 },
        reasoning: 'Uniform distribution for scores'
      }
    ],
    correlations: [],
    dependencies: [],
    validationRules: [],
    warnings: []
  };
}

describe('IntelligentPersonaFactory', () => {
  let factory: IntelligentPersonaFactory;

  beforeEach(() => {
    factory = new IntelligentPersonaFactory('test-api-key');
  });

  describe('generatePersonas', () => {
    it('should generate personas with automatic correlations', async () => {
      const result = await factory.generatePersonas({
        traits: [
          { name: 'age', dataType: 'numeric' },
          { name: 'income', dataType: 'numeric' },
          { name: 'fitnessLevel', dataType: 'numeric' }
        ],
        context: 'General population',
        count: 10
      });

      expect(result).toBeInstanceOf(PersonaGroup);
      expect(result.size).toBe(10);
      
      // Check that personas have expected attributes
      const firstPersona = result.personas[0];
      expect(firstPersona.attributes).toHaveProperty('age');
      expect(firstPersona.attributes).toHaveProperty('income');
      expect(firstPersona.attributes).toHaveProperty('fitnessLevel');
    });

    it('should handle mixed trait types', async () => {
      const traits: TraitDefinition[] = [
        { name: 'age', dataType: 'numeric' },
        { name: 'employed', dataType: 'boolean' },
        { name: 'department', dataType: 'categorical', constraints: { values: ['IT', 'HR', 'Sales'] } },
        { name: 'bio', dataType: 'text' }
      ];

      const result = await factory.generatePersonas({
        traits,
        context: 'Company employees',
        count: 5
      });

      expect(result.size).toBe(5);
    });

    it('should apply constraints to traits', async () => {
      const result = await factory.generatePersonas({
        traits: [
          { 
            name: 'rating', 
            dataType: 'numeric', 
            constraints: { min: 1, max: 5 } 
          }
        ],
        context: 'Product reviews',
        count: 20
      });

      // All ratings should be within constraints
      result.personas.forEach(persona => {
        if (typeof persona.attributes.rating === 'number') {
          expect(persona.attributes.rating).toBeGreaterThanOrEqual(1);
          expect(persona.attributes.rating).toBeLessThanOrEqual(5);
        }
      });
    });

    it('should respect custom rules', async () => {
      const result = await factory.generatePersonas({
        traits: [
          { name: 'age', dataType: 'numeric' },
          { name: 'techSavvy', dataType: 'numeric', constraints: { min: 1, max: 10 } }
        ],
        context: 'General users',
        count: 10,
        customRules: ['Younger people are more tech savvy']
      });

      expect(result.size).toBe(10);
      // The mock would need to implement this logic
    });

    it('should validate generated personas', async () => {
      const result = await factory.generatePersonas({
        traits: [
          { name: 'age', dataType: 'numeric' },
          { name: 'income', dataType: 'numeric' }
        ],
        context: 'Adults',
        count: 10,
        ensureRealism: true
      });

      // All personas should pass validation (age >= 18)
      result.personas.forEach(persona => {
        expect(persona.attributes.age).toBeGreaterThanOrEqual(18);
      });
    });

    it('should handle empty trait list gracefully', async () => {
      const result = await factory.generatePersonas({
        traits: [],
        context: 'Empty test',
        count: 5
      });

      expect(result.size).toBe(5);
    });

    it('should generate diverse personas', async () => {
      const result = await factory.generatePersonas({
        traits: [
          { name: 'age', dataType: 'numeric' },
          { name: 'income', dataType: 'numeric' }
        ],
        context: 'Diverse population',
        count: 50
      });

      // Check for diversity in generated values
      const ages = result.personas.map(p => p.attributes.age);
      const uniqueAges = new Set(ages);
      
      // Should have reasonable diversity
      expect(uniqueAges.size).toBeGreaterThan(10);
    });
  });

  describe('Performance', () => {
    it('should handle large-scale generation efficiently', async () => {
      const start = Date.now();
      
      const result = await factory.generatePersonas({
        traits: [
          { name: 'id', dataType: 'numeric' },
          { name: 'score', dataType: 'numeric' }
        ],
        context: 'Performance test',
        count: 100
      });

      const duration = Date.now() - start;
      
      expect(result.size).toBe(100);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      const errorFactory = new IntelligentPersonaFactory('invalid-key');
      
      // Override the OpenAI mock for this test
      vi.mocked(errorFactory['openai'].chat.completions.create)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(
        errorFactory.generatePersonas({
          traits: [{ name: 'test', dataType: 'numeric' }],
          context: 'Error test',
          count: 1
        })
      ).rejects.toThrow();
    });
  });
});

describe('createRealisticPersonas helper', () => {
  it('should work with string trait names', async () => {
    const { createRealisticPersonas } = await import('../src/tools/intelligent-persona-factory');
    
    const result = await createRealisticPersonas(
      ['age', 'income', 'happiness'],
      'Test population',
      10
    );

    expect(result).toBeInstanceOf(PersonaGroup);
    expect(result.size).toBe(10);
  });

  it('should work with mixed trait definitions', async () => {
    const { createRealisticPersonas } = await import('../src/tools/intelligent-persona-factory');
    
    const result = await createRealisticPersonas(
      [
        'age',
        { name: 'income', dataType: 'numeric', constraints: { min: 0 } },
        'location'
      ],
      'Mixed traits test',
      5
    );

    expect(result).toBeInstanceOf(PersonaGroup);
    expect(result.size).toBe(5);
  });
});