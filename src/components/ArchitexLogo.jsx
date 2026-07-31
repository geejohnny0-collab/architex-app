import React from 'react';

export default function ArchitexLogo({ height = 42, style = {} }) {
  return (
    <img 
      src="/architex-logo-clean.png" 
      alt="Architex Logo" 
      style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', display: 'block', ...style }}
    />
  );
}
