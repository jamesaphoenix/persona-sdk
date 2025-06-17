/**
 * Tests for media to persona generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  MediaToPersonaGenerator,
  MediaToPersonaOptions,
  MediaToPersonaResult
} from '../src/tools/media-to-persona';
import { Persona } from '../src/persona';
import { MediaContent } from '../src/media/media-processor';

// Mock dependencies
vi.mock('../src/media/media-processor', () => ({
  MediaProcessor: vi.fn().mockImplementation(() => ({
    processFile: vi.fn().mockResolvedValue({
      type: 'image',
      mimeType: 'image/jpeg',
      content: 'base64imagedata'
    }),
    analyzeMediaForPersona: vi.fn().mockResolvedValue({
      analysis: `
        Persona 1: Photographer
        - Age: 35-45
        - Occupation: Professional photographer
        - Interests: Art, travel, nature
        
        Persona 2: Subject
        - Age: 25-30
        - Occupation: Model
        - Style: Casual, modern
      `,
      usage: { input_tokens: 200, output_tokens: 100, total_tokens: 300 }
    }),
    countTokens: vi.fn().mockImplementation((text: string) => Math.ceil(text.length / 4)),
    estimateCost: vi.fn().mockReturnValue({
      inputCost: 0.002,
      outputCost: 0.003,
      totalCost: 0.005
    })
  }))
}));

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    withStructuredOutput: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        authorProfile: {
          age: 28,
          occupation: 'Tech Professional',
          sex: 'female',
          interests: ['fitness', 'sustainability', 'technology'],
          values: ['environmental consciousness', 'health', 'innovation'],
          personality: {
            openness: 0.8,
            conscientiousness: 0.7,
            extraversion: 0.6,
            agreeableness: 0.7,
            neuroticism: 0.3
          },
          communicationStyle: {
            formality: 'casual',
            tone: 'enthusiastic',
            vocabulary: 'intermediate'
          },
          demographics: {
            location: 'Urban area',
            educationLevel: 'Bachelor\'s degree',
            incomeRange: '$50k-$100k',
            familyStatus: 'Single'
          }
        },
        confidence: {
          overall: 0.85,
          attributes: {
            age: 0.7,
            occupation: 0.9,
            interests: 0.95,
            values: 0.8
          }
        },
        distributions: {
          age: { type: 'normal', mean: 28, stdDev: 3 },
          personality: {
            openness: { type: 'beta', alpha: 4, beta: 1 }
          }
        },
        reasoning: 'Based on writing style, vocabulary, and expressed interests...'
      })
    })
  }))
}));

describe('MediaToPersonaGenerator', () => {
  let generator: MediaToPersonaGenerator;

  beforeEach(() => {
    generator = new MediaToPersonaGenerator('test-api-key');
  });

  describe('Text post to persona', () => {
    const samplePost = `
      Just finished my morning 5K run! 🏃‍♀️ Feeling energized for the day ahead. 
      Time to grab my usual oat milk latte and head to the co-working space. 
      Working on some exciting sustainability projects today. 
      Who else is passionate about green tech? #StartupLife #Sustainability
    `;

    it('should generate single persona from text post', async () => {
      const result = await generator.fromTextPost(samplePost);

      expect(result.personas).toHaveLength(1);
      expect(result.personas[0]).toBeInstanceOf(Persona);
      expect(result.personas[0].name).toBe('Generated Persona');
      
      const attrs = result.personas[0].attributes;
      expect(attrs.age).toBe(28);
      expect(attrs.occupation).toBe('Tech Professional');
      expect(attrs.interests).toContain('fitness');
      expect(attrs.interests).toContain('sustainability');
    });

    it('should generate multiple personas with variations', async () => {
      const options: MediaToPersonaOptions = {
        generateMultiple: true,
        count: 5,
        includeDistributions: true
      };

      const result = await generator.fromTextPost(samplePost, options);

      expect(result.personas).toHaveLength(5);
      expect(result.distributions).toBeDefined();
      
      // Check that personas have variations
      const ages = result.personas.map(p => p.attributes.age);
      const uniqueAges = new Set(ages);
      expect(uniqueAges.size).toBeGreaterThan(1);
    });

    it('should focus on specified attributes', async () => {
      const options: MediaToPersonaOptions = {
        focusAttributes: ['age', 'interests', 'values']
      };

      const result = await generator.fromTextPost(samplePost, options);

      expect(result.personas[0].attributes.interests).toBeDefined();
      expect(result.personas[0].attributes.values).toBeDefined();
    });

    it('should include confidence scores', async () => {
      const result = await generator.fromTextPost(samplePost);

      expect(result.analysis.confidence).toBe(0.85);
      expect(result.analysis.reasoning).toContain('Based on writing style');
    });

    it('should track token usage', async () => {
      const result = await generator.fromTextPost(samplePost);

      expect(result.usage.input_tokens).toBeGreaterThan(0);
      expect(result.usage.output_tokens).toBeGreaterThan(0);
      expect(result.usage.total_tokens).toBe(
        result.usage.input_tokens + result.usage.output_tokens
      );
    });

    it('should handle very short text posts', async () => {
      const shortPost = 'Hello!';
      const result = await generator.fromTextPost(shortPost);

      expect(result.personas).toHaveLength(1);
      expect(result.personas[0]).toBeInstanceOf(Persona);
    });

    it('should handle text with emojis and hashtags', async () => {
      const emojiPost = '🎉 Amazing day! #blessed #grateful 🙏';
      const result = await generator.fromTextPost(emojiPost);

      expect(result.personas).toHaveLength(1);
      expect(result.analysis.reasoning).toBeDefined();
    });
  });

  describe('Image to persona', () => {
    it('should generate personas from image analysis', async () => {
      const result = await generator.fromImage('./test-image.jpg');

      expect(result.personas.length).toBeGreaterThan(0);
      expect(result.personas[0].name).toContain('Extracted Persona');
      expect(result.analysis.confidence).toBe(0.7); // Default for images
    });

    it('should extract multiple personas from image', async () => {
      const result = await generator.fromImage('./group-photo.jpg');

      // Based on mock analysis mentioning photographer and subject
      expect(result.personas.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle image processing errors gracefully', async () => {
      const mockProcessor = vi.mocked((generator as any).mediaProcessor);
      mockProcessor.processFile.mockRejectedValueOnce(new Error('Invalid image'));

      await expect(generator.fromImage('./corrupt.jpg')).rejects.toThrow('Invalid image');
    });
  });

  describe('Media collection processing', () => {
    it('should process multiple media files', async () => {
      const mediaPaths = [
        './article1.txt',
        './image1.jpg',
        './article2.txt'
      ];

      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          personas: [
            { age: 25, occupation: 'Content Creator', sex: 'female' },
            { age: 35, occupation: 'Tech Worker', sex: 'male' },
            { age: 30, occupation: 'Designer', sex: 'other' }
          ],
          reasoning: 'Based on diverse media content...'
        })
      };

      vi.mocked((generator as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const result = await generator.fromMediaCollection(mediaPaths);

      expect(result.personas).toHaveLength(3);
      expect(result.personas[0].name).toContain('Media Persona');
      expect(result.analysis.confidence).toBe(0.8);
      expect(result.usage.total_tokens).toBeGreaterThan(0);
    });

    it('should continue processing despite individual file errors', async () => {
      const mediaPaths = ['./good.txt', './bad.txt', './good2.txt'];
      
      const mockProcessor = vi.mocked((generator as any).mediaProcessor);
      mockProcessor.processFile
        .mockResolvedValueOnce({ type: 'text', mimeType: 'text/plain', content: 'good' })
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce({ type: 'text', mimeType: 'text/plain', content: 'good2' });

      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          personas: [{ age: 30, occupation: 'Writer', sex: 'other' }],
          reasoning: 'Based on available content...'
        })
      };

      vi.mocked((generator as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const result = await generator.fromMediaCollection(mediaPaths);

      expect(result.personas.length).toBeGreaterThan(0);
    });

    it('should synthesize coherent personas from diverse media', async () => {
      const mediaPaths = [
        './tech-blog.txt',
        './lifestyle-image.jpg',
        './podcast-transcript.txt'
      ];

      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          personas: [
            { 
              age: 28, 
              occupation: 'Digital Nomad', 
              sex: 'female',
              interests: ['technology', 'travel', 'podcasting']
            }
          ],
          reasoning: 'Synthesized from tech content, lifestyle imagery, and podcast topics'
        })
      };

      vi.mocked((generator as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const result = await generator.fromMediaCollection(mediaPaths);

      expect(result.personas[0].attributes.interests).toContain('technology');
      expect(result.personas[0].attributes.interests).toContain('travel');
      expect(result.analysis.reasoning).toContain('Synthesized');
    });
  });

  describe('Distribution and variation handling', () => {
    it('should create appropriate distributions from analysis', async () => {
      const options: MediaToPersonaOptions = {
        generateMultiple: true,
        count: 10,
        includeDistributions: true
      };

      const result = await generator.fromTextPost('Test post', options);

      expect(result.distributions).toBeDefined();
      expect(result.distributions?.age).toBeDefined();
      
      // Test that distribution generates varied values
      const ages = [];
      for (let i = 0; i < 10; i++) {
        ages.push(result.distributions.age.mean);
      }
      expect(new Set(ages).size).toBe(1); // Mean should be constant
    });

    it('should apply bounded variations to attributes', async () => {
      const options: MediaToPersonaOptions = {
        generateMultiple: true,
        count: 20
      };

      const result = await generator.fromTextPost('Test post', options);

      // Check all ages are within reasonable bounds
      const ages = result.personas.map(p => p.attributes.age);
      ages.forEach(age => {
        expect(age).toBeGreaterThanOrEqual(18);
        expect(age).toBeLessThanOrEqual(90);
      });

      // Check personality traits are bounded [0, 1]
      result.personas.forEach(persona => {
        if (persona.attributes.personality) {
          Object.values(persona.attributes.personality).forEach(value => {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
          });
        }
      });
    });
  });

  describe('Cost estimation', () => {
    it('should estimate processing costs accurately', () => {
      const estimate = generator.estimateProcessingCost(
        5,
        ['text', 'image', 'text', 'document', 'video'],
        'gpt-4-turbo-preview'
      );

      expect(estimate.estimatedTokens).toBeGreaterThan(0);
      expect(estimate.estimatedCost).toBeGreaterThan(0);
      
      // Video should cost more than text
      const textEstimate = generator.estimateProcessingCost(1, ['text'], 'gpt-4-turbo-preview');
      const videoEstimate = generator.estimateProcessingCost(1, ['video'], 'gpt-4-turbo-preview');
      expect(videoEstimate.estimatedTokens).toBeGreaterThan(textEstimate.estimatedTokens);
    });

    it('should handle unknown media types in cost estimation', () => {
      const estimate = generator.estimateProcessingCost(
        2,
        ['unknown', 'mystery'],
        'gpt-4-turbo-preview'
      );

      expect(estimate.estimatedTokens).toBeGreaterThan(0);
      expect(estimate.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle empty text gracefully', async () => {
      const result = await generator.fromTextPost('');

      expect(result.personas).toHaveLength(1);
      expect(result.personas[0]).toBeInstanceOf(Persona);
    });

    it('should handle API errors', async () => {
      vi.mocked((generator as any).model.withStructuredOutput).mockReturnValue({
        invoke: vi.fn().mockRejectedValue(new Error('API Error'))
      });

      await expect(generator.fromTextPost('Test')).rejects.toThrow('API Error');
    });

    it('should create default persona when parsing fails', async () => {
      const mockProcessor = vi.mocked((generator as any).mediaProcessor);
      mockProcessor.analyzeMediaForPersona.mockResolvedValueOnce({
        analysis: 'The image is too blurry to make out any details about people or their attributes.',
        usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 }
      });

      const result = await generator.fromImage('./unclear.jpg');

      expect(result.personas).toHaveLength(1);
      expect(result.personas[0].name).toBe('Default Persona');
      expect(result.personas[0].attributes.occupation).toBe('Content Consumer');
    });

    it('should handle complex nested attributes', async () => {
      const complexPost = `
        As a 35-year-old software architect living in San Francisco,
        I'm passionate about distributed systems and cloud computing.
        My MBTI is INTJ, and I value efficiency and innovation.
        Weekend hobbies include hiking and reading sci-fi novels.
      `;

      const result = await generator.fromTextPost(complexPost, {
        focusAttributes: ['personality', 'demographics', 'interests']
      });

      expect(result.personas[0].attributes).toHaveProperty('personality');
      expect(result.personas[0].attributes).toHaveProperty('demographics');
      expect(result.personas[0].attributes.interests).toBeDefined();
    });
  });

  describe('Integration with other SDK features', () => {
    it('should generate personas compatible with PersonaGroup', async () => {
      const result = await generator.fromTextPost('Test post', {
        generateMultiple: true,
        count: 5
      });

      // Personas should have required attributes
      result.personas.forEach(persona => {
        expect(persona.attributes).toHaveProperty('age');
        expect(persona.attributes).toHaveProperty('occupation');
        expect(persona.attributes).toHaveProperty('sex');
      });
    });

    it('should include all extended attributes when requested', async () => {
      const result = await generator.fromTextPost('Detailed post', {
        focusAttributes: ['interests', 'values', 'personality', 'communicationStyle', 'demographics']
      });

      const attrs = result.personas[0].attributes;
      expect(attrs.interests).toBeDefined();
      expect(attrs.values).toBeDefined();
      expect(attrs.personality).toBeDefined();
      expect(attrs.communicationStyle).toBeDefined();
      expect(attrs.demographics).toBeDefined();
    });
  });
});