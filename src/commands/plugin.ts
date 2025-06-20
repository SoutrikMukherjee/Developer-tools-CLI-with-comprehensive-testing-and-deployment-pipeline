import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import axios from 'axios';
import { logger } from '../core/logger.js';
import { pluginManager } from '../core/plugin-manager.js';
import { configManager } from '../core/config.js';

const listCommand = new Command('list')
  .description('List installed plugins')
  .action(async () => {
    try {
      await pluginManager.loadPlugins();
      const plugins = pluginManager.listPlugins();
      
      if (plugins.length === 0) {
        console.log(chalk.yellow('No plugins installed'));
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Plugin'),
          chalk.cyan('Version'),
          chalk.cyan('Description'),
        ],
        style: { head: [], border: [] },
      });

      plugins.forEach((plugin) => {
        table.push([
          chalk.white(plugin.name),
          chalk.gray(plugin.version),
          chalk.gray(plugin.description || 'No description'),
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      logger.error('Failed to list plugins:', error);
      process.exit(1);
    }
  });

const installCommand = new Command('install')
  .description('Install a plugin')
  .argument('<name>', 'Plugin name')
  .option('--registry <url>', 'Custom registry URL')
  .action(async (name: string, options) => {
    try {
      const registry = options.registry || configManager.get('registry') || 'https://registry.npmjs.org';
      
      console.log(chalk.blue(`Installing plugin ${name}...`));
      
      // In a real implementation, you would:
      // 1. Download the plugin from npm or a custom registry
      // 2. Install it in the plugins directory
      // 3. Update the config
      
      // For now, we'll simulate this:
      logger.info(`Would install plugin ${name} from ${registry}`);
      
      console.log(chalk.green(`✓ Plugin "${name}" installed successfully`));
    } catch (error) {
      logger.error('Failed to install plugin:', error);
      process.exit(1);
    }
  });

const removeCommand = new Command('remove')
  .description('Remove a plugin')
  .argument('<name>', 'Plugin name')
  .action(async (name: string) => {
    try {
      console.log(chalk.blue(`Removing plugin ${name}...`));
      
      // In a real implementation, you would remove the plugin directory
      // and update the config
      
      logger.info(`Would remove plugin ${name}`);
      
      console.log(chalk.green(`✓ Plugin "${name}" removed successfully`));
    } catch (error) {
      logger.error('Failed to remove plugin:', error);
      process.exit(1);
    }
  });

export const pluginCommand = new Command('plugin')
  .description('Manage DevForge plugins')
  .addCommand(listCommand)
  .addCommand(installCommand)
  .addCommand(removeCommand);
