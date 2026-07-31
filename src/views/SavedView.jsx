import React, { useState } from 'react';
import { Bookmark, Sparkles, FolderPlus, ArrowUpRight, MessageSquare, Heart } from 'lucide-react';
import FeedPostCard from '../components/FeedPostCard';

export default function SavedView({ posts = [], onLikeToggle, onSaveToggle, onAddComment, onOpenProposalModal }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Feed Posts', 'Architecture Blueprints', 'RFPs & Contracts'];

  // Filter posts where saved === true
  const savedPosts = Array.isArray(posts) ? posts.filter(p => p.saved) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            <Bookmark size={18} /> BOOKMARKS & SAVED REQUISITIONS
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-main)' }}>
            Your Saved Collection
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Quickly reference saved code snippets, RFPs, architecture discussions, and developer posts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Saved Posts List */}
      {savedPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Bookmark size={36} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>No bookmarks saved yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            Click the bookmark icon on any post or contract requisition in your feed to save it here for instant access.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {savedPosts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUser={user}
              onLikeToggle={onLikeToggle}
              onSaveToggle={onSaveToggle}
              onAddComment={onAddComment}
              onOpenProposalModal={onOpenProposalModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
