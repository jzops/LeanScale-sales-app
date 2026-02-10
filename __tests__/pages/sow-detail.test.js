/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/sow/[id].js
 *
 * Phase 6: Validates the SOW detail/view page.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/head
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return <>{children}</>;
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock next/router
const mockPush = jest.fn();
const mockQuery = { id: 'sow-abc-123' };
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: mockQuery,
    isReady: true,
  }),
}));

// Mock customer context
const mockUseCustomer = jest.fn();
jest.mock('../../context/CustomerContext', () => ({
  useCustomer: () => mockUseCustomer(),
}));

// Mock Layout
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return <div data-testid="layout" data-title={title}>{children}</div>;
  };
});

// Mock SowPreview
jest.mock('../../components/SowPreview', () => {
  return function MockSowPreview({ content }) {
    return <div data-testid="sow-preview">{JSON.stringify(content)}</div>;
  };
});

import SowDetail from '../../pages/sow/[id]';

const mockSow = {
  id: 'sow-abc-123',
  title: 'SOW for Acme Corp - Clay engagement',
  sow_type: 'clay',
  status: 'draft',
  created_at: '2026-01-15T10:00:00Z',
  created_by: 'jake',
  content: {
    executive_summary: 'Test executive summary',
    client_info: { company: 'Acme Corp' },
  },
};

describe('SOW Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCustomer.mockReturnValue({
      customer: { id: 'cust-123', slug: 'acme', customerName: 'Acme Corp' },
      isDemo: false,
      displayName: 'Acme Corp',
      customerType: 'active',
      loading: false,
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('renders within Layout', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('fetches SOW by ID from router query', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/sow/sow-abc-123');
    });
  });

  test('displays SOW title', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText('SOW for Acme Corp - Clay engagement')).toBeInTheDocument();
    });
  });

  test('displays status badge', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      // Status badge renders as a styled span, distinct from the select option
      const badges = screen.getAllByText('draft');
      // At least one is the badge (span element)
      const badgeSpan = badges.find((el) => el.tagName === 'SPAN');
      expect(badgeSpan).toBeInTheDocument();
    });
  });

  test('displays SOW metadata (type, created by)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText(/Type:.*clay/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Created by:.*jake/i)).toBeInTheDocument();
  });

  test('renders SowPreview with content', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByTestId('sow-preview')).toBeInTheDocument();
    });
  });

  test('renders back link to SOW dashboard', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      const backLink = screen.getByText(/back to/i);
      expect(backLink.closest('a')).toHaveAttribute('href', '/sow');
    });
  });

  test('renders status update dropdown', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });
  });

  test('can change status via dropdown', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSow }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { ...mockSow, status: 'review' } }),
      });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'review' } });

    const updateBtn = screen.getByText('Update Status');
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sow/sow-abc-123',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  test('shows loading state', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves

    render(<SowDetail />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows error state on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('renders Edit button', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSow }),
    });

    render(<SowDetail />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });
});
