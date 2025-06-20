import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('CLI Integration Tests', () => {
  let testDir: string;
  const cli = path.join(process.cwd(), 'dist/index.js');

  beforeAll(async () => {
    // Build before running tests
    if (!await fs.pathExists(cli)) {
      console.log('Building CLI...');
      execSync('npm run build', { 
        cwd: process.cwd(),
        stdio: 'inherit'  // Show build output
      });
    }
  });

  beforeEach(async () => {
    // Create unique test directory for each test
    testDir = path.join(os.tmpdir(), `devforge-test-${Date.now()}`);
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    // Cleanup
    if (testDir && await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  it('should display help information', () => {
    const output = execSync(`node ${cli} --help`, {
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' }  // Disable colors in CI
    });
    
    expect(output).toContain('devforge');
    expect(output).toContain('create');
    expect(output).toContain('init');
  }, 20000); // Increase timeout

  it('should create a new project', async () => {
    const projectName = 'test-project';
    const projectPath = path.join(testDir, projectName);
    
    const output = execSync(
      `node ${cli} create ${projectName} --no-git --no-install -y`,
      {
        cwd: testDir,
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' }
      }
    );
    
    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
  }, 30000); // Increase timeout for project creation
});
