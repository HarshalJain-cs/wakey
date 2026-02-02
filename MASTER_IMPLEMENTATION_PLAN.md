# WAKEY - MASTER IMPLEMENTATION PLAN
## The Ultimate Production-Ready Productivity Platform

> **Version:** 1.0.0 PRODUCTION
> **Target:** All Ratings 10/10 | 100+ Integrations | Startup-Ready
> **Generated:** February 2, 2026

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Production Build & Distribution (.exe)](#2-production-build--distribution)
3. [Core Features - Path to 10/10](#3-core-features---path-to-1010)
4. [AI Intelligence - Path to 10/10](#4-ai-intelligence---path-to-1010)
5. [Gamification - Path to 10/10](#5-gamification---path-to-1010)
6. [Health & Wellness + Wearable Integrations](#6-health--wellness--wearable-integrations)
7. [Complete Integrations (100+)](#7-complete-integrations-100)
8. [Advanced Features](#8-advanced-features)
9. [Missing Critical Features](#9-missing-critical-features)
10. [Enhanced Opportunities](#10-enhanced-opportunities)
11. [Code Quality - Path to 10/10](#11-code-quality---path-to-1010)
12. [Architecture - Path to 10/10](#12-architecture---path-to-1010)
13. [Testing - Path to 10/10](#13-testing---path-to-1010)
14. [Security - Path to 10/10](#14-security---path-to-1010)
15. [Documentation - Path to 10/10](#15-documentation---path-to-1010)
16. [Maintainability - Path to 10/10](#16-maintainability---path-to-1010)
17. [Database Architecture](#17-database-architecture)
18. [Competitive Parity Implementation](#18-competitive-parity-implementation)
19. [Phased Execution Timeline](#19-phased-execution-timeline)
20. [Success Metrics & KPIs](#20-success-metrics--kpis)

---

# 1. EXECUTIVE SUMMARY

## Current State vs Target State

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Feature Completeness | 8.5/10 | **10/10** | +1.5 |
| Code Quality | 6.5/10 | **10/10** | +3.5 |
| Architecture | 7.0/10 | **10/10** | +3.0 |
| Testing | 5.0/10 | **10/10** | +5.0 |
| Performance | 7.5/10 | **10/10** | +2.5 |
| Security | 6.0/10 | **10/10** | +4.0 |
| Documentation | 8.0/10 | **10/10** | +2.0 |
| Maintainability | 7.0/10 | **10/10** | +3.0 |
| **Overall** | **7.2/10** | **10/10** | **+2.8** |

## Transformation Goals

1. **Production .exe Distribution** - Downloadable installer (200-500 MB)
2. **100+ Integrations** - Match/exceed Notion's integration ecosystem
3. **All Features 10/10** - Perfect implementation of every feature
4. **Startup-Ready** - Scalable, monetizable, investor-ready
5. **Competitive Dominance** - Beat Notion, Todoist, RescueTime, Forest, Centered

---

# 2. PRODUCTION BUILD & DISTRIBUTION

## 2.1 Electron Builder Configuration

### File: `apps/desktop/electron-builder.yml`

```yaml
appId: com.wakey.productivity
productName: Wakey
copyright: Copyright © 2026 Wakey Inc.

directories:
  output: dist/installers
  buildResources: build

files:
  - "dist/**/*"
  - "node_modules/**/*"
  - "package.json"

extraResources:
  - from: "resources/"
    to: "resources/"
    filter:
      - "**/*"

# Windows Configuration
win:
  target:
    - target: nsis
      arch:
        - x64
        - arm64
    - target: portable
      arch:
        - x64
  icon: build/icon.ico
  artifactName: "Wakey-Setup-${version}-${arch}.${ext}"
  publisherName: Wakey Inc.
  verifyUpdateCodeSignature: true
  signAndEditExecutable: true

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  installerHeaderIcon: build/icon.ico
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: Wakey
  license: LICENSE.txt
  installerSidebar: build/installerSidebar.bmp
  uninstallerSidebar: build/uninstallerSidebar.bmp
  include: build/installer.nsh
  deleteAppDataOnUninstall: false

# Mac Configuration
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64
  icon: build/icon.icns
  category: public.app-category.productivity
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist

dmg:
  sign: false
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications

# Linux Configuration
linux:
  target:
    - target: AppImage
      arch:
        - x64
        - arm64
    - target: deb
      arch:
        - x64
    - target: rpm
      arch:
        - x64
  icon: build/icons
  category: Office
  maintainer: support@wakey.app
  vendor: Wakey Inc.

# Auto-update Configuration
publish:
  provider: github
  owner: wakey-app
  repo: wakey-desktop
  releaseType: release

# Compression
compression: maximum
```

## 2.2 Build Scripts

### Add to `apps/desktop/package.json`:

```json
{
  "scripts": {
    "build:prod": "npm run build && electron-builder --config electron-builder.yml",
    "build:win": "npm run build && electron-builder --win --config electron-builder.yml",
    "build:win:portable": "npm run build && electron-builder --win portable",
    "build:mac": "npm run build && electron-builder --mac --config electron-builder.yml",
    "build:linux": "npm run build && electron-builder --linux --config electron-builder.yml",
    "build:all": "npm run build && electron-builder -mwl --config electron-builder.yml",
    "release": "npm run build && electron-builder --publish always",
    "release:draft": "npm run build && electron-builder --publish onTagOrDraft"
  },
  "devDependencies": {
    "electron-builder": "^24.13.3",
    "electron-notarize": "^1.2.2",
    "electron-updater": "^6.1.7"
  }
}
```

## 2.3 Auto-Update System

### File: `apps/desktop/src/main/auto-updater.ts`

```typescript
import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import log from 'electron-log';

export class AutoUpdaterService {
  private mainWindow: BrowserWindow | null = null;

  constructor(window: BrowserWindow) {
    this.mainWindow = window;
    this.configureAutoUpdater();
    this.setupEventHandlers();
  }

  private configureAutoUpdater(): void {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 4 * 60 * 60 * 1000);
  }

  private setupEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
      this.sendToRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendToRenderer('update-available', info);
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Available',
        message: `Version ${info.version} is available. Download now?`,
        buttons: ['Download', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-not-available', () => {
      this.sendToRenderer('update-not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
      this.sendToRenderer('update-download-progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendToRenderer('update-downloaded', info);
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart to apply?',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    autoUpdater.on('error', (error) => {
      this.sendToRenderer('update-error', error.message);
    });

    // IPC handlers
    ipcMain.handle('check-for-updates', () => autoUpdater.checkForUpdates());
    ipcMain.handle('download-update', () => autoUpdater.downloadUpdate());
    ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());
    ipcMain.handle('get-version', () => app.getVersion());
  }

  private sendToRenderer(channel: string, data?: any): void {
    this.mainWindow?.webContents.send(channel, data);
  }

  public checkForUpdates(): void {
    autoUpdater.checkForUpdates();
  }
}
```

## 2.4 Code Signing Setup

### Windows Code Signing:
```bash
# Install Windows SDK for signtool
# Get EV Code Signing Certificate from DigiCert/Sectigo/Comodo

# Environment variables for electron-builder
CSC_LINK=path/to/certificate.pfx
CSC_KEY_PASSWORD=your_password
```

### macOS Notarization:
```javascript
// build/notarize.js
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  return await notarize({
    appBundleId: 'com.wakey.productivity',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  });
};
```

## 2.5 Expected Build Output

```
dist/installers/
├── Wakey-Setup-1.0.0-x64.exe          (~180 MB)
├── Wakey-Setup-1.0.0-arm64.exe        (~175 MB)
├── Wakey-Portable-1.0.0-x64.exe       (~200 MB)
├── Wakey-1.0.0-x64.dmg                (~190 MB)
├── Wakey-1.0.0-arm64.dmg              (~185 MB)
├── Wakey-1.0.0-x86_64.AppImage        (~195 MB)
├── wakey_1.0.0_amd64.deb              (~180 MB)
├── wakey-1.0.0-x86_64.rpm             (~180 MB)
├── latest.yml                          (update manifest)
├── latest-mac.yml                      (mac update manifest)
└── latest-linux.yml                    (linux update manifest)
```

## 2.6 Build Commands

```bash
# Development build
pnpm run build:prod

# Windows installer (from Windows machine)
pnpm run build:win

# All platforms (requires all platform SDKs)
pnpm run build:all

# Release with auto-publish to GitHub
pnpm run release
```

---

# 3. CORE FEATURES - PATH TO 10/10

## 3.1 Focus Timer (Pomodoro) - Current: 9/10 → Target: 10/10

### Gap Analysis:
- Missing custom session patterns
- No break suggestions based on fatigue
- Limited statistics export

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.1.1 | Add custom timer patterns (52/17, 90/20, custom) | High |
| 3.1.2 | Implement AI-powered break suggestions based on focus quality | High |
| 3.1.3 | Add session export (CSV, JSON, PDF) | Medium |
| 3.1.4 | Implement session templates (coding, writing, studying) | Medium |
| 3.1.5 | Add haptic/sound customization per session type | Low |
| 3.1.6 | Implement focus quality scoring in real-time | High |
| 3.1.7 | Add collaborative focus sessions (virtual coworking) | Medium |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-pomodoro-service.ts

interface FocusPattern {
  id: string;
  name: string;
  workDuration: number;      // minutes
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLong: number;
  autoStart: boolean;
  soundTheme: string;
}

interface SessionTemplate {
  id: string;
  name: string;
  pattern: FocusPattern;
  ambientSound?: string;
  distractionBlocking: 'none' | 'soft' | 'strict';
  goals: string[];
}

const BUILT_IN_PATTERNS: FocusPattern[] = [
  { id: 'classic', name: 'Classic Pomodoro', workDuration: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4, autoStart: false, soundTheme: 'default' },
  { id: 'ultradian', name: 'Ultradian Rhythm', workDuration: 90, shortBreak: 20, longBreak: 30, sessionsBeforeLong: 2, autoStart: true, soundTheme: 'nature' },
  { id: 'flowtime', name: 'Flowtime', workDuration: 52, shortBreak: 17, longBreak: 30, sessionsBeforeLong: 3, autoStart: true, soundTheme: 'ambient' },
  { id: 'sprint', name: 'Sprint Mode', workDuration: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 6, autoStart: true, soundTheme: 'energetic' },
  { id: 'deep-work', name: 'Deep Work', workDuration: 120, shortBreak: 30, longBreak: 60, sessionsBeforeLong: 2, autoStart: false, soundTheme: 'silence' },
];

export class EnhancedPomodoroService {
  private currentPattern: FocusPattern;
  private fatigueLevel: number = 0;
  private sessionQuality: number = 100;

  async getAdaptiveBreakSuggestion(): Promise<{ duration: number; activity: string }> {
    const fatigue = await this.calculateFatigueLevel();
    const timeOfDay = new Date().getHours();
    const sessionCount = await this.getTodaySessionCount();

    // AI-powered break optimization
    if (fatigue > 80) {
      return { duration: 30, activity: 'Take a walk outside' };
    } else if (fatigue > 60) {
      return { duration: 15, activity: 'Stretching exercises' };
    } else if (timeOfDay >= 14 && timeOfDay <= 16) {
      return { duration: 20, activity: 'Power nap recommended' };
    } else if (sessionCount > 6) {
      return { duration: 20, activity: 'Eye exercises and hydration' };
    }

    return { duration: this.currentPattern.shortBreak, activity: 'Quick break' };
  }

  async exportSessions(format: 'csv' | 'json' | 'pdf', dateRange: { start: Date; end: Date }): Promise<Blob> {
    // Implementation for session export
  }

  createCollaborativeSession(participants: string[]): CollaborativeSession {
    // Virtual coworking implementation
  }
}
```

## 3.2 Deep Work Tracking - Current: 8/10 → Target: 10/10

### Gap Analysis:
- No distraction detection
- Missing context switching metrics
- No app-specific deep work scoring

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.2.1 | Implement real-time distraction detection | Critical |
| 3.2.2 | Add context switching frequency tracking | High |
| 3.2.3 | Create app-specific productivity scores | High |
| 3.2.4 | Implement "Flow State" detection algorithm | Critical |
| 3.2.5 | Add deep work heatmaps by hour/day | Medium |
| 3.2.6 | Create automatic deep work session markers | High |
| 3.2.7 | Implement distraction-free mode triggers | Medium |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-deep-work-service.ts

interface FlowState {
  inFlow: boolean;
  flowScore: number;        // 0-100
  flowDuration: number;     // minutes in current flow
  distractions: number;     // count since flow started
  contextSwitches: number;
}

interface DeepWorkMetrics {
  dailyDeepWorkMinutes: number;
  deepWorkPercentage: number;
  averageFlowDuration: number;
  distractionFrequency: number;     // per hour
  contextSwitchFrequency: number;   // per hour
  peakFlowHours: number[];
  appProductivityScores: Map<string, number>;
}

export class EnhancedDeepWorkService {
  private flowState: FlowState = {
    inFlow: false,
    flowScore: 0,
    flowDuration: 0,
    distractions: 0,
    contextSwitches: 0
  };

  private readonly FLOW_THRESHOLD = 70;
  private readonly DISTRACTION_APPS = ['discord.exe', 'slack.exe', 'twitter.com', 'reddit.com'];

  async detectFlowState(): Promise<FlowState> {
    const metrics = await this.getCurrentMetrics();

    // Flow state algorithm
    const focusDuration = metrics.continuousFocusMinutes;
    const distractionRate = metrics.distractionsPerHour;
    const contextSwitchRate = metrics.contextSwitchesPerHour;
    const activeAppScore = await this.getActiveAppProductivityScore();

    // Calculate flow score (0-100)
    let flowScore = 50;
    flowScore += Math.min(focusDuration / 2, 20);           // +20 for 40+ min focus
    flowScore -= distractionRate * 5;                        // -5 per distraction/hour
    flowScore -= contextSwitchRate * 2;                      // -2 per context switch/hour
    flowScore += (activeAppScore - 50) / 2;                  // +/- based on app

    flowScore = Math.max(0, Math.min(100, flowScore));

    this.flowState = {
      inFlow: flowScore >= this.FLOW_THRESHOLD,
      flowScore,
      flowDuration: this.flowState.inFlow ? this.flowState.flowDuration + 1 : 0,
      distractions: metrics.recentDistractions,
      contextSwitches: metrics.recentContextSwitches
    };

    // Trigger distraction-free mode if in flow
    if (this.flowState.inFlow && this.flowState.flowDuration >= 5) {
      await this.enableDistractionFreeMode();
    }

    return this.flowState;
  }

  async getAppProductivityScores(): Promise<Map<string, number>> {
    // Machine learning based scoring
    const appUsageData = await this.getAppUsageHistory();
    const scores = new Map<string, number>();

    for (const [app, usage] of appUsageData) {
      const correlationWithProductivity = await this.calculateProductivityCorrelation(app, usage);
      const categoryScore = this.getAppCategoryBaseScore(app);
      const personalizedScore = (correlationWithProductivity * 0.7) + (categoryScore * 0.3);
      scores.set(app, Math.round(personalizedScore));
    }

    return scores;
  }

  generateDeepWorkHeatmap(): HeatmapData {
    // Returns hour-by-day deep work intensity
  }

  private async enableDistractionFreeMode(): Promise<void> {
    // Block notifications, mute apps, enable focus mode
    await notificationService.blockAll();
    await windowManager.hideDistractionApps();
    await systemTray.showFlowIndicator();
  }
}
```

## 3.3 Focus Trends Analysis - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.3.1 | Add predictive focus scoring (ML-based) | High |
| 3.3.2 | Implement weekly/monthly/yearly trend views | Medium |
| 3.3.3 | Add peer comparison (anonymous) | Medium |
| 3.3.4 | Create personalized improvement suggestions | High |
| 3.3.5 | Implement goal prediction based on trends | Medium |
| 3.3.6 | Add exportable trend reports | Low |

## 3.4 Smart Break System - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.4.1 | Add wearable-informed break timing | Critical |
| 3.4.2 | Implement microbreak suggestions (20-20-20 rule) | High |
| 3.4.3 | Add stretch/exercise break routines | Medium |
| 3.4.4 | Create break activity gamification | Medium |
| 3.4.5 | Implement break compliance tracking | Low |

## 3.5 Productivity Scoring - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.5.1 | Add multi-factor scoring algorithm | High |
| 3.5.2 | Implement score benchmarking by profession | Medium |
| 3.5.3 | Create daily/weekly productivity digest | High |
| 3.5.4 | Add score breakdown visualization | Medium |
| 3.5.5 | Implement productivity coaching based on score | High |

## 3.6 Activity Tracking - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 3.6.1 | Add browser tab tracking (with consent) | High |
| 3.6.2 | Implement document/file activity tracking | High |
| 3.6.3 | Add meeting detection and categorization | Medium |
| 3.6.4 | Create activity categorization ML model | High |
| 3.6.5 | Implement idle vs. thinking detection | Medium |
| 3.6.6 | Add multi-monitor activity tracking | Low |

---

# 4. AI INTELLIGENCE - PATH TO 10/10

## 4.1 AI Insights - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 4.1.1 | Add proactive insight delivery | Critical |
| 4.1.2 | Implement personalized AI coaching | High |
| 4.1.3 | Create insight action buttons | High |
| 4.1.4 | Add weekly AI-generated productivity reports | Medium |
| 4.1.5 | Implement natural language querying | High |
| 4.1.6 | Add insight confidence scoring | Low |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-ai-insights-service.ts

interface ProactiveInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'coaching';
  title: string;
  description: string;
  confidence: number;
  actions: InsightAction[];
  scheduledTime: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface InsightAction {
  label: string;
  type: 'navigate' | 'execute' | 'schedule' | 'dismiss';
  payload: any;
}

export class EnhancedAIInsightsService {
  private insightQueue: ProactiveInsight[] = [];

  async generateProactiveInsights(): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];

    // Analyze current state
    const productivityData = await this.getProductivityData();
    const scheduleData = await this.getScheduleData();
    const healthData = await this.getHealthData();

    // Burnout warning
    if (healthData.burnoutRisk > 0.7) {
      insights.push({
        id: generateId(),
        type: 'warning',
        title: 'Burnout Risk Detected',
        description: `You've worked ${productivityData.weeklyHours} hours this week. Consider taking tomorrow off.`,
        confidence: 0.85,
        priority: 'critical',
        scheduledTime: new Date(),
        actions: [
          { label: 'Schedule Break', type: 'schedule', payload: { type: 'day-off' } },
          { label: 'View Details', type: 'navigate', payload: { page: '/health' } }
        ]
      });
    }

    // Optimal focus time suggestion
    const optimalHours = await this.predictOptimalFocusHours();
    insights.push({
      id: generateId(),
      type: 'opportunity',
      title: 'Optimal Focus Window',
      description: `Based on your patterns, ${optimalHours.start}-${optimalHours.end} is your peak focus time. Schedule deep work now.`,
      confidence: 0.78,
      priority: 'high',
      scheduledTime: new Date(optimalHours.start),
      actions: [
        { label: 'Block Calendar', type: 'execute', payload: { action: 'block-focus-time', hours: optimalHours } },
        { label: 'Start Focus Session', type: 'navigate', payload: { page: '/focus' } }
      ]
    });

    return insights;
  }

  async queryNaturalLanguage(query: string): Promise<AIResponse> {
    // "How productive was I last week compared to the week before?"
    // "What's my best day for deep work?"
    // "Show me my focus trends for this month"

    const parsed = await this.parseQuery(query);
    const data = await this.fetchRelevantData(parsed);
    const response = await this.generateResponse(parsed, data);

    return response;
  }

  async generateWeeklyDigest(): Promise<ProductivityDigest> {
    const weekData = await this.getWeekData();

    return {
      summary: await this.generateSummary(weekData),
      highlights: await this.extractHighlights(weekData),
      improvements: await this.identifyImprovements(weekData),
      goals: await this.suggestGoals(weekData),
      comparisons: await this.generateComparisons(weekData),
      visualizations: await this.createVisualizations(weekData)
    };
  }
}
```

## 4.2 Multi-Model Consensus - Current: 9/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 4.2.1 | Add more AI providers (Gemini, Mistral, Llama) | High |
| 4.2.2 | Implement weighted voting based on task type | High |
| 4.2.3 | Add consensus visualization | Medium |
| 4.2.4 | Implement fallback chains | Critical |
| 4.2.5 | Add model performance analytics | Medium |
| 4.2.6 | Create cost optimization routing | High |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-multi-model-service.ts

interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  costPer1KTokens: number;
  averageLatency: number;
  strengths: TaskType[];
}

interface AIModel {
  id: string;
  name: string;
  contextWindow: number;
  capabilities: string[];
}

interface ConsensusResult {
  finalAnswer: string;
  confidence: number;
  votes: ModelVote[];
  reasoning: string;
  costEstimate: number;
  latency: number;
}

interface ModelVote {
  model: string;
  response: string;
  confidence: number;
  weight: number;
  reasoning: string;
}

export class EnhancedMultiModelService {
  private providers: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, capabilities: ['reasoning', 'coding', 'analysis'] },
        { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, capabilities: ['multimodal', 'reasoning', 'speed'] }
      ],
      costPer1KTokens: 0.01,
      averageLatency: 800,
      strengths: ['coding', 'analysis', 'creative']
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      models: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus', contextWindow: 200000, capabilities: ['reasoning', 'safety', 'long-context'] },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', contextWindow: 200000, capabilities: ['balanced', 'speed', 'accuracy'] }
      ],
      costPer1KTokens: 0.015,
      averageLatency: 600,
      strengths: ['reasoning', 'writing', 'safety']
    },
    {
      id: 'google',
      name: 'Google',
      models: [
        { id: 'gemini-ultra', name: 'Gemini Ultra', contextWindow: 1000000, capabilities: ['multimodal', 'long-context', 'reasoning'] },
        { id: 'gemini-pro', name: 'Gemini Pro', contextWindow: 128000, capabilities: ['balanced', 'speed'] }
      ],
      costPer1KTokens: 0.007,
      averageLatency: 500,
      strengths: ['research', 'multimodal', 'factual']
    },
    {
      id: 'mistral',
      name: 'Mistral',
      models: [
        { id: 'mistral-large', name: 'Mistral Large', contextWindow: 32000, capabilities: ['reasoning', 'multilingual'] },
        { id: 'mistral-medium', name: 'Mistral Medium', contextWindow: 32000, capabilities: ['speed', 'cost'] }
      ],
      costPer1KTokens: 0.004,
      averageLatency: 400,
      strengths: ['speed', 'coding', 'multilingual']
    },
    {
      id: 'meta',
      name: 'Meta',
      models: [
        { id: 'llama-3-70b', name: 'Llama 3 70B', contextWindow: 8192, capabilities: ['open-source', 'customizable'] }
      ],
      costPer1KTokens: 0.001,
      averageLatency: 300,
      strengths: ['speed', 'cost', 'customization']
    }
  ];

  async getConsensus(prompt: string, taskType: TaskType, options: ConsensusOptions): Promise<ConsensusResult> {
    // Select optimal models for task
    const selectedModels = this.selectModelsForTask(taskType, options);

    // Get responses in parallel
    const responses = await Promise.allSettled(
      selectedModels.map(model => this.queryModel(model, prompt))
    );

    // Calculate weighted votes
    const votes = this.calculateWeightedVotes(responses, selectedModels, taskType);

    // Synthesize consensus
    const consensus = await this.synthesizeConsensus(votes);

    return {
      finalAnswer: consensus.answer,
      confidence: consensus.confidence,
      votes,
      reasoning: consensus.reasoning,
      costEstimate: this.calculateCost(selectedModels, prompt),
      latency: Math.max(...responses.map(r => r.status === 'fulfilled' ? r.value.latency : 0))
    };
  }

  private selectModelsForTask(taskType: TaskType, options: ConsensusOptions): AIModel[] {
    // Weight providers by task type strength
    const weights = new Map<string, number>();

    for (const provider of this.providers) {
      const baseWeight = provider.strengths.includes(taskType) ? 2 : 1;
      const costWeight = options.optimizeCost ? (1 / provider.costPer1KTokens) : 1;
      const speedWeight = options.optimizeSpeed ? (1 / provider.averageLatency) : 1;

      weights.set(provider.id, baseWeight * costWeight * speedWeight);
    }

    // Select top N providers
    const sortedProviders = [...weights.entries()].sort((a, b) => b[1] - a[1]);
    const topProviders = sortedProviders.slice(0, options.modelCount || 3);

    return topProviders.map(([id]) =>
      this.providers.find(p => p.id === id)!.models[0]
    );
  }
}
```

## 4.3 AI Agents Framework - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 4.3.1 | Add autonomous task execution | Critical |
| 4.3.2 | Implement agent memory system | High |
| 4.3.3 | Create agent collaboration protocols | High |
| 4.3.4 | Add agent permission management | Critical |
| 4.3.5 | Implement agent progress visualization | Medium |
| 4.3.6 | Add agent learning from feedback | High |

## 4.4 Predictive Analytics - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 4.4.1 | Add deadline risk prediction | Critical |
| 4.4.2 | Implement productivity forecasting | High |
| 4.4.3 | Create workload balancing predictions | High |
| 4.4.4 | Add meeting efficiency predictions | Medium |
| 4.4.5 | Implement burnout timeline prediction | Critical |
| 4.4.6 | Add goal completion probability | Medium |

## 4.5 Natural Language Tasks - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 4.5.1 | Add voice command support | High |
| 4.5.2 | Implement task extraction from conversations | High |
| 4.5.3 | Create intelligent due date parsing | Medium |
| 4.5.4 | Add context-aware task suggestions | High |
| 4.5.5 | Implement task disambiguation | Medium |
| 4.5.6 | Add multi-language support | Medium |

---

# 5. GAMIFICATION - PATH TO 10/10

## 5.1 Achievements System - Current: 9/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 5.1.1 | Add achievement tiers (Bronze/Silver/Gold/Platinum) | High |
| 5.1.2 | Implement secret achievements | Medium |
| 5.1.3 | Create achievement sharing | Medium |
| 5.1.4 | Add daily/weekly challenges | High |
| 5.1.5 | Implement achievement points system | High |
| 5.1.6 | Add achievement showcase profile | Medium |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-achievements-service.ts

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  secret: boolean;
  category: AchievementCategory;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlockedAt?: Date;
  progress: number;  // 0-100
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

type AchievementRequirement =
  | { type: 'focus_hours'; amount: number; period?: 'day' | 'week' | 'month' | 'lifetime' }
  | { type: 'streak_days'; amount: number }
  | { type: 'tasks_completed'; amount: number }
  | { type: 'deep_work_sessions'; amount: number }
  | { type: 'perfect_days'; amount: number }
  | { type: 'level_reached'; level: number }
  | { type: 'integration_connected'; integrationId: string };

interface AchievementReward {
  type: 'theme' | 'badge' | 'sound' | 'title' | 'feature';
  value: string;
}

const ACHIEVEMENT_TIERS = {
  bronze: { minPoints: 0, color: '#CD7F32', multiplier: 1 },
  silver: { minPoints: 100, color: '#C0C0C0', multiplier: 1.5 },
  gold: { minPoints: 500, color: '#FFD700', multiplier: 2 },
  platinum: { minPoints: 2000, color: '#E5E4E2', multiplier: 3 },
  diamond: { minPoints: 10000, color: '#B9F2FF', multiplier: 5 }
};

const ACHIEVEMENTS: Achievement[] = [
  // Focus Achievements
  {
    id: 'first-focus',
    name: 'First Step',
    description: 'Complete your first focus session',
    icon: '🎯',
    tier: 'bronze',
    points: 10,
    secret: false,
    category: { id: 'focus', name: 'Focus', icon: '🎯', color: '#FF6B6B' },
    requirements: [{ type: 'focus_hours', amount: 0.5, period: 'lifetime' }],
    rewards: [],
    progress: 0
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Complete 100 hours of deep work',
    icon: '🏊',
    tier: 'gold',
    points: 500,
    secret: false,
    category: { id: 'focus', name: 'Focus', icon: '🎯', color: '#FF6B6B' },
    requirements: [{ type: 'deep_work_sessions', amount: 100 }],
    rewards: [{ type: 'theme', value: 'deep-ocean' }],
    progress: 0
  },
  {
    id: 'focus-legend',
    name: 'Focus Legend',
    description: 'Reach 1000 hours of total focus time',
    icon: '🏆',
    tier: 'diamond',
    points: 5000,
    secret: false,
    category: { id: 'focus', name: 'Focus', icon: '🎯', color: '#FF6B6B' },
    requirements: [{ type: 'focus_hours', amount: 1000, period: 'lifetime' }],
    rewards: [
      { type: 'title', value: 'Focus Legend' },
      { type: 'badge', value: 'legendary-badge' }
    ],
    progress: 0
  },
  // Secret Achievement
  {
    id: 'night-owl',
    name: '???',
    description: 'Unlocks when discovered',
    icon: '❓',
    tier: 'gold',
    points: 250,
    secret: true,
    category: { id: 'special', name: 'Special', icon: '⭐', color: '#9B59B6' },
    requirements: [{ type: 'focus_hours', amount: 4, period: 'day' }],  // 4 hours after midnight
    rewards: [{ type: 'theme', value: 'midnight' }],
    progress: 0
  },
  // ... 100+ more achievements
];

export class EnhancedAchievementsService {
  private achievements: Achievement[] = ACHIEVEMENTS;

  async checkAchievements(): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue;

      const progress = await this.calculateProgress(achievement);
      achievement.progress = progress;

      if (progress >= 100) {
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
        await this.grantRewards(achievement);
        await this.showUnlockNotification(achievement);
      }
    }

    return newlyUnlocked;
  }

  async shareAchievement(achievementId: string, platform: 'twitter' | 'linkedin' | 'discord'): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    const shareUrl = await this.generateShareCard(achievement);
    await this.postToPlatform(platform, shareUrl, achievement);
  }

  async getDailyChallenges(): Promise<Challenge[]> {
    // Generate personalized daily challenges
  }

  async getAchievementShowcase(): Promise<AchievementShowcase> {
    // Returns user's achievement profile for sharing
  }
}
```

## 5.2 Streak Tracking - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 5.2.1 | Add streak freeze/vacation mode | Critical |
| 5.2.2 | Implement streak milestones | High |
| 5.2.3 | Create streak recovery challenges | High |
| 5.2.4 | Add streak visualization calendar | Medium |
| 5.2.5 | Implement streak notifications | High |
| 5.2.6 | Add streak leaderboards | Medium |

## 5.3 Focus Challenges - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 5.3.1 | Add multiplayer challenges | High |
| 5.3.2 | Implement team challenges | High |
| 5.3.3 | Create challenge templates | Medium |
| 5.3.4 | Add prize/reward system | Medium |
| 5.3.5 | Implement challenge matchmaking | High |
| 5.3.6 | Add challenge statistics | Low |

## 5.4 Goals & Progress - Current: 8/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 5.4.1 | Add goal templates library | Medium |
| 5.4.2 | Implement goal breakdown (milestones) | High |
| 5.4.3 | Create goal sharing | Medium |
| 5.4.4 | Add accountability partners | High |
| 5.4.5 | Implement goal AI coaching | High |
| 5.4.6 | Add goal success predictions | Medium |

---

# 6. HEALTH & WELLNESS + WEARABLE INTEGRATIONS

## 6.1 Current State → Target: 10/10

### Gap Analysis:
- Sleep Quality: 5/10 → 10/10
- Work-Life Balance: 5/10 → 10/10
- Burnout Detection: 8/10 → 10/10
- Eye Break Reminders: 8/10 → 10/10
- **Missing:** Wearable integrations

## 6.2 Wearable Device Integrations

### Supported Devices:

| Device/Platform | API | Features | Priority |
|-----------------|-----|----------|----------|
| **Apple Watch/HealthKit** | HealthKit API | Heart rate, activity, sleep, stand reminders | Critical |
| **Fitbit** | Fitbit Web API | Steps, heart rate, sleep, stress | Critical |
| **Garmin** | Garmin Connect API | Heart rate, stress, body battery, sleep | High |
| **Samsung Health** | Samsung Health SDK | Steps, heart rate, sleep, stress | High |
| **Oura Ring** | Oura API | Sleep, readiness, activity | High |
| **WHOOP** | WHOOP API | Strain, recovery, sleep | Medium |
| **Withings** | Withings API | Weight, sleep, blood pressure | Medium |
| **Google Fit** | Google Fit API | Activity, heart rate, sleep | High |
| **Polar** | Polar AccessLink | Heart rate, training, sleep | Medium |
| **Amazfit/Zepp** | Zepp API | Steps, heart rate, sleep, stress | Low |

### Implementation:

```typescript
// apps/desktop/src/renderer/services/wearable-integration-service.ts

interface WearableData {
  heartRate: HeartRateData;
  sleep: SleepData;
  activity: ActivityData;
  stress: StressData;
  readiness: ReadinessScore;
}

interface HeartRateData {
  current: number;
  resting: number;
  variability: number;  // HRV
  zones: { zone: string; minutes: number }[];
}

interface SleepData {
  duration: number;
  quality: number;
  stages: { stage: 'awake' | 'light' | 'deep' | 'rem'; minutes: number }[];
  score: number;
  recommendations: string[];
}

interface StressData {
  level: number;  // 0-100
  trend: 'decreasing' | 'stable' | 'increasing';
  triggers: string[];
}

interface ReadinessScore {
  score: number;
  factors: {
    sleep: number;
    recovery: number;
    activity: number;
    hrv: number;
  };
  recommendation: string;
}

export class WearableIntegrationService {
  private connectedDevices: Map<string, WearableDevice> = new Map();

  // Apple HealthKit Integration
  async connectAppleHealth(): Promise<void> {
    // Uses electron-healthkit-bridge or native module
    const permissions = [
      'HKQuantityTypeIdentifierHeartRate',
      'HKQuantityTypeIdentifierStepCount',
      'HKCategoryTypeIdentifierSleepAnalysis',
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      'HKQuantityTypeIdentifierActiveEnergyBurned'
    ];

    await this.requestHealthKitPermissions(permissions);
    this.connectedDevices.set('apple-health', new AppleHealthDevice());
  }

  // Fitbit Integration
  async connectFitbit(): Promise<void> {
    const clientId = process.env.FITBIT_CLIENT_ID;
    const redirectUri = 'wakey://oauth/fitbit';

    // OAuth 2.0 flow
    const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&` +
      `scope=activity+heartrate+sleep+profile`;

    const authCode = await this.openAuthWindow(authUrl);
    const tokens = await this.exchangeTokens('fitbit', authCode);

    this.connectedDevices.set('fitbit', new FitbitDevice(tokens));
  }

  // Garmin Integration
  async connectGarmin(): Promise<void> {
    // OAuth 1.0a flow for Garmin
    const consumerKey = process.env.GARMIN_CONSUMER_KEY;
    const consumerSecret = process.env.GARMIN_CONSUMER_SECRET;

    // ... OAuth flow

    this.connectedDevices.set('garmin', new GarminDevice(tokens));
  }

  // Oura Ring Integration
  async connectOura(): Promise<void> {
    const clientId = process.env.OURA_CLIENT_ID;

    // OAuth 2.0 flow
    const authUrl = `https://cloud.ouraring.com/oauth/authorize?` +
      `response_type=code&client_id=${clientId}&` +
      `redirect_uri=wakey://oauth/oura&scope=personal+daily`;

    const authCode = await this.openAuthWindow(authUrl);
    const tokens = await this.exchangeTokens('oura', authCode);

    this.connectedDevices.set('oura', new OuraDevice(tokens));
  }

  // Aggregate data from all connected devices
  async getAggregatedHealthData(): Promise<WearableData> {
    const dataPromises = Array.from(this.connectedDevices.values())
      .map(device => device.fetchLatestData());

    const allData = await Promise.all(dataPromises);

    return this.mergeHealthData(allData);
  }

  // Use health data for productivity insights
  async getProductivityRecommendations(): Promise<ProductivityRecommendation[]> {
    const health = await this.getAggregatedHealthData();
    const recommendations: ProductivityRecommendation[] = [];

    // Low HRV = stress = reduce workload
    if (health.heartRate.variability < 50) {
      recommendations.push({
        type: 'reduce-intensity',
        message: 'Your HRV is low. Consider lighter tasks today.',
        priority: 'high'
      });
    }

    // Poor sleep = delayed deep work
    if (health.sleep.score < 70) {
      recommendations.push({
        type: 'delay-deep-work',
        message: 'Sleep quality was low. Start deep work later today.',
        priority: 'medium'
      });
    }

    // High stress = more breaks
    if (health.stress.level > 70) {
      recommendations.push({
        type: 'more-breaks',
        message: 'Stress level is elevated. Take more frequent breaks.',
        priority: 'high'
      });
    }

    // Good readiness = optimal for challenges
    if (health.readiness.score > 85) {
      recommendations.push({
        type: 'tackle-hard-tasks',
        message: 'Your readiness is excellent! Perfect day for challenging work.',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}
```

## 6.3 Enhanced Sleep Quality - 5/10 → 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 6.3.1 | Integrate sleep data from wearables | Critical |
| 6.3.2 | Add sleep debt tracking | High |
| 6.3.3 | Implement sleep schedule optimization | High |
| 6.3.4 | Create sleep/productivity correlation analysis | Medium |
| 6.3.5 | Add bedtime reminders with wind-down routines | Medium |
| 6.3.6 | Implement circadian rhythm tracking | Low |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-sleep-service.ts

interface SleepProfile {
  averageBedtime: string;
  averageWakeTime: string;
  averageDuration: number;
  chronotype: 'morning-lark' | 'night-owl' | 'intermediate';
  sleepDebt: number;  // hours
  optimalSleepWindow: { start: string; end: string };
}

interface SleepProductivityCorrelation {
  optimalSleepDuration: number;
  productivityByDuration: Map<number, number>;
  productivityByQuality: Map<string, number>;
}

export class EnhancedSleepService {
  async getSleepProfile(): Promise<SleepProfile> {
    const sleepHistory = await this.getSleepHistory(30);  // 30 days
    const wearableData = await wearableService.getAggregatedHealthData();

    const avgBedtime = this.calculateAverageBedtime(sleepHistory);
    const avgWakeTime = this.calculateAverageWakeTime(sleepHistory);
    const avgDuration = this.calculateAverageDuration(sleepHistory);

    return {
      averageBedtime: avgBedtime,
      averageWakeTime: avgWakeTime,
      averageDuration: avgDuration,
      chronotype: this.determineChronotype(avgBedtime, avgWakeTime),
      sleepDebt: this.calculateSleepDebt(sleepHistory),
      optimalSleepWindow: this.calculateOptimalWindow(sleepHistory)
    };
  }

  async analyzeSleepProductivityCorrelation(): Promise<SleepProductivityCorrelation> {
    const sleepData = await this.getSleepHistory(90);
    const productivityData = await productivityService.getHistory(90);

    const correlations = this.correlate(sleepData, productivityData);

    return {
      optimalSleepDuration: correlations.peakDuration,
      productivityByDuration: correlations.byDuration,
      productivityByQuality: correlations.byQuality
    };
  }

  async getBedtimeReminder(): Promise<BedtimeReminder> {
    const profile = await this.getSleepProfile();
    const now = new Date();
    const targetBedtime = this.parseTime(profile.optimalSleepWindow.start);

    // Wind-down routine starts 1 hour before bed
    const windDownStart = new Date(targetBedtime.getTime() - 60 * 60 * 1000);

    return {
      bedtime: targetBedtime,
      windDownStart,
      activities: [
        { time: -60, activity: 'Dim lights, reduce screen brightness' },
        { time: -45, activity: 'Light stretching or reading' },
        { time: -30, activity: 'Prepare tomorrow\'s tasks' },
        { time: -15, activity: 'Breathing exercises' },
        { time: 0, activity: 'Time for bed!' }
      ]
    };
  }
}
```

## 6.4 Enhanced Work-Life Balance - 5/10 → 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 6.4.1 | Add work hours boundary enforcement | Critical |
| 6.4.2 | Implement personal time protection | High |
| 6.4.3 | Create family/personal calendar sync | High |
| 6.4.4 | Add work-life balance scoring | Medium |
| 6.4.5 | Implement "shutdown ritual" feature | High |
| 6.4.6 | Add weekend/vacation mode | Medium |

## 6.5 Enhanced Burnout Detection - 8/10 → 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 6.5.1 | Integrate biometric stress data | Critical |
| 6.5.2 | Add sentiment analysis of communications | High |
| 6.5.3 | Implement multi-factor burnout scoring | High |
| 6.5.4 | Create burnout prevention interventions | Critical |
| 6.5.5 | Add burnout recovery tracking | Medium |
| 6.5.6 | Implement manager alerts (opt-in) | Low |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-burnout-service.ts

interface BurnoutIndicators {
  workHours: { score: number; trend: 'up' | 'down' | 'stable' };
  focusQuality: { score: number; trend: 'up' | 'down' | 'stable' };
  stressLevel: { score: number; trend: 'up' | 'down' | 'stable' };
  sleepQuality: { score: number; trend: 'up' | 'down' | 'stable' };
  physicalActivity: { score: number; trend: 'up' | 'down' | 'stable' };
  socialInteraction: { score: number; trend: 'up' | 'down' | 'stable' };
  sentimentScore: { score: number; trend: 'up' | 'down' | 'stable' };
}

interface BurnoutAssessment {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  score: number;  // 0-100
  indicators: BurnoutIndicators;
  primaryCauses: string[];
  interventions: BurnoutIntervention[];
  timeline: { date: Date; score: number }[];
}

interface BurnoutIntervention {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term';
  title: string;
  description: string;
  actionable: boolean;
  action?: () => Promise<void>;
}

export class EnhancedBurnoutService {
  async assessBurnoutRisk(): Promise<BurnoutAssessment> {
    // Gather all indicators
    const workData = await this.getWorkData();
    const healthData = await wearableService.getAggregatedHealthData();
    const focusData = await focusService.getMetrics();
    const communicationData = await this.analyzeRecentCommunication();

    // Calculate individual scores
    const indicators: BurnoutIndicators = {
      workHours: this.scoreWorkHours(workData),
      focusQuality: this.scoreFocusQuality(focusData),
      stressLevel: this.scoreStress(healthData),
      sleepQuality: this.scoreSleep(healthData),
      physicalActivity: this.scoreActivity(healthData),
      socialInteraction: this.scoreSocialInteraction(workData),
      sentimentScore: this.scoreSentiment(communicationData)
    };

    // Calculate composite score (weighted)
    const weights = {
      workHours: 0.20,
      focusQuality: 0.15,
      stressLevel: 0.20,
      sleepQuality: 0.15,
      physicalActivity: 0.10,
      socialInteraction: 0.10,
      sentimentScore: 0.10
    };

    let compositeScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      compositeScore += indicators[key as keyof BurnoutIndicators].score * weight;
    }

    // Determine risk level
    const riskLevel = compositeScore > 75 ? 'critical' :
                      compositeScore > 55 ? 'high' :
                      compositeScore > 35 ? 'moderate' : 'low';

    // Generate interventions
    const interventions = this.generateInterventions(indicators, riskLevel);

    return {
      riskLevel,
      score: compositeScore,
      indicators,
      primaryCauses: this.identifyPrimaryCauses(indicators),
      interventions,
      timeline: await this.getBurnoutTimeline()
    };
  }

  private generateInterventions(
    indicators: BurnoutIndicators,
    riskLevel: string
  ): BurnoutIntervention[] {
    const interventions: BurnoutIntervention[] = [];

    if (riskLevel === 'critical') {
      interventions.push({
        id: 'immediate-break',
        type: 'immediate',
        title: 'Take immediate break',
        description: 'Step away from work for at least 30 minutes',
        actionable: true,
        action: async () => {
          await notificationService.send('Break reminder set for 30 minutes');
          await focusService.pauseAllSessions();
        }
      });
    }

    if (indicators.workHours.score > 60) {
      interventions.push({
        id: 'reduce-hours',
        type: 'short-term',
        title: 'Reduce work hours',
        description: 'Your work hours are above healthy limits. Set boundaries.',
        actionable: true,
        action: async () => {
          await settingsService.enableWorkHoursLimit(8);
        }
      });
    }

    if (indicators.sleepQuality.score < 40) {
      interventions.push({
        id: 'improve-sleep',
        type: 'short-term',
        title: 'Improve sleep hygiene',
        description: 'Enable bedtime reminders and reduce late work sessions.',
        actionable: true,
        action: async () => {
          await sleepService.enableBedtimeReminders();
        }
      });
    }

    // ... more interventions

    return interventions;
  }
}
```

## 6.6 Posture & Ergonomics

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 6.6.1 | Add webcam-based posture detection | High |
| 6.6.2 | Implement ergonomic reminders | Medium |
| 6.6.3 | Create desk setup optimization tips | Low |
| 6.6.4 | Add standing desk integration | Medium |

## 6.7 Breathing & Meditation

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 6.7.1 | Add guided breathing exercises | High |
| 6.7.2 | Implement meditation timer | Medium |
| 6.7.3 | Create break meditation sessions | Medium |
| 6.7.4 | Add biofeedback integration (HRV) | High |

---

# 7. COMPLETE INTEGRATIONS (100+)

## 7.1 Integration Categories Overview

| Category | Count | Status |
|----------|-------|--------|
| **Productivity & Task Management** | 25 | Planned |
| **Communication & Collaboration** | 20 | Planned |
| **Calendar & Scheduling** | 12 | Planned |
| **Development Tools** | 18 | Planned |
| **Health & Wearables** | 15 | Planned |
| **Note-Taking & Knowledge** | 12 | Planned |
| **Automation & Connectors** | 8 | Planned |
| **AI & Machine Learning** | 10 | Planned |
| **Entertainment & Music** | 8 | Planned |
| **Cloud Storage & Files** | 10 | Planned |
| **Email & Communication** | 12 | Planned |
| **CRM & Business** | 10 | Planned |
| **Time Tracking** | 8 | Planned |
| **Design & Creative** | 6 | Planned |
| **Analytics & Monitoring** | 6 | Planned |
| **TOTAL** | **180** | |

## 7.2 Productivity & Task Management (25)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Todoist** | REST API v2 | Sync tasks, projects, labels, due dates | Critical |
| 2 | **Notion** | Notion API | Databases, pages, blocks, comments | Critical |
| 3 | **Asana** | Asana API | Tasks, projects, portfolios, goals | High |
| 4 | **Trello** | Trello REST API | Boards, cards, lists, checklists | High |
| 5 | **Linear** | GraphQL API | Issues, projects, cycles, roadmaps | High |
| 6 | **ClickUp** | ClickUp API v2 | Tasks, docs, goals, time tracking | High |
| 7 | **Monday.com** | GraphQL API | Boards, items, updates, files | Medium |
| 8 | **Jira** | REST API v3 | Issues, projects, sprints, boards | High |
| 9 | **Basecamp** | Basecamp 4 API | Todos, schedules, messages | Medium |
| 10 | **Wrike** | REST API | Tasks, folders, projects | Medium |
| 11 | **Airtable** | REST API | Bases, tables, records | Medium |
| 12 | **Coda** | Coda API | Docs, tables, formulas | Low |
| 13 | **Taskade** | REST API | Tasks, projects, mind maps | Low |
| 14 | **Remember The Milk** | REST API | Tasks, lists, locations | Low |
| 15 | **Habitica** | REST API v3 | Habits, dailies, todos | Medium |
| 16 | **Sunsama** | REST API | Tasks, time blocking | Medium |
| 17 | **Things 3** | URL Scheme | Tasks, projects, areas | Medium |
| 18 | **OmniFocus** | TaskPaper/URL | Tasks, projects, contexts | Low |
| 19 | **Tick Tick** | REST API | Tasks, habits, calendar | Medium |
| 20 | **Any.do** | REST API | Tasks, lists, reminders | Low |
| 21 | **Microsoft To-Do** | Graph API | Tasks, lists, steps | High |
| 22 | **Apple Reminders** | EventKit | Reminders, lists | Medium |
| 23 | **Google Tasks** | Tasks API | Tasks, lists | High |
| 24 | **Quire** | REST API | Tasks, boards, gantt | Low |
| 25 | **Teamwork** | REST API | Tasks, projects, milestones | Low |

### Implementation Template:

```typescript
// apps/desktop/src/renderer/services/integrations/todoist-integration.ts

import { BaseIntegration, IntegrationConfig, SyncResult } from './base-integration';

interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  due?: {
    date: string;
    datetime?: string;
    recurring: boolean;
  };
  priority: 1 | 2 | 3 | 4;
  labels: string[];
  is_completed: boolean;
}

interface TodoistProject {
  id: string;
  name: string;
  color: string;
  parent_id?: string;
  order: number;
  is_favorite: boolean;
}

export class TodoistIntegration extends BaseIntegration {
  readonly id = 'todoist';
  readonly name = 'Todoist';
  readonly icon = 'todoist-icon.svg';
  readonly category = 'productivity';
  readonly authType = 'oauth2';

  private baseUrl = 'https://api.todoist.com/rest/v2';

  async connect(): Promise<void> {
    const config = {
      clientId: process.env.TODOIST_CLIENT_ID!,
      redirectUri: 'wakey://oauth/todoist',
      scope: 'data:read_write',
      authUrl: 'https://todoist.com/oauth/authorize'
    };

    const tokens = await this.performOAuthFlow(config);
    await this.saveTokens(tokens);
    await this.initialSync();
  }

  async syncTasks(): Promise<SyncResult> {
    const remoteTasks = await this.fetchAllTasks();
    const localTasks = await this.getLocalTasks();

    const changes = await this.reconcile(remoteTasks, localTasks);

    // Push local changes
    for (const task of changes.toCreate) {
      await this.createRemoteTask(task);
    }
    for (const task of changes.toUpdate) {
      await this.updateRemoteTask(task);
    }
    for (const task of changes.toDelete) {
      await this.deleteRemoteTask(task);
    }

    // Pull remote changes
    await this.updateLocalTasks(changes.fromRemote);

    return {
      created: changes.toCreate.length,
      updated: changes.toUpdate.length,
      deleted: changes.toDelete.length,
      synced: changes.fromRemote.length
    };
  }

  private async fetchAllTasks(): Promise<TodoistTask[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  // Bidirectional sync with conflict resolution
  async resolveConflict(local: Task, remote: TodoistTask): Promise<Task> {
    // Last-write-wins with local preference on tie
    const localUpdated = new Date(local.updatedAt);
    const remoteUpdated = new Date(remote.updated_at);

    if (remoteUpdated > localUpdated) {
      return this.convertToLocal(remote);
    }
    return local;
  }

  // Real-time sync via webhooks
  async setupWebhook(): Promise<void> {
    // Todoist doesn't support webhooks, use polling
    this.startPolling(60000); // Every minute
  }
}
```

## 7.3 Communication & Collaboration (20)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Slack** | Web API + Events | Messages, status, DND, reminders | Critical |
| 2 | **Discord** | REST + Gateway | Status, messages, voice state | High |
| 3 | **Microsoft Teams** | Graph API | Status, messages, meetings | Critical |
| 4 | **Zoom** | REST API | Meetings, status, recordings | High |
| 5 | **Google Meet** | Calendar API | Meetings, schedule | High |
| 6 | **Webex** | REST API | Meetings, status | Medium |
| 7 | **Telegram** | Bot API | Messages, notifications | Medium |
| 8 | **WhatsApp** | Business API | Messages (business) | Low |
| 9 | **Loom** | REST API | Videos, recordings | Medium |
| 10 | **Intercom** | REST API | Conversations, users | Low |
| 11 | **Zendesk** | REST API | Tickets, status | Low |
| 12 | **Front** | REST API | Conversations, tags | Low |
| 13 | **Crisp** | REST API | Conversations | Low |
| 14 | **Twist** | REST API | Threads, channels | Low |
| 15 | **Flock** | REST API | Messages, to-dos | Low |
| 16 | **Rocket.Chat** | REST API | Messages, channels | Low |
| 17 | **Mattermost** | REST API | Messages, status | Medium |
| 18 | **Element (Matrix)** | Matrix API | Messages, rooms | Low |
| 19 | **Zulip** | REST API | Streams, topics | Low |
| 20 | **Chanty** | REST API | Messages, tasks | Low |

### Slack Integration (Complete):

```typescript
// apps/desktop/src/renderer/services/integrations/slack-integration.ts

interface SlackStatus {
  status_text: string;
  status_emoji: string;
  status_expiration: number;
}

interface SlackPresence {
  presence: 'active' | 'away';
  auto_away: boolean;
}

export class SlackIntegration extends BaseIntegration {
  readonly id = 'slack';
  readonly name = 'Slack';

  private ws: WebSocket | null = null;

  async connect(): Promise<void> {
    const config = {
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      redirectUri: 'wakey://oauth/slack',
      scope: 'users:read,users:write,dnd:read,dnd:write,users.profile:read,users.profile:write',
      authUrl: 'https://slack.com/oauth/v2/authorize'
    };

    const tokens = await this.performOAuthFlow(config);
    await this.saveTokens(tokens);
    await this.connectRealtime();
  }

  // Set focus status when starting focus session
  async setFocusStatus(minutes: number): Promise<void> {
    const expiration = Math.floor(Date.now() / 1000) + (minutes * 60);

    await this.setStatus({
      status_text: `In focus mode (${minutes} min)`,
      status_emoji: ':dart:',
      status_expiration: expiration
    });

    await this.setDndSnooze(minutes);
  }

  async setStatus(status: SlackStatus): Promise<void> {
    await fetch('https://slack.com/api/users.profile.set', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile: {
          status_text: status.status_text,
          status_emoji: status.status_emoji,
          status_expiration: status.status_expiration
        }
      })
    });
  }

  async setDndSnooze(minutes: number): Promise<void> {
    await fetch('https://slack.com/api/dnd.setSnooze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `num_minutes=${minutes}`
    });
  }

  async clearFocusStatus(): Promise<void> {
    await this.setStatus({
      status_text: '',
      status_emoji: '',
      status_expiration: 0
    });

    await fetch('https://slack.com/api/dnd.endSnooze', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
  }

  // Real-time events via Socket Mode
  private async connectRealtime(): Promise<void> {
    const response = await fetch('https://slack.com/api/apps.connections.open', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.appToken}` }
    });
    const { url } = await response.json();

    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };
  }

  private handleEvent(event: any): void {
    switch (event.type) {
      case 'message':
        // Detect if user is being mentioned during focus
        if (this.isMention(event) && focusService.isInFocus()) {
          this.queueNotification(event);
        }
        break;
      case 'presence_change':
        this.updatePresenceState(event);
        break;
    }
  }
}
```

## 7.4 Calendar & Scheduling (12)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Google Calendar** | Calendar API v3 | Events, focus blocks, availability | Critical |
| 2 | **Microsoft Outlook** | Graph API | Events, focus time, scheduling | Critical |
| 3 | **Apple Calendar** | EventKit | Events, reminders | High |
| 4 | **Calendly** | REST API v2 | Availability, bookings | High |
| 5 | **Cal.com** | REST API | Scheduling, availability | Medium |
| 6 | **Doodle** | REST API | Polls, scheduling | Low |
| 7 | **Reclaim.ai** | REST API | Smart scheduling, habits | High |
| 8 | **Clockwise** | REST API | Focus time, meetings | Medium |
| 9 | **SavvyCal** | REST API | Scheduling links | Low |
| 10 | **Fantastical** | URL Scheme | Events, tasks | Low |
| 11 | **Cron Calendar** | REST API | Scheduling | Medium |
| 12 | **Vimcal** | REST API | Speed scheduling | Low |

### Google Calendar Integration:

```typescript
// apps/desktop/src/renderer/services/integrations/google-calendar-integration.ts

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string; responseStatus: string }[];
  colorId?: string;
}

export class GoogleCalendarIntegration extends BaseIntegration {
  readonly id = 'google-calendar';
  readonly name = 'Google Calendar';

  private calendarId = 'primary';

  async connect(): Promise<void> {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: 'wakey://oauth/google',
      scope: 'https://www.googleapis.com/auth/calendar',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
    };

    const tokens = await this.performOAuthFlow(config);
    await this.saveTokens(tokens);
  }

  // Auto-block focus time on calendar
  async blockFocusTime(date: Date, durationMinutes: number): Promise<string> {
    const event: Partial<CalendarEvent> = {
      summary: '🎯 Focus Time (via Wakey)',
      description: 'Automatically blocked for deep work',
      start: {
        dateTime: date.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(date.getTime() + durationMinutes * 60000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      colorId: '11'  // Red for focus
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );

    const created = await response.json();
    return created.id;
  }

  // Find optimal focus windows
  async findFocusWindows(date: Date, minDuration: number = 60): Promise<TimeSlot[]> {
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    const events = await this.getEvents(dayStart, dayEnd);
    const busySlots = events.map(e => ({
      start: new Date(e.start.dateTime),
      end: new Date(e.end.dateTime)
    }));

    // Find gaps >= minDuration
    const freeSlots: TimeSlot[] = [];
    let currentStart = dayStart;

    for (const busy of busySlots.sort((a, b) => a.start.getTime() - b.start.getTime())) {
      if (busy.start > currentStart) {
        const gap = (busy.start.getTime() - currentStart.getTime()) / 60000;
        if (gap >= minDuration) {
          freeSlots.push({ start: currentStart, end: busy.start, duration: gap });
        }
      }
      currentStart = new Date(Math.max(currentStart.getTime(), busy.end.getTime()));
    }

    // Check time after last meeting
    if (dayEnd > currentStart) {
      const gap = (dayEnd.getTime() - currentStart.getTime()) / 60000;
      if (gap >= minDuration) {
        freeSlots.push({ start: currentStart, end: dayEnd, duration: gap });
      }
    }

    return freeSlots;
  }

  // Detect upcoming meetings
  async getUpcomingMeetings(lookahead: number = 30): Promise<Meeting[]> {
    const now = new Date();
    const later = new Date(now.getTime() + lookahead * 60000);

    const events = await this.getEvents(now, later);

    return events
      .filter(e => e.attendees && e.attendees.length > 1)
      .map(e => ({
        id: e.id,
        title: e.summary,
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
        attendees: e.attendees!.length,
        isOnline: this.detectVideoMeeting(e)
      }));
  }

  private detectVideoMeeting(event: CalendarEvent): boolean {
    const description = event.description?.toLowerCase() || '';
    return description.includes('zoom.us') ||
           description.includes('meet.google.com') ||
           description.includes('teams.microsoft.com');
  }
}
```

## 7.5 Development Tools (18)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **GitHub** | GraphQL + REST | Issues, PRs, commits, activity | Critical |
| 2 | **GitLab** | REST API v4 | Issues, MRs, pipelines | High |
| 3 | **Bitbucket** | REST API 2.0 | PRs, issues, pipelines | Medium |
| 4 | **VS Code** | Extension API | Activity, file tracking | Critical |
| 5 | **JetBrains** | Plugin API | Activity, commits | High |
| 6 | **Sublime Text** | Plugin API | Activity tracking | Low |
| 7 | **Vim/Neovim** | Plugin | Activity tracking | Low |
| 8 | **Cursor** | Extension | AI activity | Medium |
| 9 | **Figma** | REST API | Design activity | Medium |
| 10 | **CircleCI** | REST API v2 | Build status | Medium |
| 11 | **GitHub Actions** | API | Workflow status | High |
| 12 | **Vercel** | REST API | Deployments | Medium |
| 13 | **Netlify** | REST API | Deployments | Medium |
| 14 | **Railway** | GraphQL | Deployments | Low |
| 15 | **Sentry** | REST API | Errors, issues | High |
| 16 | **DataDog** | REST API | Monitoring | Medium |
| 17 | **PagerDuty** | REST API | Incidents | Medium |
| 18 | **Raycast** | Extension | Commands, shortcuts | Low |

## 7.6 Note-Taking & Knowledge (12)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Notion** | REST API | Pages, databases, blocks | Critical |
| 2 | **Obsidian** | Local Vault + Plugin | Notes, graph, sync | High |
| 3 | **Roam Research** | API | Blocks, graph | Medium |
| 4 | **Logseq** | Local + Plugin | Outliner, graph | Medium |
| 5 | **Craft** | REST API | Documents, spaces | Medium |
| 6 | **Bear** | URL Scheme | Notes, tags | Low |
| 7 | **Apple Notes** | AppleScript | Notes, folders | Medium |
| 8 | **Evernote** | REST API | Notes, notebooks | Medium |
| 9 | **OneNote** | Graph API | Pages, sections | High |
| 10 | **Standard Notes** | REST API | Notes, tags | Low |
| 11 | **Notejoy** | REST API | Notes, notebooks | Low |
| 12 | **Mem.ai** | REST API | Notes, AI search | Low |

## 7.7 Automation & Connectors (8)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Zapier** | Webhooks + REST | 5000+ app connections | Critical |
| 2 | **Make (Integromat)** | Webhooks | Complex automations | High |
| 3 | **IFTTT** | Webhooks | Simple automations | Medium |
| 4 | **n8n** | Webhooks | Self-hosted automations | Medium |
| 5 | **Pipedream** | REST API | Developer automations | Medium |
| 6 | **Automate.io** | Webhooks | Business automations | Low |
| 7 | **Tray.io** | REST API | Enterprise automations | Low |
| 8 | **Workato** | REST API | Enterprise workflows | Low |

### Zapier Webhook Implementation:

```typescript
// apps/desktop/src/renderer/services/integrations/zapier-integration.ts

interface ZapierTrigger {
  id: string;
  name: string;
  event: WakeyEvent;
  webhookUrl: string;
  active: boolean;
}

type WakeyEvent =
  | 'focus_session_started'
  | 'focus_session_completed'
  | 'task_completed'
  | 'goal_achieved'
  | 'streak_milestone'
  | 'burnout_warning'
  | 'deep_work_milestone';

export class ZapierIntegration extends BaseIntegration {
  readonly id = 'zapier';
  readonly name = 'Zapier';

  private triggers: Map<string, ZapierTrigger> = new Map();

  async setupTrigger(event: WakeyEvent, webhookUrl: string): Promise<string> {
    const trigger: ZapierTrigger = {
      id: generateId(),
      name: `Trigger: ${event}`,
      event,
      webhookUrl,
      active: true
    };

    this.triggers.set(trigger.id, trigger);
    await this.saveTriggers();

    // Subscribe to internal event
    eventBus.on(event, (data) => this.fireTrigger(trigger.id, data));

    return trigger.id;
  }

  private async fireTrigger(triggerId: string, data: any): Promise<void> {
    const trigger = this.triggers.get(triggerId);
    if (!trigger || !trigger.active) return;

    try {
      await fetch(trigger.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: trigger.event,
          timestamp: new Date().toISOString(),
          data
        })
      });
    } catch (error) {
      console.error(`Zapier webhook failed: ${error}`);
    }
  }

  // Available triggers for Zapier app
  getAvailableTriggers(): { event: WakeyEvent; description: string }[] {
    return [
      { event: 'focus_session_started', description: 'When a focus session begins' },
      { event: 'focus_session_completed', description: 'When a focus session ends' },
      { event: 'task_completed', description: 'When a task is marked complete' },
      { event: 'goal_achieved', description: 'When a goal is achieved' },
      { event: 'streak_milestone', description: 'When a streak milestone is reached' },
      { event: 'burnout_warning', description: 'When burnout risk is detected' },
      { event: 'deep_work_milestone', description: 'When deep work hours milestone is reached' }
    ];
  }
}
```

## 7.8 AI & Machine Learning (10)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **OpenAI** | REST API | GPT-4, embeddings, whisper | Critical |
| 2 | **Anthropic** | REST API | Claude, analysis | Critical |
| 3 | **Google AI** | Vertex AI / Gemini | Gemini, analysis | High |
| 4 | **Mistral** | REST API | Fast inference | Medium |
| 5 | **Cohere** | REST API | Embeddings, rerank | Low |
| 6 | **Hugging Face** | Inference API | Models, spaces | Medium |
| 7 | **Replicate** | REST API | ML models | Low |
| 8 | **Ollama** | Local API | Local LLMs | High |
| 9 | **LM Studio** | Local API | Local models | Medium |
| 10 | **Perplexity** | REST API | Search + AI | Medium |

## 7.9 Music & Entertainment (8)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Spotify** | Web API | Playback, playlists, focus music | High |
| 2 | **Apple Music** | MusicKit | Playback, playlists | Medium |
| 3 | **YouTube Music** | Data API | Playlists | Low |
| 4 | **Brain.fm** | Partner API | Focus music | High |
| 5 | **Endel** | Partner API | Adaptive soundscapes | Medium |
| 6 | **Focus@Will** | Partner API | Focus music | Medium |
| 7 | **SoundCloud** | API | Ambient tracks | Low |
| 8 | **Calm** | Partner API | Meditation, sleep | Medium |

## 7.10 Cloud Storage & Files (10)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Google Drive** | Drive API v3 | Files, activity | High |
| 2 | **Dropbox** | REST API v2 | Files, activity | Medium |
| 3 | **OneDrive** | Graph API | Files, activity | High |
| 4 | **iCloud** | CloudKit | Files, sync | Medium |
| 5 | **Box** | REST API | Enterprise files | Low |
| 6 | **Notion** | API | File blocks | High |
| 7 | **AWS S3** | SDK | Backup storage | Low |
| 8 | **Backblaze B2** | API | Backup | Low |
| 9 | **pCloud** | REST API | Files | Low |
| 10 | **Sync.com** | REST API | Encrypted files | Low |

## 7.11 Email & Communication (12)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Gmail** | Gmail API | Emails, tasks from email | Critical |
| 2 | **Outlook** | Graph API | Emails, calendar | Critical |
| 3 | **Apple Mail** | AppleScript | Email activity | Medium |
| 4 | **Superhuman** | Partner API | Email metrics | Medium |
| 5 | **Spark** | Partner API | Email activity | Low |
| 6 | **Hey** | Partner API | Email focus | Low |
| 7 | **Mailchimp** | REST API | Campaign tracking | Low |
| 8 | **SendGrid** | REST API | Email sending | Low |
| 9 | **Postmark** | REST API | Transactional email | Low |
| 10 | **ConvertKit** | REST API | Newsletter | Low |
| 11 | **Buttondown** | REST API | Newsletter | Low |
| 12 | **Substack** | Partner API | Writing tracking | Low |

### Gmail Integration:

```typescript
// apps/desktop/src/renderer/services/integrations/gmail-integration.ts

interface EmailTask {
  emailId: string;
  subject: string;
  from: string;
  extractedTask: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export class GmailIntegration extends BaseIntegration {
  readonly id = 'gmail';
  readonly name = 'Gmail';

  async connect(): Promise<void> {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
    };

    const tokens = await this.performOAuthFlow(config);
    await this.saveTokens(tokens);
  }

  // Extract tasks from emails using AI
  async extractTasksFromInbox(): Promise<EmailTask[]> {
    const messages = await this.getRecentMessages(50);
    const tasks: EmailTask[] = [];

    for (const message of messages) {
      const analysis = await aiService.analyzeEmail(message);

      if (analysis.containsTask) {
        tasks.push({
          emailId: message.id,
          subject: message.subject,
          from: message.from,
          extractedTask: analysis.taskDescription,
          dueDate: analysis.suggestedDueDate,
          priority: analysis.priority
        });
      }
    }

    return tasks;
  }

  // Send focus mode auto-reply
  async enableFocusAutoReply(duration: number): Promise<void> {
    const endTime = new Date(Date.now() + duration * 60000);

    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/vacation', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        enableAutoReply: true,
        responseSubject: 'In Focus Mode',
        responseBodyPlainText: `I'm currently in a focus session and will respond after ${endTime.toLocaleTimeString()}. For urgent matters, please call.`,
        restrictToContacts: false,
        restrictToDomain: false
      })
    });
  }
}
```

## 7.12 CRM & Business (10)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Salesforce** | REST API | Leads, tasks, activity | Medium |
| 2 | **HubSpot** | REST API v3 | Contacts, deals, tasks | Medium |
| 3 | **Pipedrive** | REST API | Deals, activities | Low |
| 4 | **Close** | REST API | Leads, tasks | Low |
| 5 | **Copper** | REST API | CRM, tasks | Low |
| 6 | **Monday Sales CRM** | GraphQL | Pipeline, tasks | Low |
| 7 | **Notion CRM** | Notion API | Custom CRM | Medium |
| 8 | **Attio** | REST API | Modern CRM | Low |
| 9 | **Folk** | REST API | Contact management | Low |
| 10 | **Freshsales** | REST API | Sales pipeline | Low |

## 7.13 Time Tracking (8)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Toggl Track** | REST API v9 | Time entries, projects | High |
| 2 | **Clockify** | REST API | Time tracking | High |
| 3 | **Harvest** | REST API v2 | Time, invoicing | Medium |
| 4 | **RescueTime** | REST API | Auto tracking | High |
| 5 | **Timing** | Partner API | Mac tracking | Medium |
| 6 | **Everhour** | REST API | Project time | Low |
| 7 | **Hubstaff** | REST API | Team tracking | Low |
| 8 | **Time Doctor** | REST API | Productivity | Low |

## 7.14 Design & Creative (6)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **Figma** | REST API | Design activity, comments | High |
| 2 | **Sketch** | Plugin API | Design tracking | Low |
| 3 | **Adobe Creative Cloud** | SDK | App activity | Medium |
| 4 | **Canva** | REST API | Design activity | Low |
| 5 | **Miro** | REST API | Whiteboard activity | Medium |
| 6 | **FigJam** | Figma API | Collaboration | Medium |

## 7.15 Analytics & Monitoring (6)

| # | Integration | API | Features | Priority |
|---|-------------|-----|----------|----------|
| 1 | **PostHog** | REST API | Product analytics | High |
| 2 | **Mixpanel** | REST API | User analytics | Medium |
| 3 | **Amplitude** | REST API | Analytics | Medium |
| 4 | **Segment** | REST API | Data pipeline | Medium |
| 5 | **Google Analytics** | GA4 API | Web analytics | Low |
| 6 | **Plausible** | REST API | Privacy analytics | Low |

## 7.16 Integration Service Architecture

```typescript
// apps/desktop/src/renderer/services/integrations/integration-manager.ts

interface IntegrationStatus {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: Date;
  health: 'healthy' | 'degraded' | 'error';
  error?: string;
}

export class IntegrationManager {
  private integrations: Map<string, BaseIntegration> = new Map();
  private syncQueue: SyncQueue;

  constructor() {
    this.registerAllIntegrations();
    this.syncQueue = new SyncQueue();
  }

  private registerAllIntegrations(): void {
    // Register all 180+ integrations
    this.register(new TodoistIntegration());
    this.register(new NotionIntegration());
    this.register(new SlackIntegration());
    this.register(new GoogleCalendarIntegration());
    this.register(new GmailIntegration());
    this.register(new GitHubIntegration());
    this.register(new SpotifyIntegration());
    this.register(new FitbitIntegration());
    this.register(new ZapierIntegration());
    // ... 170+ more
  }

  async connectIntegration(id: string): Promise<void> {
    const integration = this.integrations.get(id);
    if (!integration) throw new Error(`Integration ${id} not found`);

    await integration.connect();
    await this.syncQueue.addToQueue(id);
  }

  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    const statuses: IntegrationStatus[] = [];

    for (const [id, integration] of this.integrations) {
      statuses.push({
        id,
        name: integration.name,
        connected: await integration.isConnected(),
        lastSync: await integration.getLastSync(),
        health: await integration.getHealth(),
        error: integration.lastError
      });
    }

    return statuses;
  }

  async syncAll(): Promise<void> {
    const connected = await this.getConnectedIntegrations();

    await Promise.allSettled(
      connected.map(i => i.sync())
    );
  }

  // Search across all integrations
  async universalSearch(query: string): Promise<SearchResult[]> {
    const connected = await this.getConnectedIntegrations();
    const results: SearchResult[] = [];

    const searchPromises = connected.map(async (integration) => {
      if (integration.supportsSearch) {
        const integrationResults = await integration.search(query);
        results.push(...integrationResults.map(r => ({
          ...r,
          source: integration.name
        })));
      }
    });

    await Promise.allSettled(searchPromises);

    return results.sort((a, b) => b.relevance - a.relevance);
  }
}
```

---

# 8. ADVANCED FEATURES

## 8.1 Workflow Automation - Current: 6/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 8.1.1 | Complete action execution engine | Critical |
| 8.1.2 | Add conditional logic (if/else/switch) | Critical |
| 8.1.3 | Implement loops and iterations | High |
| 8.1.4 | Add variable support | High |
| 8.1.5 | Create workflow templates library | Medium |
| 8.1.6 | Implement workflow versioning | Medium |
| 8.1.7 | Add workflow sharing/marketplace | Low |
| 8.1.8 | Implement error handling/retry logic | Critical |
| 8.1.9 | Add workflow analytics | Medium |
| 8.1.10 | Create visual workflow builder | High |

### Code Implementation:

```typescript
// apps/desktop/src/renderer/services/enhanced-workflow-service.ts

type ActionType =
  | 'create_task'
  | 'update_task'
  | 'complete_task'
  | 'send_notification'
  | 'send_slack'
  | 'block_calendar'
  | 'start_focus'
  | 'stop_focus'
  | 'set_status'
  | 'run_script'
  | 'http_request'
  | 'delay'
  | 'condition'
  | 'loop';

interface WorkflowAction {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  onSuccess?: string;  // Next action ID
  onError?: string;    // Error handler action ID
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'matches';
  value: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  variables: Record<string, any>;
  enabled: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  analytics: WorkflowAnalytics;
}

interface WorkflowAnalytics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  lastRun?: Date;
}

export class EnhancedWorkflowService {
  private workflows: Map<string, Workflow> = new Map();
  private executionContext: Map<string, any> = new Map();

  async executeWorkflow(workflowId: string, triggerData: any): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.enabled) return { success: false, error: 'Workflow not found or disabled' };

    const context = {
      trigger: triggerData,
      variables: { ...workflow.variables },
      results: {}
    };

    const startTime = Date.now();
    let currentAction = workflow.actions[0];

    try {
      while (currentAction) {
        const result = await this.executeAction(currentAction, context);
        context.results[currentAction.id] = result;

        if (result.success) {
          currentAction = this.getNextAction(workflow, currentAction.onSuccess);
        } else if (currentAction.onError) {
          currentAction = this.getNextAction(workflow, currentAction.onError);
        } else {
          throw new Error(`Action ${currentAction.id} failed: ${result.error}`);
        }
      }

      // Update analytics
      workflow.analytics.totalRuns++;
      workflow.analytics.successfulRuns++;
      workflow.analytics.averageRunTime = this.calculateNewAverage(
        workflow.analytics.averageRunTime,
        Date.now() - startTime,
        workflow.analytics.totalRuns
      );
      workflow.analytics.lastRun = new Date();

      return { success: true, duration: Date.now() - startTime, results: context.results };
    } catch (error) {
      workflow.analytics.totalRuns++;
      workflow.analytics.failedRuns++;
      return { success: false, error: error.message, duration: Date.now() - startTime };
    }
  }

  private async executeAction(action: WorkflowAction, context: any): Promise<ActionResult> {
    const config = this.interpolateVariables(action.config, context);

    switch (action.type) {
      case 'create_task':
        return await this.actionCreateTask(config);
      case 'send_notification':
        return await this.actionSendNotification(config);
      case 'send_slack':
        return await this.actionSendSlack(config);
      case 'block_calendar':
        return await this.actionBlockCalendar(config);
      case 'start_focus':
        return await this.actionStartFocus(config);
      case 'http_request':
        return await this.actionHttpRequest(config);
      case 'delay':
        return await this.actionDelay(config);
      case 'condition':
        return await this.actionCondition(config, context);
      case 'loop':
        return await this.actionLoop(config, context);
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  }

  private async actionCondition(config: any, context: any): Promise<ActionResult> {
    const { conditions, operator = 'AND' } = config;

    const results = conditions.map((c: WorkflowCondition) => {
      const fieldValue = this.getNestedValue(context, c.field);
      return this.evaluateCondition(fieldValue, c.operator, c.value);
    });

    const passed = operator === 'AND'
      ? results.every(r => r)
      : results.some(r => r);

    return { success: true, data: { passed, branch: passed ? 'true' : 'false' } };
  }

  private async actionLoop(config: any, context: any): Promise<ActionResult> {
    const { items, maxIterations = 100, actions } = config;
    const itemsArray = this.getNestedValue(context, items) || [];

    const results = [];
    for (let i = 0; i < Math.min(itemsArray.length, maxIterations); i++) {
      context.variables.item = itemsArray[i];
      context.variables.index = i;

      for (const action of actions) {
        const result = await this.executeAction(action, context);
        results.push(result);
        if (!result.success) break;
      }
    }

    return { success: true, data: { iterations: results.length, results } };
  }

  // Visual workflow builder data
  getWorkflowBuilderConfig(): WorkflowBuilderConfig {
    return {
      availableActions: this.getAvailableActions(),
      availableTriggers: this.getAvailableTriggers(),
      availableConditions: this.getAvailableConditions(),
      templates: this.getWorkflowTemplates()
    };
  }

  getWorkflowTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'morning-routine',
        name: 'Morning Routine',
        description: 'Start your day with optimal focus',
        workflow: {
          trigger: { type: 'schedule', config: { cron: '0 9 * * 1-5' } },
          actions: [
            { type: 'send_notification', config: { title: 'Good morning!', body: 'Ready to start your focus day?' } },
            { type: 'set_status', config: { platform: 'slack', status: 'Starting work' } },
            { type: 'delay', config: { minutes: 5 } },
            { type: 'start_focus', config: { duration: 90, type: 'deep-work' } }
          ]
        }
      },
      // ... 50+ more templates
    ];
  }
}
```

## 8.2 Plugin System - Current: 4/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 8.2.1 | Define plugin API specification | Critical |
| 8.2.2 | Implement plugin sandboxing | Critical |
| 8.2.3 | Create plugin marketplace | High |
| 8.2.4 | Add plugin permissions system | Critical |
| 8.2.5 | Implement plugin hot-reloading | Medium |
| 8.2.6 | Create plugin SDK | High |
| 8.2.7 | Add plugin versioning/updates | Medium |
| 8.2.8 | Implement plugin analytics | Low |

### Plugin Architecture:

```typescript
// apps/desktop/src/renderer/services/plugin-system/plugin-api.ts

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  main: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  settings?: PluginSettingDefinition[];
}

type PluginPermission =
  | 'tasks:read' | 'tasks:write'
  | 'focus:read' | 'focus:control'
  | 'notifications:send'
  | 'storage:local'
  | 'network:fetch'
  | 'integrations:access';

type PluginHook =
  | 'onFocusStart' | 'onFocusEnd'
  | 'onTaskCreate' | 'onTaskComplete'
  | 'onAppStart' | 'onAppClose'
  | 'onBreakStart' | 'onBreakEnd';

interface PluginAPI {
  // Task management
  tasks: {
    list(): Promise<Task[]>;
    get(id: string): Promise<Task>;
    create(task: Partial<Task>): Promise<Task>;
    update(id: string, updates: Partial<Task>): Promise<Task>;
    complete(id: string): Promise<void>;
  };

  // Focus sessions
  focus: {
    getStatus(): Promise<FocusStatus>;
    start(options?: FocusOptions): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
  };

  // Notifications
  notifications: {
    send(notification: Notification): Promise<void>;
    schedule(notification: Notification, time: Date): Promise<string>;
    cancel(id: string): Promise<void>;
  };

  // Storage
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
  };

  // UI components
  ui: {
    showModal(config: ModalConfig): Promise<any>;
    showNotification(config: NotificationConfig): void;
    registerWidget(widget: WidgetConfig): void;
    registerMenuItem(item: MenuItemConfig): void;
  };
}

export class PluginSystem {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private sandbox: PluginSandbox;

  async loadPlugin(manifest: PluginManifest): Promise<void> {
    // Validate permissions
    const approved = await this.requestPermissions(manifest.permissions);
    if (!approved) throw new Error('Plugin permissions denied');

    // Create sandboxed environment
    const sandbox = this.sandbox.create(manifest);

    // Load plugin code
    const pluginCode = await this.fetchPluginCode(manifest.main);

    // Execute in sandbox with limited API
    const api = this.createLimitedAPI(manifest.permissions);
    const plugin = sandbox.execute(pluginCode, { wakey: api });

    // Register hooks
    for (const hook of manifest.hooks) {
      eventBus.on(hook, (...args) => plugin[hook]?.(...args));
    }

    this.plugins.set(manifest.id, { manifest, instance: plugin, sandbox });
  }

  private createLimitedAPI(permissions: PluginPermission[]): Partial<PluginAPI> {
    const api: Partial<PluginAPI> = {};

    if (permissions.includes('tasks:read') || permissions.includes('tasks:write')) {
      api.tasks = {
        list: () => taskService.list(),
        get: (id) => taskService.get(id),
        create: permissions.includes('tasks:write') ? (task) => taskService.create(task) : undefined,
        update: permissions.includes('tasks:write') ? (id, u) => taskService.update(id, u) : undefined,
        complete: permissions.includes('tasks:write') ? (id) => taskService.complete(id) : undefined,
      };
    }

    // ... similar for other permission groups

    return api;
  }
}
```

## 8.3 Voice Dictation - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 8.3.1 | Add always-on voice wake word | High |
| 8.3.2 | Implement offline speech recognition | High |
| 8.3.3 | Add voice command customization | Medium |
| 8.3.4 | Create voice shortcuts | Medium |
| 8.3.5 | Implement multi-language support | Medium |
| 8.3.6 | Add voice feedback/confirmation | Low |

## 8.4 Knowledge Base - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 8.4.1 | Add semantic search (embeddings) | Critical |
| 8.4.2 | Implement knowledge graph | High |
| 8.4.3 | Create automatic linking | Medium |
| 8.4.4 | Add knowledge extraction from tasks/notes | High |
| 8.4.5 | Implement spaced repetition review | Medium |
| 8.4.6 | Add knowledge sharing | Low |

## 8.5 Research Mode - Current: 7/10 → Target: 10/10

### Implementation Tasks:

| Task | Description | Priority |
|------|-------------|----------|
| 8.5.1 | Add web scraping with summarization | High |
| 8.5.2 | Implement source tracking/citation | High |
| 8.5.3 | Create research templates | Medium |
| 8.5.4 | Add PDF/document analysis | High |
| 8.5.5 | Implement collaborative research | Low |
| 8.5.6 | Add research export (PDF, Notion, etc.) | Medium |

---

# 9. MISSING CRITICAL FEATURES

## 9.1 Recurring Tasks

### Implementation:

```typescript
// apps/desktop/src/renderer/services/recurring-task-service.ts

type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface RecurrencePattern {
  type: RecurrenceType;
  interval: number;           // Every N days/weeks/months
  daysOfWeek?: number[];      // 0-6 for Sunday-Saturday
  daysOfMonth?: number[];     // 1-31
  monthsOfYear?: number[];    // 1-12
  endDate?: Date;
  occurrences?: number;       // Max occurrences
}

interface RecurringTask {
  id: string;
  templateTask: Task;
  recurrence: RecurrencePattern;
  nextOccurrence: Date;
  lastCompleted?: Date;
  completedOccurrences: number;
  active: boolean;
}

export class RecurringTaskService {
  private recurringTasks: Map<string, RecurringTask> = new Map();

  async createRecurringTask(task: Partial<Task>, recurrence: RecurrencePattern): Promise<RecurringTask> {
    const recurringTask: RecurringTask = {
      id: generateId(),
      templateTask: await taskService.createTemplate(task),
      recurrence,
      nextOccurrence: this.calculateNextOccurrence(new Date(), recurrence),
      completedOccurrences: 0,
      active: true
    };

    this.recurringTasks.set(recurringTask.id, recurringTask);
    await this.generateNextInstance(recurringTask);

    return recurringTask;
  }

  private calculateNextOccurrence(from: Date, pattern: RecurrencePattern): Date {
    const next = new Date(from);

    switch (pattern.type) {
      case 'daily':
        next.setDate(next.getDate() + pattern.interval);
        break;

      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next matching day
          do {
            next.setDate(next.getDate() + 1);
          } while (!pattern.daysOfWeek.includes(next.getDay()));
        } else {
          next.setDate(next.getDate() + (pattern.interval * 7));
        }
        break;

      case 'monthly':
        if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
          // Find next matching day of month
          next.setMonth(next.getMonth() + pattern.interval);
          next.setDate(Math.min(pattern.daysOfMonth[0], this.getDaysInMonth(next)));
        } else {
          next.setMonth(next.getMonth() + pattern.interval);
        }
        break;

      case 'yearly':
        next.setFullYear(next.getFullYear() + pattern.interval);
        break;

      case 'custom':
        // Custom RRULE-like parsing
        break;
    }

    // Check end conditions
    if (pattern.endDate && next > pattern.endDate) return null;
    if (pattern.occurrences && this.getCompletedCount() >= pattern.occurrences) return null;

    return next;
  }

  async generateNextInstance(recurringTask: RecurringTask): Promise<Task> {
    const instance = await taskService.create({
      ...recurringTask.templateTask,
      id: generateId(),
      dueDate: recurringTask.nextOccurrence,
      recurringTaskId: recurringTask.id,
      isRecurringInstance: true
    });

    return instance;
  }

  async completeRecurringInstance(instanceId: string): Promise<void> {
    const instance = await taskService.get(instanceId);
    const recurringTask = this.recurringTasks.get(instance.recurringTaskId);

    if (recurringTask) {
      recurringTask.lastCompleted = new Date();
      recurringTask.completedOccurrences++;
      recurringTask.nextOccurrence = this.calculateNextOccurrence(
        new Date(),
        recurringTask.recurrence
      );

      if (recurringTask.nextOccurrence) {
        await this.generateNextInstance(recurringTask);
      }
    }

    await taskService.complete(instanceId);
  }

  // Natural language parsing
  async parseRecurrence(text: string): Promise<RecurrencePattern> {
    // "every day" -> { type: 'daily', interval: 1 }
    // "every monday and friday" -> { type: 'weekly', daysOfWeek: [1, 5] }
    // "every 2 weeks" -> { type: 'weekly', interval: 2 }
    // "monthly on the 15th" -> { type: 'monthly', daysOfMonth: [15] }
    // "every weekday" -> { type: 'weekly', daysOfWeek: [1,2,3,4,5] }

    const patterns = [
      { regex: /every\s+day/i, result: { type: 'daily', interval: 1 } },
      { regex: /every\s+(\d+)\s+days?/i, result: (m) => ({ type: 'daily', interval: parseInt(m[1]) }) },
      { regex: /every\s+weekday/i, result: { type: 'weekly', interval: 1, daysOfWeek: [1,2,3,4,5] } },
      { regex: /every\s+week/i, result: { type: 'weekly', interval: 1 } },
      { regex: /every\s+(\d+)\s+weeks?/i, result: (m) => ({ type: 'weekly', interval: parseInt(m[1]) }) },
      { regex: /every\s+month/i, result: { type: 'monthly', interval: 1 } },
      // ... more patterns
    ];

    for (const { regex, result } of patterns) {
      const match = text.match(regex);
      if (match) {
        return typeof result === 'function' ? result(match) : result;
      }
    }

    // Fallback to AI parsing
    return await aiService.parseRecurrence(text);
  }
}
```

## 9.2 Task Dependencies

### Implementation:

```typescript
// apps/desktop/src/renderer/services/task-dependency-service.ts

interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  type: 'blocks' | 'blocked_by' | 'related';
  createdAt: Date;
}

interface DependencyGraph {
  nodes: Map<string, Task>;
  edges: TaskDependency[];
}

export class TaskDependencyService {
  async addDependency(taskId: string, dependsOnId: string): Promise<void> {
    // Prevent circular dependencies
    if (await this.wouldCreateCycle(taskId, dependsOnId)) {
      throw new Error('Cannot create circular dependency');
    }

    const dependency: TaskDependency = {
      id: generateId(),
      taskId,
      dependsOnId,
      type: 'blocked_by',
      createdAt: new Date()
    };

    await this.saveDependency(dependency);
    await this.updateTaskBlockedStatus(taskId);
  }

  async getBlockingTasks(taskId: string): Promise<Task[]> {
    const dependencies = await this.getDependencies(taskId);
    const blockingIds = dependencies
      .filter(d => d.type === 'blocked_by')
      .map(d => d.dependsOnId);

    const blockingTasks = await Promise.all(
      blockingIds.map(id => taskService.get(id))
    );

    // Only return incomplete blocking tasks
    return blockingTasks.filter(t => !t.completed);
  }

  async getBlockedTasks(taskId: string): Promise<Task[]> {
    const allDependencies = await this.getAllDependencies();
    const blockedIds = allDependencies
      .filter(d => d.dependsOnId === taskId && d.type === 'blocked_by')
      .map(d => d.taskId);

    return Promise.all(blockedIds.map(id => taskService.get(id)));
  }

  async canStartTask(taskId: string): Promise<{ canStart: boolean; blockers: Task[] }> {
    const blockers = await this.getBlockingTasks(taskId);
    const incompleteBlockers = blockers.filter(t => !t.completed);

    return {
      canStart: incompleteBlockers.length === 0,
      blockers: incompleteBlockers
    };
  }

  async getTaskOrder(): Promise<Task[]> {
    // Topological sort for dependency-respecting order
    const graph = await this.buildDependencyGraph();
    return this.topologicalSort(graph);
  }

  private topologicalSort(graph: DependencyGraph): Task[] {
    const visited = new Set<string>();
    const result: Task[] = [];

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const dependencies = graph.edges.filter(e => e.taskId === taskId);
      for (const dep of dependencies) {
        visit(dep.dependsOnId);
      }

      result.push(graph.nodes.get(taskId)!);
    };

    for (const [taskId] of graph.nodes) {
      visit(taskId);
    }

    return result.reverse();
  }

  private async wouldCreateCycle(taskId: string, dependsOnId: string): Promise<boolean> {
    // Check if dependsOnId already depends on taskId (directly or indirectly)
    const visited = new Set<string>();
    const queue = [dependsOnId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const dependencies = await this.getDependencies(current);
      for (const dep of dependencies) {
        queue.push(dep.dependsOnId);
      }
    }

    return false;
  }
}
```

## 9.3 Offline Sync

### Implementation:

```typescript
// apps/desktop/src/renderer/services/offline-sync-service.ts

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  retries: number;
}

interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSync: Date;
  syncInProgress: boolean;
}

export class OfflineSyncService {
  private operationQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.setupNetworkListeners();
    this.loadPendingOperations();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'synced' | 'retries'>): Promise<void> {
    const op: SyncOperation = {
      ...operation,
      id: generateId(),
      synced: false,
      retries: 0
    };

    this.operationQueue.push(op);
    await this.saveOperationQueue();

    // Apply locally immediately
    await this.applyLocally(op);

    // Try to sync if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;
    this.syncInProgress = true;

    const pending = this.operationQueue.filter(op => !op.synced);

    for (const operation of pending) {
      try {
        await this.syncOperation(operation);
        operation.synced = true;
      } catch (error) {
        operation.retries++;

        if (operation.retries >= 3) {
          // Move to failed queue for manual resolution
          await this.handleSyncFailure(operation, error);
        }
      }
    }

    // Remove synced operations
    this.operationQueue = this.operationQueue.filter(op => !op.synced);
    await this.saveOperationQueue();

    this.syncInProgress = false;
  }

  private async syncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.entity) {
      case 'task':
        await this.syncTaskOperation(operation);
        break;
      case 'focus_session':
        await this.syncFocusSessionOperation(operation);
        break;
      case 'goal':
        await this.syncGoalOperation(operation);
        break;
      // ... other entities
    }
  }

  private async syncTaskOperation(operation: SyncOperation): Promise<void> {
    const integration = integrationManager.getPrimaryTaskIntegration();
    if (!integration) return;

    switch (operation.type) {
      case 'create':
        await integration.createTask(operation.data);
        break;
      case 'update':
        await integration.updateTask(operation.entityId, operation.data);
        break;
      case 'delete':
        await integration.deleteTask(operation.entityId);
        break;
    }
  }

  async getConflicts(): Promise<SyncConflict[]> {
    // Check for conflicts between local and remote
    const conflicts: SyncConflict[] = [];

    for (const operation of this.operationQueue) {
      const remote = await this.fetchRemote(operation.entity, operation.entityId);
      if (remote && remote.updatedAt > operation.timestamp) {
        conflicts.push({
          operationId: operation.id,
          local: operation.data,
          remote: remote,
          entity: operation.entity,
          entityId: operation.entityId
        });
      }
    }

    return conflicts;
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    // Handle conflict resolution
  }

  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.operationQueue.filter(op => !op.synced).length,
      lastSync: this.getLastSyncTime(),
      syncInProgress: this.syncInProgress
    };
  }
}
```

## 9.4 Team Collaboration

### Implementation:

```typescript
// apps/desktop/src/renderer/services/team-collaboration-service.ts

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  workspaces: Workspace[];
  settings: TeamSettings;
  createdAt: Date;
}

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

interface Workspace {
  id: string;
  name: string;
  teamId: string;
  projects: Project[];
  members: string[];  // Member IDs with access
  visibility: 'public' | 'private';
}

interface SharedGoal {
  id: string;
  teamId: string;
  title: string;
  description: string;
  progress: number;
  contributors: { memberId: string; contribution: number }[];
  deadline: Date;
}

export class TeamCollaborationService {
  private currentTeam: Team | null = null;

  async createTeam(name: string): Promise<Team> {
    const team: Team = {
      id: generateId(),
      name,
      members: [{
        id: generateId(),
        userId: authService.getCurrentUserId(),
        email: authService.getCurrentUserEmail(),
        name: authService.getCurrentUserName(),
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date()
      }],
      workspaces: [],
      settings: this.getDefaultSettings(),
      createdAt: new Date()
    };

    await this.saveTeam(team);
    return team;
  }

  async inviteMember(teamId: string, email: string, role: TeamMember['role']): Promise<void> {
    const team = await this.getTeam(teamId);

    // Check permissions
    if (!this.canInvite(team)) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Send invitation
    await this.sendInvitation({
      teamId,
      email,
      role,
      invitedBy: authService.getCurrentUserId(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
    });
  }

  async createSharedGoal(workspaceId: string, goal: Partial<SharedGoal>): Promise<SharedGoal> {
    const sharedGoal: SharedGoal = {
      id: generateId(),
      teamId: this.currentTeam!.id,
      title: goal.title!,
      description: goal.description || '',
      progress: 0,
      contributors: [],
      deadline: goal.deadline!
    };

    await this.saveSharedGoal(sharedGoal);

    // Notify team members
    await this.notifyTeam('shared_goal_created', {
      goal: sharedGoal,
      createdBy: authService.getCurrentUserName()
    });

    return sharedGoal;
  }

  async contributeToGoal(goalId: string, contribution: number): Promise<void> {
    const goal = await this.getSharedGoal(goalId);
    const memberId = this.getCurrentMemberId();

    const existing = goal.contributors.find(c => c.memberId === memberId);
    if (existing) {
      existing.contribution += contribution;
    } else {
      goal.contributors.push({ memberId, contribution });
    }

    // Recalculate progress
    goal.progress = this.calculateGoalProgress(goal);

    await this.saveSharedGoal(goal);
    await this.updateLeaderboard(goal);
  }

  async getTeamAnalytics(teamId: string, period: 'week' | 'month'): Promise<TeamAnalytics> {
    const team = await this.getTeam(teamId);

    const memberAnalytics = await Promise.all(
      team.members.map(m => this.getMemberAnalytics(m.id, period))
    );

    return {
      totalFocusHours: memberAnalytics.reduce((sum, a) => sum + a.focusHours, 0),
      averageFocusHours: memberAnalytics.reduce((sum, a) => sum + a.focusHours, 0) / team.members.length,
      topContributors: memberAnalytics.sort((a, b) => b.focusHours - a.focusHours).slice(0, 5),
      sharedGoalsProgress: await this.getSharedGoalsProgress(teamId),
      teamStreak: await this.calculateTeamStreak(teamId),
      collaborationScore: await this.calculateCollaborationScore(teamId)
    };
  }

  // Real-time presence
  async updatePresence(status: 'online' | 'focusing' | 'away' | 'offline'): Promise<void> {
    await realtimeService.publish(`team:${this.currentTeam!.id}:presence`, {
      memberId: this.getCurrentMemberId(),
      status,
      timestamp: new Date()
    });
  }

  async getTeamPresence(): Promise<Map<string, 'online' | 'focusing' | 'away' | 'offline'>> {
    return await realtimeService.getPresence(`team:${this.currentTeam!.id}`);
  }
}
```

## 9.5 Calendar Blocking

### Implementation:

```typescript
// apps/desktop/src/renderer/services/calendar-blocking-service.ts

interface FocusBlock {
  id: string;
  calendarId: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  type: 'deep-work' | 'meeting-prep' | 'creative' | 'admin';
  recurring: boolean;
  recurrenceRule?: string;
}

interface BlockingPreferences {
  minBlockDuration: number;      // minutes
  maxBlocksPerDay: number;
  preferredHours: { start: number; end: number };
  avoidMeetingBuffer: number;    // minutes before/after meetings
  protectLunchHour: boolean;
  autoDeclineConflicts: boolean;
}

export class CalendarBlockingService {
  private preferences: BlockingPreferences;

  async autoBlockFocusTime(date: Date, duration: number): Promise<FocusBlock[]> {
    const availableSlots = await this.findAvailableSlots(date, duration);

    // Score slots by optimal focus time
    const scoredSlots = availableSlots.map(slot => ({
      slot,
      score: this.scoreSlot(slot)
    }));

    // Select best slot
    scoredSlots.sort((a, b) => b.score - a.score);
    const bestSlot = scoredSlots[0];

    if (bestSlot && bestSlot.score > 0) {
      const block = await this.createFocusBlock(bestSlot.slot, 'deep-work');
      return [block];
    }

    return [];
  }

  async smartScheduleWeek(): Promise<FocusBlock[]> {
    const blocks: FocusBlock[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {  // Weekdays only
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      if (date.getDay() === 0 || date.getDay() === 6) continue;  // Skip weekends

      // Aim for 2-3 focus blocks per day
      const targetBlocks = await this.calculateTargetBlocks(date);

      for (const target of targetBlocks) {
        const block = await this.autoBlockFocusTime(date, target.duration);
        blocks.push(...block);
      }
    }

    return blocks;
  }

  private scoreSlot(slot: TimeSlot): number {
    let score = 100;

    // Prefer morning (9-12)
    const hour = slot.start.getHours();
    if (hour >= 9 && hour <= 12) score += 20;

    // Avoid post-lunch dip (14-15)
    if (hour >= 14 && hour <= 15) score -= 15;

    // Prefer longer slots
    if (slot.duration >= 90) score += 15;

    // Avoid immediately after meetings
    if (slot.minutesSinceLastMeeting < 15) score -= 20;

    // Match user's historical peak focus times
    const historicalScore = await focusTrendsService.getHourlyProductivity(hour);
    score += historicalScore * 0.3;

    return score;
  }

  async protectFocusTime(eventId: string): Promise<void> {
    // Auto-decline conflicting meeting requests
    if (this.preferences.autoDeclineConflicts) {
      const conflicts = await this.getConflictingInvites(eventId);

      for (const invite of conflicts) {
        await calendarIntegration.declineInvite(invite.id, {
          message: "I have protected focus time during this slot. Can we find another time?"
        });
      }
    }
  }

  async rescheduleAroundMeeting(meetingId: string): Promise<void> {
    const meeting = await calendarIntegration.getEvent(meetingId);
    const affectedBlocks = await this.getAffectedFocusBlocks(meeting);

    for (const block of affectedBlocks) {
      // Find new slot for the focus block
      const newSlot = await this.findAlternativeSlot(block);
      if (newSlot) {
        await this.moveBlock(block.id, newSlot);
      } else {
        // Notify user that focus time was lost
        await notificationService.send({
          title: 'Focus time conflict',
          body: `Your focus block at ${block.startTime.toLocaleTimeString()} was displaced by a meeting. No alternative slot found.`
        });
      }
    }
  }
}
```

## 9.6 Email Integration (Task Extraction)

### Implementation:

```typescript
// apps/desktop/src/renderer/services/email-task-extraction-service.ts

interface ExtractedTask {
  subject: string;
  description: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  project?: string;
  labels: string[];
  sourceEmail: {
    id: string;
    subject: string;
    from: string;
    receivedAt: Date;
  };
  confidence: number;
}

export class EmailTaskExtractionService {
  async extractTasksFromEmail(emailId: string): Promise<ExtractedTask[]> {
    const email = await emailIntegration.getEmail(emailId);
    const tasks: ExtractedTask[] = [];

    // AI-powered task extraction
    const analysis = await aiService.analyzeEmail({
      subject: email.subject,
      body: email.body,
      from: email.from,
      date: email.receivedAt
    });

    for (const extractedTask of analysis.tasks) {
      tasks.push({
        subject: extractedTask.title,
        description: extractedTask.description,
        dueDate: this.parseDueDate(extractedTask.dueDateText),
        priority: this.determinePriority(extractedTask, email),
        assignee: extractedTask.assignee,
        project: this.inferProject(email),
        labels: extractedTask.labels,
        sourceEmail: {
          id: email.id,
          subject: email.subject,
          from: email.from.email,
          receivedAt: email.receivedAt
        },
        confidence: extractedTask.confidence
      });
    }

    return tasks;
  }

  async processInbox(): Promise<ExtractedTask[]> {
    const recentEmails = await emailIntegration.getRecentEmails(24);  // Last 24 hours
    const allTasks: ExtractedTask[] = [];

    for (const email of recentEmails) {
      if (this.shouldProcess(email)) {
        const tasks = await this.extractTasksFromEmail(email.id);
        allTasks.push(...tasks);
      }
    }

    // Filter by confidence threshold
    return allTasks.filter(t => t.confidence >= 0.7);
  }

  private determinePriority(task: any, email: any): ExtractedTask['priority'] {
    // Check for urgent indicators
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const text = `${email.subject} ${email.body}`.toLowerCase();

    if (urgentKeywords.some(k => text.includes(k))) return 'urgent';
    if (email.importance === 'high') return 'high';

    // Check due date proximity
    if (task.dueDate) {
      const daysUntilDue = (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 1) return 'urgent';
      if (daysUntilDue < 3) return 'high';
    }

    return 'medium';
  }

  async createTaskFromEmail(extractedTask: ExtractedTask): Promise<Task> {
    const task = await taskService.create({
      title: extractedTask.subject,
      description: `${extractedTask.description}\n\n---\nFrom email: ${extractedTask.sourceEmail.subject}`,
      dueDate: extractedTask.dueDate,
      priority: extractedTask.priority,
      labels: extractedTask.labels,
      metadata: {
        source: 'email',
        emailId: extractedTask.sourceEmail.id,
        emailFrom: extractedTask.sourceEmail.from
      }
    });

    // Link back to email
    await emailIntegration.addLabel(extractedTask.sourceEmail.id, 'Wakey/Task Created');

    return task;
  }
}
```

---

# 10. ENHANCED OPPORTUNITIES

## 10.1 Tree Growth Visualization (Forest-style)

### Implementation:

```typescript
// apps/desktop/src/renderer/components/TreeGrowthVisualization.tsx

interface TreeState {
  id: string;
  type: 'sapling' | 'young' | 'mature' | 'ancient';
  species: TreeSpecies;
  health: number;
  growthProgress: number;
  plantedAt: Date;
  focusMinutes: number;
}

type TreeSpecies = 'oak' | 'cherry' | 'maple' | 'pine' | 'willow' | 'baobab' | 'redwood';

interface Forest {
  trees: TreeState[];
  totalFocusMinutes: number;
  biodiversity: number;
  achievements: ForestAchievement[];
}

const TREE_GROWTH_STAGES = {
  sapling: { minMinutes: 0, sprite: 'sapling.svg', size: 20 },
  young: { minMinutes: 60, sprite: 'young-tree.svg', size: 40 },
  mature: { minMinutes: 300, sprite: 'mature-tree.svg', size: 60 },
  ancient: { minMinutes: 1000, sprite: 'ancient-tree.svg', size: 80 }
};

export const TreeGrowthVisualization: React.FC = () => {
  const [forest, setForest] = useState<Forest>({ trees: [], totalFocusMinutes: 0, biodiversity: 0, achievements: [] });
  const [currentTree, setCurrentTree] = useState<TreeState | null>(null);

  useEffect(() => {
    // Subscribe to focus events
    focusService.on('focus-tick', handleFocusTick);
    focusService.on('focus-complete', handleFocusComplete);
    focusService.on('focus-abandoned', handleFocusAbandoned);

    return () => {
      focusService.off('focus-tick', handleFocusTick);
      focusService.off('focus-complete', handleFocusComplete);
      focusService.off('focus-abandoned', handleFocusAbandoned);
    };
  }, []);

  const handleFocusTick = (minutes: number) => {
    if (currentTree) {
      setCurrentTree(prev => ({
        ...prev!,
        focusMinutes: prev!.focusMinutes + 1,
        growthProgress: calculateGrowth(prev!.focusMinutes + 1)
      }));
    }
  };

  const handleFocusComplete = (session: FocusSession) => {
    if (currentTree) {
      // Tree successfully grows
      const grownTree = evolveTree(currentTree);
      setForest(prev => ({
        ...prev,
        trees: [...prev.trees, grownTree],
        totalFocusMinutes: prev.totalFocusMinutes + session.duration
      }));
      setCurrentTree(null);

      // Achievement check
      checkForestAchievements(forest);
    }
  };

  const handleFocusAbandoned = () => {
    // Tree withers
    if (currentTree) {
      showWitherAnimation(currentTree);
      setCurrentTree(null);
    }
  };

  const plantTree = (species: TreeSpecies) => {
    const tree: TreeState = {
      id: generateId(),
      type: 'sapling',
      species,
      health: 100,
      growthProgress: 0,
      plantedAt: new Date(),
      focusMinutes: 0
    };
    setCurrentTree(tree);
  };

  return (
    <div className="forest-visualization">
      <ForestBackground trees={forest.trees} />

      {currentTree && (
        <GrowingTree tree={currentTree} animated />
      )}

      <ForestStats
        totalTrees={forest.trees.length}
        totalMinutes={forest.totalFocusMinutes}
        biodiversity={forest.biodiversity}
      />

      <TreePicker
        onSelect={plantTree}
        unlockedSpecies={getUnlockedSpecies(forest)}
      />
    </div>
  );
};
```

## 10.2 Ambient Soundscapes

### Implementation:

```typescript
// apps/desktop/src/renderer/services/ambient-sound-service.ts

interface Soundscape {
  id: string;
  name: string;
  category: 'nature' | 'urban' | 'white-noise' | 'music' | 'binaural';
  layers: SoundLayer[];
  duration: number;
  premium: boolean;
}

interface SoundLayer {
  id: string;
  audioUrl: string;
  volume: number;
  pan: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
}

const BUILT_IN_SOUNDSCAPES: Soundscape[] = [
  {
    id: 'rain-cafe',
    name: 'Rainy Café',
    category: 'urban',
    layers: [
      { id: 'rain', audioUrl: '/sounds/rain.mp3', volume: 0.6, pan: 0, loop: true, fadeIn: 2, fadeOut: 2 },
      { id: 'cafe', audioUrl: '/sounds/cafe-ambience.mp3', volume: 0.3, pan: 0, loop: true, fadeIn: 1, fadeOut: 1 },
      { id: 'thunder', audioUrl: '/sounds/distant-thunder.mp3', volume: 0.2, pan: 0, loop: true, fadeIn: 0.5, fadeOut: 0.5 }
    ],
    duration: 0,  // Infinite
    premium: false
  },
  {
    id: 'forest-stream',
    name: 'Forest Stream',
    category: 'nature',
    layers: [
      { id: 'stream', audioUrl: '/sounds/stream.mp3', volume: 0.5, pan: -0.2, loop: true, fadeIn: 2, fadeOut: 2 },
      { id: 'birds', audioUrl: '/sounds/birds.mp3', volume: 0.3, pan: 0.2, loop: true, fadeIn: 1, fadeOut: 1 },
      { id: 'wind', audioUrl: '/sounds/forest-wind.mp3', volume: 0.2, pan: 0, loop: true, fadeIn: 3, fadeOut: 3 }
    ],
    duration: 0,
    premium: false
  },
  {
    id: 'focus-alpha',
    name: 'Alpha Waves (Focus)',
    category: 'binaural',
    layers: [
      { id: 'alpha', audioUrl: '/sounds/alpha-10hz.mp3', volume: 0.4, pan: 0, loop: true, fadeIn: 5, fadeOut: 5 },
      { id: 'ambient', audioUrl: '/sounds/soft-ambient.mp3', volume: 0.3, pan: 0, loop: true, fadeIn: 3, fadeOut: 3 }
    ],
    duration: 0,
    premium: false
  },
  // ... 50+ more soundscapes
];

export class AmbientSoundService {
  private audioContext: AudioContext;
  private currentSoundscape: Soundscape | null = null;
  private activeLayers: Map<string, AudioSourceNode> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
  }

  async playSoundscape(soundscapeId: string): Promise<void> {
    const soundscape = this.getSoundscape(soundscapeId);
    if (!soundscape) return;

    // Stop current soundscape
    await this.stop();

    this.currentSoundscape = soundscape;

    // Load and play all layers
    for (const layer of soundscape.layers) {
      await this.playLayer(layer);
    }
  }

  private async playLayer(layer: SoundLayer): Promise<void> {
    const response = await fetch(layer.audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = layer.loop;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;  // Start silent for fade-in

    // Create panner for stereo positioning
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = layer.pan;

    // Connect nodes
    source.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Fade in
    source.start();
    gainNode.gain.linearRampToValueAtTime(layer.volume, this.audioContext.currentTime + layer.fadeIn);

    this.activeLayers.set(layer.id, { source, gainNode, panner });
  }

  async adjustLayerVolume(layerId: string, volume: number): Promise<void> {
    const layer = this.activeLayers.get(layerId);
    if (layer) {
      layer.gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.5);
    }
  }

  async createCustomMix(layers: { soundscapeId: string; layerId: string; volume: number }[]): Promise<void> {
    await this.stop();

    for (const { soundscapeId, layerId, volume } of layers) {
      const soundscape = this.getSoundscape(soundscapeId);
      const layer = soundscape?.layers.find(l => l.id === layerId);
      if (layer) {
        await this.playLayer({ ...layer, volume });
      }
    }
  }

  async stop(): Promise<void> {
    for (const [, { source, gainNode }] of this.activeLayers) {
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
      setTimeout(() => source.stop(), 1000);
    }
    this.activeLayers.clear();
    this.currentSoundscape = null;
  }

  // Adaptive soundscape based on focus state
  async adaptToFocusState(focusLevel: number): Promise<void> {
    if (!this.currentSoundscape) return;

    // Adjust volumes based on focus level
    // Higher focus = lower ambient, higher binaural
    for (const layer of this.currentSoundscape.layers) {
      const activeLayer = this.activeLayers.get(layer.id);
      if (!activeLayer) continue;

      let adjustedVolume = layer.volume;
      if (layer.id.includes('binaural') || layer.id.includes('alpha')) {
        adjustedVolume *= (1 + focusLevel * 0.3);  // Boost binaural when focused
      } else {
        adjustedVolume *= (1 - focusLevel * 0.2);  // Reduce ambient when focused
      }

      await this.adjustLayerVolume(layer.id, adjustedVolume);
    }
  }
}
```

## 10.3 Binaural Beats

### Implementation:

```typescript
// apps/desktop/src/renderer/services/binaural-beats-service.ts

type BrainwaveState = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

interface BinauralProgram {
  id: string;
  name: string;
  description: string;
  targetState: BrainwaveState;
  duration: number;
  phases: BinauralPhase[];
}

interface BinauralPhase {
  duration: number;      // seconds
  leftFreq: number;      // Hz
  rightFreq: number;     // Hz
  carrierFreq: number;   // Hz
  amplitude: number;     // 0-1
}

const BRAINWAVE_FREQUENCIES = {
  delta: { min: 0.5, max: 4, description: 'Deep sleep, healing' },
  theta: { min: 4, max: 8, description: 'Meditation, creativity' },
  alpha: { min: 8, max: 13, description: 'Relaxed focus, learning' },
  beta: { min: 13, max: 30, description: 'Active thinking, focus' },
  gamma: { min: 30, max: 100, description: 'Peak performance, insight' }
};

const BUILT_IN_PROGRAMS: BinauralProgram[] = [
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Enhance concentration with beta/gamma waves',
    targetState: 'beta',
    duration: 30 * 60,  // 30 minutes
    phases: [
      { duration: 300, leftFreq: 200, rightFreq: 210, carrierFreq: 200, amplitude: 0.3 },  // 10 Hz alpha ramp-up
      { duration: 1200, leftFreq: 200, rightFreq: 218, carrierFreq: 200, amplitude: 0.4 }, // 18 Hz beta
      { duration: 300, leftFreq: 200, rightFreq: 210, carrierFreq: 200, amplitude: 0.3 }   // Ramp-down
    ]
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    description: 'Access theta state for creative insights',
    targetState: 'theta',
    duration: 20 * 60,
    phases: [
      { duration: 180, leftFreq: 150, rightFreq: 160, carrierFreq: 150, amplitude: 0.3 },
      { duration: 900, leftFreq: 150, rightFreq: 156, carrierFreq: 150, amplitude: 0.35 },  // 6 Hz theta
      { duration: 120, leftFreq: 150, rightFreq: 160, carrierFreq: 150, amplitude: 0.3 }
    ]
  },
  // ... more programs
];

export class BinauralBeatsService {
  private audioContext: AudioContext;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private currentProgram: BinauralProgram | null = null;
  private phaseIndex: number = 0;

  async startProgram(programId: string): Promise<void> {
    const program = BUILT_IN_PROGRAMS.find(p => p.id === programId);
    if (!program) return;

    this.currentProgram = program;
    this.phaseIndex = 0;

    this.audioContext = new AudioContext();
    await this.playPhase(program.phases[0]);
  }

  private async playPhase(phase: BinauralPhase): Promise<void> {
    // Create oscillators for left and right channels
    this.leftOscillator = this.audioContext.createOscillator();
    this.rightOscillator = this.audioContext.createOscillator();

    this.leftOscillator.frequency.value = phase.leftFreq;
    this.rightOscillator.frequency.value = phase.rightFreq;

    // Create stereo panning
    const leftPanner = this.audioContext.createStereoPanner();
    leftPanner.pan.value = -1;

    const rightPanner = this.audioContext.createStereoPanner();
    rightPanner.pan.value = 1;

    // Create gain nodes
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();
    leftGain.gain.value = phase.amplitude;
    rightGain.gain.value = phase.amplitude;

    // Connect
    this.leftOscillator.connect(leftGain);
    leftGain.connect(leftPanner);
    leftPanner.connect(this.audioContext.destination);

    this.rightOscillator.connect(rightGain);
    rightGain.connect(rightPanner);
    rightPanner.connect(this.audioContext.destination);

    // Start
    this.leftOscillator.start();
    this.rightOscillator.start();

    // Schedule next phase
    setTimeout(() => this.nextPhase(), phase.duration * 1000);
  }

  private nextPhase(): void {
    if (!this.currentProgram) return;

    this.phaseIndex++;

    if (this.phaseIndex < this.currentProgram.phases.length) {
      this.stopOscillators();
      this.playPhase(this.currentProgram.phases[this.phaseIndex]);
    } else {
      this.stop();
    }
  }

  async stop(): Promise<void> {
    this.stopOscillators();
    this.currentProgram = null;
    this.phaseIndex = 0;
  }

  private stopOscillators(): void {
    this.leftOscillator?.stop();
    this.rightOscillator?.stop();
    this.leftOscillator = null;
    this.rightOscillator = null;
  }

  // Generate custom binaural beat
  async generateCustomBeat(
    targetFrequency: number,
    carrierFrequency: number = 200,
    duration: number = 600
  ): Promise<void> {
    const phase: BinauralPhase = {
      duration,
      leftFreq: carrierFrequency,
      rightFreq: carrierFrequency + targetFrequency,
      carrierFreq: carrierFrequency,
      amplitude: 0.35
    };

    this.currentProgram = {
      id: 'custom',
      name: 'Custom Beat',
      description: `${targetFrequency} Hz binaural beat`,
      targetState: this.frequencyToState(targetFrequency),
      duration,
      phases: [phase]
    };

    await this.playPhase(phase);
  }

  private frequencyToState(freq: number): BrainwaveState {
    if (freq < 4) return 'delta';
    if (freq < 8) return 'theta';
    if (freq < 13) return 'alpha';
    if (freq < 30) return 'beta';
    return 'gamma';
  }
}
```

## 10.4 Social Challenges & Leaderboards

### Implementation:

```typescript
// apps/desktop/src/renderer/services/social-challenges-service.ts

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'solo' | 'versus' | 'team' | 'global';
  metric: 'focus_minutes' | 'tasks_completed' | 'streak_days' | 'deep_work_hours';
  target: number;
  startDate: Date;
  endDate: Date;
  participants: ChallengeParticipant[];
  prizes?: ChallengePrize[];
  status: 'upcoming' | 'active' | 'completed';
}

interface ChallengeParticipant {
  userId: string;
  username: string;
  avatarUrl: string;
  progress: number;
  rank: number;
  joinedAt: Date;
}

interface Leaderboard {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'all-time';
  metric: string;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  score: number;
  change: number;  // Position change from previous period
}

export class SocialChallengesService {
  async joinChallenge(challengeId: string): Promise<void> {
    const challenge = await this.getChallenge(challengeId);

    if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
      throw new Error('Challenge is not accepting participants');
    }

    await this.addParticipant(challengeId, {
      userId: authService.getCurrentUserId(),
      username: authService.getCurrentUserName(),
      avatarUrl: authService.getCurrentUserAvatar(),
      progress: 0,
      rank: challenge.participants.length + 1,
      joinedAt: new Date()
    });
  }

  async createChallenge(config: Partial<Challenge>): Promise<Challenge> {
    const challenge: Challenge = {
      id: generateId(),
      name: config.name!,
      description: config.description || '',
      type: config.type || 'versus',
      metric: config.metric || 'focus_minutes',
      target: config.target || 1000,
      startDate: config.startDate || new Date(),
      endDate: config.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: [{
        userId: authService.getCurrentUserId(),
        username: authService.getCurrentUserName(),
        avatarUrl: authService.getCurrentUserAvatar(),
        progress: 0,
        rank: 1,
        joinedAt: new Date()
      }],
      prizes: config.prizes,
      status: 'upcoming'
    };

    await this.saveChallenge(challenge);
    return challenge;
  }

  async inviteFriends(challengeId: string, userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      await notificationService.sendToUser(userId, {
        type: 'challenge_invite',
        title: 'Challenge Invitation',
        body: `${authService.getCurrentUserName()} invited you to a challenge!`,
        data: { challengeId }
      });
    }
  }

  async updateProgress(challengeId: string, progress: number): Promise<void> {
    await this.updateParticipantProgress(
      challengeId,
      authService.getCurrentUserId(),
      progress
    );

    // Recalculate rankings
    await this.recalculateRankings(challengeId);
  }

  async getLeaderboard(type: Leaderboard['type'], metric: string): Promise<Leaderboard> {
    const entries = await this.fetchLeaderboardEntries(type, metric);

    return {
      id: `${type}-${metric}`,
      type,
      metric,
      entries: entries.slice(0, 100),  // Top 100
      updatedAt: new Date()
    };
  }

  async getMyRank(type: Leaderboard['type'], metric: string): Promise<{ rank: number; total: number }> {
    const leaderboard = await this.getLeaderboard(type, metric);
    const myEntry = leaderboard.entries.find(e => e.userId === authService.getCurrentUserId());

    return {
      rank: myEntry?.rank || 0,
      total: leaderboard.entries.length
    };
  }

  // Weekly challenges (auto-generated)
  async getWeeklyChallenges(): Promise<Challenge[]> {
    const currentWeek = this.getCurrentWeek();

    return [
      {
        id: `weekly-focus-${currentWeek}`,
        name: 'Weekly Focus Champion',
        description: 'Accumulate the most focus minutes this week',
        type: 'global',
        metric: 'focus_minutes',
        target: Infinity,  // Competitive
        startDate: this.getWeekStart(),
        endDate: this.getWeekEnd(),
        participants: [],
        status: 'active'
      },
      {
        id: `weekly-streak-${currentWeek}`,
        name: 'Streak Master',
        description: 'Maintain your streak all week',
        type: 'solo',
        metric: 'streak_days',
        target: 7,
        startDate: this.getWeekStart(),
        endDate: this.getWeekEnd(),
        participants: [],
        prizes: [{ type: 'badge', value: 'streak-master-badge' }],
        status: 'active'
      }
    ];
  }
}
```

---

# 11. CODE QUALITY - PATH TO 10/10

## 11.1 Current Issues & Fixes

### 11.1.1 Critical Issues (Must Fix)

| Issue | Location | Fix | Priority |
|-------|----------|-----|----------|
| localStorage Only | All services | Migrate to SQLite + optional Supabase | Critical |
| No Transaction Support | Multi-step operations | Add transaction wrapper | Critical |
| Weak Error Recovery | All integrations | Add retry logic + notifications | Critical |
| Hardcoded Thresholds | 15+ services | Move to config store | High |
| 172 console.log | Throughout codebase | Replace with structured logging | High |

### 11.1.2 Medium Priority Issues

| Issue | Location | Fix | Priority |
|-------|----------|-----|----------|
| No input validation | goal-service.ts, workflow-engine-service.ts | Add Zod schemas | High |
| Incomplete integrations | Slack, Notion, GitHub | Complete API implementations | High |
| No event bus | Services operate in isolation | Add pub/sub system | High |
| Plugin system incomplete | plugin-system-service.ts | Wire to core services | Medium |

### 11.1.3 Low Priority Issues

| Issue | Location | Fix | Priority |
|-------|----------|-----|----------|
| Unused services | Auto-journaling, typing speed | Remove or implement UI | Low |
| Inconsistent date formats | Multiple services | Standardize on ISO 8601 | Low |

## 11.2 Implementation: Input Validation with Zod

```typescript
// apps/desktop/src/renderer/lib/validators/index.ts

import { z } from 'zod';

// Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  labels: z.array(z.string()).max(20).default([]),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  estimatedMinutes: z.number().min(0).max(10080).optional(),  // Max 1 week
  recurring: z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
    interval: z.number().min(1).max(365),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    endDate: z.date().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

// Goal Schema
export const GoalSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(50),
  category: z.enum(['productivity', 'health', 'learning', 'career', 'personal', 'custom']),
  deadline: z.date().optional(),
  milestones: z.array(z.object({
    value: z.number(),
    label: z.string(),
    achieved: z.boolean().default(false),
  })).max(20).optional(),
});

// Focus Session Schema
export const FocusSessionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['pomodoro', 'deep-work', 'flowtime', 'custom']),
  plannedDuration: z.number().min(1).max(480),  // Max 8 hours
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  distractionBlocking: z.enum(['none', 'soft', 'strict']).default('soft'),
  ambientSound: z.string().optional(),
  goals: z.array(z.string()).max(5).optional(),
});

// Workflow Schema
export const WorkflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  trigger: z.object({
    type: z.enum(['schedule', 'event', 'manual', 'webhook']),
    config: z.record(z.unknown()),
  }),
  actions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.unknown()),
    onSuccess: z.string().optional(),
    onError: z.string().optional(),
  })).min(1).max(50),
  enabled: z.boolean().default(true),
  variables: z.record(z.unknown()).optional(),
});

// Integration Settings Schema
export const IntegrationSettingsSchema = z.object({
  enabled: z.boolean(),
  syncInterval: z.number().min(60).max(86400).optional(),  // 1 min to 24 hours
  bidirectional: z.boolean().default(true),
  conflictResolution: z.enum(['local', 'remote', 'newer', 'ask']).default('newer'),
  filters: z.object({
    projects: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
  }).optional(),
});

// Validator wrapper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}

export class ValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## 11.3 Implementation: Structured Logging

```typescript
// apps/desktop/src/renderer/lib/logger.ts

import winston from 'winston';
import path from 'path';
import { app } from 'electron';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

interface LogContext {
  service?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  [key: string]: unknown;
}

const logPath = path.join(app.getPath('userData'), 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { app: 'wakey', version: app.getVersion() },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logPath, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,  // 10 MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logPath, 'combined.log'),
      maxsize: 50 * 1024 * 1024,  // 50 MB
      maxFiles: 10,
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  error(message: string, meta?: object): void {
    logger.error(message, { ...this.context, ...meta });
  }

  warn(message: string, meta?: object): void {
    logger.warn(message, { ...this.context, ...meta });
  }

  info(message: string, meta?: object): void {
    logger.info(message, { ...this.context, ...meta });
  }

  debug(message: string, meta?: object): void {
    logger.debug(message, { ...this.context, ...meta });
  }

  // Performance timing
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { duration, label });
    };
  }

  // Metrics
  metric(name: string, value: number, tags?: Record<string, string>): void {
    this.info('metric', { metric: name, value, tags });
  }
}

export const createLogger = (service: string) => new Logger({ service });

// Usage in services:
// const logger = createLogger('pomodoro-service');
// logger.info('Focus session started', { duration: 25, taskId: '123' });
```

## 11.4 Implementation: Event Bus

```typescript
// apps/desktop/src/renderer/lib/event-bus.ts

import mitt, { Emitter } from 'mitt';

type WakeyEvents = {
  // Focus events
  'focus:started': { sessionId: string; duration: number; taskId?: string };
  'focus:paused': { sessionId: string; elapsedMinutes: number };
  'focus:resumed': { sessionId: string };
  'focus:completed': { sessionId: string; actualDuration: number; quality: number };
  'focus:abandoned': { sessionId: string; reason: string };

  // Task events
  'task:created': { task: Task };
  'task:updated': { taskId: string; changes: Partial<Task> };
  'task:completed': { task: Task };
  'task:deleted': { taskId: string };

  // Goal events
  'goal:created': { goal: Goal };
  'goal:progress': { goalId: string; progress: number; previousProgress: number };
  'goal:achieved': { goal: Goal };

  // Achievement events
  'achievement:unlocked': { achievement: Achievement };
  'streak:milestone': { days: number };
  'level:up': { newLevel: number; previousLevel: number };

  // Health events
  'burnout:warning': { riskLevel: string; score: number };
  'break:recommended': { reason: string; suggestedDuration: number };

  // Integration events
  'integration:connected': { integrationId: string };
  'integration:disconnected': { integrationId: string };
  'integration:sync:started': { integrationId: string };
  'integration:sync:completed': { integrationId: string; changes: number };
  'integration:error': { integrationId: string; error: string };

  // System events
  'app:ready': void;
  'app:idle': { idleMinutes: number };
  'app:active': void;
  'network:online': void;
  'network:offline': void;
};

class EventBus {
  private emitter: Emitter<WakeyEvents>;
  private history: { event: keyof WakeyEvents; data: any; timestamp: Date }[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.emitter = mitt<WakeyEvents>();
  }

  emit<K extends keyof WakeyEvents>(event: K, data: WakeyEvents[K]): void {
    this.emitter.emit(event, data);

    // Store in history for debugging
    this.history.push({ event, data, timestamp: new Date() });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  on<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
    this.emitter.on(event, handler);
  }

  off<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
    this.emitter.off(event, handler);
  }

  once<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
    const wrappedHandler = (data: WakeyEvents[K]) => {
      this.off(event, wrappedHandler);
      handler(data);
    };
    this.on(event, wrappedHandler);
  }

  getHistory(filter?: { event?: keyof WakeyEvents; since?: Date }): typeof this.history {
    let filtered = this.history;

    if (filter?.event) {
      filtered = filtered.filter(h => h.event === filter.event);
    }
    if (filter?.since) {
      filtered = filtered.filter(h => h.timestamp >= filter.since!);
    }

    return filtered;
  }
}

export const eventBus = new EventBus();
```

## 11.5 Implementation: Error Recovery & Retry Logic

```typescript
// apps/desktop/src/renderer/lib/retry.ts

interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  backoffMs: 1000,
  maxBackoffMs: 30000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  let backoff = opts.backoffMs;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (opts.retryableErrors && !opts.retryableErrors.some(e => lastError.message.includes(e))) {
        throw lastError;
      }

      if (attempt <= opts.maxRetries) {
        opts.onRetry?.(attempt, lastError);

        // Wait with exponential backoff
        await sleep(backoff);
        backoff = Math.min(backoff * opts.backoffMultiplier, opts.maxBackoffMs);
      }
    }
  }

  throw lastError!;
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure!.getTime() > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

# 12. ARCHITECTURE - PATH TO 10/10

## 12.1 Current Architecture Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| Services operate in isolation | Data inconsistency | Add event bus + service registry |
| No dependency injection | Hard to test | Add DI container |
| Mixed concerns in services | Maintenance burden | Separate data/business/presentation |
| No API layer abstraction | Tight coupling | Add repository pattern |

## 12.2 Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   React     │ │   Zustand   │ │   React Query           ││
│  │   Components│ │   Stores    │ │   (Server State)        ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Use Cases │ │   Commands  │ │   Queries               ││
│  │             │ │   (CQRS)    │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Entities  │ │   Value     │ │   Domain Services       ││
│  │             │ │   Objects   │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Event Bus                             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐│
│  │  SQLite   │ │  Supabase │ │  External │ │   File       ││
│  │  (Local)  │ │  (Cloud)  │ │  APIs     │ │   System     ││
│  └───────────┘ └───────────┘ └───────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 12.3 Dependency Injection Container

```typescript
// apps/desktop/src/renderer/lib/di-container.ts

import { Container, injectable, inject } from 'inversify';
import 'reflect-metadata';

// Service identifiers
export const TYPES = {
  // Core services
  TaskService: Symbol.for('TaskService'),
  FocusService: Symbol.for('FocusService'),
  GoalService: Symbol.for('GoalService'),
  AchievementService: Symbol.for('AchievementService'),

  // Infrastructure
  Database: Symbol.for('Database'),
  Logger: Symbol.for('Logger'),
  EventBus: Symbol.for('EventBus'),

  // Integrations
  IntegrationManager: Symbol.for('IntegrationManager'),
  SyncService: Symbol.for('SyncService'),

  // AI
  AIService: Symbol.for('AIService'),
  MultiModelService: Symbol.for('MultiModelService'),
};

// Container setup
const container = new Container();

// Bind services
container.bind(TYPES.Database).to(SQLiteDatabase).inSingletonScope();
container.bind(TYPES.Logger).to(WinstonLogger).inSingletonScope();
container.bind(TYPES.EventBus).to(EventBus).inSingletonScope();

container.bind(TYPES.TaskService).to(TaskServiceImpl).inSingletonScope();
container.bind(TYPES.FocusService).to(FocusServiceImpl).inSingletonScope();
container.bind(TYPES.GoalService).to(GoalServiceImpl).inSingletonScope();

export { container };

// Example service with DI
@injectable()
export class TaskServiceImpl implements TaskService {
  constructor(
    @inject(TYPES.Database) private db: Database,
    @inject(TYPES.EventBus) private eventBus: EventBus,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async create(task: TaskInput): Promise<Task> {
    this.logger.info('Creating task', { title: task.title });

    const validated = validate(TaskSchema, task);
    const created = await this.db.tasks.create(validated);

    this.eventBus.emit('task:created', { task: created });

    return created;
  }
}
```

## 12.4 Repository Pattern

```typescript
// apps/desktop/src/renderer/repositories/base-repository.ts

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  count(filter?: FilterOptions): Promise<number>;
}

export interface FindOptions {
  where?: Record<string, any>;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  include?: string[];
}

// Task Repository Implementation
@injectable()
export class TaskRepository implements Repository<Task> {
  constructor(
    @inject(TYPES.Database) private db: Database
  ) {}

  async findById(id: string): Promise<Task | null> {
    return this.db.query('SELECT * FROM tasks WHERE id = ?', [id]).first();
  }

  async findAll(options?: FindOptions): Promise<Task[]> {
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];

    if (options?.where) {
      const conditions = Object.entries(options.where)
        .map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options?.orderBy) {
      const orders = options.orderBy.map(o => `${o.field} ${o.direction}`);
      query += ` ORDER BY ${orders.join(', ')}`;
    }

    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options?.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    return this.db.query(query, params).all();
  }

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.run(
      `INSERT INTO tasks (id, title, description, status, priority, dueDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, task.title, task.description, task.status, task.priority, task.dueDate, now, now]
    );

    return this.findById(id) as Promise<Task>;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(f => `${f} = ?`).join(', ');

    await this.db.run(
      `UPDATE tasks SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );

    return this.findById(id) as Promise<Task>;
  }

  async delete(id: string): Promise<void> {
    await this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  async count(filter?: FilterOptions): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM tasks';
    const params: any[] = [];

    if (filter) {
      const conditions = Object.entries(filter)
        .map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(query, params).first();
    return result.count;
  }
}
```

---

# 13. TESTING - PATH TO 10/10

## 13.1 Current State: 5/10 → Target: 10/10

| Metric | Current | Target |
|--------|---------|--------|
| Unit Test Coverage | ~5% | 80%+ |
| Integration Tests | 0 | 50+ |
| E2E Tests | 0 | 30+ |
| Performance Tests | 0 | 10+ |

## 13.2 Testing Strategy

### Unit Tests (Vitest)

```typescript
// apps/desktop/src/renderer/services/__tests__/task-service.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskServiceImpl } from '../task-service';
import { createMockDatabase, createMockEventBus, createMockLogger } from '../../test/mocks';

describe('TaskService', () => {
  let taskService: TaskServiceImpl;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockEventBus = createMockEventBus();
    taskService = new TaskServiceImpl(mockDb, mockEventBus, createMockLogger());
  });

  describe('create', () => {
    it('should create a task with valid input', async () => {
      const input = { title: 'Test Task', priority: 'high' as const };
      mockDb.tasks.create.mockResolvedValue({ id: '123', ...input, createdAt: new Date() });

      const result = await taskService.create(input);

      expect(result.title).toBe('Test Task');
      expect(mockEventBus.emit).toHaveBeenCalledWith('task:created', expect.any(Object));
    });

    it('should throw ValidationError for empty title', async () => {
      const input = { title: '', priority: 'high' as const };

      await expect(taskService.create(input)).rejects.toThrow('Validation failed');
    });

    it('should throw ValidationError for title exceeding max length', async () => {
      const input = { title: 'x'.repeat(501), priority: 'high' as const };

      await expect(taskService.create(input)).rejects.toThrow('Validation failed');
    });
  });

  describe('complete', () => {
    it('should mark task as completed and emit event', async () => {
      const task = { id: '123', title: 'Test', status: 'pending' };
      mockDb.tasks.findById.mockResolvedValue(task);
      mockDb.tasks.update.mockResolvedValue({ ...task, status: 'completed' });

      await taskService.complete('123');

      expect(mockDb.tasks.update).toHaveBeenCalledWith('123', { status: 'completed' });
      expect(mockEventBus.emit).toHaveBeenCalledWith('task:completed', expect.any(Object));
    });

    it('should update recurring task after completion', async () => {
      const task = {
        id: '123',
        title: 'Daily standup',
        recurring: { type: 'daily', interval: 1 }
      };
      mockDb.tasks.findById.mockResolvedValue(task);

      await taskService.complete('123');

      expect(mockDb.tasks.create).toHaveBeenCalled();  // New instance created
    });
  });

  // ... 100+ more unit tests
});
```

### Integration Tests

```typescript
// apps/desktop/src/renderer/__tests__/integration/focus-workflow.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../../test/setup';
import { container } from '../../lib/di-container';
import { TYPES } from '../../lib/di-container';

describe('Focus Workflow Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should complete full focus session workflow', async () => {
    const focusService = container.get(TYPES.FocusService);
    const taskService = container.get(TYPES.TaskService);
    const achievementService = container.get(TYPES.AchievementService);

    // Create a task
    const task = await taskService.create({ title: 'Integration test task' });

    // Start focus session
    const session = await focusService.start({
      type: 'pomodoro',
      plannedDuration: 25,
      taskId: task.id
    });

    expect(session.status).toBe('active');

    // Simulate session completion
    await focusService.complete(session.id, {
      actualDuration: 25,
      quality: 0.9,
      distractions: 2
    });

    // Verify task was updated
    const updatedTask = await taskService.findById(task.id);
    expect(updatedTask.focusMinutes).toBe(25);

    // Verify achievements were checked
    const achievements = await achievementService.getRecentUnlocks();
    // First focus session should unlock "First Step" achievement
    expect(achievements.some(a => a.id === 'first-focus')).toBe(true);
  });

  it('should sync focus session to connected integrations', async () => {
    const focusService = container.get(TYPES.FocusService);
    const integrationManager = container.get(TYPES.IntegrationManager);

    // Mock Slack integration
    await integrationManager.connectMock('slack');

    const session = await focusService.start({
      type: 'deep-work',
      plannedDuration: 90
    });

    // Verify Slack status was updated
    const slackIntegration = integrationManager.get('slack');
    expect(slackIntegration.getLastStatusUpdate()).toMatchObject({
      status_text: expect.stringContaining('focus'),
      status_emoji: ':dart:'
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// apps/desktop/e2e/focus-session.spec.ts

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

let electronApp: any;
let page: any;

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['dist/main/index.js'] });
  page = await electronApp.firstWindow();
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Focus Session', () => {
  test('should start and complete a pomodoro session', async () => {
    // Navigate to focus page
    await page.click('[data-testid="nav-focus"]');

    // Start 25-minute pomodoro
    await page.click('[data-testid="start-pomodoro"]');

    // Verify timer started
    const timer = page.locator('[data-testid="focus-timer"]');
    await expect(timer).toContainText('25:00');

    // Wait a few seconds
    await page.waitForTimeout(5000);

    // Verify timer is counting down
    await expect(timer).not.toContainText('25:00');

    // Complete session (fast-forward for testing)
    await page.evaluate(() => window.__testHelpers__.completeFocusSession());

    // Verify completion modal
    await expect(page.locator('[data-testid="session-complete-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-duration"]')).toContainText('25');
  });

  test('should block distractions during strict mode', async () => {
    await page.click('[data-testid="nav-focus"]');
    await page.click('[data-testid="distraction-mode-strict"]');
    await page.click('[data-testid="start-pomodoro"]');

    // Try to navigate away
    await page.click('[data-testid="nav-tasks"]');

    // Should show blocking modal
    await expect(page.locator('[data-testid="distraction-warning"]')).toBeVisible();
  });

  test('should update Slack status when integrated', async () => {
    // Connect Slack (mock)
    await page.evaluate(() => window.__testHelpers__.mockSlackConnection());

    await page.click('[data-testid="nav-focus"]');
    await page.click('[data-testid="start-pomodoro"]');

    // Verify Slack status indicator
    await expect(page.locator('[data-testid="slack-status-badge"]')).toContainText('Focus mode set');
  });
});
```

### Performance Tests

```typescript
// apps/desktop/src/renderer/__tests__/performance/load.test.ts

import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance', () => {
  it('should load 10,000 tasks in under 500ms', async () => {
    const taskService = container.get(TYPES.TaskService);

    // Generate test data
    const tasks = Array.from({ length: 10000 }, (_, i) => ({
      title: `Task ${i}`,
      priority: 'medium' as const
    }));

    // Insert in batches
    const insertStart = performance.now();
    await taskService.bulkCreate(tasks);
    const insertDuration = performance.now() - insertStart;

    // Query all
    const queryStart = performance.now();
    const allTasks = await taskService.findAll();
    const queryDuration = performance.now() - queryStart;

    expect(insertDuration).toBeLessThan(5000);  // 5 seconds for insert
    expect(queryDuration).toBeLessThan(500);    // 500ms for query
    expect(allTasks.length).toBe(10000);
  });

  it('should handle 100 concurrent focus sessions', async () => {
    const focusService = container.get(TYPES.FocusService);

    const start = performance.now();

    const sessions = await Promise.all(
      Array.from({ length: 100 }, () =>
        focusService.start({ type: 'pomodoro', plannedDuration: 25 })
      )
    );

    const duration = performance.now() - start;

    expect(sessions.length).toBe(100);
    expect(duration).toBeLessThan(2000);  // 2 seconds
  });
});
```

---

# 14. SECURITY - PATH TO 10/10

## 14.1 Current State: 6/10 → Target: 10/10

| Issue | Risk | Solution |
|-------|------|----------|
| No data encryption | High | Add AES-256 encryption |
| Tokens in plain storage | High | Use OS keychain |
| No input sanitization | Medium | Add sanitization layer |
| No rate limiting | Medium | Add rate limiter |
| No audit logging | Low | Add security audit logs |

## 14.2 Implementation: Secure Storage

```typescript
// apps/desktop/src/main/secure-storage.ts

import keytar from 'keytar';
import crypto from 'crypto';
import { safeStorage } from 'electron';

const SERVICE_NAME = 'Wakey';

export class SecureStorage {
  private encryptionKey: Buffer | null = null;

  async initialize(): Promise<void> {
    // Get or create master key from OS keychain
    let masterKey = await keytar.getPassword(SERVICE_NAME, 'master-key');

    if (!masterKey) {
      masterKey = crypto.randomBytes(32).toString('hex');
      await keytar.setPassword(SERVICE_NAME, 'master-key', masterKey);
    }

    this.encryptionKey = Buffer.from(masterKey, 'hex');
  }

  async setCredential(key: string, value: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, key, value);
  }

  async getCredential(key: string): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, key);
  }

  async deleteCredential(key: string): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, key);
  }

  // For general encrypted storage
  encrypt(data: string): string {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const { iv, data, tag } = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export const secureStorage = new SecureStorage();
```

## 14.3 Implementation: Input Sanitization

```typescript
// apps/desktop/src/renderer/lib/sanitize.ts

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '')  // Remove angle brackets
    .replace(/javascript:/gi, '')  // Remove javascript: URIs
    .trim();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')  // Replace illegal characters
    .replace(/\.\./g, '')  // Remove path traversal
    .substring(0, 255);  // Limit length
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
```

## 14.4 Implementation: Audit Logging

```typescript
// apps/desktop/src/renderer/lib/audit-logger.ts

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date()
    };

    this.events.push(auditEvent);
    this.persist(auditEvent);

    // Critical security events
    if (this.isCriticalEvent(event.action)) {
      this.alertSecurityTeam(auditEvent);
    }
  }

  private isCriticalEvent(action: string): boolean {
    const criticalActions = [
      'auth.failed_login',
      'auth.password_changed',
      'data.export',
      'integration.connected',
      'settings.security_changed'
    ];
    return criticalActions.includes(action);
  }

  async getAuditTrail(filter: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditEvent[]> {
    // Query from secure storage
  }

  private async persist(event: AuditEvent): Promise<void> {
    // Write to encrypted audit log
  }

  private async alertSecurityTeam(event: AuditEvent): Promise<void> {
    // Send notification for critical events
  }
}

export const auditLogger = new AuditLogger();
```

---

# 15. DOCUMENTATION - PATH TO 10/10

## 15.1 Current State: 8/10 → Target: 10/10

| Gap | Solution |
|-----|----------|
| No API documentation | Add OpenAPI/Swagger docs |
| Incomplete JSDoc | Add comprehensive JSDoc |
| No user guide | Create user documentation |
| No developer guide | Create contributor docs |
| No architecture docs | Add ADRs (Architecture Decision Records) |

## 15.2 Documentation Structure

```
docs/
├── user-guide/
│   ├── getting-started.md
│   ├── focus-sessions.md
│   ├── tasks-and-goals.md
│   ├── integrations.md
│   ├── gamification.md
│   ├── health-wellness.md
│   ├── keyboard-shortcuts.md
│   └── faq.md
├── developer-guide/
│   ├── setup.md
│   ├── architecture.md
│   ├── contributing.md
│   ├── testing.md
│   ├── debugging.md
│   └── releasing.md
├── api/
│   ├── openapi.yaml
│   ├── services/
│   │   ├── task-service.md
│   │   ├── focus-service.md
│   │   └── ...
│   └── integrations/
│       ├── building-integrations.md
│       └── integration-api.md
├── adr/
│   ├── 001-monorepo-structure.md
│   ├── 002-state-management.md
│   ├── 003-database-choice.md
│   └── ...
└── changelog/
    └── CHANGELOG.md
```

---

# 16. MAINTAINABILITY - PATH TO 10/10

## 16.1 Implementation Tasks

| Task | Description | Priority |
|------|-------------|----------|
| 16.1.1 | Add strict TypeScript config | High |
| 16.1.2 | Implement code coverage gates | High |
| 16.1.3 | Add automated dependency updates | Medium |
| 16.1.4 | Create service health checks | Medium |
| 16.1.5 | Add feature flags system | Medium |
| 16.1.6 | Implement A/B testing framework | Low |

## 16.2 Feature Flags

```typescript
// apps/desktop/src/renderer/lib/feature-flags.ts

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: FeatureCondition[];
}

interface FeatureCondition {
  type: 'user_id' | 'version' | 'platform' | 'subscription';
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in';
  value: any;
}

export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();

  isEnabled(key: string, context?: Record<string, any>): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    if (!flag.enabled) return false;

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashUserId(context?.userId || 'anonymous');
      if (hash > flag.rolloutPercentage) return false;
    }

    // Check conditions
    if (flag.conditions) {
      for (const condition of flag.conditions) {
        if (!this.evaluateCondition(condition, context)) {
          return false;
        }
      }
    }

    return true;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }
}

export const featureFlags = new FeatureFlagService();
```

---

# 17. DATABASE ARCHITECTURE

## 17.1 Local Storage (SQLite) + Optional Cloud Sync (Supabase)

### User Options:

1. **Local Only** - Data stays on device (default)
2. **Cloud Sync** - Optional Supabase connection for sync
3. **Self-Hosted** - User can provide their own Supabase instance

### SQLite Schema:

```sql
-- apps/desktop/src/main/database/schema.sql

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  completed_at TEXT,
  project_id TEXT REFERENCES projects(id),
  parent_task_id TEXT REFERENCES tasks(id),
  recurring_config TEXT,  -- JSON
  labels TEXT,  -- JSON array
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  metadata TEXT,  -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  sync_status TEXT DEFAULT 'synced',
  remote_id TEXT
);

-- Focus Sessions
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  task_id TEXT REFERENCES tasks(id),
  project_id TEXT REFERENCES projects(id),
  status TEXT DEFAULT 'active',
  quality_score REAL,
  distractions INTEGER DEFAULT 0,
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  metadata TEXT,
  sync_status TEXT DEFAULT 'synced'
);

-- Goals
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_value REAL,
  current_value REAL DEFAULT 0,
  unit TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'active',
  milestones TEXT,  -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  sync_status TEXT DEFAULT 'synced'
);

-- Achievements
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (datetime('now')),
  progress REAL DEFAULT 0,
  metadata TEXT
);

-- Streaks
CREATE TABLE streaks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  last_activity_date TEXT,
  started_at TEXT,
  metadata TEXT
);

-- Integration Tokens (encrypted)
CREATE TABLE integration_tokens (
  id TEXT PRIMARY KEY,
  integration_id TEXT NOT NULL UNIQUE,
  encrypted_data TEXT NOT NULL,  -- Encrypted JSON
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Sync Queue
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  data TEXT,  -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  attempts INTEGER DEFAULT 0,
  last_attempt TEXT,
  error TEXT
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_focus_sessions_date ON focus_sessions(started_at);
CREATE INDEX idx_sync_queue_status ON sync_queue(created_at);
```

### Supabase Cloud Schema:

```sql
-- Supabase schema for optional cloud sync

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only see their own tasks"
  ON tasks FOR ALL
  USING (user_id = auth.uid());

-- Real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_sessions;
```

---

# 18. COMPETITIVE PARITY IMPLEMENTATION

## 18.1 Feature Gap Analysis vs Market Leaders

| Feature | Notion | Todoist | RescueTime | Forest | Centered | Wakey Target |
|---------|--------|---------|------------|--------|----------|--------------|
| Recurring Tasks | ❌ | ✅✅ | ❌ | ❌ | ❌ | ✅✅ |
| Team Features | ✅✅ | ✅ | ✅ | ❌ | ❌ | ✅✅ |
| Mobile App | ✅ | ✅✅ | ✅ | ✅ | ✅ | ✅ (Future) |
| Offline Mode | ❌ | ❌ | ❌ | ✅ | ✅ | ✅✅ |
| Integrations | 100+ | 60+ | 100+ | 0 | 0 | **180+** |
| AI Features | ✅ | ❌ | ❌ | ❌ | ❌ | ✅✅✅ |
| Focus Timer | ❌ | ✅ | ❌ | ✅ | ✅ | ✅✅ |
| Gamification | ❌ | ✅ | ❌ | ✅✅ | ❌ | ✅✅✅ |
| Health/Wellness | ❌ | ❌ | ✅ | ❌ | ❌ | ✅✅✅ |
| Wearables | ❌ | ❌ | ❌ | ❌ | ❌ | ✅✅ |

## 18.2 Unique Differentiators

1. **Multi-Model AI Consensus** - Only app with AI voting
2. **Comprehensive Burnout Detection** - Most sophisticated wellness
3. **Wearable Integration** - First productivity app with full wearable support
4. **180+ Integrations** - Most connected productivity platform
5. **Local-First with Optional Sync** - Privacy-respecting architecture

---

# 19. PHASED EXECUTION TIMELINE

## Phase 1: Foundation (Weeks 1-4)

| Week | Focus Area | Deliverables |
|------|------------|--------------|
| 1 | Database Migration | SQLite implementation, data migration |
| 2 | Error Handling | Retry logic, structured logging, event bus |
| 3 | Input Validation | Zod schemas, sanitization |
| 4 | Testing Foundation | Unit tests 40%+, CI/CD setup |

## Phase 2: Core Excellence (Weeks 5-8)

| Week | Focus Area | Deliverables |
|------|------------|--------------|
| 5 | Core Features 10/10 | Enhanced pomodoro, deep work, trends |
| 6 | AI Enhancement | Multi-model, proactive insights |
| 7 | Gamification | Achievements 2.0, challenges, leaderboards |
| 8 | Health & Wellness | Wearable integrations, burnout 2.0 |

## Phase 3: Integrations (Weeks 9-12)

| Week | Focus Area | Deliverables |
|------|------------|--------------|
| 9 | Productivity Integrations | Todoist, Notion, Asana (complete) |
| 10 | Communication | Slack, Teams, Discord (complete) |
| 11 | Calendar & Dev Tools | Google Calendar, GitHub (complete) |
| 12 | Automation | Zapier, Make, custom webhooks |

## Phase 4: Advanced Features (Weeks 13-16)

| Week | Focus Area | Deliverables |
|------|------------|--------------|
| 13 | Recurring Tasks & Dependencies | Full implementation |
| 14 | Team Collaboration | Workspaces, shared goals |
| 15 | Offline Sync | Queue system, conflict resolution |
| 16 | Workflow Automation | Visual builder, templates |

## Phase 5: Polish & Distribution (Weeks 17-20)

| Week | Focus Area | Deliverables |
|------|------------|--------------|
| 17 | Enhanced UX | Tree visualization, ambient sounds |
| 18 | Performance | Optimization, profiling |
| 19 | Security | Encryption, audit logging |
| 20 | Production Build | .exe generation, auto-updates, distribution |

---

# 20. SUCCESS METRICS & KPIs

## 20.1 Technical Metrics

| Metric | Current | Target | Deadline |
|--------|---------|--------|----------|
| Test Coverage | 5% | 80%+ | Week 8 |
| Build Success | 100% | 100% | Maintain |
| Lint Errors | 0 | 0 | Maintain |
| Integration Completion | 50% | 100% | Week 12 |
| Bundle Size | 878 KB | <1.5 MB | Week 20 |
| Cold Start Time | ~3s | <2s | Week 20 |
| Memory Usage | ~200 MB | <300 MB | Week 20 |

## 20.2 Feature Ratings Target

| Category | Current | Target |
|----------|---------|--------|
| Feature Completeness | 8.5/10 | **10/10** |
| Code Quality | 6.5/10 | **10/10** |
| Architecture | 7.0/10 | **10/10** |
| Testing | 5.0/10 | **10/10** |
| Performance | 7.5/10 | **10/10** |
| Security | 6.0/10 | **10/10** |
| Documentation | 8.0/10 | **10/10** |
| Maintainability | 7.0/10 | **10/10** |
| **Overall** | **7.2/10** | **10/10** |

## 20.3 Business Metrics

| Metric | Target |
|--------|--------|
| .exe File Size | 200-300 MB |
| Installer Platforms | Windows, macOS, Linux |
| Auto-Update Support | Yes |
| Code Signing | Yes (EV Certificate) |
| Integration Count | 180+ |
| Unique AI Features | 5+ |

---

# CONCLUSION

This Master Implementation Plan transforms Wakey from a promising productivity tool (7.2/10) into a **production-ready, startup-level application (10/10)** with:

- **180+ integrations** (exceeding Notion's ~100)
- **.exe distribution** with auto-updates and code signing
- **All ratings at 10/10** across every category
- **Unique differentiators** no competitor offers
- **Privacy-first architecture** with local-first + optional cloud
- **Enterprise-ready** with team features and security

**Total Estimated Implementation: 20 weeks**

---

*Generated by Claude Code on February 2, 2026*
*This is the most comprehensive implementation plan for Wakey.*

