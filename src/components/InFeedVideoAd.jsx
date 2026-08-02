import React, { useEffect } from 'react';

export default function InFeedVideoAd({ 
  adSlot = "3467556965", 
  adClient = "ca-pub-6979107957328158", 
  adLayoutKey = "-6t+ed+2i-1n-4w" 
}) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense push notice:', e);
    }
  }, []);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        marginBottom: '1.25rem', 
        overflow: 'hidden', 
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        padding: '0.75rem 1rem'
      }}
    >
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        SPONSORED AD
      </div>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '120px' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        data-ad-layout-key={adLayoutKey}
      />
    </div>
  );
}
