import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index.js';

describe('Personas API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    await server.listen({ port: 0 });
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/v1/personas', () => {
    it('should create a single persona with minimal data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas',
        payload: {
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test User',
      });
      expect(body.id).toBeDefined();
      expect(body.attributes).toBeDefined();
      expect(body.created_at).toBeDefined();
    });

    it('should create a persona with full attributes', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas',
        payload: {
          name: 'Jane Doe',
          attributes: {
            age: 28,
            occupation: 'Software Engineer',
            sex: 'female',
            location: 'San Francisco',
            interests: ['tech', 'startups'],
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Jane Doe');
      expect(body.attributes).toMatchObject({
        age: 28,
        occupation: 'Software Engineer',
        sex: 'female',
        location: 'San Francisco',
        interests: ['tech', 'startups'],
      });
    });

    it('should validate age constraints', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas',
        payload: {
          attributes: {
            age: 200, // Too high
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toBeDefined();
    });
  });

  describe('POST /api/v1/personas/groups', () => {
    it('should create a simple persona group', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/groups',
        payload: {
          size: 10,
          name: 'Test Group',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Group',
        size: 10,
      });
      expect(body.id).toBeDefined();
      expect(body.personas).toHaveLength(10);
      expect(body.statistics).toBeDefined();
    });

    it.skip('should create a group with distributions', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/groups',
        payload: {
          size: 100,
          name: 'Distributed Group',
          distributions: {
            age: {
              type: 'normal',
              params: {
                mean: 35,
                stdDev: 10,
              },
            },
            income: {
              type: 'uniform',
              params: {
                min: 30000,
                max: 150000,
              },
            },
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.size).toBe(100);
      expect(body.statistics.age).toBeDefined();
      expect(body.statistics.income).toBeDefined();
    });

    it('should create a segmented group', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/groups',
        payload: {
          size: 1000,
          segments: [
            {
              name: 'Power Users',
              weight: 0.2,
              attributes: {
                engagement: 'high',
                subscription: 'premium',
              },
            },
            {
              name: 'Regular Users',
              weight: 0.6,
              attributes: {
                engagement: 'medium',
                subscription: 'basic',
              },
            },
            {
              name: 'Free Users',
              weight: 0.2,
              attributes: {
                engagement: 'low',
                subscription: 'free',
              },
            },
          ],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.size).toBe(1000);
      // Segments should be reflected in the personas
    });

    it('should validate size constraints', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/groups',
        payload: {
          size: 20000, // Too large
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/personas/batch', () => {
    it('should batch create personas', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/batch',
        payload: {
          count: 5,
          template: {
            name: 'Batch User',
            attributes: {
              occupation: 'Designer',
              sex: 'other',
            },
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.count).toBe(5);
      expect(body.personas).toHaveLength(5);
      
      body.personas.forEach((persona: any, index: number) => {
        expect(persona.name).toBe(`Batch User ${index + 1}`);
        expect(persona.attributes.occupation).toBe('Designer');
        expect(persona.attributes.sex).toBe('other');
      });
    });

    it('should create batch without template', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/personas/batch',
        payload: {
          count: 3,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.count).toBe(3);
      expect(body.personas).toHaveLength(3);
    });
  });

  describe('GET /api/v1/personas/random', () => {
    it('should generate a random persona', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/personas/random',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.attributes).toBeDefined();
      expect(body.attributes.age).toBeGreaterThanOrEqual(18);
      expect(body.attributes.age).toBeLessThanOrEqual(80);
      expect(body.attributes.occupation).toBeDefined();
      expect(body.attributes.sex).toMatch(/^(male|female|other)$/);
      expect(body.attributes.generated_type).toBe('random');
    });

    it('should generate different personas on each call', async () => {
      const responses = await Promise.all([
        server.inject({ method: 'GET', url: '/api/v1/personas/random' }),
        server.inject({ method: 'GET', url: '/api/v1/personas/random' }),
        server.inject({ method: 'GET', url: '/api/v1/personas/random' }),
      ]);

      const personas = responses.map(r => JSON.parse(r.body));
      const ids = personas.map(p => p.id);
      
      // All IDs should be unique
      expect(new Set(ids).size).toBe(3);
    });
  });
});