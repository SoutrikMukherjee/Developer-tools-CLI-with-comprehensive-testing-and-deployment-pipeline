import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';
import { TemplateEngine } from '../../src/core/template-engine.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Performance Benchmarks', () => {
  const tempDir = path.join(os.tmpdir(), 'devforge-perf-test');

  it('should generate templates quickly', async () => {
    const engine = new TemplateEngine();
    const outputPath = path.join(tempDir, 'perf-test');
    
    await fs.ensureDir(tempDir);
    
    const start = performance.now();
    
    await engine.generate('node-typescript', outputPath, {
      projectName: 'perf-test',
      description: 'Performance test',
      author: 'Test',
      license: 'MIT'
    });
    
    const duration = performance.now() - start;
    
    // Template generation should be fast (under 100ms)
    expect(duration).toBeLessThan(100);
    
    await fs.remove(tempDir);
  });

  it('should handle large file operations efficiently', async () => {
    const testFile = path.join(tempDir, 'large-file.txt');
    await fs.ensureDir(tempDir);
    
    // Create a 10MB file
    const size = 10 * 1024 * 1024;
    const buffer = Buffer.alloc(size, 'a');
    
    const writeStart = performance.now();
    await fs.writeFile(testFile, buffer);
    const writeDuration = performance.now() - writeStart;
    
    // Should write 10MB in under 500ms
    expect(writeDuration).toBeLessThan(500);
    
    const readStart = performance.now();
    await fs.readFile(testFile);
    const readDuration = performance.now() - readStart;
    
    // Should read 10MB in under 200ms
    expect(readDuration).toBeLessThan(200);
    
    await fs.remove(tempDir);
  });
});
