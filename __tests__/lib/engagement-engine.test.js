const {
  STATUS_WEIGHTS,
  TIERS,
  FUNCTION_ORDER,
  filterPriorityItems,
  enrichWithCatalog,
  scorePriority,
  groupAndSequence,
  computeRecommendation,
} = require('../../lib/engagement-engine');

// ==========================================
// Helpers
// ==========================================
function makeProcess(overrides = {}) {
  return {
    name: 'Test Process',
    status: 'warning',
    addToEngagement: true,
    function: 'Sales',
    outcome: 'Pipeline',
    serviceId: 'test-service',
    serviceType: 'strategic',
    ...overrides,
  };
}

const MOCK_CATALOG = [
  {
    id: 'cat-1',
    name: 'Lead Routing',
    description: 'Route leads.',
    hours_low: 30,
    hours_high: 50,
    default_rate: 225,
    key_steps: ['Map rules', 'Configure CRM'],
    primary_function: 'Sales',
  },
  {
    id: 'cat-2',
    name: 'Pipeline Management',
    description: 'Manage pipeline.',
    hours_low: 40,
    hours_high: 80,
    default_rate: 200,
    key_steps: ['Audit stages'],
    primary_function: 'Sales',
  },
];

describe('lib/engagement-engine', () => {
  // ==========================================
  // filterPriorityItems
  // ==========================================
  describe('filterPriorityItems', () => {
    test('includes items with addToEngagement=true', () => {
      const items = [
        makeProcess({ addToEngagement: true }),
        makeProcess({ addToEngagement: false }),
      ];
      expect(filterPriorityItems(items)).toHaveLength(1);
    });

    test('handles null/undefined', () => {
      expect(filterPriorityItems(null)).toEqual([]);
      expect(filterPriorityItems(undefined)).toEqual([]);
    });

    test('returns empty for no engagement items', () => {
      expect(filterPriorityItems([
        makeProcess({ addToEngagement: false }),
      ])).toEqual([]);
    });
  });

  // ==========================================
  // enrichWithCatalog
  // ==========================================
  describe('enrichWithCatalog', () => {
    test('matches catalog by name-based slug', () => {
      const items = [makeProcess({ serviceId: 'lead-routing' })];
      const enriched = enrichWithCatalog(items, MOCK_CATALOG);
      expect(enriched[0].hoursLow).toBe(30);
      expect(enriched[0].hoursHigh).toBe(50);
      expect(enriched[0].rate).toBe(225);
      expect(enriched[0].catalogId).toBe('cat-1');
    });

    test('matches catalog by id', () => {
      const items = [makeProcess({ serviceId: 'cat-2' })];
      const enriched = enrichWithCatalog(items, MOCK_CATALOG);
      expect(enriched[0].catalogId).toBe('cat-2');
    });

    test('uses defaults when no catalog match', () => {
      const items = [makeProcess({ serviceId: 'no-match' })];
      const enriched = enrichWithCatalog(items, MOCK_CATALOG);
      expect(enriched[0].hoursLow).toBe(30);
      expect(enriched[0].hoursHigh).toBe(60);
      expect(enriched[0].rate).toBe(250);
      expect(enriched[0].catalogId).toBeNull();
    });

    test('handles null catalog', () => {
      const items = [makeProcess()];
      const enriched = enrichWithCatalog(items, null);
      expect(enriched[0].catalogId).toBeNull();
    });
  });

  // ==========================================
  // scorePriority
  // ==========================================
  describe('scorePriority', () => {
    test('unable gets score 4 and High label', () => {
      const result = scorePriority({ status: 'unable' });
      expect(result.priorityScore).toBe(4);
      expect(result.priorityLabel).toBe('High');
    });

    test('warning gets score 3 and High label', () => {
      const result = scorePriority({ status: 'warning' });
      expect(result.priorityScore).toBe(3);
      expect(result.priorityLabel).toBe('High');
    });

    test('careful gets score 2 and Medium label', () => {
      const result = scorePriority({ status: 'careful' });
      expect(result.priorityScore).toBe(2);
      expect(result.priorityLabel).toBe('Medium');
    });

    test('healthy gets score 1 and Medium label', () => {
      const result = scorePriority({ status: 'healthy' });
      expect(result.priorityScore).toBe(1);
      expect(result.priorityLabel).toBe('Medium');
    });

    test('unknown status defaults to score 1', () => {
      const result = scorePriority({ status: 'unknown' });
      expect(result.priorityScore).toBe(1);
    });
  });

  // ==========================================
  // groupAndSequence
  // ==========================================
  describe('groupAndSequence', () => {
    test('groups by function in defined order', () => {
      const scored = [
        { function: 'Marketing', priorityScore: 3, hoursLow: 20, hoursHigh: 40 },
        { function: 'Sales', priorityScore: 4, hoursLow: 30, hoursHigh: 50 },
        { function: 'Cross Functional', priorityScore: 2, hoursLow: 10, hoursHigh: 20 },
      ];
      const { groups, sequence } = groupAndSequence(scored);
      expect(Object.keys(groups)).toEqual(['Cross Functional', 'Sales', 'Marketing']);
      // Sequence should follow FUNCTION_ORDER
      expect(sequence[0].function).toBe('Cross Functional');
      expect(sequence[1].function).toBe('Sales');
      expect(sequence[2].function).toBe('Marketing');
    });

    test('sorts within group by priority (highest first)', () => {
      const scored = [
        { function: 'Sales', priorityScore: 2, hoursLow: 20, hoursHigh: 40 },
        { function: 'Sales', priorityScore: 4, hoursLow: 20, hoursHigh: 40 },
      ];
      const { groups } = groupAndSequence(scored);
      expect(groups['Sales'][0].priorityScore).toBe(4);
    });

    test('assigns startWeek and durationWeeks', () => {
      const scored = [
        { function: 'Sales', priorityScore: 3, hoursLow: 20, hoursHigh: 40 },
      ];
      const { sequence } = groupAndSequence(scored);
      expect(sequence[0].startWeek).toBe(1);
      expect(sequence[0].durationWeeks).toBeGreaterThanOrEqual(2);
    });

    test('handles empty input', () => {
      const { groups, sequence } = groupAndSequence([]);
      expect(Object.keys(groups)).toHaveLength(0);
      expect(sequence).toHaveLength(0);
    });
  });

  // ==========================================
  // Tier recommendation
  // ==========================================
  describe('tier recommendation', () => {
    test('recommends starter for small engagements', () => {
      const result = computeRecommendation(
        {
          processes: [
            makeProcess({ addToEngagement: true, serviceId: 'no-match' }),
          ],
        },
        [],
        []
      );
      // Default 30-60h avg=45, starter has 50h/mo → 45/50 < 1 month < 6 → starter
      expect(result.summary.recommendedTier.id).toBe('starter');
    });

    test('recommends scale for large engagements', () => {
      // 10 items × default 45h avg = 450h total
      const processes = Array(10).fill(null).map((_, i) =>
        makeProcess({ addToEngagement: true, name: `P${i}`, serviceId: `svc-${i}` })
      );
      const result = computeRecommendation({ processes }, [], []);
      // 450h needs scale tier (225h/mo → 2 months)
      expect(['growth', 'scale']).toContain(result.summary.recommendedTier.id);
    });

    test('returns all tier options with isRecommended flag', () => {
      const result = computeRecommendation(
        { processes: [makeProcess({ addToEngagement: true })] },
        [],
        []
      );
      expect(result.tiers).toHaveLength(3);
      expect(result.tiers.filter(t => t.isRecommended)).toHaveLength(1);
    });
  });

  // ==========================================
  // computeRecommendation (full integration)
  // ==========================================
  describe('computeRecommendation', () => {
    test('excludes managed service items from project list', () => {
      const result = computeRecommendation(
        {
          processes: [
            makeProcess({ addToEngagement: true, serviceType: 'managed' }),
            makeProcess({ addToEngagement: true, serviceType: 'strategic' }),
          ],
        },
        [],
        []
      );
      expect(result.summary.projectCount).toBe(1);
    });

    test('includes metadata fields', () => {
      const result = computeRecommendation(
        {
          id: 'diag-1',
          customer_id: 'cust-1',
          diagnostic_type: 'gtm',
          processes: [makeProcess({ addToEngagement: true })],
        },
        MOCK_CATALOG,
        []
      );
      expect(result.customerId).toBe('cust-1');
      expect(result.diagnosticResultId).toBe('diag-1');
      expect(result.diagnosticType).toBe('gtm');
      expect(result.generatedAt).toBeTruthy();
    });

    test('handles empty processes', () => {
      const result = computeRecommendation({ processes: [] }, [], []);
      expect(result.summary.projectCount).toBe(0);
      expect(result.projectSequence).toHaveLength(0);
    });

    test('accounts for managed services hours in tier selection', () => {
      const managedServices = [
        { addToEngagement: true, hoursPerMonth: 40 },
      ];
      const result = computeRecommendation(
        {
          processes: [
            makeProcess({ addToEngagement: true, serviceType: 'strategic' }),
          ],
        },
        [],
        managedServices
      );
      expect(result.summary.managedHoursPerMonth).toBe(40);
      expect(result.summary.managedServiceCount).toBe(1);
    });
  });
});
