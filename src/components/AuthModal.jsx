import React, { useState } from 'react';
import { X, Sparkles, User, Building2, ShieldCheck, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';
import ArchitexLogo from './ArchitexLogo';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [accountType, setAccountType] = useState('DEV'); // 'DEV' | 'BUSINESS' | 'RECRUITER'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    let userObj;
    if (mode === 'signup') {
      const generatedHandle = handle.trim() ? (handle.startsWith('@') ? handle.trim() : '@' + handle.trim()) : '@' + email.split('@')[0];
      const defaultRole = roleTitle.trim() || (accountType === 'DEV' ? 'Software Developer' : accountType === 'BUSINESS' ? 'Business Founder' : 'Executive Recruiter');

      userObj = {
        id: 'usr_' + Date.now(),
        name: name.trim() || email.split('@')[0],
        handle: generatedHandle,
        email: email.trim(),
        type: accountType,
        role: defaultRole,
        verified: true,
        avatar: accountType === 'BUSINESS' 
          ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        bio: accountType === 'DEV' ? 'Software Developer building modern high-performance web applications.' : 'Verified Enterprise Hiring Partner.',
        location: 'Remote',
        website: 'https://architex.dev',
        github: 'github.com/' + (generatedHandle.replace('@', '')),
        skills: ['React 14', 'TypeScript', 'Node.js', 'PostgreSQL'],
        stats: { followers: 1, following: 12, rating: 5.0, earningsTotal: '$0', completedProjects: 0 }
      };

      // Persist to localStorage
      try {
        const storedUsers = JSON.parse(localStorage.getItem('architex_registered_users') || '[]');
        storedUsers.push(userObj);
        localStorage.setItem('architex_registered_users', JSON.stringify(storedUsers));
        localStorage.setItem('architex_current_user', JSON.stringify(userObj));
      } catch (err) {
        console.error('Storage error:', err);
      }
    } else {
      // Login Mode
      userObj = {
        id: 'usr_me',
        name: email.split('@')[0],
        handle: '@' + email.split('@')[0],
        email: email.trim(),
        type: 'DEV',
        role: 'Verified Architex User',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        bio: 'Verified Architex account user.',
        location: 'Remote',
        website: 'https://architex.dev',
        github: 'github.com',
        skills: ['Full-Stack', 'React', 'Node.js'],
        stats: { followers: 5, following: 20, rating: 5.0, earningsTotal: '$12,000', completedProjects: 2 }
      };
      localStorage.setItem('architex_current_user', JSON.stringify(userObj));
    }

    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArchitexLogo height={34} showText={true} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                {mode === 'signup' ? 'Create Architex Account' : 'Welcome Back'}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {mode === 'signup' ? 'Join developers, hiring managers & recruiters live' : 'Sign in to access your dashboard'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Mode Switcher Buttons */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-hover)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: mode === 'signup' ? 'var(--primary)' : 'transparent',
                  color: mode === 'signup' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
              <button 
                type="button"
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: mode === 'login' ? 'var(--primary)' : 'transparent',
                  color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Log In
              </button>
            </div>

            {/* Account Type Selection (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  I AM JOINING AS A:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'DEV', label: 'Developer', icon: User },
                    { id: 'BUSINESS', label: 'Company', icon: Building2 },
                    { id: 'RECRUITER', label: 'Recruiter', icon: ShieldCheck }
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = accountType === type.id;
                    return (
                      <button 
                        key={type.id}
                        type="button"
                        onClick={() => setAccountType(type.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.6rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.78rem'
                        }}
                      >
                        <Icon size={16} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inputs */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
              <input 
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Password *</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
              />
            </div>

            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Username Handle</label>
                  <input 
                    type="text"
                    placeholder="@alexj"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Title / Role</label>
                  <input 
                    type="text"
                    placeholder="e.g. React Lead"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {mode === 'signup' ? 'Create Account & Sign In' : 'Sign In'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
