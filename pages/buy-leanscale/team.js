import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import team from '../../data/team';

export default function YourTeam() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('leanscale-selected-team');
    if (stored) {
      try {
        setSelectedIds(JSON.parse(stored));
      } catch (e) {
        setSelectedIds([]);
      }
    }
  }, []);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('leanscale-selected-team', JSON.stringify(selectedIds));
    }
  }, [selectedIds, isClient]);

  const toggleMember = (memberId) => {
    setSelectedIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Selected vs available members
  const selectedMembers = team.filter((member) => selectedIds.includes(member.id));
  const availableMembers = team.filter((member) => !selectedIds.includes(member.id));

  const groupByRole = (members) => {
    return members.reduce((acc, member) => {
      if (!acc[member.role]) acc[member.role] = [];
      acc[member.role].push(member);
      return acc;
    }, {});
  };

  const selectedGrouped = groupByRole(selectedMembers);
  const availableGrouped = groupByRole(availableMembers);

  const TeamCard = ({ member, highlighted = false }) => {
    const isSelected = selectedIds.includes(member.id);

    return (
      <div
        className="card"
        onClick={() => toggleMember(member.id)}
        style={{
          border: highlighted ? '2px solid #7c3aed' : '1px solid #e5e7eb',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          textAlign: 'center',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Selection indicator */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: isSelected ? 'none' : '2px solid #d1d5db',
          background: isSelected ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 2,
          boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>

        {/* Badge */}
        {highlighted && (
          <div style={{
            position: 'absolute',
            top: '-0.5rem',
            right: '1rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
          }}>
            Selected
          </div>
        )}

        {/* Circular Photo */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
          margin: '0.5rem auto 1rem',
          backgroundImage: member.photo ? `url(${member.photo})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #e5e7eb',
          transition: 'border-color 0.2s ease',
          ...(isSelected && { borderColor: '#7c3aed' }),
        }}>
          {!member.photo && (
            <span style={{ fontSize: '2.5rem', color: '#9ca3af' }}>👤</span>
          )}
        </div>
        <h3 style={{ color: '#7c3aed', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          {member.name}
        </h3>
        <div style={{
          display: 'inline-block',
          background: member.role === 'Architect' ? '#dbeafe' : '#fef3c7',
          color: member.role === 'Architect' ? '#1d4ed8' : '#92400e',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}>
          {member.role}
        </div>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.6, color: '#374151', textAlign: 'left' }}>
          {member.experience.map((exp, i) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'left' }}>
          {member.personal}
        </p>
      </div>
    );
  };

  const RoleSection = ({ role, members, highlighted = false }) => (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <span style={{
          fontSize: '1.25rem',
          background: role === 'Architect' ? '#dbeafe' : '#fef3c7',
          padding: '0.5rem',
          borderRadius: '8px',
        }}>
          {role === 'Architect' ? '🏗️' : '⚙️'}
        </span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{role}s</h3>
        <span style={{
          background: '#f3f4f6',
          padding: '0.25rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          color: '#6b7280',
        }}>
          {members.length}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {members.map((member) => (
          <TeamCard
            key={member.id}
            member={member}
            highlighted={highlighted}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Layout title="Your Team">
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ justifyContent: 'center' }}>
            <span>👥</span> Your Team
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Meet the LeanScale operators who will be working with you. Click on team members to build your ideal team.
          </p>
        </div>

        {/* Selected Team Section */}
        {selectedMembers.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              padding: '2rem',
              borderRadius: '16px',
              marginBottom: '1rem',
              position: 'relative',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⭐</span>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                    Your Team
                    <span style={{
                      marginLeft: '0.75rem',
                      background: 'rgba(124, 58, 237, 0.15)',
                      color: '#7c3aed',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}>
                      {selectedMembers.length} selected
                    </span>
                  </h2>
                </div>

                <button
                  onClick={clearSelection}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  Clear Selection
                </button>
              </div>

              {Object.entries(selectedGrouped).map(([role, members]) => (
                <RoleSection key={role} role={role} members={members} highlighted={true} />
              ))}
            </div>
          </section>
        )}

        {/* Available Team Members */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏢</span>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                {selectedMembers.length > 0 ? 'Available Team Members' : 'LeanScale Team'}
              </h2>
              <span style={{
                background: '#f3f4f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                color: '#6b7280',
              }}>
                {selectedMembers.length > 0 ? availableMembers.length : team.length} members
              </span>
            </div>

            {selectedMembers.length === 0 && (
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid #d1d5db',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                }}>
                  +
                </span>
                Click to add to your team
              </div>
            )}
          </div>

          {selectedMembers.length > 0 ? (
            Object.entries(availableGrouped).map(([role, members]) => (
              <RoleSection key={role} role={role} members={members} />
            ))
          ) : (
            Object.entries(groupByRole(team)).map(([role, members]) => (
              <RoleSection key={role} role={role} members={members} />
            ))
          )}
        </section>

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: '#f9fafb',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Ready to meet your team?</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            {selectedIds.length > 0
              ? `You've selected ${selectedIds.length} team member${selectedIds.length > 1 ? 's' : ''}. Schedule a kickoff call to get started.`
              : 'Schedule a kickoff call to meet the operators assigned to your engagement.'
            }
          </p>
          <a href="/buy-leanscale" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary">Get Started</button>
          </a>
        </div>
      </div>
    </Layout>
  );
}
