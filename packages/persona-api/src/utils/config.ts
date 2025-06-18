import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  API_URL: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGIN: z.union([z.string(), z.boolean()]).default(true),
  OPENAI_API_KEY: z.string().optional(),
  MOCK_OPENAI: z.string().transform(val => val === 'true').default('false'),
});

// Parse and validate environment variables
const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid configuration:', error);
    process.exit(1);
  }
};

export const config = parseConfig();

// Helper to check if we're in test mode
export const isTestMode = () => config.NODE_ENV === 'test' || config.MOCK_OPENAI;