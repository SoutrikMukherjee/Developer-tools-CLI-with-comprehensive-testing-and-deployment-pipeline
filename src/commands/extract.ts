import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ignore from 'ignore';
import { logger } from '../core/logger.js';

export const extractCommand = new Command('extract')
  .description('Create a template from an existing project')
  .argument('[source]', 'Source directory', '.')
  .option('-n, --name <name>', 'Template name')
  .option('-o, --output <path>', 'Output directory')
  .action(async (source: string, options) => {
    try {
      const sourcePath = path.resolve(source);
      
      // Check if source exists
      if (!await fs.pathExists(sourcePath)) {
        logger.error(`Source directory not found: ${sourcePath}`);
        process.exit(1);
      }

      // Get template details
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Template name:',
          default: options.name || path.basename(sourcePath),
          validate: (input) => input.length > 0 || 'Name is required',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Template description:',
        },
        {
          type: 'checkbox',
          name: 'filesToTemplate',
          message: 'Select files to templatize:',
          choices: [
            'package.json',
            'README.md',
            'src/index.ts',
            'src/index.js',
            '.env.example',
          ],
        },
        {
          type: 'input',
          name: 'placeholders',
          message: 'Project name placeholder:',
          default: '{{projectName}}',
        },
      ]);

      const spinner = ora('Creating template...').start();

      // Create output directory
      const outputDir = options.output || path.join(process.cwd(), 'templates', answers.name);
      await fs.ensureDir(outputDir);

      // Load .gitignore patterns
      const gitignorePath = path.join(sourcePath, '.gitignore');
      const ig = ignore();
      
      if (await fs.pathExists(gitignorePath)) {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        ig.add(gitignoreContent);
      }
      
      // Always ignore these
      ig.add(['node_modules/', '.git/', 'dist/', 'build/', 'coverage/']);

      // Copy files
      await copyDirectory(sourcePath, outputDir, ig, answers);

      // Create template metadata
      const metadata = {
        name: answers.name,
        description: answers.description,
        version: '1.0.0',
        created: new Date().toISOString(),
        files: answers.filesToTemplate,
      };

      await fs.writeJson(
        path.join(outputDir, 'template.json'),
        metadata,
        { spaces: 2 }
      );

      spinner.succeed('Template created successfully!');

      console.log();
      console.log(chalk.green(`✨ Template "${answers.name}" created at:`));
      console.log(chalk.cyan(outputDir));
      console.log();
      console.log('To use this template:');
      console.log(chalk.cyan(`  devforge create my-project --template ${answers.name}`));

    } catch (error) {
      logger.error('Failed to extract template:', error);
      process.exit(1);
    }
  });

async function copyDirectory(src: string, dest: string, ig: any, config: any) {
  const items = await fs.readdir(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const relativePath = path.relative(src, srcPath);

    // Skip ignored files
    if (ig.ignores(relativePath)) {
      continue;
    }

    const stat = await fs.stat(srcPath);

    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyDirectory(srcPath, destPath, ig, config);
    } else {
      // Check if this file should be templatized
      if (config.filesToTemplate.includes(item)) {
        // Read file and replace placeholders
        let content = await fs.readFile(srcPath, 'utf-8');
        
        // Replace common patterns
        const projectName = path.basename(src);
        content = content.replace(new RegExp(projectName, 'g'), config.placeholders);
        
        // Save as .hbs template
        await fs.writeFile(destPath + '.hbs', content);
      } else {
        // Copy as-is
        await fs.copy(srcPath, destPath);
      }
    }
  }
}

// Add to package.json dependencies:
// "ignore": "^5.3.0"
