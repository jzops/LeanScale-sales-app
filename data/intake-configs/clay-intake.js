/**
 * Clay Intake Form Configuration
 *
 * Defines the structure for the Clay project intake form.
 * Each project maps to one or more follow-up sections
 * that collect relevant details.
 */

const clayIntakeConfig = {
  id: 'clay-intake',
  title: 'Clay Project Intake',
  description: 'Tell us about your Clay needs so we can scope your project.',
  projectSelection: {
    type: 'multi-select',
    label: 'Which Clay projects are you interested in?',
    options: [
      { id: 'market-map', name: 'Market Map', price: 45000, followUpSections: ['crm', 'tam'] },
      { id: 'persona-mapping', name: 'Persona Mapping', price: 4500, followUpSections: ['crm', 'contacts'] },
      { id: 'automated-inbound', name: 'Automated Inbound Enrichment', price: 6000, followUpSections: ['crm', 'inbound'] },
      { id: 'automated-outbound', name: 'Automated Outbound', price: 7000, followUpSections: ['crm', 'outbound'] },
      { id: 'lead-scoring', name: 'Lead Scoring', price: 4000, followUpSections: ['crm', 'scoring'] },
      { id: 'abm-enrichment', name: 'ABM Target Account Enrichment', price: 6500, followUpSections: ['crm', 'abm'] },
      { id: 'crm-cleanup', name: 'CRM Data Cleanup', price: 3500, followUpSections: ['crm'] },
      { id: 'customer-segmentation', name: 'Customer Segmentation', price: 5000, followUpSections: ['crm', 'cs'] },
      { id: 'event-enrichment', name: 'Event Lead Enrichment', price: 3000, followUpSections: ['crm', 'events'] },
      { id: 'signal-prospecting', name: 'Signal-Based Prospecting', price: 7500, followUpSections: ['crm', 'signals'] },
    ],
  },
  sections: {
    crm: {
      label: 'CRM & Data',
      questions: [
        { id: 'crm_type', type: 'select', label: 'What CRM do you use?', options: ['Salesforce', 'HubSpot', 'Other'], required: true },
        { id: 'record_count', type: 'select', label: 'Approximate records in CRM?', options: ['<5k', '5k-25k', '25k-100k', '100k+'] },
        { id: 'enrichment_tools', type: 'multi-select', label: 'Current enrichment tools?', options: ['ZoomInfo', 'Apollo', 'Clearbit', 'Lusha', '6sense', 'None'] },
        { id: 'data_quality', type: 'select', label: 'How would you rate your CRM data quality?', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
      ],
    },
    tam: {
      label: 'Target Market',
      questions: [
        { id: 'icp_defined', type: 'boolean', label: 'Do you have a documented ICP?' },
        { id: 'tam_size', type: 'text', label: 'Estimated TAM size (number of accounts)?' },
        { id: 'verticals', type: 'text', label: 'Target verticals or industries?' },
      ],
    },
    contacts: {
      label: 'Contact Data',
      questions: [
        { id: 'persona_count', type: 'select', label: 'How many buyer personas do you target?', options: ['1-2', '3-5', '6+'] },
        { id: 'contact_sources', type: 'multi-select', label: 'Where do contacts come from?', options: ['Inbound', 'Outbound', 'Events', 'Partners', 'Product signups'] },
      ],
    },
    inbound: {
      label: 'Inbound Pipeline',
      questions: [
        { id: 'monthly_inbound', type: 'select', label: 'Monthly inbound lead volume?', options: ['<50', '50-200', '200-1000', '1000+'] },
        { id: 'inbound_sources', type: 'multi-select', label: 'Inbound channels?', options: ['Website forms', 'Chat', 'Demo requests', 'Trial signups', 'Content downloads'] },
        { id: 'current_routing', type: 'text', label: 'How are inbound leads currently routed?' },
      ],
    },
    outbound: {
      label: 'Outbound Process',
      questions: [
        { id: 'outbound_tools', type: 'multi-select', label: 'Outbound tools?', options: ['Outreach', 'Salesloft', 'Apollo', 'Instantly', 'Other'] },
        { id: 'monthly_outbound', type: 'select', label: 'Monthly outbound volume (contacts)?', options: ['<500', '500-2000', '2000-10000', '10000+'] },
        { id: 'outbound_approach', type: 'textarea', label: 'Describe your current outbound approach' },
      ],
    },
    scoring: {
      label: 'Lead Scoring',
      questions: [
        { id: 'has_scoring', type: 'boolean', label: 'Do you have a lead scoring model today?' },
        { id: 'scoring_tool', type: 'text', label: 'If yes, what tool or method?' },
      ],
    },
    abm: {
      label: 'ABM Program',
      questions: [
        { id: 'named_accounts', type: 'select', label: 'Number of named target accounts?', options: ['<50', '50-200', '200-500', '500+'] },
        { id: 'abm_tools', type: 'multi-select', label: 'ABM tools in use?', options: ['6sense', 'Demandbase', 'Terminus', 'RollWorks', 'None'] },
      ],
    },
    cs: {
      label: 'Customer Data',
      questions: [
        { id: 'customer_count', type: 'select', label: 'Number of active customers?', options: ['<100', '100-500', '500-2000', '2000+'] },
        { id: 'cs_platform', type: 'text', label: 'Customer success platform (if any)?' },
      ],
    },
    events: {
      label: 'Events',
      questions: [
        { id: 'event_frequency', type: 'select', label: 'How often do you attend/host events?', options: ['Monthly', 'Quarterly', 'A few per year', 'Rarely'] },
        { id: 'leads_per_event', type: 'select', label: 'Typical leads per event?', options: ['<100', '100-500', '500-2000', '2000+'] },
      ],
    },
    signals: {
      label: 'Intent Signals',
      questions: [
        { id: 'intent_tools', type: 'multi-select', label: 'Intent data sources?', options: ['Bombora', '6sense', 'G2', 'TrustRadius', 'None'] },
        { id: 'signals_used', type: 'multi-select', label: 'Signals you track?', options: ['Job changes', 'Funding rounds', 'Hiring patterns', 'Tech installs', 'News events', 'None'] },
      ],
    },
  },
};

module.exports = { clayIntakeConfig };
