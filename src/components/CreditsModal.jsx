import React, { useState } from 'react';
import { Zap, X, TrendingUp, Sparkles, ShoppingCart, CheckCircle } from 'lucide-react';
import api from '../services/apiService';

export default function CreditsModal({ isOpen, onClose, user, onUpdateUser }) {
  const [loading, setLoading] = useState(false);
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [mode, setMode] = useState('menu'); // 'menu' | 'buy_ad'

  if (!isOpen) return null;

  const handleBuyCredits = async () => {
    try {
      setLoading(true);
      const res = await api.stripe.checkout({ type: 'credits_1000' });
      if (res.url) window.location.href = res.url;
    } catch (e) {
      console.error(e);
      alert('Failed to initiate credit checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!headline || !description) return alert('Headline and Description required');
    try {
      setLoading(true);
      await api.credits.spend({
        action: 'buy_ad',
        adData: { headline, description, targetUrl }
      });
      alert('🎉 Sponsored Feed Ad created! 1,000 Credits deducted.');
      if (onUpdateUser) onUpdateUser();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to spend credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '480px', padding: '2rem', borderRadius: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary)' }}>
            <Zap size={22} fill="var(--primary)" /> Architex Credits Manager
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.15) 100%)',
          border: '1px solid var(--primary-glow)', borderRadius: 'var(--radius-md)',
          padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>YOUR BALANCE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={20} fill="#f59e0b" color="#f59e0b" /> {user?.credits || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Credits</span>
            </div>
          </div>
          <button onClick={handleBuyCredits} className="btn-primary" disabled={loading} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            + Buy 1,000 ($100)
          </button>
        </div>

        {/* Spend Options */}
        {mode === 'menu' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0, color: 'var(--text-muted)' }}>WHERE TO SPEND CREDITS:</h3>

            {/* Option 1: Feed Ad */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" /> Launch Feed Banner Ad
                </div>
                <span className="badge badge-primary">1,000 Credits</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                Place a custom sponsored ad banner directly in the community feed for 30 days.
              </p>
              <button onClick={() => setMode('buy_ad')} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                Create Native Ad (1,000 Credits)
              </button>
            </div>

            {/* Option 2: Boost Job */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#10b981" /> Pin &amp; Boost Job Post
                </div>
                <span className="badge badge-secondary">500 Credits</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Pin any of your job requisitions to the top of feeds to get 10x more applicant views.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Create Sponsored Feed Ad (1,000 Credits)</h3>
            
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Ad Headline *</label>
              <input type="text" required placeholder="e.g. Hiring Senior React Engineers - $180k W2" value={headline} onChange={e => setHeadline(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Ad Description *</label>
              <textarea rows="3" required placeholder="Describe your offer or role..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Target Link / Website URL</label>
              <input type="text" placeholder="https://yourcompany.com/careers" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setMode('menu')} className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Publishing...' : 'Publish Ad (Spend 1,000 Credits)'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
