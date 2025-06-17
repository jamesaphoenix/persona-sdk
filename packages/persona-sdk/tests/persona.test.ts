import { describe, it, expect } from 'vitest';
import { Persona } from '../src/persona';
import { NormalDistribution, UniformDistribution } from '../src/distributions';

describe('Persona', () => {
  describe('creation', () => {
    it('should create a persona with required fields', () => {
      const persona = new Persona('John Doe', {
        age: 35,
        occupation: 'Software Engineer',
        sex: 'male'
      });
      expect(persona.name).toBe('John Doe');
      expect(persona.id).toBeDefined();
      expect(persona.attributes.age).toBe(35);
      expect(persona.attributes.occupation).toBe('Software Engineer');
      expect(persona.attributes.sex).toBe('male');
    });

    it('should create a persona with required and custom attributes', () => {
      const persona = new Persona('Jane Doe', {
        age: 30,
        occupation: 'Designer',
        sex: 'female',
        income: 50000,
        interests: ['reading', 'hiking']
      });
      expect(persona.name).toBe('Jane Doe');
      expect(persona.attributes.age).toBe(30);
      expect(persona.attributes.occupation).toBe('Designer');
      expect(persona.attributes.sex).toBe('female');
      expect(persona.attributes.income).toBe(50000);
      expect(persona.attributes.interests).toEqual(['reading', 'hiking']);
    });

    it('should throw error when missing required fields', () => {
      expect(() => new Persona('Test', {} as any)).toThrow('Age is required');
      expect(() => new Persona('Test', { age: 25 } as any)).toThrow('Occupation is required');
      expect(() => new Persona('Test', { age: 25, occupation: 'Dev' } as any)).toThrow('Sex is required');
    });

    it('should validate sex field values', () => {
      expect(() => new Persona('Test', {
        age: 25,
        occupation: 'Dev',
        sex: 'invalid' as any
      })).toThrow('Sex is required and must be "male", "female", or "other"');
    });
  });

  describe('fromDistributions', () => {
    it('should generate a persona from distributions with required fields', () => {
      const distributions = {
        age: new NormalDistribution(35, 5),
        occupation: 'Software Engineer',
        sex: 'male' as const,
        income: new NormalDistribution(75000, 15000)
      };
      
      const persona = Persona.fromDistributions('Generated Person', distributions);
      
      expect(persona.name).toBe('Generated Person');
      expect(persona.attributes.age).toBeTypeOf('number');
      expect(persona.attributes.occupation).toBe('Software Engineer');
      expect(persona.attributes.sex).toBe('male');
      expect(persona.attributes.income).toBeTypeOf('number');
      // Values should be within reasonable range (3 standard deviations)
      expect(persona.attributes.age).toBeGreaterThan(20);
      expect(persona.attributes.age).toBeLessThan(50);
      expect(persona.attributes.income).toBeGreaterThan(30000);
      expect(persona.attributes.income).toBeLessThan(120000);
    });

    it('should throw error if required fields are missing', () => {
      const distributions = {
        age: new NormalDistribution(35, 5),
        // Missing occupation and sex
        income: new NormalDistribution(75000, 15000)
      };
      
      expect(() => Persona.fromDistributions('Test', distributions as any))
        .toThrow('Required field "occupation" missing from distributions');
    });

    it('should generate a persona from uniform distributions', () => {
      const distributions = {
        age: new UniformDistribution(20, 40),
        occupation: 'Analyst',
        sex: 'female' as const,
        score: new UniformDistribution(0, 100),
        rating: new UniformDistribution(1, 5)
      };
      
      const persona = Persona.fromDistributions('Test User', distributions);
      
      expect(persona.attributes.age).toBeGreaterThanOrEqual(20);
      expect(persona.attributes.age).toBeLessThanOrEqual(40);
      expect(persona.attributes.score).toBeGreaterThanOrEqual(0);
      expect(persona.attributes.score).toBeLessThanOrEqual(100);
      expect(persona.attributes.rating).toBeGreaterThanOrEqual(1);
      expect(persona.attributes.rating).toBeLessThanOrEqual(5);
    });

    it('should support mixed distributions and static values', () => {
      const distributions = {
        age: new NormalDistribution(30, 5),
        occupation: 'Manager',
        sex: 'other' as const,
        category: 'premium',
        active: true
      };
      
      const persona = Persona.fromDistributions('Mixed User', distributions);
      
      expect(persona.attributes.age).toBeTypeOf('number');
      expect(persona.attributes.occupation).toBe('Manager');
      expect(persona.attributes.sex).toBe('other');
      expect(persona.attributes.category).toBe('premium');
      expect(persona.attributes.active).toBe(true);
    });
  });

  describe('methods', () => {
    it('should clone a persona', () => {
      const original = new Persona('Original', { 
        age: 25, 
        occupation: 'Developer',
        sex: 'male' as const,
        city: 'New York' 
      });
      const clone = original.clone();
      
      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe(original.name);
      expect(clone.attributes).toEqual(original.attributes);
      
      // Ensure deep clone
      clone.updateAttributes({ age: 30 });
      expect(original.attributes.age).toBe(25);
    });

    it('should update attributes', () => {
      const persona = new Persona('Test', { 
        age: 25,
        occupation: 'Engineer',
        sex: 'female' as const
      });
      
      persona.updateAttributes({ age: 26, city: 'Boston' });
      
      expect(persona.attributes.age).toBe(26);
      expect(persona.attributes.city).toBe('Boston');
    });

    it('should convert to plain object', () => {
      const persona = new Persona('Test User', { 
        age: 30, 
        occupation: 'Designer',
        sex: 'other' as const,
        premium: true 
      });
      const obj = persona.toObject();
      
      expect(obj).toEqual({
        id: persona.id,
        name: 'Test User',
        attributes: {
          age: 30,
          occupation: 'Designer',
          sex: 'other',
          premium: true
        }
      });
    });

    it('should serialize to JSON', () => {
      const persona = new Persona('JSON Test', { 
        age: 28,
        occupation: 'Analyst',
        sex: 'male' as const,
        level: 5 
      });
      const json = persona.toJSON();
      
      expect(json).toBe(JSON.stringify({
        id: persona.id,
        name: 'JSON Test',
        attributes: { 
          age: 28,
          occupation: 'Analyst',
          sex: 'male',
          level: 5 
        }
      }));
    });

    it('should get summary', () => {
      const persona = new Persona('John Doe', {
        age: 35,
        occupation: 'Software Engineer',
        sex: 'male' as const
      });
      
      const summary = persona.getSummary();
      expect(summary).toBe('John Doe (35 year old male Software Engineer)');
    });
  });
});