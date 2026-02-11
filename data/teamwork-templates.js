/**
 * Teamwork Project Templates
 *
 * Defines standard task structures that get created in Teamwork
 * when a SOW is pushed. Each template has phases (become task lists)
 * with tasks inside them.
 *
 * SOW type → template mapping at the bottom.
 */

export const templates = {
  metric_implementation: {
    name: 'Metric Implementation',
    phases: [
      {
        name: 'Definition',
        tasks: [
          { content: 'Document metric definitions and business rules', description: 'Define exactly how each metric is calculated, what data sources feed it, and any business rules that apply.' },
          { content: 'Identify data sources and dependencies', description: 'Map out every system, table, or API that provides data for the metrics.' },
          { content: 'Define target thresholds and benchmarks', description: 'Establish what good/bad looks like for each metric based on industry benchmarks and company goals.' },
          { content: 'Get stakeholder sign-off on definitions', description: 'Review metric definitions with all stakeholders to ensure alignment.' },
        ],
      },
      {
        name: 'Configuration',
        tasks: [
          { content: 'Set up data pipelines and integrations', description: 'Configure connections between source systems and reporting tools.' },
          { content: 'Build metric calculations in reporting tool', description: 'Implement the metric formulas and calculations in the chosen platform.' },
          { content: 'Configure automated data refresh schedules', description: 'Set up scheduled data pulls to keep metrics current.' },
          { content: 'Build initial dashboards and views', description: 'Create the visual representations of the metrics for different audiences.' },
        ],
      },
      {
        name: 'Data Quality',
        tasks: [
          { content: 'Validate metric accuracy against known values', description: 'Cross-check calculated metrics against manually verified numbers.' },
          { content: 'Identify and resolve data gaps', description: 'Find missing data, null values, and inconsistencies that affect metric accuracy.' },
          { content: 'Set up data quality monitoring alerts', description: 'Configure alerts for when data quality drops below acceptable thresholds.' },
        ],
      },
      {
        name: 'Reporting',
        tasks: [
          { content: 'Finalize dashboard design and distribution', description: 'Polish dashboards and set up automated distribution to stakeholders.' },
          { content: 'Create documentation and runbook', description: 'Document how metrics work, how to troubleshoot issues, and who owns what.' },
          { content: 'Train stakeholders on metric interpretation', description: 'Walk stakeholders through how to read and act on the metrics.' },
          { content: 'Establish ongoing review cadence', description: 'Set up recurring meetings to review metrics and make adjustments.' },
        ],
      },
    ],
  },

  lifecycle_implementation: {
    name: 'Lifecycle Implementation',
    phases: [
      {
        name: 'Discovery',
        tasks: [
          { content: 'Map current-state lifecycle processes', description: 'Document how the lifecycle works today, including all handoffs and decision points.' },
          { content: 'Identify gaps and friction points', description: 'Find where leads/customers fall through cracks or experience delays.' },
          { content: 'Interview stakeholders across teams', description: 'Get input from each team that touches the lifecycle.' },
          { content: 'Document requirements and constraints', description: 'Capture what the new lifecycle must do and any technical/business constraints.' },
        ],
      },
      {
        name: 'Design',
        tasks: [
          { content: 'Design future-state lifecycle stages', description: 'Define the stages, criteria for progression, and ownership at each stage.' },
          { content: 'Define stage entry/exit criteria', description: 'Establish clear, measurable criteria for moving between stages.' },
          { content: 'Map automation opportunities', description: 'Identify where automation can reduce manual work and improve consistency.' },
          { content: 'Create SLA definitions between teams', description: 'Define response time and handoff expectations between teams.' },
          { content: 'Get design approval from stakeholders', description: 'Review the proposed lifecycle with all stakeholders and get sign-off.' },
        ],
      },
      {
        name: 'Implementation',
        tasks: [
          { content: 'Configure CRM stages and fields', description: 'Set up the lifecycle stages, custom fields, and picklist values in the CRM.' },
          { content: 'Build automation workflows', description: 'Create the automated workflows for stage transitions, notifications, and assignments.' },
          { content: 'Set up reporting and dashboards', description: 'Build the dashboards to track lifecycle velocity, conversion, and stage distribution.' },
          { content: 'Configure alerts and notifications', description: 'Set up automated alerts for SLA violations, stuck records, and key events.' },
        ],
      },
      {
        name: 'Testing',
        tasks: [
          { content: 'Test all stage transitions end-to-end', description: 'Walk test records through every possible path in the lifecycle.' },
          { content: 'Validate automation triggers and actions', description: 'Verify every automation fires correctly and produces the right outcomes.' },
          { content: 'Test edge cases and error scenarios', description: 'Test what happens when data is missing, stages are skipped, or processes fail.' },
          { content: 'UAT with end users', description: 'Have actual users test the lifecycle and provide feedback.' },
        ],
      },
      {
        name: 'Enablement',
        tasks: [
          { content: 'Create training materials', description: 'Build guides, videos, or documentation explaining the new lifecycle.' },
          { content: 'Conduct team training sessions', description: 'Train each team on their role in the lifecycle and how to use the new tools.' },
          { content: 'Run parallel processing period', description: 'Run old and new processes side-by-side to validate before full cutover.' },
          { content: 'Full cutover and go-live', description: 'Switch to the new lifecycle and decommission old processes.' },
          { content: 'Post-launch review and adjustments', description: 'Review performance after 2-4 weeks and make adjustments as needed.' },
        ],
      },
    ],
  },

  tool_implementation: {
    name: 'Tool Implementation',
    phases: [
      {
        name: 'Requirements',
        tasks: [
          { content: 'Document functional requirements', description: 'List every feature and capability the tool needs to provide.' },
          { content: 'Map integration requirements', description: 'Identify every system the tool needs to connect with and what data flows between them.' },
          { content: 'Define user roles and permissions', description: 'Document who needs access and what they can do.' },
          { content: 'Create data migration plan', description: 'Plan how existing data will be moved into the new tool.' },
        ],
      },
      {
        name: 'Configuration',
        tasks: [
          { content: 'Set up tool instance and environment', description: 'Provision the tool, configure base settings, and set up user accounts.' },
          { content: 'Configure custom fields and objects', description: 'Set up the data model to match business requirements.' },
          { content: 'Build workflows and automation rules', description: 'Configure automated processes within the tool.' },
          { content: 'Set up user roles and security', description: 'Configure permissions, teams, and access controls.' },
        ],
      },
      {
        name: 'Integration',
        tasks: [
          { content: 'Build API integrations', description: 'Connect the tool to other systems via APIs.' },
          { content: 'Configure data sync schedules', description: 'Set up regular data synchronization between systems.' },
          { content: 'Migrate existing data', description: 'Import historical data and validate accuracy.' },
          { content: 'Test integration data flows', description: 'Verify data moves correctly between all connected systems.' },
        ],
      },
      {
        name: 'Training',
        tasks: [
          { content: 'Create user documentation', description: 'Build how-to guides, FAQs, and reference materials.' },
          { content: 'Conduct admin training', description: 'Train system administrators on configuration and maintenance.' },
          { content: 'Conduct end-user training', description: 'Train users on daily workflows and features.' },
          { content: 'Set up support and escalation process', description: 'Define how users get help and how issues are escalated.' },
        ],
      },
      {
        name: 'Optimization',
        tasks: [
          { content: 'Monitor adoption metrics', description: 'Track usage, login frequency, and feature adoption.' },
          { content: 'Gather user feedback', description: 'Collect feedback on what works and what needs improvement.' },
          { content: 'Implement optimization improvements', description: 'Make adjustments based on feedback and usage data.' },
          { content: 'Finalize runbook and handoff', description: 'Document everything needed for ongoing operation and support.' },
        ],
      },
    ],
  },

  strategic_initiative: {
    name: 'Strategic Initiative',
    phases: [
      {
        name: 'Analysis',
        tasks: [
          { content: 'Gather and analyze current-state data', description: 'Collect relevant data about the current situation.' },
          { content: 'Benchmark against industry standards', description: 'Compare current performance to industry benchmarks and best practices.' },
          { content: 'Identify key gaps and opportunities', description: 'Pinpoint the biggest areas for improvement.' },
          { content: 'Develop findings presentation', description: 'Create a presentation summarizing analysis findings for stakeholders.' },
        ],
      },
      {
        name: 'Modeling',
        tasks: [
          { content: 'Build financial/operational model', description: 'Create models projecting outcomes under different scenarios.' },
          { content: 'Define assumptions and variables', description: 'Document all assumptions in the model and how to adjust them.' },
          { content: 'Run scenario analysis', description: 'Test different scenarios to understand range of outcomes.' },
          { content: 'Validate model with stakeholders', description: 'Review model assumptions and outputs with key stakeholders.' },
        ],
      },
      {
        name: 'Documentation',
        tasks: [
          { content: 'Create strategy documentation', description: 'Document the recommended strategy, rationale, and expected outcomes.' },
          { content: 'Build implementation roadmap', description: 'Create a phased plan for implementing the strategy.' },
          { content: 'Define success metrics and KPIs', description: 'Establish how success will be measured.' },
          { content: 'Prepare executive presentation', description: 'Build a presentation for executive approval.' },
        ],
      },
      {
        name: 'Implementation Support',
        tasks: [
          { content: 'Support initial implementation steps', description: 'Guide the team through the first phase of implementation.' },
          { content: 'Monitor early results', description: 'Track results in the first weeks and compare to projections.' },
          { content: 'Adjust approach based on results', description: 'Make course corrections based on actual results.' },
          { content: 'Final review and transition', description: 'Conduct final review and transition ongoing work to internal team.' },
        ],
      },
    ],
  },

  diagnostic_assessment: {
    name: 'Diagnostic Assessment',
    phases: [
      {
        name: 'Audit',
        tasks: [
          { content: 'Conduct stakeholder interviews', description: 'Interview key stakeholders to understand processes, pain points, and goals.' },
          { content: 'Review existing systems and configurations', description: 'Audit current tool configurations, data quality, and workflows.' },
          { content: 'Document current-state processes', description: 'Map out existing processes and identify all handoffs.' },
          { content: 'Collect and analyze performance data', description: 'Gather metrics on current performance across all process areas.' },
        ],
      },
      {
        name: 'Grading',
        tasks: [
          { content: 'Score each process area', description: 'Rate each process on the diagnostic rubric (Healthy, Careful, Warning, Unable).' },
          { content: 'Identify critical findings', description: 'Flag the most impactful issues that need immediate attention.' },
          { content: 'Prioritize improvement areas', description: 'Rank issues by business impact and effort to resolve.' },
        ],
      },
      {
        name: 'Recommendations',
        tasks: [
          { content: 'Develop improvement recommendations', description: 'Create specific, actionable recommendations for each finding.' },
          { content: 'Build prioritized roadmap', description: 'Organize recommendations into a phased implementation plan.' },
          { content: 'Present findings and recommendations', description: 'Deliver the diagnostic results and roadmap to stakeholders.' },
          { content: 'Define next steps and SOW', description: 'Work with the customer to select which recommendations to pursue.' },
        ],
      },
    ],
  },
};

/**
 * Map SOW type to template key
 */
export const sowTypeToTemplate = {
  clay: 'tool_implementation',
  q2c: 'lifecycle_implementation',
  embedded: 'strategic_initiative',
  custom: 'diagnostic_assessment',
};

/**
 * Get template tasks for a SOW type.
 * Returns the phases array from the matching template.
 */
export function getTemplateForSowType(sowType) {
  const templateKey = sowTypeToTemplate[sowType] || 'diagnostic_assessment';
  return templates[templateKey] || templates.diagnostic_assessment;
}

/**
 * Build a preview of what will be created in Teamwork.
 * Returns a structured object for the TeamworkPreview component.
 */
export function buildTeamworkPreview({
  customerName,
  sow,
  sections,
}) {
  const template = getTemplateForSowType(sow.sow_type);

  return {
    company: customerName,
    project: {
      name: sow.title,
      template: template.name,
    },
    milestones: sections.map((section) => {
      // Get template phases for this section
      const templatePhases = template.phases || [];

      return {
        sectionId: section.id,
        name: section.title,
        deadline: section.end_date || null,
        taskLists: [
          // Deliverables task list (from section)
          ...(section.deliverables && section.deliverables.length > 0
            ? [{
                name: `${section.title} — Deliverables`,
                source: 'sow',
                tasks: section.deliverables.map((d) => ({ content: d })),
              }]
            : []),
          // Template task lists (from template phases)
          ...templatePhases.map((phase) => ({
            name: `${section.title} — ${phase.name}`,
            source: 'template',
            tasks: phase.tasks.map((t) => ({ content: t.content })),
          })),
        ],
      };
    }),
  };
}
