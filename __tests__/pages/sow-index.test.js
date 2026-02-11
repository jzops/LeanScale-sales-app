/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/sow/index.js
 *
 * Phase 6: Validates the SOW dashboard/listing page.
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
const mockReplace = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    query: {},
    pathname: '/sow',
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

import SowIndex from '../../pages/sow/index';

const mockSows = [
  {
    id: 'sow-1',
    title: 'SOW for Acme Corp - Clay',
    sow_type: 'clay',
    status: 'draft',
    created_at: '2026-01-15T10:00:00Z',
    created_by: 'jake',
  },
  {
    id: 'sow-2',
    title: 'SOW for Beta Inc - Q2C',
    sow_type: 'q2c',
    status: 'generated',
    created_at: '2026-01-20T14:00:00Z',
    created_by: 'izzy',
  },
  {
    id: 'sow-3',
    title: 'SOW for Gamma LLC - Embedded',
    sow_type: 'embedded',
    status: 'review',
    created_at: '2026-01-22T09:00:00Z',
    created_by: null,
  },
  {
    id: 'sow-4',
    title: 'SOW for Delta Co - Custom',
    sow_type: 'custom',
    status: 'approved',
    created_at: '2026-02-01T12:00:00Z',
    created_by: 'brian',
  },
];

describe('SOW Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCustomer.mockReturnValue({
      customer: { id: 'cust-123', slug: 'acme', customerName: 'Acme Corp', diagnosticType: 'gtm' },
      isDemo: false,
      displayName: 'Acme Corp',
      customerType: 'active',
      customerPath: (p) => p,
      loading: false,
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('renders within Layout with correct title', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<SowIndex />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('layout').dataset.title).toBe('Statements of Work');
  });

  test('renders page heading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<SowIndex />);
    expect(screen.getByText('Statements of Work')).toBeInTheDocument();
  });

  test('fetches SOWs on mount with customer ID', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSows }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sow?customerId=cust-123')
      );
    });
  });

  test('displays SOW list after loading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSows }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText('SOW for Acme Corp - Clay')).toBeInTheDocument();
    });

    expect(screen.getByText('SOW for Beta Inc - Q2C')).toBeInTheDocument();
    expect(screen.getByText('SOW for Gamma LLC - Embedded')).toBeInTheDocument();
    expect(screen.getByText('SOW for Delta Co - Custom')).toBeInTheDocument();
  });

  test('displays status badges', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSows }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    expect(screen.getByText('generated')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  test('displays SOW types', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSows }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText('clay')).toBeInTheDocument();
    });

    expect(screen.getByText('q2c')).toBeInTheDocument();
    expect(screen.getByText('embedded')).toBeInTheDocument();
    expect(screen.getByText('custom')).toBeInTheDocument();
  });

  test('shows "New SOW from Diagnostic" button linking to diagnostic page', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSows }),
    });

    render(<SowIndex />);
    const link = screen.getByText('New SOW from Diagnostic');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/try-leanscale/diagnostic');
  });

  test('shows empty state when no SOWs and no diagnostic exists', async () => {
    // First fetch: SOW list returns empty
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    // Second fetch: diagnostic check returns no data (triggers empty state)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText(/no statements of work/i)).toBeInTheDocument();
    });
  });

  test('empty state includes CTA to diagnostic', async () => {
    // First fetch: SOW list returns empty
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    // Second fetch: diagnostic check returns no data
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      const cta = screen.getByText('Go to Diagnostic');
      expect(cta).toBeInTheDocument();
      expect(cta.closest('a')).toHaveAttribute('href', '/try-leanscale/diagnostic');
    });
  });

  test('shows loading state initially', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves

    render(<SowIndex />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows error state on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('SOW rows link to detail page', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockSows[0]] }),
    });

    render(<SowIndex />);

    await waitFor(() => {
      expect(screen.getByText('SOW for Acme Corp - Clay')).toBeInTheDocument();
    });

    const titleLink = screen.getByText('SOW for Acme Corp - Clay').closest('a');
    expect(titleLink).toHaveAttribute('href', '/sow/sow-1');
  });
});
