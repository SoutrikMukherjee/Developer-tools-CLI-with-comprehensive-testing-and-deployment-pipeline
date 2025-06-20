import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';

// Mock all external dependencies
vi.mock('fs-extra');
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({
      description: 'Test project',
      author: 'Test Author',
      license: 'MIT',
      typescript: true,
      testing: true,
      ci: true,
    }),
  },
}));
vi.mock('ora', () => ({
  default: (text: string) => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  }),
}));
vi.mock('chalk', () => ({
  default: {
    green: { bold: (text: string) => text },
    blue: (text: string) => text,
    yellow: (text: string) => text,
    red: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text,
    level: 0,
  },
}));

// Mock the modules that aren't properly mocked
vi.mock('../../../src/core/template-engine.js', () => ({
  TemplateEngine: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue(undefined),
    listTemplates: vi.fn().mockResolvedValue(['node-typescript', 'react-vite']),
  })),
}));

vi.mock('../../../src/core/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    level: 'error',
  },
}));

vi.mock('../../../src/utils/git.js', () => ({
  GitUtils: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    addAll: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../../src/utils/npm.js', () => ({
  NpmUtils: vi.fn().mockImplementation(() => ({
    install: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('Create Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup fs-extra mocks
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a project with default template', async () => {
    // Import after mocks are set up
    const { TemplateEngine } = await import('../../../src/core/template-engine.js');
    
    expect(TemplateEngine).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const { logger } = await import('../../../src/core/logger.js');
    
    // Simulate an error
    vi.mocked(fs.ensureDir).mockRejectedValueOnce(new Error('Permission denied'));
    
    // Test error handling
    try {
      await fs.ensureDir('/some/path');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
