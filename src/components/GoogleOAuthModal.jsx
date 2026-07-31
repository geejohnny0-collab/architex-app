import React from 'react';
import { X, Chrome, Shield } from 'lucide-react';

export default function GoogleOAuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleRedirectToGoogle = () => {
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '47362985719-jqfrc1ca288i2kgpc4ribi1n93no8pf6.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(window.location.origin + '/oauth-callback.html');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '420px', padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
            <Chrome size={22} style={{ color: '#ea4335' }} /> Official Google Sign-In
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
          Redirecting to Google's official accounts login screen to verify your email and profile.
        </p>

        <button 
          onClick={handleRedirectToGoogle}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(66, 133, 244, 0.4)'
          }}
        >
          <Chrome size={20} /> Continue to accounts.google.com
        </button>

      </div>
    </div>
  );
}
