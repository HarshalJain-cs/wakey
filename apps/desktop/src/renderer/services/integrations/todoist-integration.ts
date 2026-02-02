// apps/desktop/src/renderer/services/integrations/todoist-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface TodoistTask {
    id: string;
    content: string;
    description: string;
    project_id: string;
    priority: number;
    due?: { date: string; datetime?: string };
    labels: string[];
    completed: boolean;
}

interface TodoistProject {
    id: string;
    name: string;
    color: string;
    parent_id?: string;
}

export class TodoistIntegration extends BaseIntegration {
    readonly id = 'todoist';
    readonly name = 'Todoist';
    readonly icon = '✅';
    readonly category = 'productivity' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_TODOIST_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_TODOIST_CLIENT_SECRET,
        redirectUri: 'wakey://auth/todoist/callback',
        scope: 'data:read_write',
        authUrl: 'https://todoist.com/oauth/authorize',
        tokenUrl: 'https://todoist.com/oauth/access_token'
    };

    private cachedTasks: TodoistTask[] = [];
    private cachedProjects: TodoistProject[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync your Todoist tasks and projects with Wakey',
            features: [
                'two-way-task-sync',
                'project-sync',
                'priority-mapping',
                'due-date-sync',
                'label-sync',
                'real-time-updates'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.sync();
            this.startPolling(5 * 60 * 1000); // Sync every 5 minutes
        } catch (error) {
            console.error('Todoist connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.cachedTasks = [];
        this.cachedProjects = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch tasks from Todoist
            const tasks = await this.fetchTasks();
            const projects = await this.fetchProjects();

            // Compare with local data
            const { toCreate, toUpdate, toDelete } = await this.diffWithLocal(tasks);

            // Sync tasks to Wakey
            for (const task of toCreate) {
                await this.createLocalTask(task);
                result.created++;
            }

            for (const task of toUpdate) {
                await this.updateLocalTask(task);
                result.updated++;
            }

            for (const taskId of toDelete) {
                await this.deleteLocalTask(taskId);
                result.deleted++;
            }

            // Push local changes to Todoist
            const localChanges = await this.getLocalChanges();
            for (const change of localChanges) {
                await this.pushToTodoist(change);
            }

            this.cachedTasks = tasks;
            this.cachedProjects = projects;
            this.lastSyncAt = new Date();
            result.synced = tasks.length;

        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchTasks(): Promise<TodoistTask[]> {
        const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Todoist API error: ${response.status}`);
        }

        return response.json();
    }

    private async fetchProjects(): Promise<TodoistProject[]> {
        const response = await fetch('https://api.todoist.com/rest/v2/projects', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Todoist API error: ${response.status}`);
        }

        return response.json();
    }

    private async diffWithLocal(_tasks: TodoistTask[]): Promise<{
        toCreate: TodoistTask[];
        toUpdate: TodoistTask[];
        toDelete: string[];
    }> {
        // Would compare with local database
        return { toCreate: [], toUpdate: [], toDelete: [] };
    }

    private async createLocalTask(task: TodoistTask): Promise<void> {
        // Create task in local database
        console.log('Creating local task from Todoist:', task.content);
    }

    private async updateLocalTask(task: TodoistTask): Promise<void> {
        // Update task in local database
        console.log('Updating local task from Todoist:', task.content);
    }

    private async deleteLocalTask(taskId: string): Promise<void> {
        // Delete task from local database
        console.log('Deleting local task:', taskId);
    }

    private async getLocalChanges(): Promise<any[]> {
        // Get changes made locally that need to be synced
        return [];
    }

    private async pushToTodoist(change: any): Promise<void> {
        // Push local changes to Todoist
        console.log('Pushing change to Todoist:', change);
    }

    async createTask(content: string, projectId?: string, dueDate?: Date): Promise<TodoistTask> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                project_id: projectId,
                due_date: dueDate?.toISOString().split('T')[0]
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.status}`);
        }

        return response.json();
    }

    async completeTask(taskId: string): Promise<void> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${taskId}/close`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to complete task: ${response.status}`);
        }
    }

    getTasks(): TodoistTask[] {
        return this.cachedTasks;
    }

    getProjects(): TodoistProject[] {
        return this.cachedProjects;
    }
}

export const todoistIntegration = new TodoistIntegration();
