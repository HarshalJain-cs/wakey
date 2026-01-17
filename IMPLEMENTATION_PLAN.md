# Wakey - Complete Implementation Plan

> **Project:** Wakey - AI-Powered Productivity Platform
> **Part of:** Jarvis Master Project
> **Version:** 0.1.0
> **Date:** January 16, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Status](#2-current-status)
3. [Issues to Fix](#3-issues-to-fix)
4. [Production Readiness Checklist](#4-production-readiness-checklist)
5. [Jarvis Integration Plan](#5-jarvis-integration-plan)
6. [Implementation Phases](#6-implementation-phases)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Guide](#8-deployment-guide)

---

## 1. Project Overview

### What is Wakey?
Wakey is a comprehensive AI-powered desktop productivity platform for Windows that combines:
- Real-time activity tracking and app categorization
- Pomodoro-style focus sessions with quality scoring
- AI-powered productivity insights (Groq + Ollama)
- Task and project management
- Knowledge management (notes, flashcards, concept graphs)
- Cloud synchronization via Supabase
- Specialized dashboards (Trader, Developer)

### Tech Stack
| Component | Technology |
|-----------|------------|
| Language | TypeScript 5.3 |
| Frontend | React 18 + Vite 5 |
| Desktop | Electron 28 |
| Styling | Tailwind CSS 3.3 |
| Database | SQLite (local) + Supabase (cloud) |
| AI | Groq (primary) + Ollama (fallback) |
| Build | Turborepo + pnpm |
| State | Zustand |
| Charts | Recharts |

### Project Structure
```
wakey/
├── apps/
│   └── desktop/          # Electron + React app
│       ├── src/
│       │   ├── main/     # Electron main process
│       │   ├── preload/  # IPC bridge
│       │   └── renderer/ # React UI (components, pages, services)
├── packages/
│   ├── ai/               # AI provider integration
│   ├── database/         # SQLite abstraction
│   ├── tracking/         # Activity tracking
│   └── shared/           # Types & utilities
└── docs/                 # Documentation
```

---

## 2. Current Status

### Implemented Features (100% Complete)
- [x] Activity Tracking (active-win integration)
- [x] Focus Timer (Pomodoro + custom durations)
- [x] Dashboard with 6 customizable widgets
- [x] Task Management
- [x] Project Management
- [x] Analytics & Charts
- [x] AI Insights (Groq integration)
- [x] Distraction Detection & Alerts
- [x] Multi-Model AI Consensus
- [x] Knowledge Graph
- [x] Flashcards (Spaced Repetition)
- [x] Achievements System
- [x] Settings Page
- [x] Dark/Light Mode
- [x] System Tray Integration
- [x] Global Keyboard Shortcuts (Ctrl+Shift+F/T)
- [x] Command Palette
- [x] Onboarding Wizard
- [x] Trader Dashboard
- [x] Developer Dashboard
- [x] Supabase Authentication
- [x] Cloud Sync
- [x] Auto-Update System

### Pages (20 total)
Dashboard, Focus, Tasks, Projects, Analytics, Research, Integrations, Trader Dashboard, Developer Dashboard, AI Consensus, Knowledge, Agents, Flashcards, Cloud Sync, Achievements, Goals, Music, Shortcuts, Settings, Auth

### Services (30+)
ai.ts, multi-model-service.ts, knowledge-service.ts, agents-service.ts, sync-service.ts, achievements-service.ts, auto-journaling-service.ts, burnout-detection-service.ts, context-awareness-service.ts, deep-work-service.ts, focus-prediction-service.ts, focus-challenges-service.ts, focus-rituals-service.ts, productivity-score.ts, export-service.ts, plugin-system-service.ts, and more...

---

## 3. Issues to Fix

### Priority 1: Critical TypeScript Errors

#### 3.1 Main Process - active-win Import Issue
**File:** `apps/desktop/src/main/index.ts:436`
**Error:** Type mismatch with active-win module import
**Fix:**
```typescript
// Current (broken)
activeWin = await import('active-win');

// Fixed
const activeWinModule = await import('active-win');
activeWin = activeWinModule.default || activeWinModule;
```

#### 3.2 Unused Imports in Main Process
**File:** `apps/desktop/src/main/index.ts:20-22`
**Fix:** Remove unused `resolve` and `fileURLToPath` imports

#### 3.3 Missing Module - screenshot-desktop
**File:** `packages/tracking/src/index.ts:61`
**Fix:** Either install the module or remove the unused import
```bash
pnpm add screenshot-desktop -w --filter @wakey/tracking
```
Or remove if not needed.

### Priority 2: TypeScript Configuration

#### 3.4 Shared Package tsconfig Issue
**Problem:** Shared packages are trying to compile desktop React files
**Fix:** Update `packages/shared/tsconfig.json` to exclude desktop app files:
```json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["../../apps/**/*"]
}
```

#### 3.5 Vite/Vitest Version Conflict
**File:** `apps/desktop/vitest.config.ts`
**Problem:** vite@5.4.21 incompatible with vitest@4.0.17 (uses vite@7.3.1)
**Fix:** Pin vitest to compatible version:
```bash
pnpm add vitest@1.6.0 -D --filter @wakey/desktop
```

#### 3.6 import.meta.env TypeScript Errors
**Files:**
- `services/google-calendar-service.ts:34`
- `services/spotify-service.ts:30`
- `services/weather-service.ts:70`

**Fix:** Add vite client types to tsconfig:
```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### Priority 3: Code Quality Issues

#### 3.7 Unused Imports to Remove
| File | Unused Imports |
|------|----------------|
| `pages/ShortcutsPage.tsx:1` | Play, Pause, Settings, BarChart3 |
| `services/ai.ts:84` | callOllama |
| `services/api-access-service.ts:307` | data |
| `services/audio-service.ts:156-157` | oscillator, gain |
| `services/deep-work-service.ts:40` | contextSwitchCount |
| `services/deep-work-service.ts:72` | windowTitle |
| `services/google-calendar-service.ts:43` | lastSync |
| `services/google-calendar-service.ts:124` | timeMin |
| `services/weather-service.ts:51` | forecast |
| `services/__tests__/agents-service.test.ts:10` | vi |
| `services/__tests__/agents-service.test.ts:13` | AgentType |
| `services/__tests__/ai.test.ts:11` | vi, beforeEach |

#### 3.8 Type Mismatch in API Service
**File:** `services/api-access-service.ts:246`
**Error:** Type 'APIKey | undefined' not assignable to 'APIKey | null'
**Fix:**
```typescript
// Change return type or add null coalescing
return keys.find(k => k.id === id) ?? null;
```

---

## 4. Production Readiness Checklist

### Phase 1: Code Quality
- [ ] Fix all TypeScript errors (Section 3)
- [ ] Remove all unused imports
- [ ] Run ESLint and fix warnings
- [ ] Ensure all tests pass
- [ ] Add error boundaries to all pages

### Phase 2: Security
- [ ] Audit all IPC channels for security vulnerabilities
- [ ] Implement Content Security Policy (CSP) headers
- [ ] Validate all user inputs
- [ ] Secure API key storage (use electron-store with encryption)
- [ ] Add rate limiting for AI API calls
- [ ] Review Supabase Row Level Security (RLS) policies

### Phase 3: Performance
- [ ] Enable production optimizations in Vite build
- [ ] Implement lazy loading for pages
- [ ] Add virtualization for long lists
- [ ] Optimize SQLite queries with indexes
- [ ] Minimize bundle size (analyze with rollup-plugin-visualizer)

### Phase 4: User Experience
- [ ] Complete onboarding flow testing
- [ ] Add loading states to all async operations
- [ ] Implement proper error messages
- [ ] Add offline mode indicators
- [ ] Test all keyboard shortcuts
- [ ] Verify system tray functionality

### Phase 5: Distribution
- [ ] Configure code signing for Windows (removes security warnings)
- [ ] Set up GitHub repository for releases
- [ ] Configure auto-updater with proper GitHub token
- [ ] Create installer icons at all required sizes
- [ ] Test installation on clean Windows machine
- [ ] Write user documentation

### Phase 6: Monitoring
- [ ] Implement error logging/reporting (e.g., Sentry)
- [ ] Add analytics for feature usage (opt-in)
- [ ] Create health check endpoints
- [ ] Set up crash reporting

---

## 5. Jarvis Integration Plan

### Integration Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    JARVIS MASTER PROJECT                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Wakey     │  │   Module 2   │  │   Module 3   │      │
│  │ (Productivity)│  │              │  │              │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│         │ IPC/REST/WebSocket                                │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Jarvis Core Communication Hub           │       │
│  │  • Event Bus                                      │       │
│  │  • Shared State Manager                           │       │
│  │  • API Gateway                                    │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

#### 5.1 Data Sharing API
Create a REST/WebSocket API for Jarvis to consume Wakey data:

```typescript
// New file: apps/desktop/src/main/jarvis-api.ts

interface JarvisAPI {
  // Activity data
  getActivitySummary(date: string): Promise<ActivitySummary>;
  getProductivityScore(date: string): Promise<number>;
  getActiveAppStats(range: DateRange): Promise<AppStats[]>;

  // Focus sessions
  getCurrentFocusSession(): Promise<FocusSession | null>;
  startFocusSession(duration: number): Promise<void>;
  endFocusSession(): Promise<FocusResult>;

  // Tasks
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  createTask(task: TaskInput): Promise<Task>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<void>;

  // AI insights
  getLatestInsight(): Promise<AIInsight>;
  requestInsight(context: string): Promise<AIInsight>;

  // Events (for real-time updates)
  onActivityChange(callback: (activity: Activity) => void): Unsubscribe;
  onFocusSessionUpdate(callback: (session: FocusSession) => void): Unsubscribe;
}
```

#### 5.2 IPC Channels for Jarvis
Add new IPC channels for Jarvis communication:

```typescript
// Add to apps/desktop/src/main/index.ts

// Jarvis integration channels
ipcMain.handle('jarvis:getActivitySummary', async (_, date) => {
  return await getActivitySummary(date);
});

ipcMain.handle('jarvis:getProductivityScore', async (_, date) => {
  return await calculateProductivityScore(date);
});

ipcMain.handle('jarvis:subscribe', async (_, eventType) => {
  // Set up event forwarding to Jarvis
});
```

#### 5.3 Shared Supabase Backend
Use the same Supabase project for all Jarvis modules:

```sql
-- Wakey tables (already exist)
CREATE TABLE activity_logs (...);
CREATE TABLE focus_sessions (...);
CREATE TABLE tasks (...);

-- Jarvis shared tables (new)
CREATE TABLE jarvis_events (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL, -- 'wakey', 'module2', etc.
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jarvis_commands (
  id UUID PRIMARY KEY,
  target TEXT NOT NULL, -- 'wakey', 'module2', etc.
  command TEXT NOT NULL,
  params JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.4 Event-Driven Communication
Implement pub/sub pattern for real-time Jarvis integration:

```typescript
// New file: apps/desktop/src/renderer/services/jarvis-bridge.ts

import { createClient } from '@supabase/supabase-js';

class JarvisBridge {
  private supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Publish events to Jarvis
  async publishEvent(eventType: string, payload: any) {
    await this.supabase.from('jarvis_events').insert({
      source: 'wakey',
      event_type: eventType,
      payload
    });
  }

  // Subscribe to commands from Jarvis
  subscribeToCommands(callback: (command: Command) => void) {
    return this.supabase
      .channel('jarvis-commands')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'jarvis_commands',
        filter: 'target=eq.wakey'
      }, (payload) => {
        callback(payload.new as Command);
      })
      .subscribe();
  }

  // Event types Wakey publishes
  static Events = {
    ACTIVITY_CHANGED: 'wakey.activity.changed',
    FOCUS_STARTED: 'wakey.focus.started',
    FOCUS_ENDED: 'wakey.focus.ended',
    TASK_COMPLETED: 'wakey.task.completed',
    PRODUCTIVITY_ALERT: 'wakey.productivity.alert',
    DISTRACTION_DETECTED: 'wakey.distraction.detected',
  };
}

export const jarvisBridge = new JarvisBridge();
```

#### 5.5 Configuration for Jarvis Mode
Add Jarvis-specific settings:

```typescript
// Add to settings store
interface JarvisSettings {
  enabled: boolean;
  masterApiUrl?: string;
  shareActivityData: boolean;
  shareFocusData: boolean;
  shareTaskData: boolean;
  receiveCommands: boolean;
  autoStartWithJarvis: boolean;
}
```

---

## 6. Implementation Phases

### Phase 1: Bug Fixes (Immediate)
**Duration:** 1-2 days

1. Fix active-win import issue in main/index.ts
2. Remove all unused imports
3. Fix TypeScript configuration issues
4. Resolve vitest version conflict
5. Add vite/client types for import.meta.env
6. Fix api-access-service type mismatch

### Phase 2: Code Cleanup
**Duration:** 2-3 days

1. Run ESLint --fix on entire codebase
2. Add proper TypeScript strict mode
3. Implement error handling in all services
4. Add loading states to components
5. Write missing unit tests

### Phase 3: Production Hardening
**Duration:** 3-5 days

1. Security audit and fixes
2. Performance optimization
3. Bundle size optimization
4. Memory leak detection and fixes
5. Stress testing

### Phase 4: Jarvis Integration
**Duration:** 5-7 days

1. Create Jarvis API service
2. Implement IPC channels for Jarvis
3. Set up Supabase shared tables
4. Implement event bridge
5. Add Jarvis settings UI
6. Test integration with mock Jarvis

### Phase 5: Distribution
**Duration:** 2-3 days

1. Set up code signing
2. Configure GitHub releases
3. Build and test installer
4. Create release documentation
5. Publish v1.0.0

---

## 7. Testing Strategy

### Unit Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test:watch
```

**Test Files to Create:**
- [ ] `services/sync-service.test.ts`
- [ ] `services/productivity-score.test.ts`
- [ ] `services/jarvis-bridge.test.ts`
- [ ] `components/Dashboard.test.tsx`
- [ ] `pages/FocusPage.test.tsx`

### Integration Tests
- [ ] Test Electron main/renderer IPC communication
- [ ] Test Supabase sync operations
- [ ] Test AI service fallback (Groq -> Ollama)
- [ ] Test auto-updater flow

### E2E Tests (Future)
Consider adding Playwright for E2E testing:
```bash
pnpm add -D @playwright/test --filter @wakey/desktop
```

---

## 8. Deployment Guide

### Development
```bash
# Install dependencies
cd wakey
pnpm install

# Run in development
pnpm dev
```

### Production Build
```bash
# Build all packages
pnpm build

# Package for Windows
cd apps/desktop
npm run package:win

# Output: apps/desktop/release/
#   - Wakey-0.1.0-x64.exe (installer)
#   - Wakey-0.1.0-Portable.exe (portable)
```

### Environment Variables
```env
# apps/desktop/.env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
GH_TOKEN=your_github_token  # For auto-updates
VITE_GROQ_API_KEY=optional_groq_key
```

### GitHub Release Process
1. Update version in package.json files
2. Create git tag: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. Build and upload release assets
5. Auto-updater will detect new version

### Code Signing (Recommended)
For production releases, sign the Windows executable:
1. Obtain a code signing certificate (e.g., DigiCert, Sectigo)
2. Add to electron-builder config:
```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "ENV_CERT_PASSWORD"
  }
}
```

---

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm desktop          # Start desktop only

# Building
pnpm build            # Build all
pnpm desktop:build    # Build desktop

# Testing
pnpm test             # Run tests
pnpm lint             # Run linter

# Cleaning
pnpm clean            # Clean all builds

# Packaging
cd apps/desktop && npm run package:win  # Windows installer
```

---

## Contact & Resources

- **Repository:** [GitHub - wakey](https://github.com/HarshalJain-cs/wakey)
- **Supabase Project:** dwykevngjgesfkdylesq.supabase.co
- **Documentation:** See `/docs` folder

---

*This implementation plan was generated on January 16, 2026. Update as needed.*
