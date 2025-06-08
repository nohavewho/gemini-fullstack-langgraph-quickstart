export const auth0Config = {
  domain: "dev-y1vqybc2gwjuo8dp.eu.auth0.com",
  clientId: "SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C",
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000',
    audience: "https://dev-y1vqybc2gwjuo8dp.eu.auth0.com/api/v2/",
  },
};