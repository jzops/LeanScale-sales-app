import { useState, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { 
  strategicProjects, 
  managedServices, 
  toolImplementations, 
  playbooks,
  functionLabels,
  categoryLabels 
} from '../../data/services-catalog';

const strategicCount = Object.values(strategicProjects).flat().length;
const managedCount = managedServices.length;
const toolsCount = Object.values(toolImplementations).flat().length;
const allServicesCount = strategicCount + managedCount + toolsCount;

const tabs = [
  { id: 'strategic', label: 'One-Time Projects', count: strategicCount },
  { id: 'managed', label: 'Managed Services', count: managedCount },
  { id: 'tools', label: 'Tool Implementations', count: toolsCount },
];

const functionOptions = ['all', 'crossFunctional', 'marketing', 'sales', 'customerSuccess', 'partnerships'];

export default function ServicesCatalog() {
  const [activeTab, setActiveTab] = useState('strategic');
  const [functionFilter, setFunctionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getServicesForTab = (tab) => {
    switch (tab) {
      case 'strategic':
        return strategicProjects;
      case 'managed':
        return managedServices;
      case 'tools':
        return toolImplementations;
      default:
        return {};
    }
  };

  const filteredServices = useMemo(() => {
    const services = getServicesForTab(activeTab);
    
    if (activeTab === 'managed') {
      return services.filter(service => 
        searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let result = [];
    const functionsToShow = functionFilter === 'all' 
      ? Object.keys(services) 
      : [functionFilter];

    functionsToShow.forEach(fn => {
      if (services[fn]) {
        const filtered = services[fn].filter(service =>
          searchQuery === '' ||
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.vendor && service.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        if (filtered.length > 0) {
          result.push({ function: fn, services: filtered });
        }
      }
    });

    return result;
  }, [activeTab, functionFilter, searchQuery]);

  const totalCount = useMemo(() => {
    if (activeTab === 'managed') {
      return filteredServices.length;
    }
    return filteredServices.reduce((sum, group) => sum + group.services.length, 0);
  }, [filteredServices, activeTab]);

  const getPlaybookForService = (serviceId) => {
    return playbooks.find(p => p.id === serviceId);
  };

  return (
    <Layout title="Services Catalog">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span>🛠️</span> LeanScale Services Catalog
          </h1>
          <p style={{ color: '#666', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            {allServicesCount} services across Strategic Projects, Managed Services, and Tool Implementations. 
            Browse by category and function to find the right solution for your GTM operations.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFunctionFilter('all');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === tab.id ? '#7c3aed' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px',
                borderBottom: activeTab === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.15rem 0.5rem',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                borderRadius: '10px',
                fontSize: '0.75rem',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          
          {activeTab !== 'managed' && (
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Function
              </label>
              <select
                value={functionFilter}
                onChange={(e) => setFunctionFilter(e.target.value)}
                className="form-input"
                style={{ width: 200 }}
              >
                <option value="all">All Functions</option>
                {functionOptions.slice(1).map((fn) => (
                  <option key={fn} value={fn}>{functionLabels[fn]}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'managed' ? (
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {filteredServices.map((service) => (
              <div key={service.id} className="card" style={{ 
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{service.name}</h3>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.25rem',
                    padding: '0.15rem 0.5rem',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                  }}>
                    Ongoing Support
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filteredServices.map((group) => (
              <div key={group.function} style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: getFunctionColor(group.function),
                  }}></span>
                  {functionLabels[group.function]}
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 400, 
                    color: '#6b7280' 
                  }}>
                    ({group.services.length})
                  </span>
                </h2>
                
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {group.services.map((service) => {
                    const playbook = service.hasPlaybook ? getPlaybookForService(service.id) : null;
                    
                    return (
                      <div key={service.id} className="card" style={{ 
                        padding: '1.25rem',
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>
                              {service.name}
                            </h3>
                            
                            {service.description && (
                              <p style={{
                                margin: '0.5rem 0 0 0',
                                color: '#6b7280',
                                fontSize: '0.8rem',
                                lineHeight: 1.4,
                              }}>
                                {service.description}
                              </p>
                            )}
                            
                            {playbook && (
                              <Link 
                                href={`/playbooks/${playbook.id}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  marginTop: '0.5rem',
                                  padding: '0.25rem 0.5rem',
                                  background: '#ede9fe',
                                  color: '#7c3aed',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                }}
                              >
                                📖 View Playbook
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        {service.hasPlaybook && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#7c3aed',
                          }} title="Has detailed playbook"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: '2rem', color: '#666', textAlign: 'center' }}>
          Showing {totalCount} services
        </p>

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
            Not sure where to start?
          </h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            Take our GTM Diagnostic to identify which services will have the biggest impact on your revenue operations.
          </p>
          <Link 
            href="/try-leanscale/diagnostic"
            className="btn btn-primary"
            style={{
              background: 'white',
              color: '#7c3aed',
            }}
          >
            Take GTM Diagnostic
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function getFunctionColor(fn) {
  const colors = {
    crossFunctional: '#3b82f6',
    marketing: '#10b981',
    sales: '#f59e0b',
    customerSuccess: '#ec4899',
    partnerships: '#8b5cf6',
  };
  return colors[fn] || '#6b7280';
}
