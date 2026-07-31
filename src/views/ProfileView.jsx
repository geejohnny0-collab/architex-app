import React, { useState, useEffect } from 'react';
import { User, CheckCircle, MapPin, Globe, Github, Star, Briefcase, Settings, Edit3, Sparkles } from 'lucide-react';
import FeedPostCard from '../components/FeedPostCard';
import api from '../services/apiService';

export default function ProfileView({ user, posts = [], onNavigate, onLikeToggle, onSaveToggle, onAddComment, onOpenProposalModal }) {
  const [activeTab, setActiveTab] = useState('Posts');
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.posts.getFeed({ userId: user.id })
        .then(data => setMyPosts(Array.isArray(data) ? data : []))
        .catch(() => setMyPosts([]));
    }
  }, [user?.id]);

  const userPosts = myPosts.length > 0 ? myPosts : posts.filter(p => p.author?.handle === user?.handle || p.authorId === user?.id || p.author?.id === user?.id);

  const skills = Array.isArray(user?.skills) ? user.skills : (user?.skills ? [user.skills] : []);
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const coverUrl = user?.coverUrl || user?.cover;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Profile Cover & Header */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {/* Cover Photo */}
        <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {coverUrl && <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>

        {/* Profile Info Bar */}
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-45px', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <label style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }} title="Change Profile Picture">
              <img 
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                alt={user?.name} 
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--bg-surface)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'var(--primary)',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}>
                📷
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const res = await api.uploadFile(file, 'avatar');
                    if (res?.url) {
                      await api.patch('/api/users/me', { avatarUrl: res.url });
                      window.location.reload();
                    }
                  } catch (err) {
                    console.error('Avatar update failed:', err);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => onNavigate('settings')}
                className="btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <Settings size={15} /> Edit Profile & Settings
              </button>
            </div>
          </div>

          {/* User Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{user?.name || 'Architect User'}</h1>
              {user?.verified && <CheckCircle size={18} style={{ color: 'var(--primary)' }} />}
              <span className="badge badge-primary"><Sparkles size={11} /> {user?.userType === 'business' ? 'Verified Business' : 'Pro Architect'}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 8px 0' }}>
              @{user?.handle || 'user'}{user?.role ? ` • ${user.role}` : ''}
            </div>

            {user?.bio && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '650px', lineHeight: '1.5', marginBottom: '1rem' }}>
                {user.bio}
              </p>
            )}

            {/* Recruitment Candidate Status Panel */}
            <div style={{
              background: 'var(--bg-surface-hover)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-success" style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', fontSize: '0.78rem', fontWeight: '800' }}>
                    <Sparkles size={12} /> Active Candidate in Recruiter Pool
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>C2H & W2 Opportunities</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  Desired Rate: <span style={{ color: 'var(--accent-green)' }}>{user?.desiredRate || '$135 / hr C2H'}</span> • Expected W2: <span style={{ color: 'var(--primary)' }}>{user?.expectedSalary || '$210,000 / yr'}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Work Mode: {user?.workMode || '100% Remote'} • Status: Available Immediately
                </div>
              </div>

              <button 
                onClick={() => onNavigate('settings')}
                className="btn-outline-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                Update Recruitment Rates
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {user?.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {user.location}</div>}
              {user?.website && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14} /> {user.website}</div>}
              {user?.github && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Github size={14} /> {user.github}</div>}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                {skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
              </div>
            )}

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{user?.followersCount || user?.stats?.followers || 0}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Followers</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{user?.followingCount || user?.stats?.following || 0}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Following</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Star size={14} fill="currentColor" /> {user?.stats?.rating || '5.0'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Rating ({user?.stats?.completedProjects || 0} jobs)</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-green)' }}>{user?.stats?.earningsTotal || '$0'}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Profile Posts vs Reviews */}
      <div className="tabs-bar">
        {['Posts', 'Reviews & Testimonials', 'Completed Projects'].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Stream */}
      <div>
        {activeTab === 'Posts' && (
          userPosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No posts published yet. Use the Create Post button to publish your first update!
            </div>
          ) : (
            userPosts.map(p => (
              <FeedPostCard
                key={p.id}
                post={p}
                currentUser={user}
                onLikeToggle={onLikeToggle}
                onSaveToggle={onSaveToggle}
                onAddComment={onAddComment}
                onOpenProposalModal={onOpenProposalModal}
              />
            ))
          )
        )}

        {activeTab === 'Reviews & Testimonials' && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>Enterprise Client Review</span>
                <span style={{ color: 'var(--accent-amber)', fontSize: '0.82rem', fontWeight: '700' }}>★ 5.0</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                "High-performance architecture delivered on schedule with clean design system execution."
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Completed Projects' && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Architex Production Deployment</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Full-Stack Platform Architecture</div>
              </div>
              <span className="badge badge-success">Completed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
