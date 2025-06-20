import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],  // Add setup file
    testTimeout: 10000,  // 10 second timeout
    hookTimeout: 10000,
    bail: 1,  // Stop after first test failure in CI
    pool: 'forks',  // Use forks instead of threads for better isolation
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        'scripts/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
