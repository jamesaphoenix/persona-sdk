/**
 * Database configuration
 */

import { z } from 'zod';

export const DatabaseConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().positive().default(5432),
  database: z.string().default('persona_db'),
  user: z.string().default('persona'),
  password: z.string().default('persona_secret'),
  ssl: z.boolean().default(false),
  maxConnections: z.number().int().positive().default(20),
  idleTimeoutMillis: z.number().int().positive().default(30000),
  connectionTimeoutMillis: z.number().int().positive().default(2000),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export function loadDatabaseConfig(): DatabaseConfig {
  return DatabaseConfigSchema.parse({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'persona_db',
    user: process.env.DB_USER || 'persona',
    password: process.env.DB_PASSWORD || 'persona_secret',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: process.env.DB_MAX_CONNECTIONS 
      ? parseInt(process.env.DB_MAX_CONNECTIONS, 10) 
      : 20,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT 
      ? parseInt(process.env.DB_IDLE_TIMEOUT, 10)
      : 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT
      ? parseInt(process.env.DB_CONNECTION_TIMEOUT, 10)
      : 2000,
  });
}