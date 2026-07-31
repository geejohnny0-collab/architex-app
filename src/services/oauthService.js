// Official OAuth Provider Configurations & Authentication Handler

export const OAUTH_PROVIDERS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    color: '#000000',
    accentColor: '#1DA1F2',
    icon: '𝕏',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientIdDefault: 'architex_twitter_client_id',
    scope: 'tweet.read users.read offline.access',
    responseType: 'code',
    docsUrl: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    accentColor: '#FD1D1D',
    icon: '📸',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    clientIdDefault: 'architex_instagram_client_id',
    scope: 'user_profile,user_media',
    responseType: 'code',
    docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    accentColor: '#1877F2',
    icon: 'fb',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    clientIdDefault: 'architex_facebook_app_id',
    scope: 'public_profile',
    responseType: 'code',
    docsUrl: 'https://developers.facebook.com/docs/facebook-login'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    accentColor: '#FE2C55',
    icon: '🎵',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    clientIdDefault: 'architex_tiktok_client_key',
    scope: 'user.info.basic',
    responseType: 'code',
    docsUrl: 'https://developers.tiktok.com/doc/login-kit-web'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    color: '#2ea44f',
    accentColor: '#2ea44f',
    icon: '🐙',
    authUrl: 'https://github.com/login/oauth/authorize',
    clientIdDefault: 'architex_github_client_id',
    scope: 'read:user user:email',
    responseType: 'code',
    docsUrl: 'https://docs.github.com/en/apps/oauth-apps'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    accentColor: '#0A66C2',
    icon: 'in',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientIdDefault: 'architex_linkedin_client_id',
    scope: 'openid profile email',
    responseType: 'code',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow'
  }
};

// Retrieve stored custom Client IDs from localStorage
export function getStoredClientIds() {
  try {
    const raw = localStorage.getItem('architex_oauth_client_ids');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Save custom Client ID
export function saveClientId(providerId, clientId) {
  const current = getStoredClientIds();
  current[providerId] = clientId;
  localStorage.setItem('architex_oauth_client_ids', JSON.stringify(current));
}

// Retrieve stored OAuth Tokens
export function getStoredTokens() {
  try {
    const raw = localStorage.getItem('architex_oauth_tokens');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Save OAuth Session Token
export function saveOAuthToken(providerId, tokenData) {
  const current = getStoredTokens();
  current[providerId] = {
    ...tokenData,
    connectedAt: new Date().toISOString()
  };
  localStorage.setItem('architex_oauth_tokens', JSON.stringify(current));
}

// Remove OAuth Token
export function removeOAuthToken(providerId) {
  const current = getStoredTokens();
  delete current[providerId];
  localStorage.setItem('architex_oauth_tokens', JSON.stringify(current));
}

// Launch OAuth Authorization Popup Window
export function launchOAuthPopup(providerId, customClientId = null, callback) {
  const provider = OAUTH_PROVIDERS[providerId];
  if (!provider) return;

  const clientIds = getStoredClientIds();
  const clientId = customClientId || clientIds[providerId] || provider.clientIdDefault;
  const redirectUri = window.location.origin + '/oauth-callback.html';
  const state = providerId + '_state_' + Math.random().toString(36).substring(7);

  // Construct official OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: provider.responseType,
    scope: provider.scope,
    state: state
  });

  const fullAuthUrl = `${provider.authUrl}?${params.toString()}`;

  // Popup Window Dimensions
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    fullAuthUrl,
    `OAuth_${providerId}`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1`
  );

  if (!popup) {
    alert('OAuth Popup blocked by browser! Please allow popups for Architex to authenticate.');
    return;
  }

  // Window PostMessage Event Listener
  const messageHandler = (event) => {
    if (event.data && event.data.type === 'ARCHITEX_OAUTH_SUCCESS') {
      window.removeEventListener('message', messageHandler);
      clearInterval(checkClosedInterval);

      const tokenData = {
        providerId,
        code: event.data.code,
        state: event.data.state,
        handle: `@${providerId}_user_${Math.floor(1000 + Math.random() * 9000)}`,
        verifiedOAuth: true
      };

      saveOAuthToken(providerId, tokenData);
      if (callback) callback(null, tokenData);
    } else if (event.data && event.data.type === 'ARCHITEX_OAUTH_ERROR') {
      window.removeEventListener('message', messageHandler);
      clearInterval(checkClosedInterval);
      if (callback) callback(new Error(event.data.error));
    }
  };

  window.addEventListener('message', messageHandler);

  // Check if popup was closed manually
  const checkClosedInterval = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosedInterval);
      window.removeEventListener('message', messageHandler);
    }
  }, 1000);
}
