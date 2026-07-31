const fs = require('fs');

const lines = fs.readFileSync('src/views/SettingsView.jsx', 'utf8').split('\n');

// Find the line where the corruption starts:
// line 437 has `onChange={(e) => setNewSkill(e.target.value)}`
let corruptionStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onChange={(e) => setNewSkill(e.target.value)}')) {
    corruptionStart = i;
    break;
  }
}

// Find where the duplicate ends and the REAL Billing section starts again
// It should be around line 621: `{/* 6. BILLING AND PRO PLAN */}`
let corruptionEnd = -1;
for (let i = corruptionStart + 1; i < lines.length; i++) {
  if (lines[i].includes('{/* 6. BILLING AND PRO PLAN */}')) {
    corruptionEnd = i;
    break;
  }
}

if (corruptionStart !== -1 && corruptionEnd !== -1) {
  // We need to inject the missing lines that were overwritten by the corruption
  const missingLines = [
    "                  </div>",
    "                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>",
    "                    {user?.isPro ? 'Your Pro subscription is active.' : 'Upgrade to Pro to unlock premium features.'}",
    "                  </div>",
    "                </div>",
    "                {user?.isPro",
    "                  ? <button className=\"btn-secondary\" style={{ fontSize: '0.82rem' }}>Manage Plan</button>",
    "                  : <button className=\"btn-primary\" onClick={handleUpgrade} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Upgrade to Pro</button>",
    "                }",
    "              </div>"
  ];

  // We are going to completely remove everything from corruptionStart to corruptionEnd
  // Wait, does the corruption End at the start of the REAL Billing section, or the DUPLICATE Billing section?
  // Because the duplicate includes 2. SECURITY, 3. APPEARANCE, 4. NOTIFS, 5. PRIVACY, 6. BILLING again.
  // So the first time we see 6. BILLING after the corruption start, it's the duplicate!
  // Wait, no. The file only has one `{/* 6. BILLING AND PRO PLAN */}` after line 437.
  // Let's verify what we remove. We should remove the lines from `onChange={(e)...` all the way down to BUT NOT INCLUDING ` {/* Plan comparison */}`.
  
  // Wait, let's look at what's AFTER line 621.
  // Line 621:           {/* 6. BILLING AND PRO PLAN */}
  // Line 643:                             {/* Plan comparison */}
  
  // It's much easier to just delete the corrupted lines, and also the duplicate `{/* 6. BILLING AND PRO PLAN */}` section, up to ` {/* Plan comparison */}`.
  
  let planComparisonLine = -1;
  for (let i = corruptionStart; i < lines.length; i++) {
    if (lines[i].includes('{/* Plan comparison */}')) {
      planComparisonLine = i;
      break;
    }
  }
  
  if (planComparisonLine !== -1) {
    // Delete from corruptionStart to planComparisonLine - 1
    const newLines = [
      ...lines.slice(0, corruptionStart),
      ...missingLines,
      ...lines.slice(planComparisonLine)
    ];
    fs.writeFileSync('src/views/SettingsView.jsx', newLines.join('\n'), 'utf8');
    console.log('Fixed SettingsView');
  } else {
    console.log('Could not find Plan comparison');
  }

} else {
  console.log('Could not find corruption boundaries');
}
