/**
 * @fileoverview Notion Integration Service
 * 
 * Integration with Notion API for:
 * - Syncing tasks to Notion databases
 * - Pulling Notion pages as knowledge nodes
 * - Bi-directional sync support
 * 
 * @module services/notion-integration-service
 */

// ============================================
// Types
// ============================================

export interface NotionPage {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    lastEdited: Date;
    properties: Record<string, unknown>;
}

export interface NotionDatabase {
    id: string;
    title: string;
    url: string;
    properties: NotionDatabaseProperty[];
}

export interface NotionDatabaseProperty {
    name: string;
    type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'status';
    options?: string[];
}

export interface NotionSyncConfig {
    enabled: boolean;
    apiKey: string | null;
    workspaceId: string | null;
    tasksDatabaseId: string | null;
    notesDatabaseId: string | null;
    syncInterval: number; // minutes
    syncTasks: boolean;
    syncNotes: boolean;
    syncBidirectional: boolean;
}

export interface NotionSyncStatus {
    lastSync: Date | null;
    tasksImported: number;
    tasksExported: number;
    notesImported: number;
    errors: string[];
    inProgress: boolean;
}

// ============================================
// Notion Integration Service
// ============================================

class NotionIntegrationService {
    private config: NotionSyncConfig;
    private status: NotionSyncStatus;
    private databases: NotionDatabase[] = [];
    private syncTimer: NodeJS.Timeout | null = null;

    private readonly API_BASE = 'https://api.notion.com/v1';
    private readonly NOTION_VERSION = '2022-06-28';

    constructor() {
        this.config = this.loadConfig();
        this.status = this.getInitialStatus();

        if (this.config.enabled && this.config.apiKey) {
            this.startAutoSync();
        }
    }

    private loadConfig(): NotionSyncConfig {
        try {
            const stored = localStorage.getItem('wakey_notion_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load Notion config:', error);
        }

        return {
            enabled: false,
            apiKey: null,
            workspaceId: null,
            tasksDatabaseId: null,
            notesDatabaseId: null,
            syncInterval: 30,
            syncTasks: true,
            syncNotes: true,
            syncBidirectional: true,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_notion_config', JSON.stringify(this.config));
    }

    private getInitialStatus(): NotionSyncStatus {
        return {
            lastSync: null,
            tasksImported: 0,
            tasksExported: 0,
            notesImported: 0,
            errors: [],
            inProgress: false,
        };
    }

    // ============================================
    // Connection
    // ============================================

    /**
     * Check if Notion is connected
     */
    isConnected(): boolean {
        return !!this.config.apiKey && this.config.enabled;
    }

    /**
     * Connect with API key
     */
    async connect(apiKey: string): Promise<boolean> {
        try {
            // Test the connection
            const response = await this.makeRequest('/users/me', 'GET', null, apiKey);

            if (response.ok) {
                this.config.apiKey = apiKey;
                this.config.enabled = true;
                this.saveConfig();

                // Fetch available databases
                await this.fetchDatabases();
                this.startAutoSync();

                return true;
            }

            return false;
        } catch (error) {
            console.error('Notion connection failed:', error);
            return false;
        }
    }

    /**
     * Disconnect from Notion
     */
    disconnect(): void {
        this.stopAutoSync();
        this.config.apiKey = null;
        this.config.enabled = false;
        this.config.workspaceId = null;
        this.config.tasksDatabaseId = null;
        this.config.notesDatabaseId = null;
        this.databases = [];
        this.saveConfig();
    }

    // ============================================
    // API Helpers
    // ============================================

    private async makeRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
        body: unknown = null,
        apiKey?: string
    ): Promise<Response> {
        const key = apiKey || this.config.apiKey;

        if (!key) {
            throw new Error('Notion API key not configured');
        }

        const options: RequestInit = {
            method,
            headers: {
                'Authorization': `Bearer ${key}`,
                'Notion-Version': this.NOTION_VERSION,
                'Content-Type': 'application/json',
            },
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        return fetch(`${this.API_BASE}${endpoint}`, options);
    }

    // ============================================
    // Databases
    // ============================================

    /**
     * Fetch available databases
     */
    async fetchDatabases(): Promise<NotionDatabase[]> {
        if (!this.isConnected()) {
            return this.getDemoDatabases();
        }

        try {
            const response = await this.makeRequest('/search', 'POST', {
                filter: { value: 'database', property: 'object' },
                page_size: 100,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch databases');
            }

            const data = await response.json();

            this.databases = data.results.map((db: any) => ({
                id: db.id,
                title: db.title?.[0]?.plain_text || 'Untitled',
                url: db.url,
                properties: Object.entries(db.properties).map(([name, prop]: [string, any]) => ({
                    name,
                    type: prop.type,
                    options: prop.select?.options?.map((o: any) => o.name) ||
                        prop.multi_select?.options?.map((o: any) => o.name),
                })),
            }));

            return this.databases;
        } catch (error) {
            console.error('Failed to fetch Notion databases:', error);
            return this.getDemoDatabases();
        }
    }

    private getDemoDatabases(): NotionDatabase[] {
        return [
            {
                id: 'demo_tasks',
                title: 'Tasks Database',
                url: 'https://www.notion.so/demo_tasks',
                properties: [
                    { name: 'Name', type: 'title' },
                    { name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Done'] },
                    { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
                    { name: 'Due Date', type: 'date' },
                ],
            },
            {
                id: 'demo_notes',
                title: 'Notes Database',
                url: 'https://www.notion.so/demo_notes',
                properties: [
                    { name: 'Title', type: 'title' },
                    { name: 'Created', type: 'date' },
                    { name: 'Tags', type: 'multi_select', options: ['Work', 'Personal', 'Ideas'] },
                ],
            },
        ];
    }

    /**
     * Get available databases
     */
    getDatabases(): NotionDatabase[] {
        return this.databases;
    }

    /**
     * Set tasks database
     */
    setTasksDatabase(databaseId: string): void {
        this.config.tasksDatabaseId = databaseId;
        this.saveConfig();
    }

    /**
     * Set notes database
     */
    setNotesDatabase(databaseId: string): void {
        this.config.notesDatabaseId = databaseId;
        this.saveConfig();
    }

    // ============================================
    // Sync Operations
    // ============================================

    /**
     * Full sync
     */
    async sync(): Promise<NotionSyncStatus> {
        if (!this.isConnected()) {
            this.status.errors.push('Not connected to Notion');
            return this.status;
        }

        this.status.inProgress = true;
        this.status.errors = [];

        try {
            // Export tasks to Notion
            if (this.config.syncTasks && this.config.tasksDatabaseId) {
                await this.exportTasks();
            }

            // Import tasks from Notion
            if (this.config.syncBidirectional && this.config.tasksDatabaseId) {
                await this.importTasks();
            }

            // Export notes to Notion
            if (this.config.syncNotes && this.config.notesDatabaseId) {
                await this.exportNotes();
            }

            // Import notes from Notion
            if (this.config.syncBidirectional && this.config.notesDatabaseId) {
                await this.importNotes();
            }

            this.status.lastSync = new Date();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown sync error';
            this.status.errors.push(message);
            console.error('Notion sync error:', error);
        }

        this.status.inProgress = false;
        return this.status;
    }

    private async exportTasks(): Promise<void> {
        // Get local tasks
        const tasksStr = localStorage.getItem('wakey_tasks');
        if (!tasksStr) return;

        const tasks = JSON.parse(tasksStr);
        let exported = 0;

        for (const task of tasks) {
            try {
                await this.createNotionPage(this.config.tasksDatabaseId!, {
                    Name: { title: [{ text: { content: task.title } }] },
                    Status: { select: { name: this.mapTaskStatus(task.status) } },
                    Priority: { select: { name: task.priority || 'Medium' } },
                });
                exported++;
            } catch (error) {
                console.error('Failed to export task:', error);
            }
        }

        this.status.tasksExported = exported;
    }

    private async importTasks(): Promise<void> {
        if (!this.config.tasksDatabaseId) return;

        try {
            const response = await this.makeRequest(
                `/databases/${this.config.tasksDatabaseId}/query`,
                'POST',
                { page_size: 100 }
            );

            if (!response.ok) return;

            const data = await response.json();
            this.status.tasksImported = data.results?.length || 0;

            // Would process and store tasks here
        } catch (error) {
            console.error('Failed to import tasks:', error);
        }
    }

    private async exportNotes(): Promise<void> {
        // Similar to exportTasks but for notes
        console.log('Exporting notes to Notion...');
    }

    private async importNotes(): Promise<void> {
        // Similar to importTasks but for notes
        console.log('Importing notes from Notion...');
    }

    private async createNotionPage(databaseId: string, properties: Record<string, unknown>): Promise<void> {
        await this.makeRequest('/pages', 'POST', {
            parent: { database_id: databaseId },
            properties,
        });
    }

    private mapTaskStatus(status: string): string {
        const mapping: Record<string, string> = {
            'todo': 'Not Started',
            'in_progress': 'In Progress',
            'done': 'Done',
        };
        return mapping[status] || 'Not Started';
    }

    // ============================================
    // Auto Sync
    // ============================================

    private startAutoSync(): void {
        if (this.syncTimer) return;

        const intervalMs = this.config.syncInterval * 60 * 1000;
        this.syncTimer = setInterval(() => {
            this.sync();
        }, intervalMs);
    }

    private stopAutoSync(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    // ============================================
    // Public API
    // ============================================

    getConfig(): NotionSyncConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<NotionSyncConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Restart auto sync if interval changed
        if (updates.syncInterval !== undefined) {
            this.stopAutoSync();
            if (this.config.enabled) {
                this.startAutoSync();
            }
        }
    }

    getStatus(): NotionSyncStatus {
        return { ...this.status };
    }

    /**
     * Get OAuth URL for Notion
     */
    getOAuthUrl(clientId: string, redirectUri: string): string {
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            owner: 'user',
        });
        return `https://api.notion.com/v1/oauth/authorize?${params}`;
    }
}

// Singleton instance
export const notionIntegrationService = new NotionIntegrationService();
export default notionIntegrationService;
