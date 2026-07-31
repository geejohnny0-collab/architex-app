import React, { useState } from 'react';
import { 
  Search, Plus, Sun, Moon, MessageSquare, Bell, User, 
  Settings, LogOut, CheckCircle, ShieldCheck, ChevronDown, Sparkles, Zap
} from 'lucide-react';
import ArchitexLogo from './ArchitexLogo';

export default function Header({ 
  user,
  onSignOut,
  theme, 
  onToggleTheme, 
  onOpenCreatePost, 
  onOpenCreditsModal,
  activeView, 
  onNavigate,
  searchQuery,
  onSearchChange,
  unreadNotifications,
  unreadMessages
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      {/* Brand Logo & Name */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img 
            src="/architex-logo-clean.png" 
            alt="Architex Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
          />
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="header-center" style={{ flex: 1, maxWidth: '440px', margin: '0 1rem' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search businesses, developers, projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Actions & Utilities */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Credits Balance Button */}
        <button 
          onClick={onOpenCreditsModal}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid var(--primary-glow)', background: 'var(--primary-light)', color: 'var(--primary)' }}
        >
          <Zap size={16} fill="#f59e0b" color="#f59e0b" />
          <span>{user?.credits || 0} Credits</span>
        </button>

        {/* Create Post Button */}
        <button className="btn-primary" onClick={onOpenCreatePost}>
          <Plus size={18} />
          <span className="desktop-only">Create Post</span>
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)'
          }}
        >
          {theme === 'dark' ? <Sun size={19} style={{ color: '#f59e0b' }} /> : <Moon size={19} style={{ color: '#3b82f6' }} />}
        </button>

        {/* Messages Icon */}
        <button 
          onClick={() => onNavigate('messages')}
          title="Messages"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: activeView === 'messages' ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeView === 'messages' ? 'var(--primary)' : 'var(--text-main)'
          }}
        >
          <MessageSquare size={19} />
          {unreadMessages > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: '700',
              borderRadius: '999px',
              padding: '1px 5px',
              lineHeight: 1
            }}>
              {unreadMessages}
            </span>
          )}
        </button>

        {/* Notifications Icon */}
        <button 
          onClick={() => onNavigate('notifications')}
          title="Notifications"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: activeView === 'notifications' ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeView === 'notifications' ? 'var(--primary)' : 'var(--text-main)'
          }}
        >
          <Bell size={19} />
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: '700',
              borderRadius: '999px',
              padding: '1px 5px',
              lineHeight: 1
            }}>
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-surface)'
            }}
          >
            <img 
              src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
              alt={user?.name || 'User Profile'}
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow-hover)',
                zIndex: 200,
                padding: '8px 0',
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.name || 'User Profile'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.role || user?.userType || 'Architect Member'}</div>
                <div style={{ marginTop: '4px' }}>
                  <span className="badge badge-primary"><Sparkles size={11} /> Architex Pro</span>
                </div>
              </div>

              <button 
                onClick={() => { onNavigate('profile'); setProfileDropdownOpen(false); }}
                style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)', textAlign: 'left' }}
              >
                <User size={16} /> View Profile
              </button>

              <button 
                onClick={() => { onNavigate('settings'); setProfileDropdownOpen(false); }}
                style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)', textAlign: 'left' }}
              >
                <Settings size={16} /> Settings & Preferences
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <button 
                onClick={() => { if (onSignOut) onSignOut(); setProfileDropdownOpen(false); }}
                style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#ef4444', textAlign: 'left' }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
