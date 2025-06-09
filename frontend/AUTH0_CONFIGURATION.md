# Auth0 Configuration Guide

## Application Settings

### Basic Information
- **Application Name**: AI Research Projects
- **Application Type**: Single Page Application
- **Domain**: `dev-y1vqybc2gwjuo8dp.eu.auth0.com` (or your custom domain)

### Application URIs

#### Allowed Callback URLs
Add all these URLs (comma-separated):
```
https://airesearchprojects.com/callback,
https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app/callback,
https://gemini-fullstack-langgraph-quickstart-2nhhqdroz.vercel.app/callback,
https://gemini-fullstack-langgraph-quickstart.vercel.app/callback,
http://localhost:5173/callback,
http://localhost:3000/callback
```

#### Allowed Logout URLs
```
https://airesearchprojects.com/login,
https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app/login,
https://gemini-fullstack-langgraph-quickstart-2nhhqdroz.vercel.app/login,
https://gemini-fullstack-langgraph-quickstart.vercel.app/login,
http://localhost:5173/login,
http://localhost:3000/login
```

#### Allowed Web Origins
```
https://airesearchprojects.com,
https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app,
https://gemini-fullstack-langgraph-quickstart-2nhhqdroz.vercel.app,
https://gemini-fullstack-langgraph-quickstart.vercel.app,
http://localhost:5173,
http://localhost:3000
```

#### Allowed Origins (CORS)
Same as Web Origins above.

### Social Connections

Enable the following social connections:

1. **Google** (`google-oauth2`)
   - Client ID and Secret from Google Cloud Console
   - Scopes: email, profile, openid

2. **Facebook** (`facebook`)
   - App ID and Secret from Facebook Developers
   - Scopes: email, public_profile

3. **VKontakte** (Custom Social Connection)
   - Create custom OAuth2 connection
   - Authorization URL: `https://oauth.vk.com/authorize`
   - Token URL: `https://oauth.vk.com/access_token`
   - Scopes: email

4. **Yandex** (Custom Social Connection)
   - Create custom OAuth2 connection
   - Authorization URL: `https://oauth.yandex.ru/authorize`
   - Token URL: `https://oauth.yandex.ru/token`
   - Scopes: login:email login:info

### Token Settings

- **ID Token Expiration**: 36000 seconds (10 hours)
- **Refresh Token Rotation**: Enabled
- **Refresh Token Expiration (Inactive)**: 1296000 seconds (15 days)
- **Refresh Token Expiration (Absolute)**: 2592000 seconds (30 days)

### Advanced Settings

- **Grant Types**: 
  - ✅ Authorization Code
  - ✅ Refresh Token
  - ✅ Implicit (for legacy support)

- **Token Endpoint Authentication Method**: Post

### Custom Domain Setup (if using auth.airesearchprojects.com)

1. Go to **Branding > Custom Domains**
2. Add domain: `auth.airesearchprojects.com`
3. Verify domain ownership (CNAME record)
4. Update your application to use the custom domain

### Environment Variables

Create `.env.local` file:
```env
VITE_AUTH0_DOMAIN=dev-y1vqybc2gwjuo8dp.eu.auth0.com
VITE_AUTH0_CLIENT_ID=SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C
VITE_AUTH0_CLIENT_SECRET=mSsy3Fob97PbxaRgxgsWLEHvLj5tJTnJ-l3vbUBW0DCkrDKuGaJ7UPo3Xq9nqRRR
VITE_AUTH0_AUDIENCE=https://dev-y1vqybc2gwjuo8dp.eu.auth0.com/api/v2/
```

**Note**: The client secret is not typically needed for SPAs (Single Page Applications) as they use the PKCE flow. However, it may be required if you have server-side API routes that need to perform machine-to-machine authentication.

### Testing

1. Test locally: `npm run dev`
2. Test on staging: Deploy to Vercel preview
3. Test on production: `https://airesearchprojects.com`

### Troubleshooting

If you get "Callback URL mismatch" error:
1. Check that the URL in browser matches exactly one of the allowed callbacks
2. Make sure there are no trailing slashes
3. Protocol must match (http vs https)
4. Port must match for localhost

### Security Best Practices

1. Never commit Client Secret to git
2. Use environment variables for sensitive data
3. Enable MFA for admin accounts
4. Regularly rotate refresh tokens
5. Monitor suspicious login activity