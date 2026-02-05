/**
 * @jest-environment jsdom
 */

/**
 * Tests for components/SowPreview.js
 *
 * Phase 6: Validates the reusable SOW content renderer.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// SowPreview should not need Layout or Router
import SowPreview from '../../components/SowPreview';

const mockContent = {
  executive_summary: 'This is the executive summary for Acme Corp.',
  client_info: {
    company: 'Acme Corp',
    primary_contact: 'Jane Doe',
    stage: 'Growth',
    crm: 'Salesforce',
    industry: 'SaaS',
  },
  scope: [
    {
      title: 'Clay Implementation',
      description: 'Full Clay setup and integration.',
      deliverables: ['API integration', 'Workflow automation', 'Training'],
    },
  ],
  deliverables_table: [
    { deliverable: 'Discovery Document', description: 'Current state assessment', integration: 'CRM' },
    { deliverable: 'Implementation Plan', description: 'Detailed roadmap', integration: 'GTM Stack' },
  ],
  timeline: [
    { phase: 'Week 1-2', activities: 'Discovery and assessment', duration: '10 days' },
    { phase: 'Week 3-4', activities: 'Implementation', duration: '10 days' },
  ],
  investment: {
    total: 25000,
    payment_terms: 'Net 30',
    breakdown: [
      { item: 'Discovery', amount: 5000 },
      { item: 'Implementation', amount: 20000 },
    ],
  },
  team: [
    { role: 'Principal Project Owner', responsibility: 'Strategy and oversight' },
    { role: 'Architect', responsibility: 'Hands-on implementation' },
  ],
  assumptions: [
    'Client will provide timely access to systems',
    'Scope changes require mutual agreement',
  ],
  acceptance_criteria: [
    'All deliverables completed and reviewed',
    'Client sign-off on implementation',
  ],
};

describe('SowPreview Component', () => {
  test('renders executive summary section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText(mockContent.executive_summary)).toBeInTheDocument();
  });

  test('renders client info section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Client Information')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
  });

  test('renders scope section with deliverables', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Clay Implementation')).toBeInTheDocument();
    expect(screen.getByText('Full Clay setup and integration.')).toBeInTheDocument();
    expect(screen.getByText('API integration')).toBeInTheDocument();
    expect(screen.getByText('Workflow automation')).toBeInTheDocument();
  });

  test('renders deliverables table as an HTML table', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Deliverables')).toBeInTheDocument();
    // Should have a table with rows
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    const rows = within(table).getAllByRole('row');
    // header row + 2 data rows
    expect(rows.length).toBe(3);
    expect(within(table).getByText('Discovery Document')).toBeInTheDocument();
    expect(within(table).getByText('Implementation Plan')).toBeInTheDocument();
  });

  test('renders timeline section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Week 1-2')).toBeInTheDocument();
    expect(screen.getByText('Discovery and assessment')).toBeInTheDocument();
    expect(screen.getByText('Week 3-4')).toBeInTheDocument();
  });

  test('renders investment section with total and breakdown', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Investment')).toBeInTheDocument();
    expect(screen.getByText(/\$25,000/)).toBeInTheDocument();
    expect(screen.getByText('Net 30')).toBeInTheDocument();
    // "Discovery" in breakdown (also in deliverables table, but unique text here via $5,000)
    expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$20,000/)).toBeInTheDocument();
  });

  test('renders team section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Principal Project Owner')).toBeInTheDocument();
    expect(screen.getByText('Strategy and oversight')).toBeInTheDocument();
    expect(screen.getByText('Architect')).toBeInTheDocument();
  });

  test('renders assumptions section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Assumptions')).toBeInTheDocument();
    expect(screen.getByText('Client will provide timely access to systems')).toBeInTheDocument();
    expect(screen.getByText('Scope changes require mutual agreement')).toBeInTheDocument();
  });

  test('renders acceptance criteria section', () => {
    render(<SowPreview content={mockContent} />);
    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument();
    expect(screen.getByText('All deliverables completed and reviewed')).toBeInTheDocument();
    expect(screen.getByText('Client sign-off on implementation')).toBeInTheDocument();
  });

  test('handles empty content gracefully', () => {
    render(<SowPreview content={{}} />);
    // Should render without crashing and show section headers
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  test('handles null content gracefully', () => {
    render(<SowPreview content={null} />);
    // Should render without crashing
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  test('handles missing optional fields (no breakdown)', () => {
    const partialContent = {
      ...mockContent,
      investment: { total: 10000, payment_terms: 'Net 15', breakdown: [] },
    };
    render(<SowPreview content={partialContent} />);
    expect(screen.getByText(/\$10,000/)).toBeInTheDocument();
  });
});
