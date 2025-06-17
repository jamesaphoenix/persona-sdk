import { describe, it, expect } from 'vitest';
import { PersonaBuilder } from '../src/persona-builder';
import { NormalDistribution, UniformDistribution, CategoricalDistribution } from '../src/distributions';

describe('PersonaBuilder', () => {
  describe('basic building', () => {
    it('should build a persona with required fields', () => {
      const persona = PersonaBuilder.create()
        .withName('John Doe')
        .withAge(35)
        .withOccupation('Engineer')
        .withSex('male')
        .build();

      expect(persona.name).toBe('John Doe');
      expect(persona.attributes.age).toBe(35);
      expect(persona.attributes.occupation).toBe('Engineer');
      expect(persona.attributes.sex).toBe('male');
    });

    it('should throw error if name is missing', () => {
      const builder = PersonaBuilder.create()
        .withAge(25)
        .withOccupation('Designer')
        .withSex('female');

      expect(() => builder.build()).toThrow('Persona name is required');
    });

    it('should throw error if required fields are missing', () => {
      const builder = PersonaBuilder.create()
        .withName('Test');

      expect(() => builder.build()).toThrow('Required attributes (age, occupation, sex) must be provided');
    });
  });

  describe('custom attributes', () => {
    it('should add single custom attribute', () => {
      const persona = PersonaBuilder.create()
        .withName('Jane')
        .withAge(28)
        .withOccupation('Manager')
        .withSex('female')
        .withAttribute('salary', 85000)
        .withAttribute('department', 'Sales')
        .build();

      expect(persona.attributes.salary).toBe(85000);
      expect(persona.attributes.department).toBe('Sales');
    });

    it('should add multiple custom attributes', () => {
      const persona = PersonaBuilder.create()
        .withName('Bob')
        .withAge(40)
        .withOccupation('CEO')
        .withSex('male')
        .withAttributes({
          salary: 150000,
          yearsExperience: 15,
          skills: ['leadership', 'strategy'],
          remote: true
        })
        .build();

      expect(persona.attributes.salary).toBe(150000);
      expect(persona.attributes.yearsExperience).toBe(15);
      expect(persona.attributes.skills).toEqual(['leadership', 'strategy']);
      expect(persona.attributes.remote).toBe(true);
    });
  });

  describe('distributions', () => {
    it('should build persona from distributions', () => {
      const persona = PersonaBuilder.create()
        .withName('Random Person')
        .withAge(new NormalDistribution(30, 5))
        .withOccupation(new CategoricalDistribution([
          { value: 'Developer', probability: 0.6 },
          { value: 'Designer', probability: 0.4 }
        ]))
        .withSex('other')
        .build();

      expect(persona.name).toBe('Random Person');
      expect(persona.attributes.age).toBeTypeOf('number');
      expect(persona.attributes.age).toBeGreaterThan(15); // Within reasonable range
      expect(persona.attributes.age).toBeLessThan(45);
      expect(['Developer', 'Designer']).toContain(persona.attributes.occupation);
      expect(persona.attributes.sex).toBe('other');
    });

    it('should mix static values and distributions', () => {
      const persona = PersonaBuilder.create()
        .withName('Mixed')
        .withAge(35) // Static
        .withOccupation('Analyst') // Static
        .withSex(new CategoricalDistribution([
          { value: 'male' as const, probability: 0.5 },
          { value: 'female' as const, probability: 0.5 }
        ]))
        .withAttribute('score', new UniformDistribution(0, 100))
        .build();

      expect(persona.attributes.age).toBe(35);
      expect(persona.attributes.occupation).toBe('Analyst');
      expect(['male', 'female']).toContain(persona.attributes.sex);
      expect(persona.attributes.score).toBeGreaterThanOrEqual(0);
      expect(persona.attributes.score).toBeLessThanOrEqual(100);
    });
  });

  describe('buildMany', () => {
    it('should build multiple personas', () => {
      const personas = PersonaBuilder.create()
        .withAge(new UniformDistribution(25, 35))
        .withOccupation('Employee')
        .withSex('other')
        .buildMany(5, 'Person');

      expect(personas).toHaveLength(5);
      personas.forEach((persona, i) => {
        expect(persona.name).toBe(`Person ${i + 1}`);
        expect(persona.attributes.age).toBeGreaterThanOrEqual(25);
        expect(persona.attributes.age).toBeLessThanOrEqual(35);
        expect(persona.attributes.occupation).toBe('Employee');
      });
    });

    it('should use base name if no pattern provided', () => {
      const personas = PersonaBuilder.create()
        .withName('Base')
        .withAge(30)
        .withOccupation('Worker')
        .withSex('male')
        .buildMany(3);

      expect(personas[0].name).toBe('Base 1');
      expect(personas[1].name).toBe('Base 2');
      expect(personas[2].name).toBe('Base 3');
    });
  });

  describe('chaining', () => {
    it('should support fluent chaining', () => {
      const persona = PersonaBuilder
        .create()
        .withName('Fluent User')
        .withAge(new NormalDistribution(28, 3))
        .withOccupation('Developer')
        .withSex('female')
        .withAttribute('level', 'senior')
        .withAttribute('teamSize', 5)
        .withAttributes({
          location: 'Remote',
          timezone: 'EST'
        })
        .build();

      expect(persona.name).toBe('Fluent User');
      expect(persona.attributes.level).toBe('senior');
      expect(persona.attributes.teamSize).toBe(5);
      expect(persona.attributes.location).toBe('Remote');
      expect(persona.attributes.timezone).toBe('EST');
    });
  });
});