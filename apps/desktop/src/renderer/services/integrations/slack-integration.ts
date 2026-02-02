// apps/desktop/src/renderer/services/integrations/slack-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface SlackUser {
    id: string;
    name: string;
    real_name: string;
    profile: {
        status_text: string;
        status_emoji: string;
        status_expiration: number;
    };
}

export class SlackIntegration extends BaseIntegration {
    readonly id = 'slack';
    readonly name = 'Slack';
    readonly icon = '💬';
    readonly category = 'communication' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_SLACK_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_SLACK_CLIENT_SECRET,
        redirectUri: 'wakey://auth/slack/callback',
        scope: 'users.profile:read,users.profile:write,dnd:read,dnd:write,chat:write',
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access'
    };

    private currentUser?: SlackUser;
    private originalStatus?: { text: string; emoji: string };

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Update Slack status during focus sessions and enable DND',
            features: [
                'status-sync',
                'dnd-during-focus',
                'focus-notifications',
                'channel-muting',
                'auto-status-update'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.fetchCurrentUser();
            this.startPolling(60 * 1000); // Check every minute
        } catch (error) {
            console.error('Slack connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        // Restore original status before disconnecting
        if (this.originalStatus) {
            await this.setStatus(this.originalStatus.text, this.originalStatus.emoji);
        }
        this.stopPolling();
        await this.clearTokens();
        this.currentUser = undefined;
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            await this.fetchCurrentUser();
            this.lastSyncAt = new Date();
            result.synced = 1;
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchCurrentUser(): Promise<SlackUser> {
        const response = await fetch('https://slack.com/api/users.profile.get', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Slack API error: ${data.error}`);
        }

        this.currentUser = {
            id: '',
            name: '',
            real_name: '',
            profile: data.profile
        };

        return this.currentUser;
    }

    async setFocusStatus(focusMinutes: number): Promise<void> {
        await this.ensureValidToken(this.config);

        // Save original status
        if (this.currentUser && !this.originalStatus) {
            this.originalStatus = {
                text: this.currentUser.profile.status_text,
                emoji: this.currentUser.profile.status_emoji
            };
        }

        const expirationTime = Math.floor(Date.now() / 1000) + (focusMinutes * 60);

        // Set focus status
        await this.setStatus('In a focus session - Wakey', '🎯', expirationTime);

        // Enable DND
        await this.enableDND(focusMinutes);
    }

    async clearFocusStatus(): Promise<void> {
        // Restore original status
        if (this.originalStatus) {
            await this.setStatus(this.originalStatus.text, this.originalStatus.emoji);
            this.originalStatus = undefined;
        } else {
            await this.setStatus('', '');
        }

        // Disable DND
        await this.disableDND();
    }

    private async setStatus(text: string, emoji: string, expiration?: number): Promise<void> {
        const response = await fetch('https://slack.com/api/users.profile.set', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: {
                    status_text: text,
                    status_emoji: emoji,
                    status_expiration: expiration || 0
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to set status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Slack API error: ${data.error}`);
        }
    }

    async enableDND(minutes: number): Promise<void> {
        const response = await fetch('https://slack.com/api/dnd.setSnooze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `num_minutes=${minutes}`
        });

        if (!response.ok) {
            throw new Error(`Failed to enable DND: ${response.status}`);
        }
    }

    async disableDND(): Promise<void> {
        const response = await fetch('https://slack.com/api/dnd.endSnooze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to disable DND: ${response.status}`);
        }
    }

    async getDNDStatus(): Promise<{ dnd_enabled: boolean; next_dnd_end_ts: number }> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://slack.com/api/dnd.info', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get DND status: ${response.status}`);
        }

        const data = await response.json();
        return {
            dnd_enabled: data.dnd_enabled,
            next_dnd_end_ts: data.next_dnd_end_ts
        };
    }

    getCurrentUser(): SlackUser | undefined {
        return this.currentUser;
    }
}

export const slackIntegration = new SlackIntegration();
