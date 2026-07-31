import React from 'react';
import { Home, Compass, Plus, MessageSquare, User, Briefcase, Building2 } from 'lucide-react';

export default function MobileBottomNav({ 
  activeView, 
  onNavigate, 
  onOpenCreatePost,
  unreadMessages 
}) {
  const tabs = [
    { id: 'home', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'create', label: 'Post', icon: Plus, isAction: true },
    { id: 'jobs', label: 'Jobs & RFPs', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
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
        const isActive = activeView === tab.id;

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
            onClick={() => onNavigate(tab.id)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.68rem',
              fontWeight: isActive ? '800' : '600',
              flex: 1,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Icon size={20} style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s ease' }} />
            <span>{tab.label}</span>

            {tab.id === 'messages' && unreadMessages > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '25%',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.62rem',
                fontWeight: '800',
                borderRadius: '999px',
                padding: '1px 5px',
                lineHeight: 1
              }}>
                {unreadMessages}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
