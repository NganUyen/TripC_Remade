# 🎯 Setup Checklist

## ✅ Completed

- [x] Installed Convex and Clerk packages
- [x] Initialized Convex project
- [x] Created database schema (users, bookings, wishlist, reviews)
- [x] Created Convex functions (users, bookings, wishlist)
- [x] Set up authentication providers
- [x] Updated app layout with providers
- [x] Created sign-in/sign-up pages
- [x] Updated Header with Clerk authentication
- [x] Created custom hooks (useCurrentUser, useBookings, useWishlist)
- [x] Set up middleware for route protection
- [x] Created example components
- [x] Generated documentation

## 📋 Your Next Steps

### 1. Get Clerk API Keys (5 minutes)

- [ ] Go to https://dashboard.clerk.com
- [ ] Sign up or log in
- [ ] Create a new application (or select existing)
- [ ] Go to "API Keys" section
- [ ] Copy your Publishable Key
- [ ] Copy your Secret Key

### 2. Update Environment Variables (2 minutes)

- [ ] Open `.env.local` file in your project root
- [ ] Replace `your_publishable_key_here` with your actual Clerk Publishable Key
- [ ] Replace `your_secret_key_here` with your actual Clerk Secret Key
- [ ] Save the file

Example:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
CLERK_SECRET_KEY=sk_test_xyz789...
```

### 3. Configure Clerk (Optional - 3 minutes)

In Clerk Dashboard:

- [ ] Enable social login providers (Google, GitHub, etc.) if desired
- [ ] Customize sign-in/sign-up appearance
- [ ] Set up email templates

### 4. Start Development Servers (1 minute)

Open TWO terminal windows:

**Terminal 1:**

```bash
npx convex dev
```

Keep this running!

**Terminal 2:**

```bash
npm run dev
```

Keep this running too!

### 5. Test Authentication (2 minutes)

- [ ] Open http://localhost:3000
- [ ] Click "Sign In" button in header
- [ ] Create a test account
- [ ] Verify you can sign in
- [ ] Check Convex dashboard to see your user synced

### 6. Explore the Integration (Optional)

- [ ] Check out `SETUP.md` for detailed documentation
- [ ] Read `QUICKSTART.md` for usage examples
- [ ] View Convex dashboard at https://dashboard.convex.dev
- [ ] View Clerk dashboard to manage users

## 🔗 Important Links

- **Convex Dashboard**: https://dashboard.convex.dev/d/fearless-gnat-622
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Local App**: http://localhost:3000
- **Convex Dev Docs**: https://docs.convex.dev
- **Clerk Dev Docs**: https://clerk.com/docs

## 📝 Quick Reference

### Environment Variables Location

```
Project Root
├── .env.local          ← Edit this file with your Clerk keys
└── .env.local.example  ← Template/backup
```

### Key Commands

```bash
# Start Convex backend
npx convex dev

# Start Next.js app
npm run dev

# Deploy Convex to production (later)
npx convex deploy

# View Convex logs
npx convex logs
```

### File Locations

- **Auth Config**: `components/Providers.tsx`
- **Middleware**: `middleware.ts`
- **Convex Functions**: `convex/` folder
- **Custom Hooks**: `lib/hooks/` folder
- **Sign-in Page**: `app/sign-in/[[...sign-in]]/page.tsx`

## ⚠️ Common Issues

**Issue**: "Clerk publishable key not found"
**Solution**: Make sure you've added your keys to `.env.local` and restarted dev server

**Issue**: "Cannot connect to Convex"
**Solution**: Run `npx convex dev` in a separate terminal

**Issue**: "Module not found: Can't resolve '@/convex/\_generated/api'"
**Solution**: Wait for `npx convex dev` to finish generating files (takes ~5 seconds on first run)

## 🎉 When Complete

Once all checkboxes are marked, you'll have:

- ✅ Full user authentication with Clerk
- ✅ Real-time database with Convex
- ✅ User data syncing automatically
- ✅ Protected routes
- ✅ Ready-to-use hooks for bookings and wishlist
- ✅ Production-ready auth setup

## 📚 Next Development Steps

After setup is complete:

1. Add `WishlistButton` to your hotel/flight cards
2. Integrate `BookingsList` in the my-bookings page
3. Create booking flows using `createBooking` mutation
4. Customize Clerk appearance to match your brand
5. Add more Convex functions for reviews, etc.

---

**Need Help?**

- Check `SETUP.md` for detailed instructions
- Check `QUICKSTART.md` for code examples
- Visit Clerk docs: https://clerk.com/docs
- Visit Convex docs: https://docs.convex.dev
