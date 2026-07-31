const fs = require('fs');
let code = fs.readFileSync('src/views/SettingsView.jsx', 'utf8');

// The corrupted block starts at line 437: "onChange={(e) => setNewSkill..."
// But actually, it was injected exactly here:
/*
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: user?.isPro ? 'var(--primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user?.isPro && <Sparkles size={18} />}
                    {user?.isPro ? 'Architex Pro — $29 / month' : 'Free Plan'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
*/
// The injection replaced everything after `{user?.isPro ? 'Architex Pro — $29 / month' : 'Free Plan'}`

// Let's just restore the entire Billing Tab (SubTab 6) cleanly and replace whatever is there.
const billingStart = code.indexOf("{/* 6. BILLING AND PRO PLAN */}");
const billingEnd = code.indexOf("</div>\n      </div>\n    </div>\n  );\n}");

if (billingStart !== -1 && billingEnd !== -1) {
  const cleanBilling = `{/* 6. BILLING AND PRO PLAN */}
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
                  : <button className="btn-primary" onClick={handleUpgrade} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Upgrade to Pro</button>
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
                    {(user?.userType === 'business' ? ['Post job requisitions','Priority visibility in feeds','Receive comments and likes','Basic employer profile page'] : ['Create and publish posts','Follow developers and businesses','Send and receive direct messages','Apply to job listings','Basic profile page']).map(f => (
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
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>{user?.userType === 'business' ? 'Business Pro' : 'Pro'}</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>{user?.userType === 'business' ? '$199' : '$29'} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(user?.userType === 'business' ? ['Everything in Free','Direct Cold Messaging (50 InMails/mo)','"Featured" pinned Job Requisitions','Advanced Applicant AI Sorting','Verified Employer branding & video','See who Bookmarked your jobs'] : ['Everything in Free','Priority placement on proposals','Ability to comment on Business posts','Profile analytics and visitor insights','Verified Pro badge on profile','Priority in Developer Directory','Early access to new features']).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={handleUpgrade} style={{ marginTop: 'auto', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Sparkles size={14} /> Upgrade to Pro
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Pro billing will be handled securely via Stripe. Cancel anytime — no contracts.</p>
            </div>
          )}
`;

  code = code.substring(0, billingStart) + cleanBilling + '\n        ' + code.substring(billingEnd);
  fs.writeFileSync('src/views/SettingsView.jsx', code, 'utf8');
  console.log('Fixed SettingsView');
} else {
  console.log('Could not find boundaries');
}
