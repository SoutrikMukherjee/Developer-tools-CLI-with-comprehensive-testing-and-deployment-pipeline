import path from 'path';
import fs from 'fs-extra';
import { logger } from './logger.js';
import { cache } from './cache.js';

export interface Plugin {
  name: string;
  version: string;
  description: string;
  hooks: {
    beforeCreate?: (config: any) => Promise<any>;
    afterCreate?: (projectPath: string, config: any) => Promise<void>;
    beforeBuild?: (config: any) => Promise<any>;
    afterBuild?: (config: any) => Promise<void>;
  };
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginsDir: string;

  constructor() {
    this.pluginsDir = path.join(process.cwd(), 'plugins');
  }

  async loadPlugins() {
    try {
      if (!await fs.pathExists(this.pluginsDir)) {
        return;
      }

      const pluginDirs = await fs.readdir(this.pluginsDir);
      
      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDir, dir);
        const stat = await fs.stat(pluginPath);
        
        if (stat.isDirectory()) {
          await this.loadPlugin(pluginPath);
        }
      }
    } catch (error) {
      logger.error('Failed to load plugins:', error);
    }
  }

  private async loadPlugin(pluginPath: string) {
    try {
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const indexPath = path.join(pluginPath, 'index.js');

      if (!await fs.pathExists(packageJsonPath) || !await fs.pathExists(indexPath)) {
        return;
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const plugin = await import(indexPath);

      if (plugin.default && typeof plugin.default === 'object') {
        const pluginInstance: Plugin = {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          hooks: plugin.default.hooks || {}
        };

        this.plugins.set(pluginInstance.name, pluginInstance);
        logger.debug(`Loaded plugin: ${pluginInstance.name}`);
      }
    } catch (error) {
      logger.error(`Failed to load plugin from ${pluginPath}:`, error);
    }
  }

  async executeHook(hookName: keyof Plugin['hooks'], ...args: any[]) {
    const results = [];
    
    for (const [name, plugin] of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (hook) {
        try {
          logger.debug(`Executing ${hookName} hook for plugin ${name}`);
          const result = await hook(...args);
          results.push(result);
        } catch (error) {
          logger.error(`Plugin ${name} hook ${hookName} failed:`, error);
        }
      }
    }
    
    return results;
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();
