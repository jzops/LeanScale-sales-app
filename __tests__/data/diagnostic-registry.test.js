/**
 * Tests for Diagnostic Registry
 * TDD Phase 1: Tests define the expected structure of the registry
 * that maps diagnostic types to their configurations.
 */

import { diagnosticRegistry, countStatuses, groupBy } from '../../data/diagnostic-registry';

describe('Diagnostic Registry', () => {
  test('exports a diagnosticRegistry object', () => {
    expect(typeof diagnosticRegistry).toBe('object');
    expect(diagnosticRegistry).not.toBeNull();
  });

  test('contains gtm, clay, and cpq entries', () => {
    expect(diagnosticRegistry).toHaveProperty('gtm');
    expect(diagnosticRegistry).toHaveProperty('clay');
    expect(diagnosticRegistry).toHaveProperty('cpq');
  });

  describe('each registry entry has required fields', () => {
    const requiredFields = ['id', 'title', 'subtitle', 'icon', 'processes', 'categories', 'outcomes'];

    ['gtm', 'clay', 'cpq'].forEach((key) => {
      test(`${key} entry has all required fields`, () => {
        requiredFields.forEach((field) => {
          expect(diagnosticRegistry[key]).toHaveProperty(field);
        });
      });
    });
  });

  describe('gtm entry', () => {
    test('has correct id', () => {
      expect(diagnosticRegistry.gtm.id).toBe('gtm');
    });

    test('has correct title', () => {
      expect(diagnosticRegistry.gtm.title).toBe('GTM Diagnostic Results');
    });

    test('has processes array', () => {
      expect(Array.isArray(diagnosticRegistry.gtm.processes)).toBe(true);
      expect(diagnosticRegistry.gtm.processes.length).toBeGreaterThan(0);
    });

    test('has tools array (gtm-specific)', () => {
      expect(diagnosticRegistry.gtm).toHaveProperty('tools');
      expect(Array.isArray(diagnosticRegistry.gtm.tools)).toBe(true);
    });

    test('has categories array', () => {
      expect(Array.isArray(diagnosticRegistry.gtm.categories)).toBe(true);
      expect(diagnosticRegistry.gtm.categories.length).toBeGreaterThan(0);
    });

    test('has outcomes array', () => {
      expect(Array.isArray(diagnosticRegistry.gtm.outcomes)).toBe(true);
      expect(diagnosticRegistry.gtm.outcomes.length).toBeGreaterThan(0);
    });
  });

  describe('clay entry', () => {
    test('has correct id', () => {
      expect(diagnosticRegistry.clay.id).toBe('clay');
    });

    test('has correct title', () => {
      expect(diagnosticRegistry.clay.title).toBe('Clay Diagnostic Results');
    });

    test('has correct subtitle', () => {
      expect(diagnosticRegistry.clay.subtitle).toBe('Clay enrichment and automation maturity assessment');
    });

    test('has correct icon', () => {
      expect(diagnosticRegistry.clay.icon).toBe('\uD83E\uDDF1');
    });

    test('has 31 processes', () => {
      expect(diagnosticRegistry.clay.processes).toHaveLength(31);
    });

    test('has 7 categories', () => {
      expect(diagnosticRegistry.clay.categories).toHaveLength(7);
    });
  });

  describe('cpq entry', () => {
    test('has correct id', () => {
      expect(diagnosticRegistry.cpq.id).toBe('cpq');
    });

    test('has correct title', () => {
      expect(diagnosticRegistry.cpq.title).toBe('Quote-to-Cash Diagnostic Results');
    });

    test('has correct subtitle', () => {
      expect(diagnosticRegistry.cpq.subtitle).toBe('CPQ and revenue lifecycle maturity assessment');
    });

    test('has correct icon', () => {
      expect(diagnosticRegistry.cpq.icon).toBe('\uD83D\uDD04');
    });

    test('has 25 processes', () => {
      expect(diagnosticRegistry.cpq.processes).toHaveLength(25);
    });

    test('has 6 categories', () => {
      expect(diagnosticRegistry.cpq.categories).toHaveLength(6);
    });
  });

  describe('shared utility exports', () => {
    test('exports countStatuses function', () => {
      expect(typeof countStatuses).toBe('function');
    });

    test('exports groupBy function', () => {
      expect(typeof groupBy).toBe('function');
    });
  });
});
