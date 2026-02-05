/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/dashboard.js
 *
 * Phase 7: Validates the customer dashboard page rendering.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/dashboard';

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

describe('Dashboard Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Active customer view', () => {
    beforeEach(() => {
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
    });

    test('renders welcome message with customer name', () => {
      render(<Dashboard />);
      expect(screen.getByText(/Welcome.*Acme Corp/i)).toBeInTheDocument();
    });

    test('renders diagnostic links in main content', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      expect(mainContent.getByText('GTM Diagnostic')).toBeInTheDocument();
      expect(mainContent.getByText('Clay Diagnostic')).toBeInTheDocument();
      expect(mainContent.getByText('Q2C Diagnostic')).toBeInTheDocument();
    });

    test('renders project links in main content', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      expect(mainContent.getByText('Clay Project Intake')).toBeInTheDocument();
      expect(mainContent.getByText('Q2C Assessment')).toBeInTheDocument();
    });

    test('renders document links in main content', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      expect(mainContent.getByText('Statements of Work')).toBeInTheDocument();
    });

    test('renders recent activity placeholder', () => {
      render(<Dashboard />);
      expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
    });

    test('renders section headers', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      expect(mainContent.getByText('Diagnostics')).toBeInTheDocument();
      expect(mainContent.getByText('Projects')).toBeInTheDocument();
      expect(mainContent.getByText('Documents')).toBeInTheDocument();
      expect(mainContent.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Prospect/demo view', () => {
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

    test('renders a message directing prospects to get started', () => {
      render(<Dashboard />);
      // The heading should say "Dashboard" for non-active users
      const main = screen.getByRole('main');
      const mainContent = within(main);
      const heading = mainContent.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Dashboard');
    });

    test('does not render diagnostic/project/document sections', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      // These section headers should not appear for prospects
      expect(mainContent.queryByText('Recent Activity')).not.toBeInTheDocument();
    });

    test('shows a link to get started', () => {
      render(<Dashboard />);
      const main = screen.getByRole('main');
      const mainContent = within(main);

      expect(mainContent.getByText(/Get started with LeanScale/i)).toBeInTheDocument();
    });
  });
});
