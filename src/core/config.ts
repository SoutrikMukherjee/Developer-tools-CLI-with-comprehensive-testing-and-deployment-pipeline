import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { logger } from './logger.js';

export interface DevForgeConfig {
  author?: string;
  license?: string;
  templateDir?: string;
  plugins?: string[];
  registry?: string;
  defaultTemplate?: string;
}

class ConfigManager {
  private config: DevForgeConfig = {};
  private configPath: string;
  private globalConfigPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), '.devforgerc');
    this.globalConfigPath = path.join(os.homedir(), '.devforgerc');
  }

  async load(): Promise<DevForgeConfig> {
    // Load environment variables
    dotenv.config();

    // Load global config
    if (await fs.pathExists(this.globalConfigPath)) {
      const globalConfig = await fs.readJson(this.globalConfigPath);
      this.config = { ...this.config, ...globalConfig };
      logger.debug('Loaded global config');
    }

    // Load local config
    if (await fs.pathExists(this.configPath)) {
      const localConfig = await fs.readJson(this.configPath);
      this.config = { ...this.config, ...localConfig };
      logger.debug('Loaded local config');
    }

    // Apply environment variable overrides
    if (process.env.DEVFORGE_AUTHOR) {
      this.config.author = process.env.DEVFORGE_AUTHOR;
    }
    if (process.env.DEVFORGE_LICENSE) {
      this.config.license = process.env.DEVFORGE_LICENSE;
    }
    if (process.env.DEVFORGE_TEMPLATE_DIR) {
      this.config.templateDir = process.env.DEVFORGE_TEMPLATE_DIR;
    }

    return this.config;
  }

  async save(config: DevForgeConfig, global = false): Promise<void> {
    const targetPath = global ? this.globalConfigPath : this.configPath;
    await fs.writeJson(targetPath, config, { spaces: 2 });
    logger.info(`Saved config to ${targetPath}`);
  }

  get(key: keyof DevForgeConfig): any {
    return this.config[key];
  }

  set(key: keyof DevForgeConfig, value: any): void {
    this.config[key] = value;
  }

  getAll(): DevForgeConfig {
    return { ...this.config };
  }
}

export const configManager = new ConfigManager();

export async function loadConfig(): Promise<DevForgeConfig> {
  return configManager.load();
}
