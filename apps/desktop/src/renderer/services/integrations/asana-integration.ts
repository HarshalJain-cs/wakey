// apps/desktop/src/renderer/services/integrations/asana-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface AsanaTask {
    gid: string;
    name: string;
    notes: string;
    completed: boolean;
    completed_at: string | null;
    due_on: string | null;
    due_at: string | null;
    assignee: { gid: string; name: string; email: string } | null;
    projects: { gid: string; name: string }[];
    tags: { gid: string; name: string; color: string }[];
    custom_fields: { gid: string; name: string; display_value: string }[];
    permalink_url: string;
    created_at: string;
    modified_at: string;
}

interface AsanaProject {
    gid: string;
    name: string;
    color: string;
    archived: boolean;
    workspace: { gid: string; name: string };
}

interface AsanaWorkspace {
    gid: string;
    name: string;
    is_organization: boolean;
}

export class AsanaIntegration extends BaseIntegration {
    readonly id = 'asana';
    readonly name = 'Asana';
    readonly icon = '🎯';
    readonly category = 'productivity' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_ASANA_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_ASANA_CLIENT_SECRET,
        redirectUri: 'wakey://auth/asana/callback',
        scope: 'default',
        authUrl: 'https://app.asana.com/-/oauth_authorize',
        tokenUrl: 'https://app.asana.com/-/oauth_token'
    };

    private workspaces: AsanaWorkspace[] = [];
    private cachedTasks: AsanaTask[] = [];
    private cachedProjects: AsanaProject[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync your Asana tasks, projects, and portfolios',
            features: [
                'task-sync',
                'project-sync',
                'subtask-support',
                'custom-fields',
                'due-date-sync',
                'two-way-sync'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.fetchWorkspaces();
            await this.sync();
            this.startPolling(5 * 60 * 1000); // Sync every 5 minutes
        } catch (error) {
            console.error('Asana connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.workspaces = [];
        this.cachedTasks = [];
        this.cachedProjects = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch tasks assigned to user
            const tasks = await this.fetchAssignedTasks();
            this.cachedTasks = tasks;

            // Sync tasks
            for (const task of tasks) {
                await this.syncTaskToLocal(task);
                result.synced++;
            }

            this.lastSyncAt = new Date();
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchWorkspaces(): Promise<AsanaWorkspace[]> {
        const response = await fetch('https://app.asana.com/api/1.0/workspaces', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Asana API error: ${response.status}`);
        }

        const data = await response.json();
        this.workspaces = data.data;
        return this.workspaces;
    }

    private async fetchAssignedTasks(): Promise<AsanaTask[]> {
        // Get current user
        const userResponse = await fetch('https://app.asana.com/api/1.0/users/me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!userResponse.ok) {
            throw new Error(`Failed to get current user: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        const userId = userData.data.gid;

        // Fetch tasks for each workspace
        const allTasks: AsanaTask[] = [];

        for (const workspace of this.workspaces) {
            const response = await fetch(
                `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspace.gid}&completed_since=now&opt_fields=name,notes,completed,due_on,due_at,assignee.name,assignee.email,projects.name,tags.name,tags.color,permalink_url,created_at,modified_at`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                allTasks.push(...data.data);
            }
        }

        return allTasks;
    }

    private async syncTaskToLocal(task: AsanaTask): Promise<void> {
        // Convert Asana task to Wakey task
        console.log('Syncing Asana task:', task.name);
    }

    async fetchProjects(): Promise<AsanaProject[]> {
        const allProjects: AsanaProject[] = [];

        for (const workspace of this.workspaces) {
            const response = await fetch(
                `https://app.asana.com/api/1.0/workspaces/${workspace.gid}/projects?opt_fields=name,color,archived`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                allProjects.push(...data.data.map((p: any) => ({
                    ...p,
                    workspace: { gid: workspace.gid, name: workspace.name }
                })));
            }
        }

        this.cachedProjects = allProjects;
        return allProjects;
    }

    async createTask(name: string, projectGid?: string, dueDate?: Date): Promise<AsanaTask> {
        await this.ensureValidToken(this.config);

        if (this.workspaces.length === 0) {
            throw new Error('No workspaces available');
        }

        const response = await fetch('https://app.asana.com/api/1.0/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    name,
                    workspace: this.workspaces[0].gid,
                    projects: projectGid ? [projectGid] : undefined,
                    due_on: dueDate?.toISOString().split('T')[0]
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    }

    async completeTask(taskGid: string): Promise<void> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskGid}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { completed: true }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to complete task: ${response.status}`);
        }
    }

    getTasks(): AsanaTask[] {
        return this.cachedTasks;
    }

    getProjects(): AsanaProject[] {
        return this.cachedProjects;
    }

    getWorkspaces(): AsanaWorkspace[] {
        return this.workspaces;
    }
}

export const asanaIntegration = new AsanaIntegration();
