import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index.js';

describe('Insights API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    // Set mock mode for tests
    process.env.MOCK_OPENAI = 'true';
    server = buildServer();
    await server.listen({ port: 0 });
  });

  afterAll(async () => {
    await server.close();
  });

  const samplePersonas = [
    {
      id: 'p1',
      name: 'Alice Johnson',
      attributes: {
        age: 28,
        occupation: 'Software Engineer',
        sex: 'female',
        interests: ['tech', 'startups'],
        income: 95000,
      },
    },
    {
      id: 'p2',
      name: 'Bob Smith',
      attributes: {
        age: 35,
        occupation: 'Product Manager',
        sex: 'male',
        interests: ['business', 'tech'],
        income: 120000,
      },
    },
    {
      id: 'p3',
      name: 'Carol Davis',
      attributes: {
        age: 42,
        occupation: 'Designer',
        sex: 'female',
        interests: ['design', 'art'],
        income: 85000,
      },
    },
  ];

  describe('POST /api/v1/insights/analyze', () => {
    it('should analyze market insights', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        payload: {
          personas: samplePersonas,
          analysis_type: 'market_insights',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        type: 'market_insights',
        metadata: {
          persona_count: 3,
          model: 'mock',
        },
      });
      expect(body.analysis_id).toBeDefined();
      expect(body.insights).toBeDefined();
      expect(body.insights.target_segments).toBeDefined();
      expect(body.insights.opportunities).toBeDefined();
      expect(body.insights.challenges).toBeDefined();
      expect(body.insights.recommendations).toBeDefined();
    });

    it('should analyze content performance', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        payload: {
          personas: samplePersonas,
          analysis_type: 'content_performance',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.type).toBe('content_performance');
      expect(body.insights.predicted_ctr).toBeDefined();
      expect(body.insights.engagement_score).toBeDefined();
      expect(body.insights.viral_potential).toBeDefined();
      expect(body.insights.best_channels).toBeDefined();
      expect(body.insights.optimization_tips).toBeDefined();
    });

    it('should handle custom analysis with schema', async () => {
      const payload = {
        personas: samplePersonas,
        analysis_type: 'custom',
        custom_prompt: 'What are the top 3 product features this audience would want?',
        output_schema: {
          top_features: {
            type: 'array',
            items: { type: 'string' },
          },
          reasoning: { type: 'string' },
        },
      };
      
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        headers: {
          'content-type': 'application/json',
        },
        payload: JSON.stringify(payload),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.insights).toBeDefined();
    });

    it('should validate minimum personas', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        payload: {
          personas: [],
          analysis_type: 'market_insights',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/insights/predict', () => {
    it('should predict content performance metrics', async () => {
      const payload = {
        personas: samplePersonas,
        content: {
          title: 'How AI is Transforming Software Development',
          type: 'blog',
          description: 'An in-depth look at AI tools for developers',
          metadata: {
            readTime: 7,
            hasImages: true,
          },
        },
        metrics: ['ctr', 'engagement_rate', 'viral_probability'],
      };
      
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/predict',
        headers: {
          'content-type': 'application/json',
        },
        payload: JSON.stringify(payload),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.prediction_id).toBeDefined();
      expect(body.content).toBeDefined();
      expect(body.predictions).toBeDefined();
      expect(body.predictions.ctr).toBeDefined();
      expect(body.predictions.engagement_rate).toBeDefined();
      expect(body.predictions.viral_probability).toBeDefined();
      expect(body.recommendations).toBeDefined();
      expect(Array.isArray(body.recommendations)).toBe(true);
    });

    it('should include confidence intervals when available', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/predict',
        payload: {
          personas: samplePersonas,
          content: {
            title: 'Test Content',
            type: 'video',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      if (body.confidence_intervals) {
        expect(body.confidence_intervals.ctr).toBeDefined();
        expect(body.confidence_intervals.ctr.lower).toBeLessThan(body.confidence_intervals.ctr.upper);
      }
    });

    it('should validate content type', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/predict',
        payload: {
          personas: samplePersonas,
          content: {
            title: 'Test',
            type: 'invalid_type',
          },
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/insights/segment', () => {
    const manyPersonas = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      name: `Person ${i}`,
      attributes: {
        age: 20 + Math.random() * 40,
        income: 30000 + Math.random() * 100000,
        engagement: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      },
    }));

    it('should segment personas into groups', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/segment',
        payload: {
          personas: manyPersonas,
          segment_count: 3,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.segmentation_id).toBeDefined();
      expect(body.segments).toHaveLength(3);
      
      body.segments.forEach((segment: any) => {
        expect(segment.id).toBeDefined();
        expect(segment.name).toBeDefined();
        expect(segment.size).toBeGreaterThan(0);
        expect(segment.percentage).toBeGreaterThan(0);
        expect(segment.characteristics).toBeDefined();
        expect(segment.typical_persona).toBeDefined();
      });

      expect(body.insights).toBeDefined();
      expect(body.metadata.segment_count).toBe(3);
    });

    it('should validate minimum personas for segmentation', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/segment',
        payload: {
          personas: samplePersonas, // Only 3, need at least 10
          segment_count: 2,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate segment count', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/segment',
        payload: {
          personas: manyPersonas,
          segment_count: 15, // Too many
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/insights/quick', () => {
    it('should answer quick questions about personas', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/quick',
        payload: {
          personas: samplePersonas,
          question: 'What is the average income and what features would they pay for?',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.answer).toBeDefined();
      expect(body.confidence).toMatch(/^(low|medium|high)$/);
      
      if (body.supporting_data) {
        expect(Array.isArray(body.supporting_data)).toBe(true);
      }
    });

    it('should handle complex questions', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/quick',
        payload: {
          personas: samplePersonas,
          question: 'Should we build a mobile app or focus on web? Consider their age and tech preferences.',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.answer).toBeTruthy();
      expect(body.answer.length).toBeGreaterThan(50); // Meaningful answer
    });

    it('should validate question presence', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/quick',
        payload: {
          personas: samplePersonas,
          question: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        payload: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/insights/analyze',
        payload: {
          // Missing personas and analysis_type
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toBeDefined();
    });
  });
});