# Vercel Deployment Fix - UPDATED

## Issues Fixed

### 1. Hotel Detail Pages Not Loading ✅
**Problem**: The hotel detail page was making external HTTP fetch calls during server-side rendering, which requires absolute URLs. Using `NEXT_PUBLIC_APP_URL` with localhost didn't work in production.

**Solution**: Changed to direct Supabase calls in the server component, eliminating the need for HTTP fetch and URL configuration entirely.

### 2. Dining Page Not Fetching Data ✅
**Problem**: 
- The dining API client was using relative URLs, which is correct
- BUT the API response handling was broken - the API returns `{ success: true, data: {...} }`, but the client was trying to access `response.data.data`

**Solution**: 
- Updated `fetchAPI` utility to automatically unwrap the `data` field from API responses
- Updated all dining API methods to remove the redundant `.data` access
- Dining API now works correctly with relative URLs

---

## Files Modified

1. **`app/hotels/[id]/page.tsx`**
   - Removed external fetch() call
   - Now uses direct Supabase query in the server component
   - No URL configuration needed - works everywhere automatically

2. **`lib/api.ts`**
   - Updated `fetchAPI` to automatically unwrap API responses
   - When API returns `{ success: true, data: {...} }`, it now returns just the data
   - Maintains compatibility with both wrapped and unwrapped responses

3. **`lib/dining/api.ts`**
   - Removed all `.data` property access (50+ occurrences)
   - Now uses type assertions instead
   - Clean, consistent API client

4. **`.env.local.example`**
   - Updated documentation to clarify environment variable usage

---

## Environment Variables Setup for Vercel

### Required Environment Variables

Go to your Vercel project settings > Environment Variables and add:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

# Convex (if using)
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Optional
OPENWEATHER_API_KEY=your-weather-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### ⚠️ Important Notes

**You DO NOT need to set these in Vercel:**
- `NEXT_PUBLIC_APP_URL` - The app now uses relative URLs
- `NEXT_PUBLIC_API_URL` - Defaults to `/api` which works everywhere
- `NODE_ENV` - Vercel sets this automatically

---

## Deployment Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix: Use relative URLs for API calls in production"
   git push origin main
   ```

2. **Verify Vercel Environment Variables:**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Ensure all required variables from `.env.local.example` are set
   - Apply variables to Production, Preview, and Development environments

3. **Redeploy:**
   - Vercel will automatically redeploy on push
   - Or manually trigger: `vercel --prod`

4. **Test the fixes:**
   - Visit a hotel detail page: `https://your-app.vercel.app/hotels/[any-hotel-slug]`
   - Visit the dining page: `https://your-app.vercel.app/dining`

---

## Why This Works

### Relative URLs in Next.js
- When you use `/api/hotels/...` instead of `http://localhost:3000/api/hotels/...`
- Next.js automatically resolves it to the current domain
- In development: `http://localhost:3000/api/...`
- In production: `https://your-app.vercel.app/api/...`

### Server-Side Rendering (SSR)
- The hotel detail page uses `fetch()` during SSR
- Using relative URLs, Next.js can call API routes internally
- This works without needing to know the domain name

---

## Testing Locally

Before deploying, test that everything still works locally:

```bash
cd Project
npm run dev
```

Visit:
- http://localhost:3000/hotels/liberty-central-saigon-riverside
- http://localhost:3000/dining

Both should work perfectly!

---

## Troubleshooting

### If hotel pages still show "Hotel Not Found"
1. Check Vercel logs: `vercel logs`
2. Verify Supabase environment variables are correct
3. Check if hotels exist in your Supabase database

### If dining page shows no restaurants
1. Check browser console for errors
2. Verify the dining venues exist in your database
3. Check Vercel function logs for API errors

### If you see CORS errors
- This shouldn't happen with relative URLs
- If it does, check your `next.config.js` headers configuration

---

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
