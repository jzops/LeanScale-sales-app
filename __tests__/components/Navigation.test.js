/**
 * @jest-environment jsdom
 */

/**
 * Tests for components/Navigation.js
 *
 * Phase 7: Validates conditional navigation rendering:
 * - Prospect customers see Why/Try/Buy dropdowns
 * - Active customers see Diagnostics/Projects/Documents dropdowns
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../../components/Navigation';

// Mock next/link to render a plain <a> tag
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

describe('Navigation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Prospect Navigation (default)', () => {
    beforeEach(() => {
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
    });

    test('renders Why LeanScale? dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Why LeanScale\?/)).toBeInTheDocument();
    });

    test('renders Try LeanScale dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Try LeanScale/)).toBeInTheDocument();
    });

    test('renders Buy LeanScale dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Buy LeanScale/)).toBeInTheDocument();
    });

    test('does NOT render Diagnostics dropdown', () => {
      render(<Navigation />);
      // Should not have the active-customer nav sections
      expect(screen.queryByText('Diagnostics')).not.toBeInTheDocument();
    });

    test('does NOT render Projects dropdown', () => {
      render(<Navigation />);
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    });

    test('does NOT render Documents dropdown', () => {
      render(<Navigation />);
      expect(screen.queryByText('Documents')).not.toBeInTheDocument();
    });

    test('renders Get Started CTA', () => {
      render(<Navigation />);
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  describe('Active Customer Navigation', () => {
    beforeEach(() => {
      mockUseCustomer.mockReturnValue({
        customer: {
          slug: 'acme',
          customerName: 'Acme Corp',
          customerLogo: '/acme.png',
          customerType: 'active',
        },
        isDemo: false,
        displayName: 'Acme Corp',
        customerType: 'active',
      });
    });

    test('renders Diagnostics dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Diagnostics/)).toBeInTheDocument();
    });

    test('renders Projects dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Projects/)).toBeInTheDocument();
    });

    test('renders Documents dropdown button', () => {
      render(<Navigation />);
      expect(screen.getByText(/Documents/)).toBeInTheDocument();
    });

    test('does NOT render Why LeanScale? dropdown', () => {
      render(<Navigation />);
      expect(screen.queryByText(/Why LeanScale\?/)).not.toBeInTheDocument();
    });

    test('does NOT render Try LeanScale dropdown', () => {
      render(<Navigation />);
      expect(screen.queryByText(/Try LeanScale/)).not.toBeInTheDocument();
    });

    test('does NOT render Buy LeanScale dropdown', () => {
      render(<Navigation />);
      expect(screen.queryByText(/Buy LeanScale/)).not.toBeInTheDocument();
    });

    test('renders GTM Diagnostic link', () => {
      render(<Navigation />);
      expect(screen.getByText('GTM Diagnostic')).toBeInTheDocument();
    });

    test('renders Clay Diagnostic link', () => {
      render(<Navigation />);
      expect(screen.getByText('Clay Diagnostic')).toBeInTheDocument();
    });

    test('renders Q2C Diagnostic link', () => {
      render(<Navigation />);
      expect(screen.getByText('Q2C Diagnostic')).toBeInTheDocument();
    });

    test('renders Clay Project Intake link', () => {
      render(<Navigation />);
      expect(screen.getByText('Clay Project Intake')).toBeInTheDocument();
    });

    test('renders Q2C Assessment link', () => {
      render(<Navigation />);
      expect(screen.getByText('Q2C Assessment')).toBeInTheDocument();
    });

    test('renders Statements of Work link', () => {
      render(<Navigation />);
      expect(screen.getByText('Statements of Work')).toBeInTheDocument();
    });

    test('renders Dashboard CTA instead of Get Started', () => {
      render(<Navigation />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });
  });

  describe('Churned Customer Navigation', () => {
    beforeEach(() => {
      mockUseCustomer.mockReturnValue({
        customer: {
          slug: 'oldco',
          customerName: 'OldCo',
          customerLogo: null,
          customerType: 'churned',
        },
        isDemo: false,
        displayName: 'OldCo',
        customerType: 'churned',
      });
    });

    test('renders prospect navigation (Why/Try/Buy) for churned customers', () => {
      render(<Navigation />);
      expect(screen.getByText(/Why LeanScale\?/)).toBeInTheDocument();
      expect(screen.getByText(/Try LeanScale/)).toBeInTheDocument();
      expect(screen.getByText(/Buy LeanScale/)).toBeInTheDocument();
    });
  });
});
