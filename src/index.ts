#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { templateCommand } from './commands/template.js';
import { pluginCommand } from './commands/plugin.js';
import { logger } from './core/logger.js';
import { loadConfig } from './core/config.js';
import { version } from '../package.json' assert { type: 'json' };

const program = new Command();

async function main() {
  try {
    // Load configuration
    await loadConfig();

    program
      .name('devforge')
      .description('A powerful CLI tool for bootstrapping developer projects')
      .version(version)
      .option('-v, --verbose', 'enable verbose logging')
      .option('--no-color', 'disable colored output')
      .hook('preAction', (thisCommand) => {
        if (thisCommand.opts().verbose) {
          logger.level = 'debug';
        }
        if (!thisCommand.opts().color) {
          chalk.level = 0;
        }
      });

    // Register commands
    program.addCommand(createCommand);
    program.addCommand(initCommand);
    program.addCommand(templateCommand);
    program.addCommand(pluginCommand);

    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
