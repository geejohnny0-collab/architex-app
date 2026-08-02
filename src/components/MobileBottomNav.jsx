import React, { useState } from 'react';
import { Home, Compass, Plus, MessageSquare, User, Settings, LogOut, Briefcase, BarChart2, Menu, X, Shield, Sparkles } from 'lucide-react';

export default function MobileBottomNav({ 
  activeView, 
  onNavigate, 
  onViewMyProfile,
  onOpenCreatePost,
  unreadMessages = 0,
  user,
  onSignOut
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'create', label: 'Post', icon: Plus, isAction: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'menu', label: 'Menu', icon: Menu, isMenuToggle: true }
  ];

  const handleMenuNavigate = (view) => {
    setIsMenuOpen(false);
    if (view === 'profile' && onViewMyProfile) {
      onViewMyProfile();
    } else {
      onNavigate(view);
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav 
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(58px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 900,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id || (tab.isMenuToggle && isMenuOpen);

          if (tab.isAction) {
            return (
              <button 
                key={tab.id}
                onClick={onOpenCreatePost}
                title="Create Post"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0a66c2 0%, #2563eb 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)',
                  transform: 'translateY(-10px)',
                  border: '3px solid var(--bg-surface)'
                }}
              >
                <Plus size={24} />
              </button>
            );
          }

          return (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.isMenuToggle) {
                  setIsMenuOpen(!isMenuOpen);
                } else {
                  setIsMenuOpen(false);
                  onNavigate(tab.id);
                }
              }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: isActive ? '700' : '500',
                background: 'none',
                border: 'none',
                padding: '6px 10px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {tab.isMenuToggle && user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name || 'User'} 
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)'
                  }}
                />
              ) : (
                <Icon size={20} />
              )}

              <span>{tab.label}</span>

              {tab.badge > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: 'calc(50% - 16px)',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: '800',
                    borderRadius: '999px',
                    padding: '1px 5px',
                    lineHeight: 1
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Slide-Up Menu Sheet */}
      {isMenuOpen && (
        <div 
          className="mobile-only"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 950,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              borderTop: '1px solid var(--border-color)',
              padding: '1.25rem 1.25rem calc(70px + env(safe-area-inset-bottom)) 1.25rem',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                  alt={user?.name || 'User'} 
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                    {user?.name || 'Architex User'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    @{user?.handle || 'user'} • <span style={{ textTransform: 'capitalize', fontWeight: '700', color: 'var(--primary)' }}>{user?.userType || 'Dev'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                style={{ background: 'var(--bg-surface-hover)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => handleMenuNavigate('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-hover)', border: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span>View My Profile</span>
              </button>

              <button 
                onClick={() => handleMenuNavigate('settings')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-hover)', border: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <Settings size={18} style={{ color: '#3b82f6' }} />
                <span>Settings & Account</span>
              </button>

              <button 
                onClick={() => handleMenuNavigate('jobs')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-hover)', border: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <Briefcase size={18} style={{ color: '#10b981' }} />
                <span>Jobs & Contracts Marketplace</span>
              </button>

              <button 
                onClick={() => handleMenuNavigate('analytics')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-hover)', border: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <BarChart2 size={18} style={{ color: '#8b5cf6' }} />
                <span>Analytics & Revenue</span>
              </button>

              <div style={{ margin: '0.5rem 0', height: '1px', background: 'var(--border-color)' }} />

              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onSignOut) onSignOut();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
