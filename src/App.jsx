import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import MobileBottomNav from './components/MobileBottomNav';
import CreatePostModal from './components/CreatePostModal';
import SendProposalModal from './components/SendProposalModal';

import AuthScreen from './views/AuthScreen';
import ProfileOnboardingModal from './components/ProfileOnboardingModal';
import HomeView from './views/HomeView';
import ExploreView from './views/ExploreView';
import BusinessesView from './views/BusinessesView';
import DevelopersView from './views/DevelopersView';
import ProjectsView from './views/ProjectsView';
import MessagesView from './views/MessagesView';
import NotificationsView from './views/NotificationsView';
import JobsView from './views/JobsView';
import GroupsView from './views/GroupsView';
import AnalyticsView from './views/AnalyticsView';
import SavedView from './views/SavedView';
import SettingsView from './views/SettingsView';
import BillingDashboardView from './views/BillingDashboardView';
import CertificationView from './views/CertificationView';
import PaymentSuccessView from './views/PaymentSuccessView';
import ProfileView from './views/ProfileView';
import CreditsModal from './components/CreditsModal';

import authService from './services/authService';
import api from './services/apiService';
import socketService from './services/socketService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-main)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Something went wrong loading this view</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <pre style={{
            background: '#090d16',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            textAlign: 'left',
            maxWidth: '800px',
            overflowX: 'auto',
            marginBottom: '1.5rem'
          }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // ─── Auth State ──────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── UI State ────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activeView, setActiveView] = useState('home');
  const [activeFeedTab, setActiveFeedTab] = useState('For You');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Data State ──────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // ─── Modals ──────────────────────────────────────────────────────────────
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [targetProposalProject, setTargetProposalProject] = useState(null);

  const socketConnected = useRef(false);

  function normalizeUser(rawUser) {
    if (!rawUser) return null;
    return {
      ...rawUser,
      avatar: rawUser.avatarUrl || rawUser.avatar || '',
      cover: rawUser.coverUrl || rawUser.cover || '',
      role: rawUser.role || '',
      location: rawUser.location || '',
      website: rawUser.website || '',
      github: rawUser.github || '',
      bio: rawUser.bio || '',
      skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
      stats: rawUser.stats || {
        followers: rawUser.followersCount || 0,
        following: rawUser.followingCount || 0,
        rating: 5.0,
        completedProjects: 0,
        earningsTotal: '$0'
      }
    };
  }

  // ─── Theme ───────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleNavigate = (view) => {
    if (view === 'profile') {
      setSelectedUserId(null);
    }
    setActiveView(view);
  };

  const handleViewProfile = (targetUserId) => {
    const idToView = targetUserId || user?.id;
    if (idToView) {
      setSelectedUserId(null);
      setTimeout(() => {
        setSelectedUserId(idToView);
        setActiveView('profile');
      }, 0);
    }
  };

  // ─── Session Verification on Mount ───────────────────────────────────────
  useEffect(() => {
    async function initSession() {
      try {
        const verified = await authService.verifySession();
        if (verified) {
          setUser(normalizeUser(verified));
          if (localStorage.getItem('needs_onboarding') === 'true') {
            setShowOnboarding(true);
          }
        } else {
          const cached = authService.getCurrentUser();
          setUser(normalizeUser(cached));
        }
      } catch (err) {
        console.error('Session init error:', err);
        const cached = authService.getCurrentUser();
        setUser(normalizeUser(cached));
      } finally {
        setAuthLoading(false);
      }
    }
    initSession();
  }, []);

  // ─── Socket.io Connection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      socketConnected.current = false;
      return;
    }

    const token = authService.getToken();
    if (!token || socketConnected.current) return;

    socketService.connect(token);
    socketConnected.current = true;

    const offMessage = socketService.on('message:new', ({ conversationId, message }) => {
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
          : c
      ));
      setUnreadMessages(prev => prev + 1);
    });

    const offNotif = socketService.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadNotifications(prev => prev + 1);
    });

    return () => {
      offMessage();
      offNotif();
    };
  }, [user]);

  // ─── Load Feed Posts ──────────────────────────────────────────────────────
  const loadPosts = useCallback(async (tab = activeFeedTab, search = searchQuery) => {
    if (!user) return;
    setPostsLoading(true);
    try {
      const tabParam = {
        'For You': 'forYou', 'Following': 'following', 'Businesses': 'businesses',
        'Developers': 'developers', 'Trending': 'trending', 'AI': 'ai', 'Local': 'forYou',
      }[tab] || 'forYou';

      const params = { tab: tabParam };
      if (search?.trim()) params.search = search.trim();

      const data = await api.posts.getFeed(params);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [user, activeFeedTab, searchQuery]);

  useEffect(() => {
    if (user) loadPosts(activeFeedTab, searchQuery);
  }, [user, activeFeedTab]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => loadPosts(activeFeedTab, searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ─── Load Conversations ───────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.conversations.list();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    }
  }, [user]);

  // ─── Load Notifications ───────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.notifications.list();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadNotifications(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadNotifications();
    }
  }, [user]);

  // ─── Auth Handlers ────────────────────────────────────────────────────────
  const handleLoginSuccess = (loggedInUser) => {
    setUser(normalizeUser(loggedInUser));
  };

  const handleSignOut = () => {
    authService.logout();
    socketService.disconnect();
    socketConnected.current = false;
    setUser(null);
    setPosts([]);
    setConversations([]);
    setNotifications([]);
    setUnreadNotifications(0);
    setUnreadMessages(0);
    setActiveView('home');
  };

  // ─── Post Handlers ────────────────────────────────────────────────────────
  const handleLikeToggle = async (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    ));
    try {
      const result = await api.posts.toggleLike(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, isLiked: result.liked, likesCount: result.likesCount } : p
      ));
    } catch (err) {
      console.error('Like failed:', err);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      ));
    }
  };

  const handleSaveToggle = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  };

  const handleAddComment = async (postId, text) => {
    try {
      await api.comments.create(postId, { content: text });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ));
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleCreatePostSubmit = async (newPostData) => {
    try {
      const post = await api.posts.create({
        content: newPostData.content || '',
        category: newPostData.category || 'Developers',
        mediaUrl: newPostData.mediaUrl || newPostData.imageUrl || null,
        mediaType: newPostData.mediaType || 'image',
        codeSnippet: newPostData.codeSnippet || null,
        hasProposal: newPostData.hasProposalCTA || false,
        projectBudget: newPostData.projectBudget || null,
      });
      setPosts(prev => [{ ...post, likesCount: 0, commentsCount: 0, isLiked: false, saved: false }, ...prev]);
    } catch (err) {
      console.error('Create post failed:', err);
    }
  };

  // ─── Messages Handler ─────────────────────────────────────────────────────
  const handleSendApplicationMessage = async ({ recipientName, jobTitle, applyType, applyRate, pitch }) => {
    try {
      const { users: results } = await api.users.search({ search: recipientName, limit: 1 });
      if (!results || results.length === 0) return;
      const conv = await api.conversations.start(results[0].id);
      const content = `[JOB APPLICATION]\nRequisition: ${jobTitle}\nAgreement: ${applyType} (${applyRate})\nPitch: ${pitch || 'Interested in joining your team!'}`;
      await api.conversations.sendMessage(conv.id, { content });
      await loadConversations();
      setActiveView('messages');
    } catch (err) {
      console.error('Application message failed:', err);
    }
  };

  // ─── Proposal Handlers ────────────────────────────────────────────────────
  const handleOpenProposal = (project) => {
    setTargetProposalProject(project);
    setIsProposalModalOpen(true);
  };

  const handleSubmitProposal = async (proposalData) => {
    console.log('Proposal submitted:', proposalData);
    setIsProposalModalOpen(false);
  };

  // ─── Settings / Profile Update ────────────────────────────────────────────
  const handleUpdateUser = async (updatedFields) => {
    try {
      const { user: updated } = await api.users.updateMe(updatedFields);
      const normalized = normalizeUser(updated);
      authService.updateStoredUser(normalized);
      setUser(normalized);
      return normalized;
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  // ─── Notification Handlers ────────────────────────────────────────────────
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await api.notifications.clearAll();
      setNotifications([]);
      setUnreadNotifications(0);
    } catch (err) {
      console.error('Clear notifications failed:', err);
    }
  };

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-app)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Loading Architex…</div>
        </div>
      </div>
    );
  }

  // ─── Auth Gate ────────────────────────────────────────────────────────────
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // ─── Analytics Full-Screen ────────────────────────────────────────────────
  if (activeView === 'analytics') {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        <AnalyticsView
          onNavigate={setActiveView}
          onSendOfferMessage={handleSendApplicationMessage}
        />
      </div>
    );
  }

  if (window.location.pathname.startsWith('/payment-success')) {
    return <PaymentSuccessView currentUser={user} />;
  }

  const showRightSidebar = ['home', 'explore', 'projects', 'profile'].includes(activeView);

  return (
    <ErrorBoundary>
      <div className="app-container">
      {/* Top Header Navigation */}
      <Header
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        onSignOut={handleSignOut}
        activeView={activeView}
        onNavigate={setActiveView}
        onViewProfile={handleViewProfile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
      />

      {/* Main Page Body Layout */}
      <div className={`app-body ${showRightSidebar ? 'has-right-sidebar' : ''}`}>
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
          user={user}
        />

        {/* Center Content */}
        <main style={{ minWidth: 0 }}>
          {activeView === 'home' && (
            <HomeView
              posts={posts}
              postsLoading={postsLoading}
              activeTab={activeFeedTab}
              onTabChange={setActiveFeedTab}
              onLikeToggle={handleLikeToggle}
              onSaveToggle={handleSaveToggle}
              onAddComment={handleAddComment}
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
              onOpenProposalModal={handleOpenProposal}
              onViewProfile={handleViewProfile}
              user={user}
            />
          )}

          {activeView === 'explore' && (
            <ExploreView posts={posts} searchQuery={searchQuery} onNavigate={setActiveView} onViewProfile={handleViewProfile} />
          )}

          {activeView === 'businesses' && (
            <BusinessesView searchQuery={searchQuery} onNavigate={setActiveView} onViewProfile={handleViewProfile} />
          )}

          {activeView === 'developers' && (
            <DevelopersView searchQuery={searchQuery} onNavigate={setActiveView} onViewProfile={handleViewProfile} />
          )}

          {activeView === 'projects' && (
            <ProjectsView
              onOpenProposalModal={handleOpenProposal}
              onSendApplicationMessage={handleSendApplicationMessage}
            />
          )}

          {activeView === 'messages' && (
            <MessagesView
              currentUser={user}
              conversations={conversations}
              onConversationsChange={setConversations}
              onUnreadChange={setUnreadMessages}
              onViewProfile={handleViewProfile}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
            />
          )}

          {activeView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearNotifications}
              onViewProfile={handleViewProfile}
              onMarkRead={async (id) => {
                await api.notifications.markRead(id);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                setUnreadNotifications(prev => Math.max(0, prev - 1));
              }}
            />
          )}

          {activeView === 'jobs' && (
            <JobsView onSendApplicationMessage={handleSendApplicationMessage} />
          )}

          {activeView === 'groups' && (
            <GroupsView
              onPublishGroupPost={async (groupPost) => {
                await handleCreatePostSubmit({
                  content: groupPost.content,
                  category: `group:${groupPost.groupName}`,
                  imageUrl: groupPost.image || null,
                });
              }}
            />
          )}

          {activeView === 'saved' && (
            <SavedView
              posts={posts.filter(p => p.saved)}
              onLikeToggle={handleLikeToggle}
              onSaveToggle={handleSaveToggle}
              onAddComment={handleAddComment}
              onOpenProposalModal={handleOpenProposal}
            />
          )}

          {activeView === 'certification' && (
            <CertificationView currentUser={user} />
          )}

          {activeView === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}

          {activeView === 'profile' && (
            <ProfileView
              user={user}
              viewedUserId={selectedUserId}
              onNavigate={setActiveView}
              onViewProfile={handleViewProfile}
              onLikeToggle={handleLikeToggle}
              onSaveToggle={handleSaveToggle}
              onAddComment={handleAddComment}
              onOpenProposalModal={handleOpenProposal}
            />
          )}
        </main>

        {/* Right Sidebar Widgets */}
        {showRightSidebar && (
          <RightSidebar
            posts={posts}
            onNavigate={setActiveView}
            onViewProfile={handleViewProfile}
            onOpenProposalModal={handleOpenProposal}
          />
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        unreadMessages={unreadMessages}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Modals */}
      <ProfileOnboardingModal
        isOpen={showOnboarding}
        user={user}
        onComplete={(updatedUser) => {
          setUser(normalizeUser(updatedUser));
          setShowOnboarding(false);
        }}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePostSubmit}
        user={user}
      />

      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        user={user}
        onUpdateUser={async () => {
          const verified = await authService.verifySession();
          if (verified) setUser(normalizeUser(verified));
        }}
      />

      <SendProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        targetProject={targetProposalProject}
        onSubmitProposal={handleSubmitProposal}
      />
    </div>
    </ErrorBoundary>
  );
}
