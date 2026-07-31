import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export default function FeedVideoAdCard({ adData }) {
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Default Google Video Ad Data if not provided
  const ad = adData || {
    advertiserName: 'Google Cloud Platform',
    advertiserAvatar: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=100&q=80',
    sponsorLabel: 'Promoted by Google Ads',
    headline: 'Build & Scale Enterprise AI Apps on Google Cloud',
    description: 'Get $300 in free credits to build, deploy, and scale high-performance AI models and full-stack web applications on Google Cloud Platform.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ctaText: 'Claim $300 Credits',
    ctaUrl: 'https://cloud.google.com'
  };

  useEffect(() => {
    // If Google AdSense script is present on the page, initialize AdSense slots
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // AdSense script placeholder fallback
    }
  }, []);

  return (
    <article className="glass-panel" style={{
      marginBottom: '1.25rem',
      overflow: 'hidden',
      border: '1.5px solid rgba(59, 130, 246, 0.4)',
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Sponsored Header Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.2) 50%, rgba(234, 67, 53, 0.2) 100%)',
        padding: '6px 1.25rem',
        fontSize: '0.78rem',
        fontWeight: '800',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        letterSpacing: '0.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: '#4285f4' }} /> {ad.sponsorLabel}
        </div>
        <span style={{ fontSize: '0.7rem', opacity: 0.85, background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '999px' }}>
          Google Video Ad
        </span>
      </div>

      {/* Post Author / Advertiser Header */}
      <div style={{ padding: '1rem 1.25rem 0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={ad.advertiserAvatar} 
            alt={ad.advertiserName}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4285f4' }} 
          />
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {ad.advertiserName}
              <ShieldCheck size={16} style={{ color: '#4285f4' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@googlecloud • Sponsored</div>
          </div>
        </div>

        <a 
          href={ad.ctaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            fontSize: '0.82rem',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none'
          }}
        >
          {ad.ctaText} <ExternalLink size={14} />
        </a>
      </div>

      {/* Ad Description Copy */}
      <div style={{ padding: '0 1.25rem 0.85rem 1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', margin: '0 0 4px 0' }}>
          {ad.headline}
        </h4>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {ad.description}
        </p>
      </div>

      {/* Video Ad Player */}
      <div style={{ position: 'relative', width: '100%', background: '#000000', maxHeight: '420px', overflow: 'hidden' }}>
        {ad.videoUrl ? (
          <video 
            src={ad.videoUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
          />
        ) : (
          /* Google AdSense Video Slot Container */
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-0000000000000000"
                 data-ad-slot="0000000000"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
        )}

        {/* Video Controls Overlay */}
        {ad.videoUrl && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            <button 
              onClick={() => setMuted(!muted)}
              style={{
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
              title={muted ? 'Unmute Video' : 'Mute Video'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA Action Bar */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-surface-hover)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Sponsored by Google AdSense &amp; Google Cloud
        </span>

        <a 
          href={ad.ctaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4285f4', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Visit Website <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
