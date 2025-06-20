import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../core/logger.js';
import { TemplateEngine } from '../core/template-engine.js';

const templateEngine = new TemplateEngine();

const listCommand = new Command('list')
  .description('List available templates')
  .action(async () => {
    try {
      const templates = await templateEngine.listTemplates();
      
      if (templates.length === 0) {
        console.log(chalk.yellow('No templates found'));
        return;
      }

      const table = new Table({
        head: [chalk.cyan('Template'), chalk.cyan('Description')],
        style: { head: [], border: [] },
      });

      // Add template descriptions (you would load these from template metadata)
      const templateInfo: Record<string, string> = {
        'node-typescript': 'Node.js project with TypeScript',
        'react-vite': 'React application with Vite and TypeScript',
        'express-api': 'Express.js REST API with TypeScript',
      };

      templates.forEach((template) => {
        table.push([
          chalk.white(template),
          chalk.gray(templateInfo[template] || 'No description'),
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      logger.error('Failed to list templates:', error);
      process.exit(1);
    }
  });

const addCommand = new Command('add')
  .description('Add a custom template')
  .argument('<name>', 'Template name')
  .argument('<path>', 'Path to template directory')
  .action(async (name: string, templatePath: string) => {
    try {
      await templateEngine.addTemplate(name, templatePath);
      console.log(chalk.green(`✓ Template "${name}" added successfully`));
    } catch (error) {
      logger.error('Failed to add template:', error);
      process.exit(1);
    }
  });

const removeCommand = new Command('remove')
  .description('Remove a template')
  .argument('<name>', 'Template name')
  .action(async (name: string) => {
    try {
      await templateEngine.removeTemplate(name);
      console.log(chalk.green(`✓ Template "${name}" removed successfully`));
    } catch (error) {
      logger.error('Failed to remove template:', error);
      process.exit(1);
    }
  });

export const templateCommand = new Command('template')
  .description('Manage project templates')
  .addCommand(listCommand)
  .addCommand(addCommand)
  .addCommand(removeCommand);
