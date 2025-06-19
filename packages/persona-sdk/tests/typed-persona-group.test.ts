/**
 * Tests for TypedPersonaGroup
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TypedPersonaGroup, ExtractGroupAttributes } from '../src/groups/typed-persona-group';
import { NormalDistribution, CategoricalDistribution, UniformDistribution } from '../src/distributions';
import { SeedManager } from '../src/utils/seed-manager';
import type { GroupGenerationConfig } from '../src/types/inference';

describe('TypedPersonaGroup', () => {
  beforeEach(() => {
    SeedManager.reset();
    SeedManager.setTestSeed(12345);
  });

  describe('Type Inference', () => {
    it('should infer persona attributes correctly', async () => {
      const config: GroupGenerationConfig<{
        age: NormalDistribution;
        occupation: string;
        sex: string;
        satisfaction: UniformDistribution;
      }> = {
        size: 10,
        attributes: {
          age: new NormalDistribution(30, 5),
          occupation: 'Developer',
          sex: 'other',
          satisfaction: new UniformDistribution(1, 10)
        }
      };

      const group = await TypedPersonaGroup.create('Test Group', config);
      const personas = group.getPersonas();
      
      expect(personas).toHaveLength(10);
      
      // Type assertions - these should compile
      personas.forEach(persona => {
        const age: number = persona.attributes.age;
        const occupation: string = persona.attributes.occupation;
        const satisfaction: number = persona.attributes.satisfaction;
        
        expect(typeof age).toBe('number');
        expect(occupation).toBe('Developer');
        expect(typeof satisfaction).toBe('number');
      });
    });

    it('should handle complex attribute types', async () => {
      const config: GroupGenerationConfig<{
        demographics: {
          age: NormalDistribution;
          location: CategoricalDistribution<string>;
        };
        preferences: string[];
        score: number;
      }> = {
        size: 5,
        attributes: {
          demographics: {
            age: new NormalDistribution(35, 10),
            location: new CategoricalDistribution([
              { value: 'Urban', probability: 0.6 },
              { value: 'Rural', probability: 0.4 }
            ])
          },
          preferences: ['tech', 'music'],
          score: 85,
          sex: 'other',
          occupation: 'Professional'
        }
      };

      const group = new TypedPersonaGroup('Complex Group');
      await group.generate(config);
      
      const personas = group.getPersonas();
      expect(personas).toHaveLength(5);
      
      // Note: Complex nested structures will be sampled as-is
      personas.forEach(persona => {
        expect(persona.attributes.preferences).toEqual(['tech', 'music']);
        expect(persona.attributes.score).toBe(85);
      });
    });
  });

  describe('Segmented Generation', () => {
    it('should generate personas with segments', async () => {
      const config: GroupGenerationConfig<{
        age: NormalDistribution;
        income: NormalDistribution;
        category: string;
      }> = {
        size: 100,
        segments: [
          {
            name: 'Young Professionals',
            weight: 0.4,
            attributes: {
              age: new NormalDistribution(28, 3),
              income: new NormalDistribution(60000, 10000),
              category: 'professional',
              sex: 'other',
              occupation: 'Professional'
            }
          },
          {
            name: 'Senior Executives',
            weight: 0.6,
            attributes: {
              age: new NormalDistribution(45, 5),
              income: new NormalDistribution(120000, 20000),
              category: 'executive',
              sex: 'other',
              occupation: 'Executive'
            }
          }
        ]
      };

      const group = await TypedPersonaGroup.create('Segmented Group', config);
      
      expect(group.size).toBe(100);
      
      // Check segment distribution
      const professionals = group.filter(p => p.attributes.category === 'professional');
      const executives = group.filter(p => p.attributes.category === 'executive');
      
      expect(professionals.length).toBeCloseTo(40, 10); // Allow some variance
      expect(executives.length).toBeCloseTo(60, 10);
    });
  });

  describe('Typed Methods', () => {
    it('should provide type-safe filter method', async () => {
      const config: GroupGenerationConfig<{
        age: NormalDistribution;
        active: boolean;
        score: UniformDistribution;
      }> = {
        size: 20,
        attributes: {
          age: new NormalDistribution(30, 10),
          active: true,
          score: new UniformDistribution(0, 100),
          sex: 'other',
          occupation: 'Worker'
        }
      };

      const group = await TypedPersonaGroup.create('Filter Test', config);
      
      // Type-safe filtering
      const youngPersonas = group.filter(p => p.attributes.age < 30);
      const highScorers = group.filter(p => p.attributes.score > 50);
      
      expect(youngPersonas.length).toBeLessThan(group.size);
      expect(highScorers.length).toBeLessThan(group.size);
    });

    it('should provide type-safe map method', async () => {
      const config: GroupGenerationConfig<{
        name: string;
        value: number;
      }> = {
        size: 10,
        attributes: {
          name: 'Test',
          value: 100,
          age: 30,
          sex: 'other',
          occupation: 'Tester'
        }
      };

      const group = await TypedPersonaGroup.create('Map Test', config);
      
      // Type-safe mapping
      const values: number[] = group.map(p => p.attributes.value);
      const names: string[] = group.map(p => p.attributes.name);
      
      expect(values).toHaveLength(10);
      expect(values.every(v => v === 100)).toBe(true);
      expect(names.every(n => n === 'Test')).toBe(true);
    });

    it('should provide type-safe reduce method', async () => {
      const config: GroupGenerationConfig<{
        score: UniformDistribution;
        weight: number;
      }> = {
        size: 10,
        attributes: {
          score: new UniformDistribution(0, 100),
          weight: 1,
          age: 30,
          sex: 'other',
          occupation: 'Worker'
        }
      };

      const group = await TypedPersonaGroup.create('Reduce Test', config);
      
      // Type-safe reduction
      const totalScore = group.reduce(
        (sum, persona) => sum + persona.attributes.score,
        0
      );
      
      const totalWeight = group.reduce(
        (sum, persona) => sum + persona.attributes.weight,
        0
      );
      
      expect(totalScore).toBeGreaterThan(0);
      expect(totalWeight).toBe(10);
    });
  });

  describe('Statistics', () => {
    it('should calculate statistics for numeric attributes', async () => {
      const config: GroupGenerationConfig<{
        age: NormalDistribution;
        income: NormalDistribution;
        category: string;
      }> = {
        size: 100,
        attributes: {
          age: new NormalDistribution(35, 5),
          income: new NormalDistribution(75000, 15000),
          category: 'test',
          sex: 'other',
          occupation: 'Professional'
        }
      };

      const group = await TypedPersonaGroup.create('Stats Test', config);
      
      const ageStats = group.getStatistics('age');
      const incomeStats = group.getStatistics('income');
      
      expect(ageStats).toBeTruthy();
      expect(ageStats?.mean).toBeCloseTo(35, 1);
      expect(ageStats?.stdDev).toBeCloseTo(5, 1);
      
      expect(incomeStats).toBeTruthy();
      expect(incomeStats?.mean).toBeCloseTo(75000, 5000);
    });

    it('should get attribute distribution', async () => {
      const config: GroupGenerationConfig<{
        category: CategoricalDistribution<string>;
        level: number;
      }> = {
        size: 100,
        attributes: {
          category: new CategoricalDistribution([
            { value: 'A', probability: 0.5 },
            { value: 'B', probability: 0.3 },
            { value: 'C', probability: 0.2 }
          ]),
          level: 5,
          age: 30,
          sex: 'other',
          occupation: 'Worker'
        }
      };

      const group = await TypedPersonaGroup.create('Distribution Test', config);
      
      const categoryDist = group.getAttributeDistribution('category');
      const levelDist = group.getAttributeDistribution('level');
      
      // Check category distribution roughly matches probabilities
      expect(categoryDist.get('A')).toBeCloseTo(50, 15);
      expect(categoryDist.get('B')).toBeCloseTo(30, 15);
      expect(categoryDist.get('C')).toBeCloseTo(20, 15);
      
      // Check level distribution
      expect(levelDist.get(5)).toBe(100);
    });
  });

  describe('Query Keys', () => {
    it('should create TanStack-style query keys', () => {
      const group = new TypedPersonaGroup('Query Test');
      
      const key1 = group.createQueryKey();
      const key2 = group.createQueryKey('filter', { age: 30 });
      const key3 = group.createQueryKey('stats', 'age');
      
      expect(key1[0]).toBe('personaGroup');
      expect(key1[1]).toBe(group.getId());
      
      expect(key2).toEqual(['personaGroup', group.getId(), 'filter', { age: 30 }]);
      expect(key3).toEqual(['personaGroup', group.getId(), 'stats', 'age']);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON with type preservation', async () => {
      const config: GroupGenerationConfig<{
        id: number;
        name: string;
        active: boolean;
      }> = {
        size: 3,
        attributes: {
          id: 1,
          name: 'Test User',
          active: true,
          age: 30,
          sex: 'other',
          occupation: 'User'
        }
      };

      const group = await TypedPersonaGroup.create('JSON Test', config);
      const json = group.toJSON();
      
      expect(json.name).toBe('JSON Test');
      expect(json.personas).toHaveLength(3);
      expect(json.config).toEqual(config);
      
      json.personas.forEach(p => {
        expect(p.attributes.id).toBe(1);
        expect(p.attributes.name).toBe('Test User');
        expect(p.attributes.active).toBe(true);
      });
    });
  });
});