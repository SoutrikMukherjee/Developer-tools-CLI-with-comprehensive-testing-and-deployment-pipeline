import simpleGit, { SimpleGit } from 'simple-git';
import { logger } from '../core/logger.js';

export class GitUtils {
  private git: SimpleGit;

  constructor(workingDir: string) {
    this.git = simpleGit(workingDir);
  }

  async init(): Promise<void> {
    try {
      await this.git.init();
      logger.debug('Initialized git repository');
    } catch (error) {
      logger.error('Failed to initialize git:', error);
      throw error;
    }
  }

  async addAll(): Promise<void> {
    try {
      await this.git.add('.');
      logger.debug('Added all files to git');
    } catch (error) {
      logger.error('Failed to add files to git:', error);
      throw error;
    }
  }

  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
      logger.debug(`Committed with message: ${message}`);
    } catch (error) {
      logger.error('Failed to commit:', error);
      throw error;
    }
  }

  async createBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkoutLocalBranch(branchName);
      logger.debug(`Created branch: ${branchName}`);
    } catch (error) {
      logger.error('Failed to create branch:', error);
      throw error;
    }
  }

  async addRemote(name: string, url: string): Promise<void> {
    try {
      await this.git.addRemote(name, url);
      logger.debug(`Added remote ${name}: ${url}`);
    } catch (error) {
      logger.error('Failed to add remote:', error);
      throw error;
    }
  }

  async push(remote = 'origin', branch = 'main'): Promise<void> {
    try {
      await this.git.push(remote, branch);
      logger.debug(`Pushed to ${remote}/${branch}`);
    } catch (error) {
      logger.error('Failed to push:', error);
      throw error;
    }
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
}
