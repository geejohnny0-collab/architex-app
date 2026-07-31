const fs = require('fs');

let settingsCode = fs.readFileSync('src/views/SettingsView.jsx', 'utf8');

// 1. Add api import if missing
if (!settingsCode.includes("import api from '../services/apiService';")) {
  settingsCode = settingsCode.replace(
    "import { Bell, Lock, User, Shield, Briefcase, Eye, LogOut, CheckCircle, Smartphone, Globe, Upload, HelpCircle, FileText, ChevronRight, Sparkles } from 'lucide-react';",
    "import { Bell, Lock, User, Shield, Briefcase, Eye, LogOut, CheckCircle, Smartphone, Globe, Upload, HelpCircle, FileText, ChevronRight, Sparkles } from 'lucide-react';\nimport api from '../services/apiService';"
  );
}

// 2. Inject handleUpgrade function before return
if (!settingsCode.includes("const handleUpgrade = async")) {
  const upgradeFunc = `
  const handleUpgrade = async () => {
    try {
      const type = user?.userType === 'business' ? 'business_pro_monthly' : 'pro_monthly';
      const res = await api.post('/api/stripe/checkout', { type });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    }
  };
  `;
  settingsCode = settingsCode.replace("return (", upgradeFunc + "\n  return (");
}

// 3. Replace "Coming Soon" disabled buttons with actual checkout buttons
settingsCode = settingsCode.replace(
  /<button className="btn-primary" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.65, cursor: 'default' }} disabled><Sparkles size={14} \/> Coming Soon<\/button>/g,
  `<button className="btn-primary" onClick={handleUpgrade} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Upgrade to Pro</button>`
);

settingsCode = settingsCode.replace(
  /<button className="btn-primary" style={{ marginTop: 'auto', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.65, cursor: 'default' }} disabled>\s*<Sparkles size={14} \/> Coming Soon\s*<\/button>/g,
  `<button className="btn-primary" onClick={handleUpgrade} style={{ marginTop: 'auto', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={14} /> Upgrade to Pro</button>`
);

// 4. Remove the "Coming Soon" badge at the top of the Pro card
settingsCode = settingsCode.replace(
  /<span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>Coming Soon<\/span>/g,
  ""
);

fs.writeFileSync('src/views/SettingsView.jsx', settingsCode, 'utf8');
console.log('patched settings view');
