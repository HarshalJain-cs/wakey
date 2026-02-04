// apps/desktop/src/renderer/services/integrations/index.ts
// Barrel file for all integrations

// Base class and types
export {
    BaseIntegration,
    type IntegrationConfig,
    type SyncResult,
    type OAuthTokens,
    type IntegrationCategory,
    type IntegrationMetadata
} from './base-integration';

// Productivity integrations
export { todoistIntegration, TodoistIntegration } from './todoist-integration';
export { notionIntegration, NotionIntegration } from './notion-integration';
export { asanaIntegration, AsanaIntegration } from './asana-integration';

// Calendar integrations
export { googleCalendarIntegration, GoogleCalendarIntegration } from './google-calendar-integration';

// Communication integrations
export { slackIntegration, SlackIntegration } from './slack-integration';
export { microsoftTeamsIntegration, MicrosoftTeamsIntegration } from './microsoft-teams-integration';
export { discordIntegration, DiscordIntegration } from './discord-integration';

// Development integrations
export { githubIntegration, GitHubIntegration } from './github-integration';
export { linearIntegration, LinearIntegration } from './linear-integration';
export { jiraIntegration, JiraIntegration } from './jira-integration';

// Automation integrations
export { zapierIntegration, ZapierIntegration } from './zapier-integration';
export { makeIntegration, MakeIntegration } from './make-integration';
export { iftttIntegration, IFTTTIntegration } from './ifttt-integration';

// Integration registry
import { BaseIntegration } from './base-integration';
import { todoistIntegration } from './todoist-integration';
import { notionIntegration } from './notion-integration';
import { asanaIntegration } from './asana-integration';
import { googleCalendarIntegration } from './google-calendar-integration';
import { slackIntegration } from './slack-integration';
import { microsoftTeamsIntegration } from './microsoft-teams-integration';
import { discordIntegration } from './discord-integration';
import { githubIntegration } from './github-integration';
import { linearIntegration } from './linear-integration';
import { jiraIntegration } from './jira-integration';
import { zapierIntegration } from './zapier-integration';
import { makeIntegration } from './make-integration';
import { iftttIntegration } from './ifttt-integration';

// All available integrations
export const integrations: BaseIntegration[] = [
    todoistIntegration,
    notionIntegration,
    asanaIntegration,
    googleCalendarIntegration,
    slackIntegration,
    microsoftTeamsIntegration,
    discordIntegration,
    githubIntegration,
    linearIntegration,
    jiraIntegration,
    zapierIntegration,
    makeIntegration,
    iftttIntegration
];

// Integration manager service
export class IntegrationManager {
    private static instance: IntegrationManager;

    private constructor() { }

    static getInstance(): IntegrationManager {
        if (!IntegrationManager.instance) {
            IntegrationManager.instance = new IntegrationManager();
        }
        return IntegrationManager.instance;
    }

    getAllIntegrations(): BaseIntegration[] {
        return integrations;
    }

    getIntegrationById(id: string): BaseIntegration | undefined {
        return integrations.find(i => i.id === id);
    }

    getIntegrationsByCategory(category: string): BaseIntegration[] {
        return integrations.filter(i => i.category === category);
    }

    getConnectedIntegrations(): BaseIntegration[] {
        return integrations.filter(i => i.getConnectionStatus().connected);
    }

    async connectIntegration(id: string): Promise<void> {
        const integration = this.getIntegrationById(id);
        if (!integration) {
            throw new Error(`Integration ${id} not found`);
        }
        await integration.connect();
    }

    async disconnectIntegration(id: string): Promise<void> {
        const integration = this.getIntegrationById(id);
        if (!integration) {
            throw new Error(`Integration ${id} not found`);
        }
        await integration.disconnect();
    }

    async syncAll(): Promise<void> {
        const connected = this.getConnectedIntegrations();
        await Promise.all(connected.map(i => i.sync()));
    }
}

export const integrationManager = IntegrationManager.getInstance();
