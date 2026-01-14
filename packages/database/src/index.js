import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
let db = null;
export function getDatabase() {
    if (db)
        return db;
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
function initializeSchema(db) {
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
export function logActivity(appName, windowTitle, url, category) {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO activities (app_name, window_title, url, category)
    VALUES (?, ?, ?, ?)
  `);
    const result = stmt.run(appName, windowTitle, url, category);
    return result.lastInsertRowid;
}
export function updateActivityDuration(id, seconds) {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE activities SET duration_seconds = ? WHERE id = ?');
    stmt.run(seconds, id);
}
export function getTodayActivities() {
    const db = getDatabase();
    const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE date(created_at) = date('now', 'localtime')
    ORDER BY created_at DESC
  `);
    return stmt.all();
}
// Focus session functions
export function startFocusSession(type, durationMinutes) {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO focus_sessions (type, duration_minutes, started_at)
    VALUES (?, ?, datetime('now', 'localtime'))
  `);
    const result = stmt.run(type, durationMinutes);
    return result.lastInsertRowid;
}
export function endFocusSession(id, qualityScore, distractions, switches) {
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
export function getTodaySessions() {
    const db = getDatabase();
    const stmt = db.prepare(`
    SELECT * FROM focus_sessions 
    WHERE date(started_at) = date('now', 'localtime')
    ORDER BY started_at DESC
  `);
    return stmt.all();
}
// Task functions
export function createTask(task) {
    const db = getDatabase();
    const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority, status, project_id, estimated_minutes, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    const result = stmt.run(task.title, task.description, task.priority, task.status, task.project_id, task.estimated_minutes, task.due_date);
    return result.lastInsertRowid;
}
export function updateTaskStatus(id, status) {
    const db = getDatabase();
    const completedAt = status === 'done' ? "datetime('now', 'localtime')" : 'NULL';
    const stmt = db.prepare(`
    UPDATE tasks 
    SET status = ?, completed_at = ${completedAt}
    WHERE id = ?
  `);
    stmt.run(status, id);
}
export function getTasks(status) {
    const db = getDatabase();
    const query = status
        ? 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC'
        : 'SELECT * FROM tasks ORDER BY created_at DESC';
    const stmt = db.prepare(query);
    return (status ? stmt.all(status) : stmt.all());
}
//# sourceMappingURL=index.js.map