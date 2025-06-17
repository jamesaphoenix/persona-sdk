import { describe, it, expect, vi } from 'vitest';
import { PersonaGroup } from '../src/persona-group';
import { Persona } from '../src/persona';
import { NormalDistribution, UniformDistribution, CategoricalDistribution } from '../src/distributions';

// Helper to create a valid persona
const createPersona = (name: string, customAttrs: any = {}) => {
  return new Persona(name, {
    age: 30,
    occupation: 'Employee',
    sex: 'other' as const,
    ...customAttrs
  });
};

describe('PersonaGroup', () => {
  describe('creation', () => {
    it('should create an empty persona group', () => {
      const group = new PersonaGroup('Test Group');
      expect(group.name).toBe('Test Group');
      expect(group.size).toBe(0);
      expect(group.personas).toEqual([]);
    });

    it('should create a group with initial personas', () => {
      const personas = [
        new Persona('Alice', { age: 25, occupation: 'Developer', sex: 'female' }),
        new Persona('Bob', { age: 30, occupation: 'Manager', sex: 'male' })
      ];
      const group = new PersonaGroup('Initial Group', personas);
      expect(group.size).toBe(2);
      expect(group.personas).toHaveLength(2);
    });

    it('should respect maxSize option', () => {
      const group = new PersonaGroup('Limited Group', [], { maxSize: 2 });
      group.add(new Persona('Person 1', { age: 25, occupation: 'Dev', sex: 'male' }));
      group.add(new Persona('Person 2', { age: 30, occupation: 'Dev', sex: 'female' }));
      
      expect(() => group.add(new Persona('Person 3', { age: 35, occupation: 'Dev', sex: 'other' })))
        .toThrow('Group has reached maximum size');
    });
  });

  describe('persona management', () => {
    it('should add personas to the group', () => {
      const group = new PersonaGroup('Test');
      const persona = createPersona('John', { role: 'admin' });
      
      group.add(persona);
      
      expect(group.size).toBe(1);
      expect(group.personas[0]).toBe(persona);
    });

    it('should remove personas by id', () => {
      const group = new PersonaGroup('Test');
      const p1 = createPersona('Alice');
      const p2 = createPersona('Bob');
      
      group.add(p1);
      group.add(p2);
      group.remove(p1.id);
      
      expect(group.size).toBe(1);
      expect(group.personas[0]).toBe(p2);
    });

    it('should find personas by id', () => {
      const group = new PersonaGroup('Test');
      const persona = createPersona('Target', { level: 5 });
      
      group.add(persona);
      const found = group.find(persona.id);
      
      expect(found).toBe(persona);
    });

    it('should filter personas by attributes', () => {
      const group = new PersonaGroup('Test');
      group.add(createPersona('Young', { age: 20 }));
      group.add(createPersona('Middle', { age: 35 }));
      group.add(createPersona('Senior', { age: 65 }));
      
      const filtered = group.filter(p => (p.attributes.age as number) > 30);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe('Middle');
      expect(filtered[1].name).toBe('Senior');
    });

    it('should clear all personas', () => {
      const group = new PersonaGroup('Test');
      group.add(createPersona('One'));
      group.add(createPersona('Two'));
      
      group.clear();
      
      expect(group.size).toBe(0);
      expect(group.personas).toEqual([]);
    });
  });

  describe('generation from distributions', () => {
    it('should generate personas from distributions', () => {
      const group = new PersonaGroup('Generated');
      const distributions = {
        age: new NormalDistribution(30, 5),
        occupation: 'Developer',
        sex: new CategoricalDistribution([
          { value: 'male' as const, probability: 0.5 },
          { value: 'female' as const, probability: 0.5 }
        ]),
        income: new UniformDistribution(30000, 80000)
      };
      
      group.generateFromDistributions(10, distributions);
      
      expect(group.size).toBe(10);
      group.personas.forEach(persona => {
        expect(persona.attributes.age).toBeTypeOf('number');
        expect(persona.attributes.occupation).toBe('Developer');
        expect(['male', 'female']).toContain(persona.attributes.sex);
        expect(persona.attributes.income).toBeTypeOf('number');
      });
    });

    it('should use default distributions when set', () => {
      const defaultDistributions = {
        age: new UniformDistribution(25, 35),
        occupation: 'Tester',
        sex: 'other' as const,
        score: new UniformDistribution(0, 100)
      };
      const group = new PersonaGroup('Default', [], { defaultDistributions });
      
      group.generateFromDistributions(5);
      
      expect(group.size).toBe(5);
      group.personas.forEach(persona => {
        expect(persona.attributes.score).toBeDefined();
        expect(persona.attributes.score).toBeTypeOf('number');
      });
    });

    it('should throw error if no distributions provided', () => {
      const group = new PersonaGroup('NoDefaults');
      
      expect(() => group.generateFromDistributions(5))
        .toThrow('No distributions provided and no default distributions set');
    });
  });

  describe('structured output generation', () => {
    it('should generate structured output with AI', async () => {
      const group = new PersonaGroup('Test');
      group.add(new Persona('Tech Enthusiast', { age: 25, occupation: 'Developer', sex: 'male', interests: ['coding', 'AI'] }));
      group.add(new Persona('Designer', { age: 30, occupation: 'UX Designer', sex: 'female', interests: ['UX', 'art'] }));
      
      // Mock the AI call
      const mockOutput = {
        data: {
          summary: 'Young professionals interested in technology and design',
          averageAge: 27.5,
          commonInterests: ['technology', 'creativity']
        },
        metadata: {
          distribution: 'normal',
          model: 'gpt-4',
          timestamp: new Date()
        }
      };
      
      // This would normally call the AI service
      // For now, we'll test the interface
      const schema = {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          averageAge: { type: 'number' },
          commonInterests: { type: 'array', items: { type: 'string' } }
        }
      };
      
      // The actual implementation will use OpenAI
      // expect(output).toMatchObject(mockOutput);
    });
  });

  describe('statistics', () => {
    it('should calculate basic statistics', () => {
      const group = new PersonaGroup('Stats');
      group.add(createPersona('P1', { age: 20, score: 80 }));
      group.add(createPersona('P2', { age: 30, score: 90 }));
      group.add(createPersona('P3', { age: 40, score: 85 }));
      
      const stats = group.getStatistics('age');
      
      expect(stats.mean).toBe(30);
      expect(stats.min).toBe(20);
      expect(stats.max).toBe(40);
      expect(stats.count).toBe(3);
    });

    it('should handle non-numeric attributes gracefully', () => {
      const group = new PersonaGroup('Mixed');
      group.add(createPersona('P1', { name: 'Alice' }));
      
      const stats = group.getStatistics('name');
      
      expect(stats.count).toBe(1);
      expect(stats.mean).toBeUndefined();
    });
  });

  describe('serialization', () => {
    it('should convert to object', () => {
      const group = new PersonaGroup('Export');
      group.add(createPersona('Alice', { role: 'user' }));
      
      const obj = group.toObject();
      
      expect(obj.name).toBe('Export');
      expect(obj.personas).toHaveLength(1);
      expect(obj.personas[0].name).toBe('Alice');
    });

    it('should serialize to JSON', () => {
      const group = new PersonaGroup('JSON');
      group.add(createPersona('Test', { id: 123 }));
      
      const json = group.toJSON();
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('JSON');
      expect(parsed.personas[0].attributes.id).toBe(123);
    });

    it('should get summary', () => {
      const group = new PersonaGroup('Summary Test');
      group.add(createPersona('P1', { age: 25, city: 'NYC' }));
      group.add(createPersona('P2', { age: 30, city: 'NYC' }));
      group.add(createPersona('P3', { age: 35, city: 'LA' }));
      
      const summary = group.getSummary();
      
      expect(summary.name).toBe('Summary Test');
      expect(summary.size).toBe(3);
      expect(summary.attributeKeys).toContain('age');
      expect(summary.attributeKeys).toContain('city');
      expect(summary.commonAttributes.city).toBe('NYC'); // Most common value
    });
  });
});