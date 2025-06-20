import { beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
  
  // Mock console methods to reduce noise
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterAll(async () => {
  // Clean up any test files
  const tempDir = path.join(os.tmpdir(), 'devforge-test*');
  try {
    const dirs = await fs.readdir(os.tmpdir());
    for (const dir of dirs) {
      if (dir.startsWith('devforge-test')) {
        await fs.remove(path.join(os.tmpdir(), dir));
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Increase timeout for CI environment
if (process.env.CI) {
  vi.setConfig({ testTimeout: 20000 });
}
