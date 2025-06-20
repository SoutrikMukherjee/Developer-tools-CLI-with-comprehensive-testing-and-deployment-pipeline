import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  validateEmail,
  validateUrl,
  validateSemver
} from '../../../src/utils/validation.js';

describe('Validation Utils', () => {
  describe('validateProjectName', () => {
    it('should accept valid project names', () => {
      const validNames = [
        'my-project',
        'project123',
        'test_project',
        '@scope/package',
        'a',
        'my-awesome-project-2024'
      ];

      validNames.forEach(name => {
        const result = validateProjectName(name);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid project names', () => {
      const invalidNames = [
        '',
        '.hidden',
        '_private',
        'my project', // spaces
        'MY-PROJECT', // uppercase
        '../../../etc/passwd',
        'aux', // reserved
        'a'.repeat(215), // too long
      ];

      invalidNames.forEach(name => {
        const result = validateProjectName(name);
        expect(result.valid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });
  });

  describe('validateEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(validateEmail('user@example.com').valid).toBe(true);
      expect(validateEmail('test.user+tag@company.co.uk').valid).toBe(true);
      expect(validateEmail('invalid-email').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('user@').valid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate URLs correctly', () => {
      expect(validateUrl('https://example.com').valid).toBe(true);
      expect(validateUrl('http://localhost:3000').valid).toBe(true);
      expect(validateUrl('ftp://files.example.com').valid).toBe(true);
      expect(validateUrl('not-a-url').valid).toBe(false);
      expect(validateUrl('//example.com').valid).toBe(false);
    });
  });

  describe('validateSemver', () => {
    it('should validate semantic versions correctly', () => {
      expect(validateSemver('1.0.0').valid).toBe(true);
      expect(validateSemver('2.1.3-alpha.1').valid).toBe(true);
      expect(validateSemver('0.0.1-beta+exp.sha.5114f85').valid).toBe(true);
      expect(validateSemver('1.0').valid).toBe(false);
      expect(validateSemver('v1.0.0').valid).toBe(false);
    });
  });
});
