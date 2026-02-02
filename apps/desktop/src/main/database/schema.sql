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

-- Projects (referenced by tasks and focus_sessions)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_focus_sessions_date ON focus_sessions(started_at);
CREATE INDEX idx_sync_queue_status ON sync_queue(created_at);
