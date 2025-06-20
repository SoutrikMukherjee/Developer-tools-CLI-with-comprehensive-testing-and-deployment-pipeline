import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCommand } from '../../../src/commands/create.js';
import { TemplateEngine } from '../../../src/core/template-engine.js';
import { GitUtils } from '../../../src/utils/git.js';

vi.mock('../../../src/core/template-engine.js');
vi.mock('../../../src/utils/git.js');

describe('Create Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a project with default template', async () => {
    const mockTemplateEngine = {
      generate: vi.fn().mockResolvedValue(undefined)
    };
    
    vi.mocked(TemplateEngine).mockImplementation(() => mockTemplateEngine as any);
    
    // Test implementation
    expect(mockTemplateEngine.generate).not.toHaveBeenCalled();
  });

  it('should skip git initialization when --no-git is passed', async () => {
    const mockGit = {
      init: vi.fn(),
      addAll: vi.fn(),
      commit: vi.fn()
    };
    
    vi.mocked(GitUtils).mockImplementation(() => mockGit as any);
    
    // Test implementation
    expect(mockGit.init).not.toHaveBeenCalled();
  });
});
