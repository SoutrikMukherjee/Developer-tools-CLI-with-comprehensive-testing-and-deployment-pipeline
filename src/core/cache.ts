import NodeCache from 'node-cache';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

class CacheManager {
  private cache: NodeCache;
  private cacheDir: string;
  private cacheFile: string;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL
    this.cacheDir = path.join(os.homedir(), '.devforge');
    this.cacheFile = path.join(this.cacheDir, 'cache.json');
    this.loadCache();
  }

  private async loadCache() {
    try {
      await fs.ensureDir(this.cacheDir);
      if (await fs.pathExists(this.cacheFile)) {
        const data = await fs.readJson(this.cacheFile);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      // Silent fail - cache is optional
    }
  }

  private async saveCache() {
    try {
      const data = this.cache.keys().reduce((acc, key) => {
        acc[key] = this.cache.get(key);
        return acc;
      }, {} as Record<string, any>);
      await fs.writeJson(this.cacheFile, data, { spaces: 2 });
    } catch (error) {
      // Silent fail - cache is optional
    }
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl?: number): boolean {
    const result = this.cache.set(key, value, ttl || 0);
    this.saveCache();
    return result;
  }

  del(key: string): number {
    const result = this.cache.del(key);
    this.saveCache();
    return result;
  }

  flush(): void {
    this.cache.flushAll();
    this.saveCache();
  }
}

export const cache = new CacheManager();
