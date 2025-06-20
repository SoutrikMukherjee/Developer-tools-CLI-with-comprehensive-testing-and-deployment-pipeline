import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../core/logger.js';
import { configManager } from '../core/config.js';
import { GitUtils } from '../utils/git.js';
import { NpmUtils } from '../utils/npm.js';

export const initCommand = new Command('init')
  .description('Initialize DevForge in an existing project')
  .option('--force', 'Overwrite existing configuration')
  .action(async (options) => {
    try {
      const currentDir = process.cwd();
      const configPath = path.join(currentDir, '.devforgerc');

      // Check if config already exists
      if (await fs.pathExists(configPath) && !options.force) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'DevForge config already exists. Overwrite?',
            default: false,
          },
        ]);

        if (!overwrite) {
          logger.info('Initialization cancelled');
          return;
        }
      }

      // Gather project information
      const packageJsonPath = path.join(currentDir, 'package.json');
      let packageJson: any = {};
      
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'author',
          message: 'Author name:',
          default: packageJson.author || configManager.get('author') || '',
        },
        {
          type: 'list',
          name: 'license',
          message: 'License:',
          choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'None'],
          default: packageJson.license || 'MIT',
        },
        {
          type: 'input',
          name: 'defaultTemplate',
          message: 'Default template:',
          default: 'node-typescript',
        },
        {
          type: 'confirm',
          name: 'setupGit',
          message: 'Setup git hooks?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'setupLinting',
          message: 'Setup linting?',
          default: true,
        },
      ]);

      const spinner = ora('Initializing DevForge...').start();

      // Create config
      const config = {
        author: answers.author,
        license: answers.license,
        defaultTemplate: answers.defaultTemplate,
        plugins: [],
      };

      await configManager.save(config);
      spinner.succeed('Created DevForge configuration');

      // Setup git hooks if requested
      if (answers.setupGit) {
        spinner.start('Setting up git hooks...');
        const git = new GitUtils(currentDir);
        
        if (await git.isGitRepository()) {
          // Add pre-commit hook
          const hooksDir = path.join(currentDir, '.git', 'hooks');
          const preCommitPath = path.join(hooksDir, 'pre-commit');
          
          const preCommitContent = `#!/bin/sh
npm run lint
npm test`;
          
          await fs.writeFile(preCommitPath, preCommitContent);
          await fs.chmod(preCommitPath, '755');
          
          spinner.succeed('Git hooks configured');
        } else {
          spinner.warn('Not a git repository - skipping git hooks');
        }
      }

      // Setup linting if requested
      if (answers.setupLinting) {
        spinner.start('Setting up linting...');
        const npm = new NpmUtils(currentDir);
        
        await npm.installDev([
          'eslint',
          '@typescript-eslint/eslint-plugin',
          '@typescript-eslint/parser',
          'prettier',
          'eslint-config-prettier',
        ]);

        // Create .eslintrc.json
        const eslintConfig = {
          parser: '@typescript-eslint/parser',
          plugins: ['@typescript-eslint'],
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'prettier',
          ],
          rules: {
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
          },
        };

        await fs.writeJson(path.join(currentDir, '.eslintrc.json'), eslintConfig, { spaces: 2 });

        // Create .prettierrc
        const prettierConfig = {
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 100,
          tabWidth: 2,
        };

        await fs.writeJson(path.join(currentDir, '.prettierrc'), prettierConfig, { spaces: 2 });

        spinner.succeed('Linting configured');
      }

      // Success message
      console.log();
      console.log(chalk.green.bold('✨ DevForge initialized successfully!'));
      console.log();
      console.log('You can now use DevForge commands in this project.');
      console.log();

    } catch (error) {
      logger.error('Failed to initialize:', error);
      process.exit(1);
    }
  });
