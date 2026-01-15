# Wakey API Documentation

> **Version:** 0.1.0  
> **Last Updated:** January 15, 2026

---

## Table of Contents

1. [IPC Channels](#ipc-channels)
2. [AI Service](#ai-service)
3. [Agents Service](#agents-service)
4. [Multi-Model Service](#multi-model-service)
5. [Knowledge Service](#knowledge-service)

---

## IPC Channels

The Electron main process exposes these IPC handlers for renderer communication:

### Settings

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-settings` | none | `Settings` | Get all app settings |
| `set-setting` | `key: string, value: unknown` | `boolean` | Update a setting |

### Window Controls

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `window-minimize` | none | `void` | Minimize window |
| `window-maximize` | none | `void` | Toggle maximize |
| `window-close` | none | `void` | Hide window to tray |

### Activity Tracking

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-tracking-status` | none | `boolean` | Current tracking state |
| `set-tracking-status` | `boolean` | `boolean` | Start/stop tracking |
| `get-today-activities` | none | `Activity[]` | Today's activity list |
| `get-today-stats` | none | `TodayStats` | Aggregated stats |
| `get-current-activity` | none | `CurrentActivity \| null` | Active app info |

### Focus Sessions

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `start-focus-session` | `type: 'focus'\|'break', minutes: number` | `number` | Session ID |
| `end-focus-session` | `id: number, quality: number, distractions: number` | `void` | End and score session |

### Tasks

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-tasks` | none | `Task[]` | All tasks sorted |
| `create-task` | `title: string, priority: string` | `number` | New task ID |
| `update-task-status` | `id: number, status: string` | `void` | Update task status |
| `delete-task` | `id: number` | `void` | Delete task |

### Knowledge

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-notes` | none | `Note[]` | All notes |
| `save-notes` | `Note[]` | `boolean` | Save notes |
| `get-knowledge-graph` | none | `{nodes, edges}` | Graph data |
| `save-knowledge-graph` | `{nodes, edges}` | `boolean` | Save graph |
| `get-flashcards` | none | `Flashcard[]` | All flashcards |
| `save-flashcards` | `Flashcard[]` | `boolean` | Save flashcards |

### Agents

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-agent-tasks` | none | `AgentTask[]` | Agent task queue |
| `save-agent-tasks` | `AgentTask[]` | `boolean` | Save task queue |

---

## AI Service

**Location:** `src/renderer/services/ai.ts`

### Configuration

```typescript
import { setGroqApiKey } from './ai';
setGroqApiKey('gsk_xxxxxxxxxxxx');
```

### Functions

#### `generateProductivityInsights(data)`
Generates 3 AI-powered productivity insights.

```typescript
const insights = await generateProductivityInsights({
  focusMinutes: 120,
  distractionCount: 5,
  topApps: [{ app: 'VSCode', minutes: 90 }],
  sessionsCompleted: 3
});
// Returns: ['Consider longer sessions...', 'Reduce distractions...', '...']
```

#### `categorizeAppWithAI(appName, windowTitle)`
Categorizes an app using AI with rule-based fallback.

#### `calculateFocusScore(data)`
Calculates focus quality score (0-100).

```typescript
const score = calculateFocusScore({
  focusMinutes: 25,
  distractionCount: 2,
  contextSwitches: 3,
  sessionGoalMinutes: 25
});
// Returns: 94
```

#### `generateDailySummary(data)`
Generates encouraging daily summary.

---

## Agents Service

**Location:** `src/renderer/services/agents-service.ts`

### Agent Types

| Type | Description |
|------|-------------|
| `research` | Monitors topics and generates summaries |
| `code-review` | Analyzes code patterns and suggests improvements |
| `trend` | Monitors trends and important updates |
| `prediction` | Predicts tasks based on user patterns |

### Usage

```typescript
import { agentManager } from './agents-service';

// Configure and start agent
agentManager.configureAgent('research', { enabled: true, interval: 60 });
agentManager.startAgent('research');

// Run agent manually
const result = await agentManager.runAgent('research');

// Get all agents status
const agents = agentManager.getAllAgents();
```

---

## Multi-Model Service

**Location:** `src/renderer/services/multi-model-service.ts`

### Supported Providers

| Provider | Model | Priority | Default |
|----------|-------|----------|---------|
| Groq | llama3-8b-8192 | 1 | ✅ |
| Ollama | llama3.2 | 2 | ✅ |
| OpenAI | gpt-3.5-turbo | 3 | ❌ |
| Claude | claude-3-haiku | 4 | ❌ |

### Usage

```typescript
import { 
  setProviderApiKey, 
  generateConsensus, 
  queryWithFallback 
} from './multi-model-service';

// Configure
setProviderApiKey('groq', 'your-key');

// Query with fallback
const response = await queryWithFallback(
  'What is productivity?',
  'Be concise',
  200
);

// Multi-model consensus
const consensus = await generateConsensus(
  'Best productivity tips?',
  'You are a productivity expert',
  300
);
```

---

## Knowledge Service

**Location:** `src/renderer/services/knowledge-service.ts`

### Features

- **Notes Management** - CRUD operations with tags
- **Knowledge Graph** - Nodes and edges for connections
- **Search** - Full-text search across notes

### Usage

```typescript
import { 
  createNote, 
  getAllNotes, 
  searchNotes,
  getKnowledgeGraph 
} from './knowledge-service';

// Create note
const note = createNote(
  'Meeting Notes',
  'Discussed project timeline...',
  ['work', 'meetings']
);

// Search
const results = searchNotes('timeline');

// Get graph
const graph = getKnowledgeGraph();
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` | Start focus session |
| `Ctrl+Shift+T` | Toggle tracking |

---

*Generated for Wakey v0.1.0*
