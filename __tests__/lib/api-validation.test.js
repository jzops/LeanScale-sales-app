const {
  diagnosticProcess,
  diagnosticGetQuery,
  diagnosticPutBody,
  sowFromDiagnosticBody,
  sowCreateBody,
  sowUpdateBody,
  sectionCreateBody,
  sectionReorderBody,
  validate,
  validateSafe,
} = require('../../lib/api-validation');

// Mock api-errors since validate() requires it
jest.mock('../../lib/api-errors', () => ({
  AppError: class AppError extends Error {
    constructor(code, message, statusCode, details) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
    }
  },
}));

describe('lib/api-validation', () => {
  // ==========================================
  // diagnosticProcess schema
  // ==========================================
  describe('diagnosticProcess', () => {
    test('accepts valid process', () => {
      const result = diagnosticProcess.safeParse({
        name: 'Lead Routing',
        status: 'warning',
        addToEngagement: true,
        function: 'Sales',
        serviceId: 'lead-routing',
      });
      expect(result.success).toBe(true);
    });

    test('rejects missing name', () => {
      const result = diagnosticProcess.safeParse({ status: 'healthy' });
      expect(result.success).toBe(false);
    });

    test('rejects invalid status', () => {
      const result = diagnosticProcess.safeParse({ name: 'Test', status: 'bad' });
      expect(result.success).toBe(false);
    });

    test('defaults addToEngagement to false', () => {
      const result = diagnosticProcess.safeParse({ name: 'Test', status: 'healthy' });
      expect(result.success).toBe(true);
      expect(result.data.addToEngagement).toBe(false);
    });
  });

  // ==========================================
  // diagnosticGetQuery
  // ==========================================
  describe('diagnosticGetQuery', () => {
    test('accepts valid query', () => {
      const result = diagnosticGetQuery.safeParse({
        type: 'gtm',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    test('rejects invalid diagnostic type', () => {
      const result = diagnosticGetQuery.safeParse({
        type: 'invalid',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(false);
    });

    test('rejects non-UUID customerId', () => {
      const result = diagnosticGetQuery.safeParse({ type: 'gtm', customerId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // diagnosticPutBody
  // ==========================================
  describe('diagnosticPutBody', () => {
    test('accepts valid body', () => {
      const result = diagnosticPutBody.safeParse({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        processes: [{ name: 'Test', status: 'healthy' }],
      });
      expect(result.success).toBe(true);
    });

    test('rejects empty processes array', () => {
      const result = diagnosticPutBody.safeParse({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        processes: [],
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // sowFromDiagnosticBody
  // ==========================================
  describe('sowFromDiagnosticBody', () => {
    test('accepts valid body', () => {
      const result = sowFromDiagnosticBody.safeParse({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        diagnosticResultId: '550e8400-e29b-41d4-a716-446655440001',
        sowType: 'custom',
      });
      expect(result.success).toBe(true);
      expect(result.data.diagnosticType).toBe('gtm'); // default
    });

    test('rejects invalid sowType', () => {
      const result = sowFromDiagnosticBody.safeParse({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        diagnosticResultId: '550e8400-e29b-41d4-a716-446655440001',
        sowType: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // sowCreateBody
  // ==========================================
  describe('sowCreateBody', () => {
    test('accepts minimal valid body', () => {
      const result = sowCreateBody.safeParse({ title: 'Test SOW', sowType: 'clay' });
      expect(result.success).toBe(true);
      expect(result.data.content).toEqual({});
    });

    test('rejects empty title', () => {
      const result = sowCreateBody.safeParse({ title: '', sowType: 'clay' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // sowUpdateBody
  // ==========================================
  describe('sowUpdateBody', () => {
    test('accepts partial update', () => {
      const result = sowUpdateBody.safeParse({ status: 'review' });
      expect(result.success).toBe(true);
    });

    test('rejects invalid status', () => {
      const result = sowUpdateBody.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });

    test('accepts empty object', () => {
      const result = sowUpdateBody.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // sectionCreateBody
  // ==========================================
  describe('sectionCreateBody', () => {
    test('accepts valid section', () => {
      const result = sectionCreateBody.safeParse({
        title: 'Lead Routing Implementation',
        hours: 40,
        rate: 200,
      });
      expect(result.success).toBe(true);
    });

    test('rejects missing title', () => {
      const result = sectionCreateBody.safeParse({ hours: 40 });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // sectionReorderBody
  // ==========================================
  describe('sectionReorderBody', () => {
    test('accepts valid reorder', () => {
      const result = sectionReorderBody.safeParse({
        ordering: [
          { id: '550e8400-e29b-41d4-a716-446655440000', sortOrder: 0 },
          { id: '550e8400-e29b-41d4-a716-446655440001', sortOrder: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });

    test('rejects empty ordering', () => {
      const result = sectionReorderBody.safeParse({ ordering: [] });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // validate() helper
  // ==========================================
  describe('validate()', () => {
    test('returns parsed data on valid input', () => {
      const data = validate(sowUpdateBody, { status: 'draft' });
      expect(data).toEqual({ status: 'draft' });
    });

    test('throws AppError on invalid input', () => {
      expect(() => validate(sowUpdateBody, { status: 'bad' })).toThrow();
      try {
        validate(sowUpdateBody, { status: 'bad' });
      } catch (e) {
        expect(e.code).toBe('VALIDATION_ERROR');
        expect(e.statusCode).toBe(400);
        expect(e.details).toBeInstanceOf(Array);
      }
    });
  });

  // ==========================================
  // validateSafe() helper
  // ==========================================
  describe('validateSafe()', () => {
    test('returns success with data on valid input', () => {
      const result = validateSafe(sowUpdateBody, { status: 'draft' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ status: 'draft' });
    });

    test('returns error array on invalid input', () => {
      const result = validateSafe(sowUpdateBody, { status: 'bad' });
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Array);
      expect(result.error[0]).toHaveProperty('path');
      expect(result.error[0]).toHaveProperty('message');
    });
  });
});
