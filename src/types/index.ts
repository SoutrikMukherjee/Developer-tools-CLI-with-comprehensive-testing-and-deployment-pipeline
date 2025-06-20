export interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  license: string;
  version: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
  tags?: string[];
  requirements?: {
    node?: string;
    npm?: string;
  };
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  devforge: {
    version: string;
    hooks?: string[];
  };
}

export interface CLIOptions {
  verbose?: boolean;
  quiet?: boolean;
  yes?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

export interface HookContext {
  projectPath: string;
  config: ProjectConfig;
  options: CLIOptions;
}

export type HookFunction = (context: HookContext) => Promise<void>;

export interface PluginHooks {
  beforeCreate?: HookFunction;
  afterCreate?: HookFunction;
  beforeBuild?: HookFunction;
  afterBuild?: HookFunction;
  beforeInstall?: HookFunction;
  afterInstall?: HookFunction;
}
