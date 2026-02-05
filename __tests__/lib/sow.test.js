/**
 * Tests for lib/sow.js - SOW and Diagnostic Snapshot helper functions
 *
 * These tests mock the Supabase clients to test the helper functions
 * in isolation without requiring a real database connection.
 */

// Mock the supabase module before importing sow.js
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

// Build chainable mock
function buildChain(finalResult) {
  const chain = {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  };

  // Each method returns the chain for fluent API
  mockFrom.mockReturnValue(chain);
  mockSelect.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockDelete.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockSingle.mockReturnValue(finalResult || { data: null, error: null });

  return chain;
}

// Mock supabase clients
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
  supabaseAdmin: {
    from: (...args) => mockFrom(...args),
  },
}));

const {
  listSows,
  getSowById,
  createSow,
  updateSow,
  deleteSow,
  listDiagnosticSnapshots,
  createDiagnosticSnapshot,
} = require('../../lib/sow');

describe('lib/sow.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // listSows
  // ==========================================
  describe('listSows', () => {
    test('returns all SOWs when no filters provided', async () => {
      const mockSows = [
        { id: '1', title: 'SOW 1', status: 'draft' },
        { id: '2', title: 'SOW 2', status: 'sent' },
      ];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSows, error: null });

      const result = await listSows();
      expect(result).toEqual(mockSows);
      expect(mockFrom).toHaveBeenCalledWith('sows');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    test('filters by customerId when provided', async () => {
      const mockSows = [{ id: '1', title: 'SOW 1', customer_id: 'cust-1' }];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSows, error: null });

      const result = await listSows({ customerId: 'cust-1' });
      expect(result).toEqual(mockSows);
      expect(mockEq).toHaveBeenCalledWith('customer_id', 'cust-1');
    });

    test('filters by status when provided', async () => {
      const mockSows = [{ id: '1', title: 'SOW 1', status: 'draft' }];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSows, error: null });

      const result = await listSows({ status: 'draft' });
      expect(result).toEqual(mockSows);
      expect(mockEq).toHaveBeenCalledWith('status', 'draft');
    });

    test('returns empty array on error', async () => {
      buildChain();
      mockOrder.mockReturnValue({ data: null, error: { message: 'DB error' } });

      const result = await listSows();
      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // getSowById
  // ==========================================
  describe('getSowById', () => {
    test('returns SOW when found', async () => {
      const mockSow = { id: 'sow-1', title: 'Test SOW', status: 'draft' };

      buildChain();
      mockSingle.mockReturnValue({ data: mockSow, error: null });

      const result = await getSowById('sow-1');
      expect(result).toEqual(mockSow);
      expect(mockFrom).toHaveBeenCalledWith('sows');
      expect(mockEq).toHaveBeenCalledWith('id', 'sow-1');
    });

    test('returns null when not found', async () => {
      buildChain();
      mockSingle.mockReturnValue({ data: null, error: { message: 'Not found' } });

      const result = await getSowById('nonexistent');
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // createSow
  // ==========================================
  describe('createSow', () => {
    test('creates a SOW with all fields', async () => {
      const newSow = {
        id: 'new-1',
        title: 'New SOW',
        sow_type: 'clay',
        customer_id: 'cust-1',
      };

      buildChain();
      mockSingle.mockReturnValue({ data: newSow, error: null });

      const result = await createSow({
        customerId: 'cust-1',
        title: 'New SOW',
        sowType: 'clay',
        intakeSubmissionId: 'sub-1',
        transcriptText: 'transcript here',
        diagnosticSnapshot: { key: 'value' },
        content: { sections: [] },
        createdBy: 'admin',
      });

      expect(result).toEqual(newSow);
      expect(mockFrom).toHaveBeenCalledWith('sows');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'cust-1',
          title: 'New SOW',
          sow_type: 'clay',
          intake_submission_id: 'sub-1',
          transcript_text: 'transcript here',
          diagnostic_snapshot: { key: 'value' },
          content: { sections: [] },
          created_by: 'admin',
        })
      );
    });

    test('creates a SOW with minimal fields', async () => {
      const newSow = { id: 'new-2', title: 'Minimal SOW', sow_type: 'q2c' };

      buildChain();
      mockSingle.mockReturnValue({ data: newSow, error: null });

      const result = await createSow({
        title: 'Minimal SOW',
        sowType: 'q2c',
      });

      expect(result).toEqual(newSow);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Minimal SOW',
          sow_type: 'q2c',
        })
      );
    });

    test('returns null on error', async () => {
      buildChain();
      mockSingle.mockReturnValue({ data: null, error: { message: 'Insert failed' } });

      const result = await createSow({ title: 'Fail', sowType: 'clay' });
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // updateSow
  // ==========================================
  describe('updateSow', () => {
    test('updates SOW with partial data', async () => {
      const updated = { id: 'sow-1', title: 'Updated', status: 'review' };

      buildChain();
      mockSingle.mockReturnValue({ data: updated, error: null });

      const result = await updateSow('sow-1', { status: 'review' });
      expect(result).toEqual(updated);
      expect(mockFrom).toHaveBeenCalledWith('sows');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'review' });
      expect(mockEq).toHaveBeenCalledWith('id', 'sow-1');
    });

    test('returns null on error', async () => {
      buildChain();
      mockSingle.mockReturnValue({ data: null, error: { message: 'Update failed' } });

      const result = await updateSow('sow-1', { status: 'invalid' });
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // deleteSow
  // ==========================================
  describe('deleteSow', () => {
    test('deletes SOW and returns true', async () => {
      buildChain();
      mockEq.mockReturnValue({ error: null });

      const result = await deleteSow('sow-1');
      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('sows');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'sow-1');
    });

    test('returns false on error', async () => {
      buildChain();
      mockEq.mockReturnValue({ error: { message: 'Delete failed' } });

      const result = await deleteSow('sow-1');
      expect(result).toBe(false);
    });
  });

  // ==========================================
  // listDiagnosticSnapshots
  // ==========================================
  describe('listDiagnosticSnapshots', () => {
    test('returns all snapshots when no filters', async () => {
      const mockSnapshots = [
        { id: '1', diagnostic_type: 'gtm', data: {} },
        { id: '2', diagnostic_type: 'clay', data: {} },
      ];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSnapshots, error: null });

      const result = await listDiagnosticSnapshots();
      expect(result).toEqual(mockSnapshots);
      expect(mockFrom).toHaveBeenCalledWith('diagnostic_snapshots');
    });

    test('filters by customerId', async () => {
      const mockSnapshots = [{ id: '1', customer_id: 'cust-1' }];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSnapshots, error: null });

      const result = await listDiagnosticSnapshots({ customerId: 'cust-1' });
      expect(result).toEqual(mockSnapshots);
      expect(mockEq).toHaveBeenCalledWith('customer_id', 'cust-1');
    });

    test('filters by diagnosticType', async () => {
      const mockSnapshots = [{ id: '1', diagnostic_type: 'gtm' }];

      buildChain();
      mockOrder.mockReturnValue({ data: mockSnapshots, error: null });

      const result = await listDiagnosticSnapshots({ diagnosticType: 'gtm' });
      expect(result).toEqual(mockSnapshots);
      expect(mockEq).toHaveBeenCalledWith('diagnostic_type', 'gtm');
    });

    test('returns empty array on error', async () => {
      buildChain();
      mockOrder.mockReturnValue({ data: null, error: { message: 'Error' } });

      const result = await listDiagnosticSnapshots();
      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // createDiagnosticSnapshot
  // ==========================================
  describe('createDiagnosticSnapshot', () => {
    test('creates snapshot with all fields', async () => {
      const newSnapshot = {
        id: 'snap-1',
        customer_id: 'cust-1',
        diagnostic_type: 'gtm',
        data: { score: 85 },
        assessed_by: 'admin',
      };

      buildChain();
      mockSingle.mockReturnValue({ data: newSnapshot, error: null });

      const result = await createDiagnosticSnapshot({
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: { score: 85 },
        assessedBy: 'admin',
      });

      expect(result).toEqual(newSnapshot);
      expect(mockFrom).toHaveBeenCalledWith('diagnostic_snapshots');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'cust-1',
          diagnostic_type: 'gtm',
          data: { score: 85 },
          assessed_by: 'admin',
        })
      );
    });

    test('returns null on error', async () => {
      buildChain();
      mockSingle.mockReturnValue({ data: null, error: { message: 'Insert failed' } });

      const result = await createDiagnosticSnapshot({
        customerId: 'cust-1',
        diagnosticType: 'gtm',
        data: {},
      });
      expect(result).toBeNull();
    });
  });
});
