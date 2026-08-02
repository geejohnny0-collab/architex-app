import React, { useState } from 'react';
import { 
  Heart, MessageSquare, Share2, Bookmark, Send, 
  CheckCircle, MoreHorizontal, Copy, Check, Sparkles, Zap 
} from 'lucide-react';

export default function FeedPostCard({ 
  post, 
  onLikeToggle, 
  onSaveToggle, 
  onAddComment, 
  onOpenProposalModal,
  onViewProfile,
  currentUser
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);

  const handlePromote = async (tier) => {
    try {
      setPromoteLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${post.id}/create-promotion-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Promotion session initiated!');
        setShowPromoteModal(false);
      }
    } catch (err) {
      console.error('Promotion error:', err);
      alert('Could not initiate payment session.');
    } finally {
      setPromoteLoading(false);
    }
  };

  if (!post) return null;

  const authorName = post.author?.name || 'Architect User';
  const authorHandle = post.author?.handle ? `@${post.author.handle}` : '@user';
  const authorAvatar = post.author?.avatarUrl || post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0a66c2&color=fff&bold=true`;
  const authorType = post.author?.userType || post.author?.type || 'developer';
  const isBusiness = authorType === 'business';
  const timestamp = post.timestamp || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now');

  const likesCount = typeof post.likesCount === 'number' ? post.likesCount : (post.likes ? post.likes.length : 0);
  const commentsList = Array.isArray(post.comments) ? post.comments : [];
  const commentsCount = typeof post.commentsCount === 'number' ? post.commentsCount : commentsList.length;

  const hasProposal = post.hasProposalCTA || post.hasProposal;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    if (onAddComment) onAddComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleProfileClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    let targetId = post.author?.id || post.authorId || post.userId;
    
    if (!targetId && currentUser && (post.author?.handle === currentUser?.handle || post.author?.email === currentUser?.email || authorName === currentUser?.name)) {
      targetId = currentUser.id;
    }
    
    if (onViewProfile) {
      onViewProfile(targetId || currentUser?.id);
    }
  };

return (
    <article className="glass-panel" style={{ marginBottom: '1.25rem', overflow: 'hidden', border: post.isBoosted || post.isAd ? '1px solid var(--primary-glow)' : '' }}>
      {(post.isBoosted || post.isAd) && (
        <div style={{ background: 'var(--primary-glow)', padding: '4px 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={12} />
          {post.isAd ? 'Sponsored' : 'Promoted'}
        </div>
      )}
      {/* Post Author Header */}
      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div 
          onClick={handleProfileClick}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          title={`View ${authorName}'s Profile`}
        >
          <img 
            src={authorAvatar} 
            alt={authorName} 
            onClick={handleProfileClick}
            style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span onClick={handleProfileClick} style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', cursor: 'pointer' }}>{authorName}</span>
              {post.author?.verified && <CheckCircle size={15} style={{ color: 'var(--primary)' }} />}
              <span className={`badge ${isBusiness ? 'badge-purple' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                {isBusiness ? 'Business' : 'Developer'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span onClick={handleProfileClick} style={{ cursor: 'pointer' }}>{authorHandle}</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>

        <button style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '50%', background: 'none', border: 'none' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post Body Text */}
      <div style={{ padding: '0 1.25rem 0.75rem 1.25rem', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
        {post.content}
      </div>

      {/* Project Proposal Hiring Card (if applicable) */}
      {hasProposal && (
        <div style={{
          margin: '0 1.25rem 1rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', tracking: '0.05em' }}>
              🎯 Hiring Contractor / Accepting Proposals
            </div>
            {post.projectBudget && (
              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--accent-green)', marginTop: '2px' }}>
                Project Budget: {post.projectBudget}
              </div>
            )}
          </div>
          {onOpenProposalModal && (
            <button 
              onClick={() => onOpenProposalModal(post)}
              className="btn-primary"
              style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)' }}
            >
              <Send size={16} /> Send Proposal
            </button>
          )}
        </div>
      )}

      {/* Code Snippet Box */}
      {post.codeSnippet && (
        <div style={{
          margin: '0 1.25rem 1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: '#090d16'
        }}>
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '0.45rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <span>Code Snippet</span>
            <button 
              onClick={() => handleCopyCode(post.codeSnippet)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: copiedCode ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre style={{
            padding: '1rem',
            margin: 0,
            fontSize: '0.84rem',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {post.codeSnippet}
          </pre>
        </div>
      )}

      {/* Media Image Attachment */}
      {post.imageUrl && (
        <div style={{ width: '100%', maxHeight: '450px', overflow: 'hidden', marginBottom: '0.75rem', background: '#000' }}>
          <img src={post.imageUrl} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Post Action Buttons Bar */}
      <div style={{
        padding: '0.6rem 1.25rem',
        borderTop: '1px solid var(--border-color-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <button 
            onClick={() => onLikeToggle && onLikeToggle(post.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: post.isLiked ? '#ef4444' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Heart size={18} fill={post.isLiked ? '#ef4444' : 'none'} />
            <span>{likesCount}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <MessageSquare size={18} />
            <span>{commentsCount}</span>
          </button>

          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Architex Post', text: post.content, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Post link copied to clipboard!');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Share2 size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setShowPromoteModal(true)}
            title="Promote post as Sponsored Ad"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: (post.isPromoted || post.isAd) ? '#f59e0b' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}
          >
            <Zap size={16} fill={(post.isPromoted || post.isAd) ? '#f59e0b' : 'none'} style={{ color: '#f59e0b' }} />
            <span>{(post.isPromoted || post.isAd) ? 'Promoted' : 'Promote Ad'}</span>
          </button>

          <button 
            onClick={() => onSaveToggle && onSaveToggle(post.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: post.saved ? 'var(--primary)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Bookmark size={18} fill={post.saved ? 'var(--primary)' : 'none'} />
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              style={{
                flex: 1,
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <button 
              onClick={submitComment}
              className="btn-primary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
            >
              <Send size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {commentsList.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                No comments yet. Be the first to comment!
              </div>
            ) : (
              commentsList.map((c) => {
                const cAuthor = c.author?.name || c.author || 'User';
                const cAvatar = c.author?.avatarUrl || c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80';
                const cTime = c.time || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '');
                const cText = c.content || c.text || '';
                return (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      const cId = c.author?.id || c.authorId;
                      if (onViewProfile && cId) onViewProfile(cId);
                    }}
                    style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}
                    title={`View ${cAuthor}'s Profile`}
                  >
                    <img src={cAvatar} alt={cAuthor} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-main)' }}>{cAuthor}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cTime}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', marginTop: '2px', color: 'var(--text-main)' }}>{cText}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Package Selection Modal */}
      {showPromoteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px', width: '100%', padding: '1.75rem',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-glow)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={22} style={{ color: '#f59e0b' }} /> Promote Post as Sponsored Ad
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Choose your campaign package to boost visibility and sponsor this post across the feed:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                disabled={promoteLoading} 
                onClick={() => handlePromote('3-day')}
                style={{
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)',
                  color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <span>⚡ 3-Day Feed Boost</span>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>$10</span>
              </button>

              <button 
                disabled={promoteLoading} 
                onClick={() => handlePromote('7-day')}
                style={{
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary)', background: 'var(--primary-light)',
                  color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <span>🌟 7-Day Featured Ad</span>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>$19.99</span>
              </button>

              <button 
                disabled={promoteLoading} 
                onClick={() => handlePromote('14-day')}
                style={{
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <span>👑 14-Day Top Spot Ad</span>
                <span style={{ color: '#f59e0b', fontWeight: '800' }}>$39.99</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button 
                disabled={promoteLoading}
                onClick={() => setShowPromoteModal(false)}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
