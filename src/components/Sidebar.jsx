import React from 'react';
import { 
  Home, Compass, Users, Building2, Code, Briefcase, 
  MessageSquare, Bell, Bookmark, Layers, Group, 
  TrendingUp, Settings, Sparkles, User, CheckCircle, Award
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  onNavigate, 
  onViewMyProfile,
  unreadNotifications, 
  unreadMessages,
  user 
}) {
  const navItems = [
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
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="left-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Navigation Card */}
      <div className="glass-panel" style={{ padding: '0.75rem' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    borderRadius: '999px',
                    padding: '2px 7px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Card & Pro Subscription */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div 
          onClick={() => onViewMyProfile ? onViewMyProfile() : onNavigate('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="View My Profile"
        >
          <img 
            src={user?.avatar || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
            alt={user?.name || 'User'}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</span>
              {user?.verified && <CheckCircle size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{user?.handle || ''}</div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '4px' }}>
            <Sparkles size={14} /> Architex Pro Active
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Unlimited project proposals & AI analytics enabled.
          </div>
        </div>

        <button 
          onClick={() => onViewMyProfile ? onViewMyProfile() : onNavigate('profile')} 
          className="btn-secondary" 
          style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem' }}
        >
          <User size={15} /> My Profile
        </button>
      </div>
    </aside>
  );
}
