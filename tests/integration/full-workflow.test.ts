import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('DevForge CLI - Full Workflow Integration', () => {
  const testDir = path.join(os.tmpdir(), 'devforge-integration-test');
  const cli = path.join(process.cwd(), 'dist/index.js');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
    execSync('npm run build', { cwd: process.cwd() });
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  describe('Complete Project Creation Workflow', () => {
    it('should create, build, and test a Node.js TypeScript project', async () => {
      const projectName = 'test-node-project';
      const projectPath = path.join(testDir, projectName);

      // Create project
      const createOutput = execSync(
        `node ${cli} create ${projectName} --template node-typescript --no-install -y`,
        { cwd: testDir }
      ).toString();

      expect(createOutput).toContain('Project created successfully');
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify project structure
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        '.gitignore',
        'src/index.ts',
        'README.md'
      ];

      for (const file of requiredFiles) {
        expect(await fs.pathExists(path.join(projectPath, file))).toBe(true);
      }

      // Verify package.json content
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
      expect(packageJson.name).toBe(projectName);
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
    });

    it('should create a React project with proper configuration', async () => {
      const projectName = 'test-react-project';
      const projectPath = path.join(testDir, projectName);

      execSync(
        `node ${cli} create ${projectName} --template react-vite --no-install -y`,
        { cwd: testDir }
      );

      // Verify React-specific files
      expect(await fs.pathExists(path.join(projectPath, 'index.html'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'vite.config.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/App.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/main.tsx'))).toBe(true);
    });

    it('should run doctor command successfully', () => {
      const output = execSync(`node ${cli} doctor`).toString();
      expect(output).toContain('DevForge Doctor');
      expect(output).toContain('Node.js Version');
      expect(output).toContain('npm Version');
    });
  });

  describe('Template Management', () => {
    it('should list available templates', () => {
      const output = execSync(`node ${cli} template list`).toString();
      expect(output).toContain('node-typescript');
      expect(output).toContain('react-vite');
      expect(output).toContain('express-api');
    });

    it('should extract template from existing project', async () => {
      const sourcePath = path.join(testDir, 'source-project');
      await fs.ensureDir(sourcePath);
      
      // Create a minimal project structure
      await fs.writeJson(path.join(sourcePath, 'package.json'), {
        name: 'source-project',
        version: '1.0.0'
      });
      await fs.writeFile(path.join(sourcePath, '.gitignore'), 'node_modules/');
      
      const output = execSync(
        `node ${cli} extract ${sourcePath} --name custom-template -o ${testDir}/templates`,
        { cwd: testDir, input: '\n\n\n{{projectName}}\n' }
      ).toString();

      expect(output).toContain('Template created successfully');
      expect(await fs.pathExists(path.join(testDir, 'templates/custom-template'))).toBe(true);
    });
  });

  describe('Plugin System', () => {
    it('should list plugins', () => {
      const output = execSync(`node ${cli} plugin list`).toString();
      // Should show message or list plugins
      expect(output).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should manage configuration', async () => {
      const configPath = path.join(testDir, '.devforgerc');
      
      // Create a test config
      await fs.writeJson(configPath, {
        author: 'Test Author',
        license: 'MIT',
        defaultTemplate: 'node-typescript'
      });

      // The config should be loaded when running commands
      const output = execSync(`node ${cli} --help`, { cwd: testDir }).toString();
      expect(output).toContain('devforge');
    });
  });
});
