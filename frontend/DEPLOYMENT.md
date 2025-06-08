# Deployment Instructions for Vercel

## Prerequisites

1. **Auth0 Account**: Create an Auth0 account and application
2. **Database**: PostgreSQL database (already configured)
3. **Vercel Account**: Sign up at vercel.com

## Step 1: Configure Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application (Single Page Application)
3. Configure allowed URLs:
   - **Allowed Callback URLs**: `https://your-app.vercel.app/api/auth/callback`
   - **Allowed Logout URLs**: `https://your-app.vercel.app`
   - **Allowed Web Origins**: `https://your-app.vercel.app`

## Step 2: Set Environment Variables

Create `.env.local` with:

```bash
# Auth0 Configuration
AUTH0_SECRET='your-long-random-string-32-chars-min'
AUTH0_BASE_URL='https://your-app.vercel.app'
AUTH0_ISSUER_BASE_URL='https://your-auth0-domain.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'

# Database Configuration
DATABASE_URL='postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='https://peojtkesvynmmzftljxo.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-anon-key'
```

## Step 3: Run Database Migrations

```bash
# Generate migrations
npm run db:generate

# Run migrations (with proper DATABASE_URL)
export DATABASE_URL='postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
npm run db:migrate
```

## Step 4: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Or link and deploy
vercel link
vercel --prod
```

## Step 5: Configure Vercel Environment Variables

In Vercel Dashboard, go to your project → Settings → Environment Variables and add:

- `AUTH0_SECRET`
- `AUTH0_BASE_URL` 
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure for Vercel

```
/
├── api/                     # Vercel Functions
│   ├── auth/
│   │   └── [...auth0].js   # Auth0 handler
│   ├── user/
│   │   └── sync.js         # User sync
│   └── chat/
│       ├── sessions.js     # Chat sessions
│       └── messages.js     # Chat messages
├── src/                    # React app
└── vercel.json            # Vercel configuration
```

## Features Included

✅ **Multi-language support** (EN, RU, AZ, TR)
✅ **Auth0 authentication**
✅ **PostgreSQL database with Drizzle ORM**
✅ **Chat history persistence**
✅ **User profiles**
✅ **Country preset cards**
✅ **Real-time chat**
✅ **Responsive design**

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Database
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio

# Deploy
vercel --prod
```

## Troubleshooting

1. **Auth0 Issues**: Check callback URLs match your domain
2. **Database Issues**: Verify DATABASE_URL is URL-encoded
3. **Build Issues**: Ensure all environment variables are set
4. **API Issues**: Check Vercel Functions logs in dashboard

## Next Steps

After deployment:
1. Test authentication flow
2. Create test user and chat
3. Verify database persistence
4. Test all language switches
5. Check responsive design on mobile