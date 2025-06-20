#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function release() {
  try {
    // Check if working directory is clean
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.error(chalk.red('Working directory is not clean. Commit or stash changes first.'));
      process.exit(1);
    }

    // Get current version
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    const currentVersion = packageJson.version;

    console.log(chalk.blue(`Current version: ${currentVersion}`));

    // Ask for version bump type
    const { bumpType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'bumpType',
        message: 'Select version bump type:',
        choices: [
          { name: `Patch (${semver.inc(currentVersion, 'patch')})`, value: 'patch' },
          { name: `Minor (${semver.inc(currentVersion, 'minor')})`, value: 'minor' },
          { name: `Major (${semver.inc(currentVersion, 'major')})`, value: 'major' },
          { name: 'Custom', value: 'custom' },
        ],
      },
    ]);

    let newVersion;
    if (bumpType === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: 'Enter custom version:',
          validate: (input) => {
            if (!semver.valid(input)) {
              return 'Invalid version format';
            }
            if (!semver.gt(input, currentVersion)) {
              return 'Version must be greater than current version';
            }
            return true;
          },
        },
      ]);
      newVersion = customVersion;
    } else {
      newVersion = semver.inc(currentVersion, bumpType as semver.ReleaseType);
    }

    console.log(chalk.green(`New version: ${newVersion}`));

    // Update package.json
    packageJson.version = newVersion;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Update CHANGELOG.md
    const date = new Date().toISOString().split('T')[0];
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    let changelog = await fs.readFile(changelogPath, 'utf-8');
    
    changelog = changelog.replace(
      '## [Unreleased]',
      `## [Unreleased]\n\n## [${newVersion}] - ${date}`
    );
    
    await fs.writeFile(changelogPath, changelog);

    // Commit changes
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: release v${newVersion}"`);

    // Create and push tag
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
    execSync('git push origin main');
    execSync(`git push origin v${newVersion}`);

    console.log(chalk.green.bold(`\n✨ Released v${newVersion} successfully!`));
    console.log(chalk.blue('\nGitHub Actions will now build and publish to npm.'));

  } catch (error) {
    console.error(chalk.red('Release failed:'), error);
    process.exit(1);
  }
}

release();
