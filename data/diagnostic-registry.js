// Diagnostic Registry
// Maps diagnostic types to their configurations for dynamic rendering

import { processes as gtmProcesses, tools, gtmFunctions, gtmOutcomes, countStatuses, groupBy } from './diagnostic-data';
import { clayProcesses, clayCategories, clayOutcomes } from './clay-diagnostic-data';
import { cpqProcesses, cpqCategories, cpqOutcomes } from './cpq-diagnostic-data';

export const diagnosticRegistry = {
  gtm: {
    id: 'gtm',
    title: 'GTM Diagnostic Results',
    subtitle: 'Comprehensive health assessment of your GTM operations',
    icon: '\uD83D\uDCCA',
    processes: gtmProcesses,
    tools: tools,
    categories: gtmFunctions,
    outcomes: gtmOutcomes,
  },
  clay: {
    id: 'clay',
    title: 'Clay Diagnostic Results',
    subtitle: 'Clay enrichment and automation maturity assessment',
    icon: '\uD83E\uDDF1',
    processes: clayProcesses,
    categories: clayCategories,
    outcomes: clayOutcomes,
  },
  cpq: {
    id: 'cpq',
    title: 'Quote-to-Cash Diagnostic Results',
    subtitle: 'CPQ and revenue lifecycle maturity assessment',
    icon: '\uD83D\uDD04',
    processes: cpqProcesses,
    categories: cpqCategories,
    outcomes: cpqOutcomes,
  },
};

export { countStatuses, groupBy };
