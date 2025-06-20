import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../core/logger.js';

const execAsync = promisify(exec);

interface HealthCheck {
  name: string;
  check: () => Promise<{ passed: boolean; message: string }>;
}

export const doctorCommand = new Command('doctor')
  .description('Check project health and development environment')
  .action(async () => {
    console.log(chalk.blue.bold('🏥 DevForge Doctor\n'));
    console.log('Checking your development environment...\n');

    const checks: HealthCheck[] = [
      {
        name: 'Node.js Version',
        check: async () => {
          try {
            const { stdout } = await execAsync('node --version');
            const version = stdout.trim();
            const major = parseInt(version.split('.')[0].substring(1));
            
            return {
              passed: major >= 16,
              message: major >= 16 
                ? `${version} ✓` 
                : `${version} (requires >= 16.0.0)`,
            };
          } catch {
            return { passed: false, message: 'Not installed' };
          }
        },
      },
      {
        name: 'npm Version',
        check: async () => {
          try {
            const { stdout } = await execAsync('npm --version');
            const version = stdout.trim();
            const major = parseInt(version.split('.')[0]);
            
            return {
              passed: major >= 7,
              message: major >= 7 
                ? `${version} ✓` 
                : `${version} (requires >= 7.0.0)`,
            };
          } catch {
            return { passed: false, message: 'Not installed' };
          }
        },
      },
      {
        name: 'Git',
        check: async () => {
          try {
            const { stdout } = await execAsync('git --version');
            return { passed: true, message: stdout.trim() };
          } catch {
            return { passed: false, message: 'Not installed' };
          }
        },
      },
      {
        name: 'TypeScript',
        check: async () => {
          try {
            const { stdout } = await execAsync('tsc --version');
            return { passed: true, message: stdout.trim() };
          } catch {
            return { passed: false, message: 'Not installed globally (optional)' };
          }
        },
      },
      {
        name: 'Project Structure',
        check: async () => {
          const cwd = process.cwd();
          const hasPackageJson = await fs.pathExists(path.join(cwd, 'package.json'));
          const hasGitIgnore = await fs.pathExists(path.join(cwd, '.gitignore'));
          const hasSrc = await fs.pathExists(path.join(cwd, 'src'));
          
          const passed = hasPackageJson && hasGitIgnore && hasSrc;
          const missing = [];
          if (!hasPackageJson) missing.push('package.json');
          if (!hasGitIgnore) missing.push('.gitignore');
          if (!hasSrc) missing.push('src/');
          
          return {
            passed,
            message: passed 
              ? 'All required files present ✓' 
              : `Missing: ${missing.join(', ')}`,
          };
        },
      },
      {
        name: 'Dependencies',
        check: async () => {
          try {
            const hasNodeModules = await fs.pathExists(path.join(process.cwd(), 'node_modules'));
            if (!hasNodeModules) {
              return { passed: false, message: 'Run npm install' };
            }
            
            const { stdout } = await execAsync('npm outdated --json');
            const outdated = stdout ? Object.keys(JSON.parse(stdout)).length : 0;
            
            return {
              passed: outdated === 0,
              message: outdated === 0 
                ? 'All dependencies up to date ✓' 
                : `${outdated} packages outdated (run npm update)`,
            };
          } catch {
            return { passed: true, message: 'All dependencies up to date ✓' };
          }
        },
      },
    ];

    let allPassed = true;

    for (const healthCheck of checks) {
      const spinner = ora(healthCheck.name).start();
      
      try {
        const result = await healthCheck.check();
        
        if (result.passed) {
          spinner.succeed(`${healthCheck.name}: ${result.message}`);
        } else {
          spinner.fail(`${healthCheck.name}: ${result.message}`);
          allPassed = false;
        }
      } catch (error) {
        spinner.fail(`${healthCheck.name}: Error during check`);
        allPassed = false;
      }
    }

    console.log();
    
    if (allPassed) {
      console.log(chalk.green.bold('✅ All checks passed! Your environment is ready.'));
    } else {
      console.log(chalk.yellow.bold('⚠️  Some checks failed. Please address the issues above.'));
      process.exit(1);
    }
  });

// Add to src/index.ts
// import { doctorCommand } from './commands/doctor.js';
// program.addCommand(doctorCommand);
