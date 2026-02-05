/**
 * Tests for q2c-intake.js config
 *
 * Validates the structure, completeness, and correctness of the
 * Quote-to-Cash intake form configuration object.
 */

const { q2cIntakeConfig } = require('../../data/intake-configs/q2c-intake');

describe('q2cIntakeConfig', () => {
  test('exports a config object with required top-level fields', () => {
    expect(q2cIntakeConfig).toBeDefined();
    expect(q2cIntakeConfig.id).toBe('q2c-intake');
    expect(q2cIntakeConfig.title).toBe('Quote-to-Cash Project Intake');
    expect(typeof q2cIntakeConfig.description).toBe('string');
    expect(q2cIntakeConfig.description.length).toBeGreaterThan(0);
  });

  test('has projectSelection with type multi-select and 6 options', () => {
    const ps = q2cIntakeConfig.projectSelection;
    expect(ps).toBeDefined();
    expect(ps.type).toBe('multi-select');
    expect(typeof ps.label).toBe('string');
    expect(ps.options).toHaveLength(6);
  });

  test('each projectSelection option has id, name, price, and followUpSections', () => {
    const options = q2cIntakeConfig.projectSelection.options;
    options.forEach((opt) => {
      expect(typeof opt.id).toBe('string');
      expect(typeof opt.name).toBe('string');
      expect(typeof opt.price).toBe('number');
      expect(opt.price).toBeGreaterThan(0);
      expect(Array.isArray(opt.followUpSections)).toBe(true);
      expect(opt.followUpSections.length).toBeGreaterThan(0);
      // Every option should reference at least 'systems'
      expect(opt.followUpSections).toContain('systems');
    });
  });

  test('all 6 functional areas are present with correct IDs', () => {
    const ids = q2cIntakeConfig.projectSelection.options.map(o => o.id);
    expect(ids).toEqual([
      'quoting-cpq',
      'contract-management',
      'billing-invoicing',
      'payment-collection',
      'revenue-recognition',
      'full-e2e-q2c',
    ]);
  });

  test('Full End-to-End Q2C includes all follow-up sections', () => {
    const fullOption = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'full-e2e-q2c');
    expect(fullOption).toBeDefined();
    expect(fullOption.followUpSections).toEqual(
      expect.arrayContaining(['systems', 'quoting', 'contracts', 'billing', 'payments', 'rev_rec'])
    );
    expect(fullOption.followUpSections).toHaveLength(6);
  });

  test('sections object contains all referenced section keys', () => {
    // Collect all unique section keys referenced by project options
    const allSections = new Set();
    q2cIntakeConfig.projectSelection.options.forEach((opt) => {
      opt.followUpSections.forEach((s) => allSections.add(s));
    });

    // Every referenced section must exist in config.sections
    allSections.forEach((key) => {
      expect(q2cIntakeConfig.sections).toHaveProperty(key);
    });
  });

  test('has exactly 7 sections (systems, quoting, contracts, billing, payments, rev_rec, uploads)', () => {
    const sectionKeys = Object.keys(q2cIntakeConfig.sections);
    expect(sectionKeys).toHaveLength(7);
    expect(sectionKeys).toEqual(
      expect.arrayContaining(['systems', 'quoting', 'contracts', 'billing', 'payments', 'rev_rec', 'uploads'])
    );
  });

  test('each section has a label and questions array', () => {
    Object.entries(q2cIntakeConfig.sections).forEach(([key, section]) => {
      expect(typeof section.label).toBe('string');
      expect(Array.isArray(section.questions)).toBe(true);
      expect(section.questions.length).toBeGreaterThan(0);
    });
  });

  test('each question has id, type, and label', () => {
    Object.entries(q2cIntakeConfig.sections).forEach(([sectionKey, section]) => {
      section.questions.forEach((q) => {
        expect(typeof q.id).toBe('string');
        expect(typeof q.type).toBe('string');
        expect(['select', 'multi-select', 'text', 'textarea', 'boolean', 'file']).toContain(q.type);
        expect(typeof q.label).toBe('string');
      });
    });
  });

  test('select and multi-select questions have options arrays', () => {
    Object.entries(q2cIntakeConfig.sections).forEach(([sectionKey, section]) => {
      section.questions.forEach((q) => {
        if (q.type === 'select' || q.type === 'multi-select') {
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThan(0);
        }
      });
    });
  });

  // Systems section validations
  test('systems section has 5 questions covering CRM, CPQ, billing, ERP, e-signature', () => {
    const systems = q2cIntakeConfig.sections.systems;
    expect(systems.questions).toHaveLength(5);
    const ids = systems.questions.map(q => q.id);
    expect(ids).toContain('crm');
    expect(ids).toContain('cpq_tool');
    expect(ids).toContain('billing_system');
    expect(ids).toContain('erp_accounting');
    expect(ids).toContain('esign_tool');
  });

  test('systems CRM question is a select with Salesforce, HubSpot, Other', () => {
    const crmQ = q2cIntakeConfig.sections.systems.questions.find(q => q.id === 'crm');
    expect(crmQ.type).toBe('select');
    expect(crmQ.options).toEqual(['Salesforce', 'HubSpot', 'Other']);
  });

  test('systems e-signature question has correct options', () => {
    const esignQ = q2cIntakeConfig.sections.systems.questions.find(q => q.id === 'esign_tool');
    expect(esignQ.type).toBe('select');
    expect(esignQ.options).toEqual(['DocuSign', 'PandaDoc', 'Ironclad', 'None', 'Other']);
  });

  // Quoting section validations
  test('quoting section has 5 questions', () => {
    const quoting = q2cIntakeConfig.sections.quoting;
    expect(quoting.questions).toHaveLength(5);
  });

  test('quoting quote_creation_method is a select', () => {
    const q = q2cIntakeConfig.sections.quoting.questions.find(q => q.id === 'quote_creation_method');
    expect(q).toBeDefined();
    expect(q.type).toBe('select');
    expect(q.options).toContain('Spreadsheets');
    expect(q.options).toContain('CPQ tool');
  });

  test('quoting pricing_complexity has correct options', () => {
    const q = q2cIntakeConfig.sections.quoting.questions.find(q => q.id === 'pricing_complexity');
    expect(q).toBeDefined();
    expect(q.type).toBe('select');
    expect(q.options).toEqual(['Simple flat rate', 'Tiered pricing', 'Usage-based', 'Hybrid / complex']);
  });

  // Contracts section validations
  test('contracts section has 3 questions', () => {
    const contracts = q2cIntakeConfig.sections.contracts;
    expect(contracts.questions).toHaveLength(3);
  });

  test('contracts has a boolean question for standardized templates', () => {
    const q = q2cIntakeConfig.sections.contracts.questions.find(q => q.id === 'standardized_templates');
    expect(q).toBeDefined();
    expect(q.type).toBe('boolean');
  });

  // Billing section validations
  test('billing section has 3 questions', () => {
    const billing = q2cIntakeConfig.sections.billing;
    expect(billing.questions).toHaveLength(3);
  });

  test('billing_frequencies is a multi-select', () => {
    const q = q2cIntakeConfig.sections.billing.questions.find(q => q.id === 'billing_frequencies');
    expect(q).toBeDefined();
    expect(q.type).toBe('multi-select');
    expect(q.options).toEqual(
      expect.arrayContaining(['Monthly', 'Quarterly', 'Annual', 'Milestone-based', 'Usage-based'])
    );
  });

  // Payments section validations
  test('payments section has 3 questions', () => {
    const payments = q2cIntakeConfig.sections.payments;
    expect(payments.questions).toHaveLength(3);
  });

  test('payment_methods is a multi-select', () => {
    const q = q2cIntakeConfig.sections.payments.questions.find(q => q.id === 'payment_methods');
    expect(q).toBeDefined();
    expect(q.type).toBe('multi-select');
    expect(q.options).toEqual(
      expect.arrayContaining(['Credit card', 'ACH', 'Wire', 'Check', 'Other'])
    );
  });

  test('automated_dunning is a boolean', () => {
    const q = q2cIntakeConfig.sections.payments.questions.find(q => q.id === 'automated_dunning');
    expect(q).toBeDefined();
    expect(q.type).toBe('boolean');
  });

  // Rev Rec section validations
  test('rev_rec section has 3 questions', () => {
    const revRec = q2cIntakeConfig.sections.rev_rec;
    expect(revRec.questions).toHaveLength(3);
  });

  test('rev_rec_approach is a select with correct options', () => {
    const q = q2cIntakeConfig.sections.rev_rec.questions.find(q => q.id === 'rev_rec_approach');
    expect(q).toBeDefined();
    expect(q.type).toBe('select');
    expect(q.options).toEqual([
      'Cash basis',
      'Manual spreadsheets',
      'ERP-based',
      'Dedicated rev rec tool',
      'Unknown',
    ]);
  });

  test('audit_trail is a boolean', () => {
    const q = q2cIntakeConfig.sections.rev_rec.questions.find(q => q.id === 'audit_trail');
    expect(q).toBeDefined();
    expect(q.type).toBe('boolean');
  });

  // Uploads section validations
  test('uploads section has 3 file upload questions', () => {
    const uploads = q2cIntakeConfig.sections.uploads;
    expect(uploads.questions).toHaveLength(3);
    uploads.questions.forEach((q) => {
      expect(q.type).toBe('file');
    });
  });

  // Follow-up section mapping for specific project options
  test('Quoting & CPQ option maps to systems and quoting sections', () => {
    const opt = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'quoting-cpq');
    expect(opt.followUpSections).toEqual(['systems', 'quoting']);
  });

  test('Contract Management option maps to systems and contracts sections', () => {
    const opt = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'contract-management');
    expect(opt.followUpSections).toEqual(['systems', 'contracts']);
  });

  test('Billing & Invoicing option maps to systems and billing sections', () => {
    const opt = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'billing-invoicing');
    expect(opt.followUpSections).toEqual(['systems', 'billing']);
  });

  test('Payment Collection option maps to systems and payments sections', () => {
    const opt = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'payment-collection');
    expect(opt.followUpSections).toEqual(['systems', 'payments']);
  });

  test('Revenue Recognition option maps to systems and rev_rec sections', () => {
    const opt = q2cIntakeConfig.projectSelection.options.find(o => o.id === 'revenue-recognition');
    expect(opt.followUpSections).toEqual(['systems', 'rev_rec']);
  });
});
