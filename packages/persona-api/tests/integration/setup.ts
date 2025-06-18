import { beforeAll, afterAll } from 'vitest';

// Set test environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.MOCK_OPENAI = 'true';
  process.env.LOG_LEVEL = 'error';
  process.env.PORT = '0'; // Use random port for tests
});

// Cleanup
afterAll(() => {
  // Any cleanup needed
});