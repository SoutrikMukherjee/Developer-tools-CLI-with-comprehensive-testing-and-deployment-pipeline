import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../core/logger.js';

export const monitorCommand = new Command('monitor')
  .description('Add performance monitoring to your project')
  .option('-p, --provider <provider>', 'Monitoring provider', 'custom')
  .action(async (options) => {
    try {
      const monitoringCode = `import { performance } from 'perf_hooks';

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private timers: Map<string, number> = new Map();

  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(\`Timer '\${label}' was not started\`);
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    return duration;
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return null;
    }

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [label, values] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    
    return result;
  }

  reset(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  // Integration with monitoring services
  async sendToProvider(provider: string): Promise<void> {
    const metrics = this.getAllMetrics();
    
    switch (provider) {
      case 'datadog':
        // await sendToDatadog(metrics);
        break;
      case 'newrelic':
        // await sendToNewRelic(metrics);
        break;
      case 'console':
        console.table(metrics);
        break;
      default:
        console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
    }
  }
}

// Singleton instance
export const monitor = new PerformanceMonitor();

// Express middleware
export function performanceMiddleware(req: any, res: any, next: any) {
  const start = performance.now();
  const label = \`\${req.method} \${req.path}\`;
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    monitor.metrics.set(label, [...(monitor.metrics.get(label) || []), duration]);
    
    if (duration > 1000) {
      console.warn(\`Slow request: \${label} took \${duration.toFixed(2)}ms\`);
    }
  });
  
  next();
}
`;

      const projectPath = process.cwd();
      const monitorPath = path.join(projectPath, 'src', 'monitoring');
      
      await fs.ensureDir(monitorPath);
      await fs.writeFile(
        path.join(monitorPath, 'performance.ts'),
        monitoringCode
      );

      // Add example usage
      const exampleUsage = `import { monitor } from './monitoring/performance';

// Example 1: Measure async operation
const result = await monitor.measureAsync('database-query', async () => {
  return await db.query('SELECT * FROM users');
});

// Example 2: Manual timing
monitor.startTimer('complex-calculation');
// ... perform calculation ...
const duration = monitor.endTimer('complex-calculation');

// Example 3: Express integration
import { performanceMiddleware } from './monitoring/performance';
app.use(performanceMiddleware);

// Example 4: Get metrics
const metrics = monitor.getMetrics('database-query');
console.log(\`Average query time: \${metrics?.avg.toFixed(2)}ms\`);

// Example 5: Send to monitoring service
setInterval(() => {
  monitor.sendToProvider('console');
}, 60000); // Every minute
`;

      await fs.writeFile(
        path.join(monitorPath, 'example.ts'),
        exampleUsage
      );

      console.log(chalk.green('\n✅ Performance monitoring added!'));
      console.log(chalk.blue('\nFiles created:'));
      console.log(chalk.gray(`  - src/monitoring/performance.ts`));
      console.log(chalk.gray(`  - src/monitoring/example.ts`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log('1. Import and use the monitor in your code');
      console.log('2. Add performanceMiddleware to your Express app');
      console.log('3. Configure your monitoring provider');

    } catch (error) {
      logger.error('Failed to add monitoring:', error);
      process.exit(1);
    }
  });
