/**
 * Tests for clay-intake.js config
 *
 * Validates the structure, completeness, and correctness of the
 * Clay intake form configuration object.
 */

const { clayIntakeConfig } = require('../../data/intake-configs/clay-intake');

describe('clayIntakeConfig', () => {
  test('exports a config object with required top-level fields', () => {
    expect(clayIntakeConfig).toBeDefined();
    expect(clayIntakeConfig.id).toBe('clay-intake');
    expect(clayIntakeConfig.title).toBe('Clay Project Intake');
    expect(typeof clayIntakeConfig.description).toBe('string');
    expect(clayIntakeConfig.description.length).toBeGreaterThan(0);
  });

  test('has projectSelection with type multi-select and 10 options', () => {
    const ps = clayIntakeConfig.projectSelection;
    expect(ps).toBeDefined();
    expect(ps.type).toBe('multi-select');
    expect(typeof ps.label).toBe('string');
    expect(ps.options).toHaveLength(10);
  });

  test('each projectSelection option has id, name, price, and followUpSections', () => {
    const options = clayIntakeConfig.projectSelection.options;
    options.forEach((opt) => {
      expect(typeof opt.id).toBe('string');
      expect(typeof opt.name).toBe('string');
      expect(typeof opt.price).toBe('number');
      expect(opt.price).toBeGreaterThan(0);
      expect(Array.isArray(opt.followUpSections)).toBe(true);
      expect(opt.followUpSections.length).toBeGreaterThan(0);
      // Every option should reference at least 'crm'
      expect(opt.followUpSections).toContain('crm');
    });
  });

  test('all 10 Claybooks are present with correct IDs', () => {
    const ids = clayIntakeConfig.projectSelection.options.map(o => o.id);
    expect(ids).toEqual([
      'market-map',
      'persona-mapping',
      'automated-inbound',
      'automated-outbound',
      'lead-scoring',
      'abm-enrichment',
      'crm-cleanup',
      'customer-segmentation',
      'event-enrichment',
      'signal-prospecting',
    ]);
  });

  test('sections object contains all referenced section keys', () => {
    // Collect all unique section keys referenced by project options
    const allSections = new Set();
    clayIntakeConfig.projectSelection.options.forEach((opt) => {
      opt.followUpSections.forEach((s) => allSections.add(s));
    });

    // Every referenced section must exist in config.sections
    allSections.forEach((key) => {
      expect(clayIntakeConfig.sections).toHaveProperty(key);
    });
  });

  test('has exactly 10 sections', () => {
    const sectionKeys = Object.keys(clayIntakeConfig.sections);
    expect(sectionKeys).toHaveLength(10);
  });

  test('each section has a label and questions array', () => {
    Object.entries(clayIntakeConfig.sections).forEach(([key, section]) => {
      expect(typeof section.label).toBe('string');
      expect(Array.isArray(section.questions)).toBe(true);
      expect(section.questions.length).toBeGreaterThan(0);
    });
  });

  test('each question has id, type, and label', () => {
    Object.entries(clayIntakeConfig.sections).forEach(([sectionKey, section]) => {
      section.questions.forEach((q) => {
        expect(typeof q.id).toBe('string');
        expect(typeof q.type).toBe('string');
        expect(['select', 'multi-select', 'text', 'textarea', 'boolean', 'file']).toContain(q.type);
        expect(typeof q.label).toBe('string');
      });
    });
  });

  test('select and multi-select questions have options arrays', () => {
    Object.entries(clayIntakeConfig.sections).forEach(([sectionKey, section]) => {
      section.questions.forEach((q) => {
        if (q.type === 'select' || q.type === 'multi-select') {
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThan(0);
        }
      });
    });
  });

  test('CRM section has crm_type as required', () => {
    const crmSection = clayIntakeConfig.sections.crm;
    const crmTypeQ = crmSection.questions.find(q => q.id === 'crm_type');
    expect(crmTypeQ).toBeDefined();
    expect(crmTypeQ.required).toBe(true);
  });

  test('prices match the expected values from clay.js', () => {
    const expectedPrices = {
      'market-map': 45000,
      'persona-mapping': 4500,
      'automated-inbound': 6000,
      'automated-outbound': 7000,
      'lead-scoring': 4000,
      'abm-enrichment': 6500,
      'crm-cleanup': 3500,
      'customer-segmentation': 5000,
      'event-enrichment': 3000,
      'signal-prospecting': 7500,
    };

    clayIntakeConfig.projectSelection.options.forEach((opt) => {
      expect(opt.price).toBe(expectedPrices[opt.id]);
    });
  });
});
