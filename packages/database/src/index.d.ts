import Database from 'better-sqlite3';
export declare function getDatabase(): Database.Database;
export declare function logActivity(appName: string, windowTitle: string | null, url: string | null, category: string | null): number;
export declare function updateActivityDuration(id: number, seconds: number): void;
export declare function getTodayActivities(): Activity[];
export declare function startFocusSession(type: 'focus' | 'break' | 'meeting', durationMinutes: number): number;
export declare function endFocusSession(id: number, qualityScore: number, distractions: number, switches: number): void;
export declare function getTodaySessions(): FocusSession[];
export declare function createTask(task: Omit<Task, 'id' | 'created_at'>): number;
export declare function updateTaskStatus(id: number, status: 'todo' | 'in_progress' | 'done'): void;
export declare function getTasks(status?: string): Task[];
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
//# sourceMappingURL=index.d.ts.map