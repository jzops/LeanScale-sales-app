// Clay Diagnostic Data
// Defines processes, categories, and outcomes for the Clay enrichment diagnostic

export const clayCategories = [
  'Data Infrastructure',
  'Enrichment Stack',
  'Credit Optimization',
  'Inbound Pipeline',
  'Outbound Pipeline',
  'Account Intelligence',
  'Integration Health',
];

export const clayOutcomes = [
  'Improve Data Quality',
  'Reduce Enrichment Cost',
  'Increase Pipeline Coverage',
  'Optimize Credit Spend',
];

export const clayProcesses = [
  // --- Data Infrastructure (5) ---
  {
    name: 'CRM Data Completeness',
    status: 'unable',
    addToEngagement: false,
    function: 'Data Infrastructure',
    outcome: 'Improve Data Quality',
    metric: 'Field fill rate across key objects',
    description: 'Measures the percentage of critical CRM fields that are populated with valid data.',
  },
  {
    name: 'CRM Data Accuracy',
    status: 'unable',
    addToEngagement: false,
    function: 'Data Infrastructure',
    outcome: 'Improve Data Quality',
    metric: 'Data accuracy score',
    description: 'Assesses whether existing CRM data matches real-world information from enrichment sources.',
  },
  {
    name: 'Deduplication Process',
    status: 'unable',
    addToEngagement: false,
    function: 'Data Infrastructure',
    outcome: 'Improve Data Quality',
    metric: 'Duplicate record rate',
    description: 'Evaluates the effectiveness of deduplication rules and merge processes across CRM objects.',
  },
  {
    name: 'Data Hygiene Cadence',
    status: 'unable',
    addToEngagement: false,
    function: 'Data Infrastructure',
    outcome: 'Improve Data Quality',
    metric: 'Hygiene cycle frequency',
    description: 'Tracks how often data cleansing and validation routines run against the CRM database.',
  },
  {
    name: 'Field Standardization',
    status: 'unable',
    addToEngagement: false,
    function: 'Data Infrastructure',
    outcome: 'Improve Data Quality',
    metric: 'Standardized field percentage',
    description: 'Checks whether field formats, picklist values, and naming conventions follow a defined standard.',
  },

  // --- Enrichment Stack (5) ---
  {
    name: 'Provider Coverage',
    status: 'unable',
    addToEngagement: false,
    function: 'Enrichment Stack',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Enrichment coverage rate',
    description: 'Measures the breadth of data provider coverage across target segments and geographies.',
  },
  {
    name: 'Waterfall Configuration',
    status: 'unable',
    addToEngagement: false,
    function: 'Enrichment Stack',
    outcome: 'Reduce Enrichment Cost',
    metric: 'Waterfall hit rate',
    description: 'Evaluates how well the enrichment waterfall is configured to maximize first-source resolution.',
  },
  {
    name: 'Source Diversity',
    status: 'unable',
    addToEngagement: false,
    function: 'Enrichment Stack',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Number of active enrichment sources',
    description: 'Assesses whether multiple complementary data sources are used to reduce single-provider risk.',
  },
  {
    name: 'Enrichment Accuracy',
    status: 'unable',
    addToEngagement: false,
    function: 'Enrichment Stack',
    outcome: 'Improve Data Quality',
    metric: 'Enrichment accuracy rate',
    description: 'Measures the correctness of enriched data by comparing against verified records.',
  },
  {
    name: 'Match Rate Optimization',
    status: 'unable',
    addToEngagement: false,
    function: 'Enrichment Stack',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Record match rate',
    description: 'Tracks the percentage of input records that successfully match to enrichment provider data.',
  },

  // --- Credit Optimization (5) ---
  {
    name: 'Monthly Credit Utilization',
    status: 'unable',
    addToEngagement: false,
    function: 'Credit Optimization',
    outcome: 'Optimize Credit Spend',
    metric: 'Credit utilization percentage',
    description: 'Monitors monthly credit consumption against allocated budget to prevent waste or overages.',
  },
  {
    name: 'Waterfall Efficiency',
    status: 'unable',
    addToEngagement: false,
    function: 'Credit Optimization',
    outcome: 'Reduce Enrichment Cost',
    metric: 'Credits per successful enrichment',
    description: 'Measures how many credits are consumed per successful enrichment through the waterfall.',
  },
  {
    name: 'Cost-Per-Enrichment Tracking',
    status: 'unable',
    addToEngagement: false,
    function: 'Credit Optimization',
    outcome: 'Reduce Enrichment Cost',
    metric: 'Average cost per enriched record',
    description: 'Tracks the blended cost of enriching a single record across all providers in the stack.',
  },
  {
    name: 'Credit Overage Prevention',
    status: 'unable',
    addToEngagement: false,
    function: 'Credit Optimization',
    outcome: 'Optimize Credit Spend',
    metric: 'Overage incident count',
    description: 'Assesses whether alerting and throttling mechanisms prevent unexpected credit overages.',
  },
  {
    name: 'Source ROI Analysis',
    status: 'unable',
    addToEngagement: false,
    function: 'Credit Optimization',
    outcome: 'Optimize Credit Spend',
    metric: 'ROI per enrichment source',
    description: 'Evaluates the return on investment for each data provider based on match rate and cost.',
  },

  // --- Inbound Pipeline (4) ---
  {
    name: 'Inbound Lead Enrichment',
    status: 'unable',
    addToEngagement: false,
    function: 'Inbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Inbound enrichment rate',
    description: 'Measures the percentage of inbound leads that are automatically enriched upon creation.',
  },
  {
    name: 'Inbound Scoring Automation',
    status: 'unable',
    addToEngagement: false,
    function: 'Inbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Automated scoring coverage',
    description: 'Assesses whether lead scoring models leverage enriched data for real-time prioritization.',
  },
  {
    name: 'Inbound Routing Speed',
    status: 'unable',
    addToEngagement: false,
    function: 'Inbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Average routing time',
    description: 'Tracks time from lead creation to assignment, including enrichment processing delay.',
  },
  {
    name: 'Inbound Conversion Tracking',
    status: 'unable',
    addToEngagement: false,
    function: 'Inbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Enriched lead conversion rate',
    description: 'Compares conversion rates of enriched vs. non-enriched inbound leads.',
  },

  // --- Outbound Pipeline (4) ---
  {
    name: 'List Building Automation',
    status: 'unable',
    addToEngagement: false,
    function: 'Outbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'List build cycle time',
    description: 'Evaluates the speed and automation level of building targeted outbound prospect lists.',
  },
  {
    name: 'Signal-Based Targeting',
    status: 'unable',
    addToEngagement: false,
    function: 'Outbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Signal-sourced pipeline percentage',
    description: 'Measures adoption of intent and buying signals to prioritize outbound targeting.',
  },
  {
    name: 'Personalization at Scale',
    status: 'unable',
    addToEngagement: false,
    function: 'Outbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Personalized sequence percentage',
    description: 'Assesses how enriched data is used to personalize outbound messaging at scale.',
  },
  {
    name: 'Sequence Integration',
    status: 'unable',
    addToEngagement: false,
    function: 'Outbound Pipeline',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Sequence enrollment automation rate',
    description: 'Tracks whether enriched contacts are automatically enrolled into outbound sequences.',
  },

  // --- Account Intelligence (4) ---
  {
    name: 'ICP Definition & Scoring',
    status: 'unable',
    addToEngagement: false,
    function: 'Account Intelligence',
    outcome: 'Increase Pipeline Coverage',
    metric: 'ICP match rate',
    description: 'Evaluates whether ICP criteria are data-driven and enrichment-informed for scoring.',
  },
  {
    name: 'TAM Coverage Analysis',
    status: 'unable',
    addToEngagement: false,
    function: 'Account Intelligence',
    outcome: 'Increase Pipeline Coverage',
    metric: 'TAM coverage percentage',
    description: 'Measures what percentage of the total addressable market has been identified and enriched.',
  },
  {
    name: 'Intent Signal Integration',
    status: 'unable',
    addToEngagement: false,
    function: 'Account Intelligence',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Intent data coverage',
    description: 'Assesses integration of third-party intent signals into account prioritization workflows.',
  },
  {
    name: 'Account Scoring Model',
    status: 'unable',
    addToEngagement: false,
    function: 'Account Intelligence',
    outcome: 'Increase Pipeline Coverage',
    metric: 'Account score accuracy',
    description: 'Evaluates the sophistication and accuracy of account-level scoring using enriched attributes.',
  },

  // --- Integration Health (4) ---
  {
    name: 'Clay-to-CRM Sync Reliability',
    status: 'unable',
    addToEngagement: false,
    function: 'Integration Health',
    outcome: 'Improve Data Quality',
    metric: 'Sync success rate',
    description: 'Measures the reliability and completeness of data flowing from Clay into the CRM.',
  },
  {
    name: 'Webhook Health Monitoring',
    status: 'unable',
    addToEngagement: false,
    function: 'Integration Health',
    outcome: 'Improve Data Quality',
    metric: 'Webhook failure rate',
    description: 'Tracks webhook delivery success and identifies patterns in integration failures.',
  },
  {
    name: 'Error Rate Tracking',
    status: 'unable',
    addToEngagement: false,
    function: 'Integration Health',
    outcome: 'Improve Data Quality',
    metric: 'Integration error rate',
    description: 'Monitors the frequency and severity of errors across Clay integrations and enrichment flows.',
  },
  {
    name: 'Data Latency Measurement',
    status: 'unable',
    addToEngagement: false,
    function: 'Integration Health',
    outcome: 'Improve Data Quality',
    metric: 'End-to-end data latency',
    description: 'Measures the time delay between enrichment completion and data availability in downstream systems.',
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
