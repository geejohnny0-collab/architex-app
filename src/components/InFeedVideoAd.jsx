import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

const AD_SPONSORS = [
  {
    brand: 'Google Cloud Platform',
    avatar: 'https://ui-avatars.com/api/?name=Google+Cloud&background=4285f4&color=fff&bold=true',
    title: '$300 Free Credits for Cloud Architects & Developers',
    description: 'Build, scale, and deploy full-stack applications with AI models and global database infrastructure.',
    cta: 'Claim $300 Credits',
    url: 'https://cloud.google.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    brand: 'NVIDIA AI Developer Network',
    avatar: 'https://ui-avatars.com/api/?name=NVIDIA+AI&background=76b900&color=fff&bold=true',
    title: 'Accelerate Enterprise LLM & GPU Inference',
    description: 'Deploy real-time AI agents and high-performance neural networks with zero latency.',
    cta: 'Explore NVIDIA AI',
    url: 'https://developer.nvidia.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    brand: 'Amazon Web Services (AWS)',
    avatar: 'https://ui-avatars.com/api/?name=AWS+Cloud&background=ff9900&color=fff&bold=true',
    title: 'Serverless PostgreSQL & Global Edge Deployment',
    description: 'Instantly provision scalable microservices, compute instances, and encrypted storage.',
    cta: 'Start Free Tier',
    url: 'https://aws.amazon.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  }
];

export default function InFeedVideoAd({ adSlot, adClient = "ca-pub-6979107957328158", adIndex = 0 }) {
  const sponsor = AD_SPONSORS[adIndex % AD_SPONSORS.length];
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const adContainerRef = useRef(null);

  // Initialize Google AdSense if client and slot are provided
  useEffect(() => {
    if (adClient && adSlot && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push notice:', e);
      }
    }
  }, [adClient, adSlot]);

  // Auto-play / pause based on viewport visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    if (adContainerRef.current) {
      observer.observe(adContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={adContainerRef}
      className="glass-panel" 
      style={{ 
        marginBottom: '1.25rem', 
        overflow: 'hidden', 
        border: '1px solid var(--primary-glow)',
        background: 'var(--bg-surface)'
      }}
    >
      {/* Google AdSense Dynamic Slot Container (if configured) */}
      {adClient && adSlot ? (
        <div style={{ padding: '0.5rem', textAlign: 'center' }}>
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
          />
        </div>
      ) : null}

      {/* Native In-Feed Video Ad Component */}
      <div style={{ padding: '1rem 1.25rem 0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={sponsor.avatar} 
            alt={sponsor.brand} 
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {sponsor.brand}
              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                <Sparkles size={10} /> Sponsored Video
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Verified Google Ad Network Partner</div>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          AD
        </span>
      </div>

      {/* Ad Description */}
      <div style={{ padding: '0 1.25rem 0.75rem 1.25rem', fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '600', lineHeight: 1.4 }}>
        {sponsor.title} — <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>{sponsor.description}</span>
      </div>

      {/* Video Ad Player */}
      <div style={{ position: 'relative', width: '100%', background: '#000000', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video 
          ref={videoRef}
          src={sponsor.videoUrl}
          loop
          muted={isMuted}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={togglePlay}
        />

        {/* Video Overlay Controls */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <button 
            onClick={togglePlay}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
          </button>

          <button 
            onClick={toggleMute}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {isMuted ? 'Unmute Sound' : 'Mute Sound'}
          </button>
        </div>
      </div>

      {/* Ad Call-to-Action Bar */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-surface-hover)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Google Ad Safety Verified
        </div>

        <a 
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            padding: '0.5rem 1.25rem',
            fontSize: '0.84rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: '700',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {sponsor.cta} <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
