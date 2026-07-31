import React, { useState } from 'react';
import authService from '../services/authService';
import api from '../services/apiService';
import { 
  Sparkles, User, Building2, ShieldCheck, Mail, Lock, ArrowRight, 
  CheckCircle2, Code, Github, Chrome, Shield, Cpu, Zap, Globe, Award, Briefcase, Users
} from 'lucide-react';
import ArchitexLogo from '../components/ArchitexLogo';
import GoogleOAuthModal from '../components/GoogleOAuthModal';

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [accountType, setAccountType] = useState('DEV'); // 'DEV' | 'BUSINESS' | 'RECRUITER'
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await api.uploadFile(file, 'avatar');
      if (res?.url) {
        setAvatarUrl(res.url);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAuthError('Avatar upload failed. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthError('');

    try {
      if (mode === 'signup') {
        const cleanHandle = handle.trim().replace(/^@/, '') || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        const signupData = {
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          password,
          handle: cleanHandle,
          accountType,
          userType: accountType.toLowerCase(),
          roleTitle: roleTitle.trim(),
          avatarUrl
        };
        const result = await authService.signup(signupData);
        if (onLoginSuccess) onLoginSuccess(result.user);
      } else {
        const loginData = { email: email.trim(), password };
        const result = await authService.login(loginData);
        if (onLoginSuccess) onLoginSuccess(result.user);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleSocialAuth = (provider) => {
    setIsGoogleModalOpen(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#090d16',
      backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(10, 102, 194, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(37, 99, 235, 0.12) 0%, transparent 45%)',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* Container Wrapper */}
      <div style={{
        width: '100%',
        maxWidth: '1140px',
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: '3.5rem',
        alignItems: 'center'
      }} className="grid-mobile-single">
        
        {/* Left Column: Comprehensive Ecosystem Copy (Businesses, Developers, Recruiters) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(10, 102, 194, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              <ShieldCheck size={16} /> ARCHITEX ENTERPRISE ECOSYSTEM
            </div>

            <ArchitexLogo height={64} showText={true} style={{ alignItems: 'flex-start' }} />

            <h1 style={{ fontSize: '2.4rem', fontWeight: '800', lineHeight: 1.15, marginTop: '1.25rem', color: '#ffffff', letterSpacing: '-0.5px' }}>
              The Unified Platform for Businesses, Software Engineers & Executive Recruiters.
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.02rem', lineHeight: 1.6, marginTop: '1rem', maxWidth: '540px' }}>
              Empowering companies to post RFPs & hire talent, developers to scale C2H contract careers, and recruiters to source verified tech candidates — all in one platform.
            </p>
          </div>

          {/* Role Value Cards for ALL 3 User Types */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>For Businesses & Employers</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Post job requisitions, publish project RFPs, hire developers, and get DUNS verified.</div>
              </div>
            </div>

            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Code size={20} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>For Developers & Software Engineers</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Build developer profiles, set C2H candidate rates, bid on RFPs, and get hired.</div>
              </div>
            </div>

            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>For Executive Recruiters & Hiring Agencies</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Access pre-indexed candidate pools, filter expected W2 salaries, and manage pipelines.</div>
              </div>
            </div>

          </div>

          {/* Institutional Trust Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.78rem', fontWeight: '600', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} color="#0a66c2" /> SOC2 256-bit Encryption</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} color="#10b981" /> Verified Company DUNS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} color="#38bdf8" /> Direct Messaging Engine</span>
          </div>

        </div>

        {/* Right Column: Fortune 500 Style Login / Sign Up Card */}
        <div style={{
          background: 'rgba(18, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '24px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button 
              type="button"
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '20px',
                border: 'none',
                background: mode === 'signup' ? 'linear-gradient(135deg, #0a66c2 0%, #2563eb 100%)' : 'transparent',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
            <button 
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '20px',
                border: 'none',
                background: mode === 'login' ? 'linear-gradient(135deg, #0a66c2 0%, #2563eb 100%)' : 'transparent',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
          </div>

          {/* One-Click Social SSO Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
            <button 
              type="button"
              onClick={() => handleSocialAuth('GitHub')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Github size={18} /> GitHub SSO
            </button>

            <button 
              type="button"
              onClick={() => {
                const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '47362985719-jqfrc1ca288i2kgpc4ribi1n93no8pf6.apps.googleusercontent.com';
                const redirectUri = encodeURIComponent(window.location.origin + '/oauth-callback.html');
                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
                window.location.href = googleAuthUrl;
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Chrome size={18} color="#ea4335" /> Connect with Google
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            OR CONTINUE WITH EMAIL
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Account Role Selector (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  SELECT ACCOUNT INTENT / ROLE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'BUSINESS', label: 'Company', icon: Building2 },
                    { id: 'DEV', label: 'Developer', icon: User },
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
                          gap: '6px',
                          padding: '0.65rem 0.4rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #0a66c2' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(10, 102, 194, 0.25)' : '#0f172a',
                          color: isSelected ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={18} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profile Avatar Upload (Sign Up Only) */}
            {mode === 'signup' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#0f172a', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} 
                    alt="Avatar preview" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0a66c2' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block' }}>Profile Picture / Company Logo</label>
                  <label style={{ fontSize: '0.75rem', color: '#38bdf8', cursor: 'pointer', fontWeight: '600', marginTop: '2px', display: 'inline-block' }}>
                    {uploadingAvatar ? 'Uploading...' : (avatarUrl ? '✓ Photo Uploaded (Change)' : '+ Upload Photo')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Inputs */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Full Name / Business Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Solutions or Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#ffffff', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Work Email *</label>
              <input 
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#ffffff', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Password *</label>
              <input 
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#ffffff', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Handle</label>
                  <input 
                    type="text"
                    placeholder="@apextech"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#ffffff', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Role / Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Founder / Engineering Director"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#ffffff', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {authError && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem 0.9rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '600' }}>
                ⚠️ {authError}
              </div>
            )}

            <button 
              type="submit"
              style={{
                marginTop: '10px',
                width: '100%',
                background: 'linear-gradient(135deg, #0a66c2 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '24px',
                padding: '0.85rem',
                fontWeight: '800',
                fontSize: '0.94rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(10, 102, 194, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              {mode === 'signup' ? 'Create Account & Enter Platform' : 'Sign In to Account'} <ArrowRight size={18} />
            </button>

          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.76rem', color: '#64748b' }}>
            Protected by Architex Enterprise Encryption & ISO 27001 Security.
          </div>

        </div>

      </div>

      {/* Google OAuth Modal */}
      <GoogleOAuthModal 
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onGoogleSuccess={onLoginSuccess}
      />

    </div>
  );
}
