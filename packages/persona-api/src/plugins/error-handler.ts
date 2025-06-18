import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyError } from 'fastify';
import { ZodError } from 'zod';

interface ApiError extends FastifyError {
  validation?: any;
}

const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: ApiError, request, reply) => {
    // Log error details
    request.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
      },
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation error',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation error',
        details: error.validation,
      });
    }

    // Handle known API errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 
      ? 'Internal server error' 
      : error.message;

    return reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Error',
      message,
    });
  });

  // Handle 404s
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
};

export default fp(errorHandler, {
  name: 'error-handler',
});

export { errorHandler };