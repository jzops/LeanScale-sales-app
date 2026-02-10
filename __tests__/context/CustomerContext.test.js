/**
 * @jest-environment jsdom
 */

/**
 * Tests for context/CustomerContext.js
 *
 * Phase 7: Validates that customerType is exposed in the context value
 * and defaults to 'prospect'.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CustomerProvider, useCustomer } from '../../context/CustomerContext';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Test component that displays context values
function TestConsumer() {
  const { customer, customerType, isDemo, displayName } = useCustomer();
  return (
    <div>
      <span data-testid="customer-type">{customerType}</span>
      <span data-testid="customer-name">{customer.customerName}</span>
      <span data-testid="is-demo">{String(isDemo)}</span>
      <span data-testid="display-name">{displayName || 'null'}</span>
    </div>
  );
}

describe('CustomerContext', () => {
  test('defaults customerType to prospect when no initial customer', async () => {
    // Mock fetch to return a failed response so defaults are used
    global.fetch.mockResolvedValue({ ok: false });

    render(
      <CustomerProvider>
        <TestConsumer />
      </CustomerProvider>
    );

    // Initial render uses default customer
    expect(screen.getByTestId('customer-type')).toHaveTextContent('prospect');
  });

  test('provides customerType from initial customer data', () => {
    const initialCustomer = {
      slug: 'acme',
      customerName: 'Acme Corp',
      customerLogo: null,
      ndaLink: null,
      intakeFormLink: null,
      youtubeVideoId: null,
      googleSlidesEmbedUrl: null,
      assignedTeam: [],
      isDemo: false,
      customerType: 'active',
    };

    render(
      <CustomerProvider initialCustomer={initialCustomer}>
        <TestConsumer />
      </CustomerProvider>
    );

    expect(screen.getByTestId('customer-type')).toHaveTextContent('active');
    expect(screen.getByTestId('customer-name')).toHaveTextContent('Acme Corp');
  });

  test('provides customerType as prospect for prospect customers', () => {
    const initialCustomer = {
      slug: 'newco',
      customerName: 'NewCo',
      customerLogo: null,
      ndaLink: null,
      intakeFormLink: null,
      youtubeVideoId: null,
      googleSlidesEmbedUrl: null,
      assignedTeam: [],
      isDemo: false,
      customerType: 'prospect',
    };

    render(
      <CustomerProvider initialCustomer={initialCustomer}>
        <TestConsumer />
      </CustomerProvider>
    );

    expect(screen.getByTestId('customer-type')).toHaveTextContent('prospect');
  });

  test('default customer object has customerType of prospect', async () => {
    global.fetch.mockResolvedValue({ ok: false });

    render(
      <CustomerProvider>
        <TestConsumer />
      </CustomerProvider>
    );

    // The default customer should have customerType 'prospect'
    expect(screen.getByTestId('customer-type')).toHaveTextContent('prospect');
    expect(screen.getByTestId('is-demo')).toHaveTextContent('true');
  });
});
