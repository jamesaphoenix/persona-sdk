import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string(),
});

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            environment: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  });

  fastify.get('/ready', {
    schema: {
      description: 'Readiness check for Kubernetes',
      tags: ['health'],
      response: {
        200: {
          description: 'Service is ready',
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    // Add any readiness checks here (DB connection, etc.)
    return { ready: true };
  });

  fastify.get('/live', {
    schema: {
      description: 'Liveness check for Kubernetes',
      tags: ['health'],
      response: {
        200: {
          description: 'Service is alive',
          type: 'object',
          properties: {
            alive: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return { alive: true };
  });
};