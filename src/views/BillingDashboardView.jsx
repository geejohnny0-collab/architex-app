import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Megaphone, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import api from '../services/apiService';

export default function BillingDashboardView({ currentUser }) {
  const [credits, setCredits] = useState(currentUser?.credits || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch latest user info to get real credit balance
    const fetchUser = async () => {
      try {
        const data = await api.get('/api/users/profile/' + currentUser.handle);
        if (data.user) setCredits(data.user.credits || 0);
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser?.handle) fetchUser();
  }, [currentUser]);

  const handleBuyCredits = async () => {
    try {
      setLoading(true);
      const res = await api.post('/api/stripe/checkout', { type: 'credits_1000' });
      if (res.url) {
        // Mock successful payment locally
        window.location.href = res.url;
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Monetization Dashboard</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Available Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={32} />
            {credits.toLocaleString()} <span style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Credits</span>
          </div>
        </div>
        <button className="btn-primary" onClick={handleBuyCredits} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
          {loading ? 'Processing...' : 'Buy 1,000 Credits ($100)'}
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Ways to Spend Credits</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Boost a Job</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Pin your job requisition to the top of the feed and the Jobs board for 30 days to get 5x more applicants.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700' }}>500 Credits</span>
            <button className="btn-secondary" onClick={() => alert('Select a job from your profile to boost it.')}>Boost Job</button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Megaphone size={24} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Sponsored Feed Ad</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Run a native advertisement for your developer tool, API, or service directly in the main feed for 30 days.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700' }}>1,000 Credits</span>
            <button className="btn-secondary" onClick={() => alert('Ad Campaign Manager coming soon!')}>Create Ad</button>
          </div>
        </div>
      </div>
    </div>
  );
}
