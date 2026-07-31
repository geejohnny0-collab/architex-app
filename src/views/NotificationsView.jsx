import React from 'react';
import { Bell, Heart, Send, Sparkles, MessageSquare, Check, Trash2, UserPlus } from 'lucide-react';

export default function NotificationsView({ notifications = [], onMarkAllRead, onMarkRead, onClearAll }) {
  function getIcon(type) {
    const t = (type || '').toLowerCase();
    if (t === 'like') return <Heart size={18} style={{ color: '#ef4444' }} />;
    if (t === 'comment') return <MessageSquare size={18} style={{ color: '#8b5cf6' }} />;
    if (t === 'follow') return <UserPlus size={18} style={{ color: '#3b82f6' }} />;
    if (t === 'message') return <Send size={18} style={{ color: '#10b981' }} />;
    if (t === 'proposal' || t === 'proposal_accepted') return <Send size={18} style={{ color: '#10b981' }} />;
    return <Sparkles size={18} style={{ color: '#f59e0b' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', margin: 0 }}>
            <Bell size={22} style={{ color: 'var(--primary)' }} /> Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Activity alerts, likes, comments, and follow updates.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onMarkAllRead && (
            <button onClick={onMarkAllRead} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Mark all read
            </button>
          )}
          {onClearAll && (
            <button onClick={onClearAll} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Bell size={32} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>All caught up!</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            You have no notifications yet. Likes, comments, and follows will appear here in real time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
            const isUnread = !n.read;
            const timeStr = n.createdAt
              ? new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Just now';

            return (
              <div
                key={n.id}
                onClick={() => isUnread && onMarkRead && onMarkRead(n.id)}
                className="glass-panel"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isUnread ? 'var(--primary-light)' : 'var(--bg-surface)',
                  borderLeft: isUnread ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: isUnread ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'var(--bg-surface-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.body}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeStr}</span>
                  {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

