// CPQ / Quote-to-Cash Diagnostic Data
// Defines processes, categories, and outcomes for the CPQ diagnostic

export const cpqCategories = [
  'Quoting Process',
  'Pricing & Catalog',
  'Contract Management',
  'Billing Integration',
  'Revenue Recognition',
  'System Integration',
];

export const cpqOutcomes = [
  'Accelerate Deal Velocity',
  'Improve Quote Accuracy',
  'Reduce Revenue Leakage',
  'Ensure Compliance',
  'Optimize System Connectivity',
];

export const cpqProcesses = [
  // --- Quoting Process (5) ---
  {
    name: 'Quote Creation Speed',
    status: 'unable',
    addToEngagement: false,
    function: 'Quoting Process',
    outcome: 'Accelerate Deal Velocity',
    metric: 'Average time to generate quote',
    description: 'Measures how quickly sales reps can produce a complete, accurate quote from opportunity data.',
  },
  {
    name: 'Quote Template Usage',
    status: 'unable',
    addToEngagement: false,
    function: 'Quoting Process',
    outcome: 'Improve Quote Accuracy',
    metric: 'Template adoption rate',
    description: 'Tracks the percentage of quotes built from approved templates vs. manual creation.',
  },
  {
    name: 'Approval Workflow Efficiency',
    status: 'unable',
    addToEngagement: false,
    function: 'Quoting Process',
    outcome: 'Accelerate Deal Velocity',
    metric: 'Average approval cycle time',
    description: 'Measures the time and bottlenecks in the quote approval chain from submission to sign-off.',
  },
  {
    name: 'Rep Adoption Rate',
    status: 'unable',
    addToEngagement: false,
    function: 'Quoting Process',
    outcome: 'Improve Quote Accuracy',
    metric: 'CPQ tool adoption percentage',
    description: 'Assesses the percentage of sales reps actively using the CPQ tool vs. manual workarounds.',
  },
  {
    name: 'Quote Accuracy',
    status: 'unable',
    addToEngagement: false,
    function: 'Quoting Process',
    outcome: 'Improve Quote Accuracy',
    metric: 'Quote error rate',
    description: 'Tracks the frequency of pricing, product, or configuration errors in generated quotes.',
  },

  // --- Pricing & Catalog (4) ---
  {
    name: 'Product Catalog Completeness',
    status: 'unable',
    addToEngagement: false,
    function: 'Pricing & Catalog',
    outcome: 'Improve Quote Accuracy',
    metric: 'Catalog coverage percentage',
    description: 'Measures whether all sellable products and bundles are represented in the CPQ catalog.',
  },
  {
    name: 'Pricing Rule Accuracy',
    status: 'unable',
    addToEngagement: false,
    function: 'Pricing & Catalog',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Pricing exception rate',
    description: 'Evaluates how well pricing rules reflect current strategy and prevent unauthorized discounts.',
  },
  {
    name: 'Discount Governance',
    status: 'unable',
    addToEngagement: false,
    function: 'Pricing & Catalog',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Out-of-policy discount rate',
    description: 'Assesses guardrails for discount levels and whether approval thresholds are enforced.',
  },
  {
    name: 'SKU Standardization',
    status: 'unable',
    addToEngagement: false,
    function: 'Pricing & Catalog',
    outcome: 'Improve Quote Accuracy',
    metric: 'SKU consistency score',
    description: 'Checks whether product SKUs follow a consistent naming and categorization scheme.',
  },

  // --- Contract Management (4) ---
  {
    name: 'CLM Tool Maturity',
    status: 'unable',
    addToEngagement: false,
    function: 'Contract Management',
    outcome: 'Accelerate Deal Velocity',
    metric: 'CLM maturity score',
    description: 'Evaluates the sophistication and adoption of the contract lifecycle management tool.',
  },
  {
    name: 'Amendment Handling',
    status: 'unable',
    addToEngagement: false,
    function: 'Contract Management',
    outcome: 'Accelerate Deal Velocity',
    metric: 'Amendment cycle time',
    description: 'Measures the speed and accuracy of processing contract amendments and renewals.',
  },
  {
    name: 'E-Signature Flow',
    status: 'unable',
    addToEngagement: false,
    function: 'Contract Management',
    outcome: 'Accelerate Deal Velocity',
    metric: 'E-signature completion rate',
    description: 'Tracks the adoption and completion rate of electronic signature workflows.',
  },
  {
    name: 'Clause Library Coverage',
    status: 'unable',
    addToEngagement: false,
    function: 'Contract Management',
    outcome: 'Ensure Compliance',
    metric: 'Clause library utilization',
    description: 'Assesses whether a standardized clause library is maintained and used in contract generation.',
  },

  // --- Billing Integration (4) ---
  {
    name: 'Invoice Automation Level',
    status: 'unable',
    addToEngagement: false,
    function: 'Billing Integration',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Invoice automation percentage',
    description: 'Measures the percentage of invoices generated automatically from closed-won opportunities.',
  },
  {
    name: 'Billing Accuracy Rate',
    status: 'unable',
    addToEngagement: false,
    function: 'Billing Integration',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Billing error rate',
    description: 'Tracks the frequency of billing errors including incorrect amounts, dates, or line items.',
  },
  {
    name: 'Payment Collection Efficiency',
    status: 'unable',
    addToEngagement: false,
    function: 'Billing Integration',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Days sales outstanding (DSO)',
    description: 'Measures the average time to collect payment after invoice issuance.',
  },
  {
    name: 'Dunning Process',
    status: 'unable',
    addToEngagement: false,
    function: 'Billing Integration',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Dunning recovery rate',
    description: 'Evaluates the effectiveness of automated dunning workflows for failed and overdue payments.',
  },

  // --- Revenue Recognition (4) ---
  {
    name: 'ASC 606 Compliance',
    status: 'unable',
    addToEngagement: false,
    function: 'Revenue Recognition',
    outcome: 'Ensure Compliance',
    metric: 'Compliance audit score',
    description: 'Assesses adherence to ASC 606 revenue recognition standards across all deal types.',
  },
  {
    name: 'Rev Rec Automation',
    status: 'unable',
    addToEngagement: false,
    function: 'Revenue Recognition',
    outcome: 'Ensure Compliance',
    metric: 'Automated rev rec percentage',
    description: 'Measures the level of automation in revenue recognition scheduling and journal entries.',
  },
  {
    name: 'Audit Trail Completeness',
    status: 'unable',
    addToEngagement: false,
    function: 'Revenue Recognition',
    outcome: 'Ensure Compliance',
    metric: 'Audit trail coverage',
    description: 'Tracks whether all revenue-impacting changes have complete, immutable audit trails.',
  },
  {
    name: 'Multi-Element Handling',
    status: 'unable',
    addToEngagement: false,
    function: 'Revenue Recognition',
    outcome: 'Reduce Revenue Leakage',
    metric: 'Multi-element arrangement accuracy',
    description: 'Evaluates correct handling of bundled deals with multiple performance obligations.',
  },

  // --- System Integration (4) ---
  {
    name: 'CRM-CPQ Connectivity',
    status: 'unable',
    addToEngagement: false,
    function: 'System Integration',
    outcome: 'Optimize System Connectivity',
    metric: 'CRM-CPQ sync success rate',
    description: 'Measures the reliability of data flow between CRM and CPQ systems.',
  },
  {
    name: 'CPQ-Billing Data Flow',
    status: 'unable',
    addToEngagement: false,
    function: 'System Integration',
    outcome: 'Optimize System Connectivity',
    metric: 'CPQ-to-billing sync accuracy',
    description: 'Evaluates whether closed deal data flows accurately from CPQ into billing systems.',
  },
  {
    name: 'Billing-ERP Sync',
    status: 'unable',
    addToEngagement: false,
    function: 'System Integration',
    outcome: 'Optimize System Connectivity',
    metric: 'Billing-ERP reconciliation rate',
    description: 'Tracks the accuracy and timeliness of financial data syncing from billing to ERP.',
  },
  {
    name: 'End-to-End Data Integrity',
    status: 'unable',
    addToEngagement: false,
    function: 'System Integration',
    outcome: 'Optimize System Connectivity',
    metric: 'Data integrity score',
    description: 'Assesses overall data consistency across the entire quote-to-cash system chain.',
  },
];

export function countStatuses(items) {
  return items.reduce(
    (acc, item) => {
      if (item.status === 'healthy') acc.healthy++;
      else if (item.status === 'careful') acc.careful++;
      else if (item.status === 'warning') acc.warning++;
      else if (item.status === 'unable' || item.status === 'na') acc.unable++;
      return acc;
    },
    { healthy: 0, careful: 0, warning: 0, unable: 0 }
  );
}

export function groupBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}
