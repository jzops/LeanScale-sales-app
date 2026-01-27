const fs = require('fs');
const path = require('path');

const allPlaybooks = require('../data/all-playbooks.json');

const additionalFiles = [
  { folder: '58-event-operations-lead-list-intake-process', id: 'event-operations-lead-list-intake-process' },
  { folder: '59-commission-plan-design-and-implementation', id: 'commission-plan-design-and-implementation' },
  { folder: '60-commission-tool-implementation', id: 'commission-tool-implementation' },
  { folder: '61-quote-to-cash', id: 'quote-to-cash' },
  { folder: '62-marketing-to-sales-handoff-and-sla-tracking', id: 'marketing-to-sales-handoff-and-sla-tracking' },
  { folder: '63-ai-automated-inbound', id: 'ai-automated-inbound' },
  { folder: '64-speed-to-lead', id: 'speed-to-lead' },
  { folder: '65-crm-erp-integration', id: 'crm-erp-integration' },
  { folder: '66-gtm-diagnostic', id: 'gtm-diagnostic' },
  { folder: '67-revenue-intelligence-process', id: 'revenue-intelligence-process' },
  { folder: '68-opportunity-management-ux-improvements', id: 'opportunity-management-ux-improvements' },
];

function parsePlaybook(content) {
  const sections = {};
  
  const definitionMatch = content.match(/## 1\. Definition\s*([\s\S]*?)(?=## 2\.|$)/);
  if (definitionMatch) {
    const defContent = definitionMatch[1].trim();
    const whatItIs = defContent.match(/\*\*What it is\*\*:\s*([\s\S]*?)(?=\*\*What it is NOT\*\*:|$)/i);
    const whatItIsNot = defContent.match(/\*\*What it is NOT\*\*:\s*([\s\S]*?)$/i);
    sections.definition = {
      whatItIs: whatItIs ? whatItIs[1].trim() : '',
      whatItIsNot: whatItIsNot ? whatItIsNot[1].trim() : ''
    };
  }
  
  const icpMatch = content.match(/## 2\. ICP Value Proposition\s*([\s\S]*?)(?=## 3\.|$)/);
  if (icpMatch) {
    const icpContent = icpMatch[1].trim();
    const painSolves = icpContent.match(/\*\*Pain it solves\*\*:\s*([\s\S]*?)(?=\*\*Outcome delivered\*\*:|$)/i);
    const outcome = icpContent.match(/\*\*Outcome delivered\*\*:\s*([\s\S]*?)(?=\*\*Who owns it\*\*:|$)/i);
    const whoOwns = icpContent.match(/\*\*Who owns it\*\*:\s*([\s\S]*?)$/i);
    sections.icpValueProp = {
      painSolves: painSolves ? painSolves[1].trim() : '',
      outcome: outcome ? outcome[1].trim() : '',
      whoOwns: whoOwns ? whoOwns[1].trim() : ''
    };
  }
  
  const implMatch = content.match(/## 3\. Implementation Procedure\s*([\s\S]*?)(?=## 4\.|$)/);
  if (implMatch) {
    sections.implementation = implMatch[1].trim();
  }
  
  const depsMatch = content.match(/## 4\. Dependencies\s*([\s\S]*?)(?=## 5\.|$)/);
  if (depsMatch) {
    sections.dependencies = depsMatch[1].trim();
  }
  
  const pitfallsMatch = content.match(/## 5\. Common Pitfalls\s*([\s\S]*?)$/);
  if (pitfallsMatch) {
    sections.pitfalls = pitfallsMatch[1].trim();
  }
  
  return sections;
}

for (const file of additionalFiles) {
  const filePath = `/tmp/${file.folder}.md`;
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const label = file.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    allPlaybooks[file.id] = {
      folder: file.folder,
      label: label,
      rawContent: content,
      parsed: parsePlaybook(content)
    };
    console.log(`Added: ${file.id}`);
  }
}

for (const [id, playbook] of Object.entries(allPlaybooks)) {
  playbook.parsed = parsePlaybook(playbook.rawContent);
}

let output = `export const playbookContent = {\n`;

for (const [id, playbook] of Object.entries(allPlaybooks)) {
  const p = playbook.parsed;
  
  output += `  '${id}': {\n`;
  output += `    definition: {\n`;
  output += `      whatItIs: ${JSON.stringify(p.definition?.whatItIs || '')},\n`;
  output += `      whatItIsNot: ${JSON.stringify(p.definition?.whatItIsNot || '')},\n`;
  output += `    },\n`;
  output += `    icpValueProp: {\n`;
  output += `      painSolves: ${JSON.stringify(p.icpValueProp?.painSolves || '')},\n`;
  output += `      outcome: ${JSON.stringify(p.icpValueProp?.outcome || '')},\n`;
  output += `      whoOwns: ${JSON.stringify(p.icpValueProp?.whoOwns || '')},\n`;
  output += `    },\n`;
  output += `    implementation: ${JSON.stringify(p.implementation || '')},\n`;
  output += `    dependencies: ${JSON.stringify(p.dependencies || '')},\n`;
  output += `    pitfalls: ${JSON.stringify(p.pitfalls || '')},\n`;
  output += `  },\n`;
}

output += `};\n`;

fs.writeFileSync('data/playbook-content.js', output);
console.log(`\nGenerated playbook-content.js with ${Object.keys(allPlaybooks).length} playbooks`);

const nonEmpty = Object.entries(allPlaybooks).filter(([id, p]) => p.parsed.definition?.whatItIs?.length > 10);
console.log(`Playbooks with content: ${nonEmpty.length}`);
