import React from 'react';
import InFeedVideoAd from '../components/InFeedVideoAd';
import FeedPostCard from '../components/FeedPostCard';
import { Sparkles, Image, Code, Plus } from 'lucide-react';

export default function HomeView({ 
  posts, 
  activeTab, 
  onTabChange, 
  onLikeToggle, 
  onSaveToggle, 
  onAddComment, 
  onOpenCreatePost, 
  onOpenProposalModal,
  onViewProfile,
  user
}) {
  const tabs = ['For You', 'Following', 'Businesses', 'Developers', 'Trending', 'AI', 'Local'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Quick Post Box */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.85rem' }}>
          <img 
            src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
            alt={user?.name || 'User'} 
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <button 
            onClick={onOpenCreatePost}
            style={{
              flex: 1,
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}
          >
            What's on your mind or hiring for, {user?.name ? user.name.split(' ')[0] : 'you'}?
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={onOpenCreatePost} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Image size={17} style={{ color: '#3b82f6' }} /> Image / Showcase
          </button>
          <button onClick={onOpenCreatePost} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Code size={17} style={{ color: '#10b981' }} /> Code Snippet
          </button>
          <button onClick={onOpenCreatePost} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Sparkles size={17} style={{ color: '#8b5cf6' }} /> Hire / Proposal Call
          </button>
        </div>
      </div>

      {/* TikTok / Facebook Style Feed Tabs */}
      <div className="tabs-bar">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === 'For You' && <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Feed Posts Stream */}
      <div>
        {posts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>No feed posts published yet</h3>
              <p style={{ marginTop: '6px', fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px' }}>
                Publish your first update, photo, video, or code snippet to share live with developers and hiring leaders!
              </p>
            </div>
            <button 
              onClick={onOpenCreatePost}
              className="btn-primary"
              style={{ padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} /> Create First Post
            </button>
          </div>
        ) : (
          posts.map((post, idx) => (
            <React.Fragment key={post.id}>
              <FeedPostCard 
                post={post} currentUser={user}
                onViewProfile={onViewProfile}
                onLikeToggle={onLikeToggle}
                onSaveToggle={onSaveToggle}
                onAddComment={onAddComment}
                onOpenProposalModal={onOpenProposalModal}
              />
              {(idx + 1) % 5 === 0 && (
                <InFeedVideoAd adIndex={Math.floor(idx / 5)} />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
