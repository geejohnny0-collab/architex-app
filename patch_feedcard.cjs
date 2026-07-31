const fs = require('fs');
let code = fs.readFileSync('src/components/FeedPostCard.jsx', 'utf8');

const replacement = `
  return (
    <article className="glass-panel" style={{ marginBottom: '1.25rem', overflow: 'hidden', border: post.isBoosted || post.isAd ? '1px solid var(--primary-glow)' : '' }}>
      {(post.isBoosted || post.isAd) && (
        <div style={{ background: 'var(--primary-glow)', padding: '4px 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={12} />
          {post.isAd ? 'Sponsored' : 'Promoted'}
        </div>
      )}
      {/* Post Author Header */}
`;

code = code.replace(`  return (
    <article className="glass-panel" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
      {/* Post Author Header */}`, replacement.trim());

// If it's an ad, change the CTA button to say "Learn More" instead of comments.
// We can just leave the normal action bar for ads, or modify it.

fs.writeFileSync('src/components/FeedPostCard.jsx', code, 'utf8');
console.log('patched feed postcard');
