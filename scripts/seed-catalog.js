#!/usr/bin/env node

/**
 * Seed script for the Service Catalog
 *
 * Parses 6 markdown files from LeanScale-Context/catalog-context/ and converts
 * them into service objects for bulk insert via the /api/service-catalog/seed endpoint.
 *
 * Usage:
 *   node scripts/seed-catalog.js                    # Print JSON to stdout
 *   node scripts/seed-catalog.js --post             # POST to local API (http://localhost:3000)
 *   node scripts/seed-catalog.js --post --clear     # Clear existing + POST
 *   node scripts/seed-catalog.js --dry-run          # Parse and show count
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Configuration
// ============================================

const CATALOG_DIR = path.join(__dirname, '../../LeanScale-Context/catalog-context');

const FILES = [
  { file: 'power10-gtm-metrics.md', category: 'Power10' },
  { file: 'strategic-projects.md', category: 'Strategic' },
  { file: 'managed-services.md', category: 'Managed Services' },
  { file: 'custom-diagnostic-projects.md', category: 'Custom Diagnostic' },
  { file: 'tool-category-diagnostic.md', category: 'Tool Diagnostic' },
  { file: 'tool-category-projects.md', category: 'Tool Project' },
];

// ============================================
// Markdown Parser
// ============================================

function parseMarkdownFile(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries = [];

  // Split by ### headings (each entry starts with ### )
  const sections = content.split(/^### /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const name = lines[0].trim();

    // Skip file-level headings (lines that look like # Title or ## Title)
    if (name.startsWith('#')) continue;

    const entry = {
      name,
      category,
      active: true,
    };

    const body = lines.slice(1).join('\n');

    // Parse key-value fields
    entry.status = extractField(body, 'Status');
    entry.delivery_model = extractDeliveryModel(body);
    entry.project_type = extractField(body, 'Type');
    entry.owner = extractField(body, 'Owner');
    entry.primary_function = normalizePrimaryFunction(extractField(body, 'Function'));
    entry.functions = parseCommaSeparated(extractField(body, 'Functions'));
    entry.primary_gtm_outcome = extractField(body, 'GTM Outcome');
    entry.gtm_outcomes = parseCommaSeparated(extractField(body, 'GTM Outcomes'));
    entry.power10_metric = extractField(body, 'Power10');
    entry.team_members = parseCommaSeparated(extractField(body, 'Team'));
    entry.tools = parseToolsList(extractField(body, 'Tools'));
    entry.notes = extractField(body, 'Notes');

    // Parse hours
    const hoursRaw = extractField(body, 'Estimated Hours');
    if (hoursRaw) {
      const parsed = parseHours(hoursRaw);
      entry.hours_low = parsed.low;
      entry.hours_high = parsed.high;
    }

    // Parse description
    entry.description = extractMultilineSection(body, 'Description');

    // Parse key steps
    const keyStepsRaw = extractMultilineSection(body, 'Key Steps');
    if (keyStepsRaw) {
      entry.key_steps = parseKeySteps(keyStepsRaw);
    }

    // Parse diagnostic rubric
    const rubricRaw = extractMultilineSection(body, 'Diagnostic Grading Rubric');
    if (rubricRaw) {
      entry.diagnostic_rubric = parseRubric(rubricRaw);
    }

    // Parse GTM metrics
    const gtmMetrics = extractField(body, 'GTM Metrics');
    if (gtmMetrics) {
      entry.gtm_metrics = parseCommaSeparated(gtmMetrics.replace(/#r\d+$/, ''));
    }

    // Related milestones → related_services
    const related = extractField(body, 'Related Milestones');
    if (related) {
      entry.related_services = parseCommaSeparated(related);
    }

    entries.push(cleanEntry(entry));
  }

  return entries;
}

// ============================================
// Field Extractors
// ============================================

function extractField(body, fieldName) {
  // Match **Field Name**: value (single line)
  const regex = new RegExp(`\\*\\*${escapeRegex(fieldName)}\\*\\*:\\s*(.+?)\\s*$`, 'mi');
  const match = body.match(regex);
  if (!match) return null;
  const val = match[1].trim();
  return val || null;
}

function extractMultilineSection(body, sectionName) {
  // Match **Section Name**: followed by content until next ** heading or end
  const regex = new RegExp(
    `\\*\\*${escapeRegex(sectionName)}\\*\\*:\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*[A-Z]|$)`,
    'i'
  );
  const match = body.match(regex);
  if (!match) return null;
  const val = match[1].trim();
  return val || null;
}

function extractDeliveryModel(body) {
  const val = extractField(body, 'Custom or Menu');
  if (!val) return null;
  if (val.toLowerCase() === 'menu') return 'Menu';
  if (val.toLowerCase() === 'custom') return 'Custom';
  return val;
}

// ============================================
// Parsers
// ============================================

function parseHours(raw) {
  if (!raw) return { low: null, high: null };

  // Handle "Custom - Custom hours"
  if (raw.toLowerCase().includes('custom')) return { low: null, high: null };

  // Handle "40 - 80 hours" or "40-80" or "40 - 80"
  const match = raw.match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (match) {
    const low = parseInt(match[1]);
    const high = parseInt(match[2]);
    // Skip 0-0
    if (low === 0 && high === 0) return { low: null, high: null };
    return { low, high };
  }

  // Single number
  const single = raw.match(/(\d+)/);
  if (single) return { low: parseInt(single[1]), high: parseInt(single[1]) };

  return { low: null, high: null };
}

function parseCommaSeparated(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function parseToolsList(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    // Remove emoji prefixes
    .map(s => s.replace(/^[^\w\s]*\s*/, '').trim())
    .filter(Boolean);
}

function normalizePrimaryFunction(raw) {
  if (!raw) return null;
  // Remove number prefixes like "1. Cross Functional" → "Cross Functional"
  return raw.replace(/^\d+\.\s*/, '').trim() || null;
}

function parseKeySteps(raw) {
  if (!raw) return [];

  // Try bullet list first (lines starting with * or -)
  const bullets = raw.match(/^[*\-]\s+.+$/gm);
  if (bullets && bullets.length > 0) {
    return bullets.map(b => b.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
  }

  // Try paragraph-style (bold headers or sentence-style entries)
  const paragraphs = raw.split('\n\n').map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 0) {
    return paragraphs.map(p => {
      // Take first line or first sentence
      const firstLine = p.split('\n')[0].trim();
      // Remove bold markers
      return firstLine.replace(/\*\*/g, '').trim();
    }).filter(Boolean);
  }

  return [];
}

function parseRubric(raw) {
  if (!raw) return null;

  const rubric = {};
  const lines = raw.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('*')) continue;

    // Remove leading *
    const content = trimmed.replace(/^\*\s*/, '');

    // Match various formats:
    // "Green – Description" or "Green = Description" or "🟢: Description"
    let color = null;
    let description = '';

    // Try emoji format
    const emojiMatch = content.match(/^(🟢|🟡|🔴|⚫)[:\s–—=]+\s*(.*)/);
    if (emojiMatch) {
      const emojiMap = { '🟢': 'green', '🟡': 'yellow', '🔴': 'red', '⚫': 'black' };
      color = emojiMap[emojiMatch[1]] || null;
      description = emojiMatch[2].trim();
    }

    // Try text format
    if (!color) {
      const textMatch = content.match(/^(Green|Yellow|Red|Black)\s*[–—=:]+\s*(.*)/i);
      if (textMatch) {
        color = textMatch[1].toLowerCase();
        description = textMatch[2].trim();
      }
    }

    if (color) {
      rubric[color] = description || null;
    }
  }

  return Object.keys(rubric).length > 0 ? rubric : null;
}

// ============================================
// Utilities
// ============================================

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanEntry(entry) {
  // Remove null/empty fields
  const cleaned = {};
  for (const [key, value] of Object.entries(entry)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  // Ensure required fields
  cleaned.name = cleaned.name || 'Unnamed Service';
  cleaned.category = cleaned.category || 'Strategic';
  cleaned.active = cleaned.active !== false;
  return cleaned;
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const doPost = args.includes('--post');
  const doClear = args.includes('--clear');
  const dryRun = args.includes('--dry-run');

  console.error(`Parsing catalog files from: ${CATALOG_DIR}`);

  let allServices = [];

  for (const { file, category } of FILES) {
    const filePath = path.join(CATALOG_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP: ${file} (not found)`);
      continue;
    }

    const services = parseMarkdownFile(filePath, category);
    console.error(`  ${file}: ${services.length} services (${category})`);
    allServices = allServices.concat(services);
  }

  console.error(`\nTotal: ${allServices.length} services`);

  // Category breakdown
  const byCat = {};
  allServices.forEach(s => {
    byCat[s.category] = (byCat[s.category] || 0) + 1;
  });
  console.error('\nBy category:');
  for (const [cat, count] of Object.entries(byCat)) {
    console.error(`  ${cat}: ${count}`);
  }

  if (dryRun) {
    console.error('\nDry run complete.');
    return;
  }

  if (doPost) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/service-catalog/seed`;

    console.error(`\nPOSTing to ${url}...`);

    const body = JSON.stringify({
      services: allServices,
      clear: doClear,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const json = await res.json();
    console.error(`Response: ${res.status}`);
    console.error(JSON.stringify(json, null, 2));
  } else {
    // Output JSON to stdout
    console.log(JSON.stringify(allServices, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
