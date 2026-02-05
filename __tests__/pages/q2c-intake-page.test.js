/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/buy-leanscale/q2c-intake.js
 *
 * Validates the Q2C intake page renders correctly
 * with the IntakeForm component and q2c config.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the CustomerContext
jest.mock('../../context/CustomerContext', () => ({
  useCustomer: () => ({
    customer: { slug: 'test-customer', customerName: 'Test' },
    displayName: 'Test',
    isDemo: false,
    loading: false,
  }),
}));

// Mock Layout to just render children (avoids full nav/head setup)
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children, title }) {
    return <div data-testid="layout" data-title={title}>{children}</div>;
  };
});

// Mock IntakeForm to verify it receives correct props
jest.mock('../../components/IntakeForm', () => {
  return function MockIntakeForm({ config, customerSlug }) {
    return (
      <div data-testid="intake-form" data-config-id={config?.id} data-customer-slug={customerSlug}>
        Mock IntakeForm
      </div>
    );
  };
});

import Q2CIntakePage from '../../pages/buy-leanscale/q2c-intake';

describe('Q2C Intake Page', () => {
  test('renders within Layout', () => {
    render(<Q2CIntakePage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('passes q2c-intake config to IntakeForm', () => {
    render(<Q2CIntakePage />);
    const form = screen.getByTestId('intake-form');
    expect(form.dataset.configId).toBe('q2c-intake');
  });

  test('passes customerSlug to IntakeForm', () => {
    render(<Q2CIntakePage />);
    const form = screen.getByTestId('intake-form');
    expect(form.dataset.customerSlug).toBe('test-customer');
  });

  test('renders page header with Quote-to-Cash title', () => {
    render(<Q2CIntakePage />);
    expect(screen.getByText(/Quote-to-Cash Project Intake/i)).toBeInTheDocument();
  });

  test('renders subtitle about Q2C process', () => {
    render(<Q2CIntakePage />);
    expect(screen.getByText(/quote-to-cash process/i)).toBeInTheDocument();
  });
});
