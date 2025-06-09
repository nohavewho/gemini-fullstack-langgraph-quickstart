const AUTH0_DOMAIN = 'dev-y1vqybc2gwjuo8dp.eu.auth0.com';
const AUTH0_CLIENT_ID = 'SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C';

export const auth0Config = {
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : 'https://airesearchprojects.com/callback',
    scope: 'openid profile email'
  },
  useRefreshTokens: true,
  cacheLocation: 'localstorage' as const
};