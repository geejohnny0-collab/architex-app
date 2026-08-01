import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Users, Briefcase, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../services/apiService';

export default function BusinessesView({ searchQuery: globalQuery = '', onNavigate, onViewProfile }) {
  const [searchTerm, setSearchTerm] = useState(globalQuery);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchTerm(globalQuery);
  }, [globalQuery]);

  useEffect(() => {
    setLoading(true);
    api.users.search({ search: searchTerm.trim(), type: 'business', limit: 20 })
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.users) ? data.users : []);
        setBusinesses(list);
      })
      .catch(err => {
        console.error('Failed to load businesses:', err);
        setBusinesses([]);
      })
      .finally(() => setLoading(false));
  }, [searchTerm]);

  const filtered = businesses.filter(b => 
    !searchTerm.trim() || 
    (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.handle && b.handle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.role && b.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Verified Businesses & Agencies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Connect with companies posting high-budget contracts & SaaS projects.</p>
        </div>

        <input 
          type="text"
          placeholder="Filter by name or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-surface-hover)',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            width: '260px'
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading companies…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Building2 size={32} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>No business organizations found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            Post a hiring request or register your enterprise organization on Architex!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((biz) => {
            const logo = biz.logo || biz.avatarUrl || biz.avatar || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80';
            const name = biz.name || 'Enterprise Client';
            const category = biz.category || 'Tech Enterprise';
            const description = biz.description || biz.bio || 'Building cloud applications and hiring tech talent.';
            const location = biz.location || 'San Francisco, CA';
            const teamSize = biz.teamSize || '50-200 Employees';
            const openProjectsCount = biz.openProjectsCount || 0;

            return (
              <div key={biz.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div 
                    onClick={() => onViewProfile && onViewProfile(biz.id)}
                    style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}
                    title={`View ${name}'s Profile`}
                  >
                    <img src={logo} alt={name} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                        {name}
                        {biz.verified && <CheckCircle size={15} style={{ color: 'var(--accent-purple)' }} />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{category}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} /> {location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} /> {teamSize}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => onNavigate && onNavigate('projects')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                  >
                    <Briefcase size={14} /> {openProjectsCount} Open Projects
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('messages')}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    <MessageSquare size={14} /> Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
