import React, { useState } from 'react';
import { User, Building2, ShieldCheck, Camera, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/apiService';
import authService from '../services/authService';

export default function ProfileOnboardingModal({ isOpen, user, onComplete }) {
  if (!isOpen || !user) return null;

  const [name, setName] = useState(user?.name && !user.name.includes('Google') ? user.name : '');
  const [handle, setHandle] = useState(user?.handle && !user.handle.includes('google') ? user.handle.replace(/^@/, '') : '');
  const [roleTitle, setRoleTitle] = useState(user?.role && !user.role.includes('Google') ? user.role : '');
  const [bio, setBio] = useState(user?.bio && !user.bio.includes('Google') ? user.bio : '');
  const [accountType, setAccountType] = useState('DEV');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl && !user.avatarUrl.includes('unsplash') ? user.avatarUrl : '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const res = await api.uploadFile(file, 'avatar');
      if (res?.url) setAvatarUrl(res.url);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarUrl(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) {
      setError('Please fill in your name and username handle');
      return;
    }
    setSubmitting(true);
    setError('');
    const cleanHandle = handle.trim().replace(/^@/, '');
    const userType = accountType.toLowerCase();
    const updatedProfile = {
      ...user,
      name: name.trim(),
      handle: `@${cleanHandle}`,
      userType,
      type: userType,
      role: roleTitle.trim() || (userType === 'business' ? 'Company Enterprise' : 'Software Architect'),
      bio: bio.trim(),
      avatarUrl: avatarUrl || '',
      avatar: avatarUrl || '',
    };
    try {
      try {
        await api.users.updateMe({
          name: updatedProfile.name,
          handle: cleanHandle,
          role: updatedProfile.role,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatarUrl,
          userType: updatedProfile.userType
        });
      } catch (err) {
        console.warn('Backend updateMe fallback to local session:', err);
      }
      authService.updateStoredUser(updatedProfile);
      localStorage.setItem('architex_current_user', JSON.stringify(updatedProfile));
      localStorage.removeItem('needs_onboarding');
      if (onComplete) onComplete(updatedProfile);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Full-screen overlay */
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px',
    }}>
      {/* Modal shell — fixed height so button never gets pushed off screen */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          /* Use dvh for accuracy on mobile; fall back to vh */
          height: 'min(700px, calc(100dvh - 32px))',
          borderRadius: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',   /* clip children; scrolling handled inside */
        }}
      >
        {/* ── Scrollable content area ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem 1.5rem 0',
          /* Smooth momentum scrolling on iOS */
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '999px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px'
            }}>
              <Sparkles size={14} /> ACCOUNT SETUP
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '2px 0', color: 'var(--text-main)' }}>
              Create Your Profile
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Set your name, username, title, and photo.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.6rem', borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.85rem', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Form fields (no submit here — button lives outside the scroll area) */}
          <form id="onboarding-form" onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '1rem' }}>

            {/* Profile Picture */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'var(--bg-surface-hover)', padding: '10px 14px',
              borderRadius: '14px', border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--bg-surface)', border: '2px dashed var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Camera size={24} style={{ color: 'var(--primary)' }} />
                }
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>
                  Profile Photo / Company Logo
                </label>
                <label style={{ fontSize: '0.76rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', marginTop: '2px', display: 'inline-block' }}>
                  {uploadingAvatar ? 'Uploading...' : avatarUrl ? '✓ Uploaded — click to change' : '+ Upload Photo'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                SIGN UP AS *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'DEV', label: 'Developer', icon: User },
                  { id: 'BUSINESS', label: 'Business', icon: Building2 },
                  { id: 'RECRUITER', label: 'Recruiter', icon: ShieldCheck },
                ].map(({ id, label, icon: Icon }) => {
                  const sel = accountType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAccountType(id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        padding: '0.55rem 0.35rem', borderRadius: '10px',
                        border: sel ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                        background: sel ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
                        color: sel ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: '800', fontSize: '0.76rem'
                      }}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Full Name / Business Name *
              </label>
              <input
                type="text" required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Username */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Username / Handle *
              </label>
              <input
                type="text" required
                placeholder="e.g. username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Professional Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Software Architect, Design Studio, Lead Recruiter"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Bio / Overview
              </label>
              <textarea
                placeholder="Short description of your background or company..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

          </form>
        </div>

        {/* ── Fixed bottom button — OUTSIDE the scroll area ── */}
        <div style={{
          flexShrink: 0,
          padding: '0.85rem 1.5rem 1.2rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
        }}>
          <button
            type="submit"
            form="onboarding-form"
            className="btn-primary"
            disabled={submitting}
            style={{
              width: '100%', padding: '0.8rem',
              fontSize: '0.9rem', fontWeight: '800',
              borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {submitting ? 'Saving Profile...' : 'Create Profile'} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
