import React, { useState, useEffect } from 'react';
import { Code, MapPin, UserPlus, CheckCircle, MessageSquare, Check } from 'lucide-react';
import api from '../services/apiService';

export default function DevelopersView({ searchQuery: globalQuery = '', onNavigate, onViewProfile }) {
  const [searchTerm, setSearchTerm] = useState(globalQuery);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    setSearchTerm(globalQuery);
  }, [globalQuery]);

  useEffect(() => {
    setLoading(true);
    api.users.search({ search: searchTerm.trim(), type: 'developer', limit: 20 })
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.users) ? data.users : []);
        setDevelopers(list);
      })
      .catch(() => setDevelopers([]))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  const handleFollow = async (devId) => {
    try {
      const result = await api.users.follow(devId);
      setFollowingIds(prev => {
        const next = new Set(prev);
        if (result.following) next.add(devId);
        else next.delete(devId);
        return next;
      });
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const filtered = developers.filter(d =>
    !searchTerm.trim() ||
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.handle && d.handle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.role && d.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (Array.isArray(d.skills) && d.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Developer Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Discover engineers, UI designers, and full-stack architects.</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, handle or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.875rem', width: '280px' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading developers…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Code size={32} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>No developers found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            No registered developers yet. Be the first — sign up and complete your profile!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((dev) => {
            const isFollowing = followingIds.has(dev.id) || dev.isFollowing;
            return (
              <div key={dev.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div 
                    onClick={() => onViewProfile && onViewProfile(dev.id)}
                    style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}
                    title={`View ${dev.name}'s Profile`}
                  >
                    {dev.avatarUrl
                      ? <img src={dev.avatarUrl} alt={dev.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem', flexShrink: 0 }}>{(dev.name || 'U')[0].toUpperCase()}</div>
                    }
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                        {dev.name || 'Member'}
                        {dev.verified && <CheckCircle size={15} style={{ color: 'var(--primary)' }} />}
                      </div>
                      {dev.role && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dev.role}</div>}
                    </div>
                  </div>

                  {dev.bio && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem', margin: '0 0 0.75rem' }}>
                      {dev.bio.length > 110 ? dev.bio.slice(0, 110) + '…' : dev.bio}
                    </p>
                  )}

                  {dev.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <MapPin size={14} /> {dev.location}
                    </div>
                  )}

                  {Array.isArray(dev.skills) && dev.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                      {dev.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleFollow(dev.id)}
                    className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    {isFollowing ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('messages')}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> Message
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
