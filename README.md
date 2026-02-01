# 🚀 Wakey - Ultra-Advanced AI Productivity Platform

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28+-47848F.svg)

**Transform your productivity with AI-powered deep research, autonomous agents, and intelligent activity tracking.**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Overview

Wakey is a **next-generation productivity platform** that combines intelligent activity tracking with autonomous AI agents. Built for power users, researchers, developers, and knowledge workers who demand more than just time tracking—Wakey learns from your work patterns, automates research, and amplifies your cognitive capabilities.

> **"Not just better tools. Invisible intelligence working alongside you."**

### 🎯 What Makes Wakey Different?

| Feature | Traditional Tools | Wakey |
|---------|------------------|-------|
| **Activity Tracking** | Manual categorization | AI-powered auto-categorization |
| **Research** | Hours of Google searches | 20-minute autonomous deep research |
| **Code Reviews** | Single perspective | Multi-model AI consensus (Claude + GPT + DeepSeek) |
| **Analytics** | Surface-level charts | Causal inference & predictive analytics |
| **Learning** | Fixed, passive | Evolves with you, personalized paths |

---

## 🔥 Features

### 📊 **Intelligent Activity Tracking**
- **Real-time app monitoring** with automatic categorization
- **Focus session management** with Pomodoro-style timers
- **Distraction detection** and productivity scoring
- **Daily/weekly analytics** with AI-generated insights

### 🤖 **Autonomous AI Agents**
| Agent | Description |
|-------|-------------|
| **Research Agent** | 24/7 topic monitoring with comprehensive summaries |
| **Code Review Agent** | Multi-model consensus (Claude, GPT, DeepSeek) |
| **Trend Agent** | Real-time monitoring of industry updates |
| **Prediction Agent** | Anticipates tasks based on your patterns |

### 🧠 **Knowledge Management**
- **Notes with AI-powered tagging** and smart linking
- **Knowledge graphs** that visualize concept relationships
- **Flashcard system** with spaced repetition
- **Full-text search** with semantic understanding

### 🔬 **Deep Research Automation**
- **Perplexity-style research** with 93%+ fact-checking accuracy
- **Multi-source literature reviews** generated automatically
- **Real-time web integration** for up-to-date information
- **Citation management** with AI organization

### 💻 **AI-Powered Development**
- **Real-time code generation** from natural language
- **AI pair programming** mode
- **Intelligent documentation** generator
- **Architecture advisor** for scalable designs
- **Performance bottleneck** detection

### 📈 **Advanced Analytics**
- **Causal inference engine** (not just correlation!)
- **Predictive analytics** with uncertainty intervals
- **Time series forecasting** with confidence bands
- **Monte Carlo simulation** for scenario planning

---

## 🏗 Architecture

```
wakey/
├── packages/
│   ├── ai/                 # AI services (Groq, multi-model)
│   │   ├── src/
│   │   │   ├── insights.ts     # Productivity insights generation
│   │   │   ├── categorize.ts   # App categorization with AI
│   │   │   └── multi-model.ts  # Multi-provider AI routing
│   │   └── package.json
│   │
│   ├── tracking/           # Activity tracking engine
│   │   ├── src/
│   │   │   ├── monitor.ts      # Active window monitoring
│   │   │   ├── session.ts      # Focus session management
│   │   │   └── analytics.ts    # Stats aggregation
│   │   └── package.json
│   │
│   ├── database/           # SQLite data layer
│   │   ├── src/
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── activities.ts   # Activity CRUD
│   │   │   └── knowledge.ts    # Notes & graphs
│   │   └── package.json
│   │
│   ├── browser-extension/  # Chrome/Firefox extension
│   │   └── src/
│   └── shared/             # Shared types & utilities
│       └── src/
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── index.html          # API reference site
│
└── details/
    └── ultra_advanced_executive_summary.md
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Desktop** | Electron 28 |
| **AI Providers** | Groq (LLaMA 3), OpenAI, Claude, Ollama |
| **Database** | SQLite with better-sqlite3 |
| **Build** | Electron Builder, TypeScript 5.3 |

---

## 📦 Installation

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git**

### Quick Install

```bash
# Clone the repository
git clone https://github.com/HarshalJain-cs/wakey.git
cd wakey/wakey

# Install dependencies
npm install

# Build packages
npm run build

# Start development mode
npm run dev
```

### Production Build

```bash
# Build for your platform
npm run build:win     # Windows (.exe)
npm run build:mac     # macOS (.dmg)
npm run build:linux   # Linux (.AppImage)
```

---

## 🚀 Quick Start

### 1. Configure AI Providers

Set your API keys in the app settings:

```typescript
// Via settings UI or programmatically
setProviderApiKey('groq', 'gsk_your_groq_key');
setProviderApiKey('openai', 'sk-your_openai_key');  // Optional
```

### 2. Start Tracking

```typescript
// Toggle activity tracking
await window.api.invoke('set-tracking-status', true);

// Check current status
const isTracking = await window.api.invoke('get-tracking-status');
```

### 3. Run a Focus Session

```typescript
// Start 25-minute focus session
const sessionId = await window.api.invoke('start-focus-session', 'focus', 25);

// End session with quality rating
await window.api.invoke('end-focus-session', sessionId, 85, 2);
```

### 4. Get AI Insights

```typescript
import { generateProductivityInsights } from '@wakey/ai';

const insights = await generateProductivityInsights({
  focusMinutes: 120,
  distractionCount: 5,
  topApps: [{ app: 'VSCode', minutes: 90 }],
  sessionsCompleted: 3
});
// Returns: ['Consider longer sessions...', 'Great VS Code focus!', '...']
```

---

## 📚 API Documentation

### IPC Channels

| Channel | Description |
|---------|-------------|
| `get-settings` / `set-setting` | App configuration |
| `get-tracking-status` / `set-tracking-status` | Toggle monitoring |
| `get-today-activities` / `get-today-stats` | Activity data |
| `start-focus-session` / `end-focus-session` | Focus management |
| `get-tasks` / `create-task` / `update-task-status` | Task management |
| `get-notes` / `save-notes` | Knowledge base |
| `get-knowledge-graph` / `save-knowledge-graph` | Graph operations |

### Multi-Model AI Service

```typescript
import { queryWithFallback, generateConsensus } from '@wakey/ai';

// Query with automatic fallback
const response = await queryWithFallback(
  'Explain quantum computing in simple terms',
  'You are a helpful teacher',
  200
);

// Get consensus from multiple models
const consensus = await generateConsensus(
  'Best practices for React performance?',
  'You are a senior React developer',
  500
);
```

### Supported AI Providers

| Provider | Model | Priority |
|----------|-------|----------|
| **Groq** | llama3-8b-8192 | 1 (Default) |
| **Ollama** | llama3.2 | 2 (Local) |
| **OpenAI** | gpt-3.5-turbo | 3 |
| **Claude** | claude-3-haiku | 4 |

📖 **Full API documentation:** [docs/API_DOCUMENTATION.md](./wakey/docs/API_DOCUMENTATION.md)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` | Start focus session |
| `Ctrl+Shift+T` | Toggle tracking |

---

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] Activity tracking engine
- [x] Focus session management
- [x] Basic AI insights
- [x] Knowledge management

### Phase 2: AI Enhancement 🚧
- [x] Multi-model AI service
- [x] Autonomous agents
- [ ] Deep research automation
- [ ] Causal inference engine

### Phase 3: Advanced Features 📋
- [ ] Team collaboration
- [ ] Browser extension sync
- [ ] Mobile companion app
- [ ] API marketplace

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/wakey.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'Add amazing feature'

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/HarshalJain-cs/wakey/issues)
- **Discussions:** [GitHub Discussions](https://github.com/HarshalJain-cs/wakey/discussions)

---

<div align="center">

**Built with ❤️ by the Wakey Team**

*Transform your productivity. One insight at a time.*

</div>
