const fs = require('fs');
let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add Imports
if (!appCode.includes('BillingDashboardView')) {
  appCode = appCode.replace(
    "import SettingsView from './views/SettingsView';",
    "import SettingsView from './views/SettingsView';\nimport BillingDashboardView from './views/BillingDashboardView';\nimport CertificationView from './views/CertificationView';\nimport PaymentSuccessView from './views/PaymentSuccessView';"
  );
}

// 2. Add Routes
const routes = `          {currentView === 'messages' && <MessagesView currentUser={currentUser} />}
          {currentView === 'notifications' && <NotificationsView />}
          {currentView === 'dashboard' && <BillingDashboardView currentUser={currentUser} />}
          {currentView === 'certification' && <CertificationView currentUser={currentUser} />}
          {currentView === 'payment-success' && <PaymentSuccessView currentUser={currentUser} />}`;

appCode = appCode.replace(
  "{currentView === 'messages' && <MessagesView currentUser={currentUser} />}\n          {currentView === 'notifications' && <NotificationsView />}",
  routes
);

// If the previous replace failed because of exact whitespace, we can do a fallback
if (!appCode.includes('BillingDashboardView currentUser={currentUser}')) {
   appCode = appCode.replace(
     /{currentView === 'notifications' && <NotificationsView \/>}/g,
     `{currentView === 'notifications' && <NotificationsView />}\n          {currentView === 'dashboard' && <BillingDashboardView currentUser={currentUser} />}\n          {currentView === 'certification' && <CertificationView currentUser={currentUser} />}\n          {currentView === 'payment-success' && <PaymentSuccessView currentUser={currentUser} />}`
   );
}

// Ensure the router handles new URLs
appCode = appCode.replace(
  "['home', 'explore', 'saved', 'network', 'jobs', 'profile', 'settings', 'messages', 'notifications']",
  "['home', 'explore', 'saved', 'network', 'jobs', 'profile', 'settings', 'messages', 'notifications', 'dashboard', 'certification', 'payment-success']"
);

fs.writeFileSync('src/App.jsx', appCode, 'utf8');
console.log('patched app');

// Patch Sidebar
let sidebarCode = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
const businessLink = `
        {currentUser?.userType === 'business' && (
          <a href="/dashboard" className={\`nav-item \${currentView === 'dashboard' ? 'active' : ''}\`} onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            <span style={{color: 'var(--primary)'}}>★</span>
            <span style={{fontWeight: '700', color: 'var(--primary)'}}>Promote Ads</span>
          </a>
        )}
        {currentUser?.userType === 'developer' && (
          <a href="/certification" className={\`nav-item \${currentView === 'certification' ? 'active' : ''}\`} onClick={(e) => { e.preventDefault(); navigate('/certification'); }}>
            <span style={{color: 'var(--primary)'}}>★</span>
            <span style={{fontWeight: '700', color: 'var(--primary)'}}>Get Certified</span>
          </a>
        )}
`;

sidebarCode = sidebarCode.replace(
  "{/* New Post Button */}",
  businessLink + "\n\n      {/* New Post Button */}"
);

fs.writeFileSync('src/components/Sidebar.jsx', sidebarCode, 'utf8');
console.log('patched sidebar');
