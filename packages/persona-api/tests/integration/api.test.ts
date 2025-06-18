import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index.js';

describe('API Integration Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    await server.listen({ port: 0 }); // Random port
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        status: 'ok',
        environment: 'test',
        version: '1.0.0',
      });
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeGreaterThan(0);
    });

    it('should return readiness status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ ready: true });
    });

    it('should return liveness status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health/live',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ alive: true });
    });
  });

  describe('Root Endpoint', () => {
    it('should return welcome message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        message: '🚀 Welcome to Persona SDK API',
        version: '1.0.0',
        docs: '/docs',
        health: '/health',
        endpoints: {
          personas: '/api/v1/personas',
          insights: '/api/v1/insights',
        },
      });
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/unknown-route',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Route GET /unknown-route not found',
      });
    });
  });
});