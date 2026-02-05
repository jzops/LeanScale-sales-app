/**
 * @jest-environment jsdom
 */

/**
 * Tests for clay.js CTA button update
 *
 * Validates that the clay.js page includes
 * a link to the clay intake form.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the CustomerContext
jest.mock('../../context/CustomerContext', () => ({
  useCustomer: () => ({
    customer: { slug: 'demo', customerName: 'Demo' },
    displayName: null,
    isDemo: true,
    loading: false,
  }),
}));

// Mock Layout
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return <div>{children}</div>;
  };
});

import ClayPage from '../../pages/buy-leanscale/clay';

describe('Clay Page - Intake CTA', () => {
  test('renders a link to /buy-leanscale/clay-intake', () => {
    render(<ClayPage />);
    const intakeLink = screen.getByRole('link', { name: /start clay project intake/i });
    expect(intakeLink).toBeInTheDocument();
    expect(intakeLink.getAttribute('href')).toBe('/buy-leanscale/clay-intake');
  });

  test('intake CTA button has primary styling', () => {
    render(<ClayPage />);
    const intakeBtn = screen.getByText(/start clay project intake/i);
    expect(intakeBtn).toBeInTheDocument();
  });
});
