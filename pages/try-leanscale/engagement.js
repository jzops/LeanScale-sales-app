import { useState, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { processes, managedServicesHealth, statusToLabel } from '../../data/diagnostic-data';
import { strategicProjects, managedServices } from '../../data/services-catalog';
import { useCustomer } from '../../context/CustomerContext';

const allStrategicProjects = [
  ...strategicProjects.crossFunctional,
  ...strategicProjects.marketing,
  ...strategicProjects.sales,
  ...strategicProjects.customerSuccess,
  ...strategicProjects.partnerships,
];

const allManagedServices = [
  ...(managedServices.crossFunctional || []),
  ...(managedServices.marketing || []),
  ...(managedServices.sales || []),
  ...(managedServices.customerSuccess || []),
  ...(managedServices.partnerships || []),
];

const functionColors = {
  'Cross Functional': { bg: '#e0e7ff', border: '#818cf8' },
  'Marketing': { bg: '#dcfce7', border: '#4ade80' },
  'Sales': { bg: '#fef3c7', border: '#fbbf24' },
  'Customer Success': { bg: '#fce7f3', border: '#f472b6' },
  'Partnerships': { bg: '#dbeafe', border: '#60a5fa' },
};

const statusColors = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#6b7280',
};

function getServiceDetails(serviceId, serviceType) {
  if (!serviceId) return null;
  if (serviceType === 'strategic') {
    return allStrategicProjects.find(s => s.id === serviceId);
  }
  if (serviceType === 'managed') {
    return allManagedServices.find(s => s.id === serviceId);
  }
  return null;
}

export default function EngagementOverview() {
  const { customerPath } = useCustomer();
  const engagementItems = useMemo(() => {
    const priorityProcesses = processes
      .filter(p => p.addToEngagement)
      .map((p, idx) => {
        const service = getServiceDetails(p.serviceId, p.serviceType);
        return {
          ...p,
          type: 'strategic',
          icon: service?.icon || '📋',
          description: service?.description || '',
          hasPlaybook: service?.hasPlaybook || false,
          lowHours: 20 + (idx * 8),
          highHours: 40 + (idx * 12),
          startWeek: idx + 1,
          durationWeeks: 3 + Math.floor(idx / 3),
          priority: idx < 5 ? 'High' : 'Medium',
        };
      });
    
    const priorityManaged = managedServicesHealth
      .filter(m => m.addToEngagement)
      .map((m, idx) => {
        const service = allManagedServices.find(s => s.id === m.serviceId);
        const hoursPerMonth = m.hoursPerMonth || 8;
        return {
          ...m,
          type: 'managed',
          icon: service?.icon || '🔧',
          description: service?.description || '',
          hasPlaybook: false,
          lowHours: hoursPerMonth,
          highHours: hoursPerMonth * 1.5,
          startWeek: 1,
          durationWeeks: 52,
          priority: 'Ongoing',
        };
      });

    return [...priorityProcesses, ...priorityManaged];
  }, []);

  const [selectedItems, setSelectedItems] = useState(
    engagementItems.reduce((acc, item) => ({ ...acc, [item.name]: true }), {})
  );

  const hourTiers = [
    { hours: 50, label: 'Starter', price: 15000, color: '#10b981' },
    { hours: 100, label: 'Growth', price: 25000, color: '#7c3aed' },
    { hours: 225, label: 'Scale', price: 50000, color: '#f59e0b' },
  ];
  const [selectedTier, setSelectedTier] = useState(hourTiers[1]);

  const toggleItem = (name) => {
    setSelectedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const selectedProjects = engagementItems.filter(p => selectedItems[p.name]);
  const strategicItems = selectedProjects.filter(p => p.type === 'strategic');
  const managedItems = selectedProjects.filter(p => p.type === 'managed');

  const totalLowHours = strategicItems.reduce((sum, p) => sum + p.lowHours, 0);
  const totalHighHours = strategicItems.reduce((sum, p) => sum + p.highHours, 0);
  const avgProjectHours = Math.round((totalLowHours + totalHighHours) / 2);
  const monthlyManagedHours = managedItems.reduce((sum, p) => sum + p.lowHours, 0);

  const calculateDuration = (tier) => {
    const availableForProjects = tier.hours - monthlyManagedHours;
    if (availableForProjects <= 0) return { months: '∞', weeks: '∞', note: 'Not enough hours for projects' };
    const monthsLow = totalLowHours / availableForProjects;
    const monthsHigh = totalHighHours / availableForProjects;
    const avgMonths = (monthsLow + monthsHigh) / 2;
    return {
      monthsLow: Math.ceil(monthsLow),
      monthsHigh: Math.ceil(monthsHigh),
      avgMonths: Math.round(avgMonths * 10) / 10,
      weeksLow: Math.ceil(monthsLow * 4.33),
      weeksHigh: Math.ceil(monthsHigh * 4.33),
      availableForProjects,
    };
  };

  const weeks = Array.from({ length: 26 }, (_, i) => i + 1);
  const getWeekLabel = (week) => {
    const startDate = new Date(2026, 1, 2 + (week - 1) * 7);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Layout title="Engagement Overview">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>📋</span> Engagement Overview
          </h1>
          <p className="page-subtitle">Prioritized Projects Based on Your Diagnostic Results</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Strategic Projects</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>
              {strategicItems.length}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Managed Services</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>
              {managedItems.length}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Project Hours (Est.)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>
              {totalLowHours}-{totalHighHours}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Managed Svc Hours/Mo</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7c3aed' }}>
              {monthlyManagedHours}
            </div>
          </div>
        </div>

        <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⏱️</span> Timeline Calculator
          </h2>
          <p style={{ color: '#c4b5fd', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            See how long your engagement will take based on different monthly hour commitments
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {hourTiers.map((tier) => {
              const duration = calculateDuration(tier);
              const isSelected = selectedTier.hours === tier.hours;
              return (
                <div
                  key={tier.hours}
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: isSelected ? `2px solid ${tier.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: tier.color, textTransform: 'uppercase' }}>{tier.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>${tier.price.toLocaleString()}/mo</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                    {tier.hours} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#c4b5fd' }}>hrs/mo</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#a5b4fc', marginTop: '0.75rem' }}>
                    {duration.availableForProjects > 0 ? (
                      <>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '1.25rem' }}>
                          {duration.monthsLow === duration.monthsHigh ? `~${duration.monthsLow}` : `${duration.monthsLow}-${duration.monthsHigh}`} months
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {duration.availableForProjects} hrs/mo for projects
                        </div>
                      </>
                    ) : (
                      <span style={{ color: '#f87171' }}>Insufficient hours</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>Total Project Hours</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{totalLowHours}-{totalHighHours}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>Managed Svc (ongoing)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{monthlyManagedHours} hrs/mo</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>Selected Plan</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedTier.color }}>{selectedTier.hours} hrs/mo</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Project Timeline (H1 2026)</h2>
          <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <div style={{ minWidth: '1200px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '280px repeat(26, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.75rem', padding: '0.5rem' }}>Project</div>
                {weeks.map(week => (
                  <div key={week} style={{ fontSize: '0.6rem', textAlign: 'center', padding: '0.25rem', background: week % 2 === 0 ? '#f9fafb' : '#fff', borderRadius: '2px' }}>
                    {week % 4 === 1 ? getWeekLabel(week) : ''}
                  </div>
                ))}
              </div>

              {strategicItems.map((project, idx) => (
                <div key={project.name} style={{ display: 'grid', gridTemplateColumns: '280px repeat(26, 1fr)', gap: '2px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem' }}>
                    <span>{project.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</span>
                    {project.hasPlaybook && (
                      <Link href={customerPath(`/playbooks/${project.serviceId}`)} style={{ color: '#7c3aed', fontSize: '0.65rem' }}>
                        Playbook
                      </Link>
                    )}
                  </div>
                  {weeks.map(week => {
                    const isActive = week >= project.startWeek && week < project.startWeek + project.durationWeeks;
                    const isStart = week === project.startWeek;
                    const isEnd = week === project.startWeek + project.durationWeeks - 1;
                    return (
                      <div
                        key={week}
                        style={{
                          height: '28px',
                          background: isActive ? functionColors[project.function]?.bg || '#e5e7eb' : week % 2 === 0 ? '#f9fafb' : '#fff',
                          borderLeft: isStart ? `3px solid ${functionColors[project.function]?.border || '#9ca3af'}` : 'none',
                          borderRight: isEnd ? `3px solid ${functionColors[project.function]?.border || '#9ca3af'}` : 'none',
                          borderRadius: isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : '0',
                        }}
                      />
                    );
                  })}
                </div>
              ))}

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#7c3aed' }}>Ongoing Managed Services</div>
                {managedItems.map(service => (
                  <div key={service.name} style={{ display: 'grid', gridTemplateColumns: '280px repeat(26, 1fr)', gap: '2px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem' }}>
                      <span>{service.icon}</span>
                      <span>{service.name}</span>
                    </div>
                    {weeks.map(week => (
                      <div
                        key={week}
                        style={{
                          height: '28px',
                          background: 'linear-gradient(90deg, #ddd6fe 0%, #c4b5fd 50%, #ddd6fe 100%)',
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(functionColors).map(([func, colors]) => (
            <div key={func} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: '3px' }} />
              <span>{func}</span>
            </div>
          ))}
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Strategic Projects</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Add</th>
                  <th>Project</th>
                  <th>Function</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Hours</th>
                  <th>Outcome</th>
                  <th>Playbook</th>
                </tr>
              </thead>
              <tbody>
                {engagementItems.filter(p => p.type === 'strategic').map(project => (
                  <tr key={project.name} style={{ opacity: selectedItems[project.name] ? 1 : 0.5 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems[project.name]}
                        onChange={() => toggleItem(project.name)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{project.icon}</span>
                        <span style={{ fontWeight: 500 }}>{project.name}</span>
                      </div>
                      {project.description && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>{project.description}</div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: functionColors[project.function]?.bg || '#f3f4f6',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      }}>
                        {project.function}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: `${statusColors[project.status]}20`,
                        color: statusColors[project.status],
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[project.status] }} />
                        {statusToLabel(project.status)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: project.priority === 'High' ? '#fef2f2' : '#f3f4f6',
                        color: project.priority === 'High' ? '#dc2626' : '#374151',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}>
                        {project.priority}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{project.lowHours}-{project.highHours}</td>
                    <td style={{ fontSize: '0.75rem' }}>{project.outcome}</td>
                    <td>
                      {project.hasPlaybook && project.serviceId ? (
                        <Link href={customerPath(`/playbooks/${project.serviceId}`)} style={{ color: '#7c3aed', fontSize: '0.75rem', textDecoration: 'underline' }}>
                          View Playbook
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recommended Managed Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {engagementItems.filter(p => p.type === 'managed').map(service => (
              <div key={service.name} className="card" style={{ padding: '1rem', opacity: selectedItems[service.name] ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems[service.name]}
                      onChange={() => toggleItem(service.name)}
                    />
                    <span style={{ fontSize: '1.25rem' }}>{service.icon}</span>
                    <span style={{ fontWeight: 600 }}>{service.name}</span>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    background: `${statusColors[service.status]}20`,
                    color: statusColors[service.status],
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[service.status] }} />
                    {statusToLabel(service.status)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{service.description}</p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 500 }}>
                  ~{service.lowHours} hrs/month
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Ready to Get Started?</h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>Let's discuss your engagement plan and timeline.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={customerPath('/buy-leanscale/availability')}>
              <button className="btn" style={{ background: 'white', color: '#7c3aed', border: 'none', padding: '0.75rem 1.5rem' }}>
                Check Cohort Availability
              </button>
            </Link>
            <Link href={customerPath('/buy-leanscale')}>
              <button className="btn" style={{ background: 'transparent', color: 'white', border: '2px solid white', padding: '0.75rem 1.5rem' }}>
                Start Engagement
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
