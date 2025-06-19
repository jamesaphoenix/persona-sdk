/**
 * PostgreSQL database plugin for Fastify
 */

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import pg from 'pg';
import { loadDatabaseConfig } from '../config/database.js';
import { PgDatabaseClient, PostgresAdapter } from '@jamesaphoenix/persona-sdk';

const { Pool } = pg;

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      pool: pg.Pool;
      client: PgDatabaseClient;
      adapter: PostgresAdapter;
    };
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  const config = loadDatabaseConfig();
  
  // Create connection pool
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl,
    max: config.maxConnections,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    fastify.log.info('Database connection established');
  } catch (error) {
    fastify.log.error('Failed to connect to database:', error);
    throw error;
  }

  // Create database client and adapter
  const dbClient = new PgDatabaseClient({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl,
    poolSize: config.maxConnections
  });
  const adapter = new PostgresAdapter(dbClient);

  // Note: Database schema should be initialized separately via migrations
  // The adapter assumes the schema already exists

  // Decorate fastify instance
  fastify.decorate('db', {
    pool,
    client: dbClient,
    adapter,
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await pool.end();
    fastify.log.info('Database connections closed');
  });
};

export default fp(databasePlugin, {
  name: 'database',
  dependencies: [],
});