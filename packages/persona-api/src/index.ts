import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { personaRoutes } from './routes/personas.js';
import { insightsRoutes } from './routes/insights.js';
import { healthRoutes } from './routes/health.js';
import { errorHandler } from './plugins/error-handler.js';
import { config } from './utils/config.js';

const buildServer = () => {
  const server = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  // Security plugins
  server.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false,
  });

  server.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger documentation
  server.register(swagger, {
    openapi: {
      info: {
        title: 'Persona SDK API',
        description: 'Generate personas and AI-powered insights via REST API',
        version: '1.0.0',
      },
      servers: [{
        url: config.API_URL,
        description: config.NODE_ENV === 'production' ? 'Production' : 'Development',
      }],
      tags: [
        { name: 'personas', description: 'Persona generation and management' },
        { name: 'insights', description: 'AI-powered analysis and insights' },
        { name: 'health', description: 'Health checks and monitoring' },
      ],
    },
  });

  server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Custom plugins
  server.register(errorHandler);

  // Routes
  server.register(healthRoutes, { prefix: '/health' });
  server.register(personaRoutes, { prefix: '/api/v1/personas' });
  server.register(insightsRoutes, { prefix: '/api/v1/insights' });

  // Welcome route
  server.get('/', async () => ({
    message: '🚀 Welcome to Persona SDK API',
    version: '1.0.0',
    docs: '/docs',
    health: '/health',
    endpoints: {
      personas: '/api/v1/personas',
      insights: '/api/v1/insights',
    },
  }));

  return server;
};

const start = async () => {
  const server = buildServer();
  
  try {
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    });
    
    console.log(`
🚀 Persona SDK API is live!
📍 Server: ${config.API_URL}
📚 Docs: ${config.API_URL}/docs
🔥 Environment: ${config.NODE_ENV}
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Start the server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { buildServer };