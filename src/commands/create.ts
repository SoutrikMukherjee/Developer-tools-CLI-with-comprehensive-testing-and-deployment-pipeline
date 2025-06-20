import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import { logger } from '../core/logger.js';
import { TemplateEngine } from '../core/template-engine.js';
import { GitUtils } from '../utils/git.js';
import { NpmUtils } from '../utils/npm.js';
import { validateProjectName } from '../utils/validation.js';
import { cache } from '../core/cache.js';

export const createCommand = new Command('create')
  .description('Create a new project from a template')
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --template <template>', 'Template to use', 'node-typescript')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName: string, options) => {
    try {
      // Validate project name
      const validation = validateProjectName(projectName);
      if (!validation.valid) {
        logger.error(`Invalid project name: ${validation.message}`);
        process.exit(1);
      }

      const projectPath = path.join(process.cwd(), projectName);
      
      // Interactive mode
      let config = {
        projectName,
        template: options.template,
        author: '',
        description: '',
        license: 'MIT',
        git: options.git,
        install: options.install,
      };

      if (!options.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'description',
            message: 'Project description:',
            default: 'A new DevForge project',
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: cache.get('author') || '',
          },
          {
            type: 'list',
            name: 'license',
            message: 'Choose a license:',
            choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'None'],
            default: 'MIT',
          },
          {
            type: 'confirm',
            name: 'typescript',
            message: 'Use TypeScript?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'testing',
            message: 'Include testing setup?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'ci',
            message: 'Setup CI/CD pipeline?',
            default: true,
          },
        ]);

        config = { ...config, ...answers };
        
        // Cache author for future use
        if (answers.author) {
          cache.set('author', answers.author);
        }
      }

      // Create project
      const spinner = ora('Creating project...').start();

      const templateEngine = new TemplateEngine();
      await templateEngine.generate(config.template, projectPath, config);

      spinner.succeed('Project structure created');

      // Initialize git
      if (config.git) {
        spinner.start('Initializing git repository...');
        const git = new GitUtils(projectPath);
        await git.init();
        await git.addAll();
        await git.commit('Initial commit from DevForge');
        spinner.succeed('Git repository initialized');
      }

      // Install dependencies
      if (config.install) {
        spinner.start('Installing dependencies...');
        const npm = new NpmUtils(projectPath);
        await npm.install();
        spinner.succeed('Dependencies installed');
      }

      // Success message
      console.log();
      console.log(chalk.green.bold('✨ Project created successfully!'));
      console.log();
      console.log('Next steps:');
      console.log(chalk.cyan(`  cd ${projectName}`));
      if (!config.install) {
        console.log(chalk.cyan('  npm install'));
      }
      console.log(chalk.cyan('  npm run dev'));
      console.log();

    } catch (error) {
      logger.error('Failed to create project:', error);
      process.exit(1);
    }
  });
