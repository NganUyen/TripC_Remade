# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Clerk publishable key is missing"

**Error Message:**

```
Error: Clerk: Missing publishable key
```

**Solution:**

1. Make sure `.env.local` exists in project root
2. Add your Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Restart the Next.js dev server (`npm run dev`)
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue 2: "Cannot connect to Convex"

**Error Message:**

```
Could not reach the Convex backend
```

**Solutions:**

**A. Convex dev server not running:**

```bash
# Open a new terminal and run:
npx convex dev
```

**B. Wrong Convex URL:**

1. Check `.env.local` has:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://fearless-gnat-622.convex.cloud
   ```
2. Restart dev server

**C. Convex not initialized:**

```bash
npx convex dev --once
```

---

### Issue 3: Module not found: '@/convex/\_generated/api'

**Error Message:**

```
Module not found: Can't resolve '@/convex/_generated/api'
```

**Solution:**

1. Make sure `npx convex dev` is running
2. Wait ~10 seconds for Convex to generate files
3. Check that `convex/_generated/` folder exists
4. If still failing, try:

   ```bash
   # Kill all terminals
   # Delete .convex folder
   rm -rf .convex

   # Restart Convex
   npx convex dev
   ```

---

### Issue 4: "User not syncing to Convex database"

**Symptoms:**

- User can sign in with Clerk
- But `convexUser` is `null` or `undefined`

**Solutions:**

**A. Check browser console for errors:**

- Open DevTools (F12)
- Look for red errors in Console tab

**B. Verify SyncUser component:**

- Make sure `<SyncUser />` is in `app/layout.tsx`
- Should be inside `<Providers>`

**C. Check Convex functions:**

```bash
# Make sure Convex dev is running
npx convex dev

# Check for errors in terminal output
```

**D. Manual sync test:**

```tsx
// Add this to any component
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const { user } = useUser();
const storeUser = useMutation(api.users.storeUser);

// Click a button to manually sync
const handleSync = () => {
  if (user) {
    storeUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
    });
  }
};
```

---

### Issue 5: Protected routes not working

**Symptoms:**

- User is signed in
- But can't access `/profile` or `/my-bookings`

**Solutions:**

**A. Check middleware is working:**

1. Open `middleware.ts`
2. Verify it's exported correctly
3. Check the route matcher config

**B. Clear cookies and sign in again:**

```
1. Open DevTools
2. Application > Cookies
3. Clear all cookies
4. Sign in again
```

**C. Verify route is protected:**
In `middleware.ts`, check if your route is in the public list:

```typescript
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  // ... add or remove routes here
]);
```

---

### Issue 6: "Failed to compile" after adding environment variables

**Error Message:**

```
Failed to compile
```

**Solution:**

1. Restart the Next.js dev server (Ctrl+C, then `npm run dev`)
2. Environment variables require a restart to be loaded
3. Never change `.env.local` while dev server is running

---

### Issue 7: Clerk modal not appearing

**Symptoms:**

- Click "Sign In" button
- Nothing happens

**Solutions:**

**A. Check browser console:**

- Look for JavaScript errors
- Clerk might be blocked by ad blocker

**B. Verify Clerk provider:**

- Make sure `app/layout.tsx` has `<Providers>` wrapper
- All pages should be inside this wrapper

**C. Test with direct page:**

- Navigate to `/sign-in` directly
- Should show Clerk sign-in component

---

### Issue 8: "Hydration error" in console

**Error Message:**

```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Solution:**

- This is common with auth components
- Usually safe to ignore if app works correctly
- To fix, make sure any auth-dependent content uses:

  ```tsx
  "use client";

  const { isLoaded } = useUser();

  if (!isLoaded) return null;
  ```

---

### Issue 9: Dark mode not working with Clerk

**Symptoms:**

- Clerk components don't follow dark mode
- White background on dark page

**Solution:**
Update `components/Providers.tsx`:

```tsx
<ClerkProvider
  appearance={{
    baseTheme: dark, // Import from '@clerk/themes'
    variables: {
      colorPrimary: "#FF5E1F",
    },
  }}
>
```

---

### Issue 10: Database not updating in real-time

**Symptoms:**

- Create booking but list doesn't update
- Need to refresh to see changes

**Solutions:**

**A. Using mutation correctly:**

```tsx
// ❌ Wrong - not awaiting
createBooking({ ... });

// ✅ Correct - await the mutation
await createBooking({ ... });
```

**B. Using query correctly:**

```tsx
// ✅ Correct - query will auto-update
const bookings = useQuery(api.bookings.getUserBookings, { userId });

// ❌ Wrong - don't use useEffect with queries
useEffect(() => {
  // Don't do this with Convex queries
}, []);
```

---

### Issue 11: Can't access Convex dashboard

**Solutions:**

**A. Get the correct URL:**

```bash
# Check your terminal where `npx convex dev` is running
# Look for: "View the Convex dashboard at https://..."
```

**B. Direct link:**

```
https://dashboard.convex.dev/d/fearless-gnat-622
```

**C. Login required:**

- Make sure you're logged in with the same account
- Used email: nguyenlekhanhan2k5@gmail.com

---

### Issue 12: TypeScript errors in Convex files

**Error Message:**

```
Cannot find module 'convex/values' or 'convex/server'
```

**Solution:**

1. Make sure packages are installed:
   ```bash
   npm install convex
   ```
2. Restart VS Code / IDE
3. Run Convex dev to generate types:
   ```bash
   npx convex dev
   ```

---

### Issue 13: Deployment issues

**For Vercel deployment:**

**A. Environment variables:**

- Add all `.env.local` variables to Vercel
- Including Clerk keys and Convex URL

**B. Deploy Convex first:**

```bash
npx convex deploy
```

**C. Update Convex deployment URL:**

- Get production URL from Convex dashboard
- Update in Vercel environment variables

**D. Configure Clerk for production:**

- Add production domain to Clerk dashboard
- Update redirect URLs

---

## Still Having Issues?

### 1. Check the logs

**Convex logs:**

```bash
# In the terminal running npx convex dev
# Look for errors in red
```

**Browser logs:**

```
1. Open DevTools (F12)
2. Console tab - JavaScript errors
3. Network tab - Failed requests
```

**Next.js logs:**

```bash
# In the terminal running npm run dev
# Look for compilation errors
```

### 2. Verify versions

```bash
# Check package versions
npm list @clerk/nextjs convex

# Should see:
# ├── @clerk/nextjs@5.x.x
# └── convex@1.x.x
```

### 3. Clean install

```bash
# Remove node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### 4. Reset Convex

```bash
# Stop all dev servers
# Delete Convex cache
rm -rf .convex

# Restart
npx convex dev
```

### 5. Reset Clerk session

```
1. Open browser DevTools (F12)
2. Application > Storage > Clear site data
3. Refresh page
4. Sign in again
```

---

## Debug Checklist

When something isn't working, check:

- [ ] Is `npx convex dev` running?
- [ ] Is `npm run dev` running?
- [ ] Did you restart servers after changing `.env.local`?
- [ ] Are Clerk keys added to `.env.local`?
- [ ] Did you sign out and back in?
- [ ] Any errors in browser console?
- [ ] Any errors in terminal output?
- [ ] Is the file saved? (Sounds silly, but happens!)

---

## Getting Help

If you're still stuck:

1. **Check documentation:**
   - `SETUP.md` - Detailed setup guide
   - `QUICKSTART.md` - Usage examples
   - `CHECKLIST.md` - Step-by-step guide

2. **Official resources:**
   - [Clerk Docs](https://clerk.com/docs)
   - [Convex Docs](https://docs.convex.dev)
   - [Next.js Docs](https://nextjs.org/docs)

3. **Community support:**
   - [Clerk Discord](https://clerk.com/discord)
   - [Convex Discord](https://convex.dev/community)
   - [Next.js Discussions](https://github.com/vercel/next.js/discussions)

4. **Search for error:**
   - Copy exact error message
   - Search on Stack Overflow
   - Search in GitHub issues

---

**Pro Tip:** 90% of issues are solved by:

1. Restarting dev servers
2. Clearing browser cache
3. Making sure both Convex and Next.js are running
4. Checking environment variables are set

Good luck! 🍀
