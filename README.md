# 🔥 Wakey - AI-Powered Productivity Platform

> **77 features** | **6 months** | **3 developers** | **$0/month**

Wakey is a next-generation productivity platform combining activity tracking, focus sessions, AI insights, and deep research capabilities. Built for traders, developers, and knowledge workers.

## ✨ Features

### Phase 1 (Weeks 1-4)
- ⏱️ **Focus Timer** - Pomodoro & custom durations
- 📊 **Activity Tracking** - App & window monitoring
- 📈 **Dashboard** - 6 customizable widgets
- 🤖 **AI Insights** - Groq-powered productivity tips

### Phase 2 (Weeks 5-8)
- 🚫 **Distraction Blocker** - Alert popups
- 📋 **Task Management** - Projects & clients
- 📧 **Reports** - Daily/weekly email summaries
- 🔍 **Deep Research** - Web search integration

### More...
See [implementation_plan.md](./docs/implementation_plan.md) for full 77-feature roadmap.

## 🚀 Quick Start

```bash
# Install pnpm if not installed
npm install -g pnpm

# Install dependencies
pnpm install

# Run desktop app in development
pnpm desktop
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Frontend | React 18 + Vite |
| Desktop | Electron |
| Styling | Tailwind CSS |
| Database | SQLite (local) + Supabase (cloud) |
| AI | Groq (free) + Ollama (local) |
| Build | Turborepo + pnpm |

## 📁 Project Structure

```
wakey/
├── apps/
│   └── desktop/       # Electron + React app
├── packages/
│   ├── database/      # SQLite layer
│   ├── tracking/      # Activity tracking
│   ├── ai/            # AI integrations
│   └── shared/        # Types & utilities
└── docs/              # Documentation
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` | Start focus session |
| `Ctrl+Shift+T` | Toggle tracking |

## 🎨 Design

- **Colors**: Teal (#14b8a6), Dark (#0f172a), Grey (#475569)
- **Theme**: Dark mode default, light mode available
- **Font**: Inter (UI), JetBrains Mono (code)

## 📜 License

MIT © Wakey Team

---

**Part of the Jarvis Project** 🤖
