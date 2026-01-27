# Wakey Website - Complete Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture & Flow](#architecture--flow)
6. [Components Deep Dive](#components-deep-dive)
7. [Styling System](#styling-system)
8. [API Routes](#api-routes)
9. [Authentication](#authentication)
10. [Payment Integration](#payment-integration)
11. [Environment Variables](#environment-variables)
12. [Deployment](#deployment)

---

## Overview

Wakey Website is a modern, animated landing page for the Wakey productivity app. It features:
- Animated cosmic background with twinkling stars
- Glassmorphism design system
- Custom cursor with hover effects
- Sound effects system
- Loading screen with particle animation
- Responsive design
- Dark/Light mode support
- Payment integration (Stripe + Razorpay)
- Authentication (Supabase)

**Live URL:** http://localhost:3001 (development)

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.4 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | ^5 | Type safety |

### Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | ^4 | Utility-first CSS |
| **CSS Variables** | Custom design tokens |
| **Framer Motion** | ^11.0.0 | Animations |

### Backend/Services
| Technology | Purpose |
|------------|---------|
| **Supabase** | Authentication & Database |
| **Stripe** | International payments |
| **Razorpay** | India payments |

### UI/UX
| Technology | Purpose |
|------------|---------|
| **Lucide React** | Icon library |
| **Howler.js** | Sound effects |
| **Zustand** | State management |

---

## Project Structure

```
apps/website/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── signup/route.ts
│   │   ├── checkout-sessions/route.ts
│   │   ├── newsletter/route.ts
│   │   ├── stripe-customer-portal/route.ts
│   │   ├── subscription/route.ts
│   │   └── webhooks/
│   │       ├── razorpay/route.ts
│   │       ├── razorpay-verify/route.ts
│   │       └── stripe/route.ts
│   ├── about/page.tsx
│   ├── account/page.tsx
│   ├── blog/page.tsx
│   ├── checkout/page.tsx
│   ├── contact/page.tsx
│   ├── docs/page.tsx
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── not-found.tsx
├── components/
│   ├── 3d/
│   │   ├── CosmicBackground.tsx      # Animated star background
│   │   └── CosmicBackgroundWrapper.tsx
│   ├── effects/
│   │   ├── Confetti.tsx
│   │   └── LoadingScreen.tsx         # Intro animation
│   ├── layout/
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── providers/
│   │   └── SoundProvider.tsx         # Sound effects context
│   ├── sections/                     # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Comparison.tsx
│   │   ├── ROICalculator.tsx
│   │   ├── Pricing.tsx
│   │   └── Newsletter.tsx
│   └── ui/
│       └── CustomCursor.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   └── utils.ts
├── public/
│   └── sounds/                   # Sound effect files (optional)
├── types/
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone/navigate to the website directory
cd apps/website

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

### Scripts

```json
{
  "dev": "next dev --turbopack -p 3001",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

---

## Architecture & Flow

### Page Flow

```
Home (/)
├── Hero Section          → /pricing (Download CTA)
├── Features Section      → Tab navigation (AI, Tracking, Focus, Integrations)
├── Testimonials Section  → Horizontal scroll carousel
├── Comparison Section    → Feature comparison table
├── ROI Calculator        → Interactive savings calculator
├── Pricing Section       → /checkout?plan=pro
└── Newsletter Section    → API call to /api/newsletter

Auth Flow:
/login → Supabase Auth → /account
/signup → Supabase Auth → /account

Payment Flow:
/pricing → /checkout → /api/checkout-sessions → Stripe/Razorpay → /account
```

### Component Hierarchy

```
RootLayout
├── SoundProvider (Context)
│   ├── LoadingScreen (shows on mount, fades out)
│   ├── CustomCursor (desktop only)
│   ├── CosmicBackgroundWrapper
│   │   └── CosmicBackground (canvas animation)
│   ├── Navbar
│   ├── <main>{children}</main>
│   └── Footer
```

---

## Components Deep Dive

### 1. CosmicBackground.tsx
Animated starfield using HTML5 Canvas.

```tsx
// Key features:
// - Deterministic star positions (seeded random)
// - Teal (#14b8a6) and Purple (#8b5cf6) stars
// - Gentle floating animation
// - Twinkle effect
// - Gradient overlay for depth

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}
```

### 2. CustomCursor.tsx
Custom cursor with hover effects.

```tsx
// Features:
// - Teal dot that follows mouse
// - Ring that expands on interactive elements
// - Disabled on mobile (< 768px)
// - Uses data-cursor-hover attribute for hover detection

<button data-cursor-hover>Click me</button>
```

### 3. LoadingScreen.tsx
Animated intro sequence.

```tsx
// Timeline:
// Phase 0 (0ms): Initial state
// Phase 1 (500ms): Particles animate to center
// Phase 2 (1500ms): "WAKEY" wordmark appears
// Phase 3 (2500ms): Tagline fades in
// Phase 4 (4500ms): Screen fades out
// Can skip with any keypress
```

### 4. SoundProvider.tsx
Context for sound effects throughout the app.

```tsx
// Available sounds:
type SoundName = "click" | "whoosh" | "success" | "toggle" | "hover" | "darkMode";

// Usage:
const { play, enabled, toggle } = useSound();
play("click"); // Play sound
toggle();      // Toggle sounds on/off
```

### 5. Hero.tsx
Main landing section with animated elements.

```tsx
// Features:
// - Framer Motion staggered animations
// - Gradient text effect
// - App mockup preview
// - Press logos
// - Scroll indicator
```

### 6. Features.tsx
Tabbed feature showcase.

```tsx
// Tabs: AI & Intelligence, Tracking, Focus, Integrations
// AnimatePresence for smooth tab transitions
// 4 feature cards per tab
```

### 7. Pricing.tsx
Pricing cards with toggle.

```tsx
// Plans: Free, Pro ($100/year), Enterprise
// Weekly/Yearly toggle with savings badge
// "Most Popular" badge on Pro plan
```

### 8. ROICalculator.tsx
Interactive savings calculator.

```tsx
// Inputs:
// - Hours worked per day (4-12)
// - Hourly rate ($10-$200)
// - Distraction percentage (10-50%)

// Outputs:
// - Hours saved per day
// - Yearly savings in dollars
// - Equivalent coffees/Netflix episodes
```

---

## Styling System

### CSS Variables (globals.css)

```css
:root {
  /* Primary Colors - Teal */
  --teal-500: #14b8a6;
  --teal-400: #2dd4bf;

  /* Accent - Purple */
  --purple-500: #8b5cf6;

  /* Dark Theme */
  --dark-950: #020617;
  --dark-900: #0f172a;  /* Main background */
  --dark-800: #1e293b;
  --dark-700: #334155;
  --dark-400: #94a3b8;  /* Body text */
  --dark-50: #f8fafc;   /* Headings */

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 20px;

  /* Gradient */
  --gradient-cosmic: linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Key Classes

```css
/* Glassmorphism card */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}

/* Primary button */
.btn-primary {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  padding: 12px 28px;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #14b8a6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animations */
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
```

### Custom Cursor (Hide Default)

```css
* {
  cursor: none;
}

@media (max-width: 768px) {
  * {
    cursor: auto; /* Show on mobile */
  }
}
```

---

## API Routes

### POST /api/newsletter
Subscribe email to newsletter.

```typescript
// Request
{ email: "user@example.com" }

// Response
{ success: true } | { error: "message" }
```

### POST /api/checkout-sessions
Create payment session.

```typescript
// Request
{
  plan: "weekly_plan" | "yearly_plan",
  userId: string,
  userLocation: string,
  userEmail: string
}

// Response (Stripe)
{ provider: "stripe", sessionId: string }

// Response (Razorpay - India)
{ provider: "razorpay", orderId: string, amount: number, currency: string }
```

### POST /api/webhooks/stripe
Handle Stripe webhook events.

### POST /api/webhooks/razorpay
Handle Razorpay webhook events.

---

## Authentication

Uses Supabase Auth with email/password.

### Client-side (lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Usage in Components

```typescript
const supabase = createClient();

// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

---

## Payment Integration

### Stripe (International)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Create checkout session
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${origin}/account?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/pricing`,
});
```

### Razorpay (India)

```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create order
const order = await razorpay.orders.create({
  amount: 10000, // in paise (100.00 INR)
  currency: 'INR',
  receipt: `receipt_${userId}_${Date.now()}`,
});
```

---

## Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (for India)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-secret
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build Command

```bash
pnpm build
```

### Environment Setup
Add all environment variables in Vercel dashboard under Project Settings > Environment Variables.

---

## Creating Your Own Website

### Step 1: Initialize Project

```bash
npx create-next-app@latest my-website --typescript --tailwind --app
cd my-website
```

### Step 2: Install Dependencies

```bash
pnpm add framer-motion lucide-react zustand clsx tailwind-merge
pnpm add @supabase/ssr @supabase/supabase-js  # Auth
pnpm add stripe @stripe/stripe-js              # Payments
```

### Step 3: Copy Key Files

1. `globals.css` - CSS variables and base styles
2. `components/3d/CosmicBackground.tsx` - Animated background
3. `components/ui/CustomCursor.tsx` - Custom cursor
4. `components/providers/SoundProvider.tsx` - Sound system
5. `components/effects/LoadingScreen.tsx` - Intro animation

### Step 4: Update Layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <SoundProvider>
          <LoadingScreen />
          <CustomCursor />
          <CosmicBackgroundWrapper />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SoundProvider>
      </body>
    </html>
  );
}
```

### Step 5: Create Sections

Build your landing page by composing sections:

```tsx
// app/page.tsx
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Newsletter />
    </>
  );
}
```

---

## Design Principles

1. **Glassmorphism** - Frosted glass effect with blur and transparency
2. **Cosmic Theme** - Teal and purple gradient, star animations
3. **Micro-interactions** - Sound effects, cursor effects, hover states
4. **Progressive Disclosure** - Loading screen, scroll reveals
5. **Accessibility** - Keyboard navigation, ARIA labels, mobile fallbacks
6. **Performance** - Dynamic imports, lazy loading, optimized animations

---

## Quick Reference

### Color Palette
- Primary: `#14b8a6` (Teal)
- Accent: `#8b5cf6` (Purple)
- Background: `#0f172a` (Dark blue)
- Text: `#f8fafc` (Light), `#94a3b8` (Muted)

### Fonts
- Headings: Space Grotesk
- Body: Inter
- Code: JetBrains Mono

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

*Documentation generated for Wakey Website v1.0.0*
