/**
 * Tests for media diet functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  MediaDietManager, 
  MediaDietConfig, 
  MediaDietItem,
  MediaConsumptionPattern,
  MediaInfluenceResult
} from '../src/media/media-diet';
import { Persona } from '../src/persona';
import { PersonaGroup } from '../src/persona-group';
import { MediaContent } from '../src/media/media-processor';

// Mock dependencies
vi.mock('../src/media/media-processor', () => ({
  MediaProcessor: vi.fn().mockImplementation(() => ({
    processFile: vi.fn().mockResolvedValue({
      type: 'text',
      mimeType: 'text/plain',
      content: 'test content'
    }),
    analyzeMediaForPersona: vi.fn().mockResolvedValue({
      analysis: 'Category: Technology\nInsights: Tech-focused content',
      usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 }
    }),
    countTokens: vi.fn().mockReturnValue(100)
  }))
}));

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({
      content: 'Mock media recommendation response'
    }),
    withStructuredOutput: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        influences: {
          interests: ['technology', 'innovation'],
          values: ['efficiency', 'progress'],
          vocabulary: ['algorithm', 'optimization', 'scalability'],
          opinions: [
            { topic: 'AI', stance: 'positive', confidence: 0.8 }
          ],
          behaviors: ['early adopter', 'data-driven'],
          knowledge: [
            { domain: 'technology', level: 'advanced' }
          ]
        },
        personalityShifts: {
          openness: 0.2,
          conscientiousness: 0.1,
          extraversion: 0,
          agreeableness: -0.1,
          neuroticism: -0.1
        },
        overallImpact: 'moderate'
      })
    })
  }))
}));

describe('MediaDietManager', () => {
  let manager: MediaDietManager;
  let testPersona: Persona;
  let testGroup: PersonaGroup;

  beforeEach(() => {
    manager = new MediaDietManager('test-api-key');
    testPersona = new Persona('Test User', {
      age: 30,
      occupation: 'Software Developer',
      sex: 'other',
      interests: ['coding', 'gaming'],
      openness: 0.7,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4
    });
    
    testGroup = new PersonaGroup('Test Group');
    testGroup.add(testPersona);
    testGroup.add(new Persona('Test User 2', {
      age: 25,
      occupation: 'Designer',
      sex: 'female'
    }));
  });

  describe('Media diet creation', () => {
    it('should create media diet from files', async () => {
      const files = ['./article1.txt', './article2.txt', './video.mp4'];
      const diet = await manager.createMediaDiet(files);

      expect(diet.items).toHaveLength(3);
      expect(diet.items[0].frequency).toBe('daily');
      expect(diet.items[0].engagement).toBe('passive');
      expect(diet.items[0].category).toBe('Technology'); // Extracted from mock
      
      expect(diet.patterns.preferredTypes).toContain('text');
      expect(diet.patterns.avgDailyConsumption).toBe(120);
    });

    it('should use custom consumption patterns', async () => {
      const files = ['./article.txt'];
      const customPattern: Partial<MediaConsumptionPattern> = {
        peakHours: [6, 7, 8],
        avgDailyConsumption: 60,
        platforms: ['mobile']
      };

      const diet = await manager.createMediaDiet(files, customPattern);

      expect(diet.patterns.peakHours).toEqual([6, 7, 8]);
      expect(diet.patterns.avgDailyConsumption).toBe(60);
      expect(diet.patterns.platforms).toEqual(['mobile']);
    });

    it('should extract unique categories and types', async () => {
      const files = ['./tech1.txt', './tech2.txt', './lifestyle.txt'];
      const diet = await manager.createMediaDiet(files);

      expect(diet.patterns.interests).toContain('Technology');
      expect(new Set(diet.patterns.interests).size).toBeLessThanOrEqual(files.length);
    });
  });

  describe('Media influence application', () => {
    let testDiet: MediaDietConfig;

    beforeEach(() => {
      const mediaItem: MediaDietItem = {
        content: {
          type: 'text',
          mimeType: 'text/plain',
          content: 'AI article content'
        } as MediaContent,
        frequency: 'daily',
        duration: 30,
        engagement: 'active',
        source: './ai-article.txt',
        category: 'Technology'
      };

      testDiet = {
        items: [mediaItem],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20, 21],
          avgDailyConsumption: 120,
          platforms: ['web'],
          interests: ['Technology']
        }
      };
    });

    it('should apply media influences to persona', async () => {
      const result = await manager.applyMediaInfluence(testPersona, testDiet);

      expect(result.persona.name).toContain('Media Influenced');
      expect(result.influences).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      // Check if interests were added
      expect(result.persona.attributes.interests).toContain('technology');
      expect(result.persona.attributes.interests).toContain('innovation');
      
      // Check if vocabulary was added
      expect(result.persona.attributes.vocabulary).toContain('algorithm');
      
      // Check personality shifts
      expect(result.persona.attributes.openness).toBeGreaterThan(testPersona.attributes.openness);
    });

    it('should calculate confidence based on diet size', async () => {
      const smallDiet = { ...testDiet, items: [testDiet.items[0]] };
      const largeDiet = { 
        ...testDiet, 
        items: Array(10).fill(testDiet.items[0]) 
      };

      const smallResult = await manager.applyMediaInfluence(testPersona, smallDiet);
      const largeResult = await manager.applyMediaInfluence(testPersona, largeDiet);

      expect(largeResult.confidence).toBeGreaterThan(smallResult.confidence);
    });

    it('should preserve existing interests when adding new ones', async () => {
      const result = await manager.applyMediaInfluence(testPersona, testDiet);
      
      // Should keep original interests
      expect(result.persona.attributes.interests).toContain('coding');
      expect(result.persona.attributes.interests).toContain('gaming');
      // And add new ones
      expect(result.persona.attributes.interests).toContain('technology');
    });

    it('should apply bounded personality shifts', async () => {
      // Create persona with extreme personality values
      const extremePersona = new Persona('Extreme', {
        age: 30,
        occupation: 'Test',
        sex: 'other',
        openness: 0.95,
        neuroticism: 0.1
      });

      const result = await manager.applyMediaInfluence(extremePersona, testDiet);
      
      // Should not exceed bounds [0, 1]
      expect(result.persona.attributes.openness).toBeLessThanOrEqual(1);
      expect(result.persona.attributes.neuroticism).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Persona group application', () => {
    it('should apply media diet to entire group', async () => {
      const diet: MediaDietConfig = {
        items: [{
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const { influencedGroup, results, totalUsage } = await manager.applyToPersonaGroup(
        testGroup,
        diet
      );

      expect(influencedGroup.name).toContain('Media Influenced');
      expect(influencedGroup.size).toBe(testGroup.size);
      expect(results).toHaveLength(testGroup.size);
      expect(totalUsage.total_tokens).toBeGreaterThan(0);
    });

    it('should apply variation factor to diet', async () => {
      const diet: MediaDietConfig = {
        items: Array(5).fill({
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }),
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const { results } = await manager.applyToPersonaGroup(
        testGroup,
        diet,
        { variationFactor: 0.5 }
      );

      // With variation, personas might have different influences
      expect(results).toHaveLength(testGroup.size);
    });

    it('should respect sample size option', async () => {
      const largeGroup = new PersonaGroup('Large Group');
      for (let i = 0; i < 10; i++) {
        largeGroup.add(new Persona(`User ${i}`, {
          age: 20 + i,
          occupation: 'Test',
          sex: 'other'
        }));
      }

      const diet: MediaDietConfig = {
        items: [{
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const { results } = await manager.applyToPersonaGroup(
        largeGroup,
        diet,
        { sampleSize: 5 }
      );

      expect(results).toHaveLength(5);
    });
  });

  describe('Media recommendations', () => {
    it('should generate media recommendations for persona', async () => {
      const availableMedia: MediaContent[] = [
        { type: 'text', mimeType: 'text/plain', content: 'Tech article', metadata: { title: 'AI Trends' } },
        { type: 'video', mimeType: 'video/mp4', content: 'video', metadata: { title: 'Cooking Show' } },
        { type: 'text', mimeType: 'text/plain', content: 'Gaming news', metadata: { title: 'New Games' } }
      ];

      const { recommendations, reasoning, usage } = await manager.recommendMedia(
        testPersona,
        availableMedia,
        {
          desiredInfluences: ['creativity', 'technical skills'],
          avoidTopics: ['politics']
        }
      );

      expect(reasoning).toBeDefined();
      expect(usage).toBeDefined();
      expect(usage?.total_tokens).toBeGreaterThan(0);
    });

    it('should handle empty available media', async () => {
      const { recommendations, reasoning } = await manager.recommendMedia(
        testPersona,
        []
      );

      expect(recommendations).toEqual([]);
      expect(reasoning).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle personas without personality attributes', async () => {
      const simplePersona = new Persona('Simple', {
        age: 25,
        occupation: 'Student',
        sex: 'male'
      });

      const diet: MediaDietConfig = {
        items: [{
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const result = await manager.applyMediaInfluence(simplePersona, diet);
      
      expect(result.persona).toBeDefined();
      expect(result.influences).toBeDefined();
    });

    it('should handle empty media diet', async () => {
      const emptyDiet: MediaDietConfig = {
        items: [],
        patterns: {
          preferredTypes: [],
          peakHours: [],
          avgDailyConsumption: 0,
          platforms: [],
          interests: []
        }
      };

      const result = await manager.applyMediaInfluence(testPersona, emptyDiet);
      
      expect(result.persona).toBeDefined();
      expect(result.confidence).toBe(0.5); // Base confidence
    });

    it('should handle very large media diets', async () => {
      const largeDiet: MediaDietConfig = {
        items: Array(100).fill({
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }),
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 600,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const result = await manager.applyMediaInfluence(testPersona, largeDiet);
      
      expect(result.confidence).toBe(1); // Max confidence
    });
  });

  describe('Integration with PersonaGroup', () => {
    it('should maintain group statistics after media influence', async () => {
      const diet: MediaDietConfig = {
        items: [{
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'General'
        }],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['General']
        }
      };

      const originalStats = testGroup.getStatistics('age');
      const { influencedGroup } = await manager.applyToPersonaGroup(testGroup, diet);
      const newStats = influencedGroup.getStatistics('age');

      // Age shouldn't change from media influence
      expect(newStats.mean).toBeCloseTo(originalStats.mean, 0);
      expect(newStats.count).toBe(originalStats.count);
    });

    it('should allow filtering influenced personas', async () => {
      const diet: MediaDietConfig = {
        items: [{
          content: { type: 'text', mimeType: 'text/plain', content: 'test' } as MediaContent,
          frequency: 'daily',
          engagement: 'passive',
          source: './test.txt',
          category: 'Technology'
        }],
        patterns: {
          preferredTypes: ['text'],
          peakHours: [20],
          avgDailyConsumption: 60,
          platforms: ['web'],
          interests: ['Technology']
        }
      };

      const { influencedGroup } = await manager.applyToPersonaGroup(testGroup, diet);
      
      // Should be able to filter by new interests
      const techInterested = influencedGroup.filter(p => 
        Array.isArray(p.attributes.interests) && 
        p.attributes.interests.includes('technology')
      );

      expect(techInterested.length).toBeGreaterThan(0);
    });
  });
});