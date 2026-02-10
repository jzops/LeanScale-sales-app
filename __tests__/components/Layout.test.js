/**
 * @jest-environment jsdom
 */

/**
 * Tests for components/Layout.js
 *
 * Phase 7: Validates the customer portal banner for active customers.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../../components/Layout';

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

// Mock the customer context
const mockUseCustomer = jest.fn();
jest.mock('../../context/CustomerContext', () => ({
  useCustomer: () => mockUseCustomer(),
}));

describe('Layout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows customer portal banner for active customers', () => {
    mockUseCustomer.mockReturnValue({
      customer: {
        slug: 'acme',
        customerName: 'Acme Corp',
        customerLogo: null,
        customerType: 'active',
      },
      isDemo: false,
      displayName: 'Acme Corp',
      customerType: 'active',
    });

    render(<Layout title="Test"><p>Content</p></Layout>);

    // The banner contains "Customer Portal" text with the customer name
    const bannerText = screen.getByText(/Customer Portal/);
    expect(bannerText).toBeInTheDocument();
    expect(bannerText.textContent).toContain('Acme Corp');
  });

  test('does NOT show customer portal banner for prospect customers', () => {
    mockUseCustomer.mockReturnValue({
      customer: {
        slug: 'demo',
        customerName: 'Demo',
        customerLogo: null,
        customerType: 'prospect',
      },
      isDemo: true,
      displayName: null,
      customerType: 'prospect',
    });

    render(<Layout title="Test"><p>Content</p></Layout>);

    expect(screen.queryByText(/Customer Portal/)).not.toBeInTheDocument();
  });

  test('does NOT show customer portal banner for demo', () => {
    mockUseCustomer.mockReturnValue({
      customer: {
        slug: 'demo',
        customerName: 'Demo',
        customerLogo: null,
        customerType: 'prospect',
      },
      isDemo: true,
      displayName: null,
      customerType: 'prospect',
    });

    render(<Layout title="Test"><p>Content</p></Layout>);

    expect(screen.queryByText(/Customer Portal/)).not.toBeInTheDocument();
  });

  test('renders children content', () => {
    mockUseCustomer.mockReturnValue({
      customer: {
        slug: 'demo',
        customerName: 'Demo',
        customerLogo: null,
        customerType: 'prospect',
      },
      isDemo: true,
      displayName: null,
      customerType: 'prospect',
    });

    render(<Layout title="Test"><p>Hello World</p></Layout>);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
