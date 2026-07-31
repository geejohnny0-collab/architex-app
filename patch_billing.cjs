const fs = require('fs');
let content = fs.readFileSync('src/views/SettingsView.jsx', 'utf8');

const brokenBlock = `          BILLING_PLACEHOLDER}
              </div>
            </div>
          )}`;

const realBilling = `          {/* 6. BILLING AND PRO PLAN */}
          {activeSubTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', margin: 0 }}>Billing &amp; Subscription</h2>

              {/* Current plan */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: user?.isPro ? 'linear-gradient(135deg,rgba(37,99,235,0.12)0%,rgba(139,92,246,0.12)100%)' : 'var(--bg-surface-hover)', border: user?.isPro ? '1px solid var(--primary-glow)' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: user?.isPro ? 'var(--primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user?.isPro && <Sparkles size={18} />}
                    {user?.isPro ? 'Architex Pro — $29 / month' : 'Free Plan'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {user?.isPro ? 'Your Pro subscription is active.' : 'Upgrade to Pro to unlock premium features.'}
                  </div>
                </div>
                {user?.isPro
                  ? <button className="btn-secondary" style={{ fontSize: '0.82rem' }}>Manage Plan</button>
                  : <button className="btn-primary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.65, cursor: 'default' }} disabled><Sparkles size={14} /> Coming Soon</button>
                }
              </div>

              {/* Plan comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Free */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>Free</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>$0 <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Create and publish posts', 'Follow developers and businesses', 'Send and receive direct messages', 'Apply to job listings', 'Basic profile page', 'Post job requisitions'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro */}
                <div style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'linear-gradient(135deg,rgba(37,99,235,0.05)0%,rgba(139,92,246,0.05)100%)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>Pro</div>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>Coming Soon</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>$29 <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Everything in Free', 'Priority placement on proposals', 'AI-assisted post generator', 'Profile analytics and visitor insights', 'Verified Pro badge on profile', 'Priority in Developer Directory', 'Early access to new features'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ marginTop: 'auto', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.65, cursor: 'default' }} disabled>
                    <Sparkles size={14} /> Coming Soon
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Pro billing will be handled securely via Stripe. Cancel anytime — no contracts.</p>
            </div>
          )}`;

if (content.includes('BILLING_PLACEHOLDER')) {
  // Normalize line endings and replace
  content = content.replace(/          BILLING_PLACEHOLDER\}\r?\n              <\/div>\r?\n            <\/div>\r?\n          \)\}/, realBilling);
  fs.writeFileSync('src/views/SettingsView.jsx', content, 'utf8');
  console.log('Patched successfully');
} else {
  console.log('Placeholder not found - file may already be correct');
}
