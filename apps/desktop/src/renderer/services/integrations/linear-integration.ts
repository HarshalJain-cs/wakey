// apps/desktop/src/renderer/services/integrations/linear-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface LinearIssue {
    id: string;
    identifier: string;
    title: string;
    description?: string;
    priority: number;
    priorityLabel: string;
    state: { id: string; name: string; type: string };
    assignee?: { id: string; name: string; email: string };
    project?: { id: string; name: string };
    cycle?: { id: string; name: string; number: number };
    dueDate?: string;
    estimate?: number;
    labels: { id: string; name: string; color: string }[];
    url: string;
    createdAt: string;
    updatedAt: string;
}

interface LinearCycle {
    id: string;
    name: string;
    number: number;
    startsAt: string;
    endsAt: string;
    progress: number;
}

export class LinearIntegration extends BaseIntegration {
    readonly id = 'linear';
    readonly name = 'Linear';
    readonly icon = '📐';
    readonly category = 'development' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_LINEAR_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_LINEAR_CLIENT_SECRET,
        redirectUri: 'wakey://auth/linear/callback',
        scope: 'read write',
        authUrl: 'https://linear.app/oauth/authorize',
        tokenUrl: 'https://api.linear.app/oauth/token'
    };

    private cachedIssues: LinearIssue[] = [];
    private cachedCycles: LinearCycle[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync your Linear issues, projects, and cycles',
            features: [
                'issue-sync',
                'project-tracking',
                'cycle-awareness',
                'priority-mapping',
                'estimate-sync',
                'two-way-sync'
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
            console.error('Linear connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.cachedIssues = [];
        this.cachedCycles = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch assigned issues
            const issues = await this.fetchAssignedIssues();
            this.cachedIssues = issues;

            // Fetch active cycles
            const cycles = await this.fetchActiveCycles();
            this.cachedCycles = cycles;

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

    private async graphqlQuery<T>(query: string, variables?: Record<string, any>): Promise<T> {
        const response = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`Linear API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(`Linear GraphQL error: ${data.errors[0].message}`);
        }

        return data.data;
    }

    private async fetchAssignedIssues(): Promise<LinearIssue[]> {
        const query = `
            query AssignedIssues {
                viewer {
                    assignedIssues(first: 100, filter: { state: { type: { nin: ["completed", "canceled"] } } }) {
                        nodes {
                            id
                            identifier
                            title
                            description
                            priority
                            priorityLabel
                            state { id name type }
                            assignee { id name email }
                            project { id name }
                            cycle { id name number }
                            dueDate
                            estimate
                            labels { nodes { id name color } }
                            url
                            createdAt
                            updatedAt
                        }
                    }
                }
            }
        `;

        const data = await this.graphqlQuery<{ viewer: { assignedIssues: { nodes: any[] } } }>(query);

        return data.viewer.assignedIssues.nodes.map((issue: any) => ({
            ...issue,
            labels: issue.labels?.nodes || []
        }));
    }

    private async fetchActiveCycles(): Promise<LinearCycle[]> {
        const query = `
            query ActiveCycles {
                cycles(first: 10, filter: { isActive: { eq: true } }) {
                    nodes {
                        id
                        name
                        number
                        startsAt
                        endsAt
                        progress
                    }
                }
            }
        `;

        const data = await this.graphqlQuery<{ cycles: { nodes: LinearCycle[] } }>(query);
        return data.cycles.nodes;
    }

    private async syncIssueAsTask(issue: LinearIssue): Promise<void> {
        // Convert Linear issue to Wakey task
        console.log('Syncing Linear issue as task:', issue.title);
    }

    async createIssue(title: string, projectId?: string, description?: string): Promise<LinearIssue> {
        await this.ensureValidToken(this.config);

        const query = `
            mutation CreateIssue($input: IssueCreateInput!) {
                issueCreate(input: $input) {
                    success
                    issue {
                        id
                        identifier
                        title
                        url
                    }
                }
            }
        `;

        const data = await this.graphqlQuery<{ issueCreate: { success: boolean; issue: LinearIssue } }>(query, {
            input: { title, description, projectId }
        });

        return data.issueCreate.issue;
    }

    async updateIssueState(issueId: string, stateId: string): Promise<void> {
        await this.ensureValidToken(this.config);

        const query = `
            mutation UpdateIssue($id: String!, $stateId: String!) {
                issueUpdate(id: $id, input: { stateId: $stateId }) {
                    success
                }
            }
        `;

        await this.graphqlQuery(query, { id: issueId, stateId });
    }

    getIssues(): LinearIssue[] {
        return this.cachedIssues;
    }

    getCycles(): LinearCycle[] {
        return this.cachedCycles;
    }
}

export const linearIntegration = new LinearIntegration();
