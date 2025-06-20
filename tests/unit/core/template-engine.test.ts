import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { TemplateEngine } from '../../../src/core/template-engine.js';

vi.mock('fs-extra');

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  const mockTemplateDir = '/mock/templates';
  const mockOutputDir = '/mock/output';

  beforeEach(() => {
    templateEngine = new TemplateEngine();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generate', () => {
    it('should generate project from template', async () => {
      const config = {
        projectName: 'Developer Tools',
        description: 'Developer-tools-CLI-with-comprehensive-testing-and-deployment-pipeline',
        author: 'Soutrik Mukherjee',
        license: 'Soutrik Mukherjee',
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(['file1.ts.hbs', 'file2.json'] as any);
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false, isFile: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue('{{projectName}}');
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.copy).mockResolvedValue(undefined);

      await templateEngine.generate('node-typescript', mockOutputDir, config);

      expect(fs.ensureDir).toHaveBeenCalledWith(mockOutputDir);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should throw error if template not found', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      await expect(
        templateEngine.generate('non-existent', mockOutputDir, {} as any)
      ).rejects.toThrow('Template "non-existent" not found');
    });
  });

  describe('listTemplates', () => {
    it('should return list of available templates', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['template1', 'template2', 'file.txt'] as any);
      vi.mocked(fs.stat).mockImplementation(async (path) => ({
        isDirectory: () => !path.toString().includes('.txt'),
        isFile: () => path.toString().includes('.txt'),
      } as any));

      const templates = await templateEngine.listTemplates();

      expect(templates).toEqual(['template1', 'template2']);
    });
  });
});
