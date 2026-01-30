# 🌍 TripC SuperApp

> Your intelligent travel planning companion with enterprise-grade authentication

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange)](https://convex.dev/)

A modern, full-stack travel booking platform built with Next.js 14, featuring real-time authentication, database management, and a beautiful glassmorphic UI.

## ✨ Features

### 🎯 Core Features

- **Multi-Service Platform**: Hotels, Flights, Dining, Activities, Events, Wellness, Beauty, Entertainment, Shopping, Transport
- **Real-time Authentication**: Powered by Clerk with social login support
- **Live Database**: Convex real-time backend with automatic synchronization
- **User Bookings**: Track reservations across all services
- **Wishlist System**: Save favorite destinations and experiences
- **Rewards Program**: Built-in loyalty points system
- **🤖 AI Chat Assistant**: Intelligent travel planning assistant powered by Deepseek AI with 40+ tools
- **Partner Portal**: Separate interface for business owners

### 🎨 Design

- **Modern UI**: Glassmorphic design with smooth animations
- **Dark Mode**: Full dark theme support
- **Responsive**: Mobile-first, works on all devices
- **Accessible**: WCAG compliant components
- **Custom Design System**: "TripC Shop" aesthetic with hyper-rounded borders

### 🔐 Security

- JWT-based authentication
- Protected routes with middleware
- Secure session management
- Environment variable encryption

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Clerk account (free)
- A Convex account (free)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Get Clerk API Keys**
   - Visit [Clerk Dashboard](https://dashboard.clerk.com)
   - Create a new application
   - Copy your API keys

4. **Configure environment variables**
   - Open `.env.local`
   - Add your Clerk keys:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

5. **Start development servers**

   **Terminal 1 - Convex Backend:**

   ```bash
   npx convex dev
   ```

   **Terminal 2 - Next.js App:**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   ```
   http://localhost:3000
   ```

7. **Test authentication**
   - Click "Sign In" in the header
   - Create a test account
   - You're ready to go! 🎉

## 📚 Documentation

We've created comprehensive documentation to help you:

| Document                                     | Description                     | When to Read            |
| -------------------------------------------- | ------------------------------- | ----------------------- |
| **[CHECKLIST.md](CHECKLIST.md)**             | Step-by-step setup guide        | Start here!             |
| **[QUICKSTART.md](QUICKSTART.md)**           | Quick reference & code examples | After setup             |
| **[SETUP.md](SETUP.md)**                     | Detailed configuration guide    | For deep dive           |
| **[ARCHITECTURE.md](ARCHITECTURE.md)**       | System architecture & flows     | Understanding structure |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues & solutions       | When stuck              |
| **[SUMMARY.md](SUMMARY.md)**                 | What was configured             | Overview                |

### 🤖 AI Chatbot Documentation

Complete documentation for the AI-powered chatbot system:

| Document                                                               | Description                      |
| ---------------------------------------------------------------------- | -------------------------------- |
| **[docs/chatbot/INDEX.md](docs/chatbot/INDEX.md)**                     | Documentation index & navigation |
| **[docs/chatbot/QUICK_REFERENCE.md](docs/chatbot/QUICK_REFERENCE.md)** | One-page quick reference         |
| **[docs/chatbot/INSTALLATION.md](docs/chatbot/INSTALLATION.md)**       | Installation & setup guide       |
| **[docs/chatbot/README.md](docs/chatbot/README.md)**                   | Chatbot overview & features      |
| **[docs/chatbot/ARCHITECTURE.md](docs/chatbot/ARCHITECTURE.md)**       | System architecture              |
| **[docs/chatbot/TOOLS_REFERENCE.md](docs/chatbot/TOOLS_REFERENCE.md)** | All 40+ tools documented         |
| **[docs/chatbot/API_REFERENCE.md](docs/chatbot/API_REFERENCE.md)**     | Chat API documentation           |

**Quick Setup:**

```bash
# Windows
.\setup-chatbot.bat

# Linux/Mac
./setup-chatbot.sh
```

See [docs/chatbot/INSTALLATION.md](docs/chatbot/INSTALLATION.md) for complete setup instructions.

### Quick Links

- 📋 [Setup Checklist](CHECKLIST.md) - Complete setup walkthrough
- 🚀 [Quick Start Guide](QUICKSTART.md) - Code examples and usage
- 🏗️ [Architecture Overview](ARCHITECTURE.md) - System design
- 🔧 [Troubleshooting](TROUBLESHOOTING.md) - Problem solving
- 🤖 [AI Chatbot Docs](docs/chatbot/INDEX.md) - Chatbot documentation

## 🗄️ Database Schema

The app uses Convex with these tables:

| Table        | Purpose                                  |
| ------------ | ---------------------------------------- |
| **users**    | User profiles synced from Clerk          |
| **bookings** | All reservations (hotels, flights, etc.) |
| **wishlist** | Saved items across all categories        |
| **reviews**  | User reviews and ratings                 |

## 🎯 Project Structure

```
TripC/
├── app/                      # Next.js pages
│   ├── (auth)/              # Auth pages
│   ├── hotels/              # Hotel booking
│   ├── flights/             # Flight search
│   ├── my-bookings/         # User bookings
│   └── ...
├── components/              # React components
│   ├── Providers.tsx        # Auth & DB providers
│   ├── Header.tsx           # Navigation
│   ├── bookings/            # Booking components
│   └── ...
├── convex/                  # Backend functions
│   ├── schema.ts            # Database schema
│   ├── users.ts             # User operations
│   ├── bookings.ts          # Booking management
│   └── ...
├── lib/
│   ├── hooks/               # Custom React hooks
│   └── utils.ts             # Helper functions
└── middleware.ts            # Route protection
```

## 💻 Usage Examples

### Get Current User

```typescript
"use client"
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export function MyComponent() {
  const { clerkUser, convexUser, isAuthenticated } = useCurrentUser()

  if (!isAuthenticated) return <div>Please sign in</div>

  return <div>Welcome {clerkUser?.firstName}!</div>
}
```

### Create a Booking

```typescript
"use client"
import { useBookings } from '@/lib/hooks/useBookings'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export function BookButton() {
  const { convexUser } = useCurrentUser()
  const { createBooking } = useBookings()

  const handleBook = async () => {
    await createBooking({
      userId: convexUser!._id,
      type: "hotel",
      title: "Luxury Beach Resort",
      startDate: Date.now(),
      price: 299,
    })
  }

  return <button onClick={handleBook}>Book Now</button>
}
```

### Add Wishlist Button

```typescript
import { WishlistButton } from '@/components/WishlistButton'

<WishlistButton
  itemId="hotel-123"
  itemType="hotel"
  title="Beach Resort"
  imageUrl="https://..."
  price={299}
/>
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React, Material Symbols
- **Fonts**: Plus Jakarta Sans

### Backend & Services

- **Authentication**: Clerk
- **Database**: Convex
- **Deployment**: Vercel (recommended)
- **Real-time**: Convex subscriptions

### Development Tools

- **Linting**: ESLint
- **Formatting**: Prettier (recommended)
- **Type Checking**: TypeScript strict mode

## 🔒 Environment Variables

Required environment variables (in `.env.local`):

```env
# Convex
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex backend

# Production
npm run build        # Build for production
npm start            # Start production server
npx convex deploy    # Deploy Convex backend

# Utilities
npm run lint         # Run ESLint
```

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

Update your `.env.local` with the production URL.

### Configure Clerk for Production

1. Add your production domain to Clerk dashboard
2. Update redirect URLs
3. Test authentication flows

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspired by modern travel platforms
- Built with amazing open-source tools
- Community feedback and contributions

## 📞 Support

- 📖 **Documentation**: See docs in this repository
- 💬 **Discussions**: GitHub Discussions
- 🐛 **Bug Reports**: GitHub Issues
- 📧 **Email**: your-email@example.com

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Convex Dashboard**: https://dashboard.convex.dev
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Documentation**: See markdown files in repo

## 📊 Project Status

- ✅ Authentication: Complete
- ✅ Database: Complete
- ✅ Core UI: Complete
- 🚧 Booking Flow: In Progress
- 🚧 Payment Integration: Planned
- 🚧 Email Notifications: Planned

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Made with ❤️ by the TripC Team**

Ready to build amazing travel experiences? Start with the [Setup Checklist](CHECKLIST.md)!
