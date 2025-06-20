import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { logger } from '../core/logger.js';

export const configCommand = new Command('config')
  .description('Manage DevForge configuration interactively')
  .option('-g, --global', 'Edit global configuration')
  .action(async (options) => {
    try {
      const currentConfig = configManager.getAll();
      
      console.log(chalk.blue('🔧 DevForge Configuration\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'author',
          message: 'Default author name:',
          default: currentConfig.author || '',
        },
        {
          type: 'list',
          name: 'license',
          message: 'Default license:',
          choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'],
          default: currentConfig.license || 'MIT',
        },
        {
          type: 'input',
          name: 'registry',
          message: 'NPM registry URL:',
          default: currentConfig.registry || 'https://registry.npmjs.org',
        },
        {
          type: 'list',
          name: 'defaultTemplate',
          message: 'Default project template:',
          choices: ['node-typescript', 'react-vite', 'express-api'],
          default: currentConfig.defaultTemplate || 'node-typescript',
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Default features to include:',
          choices: [
            { name: 'TypeScript', value: 'typescript', checked: true },
            { name: 'Testing', value: 'testing', checked: true },
            { name: 'CI/CD', value: 'ci', checked: true },
            { name: 'Docker', value: 'docker' },
            { name: 'Kubernetes', value: 'k8s' },
          ],
        },
        {
          type: 'confirm',
          name: 'telemetry',
          message: 'Enable anonymous usage statistics?',
          default: false,
        },
      ]);

      await configManager.save(answers, options.global);
      
      console.log(chalk.green('\n✅ Configuration saved successfully!'));
      
    } catch (error) {
      logger.error('Failed to update configuration:', error);
      process.exit(1);
    }
  });

// Add to src/index.ts
// import { configCommand } from './commands/config.js';
// program.addCommand(configCommand);
