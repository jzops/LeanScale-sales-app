/**
 * Quote-to-Cash Intake Form Configuration
 *
 * Defines the structure for the Q2C project intake form.
 * Each functional area maps to one or more follow-up sections
 * that collect relevant details about the customer's current
 * quote-to-cash process.
 */

const q2cIntakeConfig = {
  id: 'q2c-intake',
  title: 'Quote-to-Cash Project Intake',
  description: 'Help us understand your current quote-to-cash process so we can identify improvements and build the right solution.',
  projectSelection: {
    type: 'multi-select',
    label: 'Which functional areas would you like to improve?',
    options: [
      { id: 'quoting-cpq', name: 'Quoting & CPQ', price: 25000, followUpSections: ['systems', 'quoting'] },
      { id: 'contract-management', name: 'Contract Management', price: 20000, followUpSections: ['systems', 'contracts'] },
      { id: 'billing-invoicing', name: 'Billing & Invoicing', price: 30000, followUpSections: ['systems', 'billing'] },
      { id: 'payment-collection', name: 'Payment Collection', price: 15000, followUpSections: ['systems', 'payments'] },
      { id: 'revenue-recognition', name: 'Revenue Recognition', price: 25000, followUpSections: ['systems', 'rev_rec'] },
      { id: 'full-e2e-q2c', name: 'Full End-to-End Q2C', price: 85000, followUpSections: ['systems', 'quoting', 'contracts', 'billing', 'payments', 'rev_rec'] },
    ],
  },
  sections: {
    systems: {
      label: 'Current Systems',
      questions: [
        { id: 'crm', type: 'select', label: 'CRM?', options: ['Salesforce', 'HubSpot', 'Other'], required: true },
        { id: 'cpq_tool', type: 'text', label: 'CPQ tool if any?' },
        { id: 'billing_system', type: 'text', label: 'Billing system?' },
        { id: 'erp_accounting', type: 'text', label: 'ERP / accounting system?' },
        { id: 'esign_tool', type: 'select', label: 'E-signature tool?', options: ['DocuSign', 'PandaDoc', 'Ironclad', 'None', 'Other'] },
      ],
    },
    quoting: {
      label: 'Quoting Process',
      questions: [
        { id: 'quote_creation_method', type: 'select', label: 'How are quotes created today?', options: ['Spreadsheets', 'Word/Google Docs', 'CRM native', 'CPQ tool', 'Other'] },
        { id: 'quotes_per_month', type: 'select', label: 'Quotes generated per month?', options: ['<10', '10-50', '50-200', '200+'] },
        { id: 'discount_approval_process', type: 'textarea', label: 'Describe your discount/approval process' },
        { id: 'product_sku_count', type: 'select', label: 'Number of products/SKUs?', options: ['<10', '10-50', '50-200', '200+'] },
        { id: 'pricing_complexity', type: 'select', label: 'Pricing model complexity?', options: ['Simple flat rate', 'Tiered pricing', 'Usage-based', 'Hybrid / complex'] },
      ],
    },
    contracts: {
      label: 'Contract Management',
      questions: [
        { id: 'contract_management_method', type: 'text', label: 'How are contracts managed today?' },
        { id: 'amendment_frequency', type: 'select', label: 'How often are mid-term amendments needed?', options: ['Rarely', 'Monthly', 'Weekly', 'Daily'] },
        { id: 'standardized_templates', type: 'boolean', label: 'Do you have standardized contract templates?' },
      ],
    },
    billing: {
      label: 'Billing & Invoicing',
      questions: [
        { id: 'invoice_generation', type: 'select', label: 'How are invoices generated?', options: ['Manual', 'Semi-automated', 'Fully automated'] },
        { id: 'billing_frequencies', type: 'multi-select', label: 'Billing frequencies used?', options: ['Monthly', 'Quarterly', 'Annual', 'Milestone-based', 'Usage-based'] },
        { id: 'invoice_error_rate', type: 'select', label: 'Estimated invoice error rate?', options: ['<1%', '1-5%', '5-15%', '>15%', 'Unknown'] },
      ],
    },
    payments: {
      label: 'Payment Collection',
      questions: [
        { id: 'payment_methods', type: 'multi-select', label: 'Payment methods accepted?', options: ['Credit card', 'ACH', 'Wire', 'Check', 'Other'] },
        { id: 'avg_dso', type: 'select', label: 'Average Days Sales Outstanding?', options: ['<30', '30-60', '60-90', '90+', 'Unknown'] },
        { id: 'automated_dunning', type: 'boolean', label: 'Do you have automated dunning/collections?' },
      ],
    },
    rev_rec: {
      label: 'Revenue Recognition',
      questions: [
        { id: 'rev_rec_approach', type: 'select', label: 'Revenue recognition approach?', options: ['Cash basis', 'Manual spreadsheets', 'ERP-based', 'Dedicated rev rec tool', 'Unknown'] },
        { id: 'compliance_status', type: 'select', label: 'ASC 606 / IFRS 15 compliance status?', options: ['Fully compliant', 'Partially compliant', 'Working on it', 'Not applicable', 'Unsure'] },
        { id: 'audit_trail', type: 'boolean', label: 'Can you produce an audit trail from quote to recognized revenue?' },
      ],
    },
    uploads: {
      label: 'Example Documents',
      questions: [
        { id: 'upload_quote', type: 'file', label: 'Upload an example quote or order form' },
        { id: 'upload_invoice', type: 'file', label: 'Upload an example invoice' },
        { id: 'upload_contract', type: 'file', label: 'Upload an example contract' },
      ],
    },
  },
};

module.exports = { q2cIntakeConfig };
