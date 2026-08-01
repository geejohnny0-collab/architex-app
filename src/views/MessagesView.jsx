import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, CheckCheck, Plus, UserPlus, X, Inbox, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../services/apiService';

export default function MessagesView({ currentUser, conversations = [], onConversationsChange, onUnreadChange, onViewProfile }) {
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabMode, setTabMode] = useState('PRIMARY'); // 'PRIMARY' | 'REQUESTS'

  // New Message User Modal State
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Auto select first conversation if available and none selected
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Search users for new message modal
  useEffect(() => {
    if (!isNewMessageModalOpen) return;
    setSearchingUsers(true);
    api.users.search({ search: userSearchTerm.trim(), limit: 10 })
      .then(data => setFoundUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error('User search error:', err))
      .finally(() => setSearchingUsers(false));
  }, [userSearchTerm, isNewMessageModalOpen]);

  // Load messages when activeConvId changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    api.conversations.getMessages(activeConvId)
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load messages:', err))
      .finally(() => setLoadingMessages(false));
  }, [activeConvId]);

  const handleStartConversationWithUser = async (targetUser) => {
    try {
      const conv = await api.conversations.start(targetUser.id);
      setIsNewMessageModalOpen(false);
      setUserSearchTerm('');
      
      // Update conversations list
      if (onConversationsChange) {
        onConversationsChange([conv, ...conversations.filter(c => c.id !== conv.id)]);
      }
      setActiveConvId(conv.id);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      alert('Could not start conversation with user.');
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0] || null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      const newMsg = await api.conversations.sendMessage(activeConvId, { content });
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // Separate Primary Inbox from Message Requests
  const primaryConvs = conversations.filter(c => !c.isRequest);
  const requestConvs = conversations.filter(c => c.isRequest);

  const currentList = tabMode === 'PRIMARY' ? primaryConvs : requestConvs;

  const filteredConversations = currentList.filter(c => {
    if (!searchQuery.trim()) return true;
    const name = c.participant?.name || '';
    const handle = c.participant?.handle || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || handle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 120px)', minHeight: '580px', display: 'flex', overflow: 'hidden', padding: 0, border: '1px solid var(--border-color)' }}>
      
      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        
        {/* Header Bar */}
        <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Messages</h2>
          <button 
            onClick={() => setIsNewMessageModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={15} /> New Message
          </button>
        </div>

        {/* Primary vs Message Requests Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)' }}>
          <button
            onClick={() => setTabMode('PRIMARY')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: tabMode === 'PRIMARY' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tabMode === 'PRIMARY' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Inbox ({primaryConvs.length})
          </button>
          <button
            onClick={() => setTabMode('REQUESTS')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: 'transparent',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: tabMode === 'REQUESTS' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tabMode === 'REQUESTS' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Requests ({requestConvs.length})
          </button>
        </div>

        {/* Filter Input */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Conversation List Stream */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Inbox size={28} style={{ opacity: 0.5, marginBottom: '6px' }} />
              <div>No conversations found.</div>
              <button 
                onClick={() => setIsNewMessageModalOpen(true)}
                style={{ marginTop: '8px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
              >
                + Message someone live
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const participant = conv.participant || {};
              const avatar = participant.avatarUrl || participant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
              const name = participant.name || 'Member';
              const handle = participant.handle || '@user';
              const lastMsgText = conv.lastMessage?.content || conv.lastText || 'No messages yet';

              const isActive = conv.id === activeConvId;

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  <img src={avatar} alt={name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {lastMsgText}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT WINDOW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {activeConv ? (
          <>
            {/* Active Thread Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div 
                onClick={() => onViewProfile && activeConv.participant?.id && onViewProfile(activeConv.participant.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                title={`View ${activeConv.participant?.name}'s Profile`}
              >
                <img 
                  src={activeConv.participant?.avatarUrl || activeConv.participant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.participant?.name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                  alt={activeConv.participant?.name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {activeConv.participant?.name || 'Direct Conversation'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {activeConv.participant?.handle ? `@${activeConv.participant.handle}` : '@user'}
                  </div>
                </div>
              </div>

              {activeConv.participant?.id && onViewProfile && (
                <button 
                  onClick={() => onViewProfile(activeConv.participant.id)}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  View Profile
                </button>
              )}
            </div>

            {/* Message Thread History */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading messages…</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                  <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <div>Send your first message to start the conversation!</div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === (currentUser?.id || 'usr_me') || msg.sender === 'me';
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: isMe ? 'var(--primary)' : 'var(--bg-surface-hover)',
                        color: isMe ? '#ffffff' : 'var(--text-main)',
                        padding: '0.7rem 1rem',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div>{msg.content || msg.text}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn-primary"
                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3>No Conversation Selected</h3>
            <p style={{ fontSize: '0.88rem' }}>Choose a message thread or click "+ New Message" to contact someone.</p>
          </div>
        )}
      </div>

      {/* NEW MESSAGE USER SEARCH MODAL */}
      {isNewMessageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '460px', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Start New Conversation</h3>
              <button onClick={() => setIsNewMessageModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                autoFocus
                placeholder="Search registered members by name or handle..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.2rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {searchingUsers ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>Searching members…</div>
              ) : foundUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.85rem' }}>
                  No members found. Try searching another name.
                </div>
              ) : (
                foundUsers.map((u) => {
                  const avatar = u.avatarUrl || u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
                  const name = u.name || 'Member';
                  const handle = u.handle ? `@${u.handle.replace('@', '')}` : '@user';

                  return (
                    <div 
                      key={u.id}
                      onClick={() => handleStartConversationWithUser(u)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface-hover)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={avatar} alt={name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>{name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{handle}</div>
                        </div>
                      </div>
                      <button className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}>
                        Message
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
