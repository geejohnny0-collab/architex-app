import React, { useState, useEffect } from 'react';
import { Compass, Search, Sparkles, Code, Building2, Briefcase, Filter } from 'lucide-react';
import api from '../services/apiService';
import FeedPostCard from '../components/FeedPostCard';

export default function ExploreView({ searchQuery: globalQuery = '', onNavigate, onViewProfile, onLikeToggle, onSaveToggle, onAddComment, onOpenProposalModal }) {
  const [activeTab, setActiveTab] = useState('All Results');
  const [searchQuery, setSearchQuery] = useState(globalQuery);
  const [searchResults, setSearchResults] = useState({ profiles: [], posts: [], tags: [], projects: [], jobs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(globalQuery);
  }, [globalQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ profiles: [], posts: [], tags: [], projects: [], jobs: [] });
      return;
    }
    setLoading(true);
    api.search(searchQuery.trim())
      .then(data => {
        if (data) setSearchResults(data);
      })
      .catch(err => console.error('Unified search error:', err))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Search Engine Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.14) 0%, rgba(139, 92, 246, 0.14) 100%)',
        border: '1px solid var(--primary-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
          <Compass size={18} /> ARCHITEX EXPLORE & SEARCH ENGINE
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '6px 0', color: 'var(--text-main)' }}>
          Discover Tech Innovations, Feed Posts & Contracts
        </h1>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', marginTop: '1rem', maxWidth: '640px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search creators, tech stack, code snippets, companies, or RFPs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          />
        </div>
      </div>

      {/* Categorized Tabs */}
      <div className="tabs-bar">
        {['All Results', 'Profiles', 'Posts', 'Tags', 'Projects', 'Jobs'].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Searching database…</div>
      ) : !searchQuery.trim() ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Search size={36} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0' }}>Search Architex Platform</h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>Type a business name, full developer name/handle, project RFP, or tag to discover live results.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. PROFILES */}
          {(activeTab === 'All Results' || activeTab === 'Profiles') && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
                👥 Profiles & Businesses ({searchResults.profiles.length})
              </h3>
              {searchResults.profiles.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No profiles found. (Note: Developer profiles require typing their full name or handle to be discovered).</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {searchResults.profiles.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => onViewProfile && onViewProfile(u.id)}
                      style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0a66c2&color=fff&bold=true`} alt={u.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.handle} • {u.userType === 'business' ? 'Business' : 'Developer'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. POSTS */}
          {(activeTab === 'All Results' || activeTab === 'Posts') && searchResults.posts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>📝 Posts ({searchResults.posts.length})</h3>
              {searchResults.posts.map(p => (
                <FeedPostCard key={p.id} post={p} onViewProfile={onViewProfile} onLikeToggle={onLikeToggle} onSaveToggle={onSaveToggle} onAddComment={onAddComment} onOpenProposalModal={onOpenProposalModal} />
              ))}
            </div>
          )}

          {/* 3. TAGS */}
          {(activeTab === 'All Results' || activeTab === 'Tags') && searchResults.tags.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>🏷️ Tags & Categories ({searchResults.tags.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {searchResults.tags.map(t => (
                  <span key={t.name} className="badge badge-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>#{t.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* 4. PROJECTS */}
          {(activeTab === 'All Results' || activeTab === 'Projects') && searchResults.projects.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>💼 Projects & RFPs ({searchResults.projects.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {searchResults.projects.map(prj => (
                  <div key={prj.id} style={{ padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>{prj.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{prj.description}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>Budget: {prj.budget || 'Negotiable'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. JOBS */}
          {(activeTab === 'All Results' || activeTab === 'Jobs') && searchResults.jobs.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>🎯 Jobs & Contracts ({searchResults.jobs.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {searchResults.jobs.map(j => (
                  <div key={j.id} style={{ padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>{j.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{j.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
