import React, { useState, useEffect } from 'react';
import { User, CheckCircle, MapPin, Globe, Github, Star, Briefcase, Settings, Edit3, Sparkles } from 'lucide-react';
import FeedPostCard from '../components/FeedPostCard';
import api from '../services/apiService';

export default function ProfileView({ user: currentUser, viewedUserId, onNavigate, onViewProfile, onLikeToggle, onSaveToggle, onAddComment, onOpenProposalModal, onOpenChat }) {
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileUser, setProfileUser] = useState(currentUser);
  const [userPosts, setUserPosts] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'followers' | 'following' | null
  const [modalList, setModalList] = useState([]);

  const targetId = viewedUserId || currentUser?.id;
  const isSelf = !viewedUserId || Number(viewedUserId) === Number(currentUser?.id);

  const openUserListModal = async (type) => {
    setModalType(type);
    try {
      const data = type === 'followers' 
        ? await api.users.getFollowers(targetId) 
        : await api.users.getFollowing(targetId);
      setModalList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    }
  };

  useEffect(() => {
    if (!targetId) return;
    if (isSelf && currentUser) {
      setProfileUser(currentUser);
    }
    setLoading(true);
    
    Promise.all([
      api.users.getById(targetId),
      api.posts.getFeed({ userId: targetId }),
      api.users.getFollowers(targetId).catch(() => []),
      api.users.getFollowing(targetId).catch(() => [])
    ]).then(([userData, postsData, followersData, followingData]) => {
      if (userData) {
        setProfileUser(userData);
        setIsFollowingState(!!userData.isFollowing);
      }
      const fList = Array.isArray(followersData) ? followersData : [];
      const ingList = Array.isArray(followingData) ? followingData : [];
      setFollowersList(fList);
      setFollowingList(ingList);
      setFollowersCount(typeof userData?.followersCount === 'number' ? userData.followersCount : fList.length);
      setFollowingCount(typeof userData?.followingCount === 'number' ? userData.followingCount : ingList.length);
      setUserPosts(Array.isArray(postsData) ? postsData : []);
    }).catch(err => console.error('Error loading target user profile:', err))
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleFollowToggle = async () => {
    try {
      const res = await api.users.follow(targetId);
      setIsFollowingState(res.following);
      setFollowersCount(prev => res.following ? prev + 1 : Math.max(0, prev - 1));
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const targetUser = profileUser || currentUser;
  const skills = Array.isArray(targetUser?.skills) ? targetUser.skills : (targetUser?.skills ? [targetUser.skills] : []);
  const avatarUrl = targetUser?.avatarUrl || targetUser?.avatar;
  const coverUrl = targetUser?.coverUrl || targetUser?.cover;
  const initials = targetUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

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
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                alt={targetUser?.name || 'User'} 
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
              {isSelf ? (
                <button 
                  onClick={() => onNavigate('settings')}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <Settings size={15} /> Edit Profile & Settings
                </button>
              ) : (
                <>
                  {targetUser?.id === 4 || targetUser?.id === 5 || targetUser?.handle === 'motionmedias' || targetUser?.handle === 'motionmedia' ? (
                    <button 
                      disabled
                      className="btn-secondary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', cursor: 'not-allowed', opacity: 0.85 }}
                      title="Permanent Global Follow"
                    >
                      ✓ Following
                    </button>
                  ) : (
                    <button 
                      onClick={handleFollowToggle}
                      className={isFollowingState ? 'btn-secondary' : 'btn-primary'}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                    >
                      {isFollowingState ? '✓ Following' : '+ Follow User'}
                    </button>
                  )}
                  <button 
                    onClick={() => onNavigate && onNavigate('messages')}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  >
                    💬 Send Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{targetUser?.name || 'Architect User'}</h1>
              {targetUser?.verified && <CheckCircle size={18} style={{ color: 'var(--primary)' }} />}
              <span className="badge badge-primary"><Sparkles size={11} /> {targetUser?.userType === 'business' ? 'Verified Business' : 'Pro Architect'}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 8px 0' }}>
              @{targetUser?.handle || 'user'}{targetUser?.role ? ` • ${targetUser.role}` : ''}
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', margin: '8px 0 12px 0' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => openUserListModal('followers')}>
                <strong style={{ color: 'var(--text-main)' }}>{followersCount}</strong> Followers
              </span>
              <span style={{ cursor: 'pointer' }} onClick={() => openUserListModal('following')}>
                <strong style={{ color: 'var(--text-main)' }}>{followingCount}</strong> Following
              </span>
            </div>

            {targetUser?.bio && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '650px', lineHeight: '1.5', marginBottom: '1rem' }}>
                {targetUser.bio}
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
                  Desired Rate: <span style={{ color: 'var(--accent-green)' }}>{targetUser?.desiredRate || '$135 / hr C2H'}</span> • Expected W2: <span style={{ color: 'var(--primary)' }}>{targetUser?.expectedSalary || '$210,000 / yr'}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Work Mode: {targetUser?.workMode || '100% Remote'} • Status: Available Immediately
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
              {targetUser?.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {targetUser.location}</div>}
              {targetUser?.website && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14} /> {targetUser.website}</div>}
              {targetUser?.github && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Github size={14} /> {targetUser.github}</div>}
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
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{targetUser?.followersCount || targetUser?.stats?.followers || 0}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Followers</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{targetUser?.followingCount || targetUser?.stats?.following || 0}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Following</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Star size={14} fill="currentColor" /> {targetUser?.stats?.rating || '5.0'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Rating ({targetUser?.stats?.completedProjects || 0} jobs)</div>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-green)' }}>{targetUser?.stats?.earningsTotal || '$0'}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Profile Posts vs Followers vs Following */}
      <div className="tabs-bar">
        {['Posts', 'Followers', 'Following', 'Reviews & Testimonials'].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Followers' ? `Followers (${followersCount})` : tab === 'Following' ? `Following (${followingCount})` : tab}
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
                currentUser={currentUser}
                onViewProfile={onViewProfile}
                onLikeToggle={onLikeToggle}
                onSaveToggle={onSaveToggle}
                onAddComment={onAddComment}
                onOpenProposalModal={onOpenProposalModal}
              />
            ))
          )
        )}

        {activeTab === 'Followers' && (
          followersList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No followers yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {followersList.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => onViewProfile && onViewProfile(u.id)}
                  className="glass-panel" 
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  title={`View ${u.name}'s Profile`}
                >
                  <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0a66c2&color=fff&bold=true`} alt={u.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'Following' && (
          followingList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Not following anyone yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {followingList.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => onViewProfile && onViewProfile(u.id)}
                  className="glass-panel" 
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  title={`View ${u.name}'s Profile`}
                >
                  <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0a66c2&color=fff&bold=true`} alt={u.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.handle}</div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Interactive Followers / Following List Modal */}
      {modalType && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px', width: '100%', padding: '1.5rem',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', textTransform: 'capitalize', color: 'var(--text-main)' }}>
                {modalType}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {modalList.map((u) => (
                <div 
                  key={u.id}
                  onClick={() => {
                    setModalType(null);
                    if (onViewProfile) onViewProfile(u.id);
                  }}
                  className="glass-panel"
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <img 
                    src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                    alt={u.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u.name}
                      {u.verified && <CheckCircle size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.handle || u.username}</div>
                  </div>
                </div>
              ))}
              {modalList.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.88rem' }}>
                  No {modalType} found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
