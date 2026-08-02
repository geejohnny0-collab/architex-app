import React, { useEffect, useRef } from 'react';

export default function InFeedVideoAd() {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;

    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle && !pushedRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ad-container" style={{ width: '100%', minHeight: '160px', margin: '16px 0', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center', width: '100%', minHeight: '160px' }}
        data-ad-client="ca-pub-6979107957328158"
        data-ad-slot="3467556965"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
