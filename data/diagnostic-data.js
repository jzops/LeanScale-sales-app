// Diagnostic data linked to services catalog
// Health statuses: 🟢 = healthy, 🟡 = careful, 🔴 = warning, ⚫ = unable

export const gtmFunctions = [
  'Cross Functional',
  'Marketing',
  'Sales',
  'Customer Success',
  'Partnerships',
];

export const gtmOutcomes = [
  'Increase Pipeline',
  'Improve Sales Efficiency',
  'Reduce Churn',
  'Improve Data Quality',
  'Scale Operations',
  'Optimize Reporting',
];

export const power10MetricNames = [
  'ARR',
  'Bookings',
  'Gross churn',
  'Gross retention',
  'MQL -> Opportunity conversion rate',
  'MQL production',
  'Net retention',
  'Opportunity/Deal - CW cycle time',
  'Opportunity/Deal -> CW conversion rate',
  'Pipeline production',
];

// Processes linked to services catalog - each has a serviceId that maps to strategic projects
export const processes = [
  { name: "Activity Capture", status: "warning", addToEngagement: true, function: "Cross Functional", outcome: "Improve Data Quality", metric: "Pipeline production", serviceId: "activity-capture", serviceType: "strategic" },
  { name: "Automated Inbound Data Enrichment", status: "warning", addToEngagement: true, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production", serviceId: "automated-inbound-data-enrichment", serviceType: "strategic" },
  { name: "Customer Lifecycle (GTM Lifecycle)", status: "warning", addToEngagement: true, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention", serviceId: "customer-lifecycle", serviceType: "strategic" },
  { name: "Forecasting Process Implementation", status: "warning", addToEngagement: true, function: "Sales", outcome: "Optimize Reporting", metric: "Bookings", serviceId: "forecasting-process-implementation", serviceType: "strategic" },
  { name: "Market Map", status: "careful", addToEngagement: true, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production", serviceId: "market-map", serviceType: "strategic" },
  { name: "Lead & Opportunity Attribution", status: "careful", addToEngagement: true, function: "Marketing", outcome: "Optimize Reporting", metric: "MQL -> Opportunity conversion rate", serviceId: "lead-and-opportunity-attribution", serviceType: "strategic" },
  { name: "Lead Lifecycle (GTM Lifecycle)", status: "warning", addToEngagement: true, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate", serviceId: "lead-lifecycle", serviceType: "strategic" },
  { name: "Lead Routing", status: "warning", addToEngagement: true, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "lead-routing", serviceType: "strategic" },
  { name: "Marketing-to-Sales Handoff & SLA Tracking", status: "careful", addToEngagement: true, function: "Cross Functional", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "marketing-to-sales-handoff-and-sla-tracking", serviceType: "strategic" },
  { name: "Sales Lifecycle (GTM Lifecycle)", status: "unable", addToEngagement: true, function: "Sales", outcome: "Increase Pipeline", metric: "Pipeline production", serviceId: "sales-lifecycle", serviceType: "strategic" },
  { name: "Sales Territory Design and System Implementation", status: "careful", addToEngagement: true, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Bookings", serviceId: "sales-territory-design", serviceType: "strategic" },
  { name: "ABM / ABS Process and System", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "Pipeline production", serviceId: "abm-abs-process-and-system", serviceType: "strategic" },
  { name: "AI Automated Inbound", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production", serviceId: "ai-automated-inbound", serviceType: "strategic" },
  { name: "ARR Reporting", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR", serviceId: "arr-reporting", serviceType: "strategic" },
  { name: "Automated Outbound Process", status: "unable", addToEngagement: false, function: "Sales", outcome: "Increase Pipeline", metric: "Pipeline production", serviceId: "automated-outbound-process", serviceType: "strategic" },
  { name: "CLM Implementation", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "clm-implementation", serviceType: "strategic" },
  { name: "Commission Tool Implementation", status: "careful", addToEngagement: false, function: "Sales", outcome: "Scale Operations", metric: "Bookings", serviceId: "commission-tool-implementation", serviceType: "strategic" },
  { name: "Conversation Intelligence Implementation", status: "warning", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate", serviceId: "conversation-intelligence-platform-implementation", serviceType: "strategic" },
  { name: "CPQ Implementation", status: "unable", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "cpq-implementation", serviceType: "strategic" },
  { name: "CRM Deduplication", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "Pipeline production", serviceId: "crm-deduplication", serviceType: "strategic" },
  { name: "CRM Deduplication Ongoing Tool", status: "healthy", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "Pipeline production", serviceId: "crm-deduplication-ongoing-tool", serviceType: "strategic" },
  { name: "Customer Health Model", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross churn", serviceId: "customer-health-model", serviceType: "strategic" },
  { name: "Customer Segmentation", status: "healthy", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Net retention", serviceId: "customer-segmentation", serviceType: "strategic" },
  { name: "Customer Success Platform Implementation", status: "careful", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention", serviceId: "customer-success-platform-implementation", serviceType: "strategic" },
  { name: "E-Signature Implementation", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "e-signature-implementation", serviceType: "strategic" },
  { name: "Email Operations: Nurture Program Build & Management", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production", serviceId: "email-operations-nurture-program", serviceType: "strategic" },
  { name: "Email Operations: Subscription & Compliance Framework", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production", serviceId: "email-operations-subscription-and-compliance", serviceType: "strategic" },
  { name: "Email Operations: Templates & Build Process", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production", serviceId: "email-operations-templates-and-build-process", serviceType: "strategic" },
  { name: "Event Operations: Event Platform Implementation", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production", serviceId: "event-operations-platform-implementation", serviceType: "strategic" },
  { name: "Event Operations: Lead List Intake Process", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production", serviceId: "event-operations-lead-list-intake-process", serviceType: "strategic" },
  { name: "Executive Reporting Suite", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR", serviceId: "executive-reporting-suite", serviceType: "strategic" },
  { name: "Foundational Automations and Reporting Logic", status: "warning", addToEngagement: false, function: "Cross Functional", outcome: "Scale Operations", metric: "Pipeline production", serviceId: "foundational-automations-and-reporting-logic", serviceType: "strategic" },
  { name: "Growth Model", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR", serviceId: "growth-model", serviceType: "strategic" },
  { name: "GTM Lifecycle", status: "healthy", addToEngagement: false, function: "Cross Functional", outcome: "Scale Operations", metric: "Pipeline production", serviceId: "gtm-lifecycle", serviceType: "strategic" },
  { name: "Lead Scoring Model Design (Product-Led)", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate", serviceId: "lead-scoring-model-product-led", serviceType: "strategic" },
  { name: "Lead Scoring Model Design (Sales-Led)", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate", serviceId: "lead-scoring-model-sales-led", serviceType: "strategic" },
  { name: "Marketing Automation Platform Implementation", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production", serviceId: "marketing-automation-platform-implementation", serviceType: "strategic" },
  { name: "Marketing Database Segmentation", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production", serviceId: "marketing-database-segmentation", serviceType: "strategic" },
  { name: "NPS and Voice of Customer Launch", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Net retention", serviceId: "nps-and-voice-of-customer-launch", serviceType: "strategic" },
  { name: "Physical Event Process and ROI Reporting", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Optimize Reporting", metric: "MQL production", serviceId: "physical-event-process-and-roi-reporting", serviceType: "strategic" },
  { name: "PLG GTM Design", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate", serviceId: "plg-gtm-design", serviceType: "strategic" },
  { name: "Quotas and Target Setting", status: "unable", addToEngagement: false, function: "Sales", outcome: "Optimize Reporting", metric: "Bookings", serviceId: "quotas-and-target-setting", serviceType: "strategic" },
  { name: "Quote to Cash", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate", serviceId: "quote-to-cash", serviceType: "strategic" },
  { name: "Renewal Management", status: "unable", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention", serviceId: "renewal-management", serviceType: "strategic" },
  { name: "Renewal, Churn, NRR/GRR Reporting", status: "healthy", addToEngagement: false, function: "Customer Success", outcome: "Optimize Reporting", metric: "Net retention", serviceId: "renewal-churn-nrr-grr-reporting", serviceType: "strategic" },
  { name: "Revenue Recognition", status: "warning", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR", serviceId: "revenue-recognition", serviceType: "strategic" },
  { name: "Sales Engagement Platform", status: "warning", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Pipeline production", serviceId: "sales-engagement-platform", serviceType: "strategic" },
  { name: "Sales Qualification Methodology", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate", serviceId: "sales-qualification-methodology", serviceType: "strategic" },
  { name: "Speed-to-Lead", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time", serviceId: "speed-to-lead", serviceType: "strategic" },
  { name: "Support AI Chatbot / Chat Platform", status: "unable", addToEngagement: false, function: "Customer Success", outcome: "Scale Operations", metric: "Net retention", serviceId: "support-system-implementation", serviceType: "strategic" },
  { name: "Support System Implementation", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross churn", serviceId: "support-system-implementation", serviceType: "strategic" },
  { name: "Website Lead Capture & Form Configuration", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production", serviceId: "website-lead-capture-and-form-configuration", serviceType: "strategic" },
  { name: "Partnership Success Platform Implementation", status: "unable", addToEngagement: false, function: "Partnerships", outcome: "Scale Operations", metric: "Pipeline production", serviceId: "partnership-success-platform-implementation", serviceType: "strategic" },
  { name: "CRM → ERP Integration", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "ARR", serviceId: "crm-erp-integration", serviceType: "strategic" },
];

export const power10Metrics = [
  { name: "ARR", status: "na" },
  { name: "Bookings", status: "na" },
  { name: "Gross churn", status: "na" },
  { name: "Gross retention", status: "na" },
  { name: "MQL -> Opportunity conversion rate", status: "na" },
  { name: "MQL production", status: "na" },
  { name: "Net retention", status: "na" },
  { name: "Opportunity/Deal - CW cycle time", status: "na" },
  { name: "Opportunity/Deal -> CW conversion rate", status: "na" },
  { name: "Pipeline production", status: "na" },
];

// Tools linked to tool implementations in services catalog
export const tools = [
  { name: "CLM", status: "healthy", function: "Sales", serviceId: "conga-impl", serviceType: "tool" },
  { name: "Commission Management", status: "careful", function: "Sales", serviceId: "captivateiq-impl", serviceType: "tool" },
  { name: "CPQ", status: "warning", function: "Sales", serviceId: null, serviceType: "tool" },
  { name: "CRM", status: "unable", function: "Cross Functional", serviceId: "salesforce-impl", serviceType: "tool" },
  { name: "Customer Success Platform (CSP)", status: "healthy", function: "Customer Success", serviceId: "gainsight-impl", serviceType: "tool" },
  { name: "Customer Support Platform", status: "careful", function: "Customer Success", serviceId: "zendesk-impl", serviceType: "tool" },
  { name: "Data Analytics", status: "warning", function: "Cross Functional", serviceId: "looker-impl", serviceType: "tool" },
  { name: "Data Enrichment", status: "unable", function: "Marketing", serviceId: "clay-impl", serviceType: "tool" },
  { name: "Lead Routing", status: "healthy", function: "Sales", serviceId: "chilipiper-impl", serviceType: "tool" },
  { name: "Marketing Automation Platform (MAP)", status: "healthy", function: "Marketing", serviceId: "marketo-impl", serviceType: "tool" },
  { name: "Partner Success Platform", status: "careful", function: "Partnerships", serviceId: null, serviceType: "tool" },
  { name: "Revenue Intelligence", status: "warning", function: "Sales", serviceId: "clari-impl", serviceType: "tool" },
  { name: "Sales Enablement", status: "unable", function: "Sales", serviceId: "seismic-impl", serviceType: "tool" },
  { name: "Sales Engagement Platform", status: "healthy", function: "Sales", serviceId: "outreach-impl", serviceType: "tool" },
  { name: "Territory Planning", status: "careful", function: "Sales", serviceId: null, serviceType: "tool" },
  { name: "De-duplication Tool", status: "healthy", function: "Cross Functional", serviceId: null, serviceType: "tool" },
  { name: "Support AI Chatbot", status: "unable", function: "Customer Success", serviceId: "intercom-impl", serviceType: "tool" },
];

// Managed services for ongoing engagement
export const managedServicesHealth = [
  { name: "CRM Admin", status: "careful", addToEngagement: true, serviceId: "crm-admin", serviceType: "managed" },
  { name: "Enrichment Tools Admin", status: "warning", addToEngagement: true, serviceId: "enrichment-tools-admin", serviceType: "managed" },
  { name: "Ongoing Reporting", status: "careful", addToEngagement: true, serviceId: "ongoing-reporting", serviceType: "managed" },
  { name: "Core RevOps", status: "healthy", addToEngagement: false, serviceId: "core-revops", serviceType: "managed" },
  { name: "Marketing Tools Admin", status: "healthy", addToEngagement: false, serviceId: "marketing-tools-admin", serviceType: "managed" },
  { name: "Marketing Ops Maintenance", status: "careful", addToEngagement: false, serviceId: "marketing-ops-maintenance", serviceType: "managed" },
  { name: "Sales Ops", status: "warning", addToEngagement: false, serviceId: "sales-ops", serviceType: "managed" },
  { name: "CS Ops", status: "unable", addToEngagement: false, serviceId: "cs-ops", serviceType: "managed" },
  { name: "Deal Desk", status: "healthy", addToEngagement: false, serviceId: "deal-desk", serviceType: "managed" },
  { name: "GTM Systems Admin", status: "careful", addToEngagement: false, serviceId: "gtm-systems-admin", serviceType: "managed" },
];

// Helper to count statuses
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

// Group items by a field
export function groupBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Get prioritized items for engagement
export function getPriorityItems() {
  const priorityProcesses = processes.filter(p => p.addToEngagement);
  const priorityManaged = managedServicesHealth.filter(m => m.addToEngagement);
  return { priorityProcesses, priorityManaged };
}

// Map emoji to status
export function emojiToStatus(emoji) {
  if (emoji === '🟢') return 'healthy';
  if (emoji === '🟡') return 'careful';
  if (emoji === '🔴') return 'warning';
  if (emoji === '⚫') return 'unable';
  return 'na';
}

export function statusToLabel(status) {
  if (status === 'healthy') return 'Healthy';
  if (status === 'careful') return 'Careful';
  if (status === 'warning') return 'Warning';
  if (status === 'unable') return 'Unable to Report';
  return 'N/A';
}
