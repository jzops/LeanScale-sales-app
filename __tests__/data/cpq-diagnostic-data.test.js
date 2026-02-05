/**
 * Tests for CPQ Diagnostic Data
 * TDD Phase 1: These tests define the expected structure and content
 * of the CPQ diagnostic data module before it is implemented.
 */

import {
  cpqProcesses,
  cpqCategories,
  cpqOutcomes,
  countStatuses,
  groupBy,
} from '../../data/cpq-diagnostic-data';

const VALID_STATUSES = ['healthy', 'careful', 'warning', 'unable'];

const EXPECTED_CATEGORIES = [
  'Quoting Process',
  'Pricing & Catalog',
  'Contract Management',
  'Billing Integration',
  'Revenue Recognition',
  'System Integration',
];

const EXPECTED_CATEGORY_COUNTS = {
  'Quoting Process': 5,
  'Pricing & Catalog': 4,
  'Contract Management': 4,
  'Billing Integration': 4,
  'Revenue Recognition': 4,
  'System Integration': 4,
};

describe('CPQ Diagnostic Data', () => {
  describe('cpqProcesses', () => {
    test('exports an array of exactly 25 processes', () => {
      expect(Array.isArray(cpqProcesses)).toBe(true);
      expect(cpqProcesses).toHaveLength(25);
    });

    test('each process has required fields', () => {
      cpqProcesses.forEach((process) => {
        expect(process).toHaveProperty('name');
        expect(process).toHaveProperty('status');
        expect(process).toHaveProperty('addToEngagement');
        expect(process).toHaveProperty('function');
        expect(process).toHaveProperty('outcome');
        expect(process).toHaveProperty('metric');
        expect(process).toHaveProperty('description');
      });
    });

    test('each process name is a non-empty string', () => {
      cpqProcesses.forEach((process) => {
        expect(typeof process.name).toBe('string');
        expect(process.name.length).toBeGreaterThan(0);
      });
    });

    test('all process names are unique', () => {
      const names = cpqProcesses.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    test('all processes default to "unable" status', () => {
      cpqProcesses.forEach((process) => {
        expect(process.status).toBe('unable');
      });
    });

    test('all processes have addToEngagement set to false', () => {
      cpqProcesses.forEach((process) => {
        expect(process.addToEngagement).toBe(false);
      });
    });

    test('each process status is a valid status value', () => {
      cpqProcesses.forEach((process) => {
        expect(VALID_STATUSES).toContain(process.status);
      });
    });

    test('each process function is one of the 6 CPQ categories', () => {
      cpqProcesses.forEach((process) => {
        expect(EXPECTED_CATEGORIES).toContain(process.function);
      });
    });

    test('each category has the correct number of processes', () => {
      const grouped = {};
      cpqProcesses.forEach((p) => {
        if (!grouped[p.function]) grouped[p.function] = [];
        grouped[p.function].push(p);
      });

      Object.entries(EXPECTED_CATEGORY_COUNTS).forEach(([category, count]) => {
        expect(grouped[category]).toBeDefined();
        expect(grouped[category]).toHaveLength(count);
      });
    });

    test('each process has a non-empty outcome string', () => {
      cpqProcesses.forEach((process) => {
        expect(typeof process.outcome).toBe('string');
        expect(process.outcome.length).toBeGreaterThan(0);
      });
    });

    test('each process has a non-empty metric string', () => {
      cpqProcesses.forEach((process) => {
        expect(typeof process.metric).toBe('string');
        expect(process.metric.length).toBeGreaterThan(0);
      });
    });

    test('each process has a non-empty description string', () => {
      cpqProcesses.forEach((process) => {
        expect(typeof process.description).toBe('string');
        expect(process.description.length).toBeGreaterThan(0);
      });
    });

    // Verify specific processes exist in each category
    test('Quoting Process contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'Quoting Process')
        .map((p) => p.name);
      expect(names).toContain('Quote Creation Speed');
      expect(names).toContain('Quote Template Usage');
      expect(names).toContain('Approval Workflow Efficiency');
      expect(names).toContain('Rep Adoption Rate');
      expect(names).toContain('Quote Accuracy');
    });

    test('Pricing & Catalog contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'Pricing & Catalog')
        .map((p) => p.name);
      expect(names).toContain('Product Catalog Completeness');
      expect(names).toContain('Pricing Rule Accuracy');
      expect(names).toContain('Discount Governance');
      expect(names).toContain('SKU Standardization');
    });

    test('Contract Management contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'Contract Management')
        .map((p) => p.name);
      expect(names).toContain('CLM Tool Maturity');
      expect(names).toContain('Amendment Handling');
      expect(names).toContain('E-Signature Flow');
      expect(names).toContain('Clause Library Coverage');
    });

    test('Billing Integration contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'Billing Integration')
        .map((p) => p.name);
      expect(names).toContain('Invoice Automation Level');
      expect(names).toContain('Billing Accuracy Rate');
      expect(names).toContain('Payment Collection Efficiency');
      expect(names).toContain('Dunning Process');
    });

    test('Revenue Recognition contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'Revenue Recognition')
        .map((p) => p.name);
      expect(names).toContain('ASC 606 Compliance');
      expect(names).toContain('Rev Rec Automation');
      expect(names).toContain('Audit Trail Completeness');
      expect(names).toContain('Multi-Element Handling');
    });

    test('System Integration contains expected processes', () => {
      const names = cpqProcesses
        .filter((p) => p.function === 'System Integration')
        .map((p) => p.name);
      expect(names).toContain('CRM-CPQ Connectivity');
      expect(names).toContain('CPQ-Billing Data Flow');
      expect(names).toContain('Billing-ERP Sync');
      expect(names).toContain('End-to-End Data Integrity');
    });
  });

  describe('cpqCategories', () => {
    test('exports an array of exactly 6 categories', () => {
      expect(Array.isArray(cpqCategories)).toBe(true);
      expect(cpqCategories).toHaveLength(6);
    });

    test('contains all expected category names', () => {
      EXPECTED_CATEGORIES.forEach((cat) => {
        expect(cpqCategories).toContain(cat);
      });
    });
  });

  describe('cpqOutcomes', () => {
    test('exports a non-empty array of outcome strings', () => {
      expect(Array.isArray(cpqOutcomes)).toBe(true);
      expect(cpqOutcomes.length).toBeGreaterThan(0);
    });

    test('each outcome is a non-empty string', () => {
      cpqOutcomes.forEach((outcome) => {
        expect(typeof outcome).toBe('string');
        expect(outcome.length).toBeGreaterThan(0);
      });
    });

    test('all process outcomes are represented in cpqOutcomes', () => {
      const processOutcomes = [...new Set(cpqProcesses.map((p) => p.outcome))];
      processOutcomes.forEach((outcome) => {
        expect(cpqOutcomes).toContain(outcome);
      });
    });
  });

  describe('countStatuses', () => {
    test('is a function', () => {
      expect(typeof countStatuses).toBe('function');
    });

    test('works with all-unable processes (cpq template default)', () => {
      const result = countStatuses(cpqProcesses);
      expect(result).toEqual({ healthy: 0, careful: 0, warning: 0, unable: 25 });
    });
  });

  describe('groupBy', () => {
    test('is a function', () => {
      expect(typeof groupBy).toBe('function');
    });

    test('groups cpq processes by function correctly', () => {
      const grouped = groupBy(cpqProcesses, 'function');
      expect(Object.keys(grouped)).toHaveLength(6);
      expect(grouped['Quoting Process']).toHaveLength(5);
      expect(grouped['System Integration']).toHaveLength(4);
    });
  });
});
