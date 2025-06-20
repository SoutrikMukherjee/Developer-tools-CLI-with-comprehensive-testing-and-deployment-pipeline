import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
  it('should pass basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should have access to Node.js APIs', () => {
    expect(process.version).toBeDefined();
    expect(process.platform).toBeDefined();
  });
});
