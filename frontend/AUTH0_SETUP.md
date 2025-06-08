# Auth0 Setup Instructions

## Your Auth0 Application Details
- **Domain**: `dev-y1vqybc2gwjuo8dp.eu.auth0.com`
- **Client ID**: `SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C`
- **Client Secret**: `mSsy3Fob97PbxaRgxgsWLEHvLj5tJTnJ-l3vbUBW0DCkrDKuGaJ7UPo3Xq9nqRRR`

## Required Auth0 Dashboard Configuration

### 1. Application Settings
Go to [Auth0 Dashboard](https://manage.auth0.com/) → Applications → Your App

### 2. Configure URLs
Set the following URLs in your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:8000,
https://your-app.vercel.app
```

**Allowed Logout URLs:**
```
http://localhost:8000,
https://your-app.vercel.app
```

**Allowed Web Origins:**
```
http://localhost:8000,
https://your-app.vercel.app
```

**Allowed Origins (CORS):**
```
http://localhost:8000,
https://your-app.vercel.app
```

### 3. Application Type
- Set **Application Type** to: `Single Page Application`

### 4. Grant Types
Ensure the following grant types are enabled:
- ✅ Implicit
- ✅ Authorization Code
- ✅ Refresh Token

### 5. Advanced Settings
In **Advanced Settings** → **Grant Types**, make sure:
- ✅ Implicit
- ✅ Authorization Code
- ✅ Refresh Token

## Current Configuration in Code

Your app is configured with:
```typescript
export const auth0Config = {
  domain: "dev-y1vqybc2gwjuo8dp.eu.auth0.com",
  clientId: "SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: "https://dev-y1vqybc2gwjuo8dp.eu.auth0.com/api/v2/",
  },
};
```

## Testing Authentication

1. **Start your app**: `npm run dev`
2. **Open**: http://localhost:8000
3. **Click Login** button
4. **Should redirect** to Auth0 login page
5. **After login** should redirect back to your app
6. **User profile** should appear in top-left corner

## Troubleshooting

### Common Issues:

1. **"Callback URL mismatch"**
   - Check Allowed Callback URLs include `http://localhost:8000`

2. **"Origin not allowed"**
   - Check Allowed Web Origins include `http://localhost:8000`

3. **"Invalid audience"**
   - Audience should be your Auth0 API identifier
   - Current: `https://dev-y1vqybc2gwjuo8dp.eu.auth0.com/api/v2/`

4. **Login button not working**
   - Check browser console for errors
   - Verify Auth0 domain and client ID are correct

### Debug Steps:
1. Open browser Developer Tools
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify Auth0 configuration matches your dashboard

## Production Deployment
When deploying to Vercel:
1. Update Allowed Callback URLs with your Vercel URL
2. Update Allowed Logout URLs with your Vercel URL  
3. Update Allowed Web Origins with your Vercel URL
4. Set environment variables in Vercel dashboard