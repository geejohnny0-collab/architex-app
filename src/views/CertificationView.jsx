import React, { useState } from 'react';
import { Award, CheckCircle, ShieldCheck, Star } from 'lucide-react';
import api from '../services/apiService';

export default function CertificationView({ currentUser }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await api.stripe.checkout({ type: 'certification' });
      if (res.url) {
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
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '1rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid var(--primary-glow)' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '2px solid var(--primary)'
        }}>
          <Award size={40} style={{ color: 'var(--primary)' }} />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Architex Certified Expert</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          Stand out to top tech companies. Pass our automated architecture and coding assessment to earn the exclusive gold badge.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', maxWidth: '400px', margin: '0 auto 2.5rem auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.05rem' }}>Rank #1 in the Developer Directory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.05rem' }}>Exclusive "Certified" Gold Badge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.05rem' }}>Bypass initial recruiter screening</span>
          </div>
        </div>

        {currentUser?.isCertified ? (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-md)', fontWeight: '700' }}>
            🎉 You are already Architex Certified!
          </div>
        ) : (
          <button className="btn-primary" onClick={handlePurchase} disabled={loading} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            {loading ? 'Processing...' : 'Get Certified ($99)'}
          </button>
        )}
      </div>
    </div>
  );
}
