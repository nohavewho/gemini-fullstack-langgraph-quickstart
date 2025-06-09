# Vercel Environment Variables Setup

## Auth0 Configuration

Add the following environment variables to your Vercel project:

1. Go to your Vercel Dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add the following variables:

### Required Environment Variables

| Variable Name | Value | Environment |
|--------------|-------|------------|
| `VITE_AUTH0_DOMAIN` | `dev-y1vqybc2gwjuo8dp.eu.auth0.com` | Production, Preview, Development |
| `VITE_AUTH0_CLIENT_ID` | `SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C` | Production, Preview, Development |
| `VITE_AUTH0_CLIENT_SECRET` | `mSsy3Fob97PbxaRgxgsWLEHvLj5tJTnJ-l3vbUBW0DCkrDKuGaJ7UPo3Xq9nqRRR` | Production, Preview, Development |
| `VITE_AUTH0_AUDIENCE` | `https://dev-y1vqybc2gwjuo8dp.eu.auth0.com/api/v2/` | Production, Preview, Development |

### Database Configuration

| Variable Name | Value | Environment |
|--------------|-------|------------|
| `VITE_DATABASE_URL` | `postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres` | Production, Preview, Development |

### Supabase Configuration

| Variable Name | Value | Environment |
|--------------|-------|------------|
| `VITE_SUPABASE_URL` | `https://peojtkesvynmmzftljxo.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `[Your Supabase Anon Key]` | Production, Preview, Development |

### Google AI Configuration

| Variable Name | Value | Environment |
|--------------|-------|------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIzaSyDOCJqR9y-I-L8XhZV_X5FU_x_DgA64H9U` | Production, Preview, Development |

## How to Add Environment Variables in Vercel

1. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Select your project
   - Go to Settings → Environment Variables
   - Click "Add Variable"
   - Enter the key and value
   - Select which environments should have access
   - Click "Save"

2. **Via Vercel CLI**:
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Add environment variables
   vercel env add VITE_AUTH0_DOMAIN
   vercel env add VITE_AUTH0_CLIENT_ID
   vercel env add VITE_AUTH0_CLIENT_SECRET
   vercel env add VITE_AUTH0_AUDIENCE
   ```

## Important Notes

1. **Client Secret Security**: 
   - The Auth0 Client Secret is typically NOT needed for Single Page Applications (SPAs)
   - SPAs use the PKCE (Proof Key for Code Exchange) flow which doesn't require the client secret
   - Only include the client secret if you have server-side API routes that need machine-to-machine authentication

2. **Environment Variable Prefixes**:
   - Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client
   - Be careful not to expose sensitive secrets to the client-side code

3. **Deployment**:
   - After adding environment variables, you need to redeploy your application
   - Use `vercel --prod` to deploy with the new environment variables

## Verification

After deployment, you can verify the environment variables are working:

1. Check the build logs in Vercel dashboard
2. Test the Auth0 authentication flow
3. Monitor the application for any authentication errors

## Troubleshooting

If authentication is not working:

1. Ensure all environment variables are correctly set
2. Check that Auth0 application settings match your deployment URLs
3. Verify the Auth0 domain and client ID are correct
4. Check browser console for any error messages