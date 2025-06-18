/**
 * Fastify API Server for Persona SDK
 */
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { DatabaseClient } from '../adapters/postgres/adapter.js';
export interface ServerOptions {
    databaseClient: DatabaseClient;
    port?: number;
    host?: string;
    cors?: boolean;
    swagger?: boolean;
    logger?: boolean;
}
export declare function createServer(options: ServerOptions): Promise<import("fastify").FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, ZodTypeProvider>>;
export declare function startServer(options: ServerOptions): Promise<import("fastify").FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, ZodTypeProvider>>;
//# sourceMappingURL=server.d.ts.map