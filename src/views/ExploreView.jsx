import React, { useState, useEffect } from 'react';
import { Compass, Search, Sparkles, Code, Building2, Briefcase, Filter } from 'lucide-react';
import api from '../services/apiService';
import FeedPostCard from '../components/FeedPostCard';

export default function ExploreView({ onNavigate, onLikeToggle, onSaveToggle, onAddComment, onOpenProposalModal }) {
  const [activeTab, setActiveTab] = useState('For You Feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [explorePosts, setExplorePosts] = useState([]);
  const [featuredDevs, setFeaturedDevs] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['For You Feed', 'Creators & Developers', 'Verified Businesses', 'Contracts & RFPs'];

  // Load feed posts for For You Feed
  useEffect(() => {
    setLoading(true);
    api.posts.getFeed({ search: searchQuery.trim() })
      .then(data => setExplorePosts(Array.isArray(data) ? data : []))
      .catch(err => console.error('Explore feed load error:', err))
      .finally(() => setLoading(false));
  }, [searchQuery, activeTab]);

  // Load registered developers
  useEffect(() => {
    api.users.search({ search: searchQuery.trim(), limit: 12 })
      .then(data => setFeaturedDevs(Array.isArray(data) ? data : []))
      .catch(err => console.error('Explore developers load error:', err));
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

      {/* Tabs Switcher: For You Feed, Creators, Businesses, Contracts */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'For You Feed' && <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />}
            {tab}
          </button>
        ))}
      </div>

      {/* FOR YOU FEED TAB */}
      {activeTab === 'For You Feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading explore stream…</div>
          ) : explorePosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={32} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>No feed posts found</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
                Be the first to publish a post or code snippet to feature in the For You Feed stream!
              </p>
            </div>
          ) : (
            explorePosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLikeToggle={onLikeToggle}
                onSaveToggle={onSaveToggle}
                onAddComment={onAddComment}
                onOpenProposalModal={onOpenProposalModal}
              />
            ))
          )}
        </div>
      )}

      {/* CREATORS & DEVELOPERS TAB */}
      {activeTab === 'Creators & Developers' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', margin: 0 }}>
            <Code size={18} style={{ color: 'var(--primary)' }} /> Featured Developers & Tech Creators
          </h3>

          {featuredDevs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No registered developers found matching search criteria.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {featuredDevs.map((dev) => {
                const avatar = dev.avatarUrl || dev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
                const name = dev.name || 'Developer';
                const location = dev.location || 'San Francisco, CA';
                const bio = dev.bio || 'Full-Stack Software Engineer';

                return (
                  <div key={dev.id} style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <img src={avatar} alt={name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{location}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{bio}</p>
                    <button 
                      onClick={() => onNavigate && onNavigate('developers')} 
                      className="btn-secondary" 
                      style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem' }}
                    >
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VERIFIED BUSINESSES & CONTRACTS TABS */}
      {(activeTab === 'Verified Businesses' || activeTab === 'Contracts & RFPs') && (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={36} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <h3>Explore {activeTab}</h3>
          <p style={{ fontSize: '0.88rem' }}>Check out registered company organizations and open RFPs under the main directory.</p>
          <button onClick={() => onNavigate && onNavigate(activeTab === 'Verified Businesses' ? 'businesses' : 'projects')} className="btn-primary" style={{ marginTop: '1rem' }}>
            Go to {activeTab} Directory
          </button>
        </div>
      )}

    </div>
  );
}
