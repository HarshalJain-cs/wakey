// apps/desktop/src/renderer/services/integrations/notion-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface NotionPage {
    id: string;
    object: 'page';
    parent: { type: string; database_id?: string; page_id?: string };
    properties: Record<string, any>;
    url: string;
    created_time: string;
    last_edited_time: string;
}

interface NotionDatabase {
    id: string;
    object: 'database';
    title: { text: { content: string } }[];
    properties: Record<string, any>;
}

interface NotionSearchResult {
    object: 'list';
    results: (NotionPage | NotionDatabase)[];
    next_cursor: string | null;
}

export class NotionIntegration extends BaseIntegration {
    readonly id = 'notion';
    readonly name = 'Notion';
    readonly icon = '📝';
    readonly category = 'notes' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_NOTION_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_NOTION_CLIENT_SECRET,
        redirectUri: 'wakey://auth/notion/callback',
        scope: '',
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token'
    };

    private workspaceId?: string;
    private cachedDatabases: NotionDatabase[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Connect your Notion workspace to sync databases and pages',
            features: [
                'database-sync',
                'page-sync',
                'task-database-mapping',
                'block-content',
                'real-time-updates',
                'two-way-sync'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);

            // Get workspace info
            const workspaceInfo = await this.getWorkspaceInfo();
            this.workspaceId = workspaceInfo.workspace_id;

            await this.sync();
            this.startPolling(10 * 60 * 1000); // Sync every 10 minutes
        } catch (error) {
            console.error('Notion connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.workspaceId = undefined;
        this.cachedDatabases = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Search for all databases
            const databases = await this.searchDatabases();
            this.cachedDatabases = databases;

            // Find task-like databases
            const taskDatabases = databases.filter(db => this.isTaskDatabase(db));

            for (const db of taskDatabases) {
                const pages = await this.queryDatabase(db.id);

                for (const page of pages) {
                    const synced = await this.syncPageAsTask(page, db);
                    if (synced) result.synced++;
                }
            }

            this.lastSyncAt = new Date();
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async getWorkspaceInfo(): Promise<{ workspace_id: string; workspace_name: string }> {
        const response = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Notion-Version': '2022-06-28'
            }
        });

        if (!response.ok) {
            throw new Error(`Notion API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            workspace_id: data.bot?.workspace_name || 'default',
            workspace_name: data.bot?.workspace_name || 'Notion Workspace'
        };
    }

    private async searchDatabases(): Promise<NotionDatabase[]> {
        const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                filter: { property: 'object', value: 'database' }
            })
        });

        if (!response.ok) {
            throw new Error(`Notion search failed: ${response.status}`);
        }

        const data: NotionSearchResult = await response.json();
        return data.results as NotionDatabase[];
    }

    private async queryDatabase(databaseId: string): Promise<NotionPage[]> {
        const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`Database query failed: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    }

    private isTaskDatabase(db: NotionDatabase): boolean {
        const props = db.properties;
        // Check if database has task-like properties
        const hasStatus = Object.values(props).some((p: any) =>
            p.type === 'status' || p.type === 'checkbox' || p.name?.toLowerCase().includes('status')
        );
        const hasDueDate = Object.values(props).some((p: any) =>
            p.type === 'date' || p.name?.toLowerCase().includes('due')
        );
        return hasStatus || hasDueDate;
    }

    private async syncPageAsTask(page: NotionPage, _db: NotionDatabase): Promise<boolean> {
        // Convert Notion page to Wakey task
        console.log('Syncing Notion page as task:', page.id);
        return true;
    }

    async createPage(databaseId: string, properties: Record<string, any>): Promise<NotionPage> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create page: ${response.status}`);
        }

        return response.json();
    }

    async updatePage(pageId: string, properties: Record<string, any>): Promise<NotionPage> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({ properties })
        });

        if (!response.ok) {
            throw new Error(`Failed to update page: ${response.status}`);
        }

        return response.json();
    }

    getDatabases(): NotionDatabase[] {
        return this.cachedDatabases;
    }

    getWorkspaceId(): string | undefined {
        return this.workspaceId;
    }
}

export const notionIntegration = new NotionIntegration();
