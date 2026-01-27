const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = 'jzops/LeanScale-sales-app';
const BASE_PATH = 'Playbooks-Site/docs/projects';

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching project folders...');
  const folders = await fetchJSON(`https://api.github.com/repos/${REPO}/contents/${BASE_PATH}?per_page=100`);
  
  const playbooks = {};
  
  for (const folder of folders) {
    if (folder.type !== 'dir' || folder.name.startsWith('_')) continue;
    
    console.log(`Processing ${folder.name}...`);
    
    try {
      const files = await fetchJSON(folder.url);
      const playbookFile = files.find(f => f.name.startsWith('playbook_') && f.name.endsWith('.md'));
      const categoryFile = files.find(f => f.name === '_category_.json');
      
      if (playbookFile) {
        const content = await fetchRaw(playbookFile.download_url);
        let category = null;
        
        if (categoryFile) {
          try {
            const catData = await fetchRaw(categoryFile.download_url);
            category = JSON.parse(catData);
          } catch (e) {}
        }
        
        const id = folder.name.replace(/^\d+-/, '');
        playbooks[id] = {
          folder: folder.name,
          label: category?.label || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          rawContent: content,
          parsed: parsePlaybook(content)
        };
      }
    } catch (e) {
      console.error(`Error processing ${folder.name}:`, e.message);
    }
  }
  
  fs.writeFileSync('data/all-playbooks.json', JSON.stringify(playbooks, null, 2));
  console.log(`\nSaved ${Object.keys(playbooks).length} playbooks to data/all-playbooks.json`);
}

function parsePlaybook(content) {
  const sections = {};
  
  const definitionMatch = content.match(/## 1\. Definition\s*([\s\S]*?)(?=## 2\.|$)/);
  if (definitionMatch) {
    const defContent = definitionMatch[1].trim();
    const whatItIs = defContent.match(/\*\*What it is:\*\*\s*([\s\S]*?)(?=\*\*What it is NOT:|$)/i);
    const whatItIsNot = defContent.match(/\*\*What it is NOT:\*\*\s*([\s\S]*?)(?=## |$)/i);
    sections.definition = {
      whatItIs: whatItIs ? whatItIs[1].trim() : '',
      whatItIsNot: whatItIsNot ? whatItIsNot[1].trim() : ''
    };
  }
  
  const icpMatch = content.match(/## 2\. ICP Value Proposition\s*([\s\S]*?)(?=## 3\.|$)/);
  if (icpMatch) {
    const icpContent = icpMatch[1].trim();
    const painSolves = icpContent.match(/\*\*Pain it solves:\*\*\s*([\s\S]*?)(?=\*\*Outcome delivered:|$)/i);
    const outcome = icpContent.match(/\*\*Outcome delivered:\*\*\s*([\s\S]*?)(?=\*\*Who owns it:|$)/i);
    const whoOwns = icpContent.match(/\*\*Who owns it:\*\*\s*([\s\S]*?)(?=## |$)/i);
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

main().catch(console.error);
