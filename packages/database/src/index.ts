import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (db) return db;

    // Use app data directory for database
    const dbPath = process.env.NODE_ENV === 'development'
        ? join(__dirname, '../../wakey.db')
        : join(app.getPath('userData'), 'wakey.db');

    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Initialize schema
    initializeSchema(db);

    return db;
}

function initializeSchema(db: Database.Database): void {
    db.exec(`
    -- Activities (core tracking)
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name TEXT NOT NULL,
      window_title TEXT,
      url TEXT,
      category TEXT,
      duration_seconds INTEGER DEFAULT 0,
      is_distraction INTEGER DEFAULT 0,
      screenshot_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Focus Sessions
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('focus', 'break', 'meeting')) DEFAULT 'focus',
      duration_minutes INTEGER,
      quality_score INTEGER,
      distractions_count INTEGER DEFAULT 0,
      context_switches INTEGER DEFAULT 0,
      started_at TEXT,
      ended_at TEXT
    );

    -- Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
      project_id INTEGER,
      estimated_minutes INTEGER,
      actual_minutes INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_name TEXT,
      hourly_rate REAL,
      budget REAL,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Goals
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('focus_hours', 'tasks', 'breaks', 'custom')),
      target_value INTEGER,
      current_value INTEGER DEFAULT 0,
      period TEXT CHECK(period IN ('daily', 'weekly', 'monthly')),
      date TEXT
    );

    -- Settings
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Cache (to avoid repeated API calls)
    CREATE TABLE IF NOT EXISTS ai_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_hash TEXT UNIQUE,
      response TEXT,
      model TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
    CREATE INDEX IF NOT EXISTS idx_activities_app_name ON activities(app_name);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);
  `);
}

// Activity functions
export function logActivity(
    appName: string,
    windowTitle: string | null,
    url: string | null,
    category: string | null
): number {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO activities (app_name, window_title, url, category)
    VALUES (?, ?, ?, ?)
  `);
    const result = stmt.run(appName, windowTitle, url, category);
    return result.lastInsertRowid as number;
}

export function updateActivityDuration(id: number, seconds: number): void {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE activities SET duration_seconds = ? WHERE id = ?');
    stmt.run(seconds, id);
}

export function getTodayActivities(): Activity[] {
    const db = getDatabase();
    const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE date(created_at) = date('now', 'localtime')
    ORDER BY created_at DESC
  `);
    return stmt.all() as Activity[];
}

// Focus session functions
export function startFocusSession(type: 'focus' | 'break' | 'meeting', durationMinutes: number): number {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO focus_sessions (type, duration_minutes, started_at)
    VALUES (?, ?, datetime('now', 'localtime'))
  `);
    const result = stmt.run(type, durationMinutes);
    return result.lastInsertRowid as number;
}

export function endFocusSession(
    id: number,
    qualityScore: number,
    distractions: number,
    switches: number
): void {
    const db = getDatabase();
    const stmt = db.prepare(`
    UPDATE focus_sessions 
    SET ended_at = datetime('now', 'localtime'),
        quality_score = ?,
        distractions_count = ?,
        context_switches = ?
    WHERE id = ?
  `);
    stmt.run(qualityScore, distractions, switches, id);
}

export function getTodaySessions(): FocusSession[] {
    const db = getDatabase();
    const stmt = db.prepare(`
    SELECT * FROM focus_sessions 
    WHERE date(started_at) = date('now', 'localtime')
    ORDER BY started_at DESC
  `);
    return stmt.all() as FocusSession[];
}

// Task functions
export function createTask(task: Omit<Task, 'id' | 'created_at'>): number {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority, status, project_id, estimated_minutes, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    const result = stmt.run(
        task.title,
        task.description,
        task.priority,
        task.status,
        task.project_id,
        task.estimated_minutes,
        task.due_date
    );
    return result.lastInsertRowid as number;
}

export function updateTaskStatus(id: number, status: 'todo' | 'in_progress' | 'done'): void {
    const db = getDatabase();
    const completedAt = status === 'done' ? "datetime('now', 'localtime')" : 'NULL';
    const stmt = db.prepare(`
    UPDATE tasks 
    SET status = ?, completed_at = ${completedAt}
    WHERE id = ?
  `);
    stmt.run(status, id);
}

export function getTasks(status?: string): Task[] {
    const db = getDatabase();
    const query = status
        ? 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC'
        : 'SELECT * FROM tasks ORDER BY created_at DESC';
    const stmt = db.prepare(query);
    return (status ? stmt.all(status) : stmt.all()) as Task[];
}

// Types
export interface Activity {
    id: number;
    app_name: string;
    window_title: string | null;
    url: string | null;
    category: string | null;
    duration_seconds: number;
    is_distraction: number;
    screenshot_path: string | null;
    created_at: string;
}

export interface FocusSession {
    id: number;
    type: 'focus' | 'break' | 'meeting';
    duration_minutes: number;
    quality_score: number | null;
    distractions_count: number;
    context_switches: number;
    started_at: string;
    ended_at: string | null;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in_progress' | 'done';
    project_id: number | null;
    estimated_minutes: number | null;
    actual_minutes: number;
    due_date: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface Project {
    id: number;
    name: string;
    client_name: string | null;
    hourly_rate: number | null;
    budget: number | null;
    status: string;
    created_at: string;
}
