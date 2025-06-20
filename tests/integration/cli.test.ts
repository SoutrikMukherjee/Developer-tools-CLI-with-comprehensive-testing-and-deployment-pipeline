import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('CLI Integration Tests', () => {
  const testDir = path.join(os.tmpdir(), 'devforge-test');
  const cli = path.join(process.cwd(), 'dist/index.js');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
    execSync('npm run build', { cwd: process.cwd() });
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('should display help information', () => {
    const output = execSync(`node ${cli} --help`).toString();
    expect(output).toContain('devforge');
    expect(output).toContain('create');
    expect(output).toContain('init');
  });

  it('should create a new project', async () => {
    const projectName = 'test-project';
    const projectPath = path.join(testDir, projectName);
    
    execSync(`node ${cli} create ${projectName} --no-git --no-install -y`, {
      cwd: testDir
    });
    
    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
  });
});
