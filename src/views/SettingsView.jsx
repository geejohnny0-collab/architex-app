import React, { useState } from 'react';
import { Bell, Lock, User, Shield, Briefcase, Eye, LogOut, CheckCircle, Smartphone, Globe, Upload, HelpCircle, FileText, ChevronRight, Sparkles, Key, Sun, Moon, Save } from 'lucide-react';
import api from '../services/apiService';
import authService from '../services/authService';

export default function SettingsView({ currentUser, onLogout, theme, onToggleTheme }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [user, setUser] = useState(currentUser);
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState(user?.skills || []);
  
  const [userType, setUserType] = useState(user?.userType || 'developer');
  
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pushDirectMessages, setPushDirectMessages] = useState(true);
  const [pushProposals, setPushProposals] = useState(true);
  const [pushLikes, setPushLikes] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const cleanHandle = handle.replace(/^@/, '').trim();
      const res = await api.users.updateMe({ name: name.trim(), handle: cleanHandle, bio, avatarUrl, skills, userType });
      if (res?.user) {
        setUser(res.user);
        authService.updateStoredUser(res.user);
      }
      alert('Profile updated to ' + (userType === 'business' ? 'Company Enterprise' : 'Developer') + ' successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      alert(err.message || 'Failed to save profile');
    }
  };

  const handleUpgrade = async () => {
    try {
      const type = user?.userType === 'business' ? 'business_pro_monthly' : 'pro_monthly';
      const res = await api.stripe.checkout({ type });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Account Settings</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'profile', label: 'Public Profile', icon: <User size={18} /> },
            { id: 'security', label: 'Account & Security', icon: <Lock size={18} /> },
            { id: 'appearance', label: 'Appearance', icon: <Eye size={18} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
            { id: 'billing', label: 'Billing & Pro', icon: <Briefcase size={18} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: activeSubTab === tab.id ? 'var(--primary-light)' : 'transparent',
                color: activeSubTab === tab.id ? 'var(--primary)' : 'var(--text-main)',
                border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeSubTab === tab.id ? '700' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}
              {tab.label}
              {activeSubTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }} />
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}>
            <LogOut size={18} /> Log Out
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          {/* 1. PUBLIC PROFILE TAB */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Edit Public Profile
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <img 
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0a66c2&color=fff&bold=true`} 
                  alt="Avatar" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: 'fit-content'
                  }}>
                    <Upload size={16} /> {uploadingAvatar ? 'Uploading to Cloudinary...' : '📷 Choose Photo from Library'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setUploadingAvatar(true);
                        try {
                          const res = await api.uploadFile(file, 'avatar');
                          if (res?.url) setAvatarUrl(res.url);
                        } catch (err) {
                          console.error('Avatar upload failed:', err);
                          const reader = new FileReader();
                          reader.onload = (ev) => setAvatarUrl(ev.target.result);
                          reader.readAsDataURL(file);
                        } finally {
                          setUploadingAvatar(false);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG or WEBP. Max 10MB.</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Display Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Account Classification</label>
                  <select 
                    value={userType} 
                    onChange={(e) => setUserType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                  >
                    <option value="business">🏢 Company / Business Enterprise (Post Jobs & RFPs)</option>
                    <option value="developer">💻 Software Developer / Tech Creator</option>
                    <option value="recruiter">🎯 Recruiter / Talent Specialist</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Username / Handle</label>
                  <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Bio</label>
                <textarea rows="4" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Skills & Technologies</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {skills.map(skill => (
                    <span key={skill} className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>&times;</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Add a new skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                  <button type="button" onClick={handleAddSkill} className="btn-secondary" style={{ padding: '0.45rem 1rem' }}>+ Add Skill</button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary"><Save size={16} /> Save Profile Changes</button>
              </div>
            </form>
          )}

          {/* 2. ACCOUNT & SECURITY TAB */}
          {activeSubTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Account Security</h2>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                  <button onClick={() => alert('Verification email sent!')} className="btn-secondary">Update Email</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. APPEARANCE TAB */}
          {activeSubTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Appearance</h2>
              <button onClick={onToggleTheme} className="btn-secondary">Toggle Theme</button>
            </div>
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {activeSubTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Notifications</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Push Messages</span><input type="checkbox" checked={pushDirectMessages} onChange={e => setPushDirectMessages(e.target.checked)} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Push Proposals</span><input type="checkbox" checked={pushProposals} onChange={e => setPushProposals(e.target.checked)} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Push Likes</span><input type="checkbox" checked={pushLikes} onChange={e => setPushLikes(e.target.checked)} /></div>
            </div>
          )}

          {/* 5. PRIVACY TAB */}
          {activeSubTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Privacy</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Public Profile</span><input type="checkbox" checked={publicProfile} onChange={e => setPublicProfile(e.target.checked)} /></div>
            </div>
          )}

          {/* 6. BILLING AND PRO PLAN */}
          {activeSubTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', margin: 0 }}>Billing &amp; Subscription</h2>

              {/* Current plan */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: user?.isPro ? 'linear-gradient(135deg,rgba(37,99,235,0.12)0%,rgba(139,92,246,0.12)100%)' : 'var(--bg-surface-hover)', border: user?.isPro ? '1px solid var(--primary-glow)' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: user?.isPro ? 'var(--primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user?.isPro && <Sparkles size={18} />}
                    {user?.isPro ? 'Architex Pro — $29 / month' : 'Free Plan'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {user?.isPro ? 'Your Pro subscription is active.' : 'Upgrade to Pro to unlock premium features.'}
                  </div>
                </div>
                {user?.isPro
                  ? <button className="btn-secondary" style={{ fontSize: '0.82rem' }}>Manage Plan</button>
                  : <button className="btn-primary" onClick={handleUpgrade} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Upgrade to Pro</button>
                }
              </div>

              {/* Plan comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Free */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>Free</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>$0 <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(user?.userType === 'business' ? ['Post job requisitions','Priority visibility in feeds','Receive comments and likes','Basic employer profile page'] : ['Create and publish posts','Follow developers and businesses','Send and receive direct messages','Apply to job listings','Basic profile page']).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro */}
                <div style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'linear-gradient(135deg,rgba(37,99,235,0.05)0%,rgba(139,92,246,0.05)100%)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>{user?.userType === 'business' ? 'Business Pro' : 'Pro'}</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>{user?.userType === 'business' ? '$199' : '$29'} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(user?.userType === 'business' ? ['Everything in Free','Direct Cold Messaging (50 InMails/mo)','"Featured" pinned Job Requisitions','Advanced Applicant AI Sorting','Verified Employer branding & video','See who Bookmarked your jobs'] : ['Everything in Free','Priority placement on proposals','Ability to comment on Business posts','Profile analytics and visitor insights','Verified Pro badge on profile','Priority in Developer Directory','Early access to new features']).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={handleUpgrade} style={{ marginTop: 'auto', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Sparkles size={14} /> Upgrade to Pro
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Pro billing will be handled securely via Stripe. Cancel anytime — no contracts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
