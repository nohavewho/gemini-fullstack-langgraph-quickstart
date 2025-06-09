# Auth0 Manual Setup Guide

## Quick Setup Steps

### 1. Open Auth0 Dashboard
Go to: https://manage.auth0.com/dashboard/eu/dev-y1vqybc2gwjuo8dp/applications/SDfC8Bj7hNWjusrFhHDgPumhDyoJVr4C/settings

### 2. Update Application Settings

#### In "Application URIs" section:

**Allowed Callback URLs** (copy all as comma-separated):
```
https://airesearchprojects.com/callback,https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app/callback,https://gemini-fullstack-langgraph-quickstart.vercel.app/callback,http://localhost:5173/callback,http://localhost:3000/callback
```

**Allowed Logout URLs** (copy all as comma-separated):
```
https://airesearchprojects.com/login,https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app/login,https://gemini-fullstack-langgraph-quickstart.vercel.app/login,http://localhost:5173/login,http://localhost:3000/login
```

**Allowed Web Origins** (copy all as comma-separated):
```
https://airesearchprojects.com,https://gemini-fullstack-langgraph-quickstart-81ssg5ztj.vercel.app,https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app,https://gemini-fullstack-langgraph-quickstart.vercel.app,http://localhost:5173,http://localhost:3000
```

### 3. Enable Social Connections

Go to: https://manage.auth0.com/dashboard/eu/dev-y1vqybc2gwjuo8dp/connections/social

Enable:
- Google
- Facebook

For VK and Yandex - create custom OAuth2 connections.

### 4. Save Changes

Click "Save Changes" at the bottom of the settings page.

### 5. Test Your App

Latest deployment: https://gemini-fullstack-langgraph-quickstart-75j40mn6r.vercel.app

## That's it! 🎉