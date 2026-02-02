// apps/desktop/src/renderer/services/integrations/jira-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface JiraIssue {
    id: string;
    key: string;
    fields: {
        summary: string;
        description: string | null;
        status: { id: string; name: string; statusCategory: { key: string } };
        priority: { id: string; name: string; iconUrl: string };
        assignee: { accountId: string; displayName: string; emailAddress: string } | null;
        reporter: { accountId: string; displayName: string };
        issuetype: { id: string; name: string; iconUrl: string };
        project: { id: string; key: string; name: string };
        duedate: string | null;
        labels: string[];
        created: string;
        updated: string;
    };
}

interface JiraProject {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
}

export class JiraIntegration extends BaseIntegration {
    readonly id = 'jira';
    readonly name = 'Jira';
    readonly icon = '🔷';
    readonly category = 'development' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_JIRA_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_JIRA_CLIENT_SECRET,
        redirectUri: 'wakey://auth/jira/callback',
        scope: 'read:jira-work read:jira-user write:jira-work offline_access',
        authUrl: 'https://auth.atlassian.com/authorize',
        tokenUrl: 'https://auth.atlassian.com/oauth/token'
    };

    private cloudId?: string;
    private baseUrl?: string;
    private cachedIssues: JiraIssue[] = [];
    private cachedProjects: JiraProject[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync your Jira issues, sprints, and boards',
            features: [
                'issue-sync',
                'sprint-tracking',
                'board-awareness',
                'status-mapping',
                'priority-sync',
                'two-way-sync'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);

            // Get accessible resources (cloud ID)
            await this.fetchCloudId();

            await this.sync();
            this.startPolling(5 * 60 * 1000); // Sync every 5 minutes
        } catch (error) {
            console.error('Jira connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.cloudId = undefined;
        this.baseUrl = undefined;
        this.cachedIssues = [];
        this.cachedProjects = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch assigned issues
            const issues = await this.fetchAssignedIssues();
            this.cachedIssues = issues;

            // Sync issues as tasks
            for (const issue of issues) {
                await this.syncIssueAsTask(issue);
                result.synced++;
            }

            this.lastSyncAt = new Date();
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchCloudId(): Promise<void> {
        const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get Jira cloud ID: ${response.status}`);
        }

        const resources = await response.json();
        if (resources.length === 0) {
            throw new Error('No accessible Jira sites found');
        }

        this.cloudId = resources[0].id;
        this.baseUrl = `https://api.atlassian.com/ex/jira/${this.cloudId}`;
    }

    private async fetchAssignedIssues(): Promise<JiraIssue[]> {
        if (!this.baseUrl) {
            throw new Error('Jira not properly connected');
        }

        const jql = 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC';
        const response = await fetch(
            `${this.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Jira API error: ${response.status}`);
        }

        const data = await response.json();
        return data.issues;
    }

    async fetchProjects(): Promise<JiraProject[]> {
        if (!this.baseUrl) {
            throw new Error('Jira not properly connected');
        }

        const response = await fetch(`${this.baseUrl}/rest/api/3/project`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Jira API error: ${response.status}`);
        }

        this.cachedProjects = await response.json();
        return this.cachedProjects;
    }

    private async syncIssueAsTask(issue: JiraIssue): Promise<void> {
        // Convert Jira issue to Wakey task
        console.log('Syncing Jira issue as task:', issue.fields.summary);
    }

    async createIssue(projectKey: string, summary: string, issueType: string = 'Task'): Promise<JiraIssue> {
        await this.ensureValidToken(this.config);

        if (!this.baseUrl) {
            throw new Error('Jira not properly connected');
        }

        const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    project: { key: projectKey },
                    summary,
                    issuetype: { name: issueType }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create issue: ${response.status}`);
        }

        return response.json();
    }

    async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
        await this.ensureValidToken(this.config);

        if (!this.baseUrl) {
            throw new Error('Jira not properly connected');
        }

        const response = await fetch(`${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transition: { id: transitionId }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to transition issue: ${response.status}`);
        }
    }

    async getTransitions(issueKey: string): Promise<{ id: string; name: string }[]> {
        await this.ensureValidToken(this.config);

        if (!this.baseUrl) {
            throw new Error('Jira not properly connected');
        }

        const response = await fetch(`${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get transitions: ${response.status}`);
        }

        const data = await response.json();
        return data.transitions;
    }

    getIssues(): JiraIssue[] {
        return this.cachedIssues;
    }

    getProjects(): JiraProject[] {
        return this.cachedProjects;
    }
}

export const jiraIntegration = new JiraIntegration();
