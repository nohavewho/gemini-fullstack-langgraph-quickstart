# Auth0 QUICK FIX - Add these URLs NOW!

## Go to Auth0 Dashboard:
https://manage.auth0.com/dashboard/eu/dev-y1vqybc2gwjuo8dp/applications/SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C/settings

## Add to "Allowed Callback URLs":
```
https://gemini-fullstack-langgraph-quickstart-81ssg5ztj.vercel.app/callback
https://*.vercel.app/callback
```

## Add to "Allowed Logout URLs":
```
https://gemini-fullstack-langgraph-quickstart-81ssg5ztj.vercel.app/login
https://*.vercel.app/login
```

## Add to "Allowed Web Origins":
```
https://gemini-fullstack-langgraph-quickstart-81ssg5ztj.vercel.app
https://*.vercel.app
```

## IMPORTANT: 
- Add each URL on a NEW LINE (press Enter after each URL)
- Or use wildcard `https://*.vercel.app` to cover ALL Vercel deployments
- Click "Save Changes" at the bottom

## Your app URL:
https://gemini-fullstack-langgraph-quickstart-81ssg5ztj.vercel.app