/**
 * Tests for TypedPersonaBuilder
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TypedPersonaBuilder, ExtractAttributes, ExtractPersona } from '../src/builders/typed-persona-builder';
import { NormalDistribution, CategoricalDistribution } from '../src/distributions';
import { SeedManager } from '../src/utils/seed-manager';

describe('TypedPersonaBuilder', () => {
  beforeEach(() => {
    SeedManager.reset();
    SeedManager.setTestSeed(12345);
  });

  describe('Type Inference', () => {
    it('should infer types correctly when adding attributes', () => {
      const builder = TypedPersonaBuilder.create()
        .withName('Test Person')
        .withAge(30)
        .withOccupation('Developer')
        .withSex('male')
        .withAttribute('customField', 'custom value')
        .withAttribute('score', 95);

      const persona = builder.build();
      
      // Type assertions - these should compile
      const age: number = persona.attributes.age;
      const occupation: string = persona.attributes.occupation;
      const sex: 'male' | 'female' | 'other' = persona.attributes.sex;
      const customField: string = persona.attributes.customField;
      const score: number = persona.attributes.score;

      expect(age).toBe(30);
      expect(occupation).toBe('Developer');
      expect(sex).toBe('male');
      expect(customField).toBe('custom value');
      expect(score).toBe(95);
    });

    it('should maintain type safety through method chaining', () => {
      const builder1 = TypedPersonaBuilder.create();
      const builder2 = builder1.withAge(25);
      const builder3 = builder2.withOccupation('Designer');
      const builder4 = builder3.withSex('female');
      
      // Each builder should have the correct type
      type Attrs1 = ExtractAttributes<typeof builder1>; // {}
      type Attrs2 = ExtractAttributes<typeof builder2>; // { age: number }
      type Attrs3 = ExtractAttributes<typeof builder3>; // { age: number, occupation: string }
      type Attrs4 = ExtractAttributes<typeof builder4>; // { age: number, occupation: string, sex: 'male' | 'female' | 'other' }
      
      const persona = builder4.build();
      expect(persona.attributes.age).toBe(25);
      expect(persona.attributes.occupation).toBe('Designer');
      expect(persona.attributes.sex).toBe('female');
    });
  });

  describe('Distribution Support', () => {
    it('should sample from distributions when building', () => {
      const builder = TypedPersonaBuilder.create()
        .withName('Random Person')
        .withAge(new NormalDistribution(30, 5))
        .withOccupation(new CategoricalDistribution([
          { value: 'Developer', probability: 0.6 },
          { value: 'Designer', probability: 0.4 }
        ]))
        .withSex('other');

      const persona = builder.build();
      
      // Age should be sampled from normal distribution
      expect(typeof persona.attributes.age).toBe('number');
      expect(persona.attributes.age).toBeGreaterThan(0);
      
      // Occupation should be one of the categorical values
      expect(['Developer', 'Designer']).toContain(persona.attributes.occupation);
    });

    it('should handle mixed static and distribution values', () => {
      const builder = TypedPersonaBuilder.create()
        .withAttributes({
          age: 35, // static
          occupation: 'Manager',
          sex: 'other',
          income: new NormalDistribution(50000, 10000), // distribution
          city: 'New York', // static
          satisfaction: new NormalDistribution(7, 2) // distribution
        });

      const persona = builder.build();
      
      expect(persona.attributes.age).toBe(35);
      expect(persona.attributes.city).toBe('New York');
      expect(typeof persona.attributes.income).toBe('number');
      expect(typeof persona.attributes.satisfaction).toBe('number');
    });
  });

  describe('Multiple Personas', () => {
    it('should build multiple personas with unique values', () => {
      const builder = TypedPersonaBuilder.create()
        .withName('Test')
        .withAge(new NormalDistribution(30, 5))
        .withOccupation('Engineer')
        .withSex('other');

      const personas = builder.buildMany(10);
      
      expect(personas).toHaveLength(10);
      
      // Check that ages vary (due to distribution)
      const ages = personas.map(p => p.attributes.age);
      const uniqueAges = new Set(ages);
      expect(uniqueAges.size).toBeGreaterThan(1);
      
      // Check that static values are consistent
      personas.forEach(p => {
        expect(p.attributes.occupation).toBe('Engineer');
        expect(p.attributes.sex).toBe('other');
      });
    });
  });

  describe('Builder State', () => {
    it('should expose current state for debugging', () => {
      const builder = TypedPersonaBuilder.create()
        .withName('Debug Test')
        .withAge(25)
        .withOccupation('Analyst');

      const state = builder.getState();
      
      expect(state.name).toBe('Debug Test');
      expect(state.attributes).toEqual({
        age: 25,
        occupation: 'Analyst'
      });
    });

    it('should create immutable builders', () => {
      const builder1 = TypedPersonaBuilder.create().withAge(25);
      const builder2 = builder1.withOccupation('Manager');
      
      const state1 = builder1.getState();
      const state2 = builder2.getState();
      
      // builder1 should not be affected by builder2
      expect(state1.attributes).toEqual({ age: 25 });
      expect(state2.attributes).toEqual({ age: 25, occupation: 'Manager' });
    });
  });

  describe('Type-Safe Methods', () => {
    it('should enforce correct types for built-in methods', () => {
      const builder = TypedPersonaBuilder.create()
        .withAge(30)
        .withSex('female')
        .withOccupation('Doctor')
        .withIncome(75000);

      const persona = builder.build();
      
      expect(persona.attributes.age).toBe(30);
      expect(persona.attributes.sex).toBe('female');
      expect(persona.attributes.occupation).toBe('Doctor');
      expect(persona.attributes.income).toBe(75000);
    });

    it('should handle distribution types in built-in methods', () => {
      const ageDistribution = new NormalDistribution(35, 5);
      const incomeDistribution = new NormalDistribution(60000, 15000);
      
      const builder = TypedPersonaBuilder.create()
        .withAge(ageDistribution)
        .withIncome(incomeDistribution)
        .withSex('other')
        .withOccupation('Consultant');

      const persona = builder.build();
      
      expect(typeof persona.attributes.age).toBe('number');
      expect(typeof persona.attributes.income).toBe('number');
      expect(persona.attributes.sex).toBe('other');
      expect(persona.attributes.occupation).toBe('Consultant');
    });
  });
});