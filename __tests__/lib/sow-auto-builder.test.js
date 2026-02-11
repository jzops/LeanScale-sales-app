// Mock supabase before importing
jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn() },
  supabaseAdmin: null, // disable DB calls in tests
}));

const {
  selectPriorityItems,
  groupItems,
  generateExecutiveSummary,
  shouldUseItemSections,
  generateItemSections,
  generateGroupedSections,
  autoGenerateSow,
} = require('../../lib/sow-auto-builder');

// ==========================================
// Test data factories
// ==========================================
function makeProcess(overrides = {}) {
  return {
    name: 'Test Process',
    status: 'warning',
    addToEngagement: false,
    function: 'Sales',
    outcome: 'Pipeline',
    serviceId: 'test-service',
    serviceType: 'strategic',
    ...overrides,
  };
}

const MOCK_CATALOG = {
  'lead-routing': {
    id: 'cat-1',
    slug: 'lead-routing',
    name: 'Lead Routing',
    description: 'Implement lead routing workflows.',
    hours_low: 30,
    hours_high: 50,
    default_rate: '225',
    key_steps: ['Map routing rules', 'Configure CRM', 'Test & validate'],
    active: true,
  },
  'pipeline-mgmt': {
    id: 'cat-2',
    slug: 'pipeline-mgmt',
    name: 'Pipeline Management',
    description: 'Optimize pipeline stages.',
    hours_low: 40,
    hours_high: 80,
    default_rate: '200',
    key_steps: ['Audit stages', 'Define exit criteria'],
    active: true,
  },
};

describe('lib/sow-auto-builder', () => {
  // ==========================================
  // selectPriorityItems
  // ==========================================
  describe('selectPriorityItems', () => {
    test('selects warning items', () => {
      const items = [
        makeProcess({ status: 'warning' }),
        makeProcess({ status: 'healthy' }),
      ];
      expect(selectPriorityItems(items)).toHaveLength(1);
    });

    test('selects unable items', () => {
      const items = [makeProcess({ status: 'unable' })];
      expect(selectPriorityItems(items)).toHaveLength(1);
    });

    test('selects addToEngagement items regardless of status', () => {
      const items = [makeProcess({ status: 'healthy', addToEngagement: true })];
      expect(selectPriorityItems(items)).toHaveLength(1);
    });

    test('excludes healthy items without addToEngagement', () => {
      const items = [makeProcess({ status: 'healthy', addToEngagement: false })];
      expect(selectPriorityItems(items)).toHaveLength(0);
    });

    test('excludes careful items without addToEngagement', () => {
      const items = [makeProcess({ status: 'careful', addToEngagement: false })];
      expect(selectPriorityItems(items)).toHaveLength(0);
    });

    test('handles null/undefined input', () => {
      expect(selectPriorityItems(null)).toEqual([]);
      expect(selectPriorityItems(undefined)).toEqual([]);
    });

    test('handles empty array', () => {
      expect(selectPriorityItems([])).toEqual([]);
    });

    test('selects mix of warning, unable, and engagement items', () => {
      const items = [
        makeProcess({ status: 'warning' }),
        makeProcess({ status: 'unable' }),
        makeProcess({ status: 'careful', addToEngagement: true }),
        makeProcess({ status: 'healthy' }),
      ];
      expect(selectPriorityItems(items)).toHaveLength(3);
    });
  });

  // ==========================================
  // groupItems
  // ==========================================
  describe('groupItems', () => {
    test('groups by function (default)', () => {
      const items = [
        makeProcess({ function: 'Sales', name: 'A' }),
        makeProcess({ function: 'Marketing', name: 'B' }),
        makeProcess({ function: 'Sales', name: 'C' }),
      ];
      const groups = groupItems(items);
      expect(Object.keys(groups)).toEqual(['Sales', 'Marketing']);
      expect(groups['Sales']).toHaveLength(2);
      expect(groups['Marketing']).toHaveLength(1);
    });

    test('groups by outcome', () => {
      const items = [
        makeProcess({ outcome: 'Pipeline', name: 'A' }),
        makeProcess({ outcome: 'Revenue', name: 'B' }),
      ];
      const groups = groupItems(items, 'outcome');
      expect(Object.keys(groups)).toEqual(['Pipeline', 'Revenue']);
    });

    test('uses "Other" for missing group key', () => {
      const items = [makeProcess({ function: undefined, name: 'A' })];
      const groups = groupItems(items);
      expect(groups['Other']).toHaveLength(1);
    });

    test('sorts within groups by severity (unable first)', () => {
      const items = [
        makeProcess({ function: 'Sales', status: 'warning', name: 'W' }),
        makeProcess({ function: 'Sales', status: 'unable', name: 'U' }),
      ];
      const groups = groupItems(items);
      expect(groups['Sales'][0].name).toBe('U');
      expect(groups['Sales'][1].name).toBe('W');
    });
  });

  // ==========================================
  // generateExecutiveSummary
  // ==========================================
  describe('generateExecutiveSummary', () => {
    test('generates summary with customer name and stats', () => {
      const processes = [
        makeProcess({ status: 'warning' }),
        makeProcess({ status: 'unable' }),
        makeProcess({ status: 'healthy' }),
      ];
      const statusCounts = { warning: 1, unable: 1, careful: 0, healthy: 1 };
      const summary = generateExecutiveSummary(processes, 'Acme Corp', 'gtm', statusCounts);

      expect(summary).toContain('Acme Corp');
      expect(summary).toContain('GTM Operations');
      expect(summary).toContain('3 processes evaluated');
      expect(summary).toContain('2');
      expect(summary).toContain('67%');
    });

    test('handles empty processes', () => {
      const summary = generateExecutiveSummary([], null, 'gtm', {});
      expect(summary).toContain('healthy operational state');
    });

    test('uses "your organization" when no customer name', () => {
      const processes = [makeProcess({ status: 'warning' })];
      const statusCounts = { warning: 1, unable: 0, careful: 0, healthy: 0 };
      const summary = generateExecutiveSummary(processes, null, 'gtm', statusCounts);
      expect(summary).toContain('your organization');
    });

    test('uses correct label for clay diagnostic type', () => {
      const processes = [makeProcess({ status: 'warning' })];
      const statusCounts = { warning: 1, unable: 0, careful: 0, healthy: 0 };
      const summary = generateExecutiveSummary(processes, 'Test', 'clay', statusCounts);
      expect(summary).toContain('Clay Enrichment');
    });

    test('describes severity levels correctly', () => {
      // >50% critical
      const manyBad = Array(6).fill(null).map(() => makeProcess({ status: 'unable' }));
      manyBad.push(makeProcess({ status: 'healthy' }));
      const counts = { warning: 0, unable: 6, careful: 0, healthy: 1 };
      const summary = generateExecutiveSummary(manyBad, 'X', 'gtm', counts);
      expect(summary).toContain('immediate attention');
    });
  });

  // ==========================================
  // shouldUseItemSections
  // ==========================================
  describe('shouldUseItemSections', () => {
    test('returns true for ≤8 items', () => {
      expect(shouldUseItemSections(Array(8).fill({}))).toBe(true);
      expect(shouldUseItemSections(Array(1).fill({}))).toBe(true);
    });

    test('returns false for >8 items', () => {
      expect(shouldUseItemSections(Array(9).fill({}))).toBe(false);
    });
  });

  // ==========================================
  // generateItemSections
  // ==========================================
  describe('generateItemSections', () => {
    test('generates one section per item', () => {
      const items = [
        makeProcess({ name: 'Lead Routing', serviceId: 'lead-routing' }),
        makeProcess({ name: 'Pipeline', serviceId: 'pipeline-mgmt' }),
      ];
      const sections = generateItemSections(items, MOCK_CATALOG);
      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('Lead Routing');
      expect(sections[0].hours).toBe(40); // (30+50)/2
      expect(sections[0].rate).toBe(225);
      expect(sections[0].deliverables).toHaveLength(3);
    });

    test('uses default rate when no catalog match', () => {
      const items = [makeProcess({ name: 'Unknown', serviceId: 'no-match' })];
      const sections = generateItemSections(items, {}, { defaultRate: 150 });
      expect(sections[0].rate).toBe(150);
      expect(sections[0].hours).toBeNull();
    });

    test('generates timeline when sowStartDate provided', () => {
      const items = [makeProcess({ name: 'Test', serviceId: 'lead-routing' })];
      const sections = generateItemSections(items, MOCK_CATALOG, {
        sowStartDate: '2025-03-01',
      });
      expect(sections[0].startDate).toBeTruthy();
      expect(sections[0].endDate).toBeTruthy();
    });

    test('no dates when sowStartDate is null', () => {
      const items = [makeProcess({ name: 'Test', serviceId: 'lead-routing' })];
      const sections = generateItemSections(items, MOCK_CATALOG);
      expect(sections[0].startDate).toBeNull();
      expect(sections[0].endDate).toBeNull();
    });
  });

  // ==========================================
  // generateGroupedSections
  // ==========================================
  describe('generateGroupedSections', () => {
    test('generates one section per function group', () => {
      const grouped = {
        Sales: [
          makeProcess({ name: 'A', serviceId: 'lead-routing' }),
          makeProcess({ name: 'B', serviceId: 'pipeline-mgmt' }),
        ],
        Marketing: [
          makeProcess({ name: 'C', serviceId: 'lead-routing' }),
        ],
      };
      const sections = generateGroupedSections(grouped, MOCK_CATALOG);
      expect(sections).toHaveLength(2);
      // Marketing comes before Sales in FUNCTION_ORDER
      expect(sections[0].title).toContain('Marketing');
      expect(sections[1].title).toContain('Sales');
    });

    test('aggregates hours across items in a group', () => {
      const grouped = {
        Sales: [
          makeProcess({ serviceId: 'lead-routing' }),  // 30-50
          makeProcess({ serviceId: 'pipeline-mgmt' }), // 40-80
        ],
      };
      const sections = generateGroupedSections(grouped, MOCK_CATALOG);
      // (70 + 130) / 2 = 100
      expect(sections[0].hours).toBe(100);
    });

    test('caps deliverables at 15', () => {
      const manySteps = Array(20).fill(null).map((_, i) => `Step ${i}`);
      const bigCatalog = {
        'big-service': {
          ...MOCK_CATALOG['lead-routing'],
          key_steps: manySteps,
        },
      };
      const grouped = {
        Sales: [makeProcess({ serviceId: 'big-service' })],
      };
      const sections = generateGroupedSections(grouped, bigCatalog);
      expect(sections[0].deliverables.length).toBeLessThanOrEqual(15);
    });
  });

  // ==========================================
  // autoGenerateSow (integration, no DB)
  // ==========================================
  describe('autoGenerateSow', () => {
    test('returns empty sections for all-healthy processes', async () => {
      const result = await autoGenerateSow({
        processes: [
          makeProcess({ status: 'healthy', addToEngagement: false }),
          makeProcess({ status: 'careful', addToEngagement: false }),
        ],
      });
      expect(result.sections).toEqual([]);
      expect(result.priorityItems).toHaveLength(0);
      expect(result.executiveSummary).toBeTruthy();
    });

    test('returns sections for priority items', async () => {
      const result = await autoGenerateSow({
        processes: [
          makeProcess({ status: 'warning', name: 'A', serviceId: 'lead-routing' }),
          makeProcess({ status: 'unable', name: 'B', serviceId: 'pipeline-mgmt' }),
        ],
        customerName: 'Acme',
      });
      expect(result.priorityItems).toHaveLength(2);
      // supabaseAdmin is null so catalogMap will be empty, but sections still generated
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.statusCounts).toEqual({ warning: 1, unable: 1, careful: 0, healthy: 0 });
    });

    test('handles empty processes array', async () => {
      const result = await autoGenerateSow({ processes: [] });
      expect(result.sections).toEqual([]);
      expect(result.executiveSummary).toContain('healthy operational state');
    });

    test('computes status counts correctly', async () => {
      const result = await autoGenerateSow({
        processes: [
          makeProcess({ status: 'warning' }),
          makeProcess({ status: 'warning' }),
          makeProcess({ status: 'unable' }),
          makeProcess({ status: 'healthy' }),
          makeProcess({ status: 'careful' }),
        ],
      });
      expect(result.statusCounts).toEqual({
        warning: 2, unable: 1, careful: 1, healthy: 1,
      });
    });
  });
});
