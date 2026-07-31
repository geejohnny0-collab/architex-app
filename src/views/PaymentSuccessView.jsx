import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import api from '../services/apiService';

export default function PaymentSuccessView({ currentUser }) {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');

    if (sessionId) {
      // Trigger webhook manually since we are in local dev simulation
      api.stripe.webhook({ sessionId }).catch(console.error);
      
      // Redirect back home after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <CheckCircle size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Payment Successful!</h1>
      <p style={{ color: 'var(--text-muted)' }}>Your account has been upgraded. Redirecting...</p>
    </div>
  );
}
