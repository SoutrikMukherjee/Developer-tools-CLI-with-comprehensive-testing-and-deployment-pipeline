import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../core/logger.js';

const execAsync = promisify(exec);

export class NpmUtils {
  constructor(private workingDir: string) {}

  async install(deps?: string[]): Promise<void> {
    try {
      const command = deps && deps.length > 0
        ? `npm install ${deps.join(' ')}`
        : 'npm install';
      
      await execAsync(command, { cwd: this.workingDir });
      logger.debug(`Installed dependencies${deps ? `: ${deps.join(', ')}` : ''}`);
    } catch (error) {
      logger.error('Failed to install dependencies:', error);
      throw error;
    }
  }

  async installDev(deps: string[]): Promise<void> {
    try {
      const command = `npm install --save-dev ${deps.join(' ')}`;
      await execAsync(command, { cwd: this.workingDir });
      logger.debug(`Installed dev dependencies: ${deps.join(', ')}`);
    } catch (error) {
      logger.error('Failed to install dev dependencies:', error);
      throw error;
    }
  }

  async run(script: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`npm run ${script}`, { cwd: this.workingDir });
      return stdout;
    } catch (error) {
      logger.error(`Failed to run script ${script}:`, error);
      throw error;
    }
  }

  async init(yes = false): Promise<void> {
    try {
      const command = yes ? 'npm init -y' : 'npm init';
      await execAsync(command, { cwd: this.workingDir });
      logger.debug('Initialized npm package');
    } catch (error) {
      logger.error('Failed to initialize npm:', error);
      throw error;
    }
  }

  async audit(fix = false): Promise<string> {
    try {
      const command = fix ? 'npm audit fix' : 'npm audit';
      const { stdout } = await execAsync(command, { cwd: this.workingDir });
      return stdout;
    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities are found
      // This is expected behavior, so we just return the output
      return (error as any).stdout || '';
    }
  }

  async outdated(): Promise<string> {
    try {
      const { stdout } = await execAsync('npm outdated', { cwd: this.workingDir });
      return stdout;
    } catch (error) {
      // npm outdated returns non-zero exit code if packages are outdated
      // This is expected behavior
      return (error as any).stdout || '';
    }
  }
}
