/**
 * @jest-environment jsdom
 */

/**
 * Tests for pages/buy-leanscale/clay-intake.js
 *
 * Validates the Clay intake page renders correctly
 * with the IntakeForm component and clay config.
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

import ClayIntakePage from '../../pages/buy-leanscale/clay-intake';

describe('Clay Intake Page', () => {
  test('renders within Layout', () => {
    render(<ClayIntakePage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('passes clay-intake config to IntakeForm', () => {
    render(<ClayIntakePage />);
    const form = screen.getByTestId('intake-form');
    expect(form.dataset.configId).toBe('clay-intake');
  });

  test('passes customerSlug to IntakeForm', () => {
    render(<ClayIntakePage />);
    const form = screen.getByTestId('intake-form');
    expect(form.dataset.customerSlug).toBe('test-customer');
  });

  test('renders page header with Clay Project Intake title', () => {
    render(<ClayIntakePage />);
    expect(screen.getByText(/Clay Project Intake/i)).toBeInTheDocument();
  });
});
