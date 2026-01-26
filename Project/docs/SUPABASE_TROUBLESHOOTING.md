# 🔧 Clerk + Supabase Troubleshooting Guide

## 🎯 Quick Start - Check the Test Panel

Visit `http://localhost:3000` - you'll see a green test panel at the top showing:

- ✅ Clerk user status
- ✅ Supabase user sync status
- ✅ Bookings & wishlist data
- ✅ Overall integration status

## 🚨 Common Issues

### 1. "User not found in Supabase" ❌

**Problem:** Webhook hasn't synced user to Supabase

**Fix:**

1. Check webhook in [Clerk Dashboard > Webhooks](https://dashboard.clerk.com)
2. Verify webhook URL matches your ngrok URL
3. Check "Message Attempts" tab for errors
4. Try creating a NEW test user (webhook only fires on new signups)

### 2. "Could not get a valid token" ❌

**Problem:** Missing JWT template

**Fix:**

1. Go to [Clerk Dashboard > JWT Templates](https://dashboard.clerk.com/last-active?path=jwt-templates)
2. Click "New template" → Select "Supabase"
3. Name it EXACTLY: `supabase`
4. **Important:** Sign out and sign back in to get new token

### 3. "Row Level Security policy violation" ❌

**Problem:** Supabase doesn't trust Clerk tokens

**Fix:**

1. Verify Clerk is added as third-party auth:
   - Supabase Dashboard → Authentication → Third Party
   - Should see "Clerk" configured
2. Check JWT template is named `supabase`
3. Restart dev server

### 4. No errors but data not loading 🔄

**Fix:**

1. Open browser console (F12)
2. Look for network errors or warnings
3. Check if requests are being made to Supabase
4. Verify RLS policies in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'bookings';
   ```

## ✅ Verification Checklist

Go through each item:

- [ ] `.env.local` has all Supabase variables
- [ ] Dev server restarted after adding env vars
- [ ] Database schema ran successfully (no errors)
- [ ] Clerk added as third-party auth in Supabase
- [ ] JWT template named `supabase` exists in Clerk
- [ ] Webhook configured with correct ngrok URL
- [ ] Webhook secret matches in `.env.local`
- [ ] ngrok is running
- [ ] Signed out and back in after JWT template

## 🔍 Debug Steps

### Step 1: Check Environment Variables

In browser console:

```js
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_KEY);
// Should show your values, not undefined
```

### Step 2: Check JWT Token

Add this to any component:

```tsx
import { useSession } from "@clerk/nextjs";

const { session } = useSession();
const token = await session?.getToken({ template: "supabase" });
console.log("JWT:", token);
// Should show a long token string
```

### Step 3: Test Supabase Direct Query

In Supabase SQL Editor:

```sql
-- Test if tables exist
SELECT * FROM users LIMIT 1;

-- Test RLS
SELECT auth.jwt();
```

## 💡 Pro Tips

1. **Always restart dev server** after changing `.env.local`
2. **Clear browser cache** if you created JWT template
3. **Check Clerk webhook logs** for failed attempts
4. **Use ngrok for local testing** - regular localhost won't work
5. **Sign out and back in** after any Clerk config changes

## 📊 What to Share if Still Stuck

1. Screenshot of the test panel
2. Browser console errors
3. Clerk webhook logs (Dashboard > Webhooks > Message Attempts)
4. Which checklist item fails

---

**Need more help?** Check browser console and tell me what errors you see!
