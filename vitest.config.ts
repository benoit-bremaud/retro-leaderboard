import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      // Ratchet: raise, never lower. The owner's hard floor for every project is 80 %.
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
