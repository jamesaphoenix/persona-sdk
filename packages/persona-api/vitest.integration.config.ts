import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    setupFiles: ['./tests/integration/setup.ts'],
  },
});