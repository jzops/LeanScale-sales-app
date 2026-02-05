/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/sow/generate.js
 *
 * Phase 6: Validates the multi-step SOW generation wizard.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
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

import SowGenerate from '../../pages/sow/generate';

describe('SOW Generation Wizard', () => {
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

  test('renders within Layout with correct title', () => {
    render(<SowGenerate />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('layout').dataset.title).toBe('Generate SOW');
  });

  test('renders gradient header', () => {
    render(<SowGenerate />);
    expect(screen.getByText('Generate Statement of Work')).toBeInTheDocument();
  });

  // ---- Step 1: Select SOW Type ----

  test('starts on Step 1 - Select SOW Type', () => {
    render(<SowGenerate />);
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    expect(screen.getByText(/select.*type/i)).toBeInTheDocument();
  });

  test('shows all four SOW type options', () => {
    render(<SowGenerate />);
    expect(screen.getByText('Clay')).toBeInTheDocument();
    expect(screen.getByText('Quote-to-Cash')).toBeInTheDocument();
    expect(screen.getByText('Embedded')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  test('can select a SOW type', () => {
    render(<SowGenerate />);
    const clayRadio = screen.getByRole('radio', { name: /Clay/ });
    fireEvent.click(clayRadio);
    expect(clayRadio).toBeChecked();
  });

  test('Next button is disabled until a type is selected', () => {
    render(<SowGenerate />);
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).toBeDisabled();
  });

  test('can advance to Step 2 after selecting type', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/step 2/i)).toBeInTheDocument();
  });

  // ---- Step 2: Transcript ----

  test('Step 2 shows transcript input', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Step 2: Call Transcript')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('can enter transcript text', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a call transcript.' } });
    expect(textarea.value).toBe('This is a call transcript.');
  });

  test('can go back to Step 1 from Step 2', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });

  test('can advance to Step 3 from Step 2', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    // Step 2 -> Next
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/step 3/i)).toBeInTheDocument();
  });

  // ---- Step 3: Optional Attachments ----

  test('Step 3 shows optional diagnostic snapshot and intake fields', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Diagnostic Snapshot ID')).toBeInTheDocument();
    expect(screen.getByText('Intake Submission ID')).toBeInTheDocument();
  });

  test('can advance to Step 4 from Step 3', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText(/step 4/i)).toBeInTheDocument();
  });

  // ---- Step 4: Review and Generate ----

  test('Step 4 shows review of inputs', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'My transcript.' } });

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText(/Review and Generate/i)).toBeInTheDocument();
    // The SOW Type value should show in the review summary
    expect(screen.getByText('SOW Type:')).toBeInTheDocument();
  });

  test('Step 4 shows Generate button', () => {
    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  test('submits to /api/sow/generate on Generate click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'new-sow-id', title: 'Generated SOW' },
      }),
    });

    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sow/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  test('redirects to detail page on successful generation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'new-sow-id', title: 'Generated SOW' },
      }),
    });

    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sow/new-sow-id');
    });
  });

  test('shows loading state during generation', async () => {
    let resolvePromise;
    global.fetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Generate'));

    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  test('shows error on generation failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<SowGenerate />);
    fireEvent.click(screen.getByRole('radio', { name: /Clay/ }));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('step indicator shows progress', () => {
    render(<SowGenerate />);
    // Should show step indicators (1,2,3,4)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
