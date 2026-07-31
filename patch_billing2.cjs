const fs = require('fs');
let code = fs.readFileSync('src/views/SettingsView.jsx', 'utf8');

const businessFree = ['Post job requisitions', 'Priority visibility in feeds', 'Receive comments and likes', 'Basic employer profile page'];
const businessPro = ['Everything in Free', 'Direct Cold Messaging (50 InMails/mo)', '"Featured" pinned Job Requisitions', 'Advanced Applicant AI Sorting', 'Verified Employer branding & video', 'See who Bookmarked your jobs'];
const devFree = ['Create and publish posts', 'Follow developers and businesses', 'Send and receive direct messages', 'Apply to job listings', 'Basic profile page'];
const devPro = ['Everything in Free', 'Priority placement on proposals', 'Ability to comment on Business posts', 'Profile analytics and visitor insights', 'Verified Pro badge on profile', 'Priority in Developer Directory', 'Early access to new features'];

const bFreeStr = businessFree.map(x=>"'" + x + "'").join(',');
const bProStr = businessPro.map(x=>"'" + x + "'").join(',');
const dFreeStr = devFree.map(x=>"'" + x + "'").join(',');
const dProStr = devPro.map(x=>"'" + x + "'").join(',');

const replacementBlock = `              {/* Plan comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Free */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>Free</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>$0 <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(user?.userType === 'business' ? [${bFreeStr}] : [${dFreeStr}]).map(f => (
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
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>Coming Soon</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>{user?.userType === 'business' ? '$199' : '$29'} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/month</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(user?.userType === 'business' ? [${bProStr}] : [${dProStr}]).map(f => (
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
              </div>`;

const startIdx = code.indexOf('{/* Plan comparison */}');
const endIdx = code.indexOf('<p style={{ fontSize: \'0.78rem\'');

if (startIdx !== -1 && endIdx !== -1) {
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  code = before + replacementBlock + '\n\n              ' + after;
  fs.writeFileSync('src/views/SettingsView.jsx', code, 'utf8');
  console.log('patched');
} else {
  console.log('could not find indices', startIdx, endIdx);
}
