/**
 * Browser-compatible markdown table parser for diagnostic data
 *
 * Parses markdown tables into the same data shape consumed by
 * DiagnosticResults and the diagnostic-data.js exports.
 *
 * Works client-side (no fs/path dependencies) — pure string parsing.
 */

const VALID_STATUSES = ['healthy', 'careful', 'warning', 'unable'];

/**
 * Column mappings per diagnostic type
 * Maps expected column headers (lowercased) to our internal field names
 */
const COLUMN_MAPS = {
  gtm: {
    process: 'name',
    name: 'name',
    status: 'status',
    include: 'addToEngagement',
    function: 'function',
    outcome: 'outcome',
    metric: 'metric',
    service_id: 'serviceId',
    service_type: 'serviceType',
    description: 'description',
  },
  clay: {
    process: 'name',
    name: 'name',
    status: 'status',
    include: 'addToEngagement',
    category: 'function', // mapped to 'function' field for groupBy compatibility
    function: 'function',
    outcome: 'outcome',
    metric: 'metric',
    description: 'description',
  },
  cpq: {
    process: 'name',
    name: 'name',
    status: 'status',
    include: 'addToEngagement',
    category: 'function',
    function: 'function',
    outcome: 'outcome',
    metric: 'metric',
    description: 'description',
  },
};

/**
 * Parse a markdown string containing diagnostic tables
 *
 * @param {string} markdown - The markdown content to parse
 * @param {string} diagnosticType - 'gtm' | 'clay' | 'cpq'
 * @returns {{ processes: Array, tools: Array, warnings: string[] }}
 */
export function parseDiagnosticMarkdown(markdown, diagnosticType = 'gtm') {
  const columnMap = COLUMN_MAPS[diagnosticType] || COLUMN_MAPS.gtm;
  const lines = markdown.split('\n');
  const warnings = [];

  let processes = [];
  let tools = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect section headers
    if (line.startsWith('## ')) {
      const heading = line.replace(/^##\s+/, '').toLowerCase();
      if (heading.includes('process')) {
        currentSection = 'processes';
      } else if (heading.includes('tool')) {
        currentSection = 'tools';
      } else if (heading.includes('status legend') || heading.includes('how to edit')) {
        currentSection = null;
      }
      continue;
    }

    // Parse table rows
    if (line.startsWith('|') && currentSection) {
      const { rows, endIndex, parseWarnings } = parseMarkdownTable(lines, i, columnMap);
      warnings.push(...parseWarnings);

      if (currentSection === 'processes') {
        processes = rows;
      } else if (currentSection === 'tools') {
        tools = rows;
      }

      i = endIndex - 1;
      currentSection = null;
    }
  }

  // If no section headers found, try parsing the whole thing as a single table
  if (processes.length === 0 && tools.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('|')) {
        const { rows, endIndex, parseWarnings } = parseMarkdownTable(lines, i, columnMap);
        warnings.push(...parseWarnings);
        processes = rows;
        break;
      }
    }
  }

  // Validate
  if (processes.length === 0) {
    warnings.push('No processes found in the markdown. Make sure the table has a header row.');
  }

  const emptyNames = processes.filter(p => !p.name);
  if (emptyNames.length > 0) {
    warnings.push(`${emptyNames.length} process(es) have empty names.`);
  }

  const invalidStatuses = processes.filter(p => p.status && !VALID_STATUSES.includes(p.status));
  if (invalidStatuses.length > 0) {
    warnings.push(
      `${invalidStatuses.length} process(es) have invalid statuses. Valid: ${VALID_STATUSES.join(', ')}. ` +
      `Invalid items: ${invalidStatuses.map(p => `"${p.name}" (${p.status})`).join(', ')}`
    );
    // Auto-fix invalid statuses to 'unable'
    invalidStatuses.forEach(p => { p.status = 'unable'; });
  }

  return { processes, tools, warnings };
}

/**
 * Parse a markdown table starting at the given line index
 */
function parseMarkdownTable(lines, startIndex, columnMap) {
  const rows = [];
  let headers = [];
  let i = startIndex;
  const parseWarnings = [];

  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const line = lines[i].trim();
    const cells = line.split('|').slice(1, -1).map(c => c.trim());

    if (headers.length === 0) {
      // First row = headers
      headers = cells.map(h =>
        h.toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
      );
      i++;
      // Skip separator row (|---|---|...)
      if (i < lines.length && lines[i].includes('---')) {
        i++;
      }
      continue;
    }

    // Data row
    const row = {};
    cells.forEach((cell, idx) => {
      const header = headers[idx];
      if (!header) return;

      const fieldName = columnMap[header];
      if (!fieldName) return;

      if (fieldName === 'addToEngagement') {
        row[fieldName] = cell === '✓' || cell === '✔' || cell === 'x' || cell === 'X' || cell === 'yes' || cell === 'true';
      } else if (fieldName === 'status') {
        row[fieldName] = cell.toLowerCase().trim();
      } else {
        row[fieldName] = cell;
      }
    });

    // Only add rows with at least a name
    if (row.name) {
      // Ensure required fields have defaults
      if (!row.status) row.status = 'unable';
      if (row.addToEngagement === undefined) row.addToEngagement = false;
      if (!row.function) row.function = '';
      if (!row.outcome) row.outcome = '';
      if (!row.metric) row.metric = '';
      rows.push(row);
    }

    i++;
  }

  return { rows, endIndex: i, parseWarnings };
}

/**
 * Generate a markdown template for a given diagnostic type
 * Useful for showing users the expected format
 */
export function generateMarkdownTemplate(diagnosticType = 'gtm') {
  if (diagnosticType === 'gtm') {
    return `## Processes

| Process | Status | Include | Function | Outcome | Metric | Service ID |
|---------|--------|---------|----------|---------|--------|------------|
| Example Process | healthy | ✓ | Marketing | Increase Pipeline | MQL production | example-process |

## Tools

| Tool | Status | Include | Category | Service ID |
|------|--------|---------|----------|------------|
| Example Tool | healthy | | CRM | example-tool |
`;
  }

  const label = diagnosticType === 'clay' ? 'Clay' : 'Q2C';
  return `## Processes

| Process | Status | Include | Category | Outcome | Metric |
|---------|--------|---------|----------|---------|--------|
| Example Process | healthy | ✓ | ${label} Category | Improve Efficiency | Key Metric |
`;
}
