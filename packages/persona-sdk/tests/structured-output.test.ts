import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { Persona } from '../src/persona';
import { PersonaGroup } from '../src/persona-group';
import { mockLangChain } from './mocks/langchain';

// Mock LangChain before imports
mockLangChain();

describe('Structured Output Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a mock API key
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('PersonaGroup.generateStructuredOutput', () => {
    it('should generate structured output with default model', async () => {
      const group = new PersonaGroup('Test Group');
      group.add(new Persona('Alice', { age: 25, occupation: 'Developer', sex: 'female' }));
      group.add(new Persona('Bob', { age: 30, occupation: 'Designer', sex: 'male' }));

      const TestSchema = z.object({
        summary: z.string(),
        averageAge: z.number(),
        recommendations: z.array(z.string())
      });

      const result = await group.generateStructuredOutput(TestSchema, 'Test prompt');

      expect(result.data).toBeDefined();
      expect(result.data.summary).toBe('Mock string value');
      expect(result.data.averageAge).toBe(42);
      expect(result.data.recommendations).toEqual(['item1', 'item2', 'item3']);
      expect(result.metadata.model).toBe('gpt-4.1-mini');
    });

    it('should use custom model and temperature', async () => {
      const group = new PersonaGroup('Test Group');
      group.add(new Persona('Test', { age: 25, occupation: 'Dev', sex: 'other' }));

      const TestSchema = z.object({
        result: z.string()
      });

      const result = await group.generateStructuredOutput(
        TestSchema, 
        'Test prompt',
        { 
          modelName: 'gpt-4o-mini',
          temperature: 0.9
        }
      );

      expect(result.metadata.model).toBe('gpt-4.1-mini');
    });

    it('should include focus group system prompt', async () => {
      const group = new PersonaGroup('Focus Group');
      const persona1 = new Persona('Alice', { age: 25, occupation: 'Developer', sex: 'female' });
      const persona2 = new Persona('Bob', { age: 30, occupation: 'Designer', sex: 'male' });
      
      group.add(persona1);
      group.add(persona2);

      const TestSchema = z.object({
        insights: z.string()
      });

      const result = await group.generateStructuredOutput(TestSchema);

      expect(result.metadata.systemPrompt).toContain('You are acting as a focus group');
      expect(result.metadata.systemPrompt).toContain('Alice');
      expect(result.metadata.systemPrompt).toContain('Bob');
      expect(result.metadata.systemPrompt).toContain('25 year old female Developer');
      expect(result.metadata.systemPrompt).toContain('30 year old male Designer');
    });

    it('should use custom system prompt when provided', async () => {
      const group = new PersonaGroup('Test');
      group.add(new Persona('Test', { age: 25, occupation: 'Dev', sex: 'other' }));

      const TestSchema = z.object({
        result: z.string()
      });

      const customPrompt = 'You are a custom AI assistant.';
      const result = await group.generateStructuredOutput(
        TestSchema,
        'Test',
        { systemPrompt: customPrompt }
      );

      expect(result.metadata.systemPrompt).toBe(customPrompt);
    });
  });

  describe('Persona.generateStructuredOutput', () => {
    it('should generate output from individual persona perspective', async () => {
      const persona = new Persona('John Doe', {
        age: 35,
        occupation: 'Software Engineer',
        sex: 'male',
        interests: ['coding', 'gaming']
      });

      const OpinionSchema = z.object({
        productRating: z.number(),
        feedback: z.string(),
        wouldRecommend: z.boolean()
      });

      const result = await persona.generateStructuredOutput(
        OpinionSchema,
        'What do you think about our new app?'
      );

      expect(result.data).toBeDefined();
      expect(result.data.productRating).toBe(42);
      expect(result.data.feedback).toBe('Mock string value');
      expect(result.data.wouldRecommend).toBe(true);
      expect(result.metadata.personaId).toBe(persona.id);
      expect(result.metadata.personaName).toBe('John Doe');
    });

    it('should include persona attributes in system prompt', async () => {
      const persona = new Persona('Alice', {
        age: 28,
        occupation: 'UX Designer',
        sex: 'female',
        skills: ['Figma', 'Research']
      });

      const TestSchema = z.object({
        response: z.string()
      });

      const result = await persona.generateStructuredOutput(
        TestSchema,
        'Test question'
      );

      expect(result.metadata.systemPrompt).toContain('You are Alice');
      expect(result.metadata.systemPrompt).toContain('28 year old female UX Designer');
      expect(result.metadata.systemPrompt).toContain('skills: ["Figma","Research"]');
    });

    it('should use custom options when provided', async () => {
      const persona = new Persona('Test', {
        age: 30,
        occupation: 'Test',
        sex: 'other'
      });

      const TestSchema = z.object({
        test: z.string()
      });

      const result = await persona.generateStructuredOutput(
        TestSchema,
        'Test',
        {
          modelName: 'gpt-4o-mini',
          temperature: 0.5,
          systemPrompt: 'Custom persona prompt'
        }
      );

      expect(result.metadata.model).toBe('gpt-4.1-mini');
      expect(result.metadata.systemPrompt).toBe('Custom persona prompt');
    });
  });

  describe('Complex schemas', () => {
    it('should handle nested schemas', async () => {
      const group = new PersonaGroup('Test');
      group.add(new Persona('Test', { age: 25, occupation: 'Dev', sex: 'other' }));

      const ComplexSchema = z.object({
        demographics: z.object({
          ageRange: z.object({
            min: z.number(),
            max: z.number()
          }),
          occupations: z.array(z.string())
        }),
        insights: z.object({
          summary: z.string(),
          keyFindings: z.array(z.string())
        })
      });

      const result = await group.generateStructuredOutput(ComplexSchema);

      expect(result.data.demographics).toBeDefined();
      expect(result.data.demographics.ageRange.min).toBe(42);
      expect(result.data.demographics.ageRange.max).toBe(42);
      expect(result.data.insights.summary).toBe('Mock string value');
    });

    it('should work with marketing insight schema from README', async () => {
      const group = new PersonaGroup('Tech Workers');
      group.add(new Persona('Dev1', { age: 28, occupation: 'Developer', sex: 'male' }));
      group.add(new Persona('Dev2', { age: 32, occupation: 'Developer', sex: 'female' }));

      const MarketingInsightSchema = z.object({
        targetSegment: z.string(),
        keyDemographics: z.object({
          averageAge: z.number(),
          primaryOccupations: z.array(z.string())
        }),
        productRecommendations: z.array(z.string()),
        marketingChannels: z.array(z.string())
      });

      const result = await group.generateStructuredOutput(
        MarketingInsightSchema,
        'Analyze for product positioning'
      );

      expect(result.data.targetSegment).toBe('Mock string value');
      expect(result.data.keyDemographics.averageAge).toBe(42);
      expect(result.data.productRecommendations).toEqual(['item1', 'item2', 'item3']);
      expect(result.data.marketingChannels).toEqual(['item1', 'item2', 'item3']);
    });
  });

  describe('Error handling', () => {
    it('should handle missing API key gracefully', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const group = new PersonaGroup('Test');
      group.add(new Persona('Test', { age: 25, occupation: 'Dev', sex: 'other' }));

      const TestSchema = z.object({
        result: z.string()
      });

      // Should not throw, but use undefined API key
      const result = await group.generateStructuredOutput(TestSchema);
      expect(result).toBeDefined();
    });

    it('should handle large persona groups', async () => {
      const group = new PersonaGroup('Large Group');
      
      // Add 20 personas
      for (let i = 0; i < 20; i++) {
        group.add(new Persona(`Person${i}`, {
          age: 20 + i,
          occupation: 'Worker',
          sex: i % 2 === 0 ? 'male' : 'female'
        }));
      }

      const TestSchema = z.object({
        groupSize: z.number(),
        summary: z.string()
      });

      const result = await group.generateStructuredOutput(TestSchema);
      
      // Should only include first 10 personas in focus group
      expect(result.metadata.systemPrompt).toContain('Person0');
      expect(result.metadata.systemPrompt).toContain('Person9');
      expect(result.metadata.systemPrompt).not.toContain('Person10');
      expect(result.metadata.groupSize).toBe(20);
    });
  });
});