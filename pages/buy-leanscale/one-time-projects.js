import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { playbookContent } from '../../data/playbook-content';
import { useCustomer } from '../../context/CustomerContext';

const projects = [
  { 
    id: 'market-map', 
    name: 'Market Map', 
    status: 'Available', 
    icon: '🗺️',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'market-map',
  },
  { 
    id: 'automated-inbound-data-enrichment', 
    name: 'Automated Inbound Enrichment', 
    status: 'Available', 
    icon: '🚀',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'automated-inbound-data-enrichment',
  },
  { 
    id: 'automated-outbound-process', 
    name: 'Automated Outbound Outreach', 
    status: 'Available', 
    icon: '📤',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'automated-outbound-process',
  },
  { 
    id: 'clay-custom-enrichment', 
    name: 'Custom Enrichment Signals', 
    status: 'Available', 
    icon: '🧩', 
    badge: 'Clay',
    price: '$45,000',
    duration: '3 months',
    playbookId: null,
    customContent: {
      definition: {
        whatItIs: 'A specialized Clay implementation project that builds custom enrichment signals and data workflows tailored to your unique ICP criteria, leveraging Clay\'s waterfall enrichment, AI capabilities, and integrations to create proprietary data assets.',
        whatItIsNot: 'Not a generic Clay setup (that\'s standard enrichment). Not a CRM implementation. Not a data vendor selection project. Not a marketing automation platform implementation.',
      },
      icpValueProp: {
        painSolves: 'Your team lacks the unique data signals needed to identify and prioritize ideal prospects. Generic firmographic data doesn\'t capture what makes accounts right for your product.',
        outcome: 'Custom enrichment workflows that generate proprietary signals (tech stack, hiring patterns, funding events, intent signals) integrated into your GTM systems.',
        whoOwns: 'RevOps or GTM Ops team, often in collaboration with Sales and Marketing leadership.',
      },
      implementation: `### Phase 1: Signal Discovery & Design
- Workshop to identify unique ICP indicators and data needs
- Map existing data sources and gaps
- Design custom enrichment waterfall logic

### Phase 2: Clay Workflow Build
- Build Clay tables with custom enrichment sequences
- Configure AI-powered data extraction and classification
- Set up webhook integrations with CRM

### Phase 3: Testing & Deployment
- Test enrichment accuracy and coverage
- Deploy to production
- Train team on workflow management`,
      dependencies: `- Active Clay account with appropriate tier
- CRM access (Salesforce or HubSpot)
- Clear ICP definition`,
      pitfalls: `- Building too many signals at once (start with 3-5 high-impact signals)
- Not validating enrichment accuracy before scaling
- Overcomplicating waterfall logic`,
    },
  },
  { 
    id: 'crm-migration', 
    name: 'CRM Migration', 
    status: 'Available', 
    icon: '🏠',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'hubspot-to-salesforce-crm-migration',
  },
  { 
    id: 'quote-to-cash', 
    name: 'Quote-to-Cash', 
    status: 'Available', 
    icon: '💰',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'quote-to-cash',
  },
  {
    id: 'lead-attribution-rebuild',
    name: 'Lead Attribution Rebuild',
    status: 'Available',
    icon: '🔍',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'lead-and-opportunity-attribution',
  },
  {
    id: 'lead-routing-rebuild',
    name: 'Lead Routing Rebuild',
    status: 'Available',
    icon: '🛤️',
    price: '$45,000',
    duration: '3 months',
    playbookId: 'lead-routing',
  },
];

function formatInlineText(text) {
  if (!text) return text;
  const parts = [];
  let remaining = text;
  let keyIdx = 0;
  
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      const beforeBold = remaining.slice(0, boldMatch.index);
      if (beforeBold) parts.push(beforeBold);
      parts.push(<strong key={keyIdx++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }
  return parts.length === 1 ? parts[0] : parts;
}

function renderMarkdownContent(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null;
  
  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={elements.length} style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
            {currentList.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.6 }}>{formatInlineText(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={elements.length} style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
            {currentList.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.6 }}>{formatInlineText(item)}</li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^---+$/)) {
      flushList();
      elements.push(<hr key={elements.length} style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={elements.length} style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>
          {line.replace(/^##\s*/, '')}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={elements.length} style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#7c3aed' }}>
          {line.replace(/^###\s*/, '')}
        </h4>
      );
    } else if (line.startsWith('#### ')) {
      flushList();
      elements.push(
        <h5 key={elements.length} style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.25rem', color: '#374151' }}>
          {line.replace(/^####\s*/, '')}
        </h5>
      );
    } else if (line.startsWith('##### ')) {
      flushList();
      elements.push(
        <h6 key={elements.length} style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem', marginBottom: '0.25rem', color: '#4b5563' }}>
          {line.replace(/^#####\s*/, '')}
        </h6>
      );
    } else if (line.match(/^\*\*[^*]+:\*\*/) || line.startsWith('**Step Overview:**') || line.startsWith('**End State:**')) {
      flushList();
      elements.push(
        <p key={elements.length} style={{ margin: '0.5rem 0', lineHeight: 1.6, fontStyle: 'italic', color: '#4b5563' }}>
          {formatInlineText(line)}
        </p>
      );
    } else if (line.match(/^[-*]\s/)) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      currentList.push(line.replace(/^[-*]\s/, ''));
    } else if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      currentList.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.trim()) {
      flushList();
      elements.push(<p key={elements.length} style={{ margin: '0.5rem 0', lineHeight: 1.6 }}>{formatInlineText(line)}</p>);
    }
  }
  flushList();
  return elements;
}

export default function OneTimeProjects() {
  const { customerPath } = useCustomer();
  const [selectedProject, setSelectedProject] = useState(null);

  const getProjectContent = (project) => {
    if (project.customContent) return project.customContent;
    if (project.playbookId) return playbookContent[project.playbookId] || null;
    return null;
  };

  const content = selectedProject ? getProjectContent(selectedProject) : null;

  return (
    <Layout title="One-Time Projects">
      <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>📋</span> One-Time Projects
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Fixed-scope GTM operations projects delivered in 3 months. Each project includes discovery, 
            implementation, training, and 30-day post-launch support.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
              className="card"
              style={{ 
                cursor: 'pointer',
                padding: '1.25rem',
                border: selectedProject?.id === project.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                background: selectedProject?.id === project.id ? '#f5f3ff' : 'white',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{project.icon}</div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {project.name}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  background: project.status === 'Available' ? '#d1fae5' : '#fef3c7',
                  color: project.status === 'Available' ? '#065f46' : '#92400e',
                }}>
                  {project.status}
                </span>
                {project.badge && (
                  <span style={{
                    background: '#7c3aed',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                    {project.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {project.price} · {project.duration}
              </div>
            </div>
          ))}
        </div>

        {selectedProject && content && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedProject.icon}</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedProject.name}</h2>
                <div style={{ color: '#7c3aed', fontWeight: 600 }}>
                  {selectedProject.price} · {selectedProject.duration}
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}
              >
                ×
              </button>
            </div>

            {content.definition && (content.definition.whatItIs || content.definition.whatItIsNot) && (
              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f9fafb', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span> Definition
                </h3>
                {content.definition.whatItIs && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>What it is:</div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content.definition.whatItIs}</p>
                  </div>
                )}
                {content.definition.whatItIsNot && (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>What it is NOT:</div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content.definition.whatItIsNot}</p>
                  </div>
                )}
              </div>
            )}

            {content.icpValueProp && (content.icpValueProp.painSolves || content.icpValueProp.outcome) && (
              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f9fafb', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💎</span> Value Proposition
                </h3>
                {content.icpValueProp.painSolves && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Pain it solves:</div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content.icpValueProp.painSolves}</p>
                  </div>
                )}
                {content.icpValueProp.outcome && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Outcome delivered:</div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content.icpValueProp.outcome}</p>
                  </div>
                )}
                {content.icpValueProp.whoOwns && (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1', marginBottom: '0.25rem' }}>Who owns it:</div>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content.icpValueProp.whoOwns}</p>
                  </div>
                )}
              </div>
            )}

            {content.implementation && (
              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f9fafb', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚙️</span> Implementation Overview
                </h3>
                <div style={{ color: '#374151' }}>
                  {renderMarkdownContent(content.implementation)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {content.dependencies && (
                <div style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔗</span> Dependencies
                  </h3>
                  <div style={{ color: '#374151', fontSize: '0.9rem' }}>
                    {renderMarkdownContent(content.dependencies)}
                  </div>
                </div>
              )}
              {content.pitfalls && (
                <div style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚠️</span> Common Pitfalls
                  </h3>
                  <div style={{ color: '#374151', fontSize: '0.9rem' }}>
                    {renderMarkdownContent(content.pitfalls)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {selectedProject.playbookId && (
                <Link href={customerPath(`/playbooks/${selectedProject.playbookId}`)} style={{ textDecoration: 'none' }}>
                  <button className="btn" style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151' }}>
                    View Full Playbook
                  </button>
                </Link>
              )}
              <Link href={customerPath('/buy-leanscale')} style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary">
                  Start Engagement →
                </button>
              </Link>
            </div>
          </div>
        )}

        {!selectedProject && (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '12px' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Click on any project above to see full details, or start your engagement now.
            </p>
            <Link href={customerPath('/buy-leanscale')}>
              <button className="btn btn-primary">
                Start Engagement →
              </button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
