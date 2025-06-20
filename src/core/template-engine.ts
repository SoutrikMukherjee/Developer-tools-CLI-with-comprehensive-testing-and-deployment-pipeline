import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { logger } from './logger.js';
import { pluginManager } from './plugin-manager.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface TemplateConfig {
  projectName: string;
  description: string;
  author: string;
  license: string;
  typescript?: boolean;
  testing?: boolean;
  ci?: boolean;
  [key: string]: any;
}

export class TemplateEngine {
  private templatesDir: string;
  private handlebars: typeof Handlebars;

  constructor() {
    this.templatesDir = path.join(__dirname, '../../templates');
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers() {
    this.handlebars.registerHelper('if', function(conditional, options) {
      if (conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    this.handlebars.registerHelper('unless', function(conditional, options) {
      if (!conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    this.handlebars.registerHelper('kebabCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });

    this.handlebars.registerHelper('camelCase', (str: string) => {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    });
  }

  async generate(templateName: string, outputPath: string, config: TemplateConfig) {
    const templatePath = path.join(this.templatesDir, templateName);

    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template "${templateName}" not found`);
    }

    // Execute plugin hooks
    const modifiedConfig = await this.executePluginHooks('beforeCreate', config);

    // Create output directory
    await fs.ensureDir(outputPath);

    // Process template files
    await this.processDirectory(templatePath, outputPath, modifiedConfig);

    // Execute plugin hooks
    await this.executePluginHooks('afterCreate', outputPath, modifiedConfig);

    logger.debug(`Generated project from template "${templateName}" at ${outputPath}`);
  }

  private async processDirectory(srcDir: string, destDir: string, config: TemplateConfig) {
    const items = await fs.readdir(srcDir);

    for (const item of items) {
      const srcPath = path.join(srcDir, item);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        const destPath = path.join(destDir, item);
        await fs.ensureDir(destPath);
        await this.processDirectory(srcPath, destPath, config);
      } else if (stat.isFile()) {
        await this.processFile(srcPath, destDir, config);
      }
    }
  }

  private async processFile(srcPath: string, destDir: string, config: TemplateConfig) {
    const filename = path.basename(srcPath);
    
    if (filename.endsWith('.hbs')) {
      // Process Handlebars template
      const templateContent = await fs.readFile(srcPath, 'utf-8');
      const compiled = this.handlebars.compile(templateContent);
      const result = compiled(config);
      
      const outputFilename = filename.replace('.hbs', '');
      const outputPath = path.join(destDir, outputFilename);
      
      await fs.writeFile(outputPath, result);
      logger.debug(`Processed template: ${outputFilename}`);
    } else {
      // Copy file as-is
      const destPath = path.join(destDir, filename);
      await fs.copy(srcPath, destPath);
      logger.debug(`Copied file: ${filename}`);
    }
  }

  private async executePluginHooks(hookName: string, ...args: any[]) {
    const results = await pluginManager.executeHook(hookName as any, ...args);
    
    if (hookName === 'beforeCreate' && results.length > 0) {
      // Merge all plugin config modifications
      return Object.assign({}, ...results);
    }
    
    return args[0];
  }

  async listTemplates(): Promise<string[]> {
    const templates = await fs.readdir(this.templatesDir);
    return templates.filter(async (item) => {
      const stat = await fs.stat(path.join(this.templatesDir, item));
      return stat.isDirectory();
    });
  }

  async addTemplate(name: string, sourcePath: string) {
    const destPath = path.join(this.templatesDir, name);
    
    if (await fs.pathExists(destPath)) {
      throw new Error(`Template "${name}" already exists`);
    }

    await fs.copy(sourcePath, destPath);
    logger.info(`Added template "${name}"`);
  }

  async removeTemplate(name: string) {
    const templatePath = path.join(this.templatesDir, name);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template "${name}" not found`);
    }

    await fs.remove(templatePath);
    logger.info(`Removed template "${name}"`);
  }
}
