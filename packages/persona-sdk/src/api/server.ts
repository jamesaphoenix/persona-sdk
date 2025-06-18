/**
 * Fastify API Server for Persona SDK
 */

import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { PostgresAdapter } from '../adapters/postgres/adapter.js';
import type { DatabaseClient } from '../adapters/postgres/adapter.js';
import {
  createPersonaSchema,
  updatePersonaSchema,
  personaQuerySchema,
  createPersonaGroupSchema,
  updatePersonaGroupSchema,
  personaGroupQuerySchema,
  bulkCreatePersonasSchema,
  addToGroupSchema,
  removeFromGroupSchema,
  personaResponseSchema,
  personaGroupResponseSchema,
  paginatedResponseSchema,
  statsResponseSchema,
  errorResponseSchema,
} from './schemas.js';

export interface ServerOptions {
  databaseClient: DatabaseClient;
  port?: number;
  host?: string;
  cors?: boolean;
  swagger?: boolean;
  logger?: boolean;
}

export async function createServer(options: ServerOptions): Promise<FastifyInstance> {
  const app = fastify({
    logger: options.logger ?? true,
  }).withTypeProvider<ZodTypeProvider>();

  // Add schema compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Database adapter
  const adapter = new PostgresAdapter(options.databaseClient);
  app.decorate('db', adapter);

  // CORS
  if (options.cors !== false) {
    await app.register(fastifyCors, {
      origin: true,
      credentials: true,
    });
  }

  // Swagger documentation
  if (options.swagger !== false) {
    await app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Persona SDK API',
          description: 'API for managing personas and persona groups',
          version: '1.0.0',
        },
      },
      transform: jsonSchemaTransform,
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // ============ Persona Routes ============

  // Create persona
  app.post(
    '/personas',
    {
      schema: {
        body: createPersonaSchema,
        response: {
          201: personaResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const persona = await adapter.createPersona((request.body as any) as any);
      reply.code(201).send(persona);
    }
  );

  // Get persona by ID
  app.get(
    '/personas/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: personaResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const persona = await adapter.getPersona((request.params as any).id);
      if (!persona) {
        reply.code(404).send({ error: 'Persona not found' });
        return;
      }
      reply.send(persona);
    }
  );

  // Update persona
  app.patch(
    '/personas/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: updatePersonaSchema,
        response: {
          200: personaResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const persona = await adapter.updatePersona((request.params as any).id, (request.body as any));
      if (!persona) {
        reply.code(404).send({ error: 'Persona not found' });
        return;
      }
      reply.send(persona);
    }
  );

  // Delete persona
  app.delete(
    '/personas/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.null(),
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deleted = await adapter.deletePersona((request.params as any).id);
      if (!deleted) {
        reply.code(404).send({ error: 'Persona not found' });
        return;
      }
      reply.code(204).send();
    }
  );

  // Query personas
  app.get(
    '/personas',
    {
      schema: {
        querystring: personaQuerySchema,
        response: {
          200: paginatedResponseSchema(personaResponseSchema),
        },
      },
    },
    async (request) => {
      return adapter.queryPersonas((request.query as any));
    }
  );

  // Bulk create personas
  app.post(
    '/personas/bulk',
    {
      schema: {
        body: bulkCreatePersonasSchema,
        response: {
          201: z.array(personaResponseSchema),
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const personas = await adapter.bulkCreatePersonas((request.body as any));
      reply.code(201).send(personas);
    }
  );

  // ============ Persona Group Routes ============

  // Create group
  app.post(
    '/groups',
    {
      schema: {
        body: createPersonaGroupSchema,
        response: {
          201: personaGroupResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const group = await adapter.createPersonaGroup((request.body as any));
      reply.code(201).send(group);
    }
  );

  // Get group by ID
  app.get(
    '/groups/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: personaGroupResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const group = await adapter.getPersonaGroup((request.params as any).id);
      if (!group) {
        reply.code(404).send({ error: 'Group not found' });
        return;
      }
      reply.send(group);
    }
  );

  // Update group
  app.patch(
    '/groups/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: updatePersonaGroupSchema,
        response: {
          200: personaGroupResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const group = await adapter.updatePersonaGroup((request.params as any).id, (request.body as any));
      if (!group) {
        reply.code(404).send({ error: 'Group not found' });
        return;
      }
      reply.send(group);
    }
  );

  // Delete group
  app.delete(
    '/groups/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.null(),
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deleted = await adapter.deletePersonaGroup((request.params as any).id);
      if (!deleted) {
        reply.code(404).send({ error: 'Group not found' });
        return;
      }
      reply.code(204).send();
    }
  );

  // Query groups
  app.get(
    '/groups',
    {
      schema: {
        querystring: personaGroupQuerySchema,
        response: {
          200: paginatedResponseSchema(personaGroupResponseSchema),
        },
      },
    },
    async (request) => {
      return adapter.queryPersonaGroups((request.query as any));
    }
  );

  // Get group with members
  app.get(
    '/groups/:id/members',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({
            group_id: z.string(),
            group_name: z.string(),
            group_description: z.string().nullable(),
            personas: z.array(personaResponseSchema),
          }),
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await adapter.getPersonaGroupWithMembers((request.params as any).id);
      if (!result) {
        reply.code(404).send({ error: 'Group not found' });
        return;
      }
      reply.send(result);
    }
  );

  // ============ Group Membership Routes ============

  // Add persona to group
  app.post(
    '/memberships',
    {
      schema: {
        body: addToGroupSchema,
        response: {
          201: z.object({ success: z.boolean() }),
          400: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const success = await adapter.addPersonaToGroup(
        (request.body as any).personaId,
        (request.body as any).groupId
      );
      reply.code(201).send({ success });
    }
  );

  // Remove persona from group
  app.delete(
    '/memberships',
    {
      schema: {
        body: removeFromGroupSchema,
        response: {
          200: z.object({ success: z.boolean() }),
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const success = await adapter.removePersonaFromGroup(
        (request.body as any).personaId,
        (request.body as any).groupId
      );
      if (!success) {
        reply.code(404).send({ error: 'Membership not found' });
        return;
      }
      reply.send({ success });
    }
  );

  // Get persona's groups
  app.get(
    '/personas/:id/groups',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.array(personaGroupResponseSchema),
        },
      },
    },
    async (request) => {
      return adapter.getPersonaGroups((request.params as any).id);
    }
  );

  // ============ Stats Route ============

  app.get(
    '/stats',
    {
      schema: {
        response: {
          200: statsResponseSchema,
        },
      },
    },
    async () => {
      return adapter.getStats();
    }
  );

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    if (error.validation || error.statusCode === 400) {
      reply.code(400).send({
        error: error.message || 'Validation error',
        details: error.validation,
      });
      return;
    }

    // Check for specific database errors
    const message = error.message || 'Internal server error';
    if (message.includes('connection') || 
        message.includes('timeout') || 
        message.includes('constraint')) {
      reply.code(500).send({
        error: message,
        code: 'DATABASE_ERROR',
      });
      return;
    }

    reply.code(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });

  return app;
}

// Convenience function to start the server
export async function startServer(options: ServerOptions): Promise<FastifyInstance> {
  const app = await createServer(options);
  const port = options.port ?? 3000;
  const host = options.host ?? '0.0.0.0';

  await app.listen({ port, host });
  return app;
}

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresAdapter;
  }
}

// Import for Zod types
import { z } from 'zod';