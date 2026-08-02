import React, { useEffect } from 'react';

export default function InFeedVideoAd() {
  useEffect(() => {
    // Delay execution slightly to ensure the DOM element is fully painted 
    // before Google's ad crawler attempts to measure container width.
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ad-container" style={{ width: '100%', minHeight: '160px', margin: '16px 0', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-6979107957328158"
        data-ad-slot="3467556965"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
