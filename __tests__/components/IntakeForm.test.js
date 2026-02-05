/**
 * @jest-environment jsdom
 */

/**
 * Tests for IntakeForm reusable component
 *
 * Validates the multi-step form rendering, step navigation,
 * conditional sections, and form submission.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntakeForm from '../../components/IntakeForm';

// Minimal test config that exercises all question types
const testConfig = {
  id: 'test-intake',
  title: 'Test Intake Form',
  description: 'A test form for unit testing.',
  projectSelection: {
    type: 'multi-select',
    label: 'Select projects',
    options: [
      { id: 'project-a', name: 'Project A', price: 1000, followUpSections: ['section-a'] },
      { id: 'project-b', name: 'Project B', price: 2000, followUpSections: ['section-a', 'section-b'] },
      { id: 'project-c', name: 'Project C', price: 3000, followUpSections: ['section-c'] },
    ],
  },
  sections: {
    'section-a': {
      label: 'Section A',
      questions: [
        { id: 'q_select', type: 'select', label: 'Pick one', options: ['Opt1', 'Opt2', 'Opt3'], required: true },
        { id: 'q_text', type: 'text', label: 'Enter text' },
      ],
    },
    'section-b': {
      label: 'Section B',
      questions: [
        { id: 'q_multi', type: 'multi-select', label: 'Pick many', options: ['A', 'B', 'C'] },
        { id: 'q_textarea', type: 'textarea', label: 'Write more' },
      ],
    },
    'section-c': {
      label: 'Section C',
      questions: [
        { id: 'q_bool', type: 'boolean', label: 'Yes or no?' },
        { id: 'q_file', type: 'file', label: 'Upload file' },
      ],
    },
  },
};

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('IntakeForm', () => {
  describe('Step 1: Project Selection', () => {
    test('renders form title and description', () => {
      render(<IntakeForm config={testConfig} />);
      expect(screen.getByText('Test Intake Form')).toBeInTheDocument();
      expect(screen.getByText('A test form for unit testing.')).toBeInTheDocument();
    });

    test('renders step indicator showing step 1 of 3', () => {
      render(<IntakeForm config={testConfig} />);
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });

    test('renders all project options as checkboxes', () => {
      render(<IntakeForm config={testConfig} />);
      expect(screen.getByLabelText(/Project A/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project B/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project C/)).toBeInTheDocument();
    });

    test('displays price for each project option', () => {
      render(<IntakeForm config={testConfig} />);
      expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
      expect(screen.getByText(/\$2,000/)).toBeInTheDocument();
      expect(screen.getByText(/\$3,000/)).toBeInTheDocument();
    });

    test('Next button is disabled when no projects selected', () => {
      render(<IntakeForm config={testConfig} />);
      const nextBtn = screen.getByRole('button', { name: /next/i });
      expect(nextBtn).toBeDisabled();
    });

    test('Next button enables after selecting a project', () => {
      render(<IntakeForm config={testConfig} />);
      fireEvent.click(screen.getByLabelText(/Project A/));
      const nextBtn = screen.getByRole('button', { name: /next/i });
      expect(nextBtn).not.toBeDisabled();
    });
  });

  describe('Step 2: Conditional Sections', () => {
    function goToStep2(selectedProjects = ['project-a']) {
      render(<IntakeForm config={testConfig} />);
      selectedProjects.forEach((id) => {
        const name = testConfig.projectSelection.options.find(o => o.id === id).name;
        fireEvent.click(screen.getByLabelText(new RegExp(name)));
      });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    test('shows only sections referenced by selected projects', () => {
      goToStep2(['project-a']); // followUpSections: ['section-a']
      expect(screen.getByText('Section A')).toBeInTheDocument();
      expect(screen.queryByText('Section B')).not.toBeInTheDocument();
      expect(screen.queryByText('Section C')).not.toBeInTheDocument();
    });

    test('shows deduped sections when multiple projects reference same sections', () => {
      goToStep2(['project-a', 'project-b']); // sections: a, a+b → deduped: a, b
      expect(screen.getByText('Section A')).toBeInTheDocument();
      expect(screen.getByText('Section B')).toBeInTheDocument();
      expect(screen.queryByText('Section C')).not.toBeInTheDocument();
    });

    test('renders select question as dropdown', () => {
      goToStep2(['project-a']);
      const selectEl = screen.getByLabelText('Pick one');
      expect(selectEl.tagName.toLowerCase()).toBe('select');
    });

    test('renders text question as text input', () => {
      goToStep2(['project-a']);
      const inputEl = screen.getByLabelText('Enter text');
      expect(inputEl.tagName.toLowerCase()).toBe('input');
      expect(inputEl.type).toBe('text');
    });

    test('renders multi-select question as checkboxes', () => {
      goToStep2(['project-a', 'project-b']);
      // The multi-select should render checkboxes for each option
      expect(screen.getByLabelText('A')).toBeInTheDocument();
      expect(screen.getByLabelText('B')).toBeInTheDocument();
      expect(screen.getByLabelText('C')).toBeInTheDocument();
    });

    test('renders textarea question', () => {
      goToStep2(['project-a', 'project-b']);
      const textareaEl = screen.getByLabelText('Write more');
      expect(textareaEl.tagName.toLowerCase()).toBe('textarea');
    });

    test('renders boolean question as yes/no toggle', () => {
      goToStep2(['project-c']);
      // Should have Yes/No options
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    test('renders file question as file input', () => {
      goToStep2(['project-c']);
      const fileInput = screen.getByLabelText('Upload file');
      expect(fileInput.type).toBe('file');
    });

    test('Back button returns to step 1', () => {
      goToStep2(['project-a']);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      // Should be back on step 1 with project selection
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });
  });

  describe('Step 3: Review & Submit', () => {
    function goToStep3() {
      render(<IntakeForm config={testConfig} customerSlug="test-customer" />);
      // Step 1: select project A
      fireEvent.click(screen.getByLabelText(/Project A/));
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      // Step 2: fill in required field and move to step 3
      const selectEl = screen.getByLabelText('Pick one');
      fireEvent.change(selectEl, { target: { value: 'Opt2' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    test('shows review step with selected projects', () => {
      goToStep3();
      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Project A/)).toBeInTheDocument();
    });

    test('shows submit button on review step', () => {
      goToStep3();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    test('submits form data to /api/intake/submit', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'test-123' }),
      });

      goToStep3();
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/intake/submit', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }));
      });

      // Verify request body
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.configId).toBe('test-intake');
      expect(body.customerSlug).toBe('test-customer');
      expect(body.data).toBeDefined();
      expect(body.data.selectedProjects).toContain('project-a');
    });

    test('shows success message after successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 'test-123' }),
      });

      goToStep3();
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      });
    });

    test('shows error message on submission failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Server error' }),
      });

      goToStep3();
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/error|failed|try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reusability', () => {
    test('works with a different config object', () => {
      const altConfig = {
        id: 'alt-intake',
        title: 'Alternative Form',
        description: 'Different form.',
        projectSelection: {
          type: 'multi-select',
          label: 'Choose stuff',
          options: [
            { id: 'x', name: 'X Project', price: 500, followUpSections: ['x-section'] },
          ],
        },
        sections: {
          'x-section': {
            label: 'X Details',
            questions: [
              { id: 'x_q', type: 'text', label: 'X Question' },
            ],
          },
        },
      };

      render(<IntakeForm config={altConfig} />);
      expect(screen.getByText('Alternative Form')).toBeInTheDocument();
      expect(screen.getByLabelText(/X Project/)).toBeInTheDocument();
    });
  });
});
