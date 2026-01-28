// Diagnostic data parsed from CSV
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

export const processes = [
  { name: "Activity Capture", status: "warning", addToEngagement: true, function: "Sales", outcome: "Improve Data Quality", metric: "Pipeline production" },
  { name: "Automated Inbound Data Enrichment", status: "warning", addToEngagement: true, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production" },
  { name: "Customer Lifecycle (GTM Lifecycle)", status: "warning", addToEngagement: true, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention" },
  { name: "Forecasting Process Implementation", status: "warning", addToEngagement: true, function: "Sales", outcome: "Optimize Reporting", metric: "Bookings" },
  { name: "Market Map", status: "careful", addToEngagement: true, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production" },
  { name: "Lead & Opportunity Attribution", status: "careful", addToEngagement: true, function: "Marketing", outcome: "Optimize Reporting", metric: "MQL -> Opportunity conversion rate" },
  { name: "Lead Lifecycle (GTM Lifecycle)", status: "warning", addToEngagement: true, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate" },
  { name: "Lead Routing", status: "warning", addToEngagement: true, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "Marketing-to-Sales Handoff & SLA Tracking", status: "careful", addToEngagement: true, function: "Cross Functional", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "Sales Lifecycle (GTM Lifecycle)", status: "unable", addToEngagement: true, function: "Sales", outcome: "Increase Pipeline", metric: "Pipeline production" },
  { name: "Sales Territory Design and System Implementation", status: "careful", addToEngagement: true, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Bookings" },
  { name: "ABM / ABS Process and System", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "Pipeline production" },
  { name: "AI Automated Inbound", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production" },
  { name: "ARR Reporting", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR" },
  { name: "Automated Outbound Process", status: "unable", addToEngagement: false, function: "Sales", outcome: "Increase Pipeline", metric: "Pipeline production" },
  { name: "CLM Implementation", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "Commission Tool Implementation", status: "careful", addToEngagement: false, function: "Sales", outcome: "Scale Operations", metric: "Bookings" },
  { name: "Conversation Intelligence Implementation", status: "warning", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate" },
  { name: "CPQ Implementation", status: "unable", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "CRM Deduplication", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "Pipeline production" },
  { name: "CRM Deduplication Ongoing Tool", status: "healthy", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "Pipeline production" },
  { name: "Customer Health Model", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross churn" },
  { name: "Customer Segmentation", status: "healthy", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Net retention" },
  { name: "Customer Success Platform Implementation", status: "careful", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention" },
  { name: "E-Signature Implementation", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "Email Operations: Nurture Program Build & Management", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production" },
  { name: "Email Operations: Subscription & Compliance Framework", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production" },
  { name: "Email Operations: Templates & Build Process", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production" },
  { name: "Event Operations: Event Platform Implementation", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production" },
  { name: "Event Operations: Lead List Intake Process", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production" },
  { name: "Executive Reporting Suite", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR" },
  { name: "Foundational Automations and Reporting Logic", status: "warning", addToEngagement: false, function: "Cross Functional", outcome: "Scale Operations", metric: "Pipeline production" },
  { name: "Growth Model", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR" },
  { name: "GTM Lifecycle", status: "healthy", addToEngagement: false, function: "Cross Functional", outcome: "Scale Operations", metric: "Pipeline production" },
  { name: "Lead Scoring Model Design (Product-Led)", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate" },
  { name: "Lead Scoring Model Design (Sales-Led)", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate" },
  { name: "Marketing Automation Platform Implementation", status: "healthy", addToEngagement: false, function: "Marketing", outcome: "Scale Operations", metric: "MQL production" },
  { name: "Marketing Database Segmentation", status: "careful", addToEngagement: false, function: "Marketing", outcome: "Improve Data Quality", metric: "MQL production" },
  { name: "NPS and Voice of Customer Launch", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Net retention" },
  { name: "Physical Event Process and ROI Reporting", status: "unable", addToEngagement: false, function: "Marketing", outcome: "Optimize Reporting", metric: "MQL production" },
  { name: "PLG GTM Design", status: "careful", addToEngagement: false, function: "Cross Functional", outcome: "Increase Pipeline", metric: "MQL -> Opportunity conversion rate" },
  { name: "Quotas and Target Setting", status: "unable", addToEngagement: false, function: "Sales", outcome: "Optimize Reporting", metric: "Bookings" },
  { name: "Quote to Cash", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate" },
  { name: "Renewal Management", status: "unable", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross retention" },
  { name: "Renewal, Churn, NRR/GRR Reporting", status: "healthy", addToEngagement: false, function: "Customer Success", outcome: "Optimize Reporting", metric: "Net retention" },
  { name: "Revenue Recognition", status: "warning", addToEngagement: false, function: "Cross Functional", outcome: "Optimize Reporting", metric: "ARR" },
  { name: "Sales Engagement Platform", status: "warning", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Pipeline production" },
  { name: "Sales Qualification Methodology", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal -> CW conversion rate" },
  { name: "Speed-to-Lead", status: "healthy", addToEngagement: false, function: "Sales", outcome: "Improve Sales Efficiency", metric: "Opportunity/Deal - CW cycle time" },
  { name: "Support AI Chatbot / Chat Platform", status: "unable", addToEngagement: false, function: "Customer Success", outcome: "Scale Operations", metric: "Net retention" },
  { name: "Support System Implementation", status: "warning", addToEngagement: false, function: "Customer Success", outcome: "Reduce Churn", metric: "Gross churn" },
  { name: "Website Lead Capture & Form Configuration", status: "warning", addToEngagement: false, function: "Marketing", outcome: "Increase Pipeline", metric: "MQL production" },
  { name: "Partnership Success Platform Implementation", status: "unable", addToEngagement: false, function: "Partnerships", outcome: "Scale Operations", metric: "Pipeline production" },
  { name: "CRM → ERP Integration", status: "unable", addToEngagement: false, function: "Cross Functional", outcome: "Improve Data Quality", metric: "ARR" },
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

export const tools = [
  { name: "CLM", status: "healthy", function: "Sales" },
  { name: "Commission Management", status: "careful", function: "Sales" },
  { name: "CPQ", status: "warning", function: "Sales" },
  { name: "CRM", status: "unable", function: "Cross Functional" },
  { name: "Customer Success Platform (CSP)", status: "healthy", function: "Customer Success" },
  { name: "Customer Support Platform", status: "careful", function: "Customer Success" },
  { name: "Data Analytics", status: "warning", function: "Cross Functional" },
  { name: "Data Enrichment", status: "unable", function: "Marketing" },
  { name: "Lead Routing", status: "healthy", function: "Sales" },
  { name: "Marketing Automation Platform (MAP)", status: "healthy", function: "Marketing" },
  { name: "Partner Success Platform", status: "careful", function: "Partnerships" },
  { name: "Revenue Intelligence", status: "warning", function: "Sales" },
  { name: "Sales Enablement", status: "unable", function: "Sales" },
  { name: "Sales Engagement Platform", status: "healthy", function: "Sales" },
  { name: "Territory Planning", status: "careful", function: "Sales" },
  { name: "De-duplication Tool", status: "healthy", function: "Cross Functional" },
  { name: "Support AI Chatbot", status: "unable", function: "Customer Success" },
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

// Group processes by a field
export function groupBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
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
