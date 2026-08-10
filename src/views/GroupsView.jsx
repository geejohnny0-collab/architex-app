import React, { useState } from 'react';
import { MOCK_GROUPS } from '../data/mockData';
import { 
  Group, Users, Check, Plus, Search, Shield, Globe, Lock, 
  Sparkles, X, MessageSquare, Tag, Crown, Hash, Volume2, 
  Send, ThumbsUp, MessageCircle, Share2, Pin, Settings,
  Radio, Layout, Layers, UserCheck, Flame, AtSign, CornerDownLeft
} from 'lucide-react';

const DEFAULT_GROUPS = [
  {
    id: 'grp-1',
    name: 'AI Engineering & LLM Architecture',
    membersCount: 1420,
    category: 'AI / Machine Learning',
    description: 'Community for AI engineers building vector search, RAG pipelines, fine-tuned models, and agentic workflows.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    joined: true
  },
  {
    id: 'grp-2',
    name: 'React Native & Cross-Platform Mobile',
    membersCount: 980,
    category: 'Mobile Development',
    description: 'Best practices for high-performance React Native, Expo, and native iOS/Android bridge architectures.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
    joined: false
  },
  {
    id: 'grp-3',
    name: 'DevOps, K8s & Cloud Infrastructure',
    membersCount: 840,
    category: 'DevOps & Cloud',
    description: 'Cloud architects sharing Terraform modules, Kubernetes cluster configs, CI/CD, and site reliability tricks.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80',
    joined: true
  }
];

export default function GroupsView() {
  const [groups, setGroups] = useState(DEFAULT_GROUPS);

  React.useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(serverGroups => {
        if (Array.isArray(serverGroups) && serverGroups.length > 0) {
          setGroups(serverGroups);
        }
      })
      .catch(err => console.log('Groups fetch fallback:', err));
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'JOINED'

  // Modal & View States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeGroupHub, setActiveGroupHub] = useState(null);
  const [hubMode, setHubMode] = useState('FEED'); // 'FEED' | 'CHAT'

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('AI & Machine Learning');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('Public');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupTags, setNewGroupTags] = useState('');

  // Group Feed Posts State
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 'fb_1',
      author: 'Dr. Marcus Vance (Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      time: '2 hours ago',
      content: 'Welcome everyone! In this group feed we share architecture blueprints, C2H job requisitions, and engineering best practices. Post your questions or projects below!',
      likes: 18,
      isLiked: false,
      comments: [
        { id: 'c1', author: 'Elena Rostova', text: 'Excited to be here! Looking for Next.js 14 contract roles.' }
      ],
      isPinned: true
    },
    {
      id: 'fb_2',
      author: 'Sophia Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      time: '4 hours ago',
      content: 'Just deployed our new vector search microservice handling 10k requests/sec. Anyone using Qdrant or Pinecone for production RAG pipelines?',
      likes: 24,
      isLiked: false,
      comments: [],
      isPinned: false
    }
  ]);
  const [newFeedPostText, setNewFeedPostText] = useState('');
  const [activeCommentInput, setActiveCommentInput] = useState({});

  // Group Chat State (Channels & Live Chat Messages)
  const [activeChannel, setActiveChannel] = useState('general-chat');
  const [chatMessages, setChatMessages] = useState({
    'general-chat': [
      { id: 'm1', user: 'Dr. Marcus Vance', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', text: 'Hey everyone! Welcome to our official Group Chat.', time: '10:14 AM' },
      { id: 'm2', user: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', text: 'Glad to join! Are contract-to-hire offers posted in #c2h-job-board?', time: '10:18 AM' }
    ],
    'c2h-job-board': [
      { id: 'm3', user: 'Architex Bot', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', text: 'New Requisition: Senior Full-Stack Engineer ($120/hr C2H or $195k W2)', time: '09:00 AM' }
    ],
    'ai-showcase': [
      { id: 'm4', user: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', text: 'Check out our multi-agent workflow demo!', time: '11:02 AM' }
    ]
  });
  const [chatInputText, setChatInputText] = useState('');

  const toggleGroupJoin = (id) => {
    setGroups(groups.map(g => g.id === id ? { ...g, joined: !g.joined } : g));
  };

  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDescription.trim()) return;

    const newGroupObj = {
      id: 'grp_' + Date.now(),
      name: newGroupName.trim(),
      category: newGroupCategory,
      membersCount: '1 Member (You)',
      description: newGroupDescription.trim(),
      privacy: newGroupPrivacy,
      tags: newGroupTags.split(',').map(t => t.trim()).filter(Boolean),
      joined: true,
      isAdmin: true,
      createdAt: 'Just now'
    };

    setGroups([newGroupObj, ...groups]);

    // Save created group to central cloud server
    fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroupObj)
    }).catch(err => console.error('Group cloud sync error:', err));

    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupTags('');
    setIsCreateModalOpen(false);
  };

  // Group Feed Actions
  const handleAddFeedPost = () => {
    if (!newFeedPostText.trim()) return;
    const post = {
      id: 'feed_' + Date.now(),
      author: 'David Johnson (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      time: 'Just now',
      content: newFeedPostText.trim(),
      likes: 0,
      isLiked: false,
      comments: [],
      isPinned: false
    };
    setFeedPosts([post, ...feedPosts]);
    setNewFeedPostText('');
  };

  const handleToggleLikePost = (postId) => {
    setFeedPosts(feedPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleAddCommentToPost = (postId) => {
    const text = activeCommentInput[postId];
    if (!text || !text.trim()) return;

    const newCommentObj = {
      id: 'c_' + Date.now(),
      author: 'David Johnson (You)',
      text: text.trim()
    };

    setFeedPosts(feedPosts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newCommentObj] };
      }
      return p;
    }));

    setActiveCommentInput({ ...activeCommentInput, [postId]: '' });
  };

  // Group Chat Messaging Action
  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;
    const msg = {
      id: 'd_' + Date.now(),
      user: 'David Johnson (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), msg]
    }));
    setChatInputText('');
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = !searchQuery || 
                          g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesTab = filterTab === 'ALL' || (filterTab === 'JOINED' && g.joined);

    return matchesSearch && matchesCategory && matchesTab;
  });

  const categories = [
    'ALL',
    'AI & Machine Learning',
    'SaaS Founders',
    'Web Engineering',
    'Mobile Development',
    'Executive Leadership'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. HEADER BANNER WITH CREATE GROUP BUTTON */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem 1.75rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: 0 }}>
            <Group size={24} style={{ color: 'var(--primary)' }} /> Developer Communities & Groups
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            Connect with peer developers, AI engineers, tech leaders, and SaaS founders.
          </p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 4px 14px var(--primary-glow)'
          }}
        >
          <Plus size={18} /> Create New Group
        </button>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search groups by name, topic, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 2.5rem 0.6rem 2.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Join Filter Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-hover)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setFilterTab('ALL')}
              style={{
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '700',
                background: filterTab === 'ALL' ? 'var(--bg-surface)' : 'transparent',
                color: filterTab === 'ALL' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: filterTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              All Groups ({groups.length})
            </button>
            <button 
              onClick={() => setFilterTab('JOINED')}
              style={{
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '700',
                background: filterTab === 'JOINED' ? 'var(--bg-surface)' : 'transparent',
                color: filterTab === 'JOINED' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: filterTab === 'JOINED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              My Groups ({groups.filter(g => g.joined).length})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-color)',
                background: selectedCategory === cat ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GROUPS DIRECTORY GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
        {filteredGroups.map((grp) => (
          <div 
            key={grp.id} 
            className="glass-panel" 
            style={{ 
              padding: '1.35rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justify: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-primary">{grp.category}</span>
                {grp.isAdmin && (
                  <span className="badge" style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}>
                    <Crown size={12} /> Group Creator
                  </span>
                )}
              </div>

              <h2 
                onClick={() => setActiveGroupHub(grp)}
                style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '800', 
                  marginBottom: '6px', 
                  color: 'var(--text-main)', 
                  cursor: 'pointer'
                }}
              >
                {grp.name}
              </h2>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {grp.membersCount}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {grp.privacy === 'Private' ? <Lock size={12} /> : <Globe size={12} />} {grp.privacy || 'Public'}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {grp.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button 
                onClick={() => setActiveGroupHub(grp)}
                className="btn-primary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.84rem' }}
              >
                View Hub
              </button>

              <button 
                onClick={() => toggleGroupJoin(grp.id)}
                className={grp.joined ? "btn-secondary" : "btn-outline-primary"}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.84rem' }}
              >
                {grp.joined ? <><Check size={16} /> Joined</> : <><Plus size={16} /> Join</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. CREATE GROUP MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} /> Create a Developer Community Group
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Group Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Next.js 14 & AI Builders Network"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.86rem' }}
                    >
                      <option>AI & Machine Learning</option>
                      <option>SaaS Founders</option>
                      <option>Web Engineering</option>
                      <option>Mobile Development</option>
                      <option>Executive Leadership</option>
                      <option>Open Source</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Privacy Setting</label>
                    <select
                      value={newGroupPrivacy}
                      onChange={(e) => setNewGroupPrivacy(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.86rem' }}
                    >
                      <option value="Public">Public (Anyone can join)</option>
                      <option value="Private">Private (Approval required)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Group Mission & Description *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe the purpose, focus, and guidelines for members joining your community..."
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Launch Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. GROUP HUB MODAL (INTERACTIVE GROUP FEED & GROUP CHAT) */}
      {activeGroupHub && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '980px', height: '88vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* HUB HEADER WITH GROUP FEED & GROUP CHAT TABS */}
            <div className="modal-header" style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                    {activeGroupHub.name}
                  </h2>
                  <span className="badge badge-primary">{activeGroupHub.category}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeGroupHub.membersCount} - {activeGroupHub.privacy || 'Public Community'}
                </div>
              </div>

              {/* MODE SELECTOR: GROUP FEED vs GROUP CHAT */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setHubMode('FEED')}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: hubMode === 'FEED' ? 'var(--primary)' : 'transparent',
                    color: hubMode === 'FEED' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: hubMode === 'FEED' ? '0 2px 8px var(--primary-glow)' : 'none'
                  }}
                >
                  <Layout size={16} /> Group Feed
                </button>

                <button 
                  onClick={() => setHubMode('CHAT')}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: hubMode === 'CHAT' ? '#2563eb' : 'transparent',
                    color: hubMode === 'CHAT' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: hubMode === 'CHAT' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  <MessageSquare size={16} /> Group Chat
                </button>
              </div>

              <button onClick={() => setActiveGroupHub(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* HUB BODY CONTENT */}
            <div style={{ flex: 1, overflowY: 'auto', background: hubMode === 'CHAT' ? '#0f172a' : 'var(--bg-app)' }}>
              
              {/* TAB 1: GROUP FEED */}
              {hubMode === 'FEED' && (
                <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem' }}>
                  
                  {/* Left Main Group Feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Create Group Feed Post Box */}
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <textarea 
                          rows={2}
                          placeholder={`Post an update, idea, or question to ${activeGroupHub.name}...`}
                          value={newFeedPostText}
                          onChange={(e) => setNewFeedPostText(e.target.value)}
                          style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.88rem', resize: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleAddFeedPost} className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.84rem' }}>
                          Post to Group Feed
                        </button>
                      </div>
                    </div>

                    {/* Feed Posts List */}
                    {feedPosts.map(post => (
                      <div key={post.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                        {post.isPinned && (
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Pin size={14} /> Pinned Group Announcement
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                          <img src={post.avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{post.author}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{post.time}</div>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '12px' }}>
                          {post.content}
                        </p>

                        {/* Feed Interaction Buttons */}
                        <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '8px 0', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          <button 
                            onClick={() => handleToggleLikePost(post.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: post.isLiked ? 'var(--primary)' : 'var(--text-muted)', fontWeight: post.isLiked ? '700' : '500' }}
                          >
                            <ThumbsUp size={16} fill={post.isLiked ? 'var(--primary)' : 'none'} /> {post.likes} Likes
                          </button>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageCircle size={16} /> {post.comments.length} Comments
                          </span>
                        </div>

                        {/* Comments Thread */}
                        {post.comments.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px', paddingLeft: '8px', borderLeft: '2px solid var(--border-color)' }}>
                            {post.comments.map(c => (
                              <div key={c.id} style={{ fontSize: '0.8rem', background: 'var(--bg-surface-hover)', padding: '6px 10px', borderRadius: '6px' }}>
                                <strong style={{ color: 'var(--text-main)', marginRight: '6px' }}>{c.author}:</strong>
                                <span style={{ color: 'var(--text-muted)' }}>{c.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input Bar */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="Write a comment..."
                            value={activeCommentInput[post.id] || ''}
                            onChange={(e) => setActiveCommentInput({ ...activeCommentInput, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCommentToPost(post.id)}
                            style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                          />
                          <button 
                            onClick={() => handleAddCommentToPost(post.id)}
                            className="btn-secondary" 
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                          >
                            Reply
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Right Group Rules Sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>About This Group</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                        {activeGroupHub.description}
                      </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Group Feed Rules</h3>
                      <ol style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1.1rem', margin: 0, lineHeight: '1.6' }}>
                        <li>Be respectful to peer engineers & founders.</li>
                        <li>No spam or irrelevant link farming.</li>
                        <li>High-quality tech architecture discussions.</li>
                      </ol>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: GROUP CHAT */}
              {hubMode === 'CHAT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 200px', height: '100%', color: '#f8fafc' }}>
                  
                  {/* Group Chat Channels Left Sidebar */}
                  <div style={{ background: '#1e293b', borderRight: '1px solid #334155', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '6px' }}>
                        Text Chat Channels
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {[
                          { id: 'general-chat', label: 'general-chat' },
                          { id: 'c2h-job-board', label: 'c2h-job-board' },
                          { id: 'ai-showcase', label: 'ai-showcase' }
                        ].map(ch => (
                          <button 
                            key={ch.id}
                            onClick={() => setActiveChannel(ch.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '0.84rem',
                              fontWeight: activeChannel === ch.id ? '700' : '500',
                              color: activeChannel === ch.id ? '#ffffff' : '#94a3b8',
                              background: activeChannel === ch.id ? '#334155' : 'transparent',
                              textAlign: 'left'
                            }}
                          >
                            <Hash size={16} /> {ch.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '6px' }}>
                        Voice Lounge
                      </div>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '4px', fontSize: '0.84rem', color: '#94a3b8', width: '100%', textAlign: 'left' }}>
                        <Volume2 size={16} /> Developer Lounge
                      </button>
                    </div>
                  </div>

                  {/* Group Chat Center Message Stream */}
                  <div style={{ background: '#0f172a', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Active Channel Header */}
                    <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#ffffff' }}>
                      <Hash size={20} style={{ color: '#38bdf8' }} /> {activeChannel}
                    </div>

                    {/* Messages Scroll Area */}
                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(chatMessages[activeChannel] || []).map(msg => (
                        <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <img src={msg.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ffffff' }}>{msg.user}</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{msg.time}</span>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '2px' }}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Text Input Bar */}
                    <div style={{ padding: '1rem 1.25rem', background: '#0f172a', borderTop: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '0.6rem 1rem', alignItems: 'center', gap: '10px', border: '1px solid #334155' }}>
                        <input 
                          type="text" 
                          placeholder={`Message #${activeChannel}...`}
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                          style={{ flex: 1, background: 'none', border: 'none', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                        />
                        <button onClick={handleSendChatMessage} style={{ background: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '4px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Group Chat Members Right Sidebar */}
                  <div style={{ background: '#1e293b', borderLeft: '1px solid #334155', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
                        Online Members (4)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { name: 'Dr. Marcus Vance', role: 'CTO / Admin', status: 'online' },
                          { name: 'Elena Rostova', role: 'Staff Eng', status: 'online' },
                          { name: 'Sophia Chen', role: 'AI Architect', status: 'online' },
                          { name: 'David Johnson', role: 'You', status: 'online' }
                        ].map((m, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>{m.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
