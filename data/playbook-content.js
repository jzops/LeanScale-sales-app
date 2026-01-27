export const playbookContent = {
  'growth-model': {
    definition: {
      whatItIs: 'A financial modeling project that integrates top-down ARR targets with bottom-up GTM efficiency metrics (the Power 10) to create achievable quarterly revenue goals. The output identifies specific gaps—which conversion rates, volume metrics, or efficiency metrics need improvement to hit targets. The model breaks ARR into its core components: New ARR, Expansion ARR, Contraction ARR, and Churned ARR to show which motion drives results.',
      whatItIsNot: 'Not a quota-setting exercise (that\'s a downstream project). Not a CRM implementation or data cleanup. Not a sales process redesign. Not a comp plan design. Not a one-time deliverable—the model must be maintainable and updated monthly by the client.',
    },
    valueProp: {
      pain: 'Leadership has a board-mandated ARR target but no clear line of sight into what operational metrics need to change to hit it. They\'re flying blind—targets feel arbitrary, gaps are unclear, and resource allocation is based on gut feel. In 2025\'s environment, VCs and boards demand proof of efficient growth (not growth at any cost), and clients lack the framework to demonstrate monetization and retention alongside growth.',
      outcome: 'A quarterly roadmap showing exactly which metrics are off-benchmark, where capacity gaps exist, and what investment (reps, pipeline, leads) is needed to hit targets. Leadership can now prioritize with confidence and validate their plan against external benchmarks (KeyBanc, OpenView). The model enables scenario planning (base case, upside, conservative) and feeds into monthly ARR momentum tracking.',
      owner: 'Typically the CRO, VP Sales, or Head of RevOps on the client side. Finance/FP&A as secondary stakeholder.',
    },
    implementation: [
      {
        title: 'Part 1: Discovery & Data Collection',
        steps: [
          'Conduct Kickoff and Align on Targets - Meet with executive sponsor (CRO/VP Sales) to validate top-down ARR targets and understand board-level expectations',
          'Extract Historical CRM Data - Pull 12-18 months of closed-won deal data and calculate historical conversion rates by segment and source',
          'Gather NRR and Benchmark Data - Collect retention metrics and industry benchmarks to establish current state vs target state',
          'Document Current State Baseline - Synthesize discovery findings into a structured baseline document for model building',
        ],
      },
      {
        title: 'Part 2: Build Financial Model',
        steps: [
          'Structure the Power 10 Metrics Framework - Build the core spreadsheet structure with current, target, and benchmark columns',
          'Calculate Bottoms-Up Revenue Targets - Model the required conversion rates, pipeline coverage, and lead volumes to hit quarterly ARR targets',
          'Model Capacity Requirements - Determine rep count, ramp assumptions, and resource needs by quarter to support revenue targets',
          'Build ARR Momentum Table - Create monthly ARR tracking table that breaks out New, Expansion, Contraction, and Churned ARR',
          'Build Scenario Models - Create base, upside, and conservative scenarios with sensitivity analysis on key drivers',
        ],
      },
      {
        title: 'Part 3: Validate and Stress-Test Model',
        steps: [
          'Cross-Reference Against Current Pipeline - Validate model feasibility by comparing bottoms-up requirements against actual weighted pipeline',
          'Validate Assumptions with Stakeholders - Review model assumptions with sales and RevOps leaders to ensure they reflect operational reality',
          'Quantify Gap Analysis - Identify the 2-3 metrics most out of line with benchmarks and translate gaps into dollar impact',
        ],
      },
      {
        title: 'Part 4: Handoff & Enablement',
        steps: [
          'Present Findings to Leadership - Deliver executive presentation with prioritized recommendations and model walkthrough',
          'Train Internal Team on Model Maintenance - Enable RevOps or Finance to update the model monthly without external support',
          'Deliver Documentation Package - Provide complete documentation covering model inputs, assumptions, and update cadence',
          'Schedule Refinement Check-In - Set up 30-day follow-up to validate actuals vs model and refine assumptions',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM access with at least 12 months of closed-won deal data (ideally 18-24 months for trend analysis)',
        'Clear top-down ARR targets (board-level or exec-level) with quarterly breakdown',
        'Access to key stakeholder (CRO, VP Sales, or RevOps lead) for validation',
        'Understanding of current pricing/ACV structure and any planned pricing changes',
        'Customer data to calculate NRR (expansion, contraction, churn by cohort)',
      ],
      clientProvides: [
        'CRM admin access or exported deal data with stage history',
        'Board deck or exec targets for ARR goals',
        '30-60 min kickoff call with revenue leader',
        'Clarity on segments (enterprise vs SMB vs mid-market) and how they\'re defined',
        'Historical NRR data or access to billing/subscription system to calculate it',
      ],
      leanscaleBrings: [
        'Industry benchmark data (KeyBanc, OpenView, Bessemer)',
        'Power 10 framework and model templates',
        'GTM expertise to identify gaps and prioritize based on ROI of improvement',
        'Scenario modeling methodology',
      ],
    },
    pitfalls: [
      {
        issue: 'Applying a single growth rate across all segments without segment-specific analysis',
        mitigation: 'Break out model by segment (Enterprise, Mid-Market, SMB) since conversion rates, sales cycles, and ACVs differ significantly. Model capacity needs per segment.',
      },
      {
        issue: 'Ignoring churn and contraction in the bottoms-up model, overstating net ARR growth',
        mitigation: 'Explicitly model Net Revenue Retention with separate lines for expansion, contraction, and churn. Treat retention and expansion as part of pipeline forecasts, not afterthoughts.',
      },
      {
        issue: 'Building a model too complex to maintain monthly, leading to abandonment',
        mitigation: 'Focus on the 7-10 key drivers that create 80% of impact (the Power 10 framework). Client RevOps must be able to update it in 2 hours or less per month.',
      },
      {
        issue: 'Validating assumptions only against historical trends without pipeline reality check',
        mitigation: 'Cross-reference bottoms-up forecast against current weighted pipeline to ensure targets are feasible, not aspirational. Adjust if pipeline coverage is below 3x.',
      },
    ],
  },
  'market-map': {
    definition: {
      whatItIs: 'A strategic data infrastructure project that identifies, enriches, and tiers your Total Addressable Market (TAM) into actionable account segments with ICP fit scores, then operationalizes this intelligence directly in your CRM and outbound tools (Clay, ZoomInfo, Apollo). The output is a living, queryable market database that enables precise targeting across sales, marketing, and RevOps.',
      whatItIsNot: 'Not a one-time ICP definition exercise (personas without data). Not a competitive analysis report. Not a CRM cleanup project (that\'s data hygiene). Not lead scoring implementation (that\'s a downstream project). Not territory planning (though it informs it).',
    },
    valueProp: {
      pain: 'Your ICP is a document sitting in a Google Doc—not infrastructure. Sales can\'t filter by tier, marketing can\'t segment by fit score, and you\'re burning enrichment credits on accounts that don\'t matter. Research shows only 23% of pipeline actually fits ICP, and wrong-fit deals are 8x harder to close.',
      outcome: 'All accounts from your TAM in CRM with propensity scoring. All target personas at those accounts. Account valuations for territory design. Foundation for real-time signals on accounts that matter. When a T1 account posts a job for a role your product supports—you see it. When a T1 account\'s competitor just made a move—you see it.',
      owner: 'CRO, VP Sales, VP Marketing, Head of RevOps, RevOps Manager, Sales Leadership, Marketing Leadership.',
    },
    implementation: [
      {
        title: 'Part 1: Scoping & Discovery',
        steps: [
          'Determine company type (Vertical vs Horizontal) and TAM size',
          'Assess sales team size and data quality in CRM',
          'Identify required data providers based on vertical (Apollo, Clearbit, Cause IQ, etc.)',
          'Choose approach: Full TAM Pull, Tiered Pull, T1 Only, or CRM Cleanup First',
        ],
      },
      {
        title: 'Part 2: ICP Definition & Validation',
        steps: [
          'Conduct ICP workshop with executive sponsor and sales leadership',
          'Define firmographic criteria (industry, employee count, revenue, geography)',
          'Define technographic criteria (tech stack signals, tools in use)',
          'Validate criteria against historical closed-won/lost data',
        ],
      },
      {
        title: 'Part 3: Build Market Map in Clay',
        steps: [
          'Configure Clay Searcher with ICP criteria',
          'Set up waterfall enrichment for firmographics and technographics',
          'Build ICP fit scoring logic using Score Row feature',
          'Calculate account valuations for territory design',
          'Configure tiering logic (T1/T2/T3)',
        ],
      },
      {
        title: 'Part 4: CRM Integration & Handoff',
        steps: [
          'Create custom fields in CRM for tier, fit score, and valuation',
          'Configure Clay-to-CRM sync workflow',
          'Load enriched accounts into CRM',
          'Train RevOps on maintenance and update procedures',
          'Document data sources and refresh cadence',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM (Salesforce or HubSpot) with admin access',
        'Clay account with sufficient credits (minimum 10k recommended)',
        'Clear understanding of segments and how they\'re defined',
        'Historical closed-won/lost data (100+ customers ideal)',
      ],
      clientProvides: [
        'CRM admin access',
        'Data provider subscriptions (Apollo, Clearbit, etc.)',
        '60-minute ICP workshop with revenue leadership',
        'Validation time during persona workshop',
      ],
      leanscaleBrings: [
        'Clay expertise and workflow templates',
        'ICP scoring methodology',
        'Industry benchmark data',
        'Territory valuation frameworks',
      ],
    },
    pitfalls: [
      {
        issue: 'Trying to map entire TAM for horizontal product with millions of potential accounts',
        mitigation: 'Use T1 Only approach with very restrictive criteria. Start with 500-2k accounts per rep, expand later based on capacity.',
      },
      {
        issue: 'Over-relying on historical data without validating against current market conditions',
        mitigation: 'Balance data-driven insights with stakeholder interviews and real-time Clay Searcher validation during workshops.',
      },
      {
        issue: 'Building Market Map without CRM integration plan',
        mitigation: 'Start with CRM field architecture. The Market Map is only valuable if it powers your systems—not if it sits in Clay.',
      },
    ],
  },
  'automated-inbound': {
    definition: {
      whatItIs: 'A project that automates the enrichment, scoring, routing, and follow-up of inbound leads using Clay and CRM workflows. The deliverable is a working pipeline where leads are instantly enriched, tiered, routed to the right rep or sequence, and actioned—whether that\'s human follow-up, automated response, or calendar booking.',
      whatItIsNot: 'Not a data cleansing/deduplication project. Not a lead scoring model build (that uses enriched data but is separate scope). Not a market mapping/ICP exercise (that defines target criteria). Not copywriting services (structure provided, client writes messaging).',
    },
    valueProp: {
      pain: 'Marketing and sales teams receive inbound leads with minimal information (name, email, company) forcing SDRs to spend 10-15 minutes manually researching each lead before outreach. This delays speed-to-lead, creates inconsistent data quality, and wastes selling time on research. Studies show businesses responding in 5 minutes are 100x more likely to connect and convert.',
      outcome: 'Every inbound lead is automatically enriched with 15-25 data points (company size, industry, tech stack, job title, direct dial, funding, etc.) within seconds of form submission. SDRs can immediately prioritize and personalize outreach. Lead scoring and routing operate on complete data. Off-hours leads get automated response within minutes.',
      owner: 'VP of Marketing Operations or RevOps Leader (with input from Demand Gen and Sales Development leadership).',
    },
    implementation: [
      {
        title: 'Part 1: Architecture & Configuration',
        steps: [
          'Map current inbound lead flow and identify integration points',
          'Configure webhook receiver table in Clay',
          'Set up CRM triggers for form submissions',
          'Build enrichment waterfall (75+ data providers)',
        ],
      },
      {
        title: 'Part 2: Scoring & Routing Logic',
        steps: [
          'Define MQL criteria and scoring thresholds',
          'Build tier-based routing rules (T1 gets priority treatment)',
          'Configure round-robin or territory-based assignment',
          'Set up off-hours detection and automated response flows',
        ],
      },
      {
        title: 'Part 3: Sequencing & Follow-up',
        steps: [
          'Design decision tree for human vs automated follow-up',
          'Configure sequences for different lead tiers',
          'Set up Slack/email notifications with enrichment data',
          'Build proof hyperlinks for rep context',
        ],
      },
      {
        title: 'Part 4: Testing & Handoff',
        steps: [
          'Test end-to-end flow with sample leads',
          'Validate enrichment match rates and routing accuracy',
          'Train SDR team on new workflow',
          'Document maintenance procedures and error handling',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM (Salesforce or HubSpot) with workflow capabilities',
        'Clay account with webhook receiver access',
        'At least 50+ inbound leads/month to justify automation',
        'Clear MQL definition and routing preferences',
      ],
      clientProvides: [
        'CRM admin access',
        'Integration layer (HubSpot Operations Hub, n8n, or Zapier)',
        'Sequencing tool access (Outreach, Salesloft, HubSpot sequences)',
        'SDR leadership input on routing preferences',
      ],
      leanscaleBrings: [
        'Clay webhook and enrichment configuration',
        'Decision tree templates',
        'Speed-to-lead best practices',
        'Tier-based routing frameworks',
      ],
    },
    pitfalls: [
      {
        issue: 'Over-enriching every lead regardless of fit, burning Clay credits',
        mitigation: 'Integrate with Market Map to check if account is T1 before spending credits. Route low-fit leads directly to nurture without full enrichment.',
      },
      {
        issue: 'Complex routing rules that break when edge cases appear',
        mitigation: 'Start simple. Build routing for 80% case first, add edge case handling incrementally based on actual failures.',
      },
      {
        issue: 'Speed-to-lead metrics not improving because notification goes to wrong channel',
        mitigation: 'Validate notification delivery during testing. Ensure reps have mobile Slack access for off-hours leads.',
      },
    ],
  },
  'gtm-lifecycle': {
    definition: {
      whatItIs: 'An end-to-end customer journey framework that defines and operationalizes every stage from anonymous visitor to loyal customer advocate. It encompasses Lead Lifecycle, Sales Lifecycle, and Customer Lifecycle as interconnected systems with clear stage definitions, conversion metrics, and handoff processes.',
      whatItIsNot: 'Not just a CRM stage configuration. Not a one-time documentation exercise. Not sales process training. Not a technology implementation without process design.',
    },
    valueProp: {
      pain: 'Sales and marketing operate in silos with different definitions of stages, no clear handoff points, and no visibility into where deals stall. Conversion rates aren\'t measured consistently, and there\'s no single source of truth for customer journey health.',
      outcome: 'A unified view of the entire customer journey with standardized stage definitions across teams, clear ownership at each stage, measurable conversion rates, and automated workflows that ensure consistent execution. Every team member knows exactly where any prospect or customer stands.',
      owner: 'CRO or VP RevOps as primary owner, with VP Marketing, VP Sales, and VP Customer Success as co-owners of their respective lifecycle segments.',
    },
    implementation: [
      {
        title: 'Part 1: Current State Assessment',
        steps: [
          'Map existing stages and definitions across all systems',
          'Document current handoff processes and pain points',
          'Identify gaps in stage coverage and metric tracking',
          'Analyze historical conversion rates by stage',
        ],
      },
      {
        title: 'Part 2: Framework Design',
        steps: [
          'Define standardized stages across Lead, Sales, and Customer lifecycles',
          'Establish clear entry/exit criteria for each stage',
          'Design handoff protocols between teams',
          'Create stage-specific dashboards and KPIs',
        ],
      },
      {
        title: 'Part 3: System Configuration',
        steps: [
          'Configure CRM stages to match framework',
          'Build automation for stage transitions',
          'Set up reporting for conversion rates',
          'Integrate with marketing automation for lead stages',
        ],
      },
      {
        title: 'Part 4: Rollout & Enablement',
        steps: [
          'Train all GTM teams on new framework',
          'Document playbooks for each stage transition',
          'Launch with pilot team before full rollout',
          'Establish regular review cadence for stage health',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with configurable stages and automation',
        'Marketing automation platform',
        'Cross-functional alignment on project goals',
        'Executive sponsorship for process changes',
      ],
      clientProvides: [
        'Access to all GTM systems',
        'Time commitment from sales, marketing, and CS leadership',
        'Historical data for baseline metrics',
        'Change management support for team adoption',
      ],
      leanscaleBrings: [
        'Lifecycle framework templates',
        'Stage definition best practices',
        'Conversion benchmark data',
        'Cross-functional alignment facilitation',
      ],
    },
    pitfalls: [
      {
        issue: 'Designing framework without input from front-line teams who execute it',
        mitigation: 'Include SDRs, AEs, and CSMs in design workshops. Their feedback on what works/doesn\'t work is essential.',
      },
      {
        issue: 'Over-engineering with too many stages that create confusion',
        mitigation: 'Start with 5-7 stages per lifecycle segment. Add complexity only when measurement demands it.',
      },
    ],
  },
  'lead-lifecycle': {
    definition: {
      whatItIs: 'A structured framework that defines every stage a lead passes through from first touch to sales acceptance, including stage definitions, routing rules, conversion tracking, and SLA requirements. It operationalizes MQL, SQL, and SAL definitions in your CRM and marketing automation.',
      whatItIsNot: 'Not lead scoring alone (that\'s one input). Not marketing attribution (that\'s a related but separate project). Not just CRM configuration without process design.',
    },
    valueProp: {
      pain: 'Marketing and sales disagree on lead quality. MQL definitions are fuzzy. Leads fall through cracks between stages. There\'s no visibility into where leads stall or why they don\'t convert. SLAs for lead follow-up aren\'t tracked.',
      outcome: 'Crystal-clear stage definitions that marketing and sales both agree on. Automated routing based on lead attributes. Visibility into conversion rates at every stage. SLA tracking for lead response times. Data-driven optimization of lead flow.',
      owner: 'Head of RevOps or VP Marketing Ops, with VP Sales Development and VP Demand Gen as key stakeholders.',
    },
    implementation: [
      {
        title: 'Part 1: Discovery & Alignment',
        steps: [
          'Interview marketing and sales leadership on current definitions',
          'Document existing lead stages and routing rules',
          'Identify pain points and gaps in current process',
          'Analyze historical lead conversion data',
        ],
      },
      {
        title: 'Part 2: Framework Design',
        steps: [
          'Define lead stages (Raw Lead, MQL, SQL, SAL, etc.)',
          'Establish qualification criteria for each stage',
          'Design routing logic based on lead attributes',
          'Set SLA requirements for stage transitions',
        ],
      },
      {
        title: 'Part 3: System Implementation',
        steps: [
          'Configure CRM lead stages and fields',
          'Build automation for stage transitions',
          'Integrate with marketing automation for MQL triggers',
          'Set up SLA tracking and alerts',
        ],
      },
      {
        title: 'Part 4: Reporting & Optimization',
        steps: [
          'Build conversion funnel dashboards',
          'Create stage velocity reports',
          'Set up weekly funnel review process',
          'Document ongoing optimization procedures',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with lead object and workflow automation',
        'Marketing automation platform',
        'Lead scoring model (or plan to build one)',
        'Cross-functional alignment on MQL/SQL definitions',
      ],
      clientProvides: [
        'CRM and MAP admin access',
        'Historical lead data for baseline',
        'Sales and marketing leadership time for workshops',
        'Commitment to SLA enforcement',
      ],
      leanscaleBrings: [
        'Lead lifecycle framework templates',
        'Stage definition best practices',
        'SLA benchmarks by industry',
        'Routing logic patterns',
      ],
    },
    pitfalls: [
      {
        issue: 'MQL definition so broad that sales rejects most leads',
        mitigation: 'Define MQL with sales input. Use lead scoring threshold data to find the point where sales acceptance is >70%.',
      },
      {
        issue: 'SLAs set but not enforced or tracked',
        mitigation: 'Build automated alerts for SLA breaches. Include SLA compliance in rep performance reviews.',
      },
    ],
  },
  'sales-lifecycle': {
    definition: {
      whatItIs: 'A structured framework defining opportunity stages, sales process, and pipeline management from first qualified meeting to closed-won/lost. It includes stage definitions, exit criteria, required activities, and forecasting methodology.',
      whatItIsNot: 'Not sales methodology training (though it informs it). Not CRM implementation without process design. Not just pipeline reporting without stage discipline.',
    },
    valueProp: {
      pain: 'Opportunity stages are inconsistent—some reps advance deals prematurely, others sandbag. Pipeline reviews lack structure. Forecast accuracy is poor because stage definitions are fuzzy. There\'s no visibility into deal velocity or stage-specific conversion rates.',
      outcome: 'Standardized opportunity stages with clear exit criteria. Consistent pipeline that leadership can trust. Improved forecast accuracy based on stage probabilities. Visibility into deal velocity and where deals stall. Data-driven coaching on stage-specific skills.',
      owner: 'VP Sales or CRO, with RevOps as implementation partner and Sales Managers as key stakeholders.',
    },
    implementation: [
      {
        title: 'Part 1: Current State Analysis',
        steps: [
          'Audit current opportunity stages and usage patterns',
          'Analyze historical win rates by stage',
          'Interview sales leaders on process gaps',
          'Review existing forecasting methodology',
        ],
      },
      {
        title: 'Part 2: Process Design',
        steps: [
          'Define opportunity stages with clear exit criteria',
          'Map required activities and artifacts per stage',
          'Establish stage-specific close probabilities',
          'Design pipeline review and inspection process',
        ],
      },
      {
        title: 'Part 3: CRM Configuration',
        steps: [
          'Configure opportunity stages and required fields',
          'Build validation rules for stage advancement',
          'Create stage-based dashboards and reports',
          'Set up forecast categories and projections',
        ],
      },
      {
        title: 'Part 4: Enablement & Adoption',
        steps: [
          'Train sales team on new process',
          'Implement pipeline inspection cadence',
          'Launch with coaching support for first 30 days',
          'Establish ongoing deal review protocols',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with opportunity management',
        'Sales leadership alignment on process goals',
        'Historical opportunity data for analysis',
        'Commitment to enforcement and inspection',
      ],
      clientProvides: [
        'CRM admin access',
        'Sales leadership time for workshops',
        'Historical win/loss data',
        'Commitment to new process adoption',
      ],
      leanscaleBrings: [
        'Sales process framework templates',
        'Stage probability benchmarks',
        'Pipeline inspection methodologies',
        'Forecasting best practices',
      ],
    },
    pitfalls: [
      {
        issue: 'Too many stages creating administrative burden for reps',
        mitigation: 'Limit to 5-7 stages. Each stage should represent a meaningful milestone, not a checklist item.',
      },
      {
        issue: 'Stage definitions not enforced, leading to return to old habits',
        mitigation: 'Build validation rules in CRM. Include stage compliance in pipeline review inspections.',
      },
    ],
  },
  'customer-lifecycle': {
    definition: {
      whatItIs: 'A structured framework defining post-sale customer stages from onboarding through renewal and expansion, including health scoring, touchpoint cadences, and escalation protocols. It operationalizes the customer journey in your CS platform and CRM.',
      whatItIsNot: 'Not customer support ticketing (that\'s operational). Not NPS surveys alone (that\'s one input). Not CS platform implementation without process design.',
    },
    valueProp: {
      pain: 'No visibility into customer health until they\'re already churning. CS activities are reactive. Renewal conversations happen too late. Expansion opportunities are missed because there\'s no systematic identification. Handoff from sales to CS is inconsistent.',
      outcome: 'Proactive customer management with health scoring that predicts risk. Systematic touchpoint cadences by segment. Renewal management starting 90+ days before contract end. Expansion opportunity identification and playbooks. Smooth sales-to-CS handoff process.',
      owner: 'VP Customer Success, with RevOps as implementation partner and CRO as executive sponsor.',
    },
    implementation: [
      {
        title: 'Part 1: Customer Journey Mapping',
        steps: [
          'Map current customer lifecycle stages',
          'Document existing touchpoint cadences',
          'Analyze historical churn and expansion patterns',
          'Identify gaps in customer visibility',
        ],
      },
      {
        title: 'Part 2: Framework Design',
        steps: [
          'Define customer stages (Onboarding, Adoption, Value Realization, Renewal, Expansion)',
          'Design health scoring model',
          'Create segment-specific touchpoint cadences',
          'Establish escalation protocols for at-risk customers',
        ],
      },
      {
        title: 'Part 3: System Implementation',
        steps: [
          'Configure CS platform with lifecycle stages',
          'Build health score automation',
          'Set up renewal and expansion opportunity tracking',
          'Integrate with CRM for unified customer view',
        ],
      },
      {
        title: 'Part 4: Operationalization',
        steps: [
          'Train CS team on new framework',
          'Implement customer review cadence (QBRs, health reviews)',
          'Launch sales-to-CS handoff process',
          'Document playbooks for each lifecycle stage',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with customer/account management',
        'CS platform (or plan to implement)',
        'Product usage data (if available)',
        'Historical churn and expansion data',
      ],
      clientProvides: [
        'CS platform and CRM access',
        'CS leadership time for workshops',
        'Customer segmentation logic',
        'Product usage data access',
      ],
      leanscaleBrings: [
        'Customer lifecycle framework templates',
        'Health score design methodology',
        'Touchpoint cadence benchmarks',
        'Expansion playbook templates',
      ],
    },
    pitfalls: [
      {
        issue: 'Health score based on lagging indicators that don\'t predict churn',
        mitigation: 'Include leading indicators like product usage, engagement, and NPS. Validate model against historical churn data.',
      },
      {
        issue: 'Touchpoint cadences designed without considering CS capacity',
        mitigation: 'Match cadence intensity to segment value. High-touch for enterprise, scaled for SMB.',
      },
    ],
  },
  'executive-reporting-suite': {
    definition: {
      whatItIs: 'A board-ready reporting package that provides executive leadership with a comprehensive view of GTM performance, including ARR metrics, pipeline health, conversion rates, and efficiency indicators. The output is a set of standardized dashboards and reports that update automatically.',
      whatItIsNot: 'Not operational reports for frontline managers (that\'s a different scope). Not a one-time snapshot (must be automated and sustainable). Not a BI platform implementation without content design.',
    },
    valueProp: {
      pain: 'Leadership spends hours before each board meeting manually assembling metrics from multiple sources. Reports are inconsistent month-over-month. There\'s no single source of truth for GTM performance. Strategic decisions are made without complete data.',
      outcome: 'Automated, board-ready dashboards that update in real-time. Standardized metrics with consistent definitions. ARR momentum tracking, pipeline coverage, conversion rates, and efficiency metrics all in one view. Leadership can walk into any board meeting with confidence.',
      owner: 'CRO or Head of RevOps, with CFO as secondary stakeholder for ARR and financial metrics.',
    },
    implementation: [
      {
        title: 'Part 1: Requirements Gathering',
        steps: [
          'Interview executive leadership on reporting needs',
          'Review existing board deck and reporting cadence',
          'Identify gaps in current metrics visibility',
          'Define priority metrics and KPIs',
        ],
      },
      {
        title: 'Part 2: Data Foundation',
        steps: [
          'Audit data quality in source systems',
          'Define metric calculations and business rules',
          'Map data sources to reporting requirements',
          'Build data model for executive reporting',
        ],
      },
      {
        title: 'Part 3: Dashboard Development',
        steps: [
          'Design dashboard layouts and visualizations',
          'Build ARR momentum and pipeline dashboards',
          'Create conversion funnel and efficiency reports',
          'Implement drill-down capabilities',
        ],
      },
      {
        title: 'Part 4: Automation & Handoff',
        steps: [
          'Automate data refresh and delivery',
          'Document metric definitions and calculations',
          'Train team on dashboard maintenance',
          'Establish update cadence and ownership',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with accurate ARR and pipeline data',
        'BI platform (Salesforce, Tableau, Looker)',
        'Clear metric definitions',
        'Executive alignment on priority KPIs',
      ],
      clientProvides: [
        'BI platform access',
        'Executive time for requirements sessions',
        'Existing board deck for reference',
        'Data access across GTM systems',
      ],
      leanscaleBrings: [
        'Executive dashboard templates',
        'Metric definition frameworks',
        'Board reporting best practices',
        'Visualization design expertise',
      ],
    },
    pitfalls: [
      {
        issue: 'Building reports on data that isn\'t clean or complete',
        mitigation: 'Start with data audit. Fix foundational issues before building dashboards that will be wrong.',
      },
      {
        issue: 'Creating dashboards that no one updates or uses',
        mitigation: 'Automate everything possible. Assign clear ownership. Tie dashboards to existing board meeting cadence.',
      },
    ],
  },
  'quotas-targets': {
    definition: {
      whatItIs: 'A methodology for setting achievable sales quotas based on capacity analysis, historical performance, and market opportunity. The output is a quota model that balances top-down targets with bottoms-up capacity reality.',
      whatItIsNot: 'Not comp plan design (that\'s downstream). Not territory planning (though they\'re related). Not a one-time exercise (quotas should be validated quarterly).',
    },
    valueProp: {
      pain: 'Quotas are set top-down without regard to rep capacity or market reality. Either quotas are sandbagged (too easy) or unrealistic (demoralizing). 77% of sellers missed quota in 2025—often because the targets were wrong, not because the sellers failed.',
      outcome: 'Data-driven quotas that reps believe are achievable. Clear visibility into quota coverage and risk. Quota model that balances top-down targets with bottoms-up capacity. Framework for quarterly validation and adjustment.',
      owner: 'VP Sales or CRO, with RevOps as analytical partner and Finance as stakeholder for ARR alignment.',
    },
    implementation: [
      {
        title: 'Part 1: Historical Analysis',
        steps: [
          'Analyze historical quota attainment by rep and segment',
          'Calculate rep productivity benchmarks',
          'Assess ramp time and new hire productivity curves',
          'Document seasonal patterns and trends',
        ],
      },
      {
        title: 'Part 2: Capacity Modeling',
        steps: [
          'Calculate current quota capacity based on headcount',
          'Model new hire impact with ramp assumptions',
          'Factor in expected attrition',
          'Build capacity by quarter and segment',
        ],
      },
      {
        title: 'Part 3: Quota Allocation',
        steps: [
          'Reconcile top-down targets with bottoms-up capacity',
          'Allocate quotas by territory and segment',
          'Build individual quota models for reps',
          'Create scenario models for different attainment levels',
        ],
      },
      {
        title: 'Part 4: Validation & Rollout',
        steps: [
          'Validate quotas with sales leadership',
          'Present quota rationale to sales team',
          'Document quarterly review process',
          'Set up attainment tracking dashboards',
        ],
      },
    ],
    dependencies: {
      before: [
        'Historical quota and attainment data',
        'Clear ARR targets from leadership',
        'Headcount plan for quota period',
        'Territory or segment definitions',
      ],
      clientProvides: [
        'CRM data on historical performance',
        'Hiring plan and new hire assumptions',
        'Top-down ARR targets',
        'Sales leadership time for validation',
      ],
      leanscaleBrings: [
        'Quota modeling frameworks',
        'Productivity benchmarks by segment',
        'Ramp curve templates',
        'Attainment analysis methodology',
      ],
    },
    pitfalls: [
      {
        issue: 'Setting quotas without considering pipeline reality',
        mitigation: 'Cross-reference quota model against actual weighted pipeline. Quotas without pipeline coverage are aspirational, not achievable.',
      },
      {
        issue: 'Over-relying on historical attainment without market adjustment',
        mitigation: 'Factor in market changes, competitive dynamics, and economic conditions. Past performance doesn\'t guarantee future results.',
      },
    ],
  },
  'crm-deduplication': {
    definition: {
      whatItIs: 'A one-time data cleanup project to identify and merge duplicate accounts, contacts, and leads in your CRM. The output is a clean database with merged records, established surviving record rules, and documented governance for ongoing hygiene.',
      whatItIsNot: 'Not ongoing deduplication (that\'s a separate tool). Not data enrichment (though often paired). Not CRM migration (that\'s a different scope).',
    },
    valueProp: {
      pain: 'Duplicate records create confusion—multiple reps working the same account, attribution errors, inflated pipeline, and unreliable reporting. Sales teams waste time researching which record is accurate. Lead routing fails when duplicates exist.',
      outcome: 'Clean CRM with merged duplicates. Clear surviving record rules. Accurate reporting and attribution. Improved lead routing accuracy. Foundation for ongoing data quality.',
      owner: 'RevOps Manager or CRM Admin, with Sales Ops and Marketing Ops as stakeholders.',
    },
    implementation: [
      {
        title: 'Part 1: Assessment',
        steps: [
          'Audit current duplicate levels by object',
          'Identify duplicate patterns (domain, email, name)',
          'Document impact of duplicates on operations',
          'Define matching rules and merge logic',
        ],
      },
      {
        title: 'Part 2: Rule Definition',
        steps: [
          'Establish surviving record rules (which data wins)',
          'Define field-level merge logic',
          'Create exception handling for edge cases',
          'Get stakeholder sign-off on rules',
        ],
      },
      {
        title: 'Part 3: Execution',
        steps: [
          'Run matching analysis to identify duplicates',
          'Review and validate match candidates',
          'Execute merges in batches',
          'Document merge results and exceptions',
        ],
      },
      {
        title: 'Part 4: Prevention & Governance',
        steps: [
          'Implement duplicate blocking rules',
          'Document data governance procedures',
          'Train team on data entry best practices',
          'Set up ongoing monitoring for duplicate creep',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM admin access',
        'Deduplication tool (Cloudingo, Dedupely, etc.)',
        'Stakeholder alignment on merge rules',
        'Backup of current data',
      ],
      clientProvides: [
        'CRM admin access',
        'Deduplication tool access',
        'Stakeholder time for rule validation',
        'Backup procedures',
      ],
      leanscaleBrings: [
        'Deduplication methodology',
        'Surviving record best practices',
        'Merge rule templates',
        'Governance framework',
      ],
    },
    pitfalls: [
      {
        issue: 'Merging records without stakeholder buy-in on surviving record rules',
        mitigation: 'Get explicit sign-off on merge rules before execution. Wrong merges are hard to undo.',
      },
      {
        issue: 'One-time cleanup without prevention, leading to duplicate re-accumulation',
        mitigation: 'Always pair cleanup with blocking rules and ongoing governance. Clean data doesn\'t stay clean without process.',
      },
    ],
  },
  'crm-deduplication-ongoing': {
    definition: {
      whatItIs: 'An ongoing automated deduplication system that continuously identifies and handles duplicates as they\'re created, preventing CRM data quality degradation over time.',
      whatItIsNot: 'Not a one-time cleanup (that should be done first). Not data enrichment. Not CRM admin training.',
    },
    valueProp: {
      pain: 'After initial cleanup, duplicates slowly re-accumulate. Without ongoing prevention, you\'ll need another major cleanup project in 12-18 months. Data quality degrades imperceptibly until it\'s a crisis.',
      outcome: 'Continuous duplicate prevention with automated blocking and merging. Real-time alerts for potential duplicates. Sustained data quality without periodic cleanup projects. Confidence in CRM data integrity.',
      owner: 'RevOps Manager or CRM Admin.',
    },
    implementation: [
      {
        title: 'Part 1: Tool Configuration',
        steps: [
          'Configure ongoing deduplication tool',
          'Set up matching rules based on cleanup learnings',
          'Configure auto-merge thresholds for high-confidence matches',
          'Set up review queues for low-confidence matches',
        ],
      },
      {
        title: 'Part 2: Workflow Integration',
        steps: [
          'Integrate with lead creation workflows',
          'Set up account matching for new contacts',
          'Configure real-time blocking for obvious duplicates',
          'Establish review cadence for flagged records',
        ],
      },
      {
        title: 'Part 3: Monitoring & Maintenance',
        steps: [
          'Set up duplicate trend dashboards',
          'Configure alerts for match rule failures',
          'Document maintenance procedures',
          'Train team on review queue management',
        ],
      },
    ],
    dependencies: {
      before: [
        'Initial deduplication cleanup completed',
        'Deduplication tool with automation capabilities',
        'Defined matching and merge rules',
      ],
      clientProvides: [
        'Deduplication tool subscription',
        'CRM admin access',
        'Time for weekly review queue management',
      ],
      leanscaleBrings: [
        'Automation configuration expertise',
        'Threshold tuning methodology',
        'Monitoring dashboard templates',
      ],
    },
    pitfalls: [
      {
        issue: 'Auto-merge thresholds too aggressive, causing bad merges',
        mitigation: 'Start conservative. Only auto-merge 99%+ confidence matches. Increase over time as trust builds.',
      },
    ],
  },
  'fed-pubsec-partitioning': {
    definition: {
      whatItIs: 'A CRM architecture project for companies selling to federal and public sector customers that require data isolation, compliance controls, and specialized routing—all while maintaining a unified view of the business.',
      whatItIsNot: 'Not FedRAMP compliance consulting. Not government contracting advisory. Not separate CRM implementation.',
    },
    valueProp: {
      pain: 'Federal and public sector deals require different treatment—longer cycles, compliance requirements, different buying processes. Mixing them with commercial deals creates confusion, compliance risk, and inaccurate reporting.',
      outcome: 'Clean separation of federal/public sector data within unified CRM. Appropriate access controls for ITAR/compliance. Specialized reporting for government business. Routing that ensures the right team handles the right deals.',
      owner: 'VP Sales or Public Sector Sales Leader, with RevOps and IT/Security as key stakeholders.',
    },
    implementation: [
      {
        title: 'Part 1: Requirements Analysis',
        steps: [
          'Document compliance requirements (ITAR, etc.)',
          'Map current public sector data in CRM',
          'Identify access control needs',
          'Define reporting requirements',
        ],
      },
      {
        title: 'Part 2: Architecture Design',
        steps: [
          'Design partitioning approach (record types, sharing rules)',
          'Define field-level security requirements',
          'Create routing logic for public sector leads',
          'Design unified vs. segmented reporting views',
        ],
      },
      {
        title: 'Part 3: Implementation',
        steps: [
          'Configure CRM partitioning',
          'Set up access controls and sharing rules',
          'Build public sector-specific workflows',
          'Create segmented dashboards and reports',
        ],
      },
      {
        title: 'Part 4: Validation & Handoff',
        steps: [
          'Test access controls with compliance team',
          'Validate routing accuracy',
          'Train public sector team on new processes',
          'Document ongoing governance procedures',
        ],
      },
    ],
    dependencies: {
      before: [
        'CRM with enterprise sharing model capabilities',
        'Clear compliance requirements from legal/security',
        'Public sector team structure defined',
        'Understanding of government buying process',
      ],
      clientProvides: [
        'CRM admin access',
        'Compliance requirements documentation',
        'Public sector team input',
        'IT/Security sign-off',
      ],
      leanscaleBrings: [
        'Partitioning architecture patterns',
        'Access control best practices',
        'Government GTM experience',
        'Compliance-aware configuration expertise',
      ],
    },
    pitfalls: [
      {
        issue: 'Over-isolating public sector, losing unified business visibility',
        mitigation: 'Design for isolation where required, aggregation where valuable. Executive reporting should span all segments.',
      },
    ],
  },
  'org-chart-hiring': {
    definition: {
      whatItIs: 'A GTM organization design project that defines roles, responsibilities, reporting structures, and hiring roadmap aligned with your revenue targets and go-to-market strategy.',
      whatItIsNot: 'Not recruiting services. Not comp plan design. Not HR policy consulting.',
    },
    valueProp: {
      pain: 'GTM org structure evolved organically and no longer fits the stage. Roles overlap or have gaps. Hiring happens reactively without a plan. There\'s no clear path for scaling the team as revenue grows.',
      outcome: 'Clear org structure with defined roles and responsibilities. Hiring roadmap aligned with revenue targets. Capacity model showing when to hire. Job descriptions and interview frameworks. Clear career paths for GTM roles.',
      owner: 'CRO or VP Sales, with CEO and HR as stakeholders.',
    },
    implementation: [
      {
        title: 'Part 1: Current State Assessment',
        steps: [
          'Map current org structure and roles',
          'Document role overlaps and gaps',
          'Analyze current capacity vs. revenue targets',
          'Interview leadership on pain points and vision',
        ],
      },
      {
        title: 'Part 2: Future State Design',
        steps: [
          'Design target org structure by stage',
          'Define roles and responsibilities clearly',
          'Create capacity model for hiring triggers',
          'Map career paths and leveling',
        ],
      },
      {
        title: 'Part 3: Hiring Roadmap',
        steps: [
          'Prioritize hiring by revenue impact',
          'Create hiring timeline by quarter',
          'Develop job descriptions for key roles',
          'Build interview frameworks',
        ],
      },
      {
        title: 'Part 4: Documentation & Handoff',
        steps: [
          'Document org chart and RACI',
          'Create onboarding playbooks for new roles',
          'Present roadmap to leadership',
          'Establish quarterly review cadence',
        ],
      },
    ],
    dependencies: {
      before: [
        'Revenue targets and growth model',
        'Current org chart',
        'Leadership alignment on GTM strategy',
        'Budget parameters for hiring',
      ],
      clientProvides: [
        'Current role descriptions',
        'Revenue and capacity data',
        'Leadership time for workshops',
        'HR partnership for implementation',
      ],
      leanscaleBrings: [
        'GTM org design frameworks',
        'Role benchmarks by stage',
        'Capacity modeling methodology',
        'Job description templates',
      ],
    },
    pitfalls: [
      {
        issue: 'Designing org for where you want to be without a path from where you are',
        mitigation: 'Create staged roadmap. Show current state → near-term → target state with clear transitions.',
      },
    ],
  },
};
