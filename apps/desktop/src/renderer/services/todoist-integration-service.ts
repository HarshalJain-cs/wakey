/**
 * @fileoverview Todoist Integration Service
 * 
 * Integration with Todoist for:
 * - Syncing tasks bidirectionally
 * - Marking tasks complete during focus
 * - Importing project structure
 * 
 * @module services/todoist-integration-service
 */

// ============================================
// Types
// ============================================

export interface TodoistConfig {
    enabled: boolean;
    apiToken: string | null;
    syncTasks: boolean;
    autoComplete: boolean;
    defaultProjectId: string | null;
    lastSync: Date | null;
}

export interface TodoistTask {
    id: string;
    content: string;
    description: string;
    project_id: string;
    priority: number;
    due: { date: string; is_recurring: boolean } | null;
    completed: boolean;
    created_at: string;
}

export interface TodoistProject {
    id: string;
    name: string;
    color: string;
    is_favorite: boolean;
}

// ============================================
// Todoist Integration Service
// ============================================

class TodoistIntegrationService {
    private config: TodoistConfig;
    private projects: TodoistProject[] = [];
    private readonly API_BASE = 'https://api.todoist.com/rest/v2';

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): TodoistConfig {
        try {
            const saved = localStorage.getItem('wakey_todoist_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
                };
            }
        } catch {
            console.error('Failed to load Todoist config');
        }
        return {
            enabled: false,
            apiToken: null,
            syncTasks: true,
            autoComplete: false,
            defaultProjectId: null,
            lastSync: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_todoist_config', JSON.stringify(this.config));
    }

    // Check if connected
    isConnected(): boolean {
        return this.config.enabled && !!this.config.apiToken;
    }

    // Connect with API token
    async connect(apiToken: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.API_BASE}/projects`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (response.ok) {
                this.projects = await response.json();
                this.config = {
                    ...this.config,
                    enabled: true,
                    apiToken,
                    defaultProjectId: this.projects[0]?.id || null,
                    lastSync: new Date(),
                };
                this.saveConfig();
                return { success: true };
            } else {
                return { success: false, error: 'Invalid API token' };
            }
        } catch (error) {
            console.error('Todoist connection error:', error);
            return { success: false, error: 'Failed to connect to Todoist' };
        }
    }

    // Disconnect
    disconnect(): void {
        this.config = {
            enabled: false,
            apiToken: null,
            syncTasks: true,
            autoComplete: false,
            defaultProjectId: null,
            lastSync: null,
        };
        this.projects = [];
        this.saveConfig();
    }

    // Fetch projects
    async getProjects(): Promise<TodoistProject[]> {
        if (!this.isConnected()) return [];

        try {
            const response = await fetch(`${this.API_BASE}/projects`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                },
            });

            if (response.ok) {
                this.projects = await response.json();
                return this.projects;
            }
        } catch (error) {
            console.error('Failed to fetch Todoist projects:', error);
        }

        return this.projects;
    }

    // Fetch tasks
    async getTasks(projectId?: string): Promise<TodoistTask[]> {
        if (!this.isConnected()) return [];

        try {
            let url = `${this.API_BASE}/tasks`;
            if (projectId) {
                url += `?project_id=${projectId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                },
            });

            if (response.ok) {
                const tasks = await response.json();
                this.config.lastSync = new Date();
                this.saveConfig();
                return tasks;
            }
        } catch (error) {
            console.error('Failed to fetch Todoist tasks:', error);
        }

        return [];
    }

    // Get today's tasks
    async getTodayTasks(): Promise<TodoistTask[]> {
        if (!this.isConnected()) return [];

        try {
            const response = await fetch(`${this.API_BASE}/tasks?filter=today`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                },
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch today tasks:', error);
        }

        return [];
    }

    // Create a task
    async createTask(content: string, options?: {
        description?: string;
        projectId?: string;
        dueDate?: string;
        priority?: 1 | 2 | 3 | 4;
    }): Promise<TodoistTask | null> {
        if (!this.isConnected()) return null;

        try {
            const response = await fetch(`${this.API_BASE}/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    description: options?.description,
                    project_id: options?.projectId || this.config.defaultProjectId,
                    due_string: options?.dueDate,
                    priority: options?.priority,
                }),
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to create Todoist task:', error);
        }

        return null;
    }

    // Complete a task
    async completeTask(taskId: string): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch(`${this.API_BASE}/tasks/${taskId}/close`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to complete Todoist task:', error);
            return false;
        }
    }

    // Update a task
    async updateTask(taskId: string, updates: {
        content?: string;
        description?: string;
        priority?: 1 | 2 | 3 | 4;
        dueString?: string;
    }): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch(`${this.API_BASE}/tasks/${taskId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: updates.content,
                    description: updates.description,
                    priority: updates.priority,
                    due_string: updates.dueString,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to update Todoist task:', error);
            return false;
        }
    }

    // Sync tasks from Wakey to Todoist
    async exportWakeyTasks(tasks: Array<{
        title: string;
        description?: string;
        dueDate?: string;
    }>): Promise<number> {
        let exported = 0;

        for (const task of tasks) {
            const result = await this.createTask(task.title, {
                description: task.description,
                dueDate: task.dueDate,
            });
            if (result) exported++;
        }

        return exported;
    }

    // Getters and setters
    getConfig(): TodoistConfig {
        return { ...this.config };
    }

    getCachedProjects(): TodoistProject[] {
        return [...this.projects];
    }

    updateConfig(updates: Partial<TodoistConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
}

export const todoistService = new TodoistIntegrationService();
