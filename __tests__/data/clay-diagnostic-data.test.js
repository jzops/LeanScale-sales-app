/**
 * Tests for Clay Diagnostic Data
 * TDD Phase 1: These tests define the expected structure and content
 * of the Clay diagnostic data module before it is implemented.
 */

import {
  clayProcesses,
  clayCategories,
  clayOutcomes,
  countStatuses,
  groupBy,
} from '../../data/clay-diagnostic-data';

const VALID_STATUSES = ['healthy', 'careful', 'warning', 'unable'];

const EXPECTED_CATEGORIES = [
  'Data Infrastructure',
  'Enrichment Stack',
  'Credit Optimization',
  'Inbound Pipeline',
  'Outbound Pipeline',
  'Account Intelligence',
  'Integration Health',
];

const EXPECTED_CATEGORY_COUNTS = {
  'Data Infrastructure': 5,
  'Enrichment Stack': 5,
  'Credit Optimization': 5,
  'Inbound Pipeline': 4,
  'Outbound Pipeline': 4,
  'Account Intelligence': 4,
  'Integration Health': 4,
};

describe('Clay Diagnostic Data', () => {
  describe('clayProcesses', () => {
    test('exports an array of exactly 31 processes', () => {
      expect(Array.isArray(clayProcesses)).toBe(true);
      expect(clayProcesses).toHaveLength(31);
    });

    test('each process has required fields', () => {
      clayProcesses.forEach((process, index) => {
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
      clayProcesses.forEach((process) => {
        expect(typeof process.name).toBe('string');
        expect(process.name.length).toBeGreaterThan(0);
      });
    });

    test('all process names are unique', () => {
      const names = clayProcesses.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    test('all processes default to "unable" status', () => {
      clayProcesses.forEach((process) => {
        expect(process.status).toBe('unable');
      });
    });

    test('all processes have addToEngagement set to false', () => {
      clayProcesses.forEach((process) => {
        expect(process.addToEngagement).toBe(false);
      });
    });

    test('each process status is a valid status value', () => {
      clayProcesses.forEach((process) => {
        expect(VALID_STATUSES).toContain(process.status);
      });
    });

    test('each process function is one of the 7 Clay categories', () => {
      clayProcesses.forEach((process) => {
        expect(EXPECTED_CATEGORIES).toContain(process.function);
      });
    });

    test('each category has the correct number of processes', () => {
      const grouped = {};
      clayProcesses.forEach((p) => {
        if (!grouped[p.function]) grouped[p.function] = [];
        grouped[p.function].push(p);
      });

      Object.entries(EXPECTED_CATEGORY_COUNTS).forEach(([category, count]) => {
        expect(grouped[category]).toBeDefined();
        expect(grouped[category]).toHaveLength(count);
      });
    });

    test('each process has a non-empty outcome string', () => {
      clayProcesses.forEach((process) => {
        expect(typeof process.outcome).toBe('string');
        expect(process.outcome.length).toBeGreaterThan(0);
      });
    });

    test('each process has a non-empty metric string', () => {
      clayProcesses.forEach((process) => {
        expect(typeof process.metric).toBe('string');
        expect(process.metric.length).toBeGreaterThan(0);
      });
    });

    test('each process has a non-empty description string', () => {
      clayProcesses.forEach((process) => {
        expect(typeof process.description).toBe('string');
        expect(process.description.length).toBeGreaterThan(0);
      });
    });

    // Verify specific processes exist in each category
    test('Data Infrastructure contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Data Infrastructure')
        .map((p) => p.name);
      expect(names).toContain('CRM Data Completeness');
      expect(names).toContain('CRM Data Accuracy');
      expect(names).toContain('Deduplication Process');
      expect(names).toContain('Data Hygiene Cadence');
      expect(names).toContain('Field Standardization');
    });

    test('Enrichment Stack contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Enrichment Stack')
        .map((p) => p.name);
      expect(names).toContain('Provider Coverage');
      expect(names).toContain('Waterfall Configuration');
      expect(names).toContain('Source Diversity');
      expect(names).toContain('Enrichment Accuracy');
      expect(names).toContain('Match Rate Optimization');
    });

    test('Credit Optimization contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Credit Optimization')
        .map((p) => p.name);
      expect(names).toContain('Monthly Credit Utilization');
      expect(names).toContain('Waterfall Efficiency');
      expect(names).toContain('Cost-Per-Enrichment Tracking');
      expect(names).toContain('Credit Overage Prevention');
      expect(names).toContain('Source ROI Analysis');
    });

    test('Inbound Pipeline contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Inbound Pipeline')
        .map((p) => p.name);
      expect(names).toContain('Inbound Lead Enrichment');
      expect(names).toContain('Inbound Scoring Automation');
      expect(names).toContain('Inbound Routing Speed');
      expect(names).toContain('Inbound Conversion Tracking');
    });

    test('Outbound Pipeline contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Outbound Pipeline')
        .map((p) => p.name);
      expect(names).toContain('List Building Automation');
      expect(names).toContain('Signal-Based Targeting');
      expect(names).toContain('Personalization at Scale');
      expect(names).toContain('Sequence Integration');
    });

    test('Account Intelligence contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Account Intelligence')
        .map((p) => p.name);
      expect(names).toContain('ICP Definition & Scoring');
      expect(names).toContain('TAM Coverage Analysis');
      expect(names).toContain('Intent Signal Integration');
      expect(names).toContain('Account Scoring Model');
    });

    test('Integration Health contains expected processes', () => {
      const names = clayProcesses
        .filter((p) => p.function === 'Integration Health')
        .map((p) => p.name);
      expect(names).toContain('Clay-to-CRM Sync Reliability');
      expect(names).toContain('Webhook Health Monitoring');
      expect(names).toContain('Error Rate Tracking');
      expect(names).toContain('Data Latency Measurement');
    });
  });

  describe('clayCategories', () => {
    test('exports an array of exactly 7 categories', () => {
      expect(Array.isArray(clayCategories)).toBe(true);
      expect(clayCategories).toHaveLength(7);
    });

    test('contains all expected category names', () => {
      EXPECTED_CATEGORIES.forEach((cat) => {
        expect(clayCategories).toContain(cat);
      });
    });
  });

  describe('clayOutcomes', () => {
    test('exports a non-empty array of outcome strings', () => {
      expect(Array.isArray(clayOutcomes)).toBe(true);
      expect(clayOutcomes.length).toBeGreaterThan(0);
    });

    test('each outcome is a non-empty string', () => {
      clayOutcomes.forEach((outcome) => {
        expect(typeof outcome).toBe('string');
        expect(outcome.length).toBeGreaterThan(0);
      });
    });

    test('contains expected outcomes', () => {
      expect(clayOutcomes).toContain('Improve Data Quality');
      expect(clayOutcomes).toContain('Reduce Enrichment Cost');
      expect(clayOutcomes).toContain('Increase Pipeline Coverage');
      expect(clayOutcomes).toContain('Optimize Credit Spend');
    });

    test('all process outcomes are represented in clayOutcomes', () => {
      const processOutcomes = [...new Set(clayProcesses.map((p) => p.outcome))];
      processOutcomes.forEach((outcome) => {
        expect(clayOutcomes).toContain(outcome);
      });
    });
  });

  describe('countStatuses', () => {
    test('is a function', () => {
      expect(typeof countStatuses).toBe('function');
    });

    test('counts statuses correctly', () => {
      const items = [
        { status: 'healthy' },
        { status: 'healthy' },
        { status: 'careful' },
        { status: 'warning' },
        { status: 'unable' },
        { status: 'unable' },
        { status: 'unable' },
      ];
      const result = countStatuses(items);
      expect(result).toEqual({ healthy: 2, careful: 1, warning: 1, unable: 3 });
    });

    test('returns zeros for empty array', () => {
      const result = countStatuses([]);
      expect(result).toEqual({ healthy: 0, careful: 0, warning: 0, unable: 0 });
    });

    test('works with all-unable processes (clay template default)', () => {
      const result = countStatuses(clayProcesses);
      expect(result).toEqual({ healthy: 0, careful: 0, warning: 0, unable: 31 });
    });
  });

  describe('groupBy', () => {
    test('is a function', () => {
      expect(typeof groupBy).toBe('function');
    });

    test('groups items by a field correctly', () => {
      const items = [
        { name: 'A', category: 'X' },
        { name: 'B', category: 'Y' },
        { name: 'C', category: 'X' },
      ];
      const result = groupBy(items, 'category');
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['X']).toHaveLength(2);
      expect(result['Y']).toHaveLength(1);
    });

    test('groups clay processes by function correctly', () => {
      const grouped = groupBy(clayProcesses, 'function');
      expect(Object.keys(grouped)).toHaveLength(7);
      expect(grouped['Data Infrastructure']).toHaveLength(5);
      expect(grouped['Integration Health']).toHaveLength(4);
    });
  });
});
