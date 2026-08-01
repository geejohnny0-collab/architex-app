import React, { useState, useEffect } from 'react';
import { Code, TrendingUp, MessageSquare, Briefcase, UserPlus } from 'lucide-react';
export default function RightSidebar({ onNavigate, onViewProfile, onOpenProposalModal }) {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followedMap, setFollowedMap] = useState({});

  const handleFollowClick = async (devId) => {
    const isFollowing = !!followedMap[devId];
    setFollowedMap(prev => ({ ...prev, [devId]: !isFollowing }));
    try {
      await api.users.follow(devId);
    } catch (err) {
      console.error('Follow failed:', err);
      setFollowedMap(prev => ({ ...prev, [devId]: isFollowing }));
    }
  };

  useEffect(() => {
    api.users.search({ limit: 4 })
      .then(data => setSuggestedUsers(Array.isArray(data) ? data : (Array.isArray(data?.users) ? data.users : [])))
      .catch(err => console.error('Failed to load suggested users:', err));
  }, []);

  return (
    <aside className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Who to Follow Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Who to Follow</h3>
          <button 
            onClick={() => onNavigate && onNavigate('developers')} 
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            See all
          </button>
        </div>

        {suggestedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Code size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
            <div style={{ fontSize: '0.82rem', lineHeight: '1.4', maxWidth: '240px' }}>
              No registered developers yet. Complete your profile to get featured!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestedUsers.map((dev) => {
              const avatar = dev.avatarUrl || dev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name || 'User')}&background=0a66c2&color=fff&bold=true`;
              const name = dev.name || 'Developer';
              const handle = dev.handle ? `@${dev.handle}` : '@user';

              return (
                <div key={dev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div 
                    onClick={() => onViewProfile && onViewProfile(dev.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    title={`View ${name}'s Profile`}
                  >
                    <img 
                      src={avatar} 
                      alt={name} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', lineHeight: '1.2', color: 'var(--text-main)' }}>{name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{handle}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFollowClick(dev.id)}
                    className={followedMap[dev.id] ? 'btn-secondary' : 'btn-outline-primary'}
                    style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: '600' }}
                  >
                    {followedMap[dev.id] ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Trending Discussions Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Trending Discussions</h3>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('explore')} 
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Explore
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <MessageSquare size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <div style={{ fontSize: '0.82rem', lineHeight: '1.4', maxWidth: '240px' }}>
            Nothing trending right now. Start a discussion on the feed!
          </div>
        </div>
      </div>

      {/* 3. Active Projects Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Active Projects</h3>
          <button 
            onClick={() => onNavigate && onNavigate('projects')} 
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Marketplace
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Briefcase size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <div style={{ fontSize: '0.82rem', lineHeight: '1.4', maxWidth: '240px' }}>
            No active project RFPs. Click Projects to publish one!
          </div>
        </div>
      </div>
    </aside>
  );
}
