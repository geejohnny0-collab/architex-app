import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Search, Plus, Sun, Moon, MessageSquare, Bell, User, 
  Settings, LogOut, CheckCircle, ShieldCheck, ChevronDown, Sparkles, Zap,
  Menu, X, Home, Compass, Building2, Code, Briefcase, Bookmark, Layers, Group, TrendingUp, Award
} from 'lucide-react';
import ArchitexLogo from './ArchitexLogo';
import api from '../services/apiService';

export default function Header({ 
  user,
  onSignOut,
  theme, 
  onToggleTheme, 
  onOpenCreatePost, 
  onOpenCreditsModal,
  activeView, 
  onNavigate,
  onViewProfile,
  onViewMyProfile,
  searchQuery,
  onSearchChange,
  unreadNotifications,
  unreadMessages
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState({ profiles: [], posts: [], projects: [], jobs: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'developers', label: 'Developers', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'saved', label: 'Bookmarks', icon: Bookmark },
    { id: 'jobs', label: 'Jobs', icon: Layers },
    { id: 'groups', label: 'Groups', icon: Group },
    { id: 'analytics', label: 'Enterprise Recruiter', icon: TrendingUp },
    { id: 'certification', label: 'Get Certified ($99)', icon: Award },
    { id: 'settings', label: 'Settings & Preferences', icon: Settings },
  ];

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      setLiveSearchResults({ profiles: [], posts: [], projects: [], jobs: [] });
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    const timer = setTimeout(() => {
      api.search(searchQuery.trim())
        .then(res => {
          if (res) setLiveSearchResults(res);
        })
        .catch(err => console.error('Header live search error:', err))
        .finally(() => setIsSearching(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="app-header">
      {/* Brand Logo & Mobile Hamburger Menu Button */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-only"
          title="Open Navigation Menu"
          style={{
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

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

      {/* Global Search Bar with Live Autocomplete Dropdown */}
      <div className="header-center" style={{ flex: 1, maxWidth: '480px', margin: '0 1rem', position: 'relative' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users, handles (@motionmedias), businesses..."
            value={searchQuery}
            onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value.trim() && activeView !== 'explore' && onNavigate) {
                onNavigate('explore');
              }
            }}
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
              onClick={() => { onSearchChange(''); setShowDropdown(false); }}
              style={{ position: 'absolute', right: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Instant Search Dropdown Overlay */}
        {showDropdown && searchQuery.trim() && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '0.75rem',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            maxHeight: '380px',
            overflowY: 'auto',
            borderRadius: 'var(--radius-md)'
          }}>
            {isSearching ? (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Searching database…</div>
            ) : (
              <div>
                {/* User Profiles */}
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  👥 Members & Businesses ({liveSearchResults.profiles.length})
                </div>

                {liveSearchResults.profiles.length === 0 ? (
                  <div style={{ padding: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No accounts found matching "{searchQuery}"</div>
                ) : (
                  liveSearchResults.profiles.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => {
                        setShowDropdown(false);
                        if (onViewProfile) onViewProfile(u.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        marginBottom: '4px'
                      }}
                      className="dropdown-item-hover"
                    >
                      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0a66c2&color=fff&bold=true`} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {u.name}
                          {u.verified && <CheckCircle size={13} style={{ color: 'var(--primary)' }} />}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          @{u.handle} {u.role ? `• ${u.role}` : ''} ({u.userType === 'business' ? 'Business' : 'Developer'})
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div 
                  onClick={() => {
                    setShowDropdown(false);
                    if (onNavigate) onNavigate('explore');
                  }}
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    marginTop: '8px',
                    paddingTop: '8px',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  View full results on Explore page →
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions & Utilities */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Credits Balance Button */}
        <button 
          onClick={onOpenCreditsModal}
          className="btn-secondary desktop-only"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid var(--primary-glow)', background: 'var(--primary-light)', color: 'var(--primary)' }}
        >
          <Zap size={16} fill="#f59e0b" color="#f59e0b" />
          <span>{user?.credits || 0} Credits</span>
        </button>

        {/* Create Post Button */}
        <button className="btn-primary desktop-only" onClick={onOpenCreatePost}>
          <Plus size={18} />
          <span>Create Post</span>
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="desktop-only"
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
          className="desktop-only"
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
                onClick={() => { 
                  if (onViewMyProfile) onViewMyProfile();
                  else onNavigate('profile'); 
                  setProfileDropdownOpen(false); 
                }}
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

              {/* Full Navigation List for Mobile Viewports inside Profile Dropdown */}
              <div className="mobile-only" style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0', paddingTop: '4px', maxHeight: '320px', overflowY: 'auto' }}>
                <div style={{ padding: '6px 16px', fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Navigation Menu
                </div>
                {mobileNavItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        color: activeView === item.id ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: activeView === item.id ? '700' : '500',
                        background: activeView === item.id ? 'var(--primary-light)' : 'transparent',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} style={{ color: activeView === item.id ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span style={{ background: '#ef4444', color: 'white', fontSize: '0.68rem', fontWeight: '700', borderRadius: '999px', padding: '1px 6px' }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

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

      {/* Responsive Slide-Out Navigation Drawer (Rendered via React Portal directly into document.body) */}
      {mobileMenuOpen && ReactDOM.createPortal(
        <div 
          className="mobile-menu-container"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
          <div 
            className="mobile-menu-drawer glass-panel" 
            style={{
              width: '100%',
              maxWidth: '340px',
              height: '100%',
              overflowY: 'auto',
              padding: '1.25rem',
              borderRight: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '8px 0 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header Title & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/architex-logo-clean.png" alt="Architex" style={{ height: '32px', width: 'auto' }} />
                <span>Navigation</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info Header */}
            <div 
              onClick={() => {
                setMobileMenuOpen(false);
                if (onViewMyProfile) onViewMyProfile();
                else onNavigate('profile');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              <img 
                src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                alt={user?.name || 'User'} 
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user?.name || 'Architect User'}
                  {user?.verified && <CheckCircle size={15} style={{ color: 'var(--primary)' }} />}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user?.handle || 'user'} • View Profile</div>
              </div>
            </div>

            {/* Quick Action Utilities */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenCreatePost(); }}
                className="btn-primary"
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Create Post
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenCreditsModal(); }}
                className="btn-secondary"
                style={{ padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}
              >
                <Zap size={16} fill="#f59e0b" color="#f59e0b" /> {user?.credits || 0}
              </button>
            </div>

            {/* Complete Navigation List */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(item.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.95rem',
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Icon size={20} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '999px',
                        padding: '2px 8px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={onToggleTheme}
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#3b82f6' }} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); if (onSignOut) onSignOut(); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
