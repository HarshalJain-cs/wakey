# Wakey - Complete Implementation Plan

> **Project:** Wakey - AI-Powered Productivity Platform
> **Part of:** Jarvis Master Project
> **Version:** 0.2.0
> **Date:** January 22, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Status](#2-current-status)
3. [**New Initiative: Premium Subscription Website**](#3-new-initiative-premium-subscription-website)
    1. [Project Goals](#31-project-goals)
    2. [Key Decisions](#32-key-decisions)
    3. [Technology Stack](#33-technology-stack)
    4. [Implementation Plan: Phased Rollout](#34-implementation-plan-phased-rollout)
        1. [Phase A: Foundation & Project Setup](#phase-a-foundation--project-setup)
        2. [Phase B: Backend & Payments API](#phase-b-backend--payments-api)
        3. [Phase C: Frontend & User Interface](#phase-c-frontend--user-interface)
        4. [Phase D: Integration & Testing](#phase-d-integration--testing)
        5. [Phase E: Deployment & Launch](#phase-e-deployment--launch)
4. [Desktop App: Issues to Fix](#4-desktop-app-issues-to-fix)
5. [Desktop App: Production Readiness](#5-desktop-app-production-readiness)
6. [Jarvis Integration Plan](#6-jarvis-integration-plan)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Guide](#8-deployment-guide)

---

## 1. Project Overview
(Content remains the same as version 0.1.0)
...

---

## 2. Current Status
(Content remains the same as version 0.1.0)
...

---

## 3. New Initiative: Premium Subscription Website

### 3.1. Project Goals
- To create a public-facing website for marketing Wakey and converting users to a premium subscription.
- To handle user authentication, payment processing, and subscription management.
- To provide a dashboard for premium users to manage their account and billing.

### 3.2. Key Decisions
Based on our discussion, the following has been decided:
- **Pricing:** The launch prices are **$2.50/week** and **$100/year**. These are confirmed to be the **50% discounted prices**.
- **Payment Processors:** We will integrate **both Stripe (for international payments) and Razorpay (for payments within India)**.
- **Project Location:** The website will be a new application within the existing monorepo at `apps/website/`.

### 3.3. Technology Stack
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ | Excellent for both static marketing pages and dynamic application logic (API Routes). Stays within the React ecosystem. |
| Language | TypeScript | Consistent with the rest of the monorepo. |
| Styling | Tailwind CSS | Consistent with the desktop application. |
| UI Components | Shadcn/UI | Provides beautiful, accessible, and unopinionated components that are easy to customize with Tailwind. |
| Database | Supabase (Postgres) | Leverage the existing database used for the desktop app's cloud sync. |
| Payments | Stripe SDK, Razorpay SDK | Official libraries for robust and secure payment processing. |
| Deployment | Vercel / Netlify | Native integration with Next.js for seamless CI/CD. |

### 3.4. Implementation Plan: Phased Rollout

#### Phase A: Foundation & Project Setup
**Goal:** Create the skeleton of the `website` application and configure it within the monorepo.
- [ ] **1. Scaffold Next.js App:**
    - Create a new Next.js application in `apps/website/`.
    - Use `pnpm create next-app -- --typescript --tailwind --eslint`.
- [ ] **2. Monorepo Integration:**
    - Add the new `website` app to `pnpm-workspace.yaml`.
    - Update `turbo.json` to include build and development pipelines for `website`.
- [ ] **3. Basic Structure:**
    - Create main page layouts (`/app`, `/auth`).
    - Set up basic marketing pages (Landing, Features, About).
- [ ] **4. Component Library:**
    - Install and configure `Shadcn/UI`.
- [ ] **5. Environment Setup:**
    - Create `.env.local` for Supabase, Stripe, and Razorpay keys.

#### Phase B: Backend & Payments API
**Goal:** Build the server-side logic to handle users, subscriptions, and payments from both providers.
- [ ] **1. Database Schema:**
    - Extend the Supabase schema in the `database` package.
    - Add `subscriptions` table (linking users to plans, includes `status`, `provider`, `current_period_end`).
    - Add `customers` table to map users to Stripe/Razorpay customer IDs.
- [ ] **2. API Endpoints (Next.js API Routes):**
    - `POST /api/auth/*`: User sign-up and login (leveraging Supabase Auth).
    - `POST /api/webhooks/stripe`: Handle subscription events from Stripe (e.g., `invoice.payment_succeeded`).
    - `POST /api/webhooks/razorpay`: Handle subscription events from Razorpay (e.g., `subscription.charged`).
    - `POST /api/checkout-sessions`: Create a Stripe or Razorpay checkout session based on user's geography or choice.
    - `GET /api/subscription`: Fetch the current user's subscription status.
- [ ] **3. Payment Logic:**
    - Implement a service/utility to determine whether to use Stripe or Razorpay. This could be based on IP address geolocation or user selection.
    - Write robust webhook handlers that update the `subscriptions` table atomically. Security is paramount here.

#### Phase C: Frontend & User Interface
**Goal:** Build the user-facing pages for pricing, checkout, and account management.
- [ ] **1. Pricing Page (`/pricing`):**
    - Design a clear, responsive pricing table component.
    - Display weekly and yearly plans.
    - "Get Started" buttons will lead to the checkout flow.
- [ ] **2. Checkout Flow:**
    - Create a checkout form that dynamically loads either the Stripe Checkout or Razorpay Checkout.
    - Handle loading states, successful payment redirection, and error messages.
- [ ] **3. User Dashboard (`/account`):**
    - This page is for signed-in, subscribed users.
    - Display current plan, billing cycle, and payment status.
    - Provide a button to "Manage Billing" which redirects to the respective provider's portal (Stripe Customer Portal or a Razorpay-linked page).
    - Show billing history.
- [ ] **4. Authentication Pages:**
    - Build Login and Sign-up pages that integrate with Supabase Auth.

#### Phase D: Integration & Testing
**Goal:** Connect the frontend to the backend, and thoroughly test the entire payment funnel.
- [ ] **1. End-to-End Testing (Manual):**
    - Test the full user journey: Sign-up -> Select Plan -> Pay with Stripe (using test cards) -> Verify subscription status in Dashboard.
    - Repeat the entire journey for Razorpay (using its test environment).
- [ ] **2. Webhook Testing:**
    - Use Stripe CLI and ngrok (or similar) to test webhook handlers locally.
    - Ensure subscription status is correctly updated in the database upon successful payment events.
- [ ] **3. Automated Testing:**
    - Write unit tests for API route logic.
    - Write integration tests for the payment provider selection logic.

#### Phase E: Deployment & Launch
**Goal:** Go live.
- [ ] **1. Configure Production Environment:**
    - Set up a new Vercel or Netlify project linked to the monorepo.
    - Configure the build command and root directory (`apps/website`).
    - Add production environment variables for all services.
- [ ] **2. Final Checks:**
    - Ensure all links, metadata, and SEO tags are correct.
    - Perform a final security review of webhook endpoints.
- [ ] **3. Go Live:**
    - Merge to `main` branch and trigger production deployment.
    - Monitor logs for any errors.

---

## 4. Desktop App: Issues to Fix
(Formerly Section 3 - Content remains the same)
...

## 5. Desktop App: Production Readiness
(Formerly Section 4 - Content remains the same)
...

## 6. Jarvis Integration Plan
(Formerly Section 5 - Content remains the same)
...

## 7. Testing Strategy
(Formerly Section 6 - Content remains the same, may be updated later to include website tests)
...

## 8. Deployment Guide
(Formerly Section 7 - Content remains the same, may be updated later to include website deployment)
...

---
*This implementation plan was updated on January 22, 2026. This version includes the plan for the new Premium Subscription Website.*