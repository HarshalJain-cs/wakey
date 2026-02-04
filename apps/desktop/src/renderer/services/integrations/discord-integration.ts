// apps/desktop/src/renderer/services/integrations/discord-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    global_name: string | null;
}

interface DiscordConnection {
    id: string;
    name: string;
    type: string;
    verified: boolean;
}

interface DiscordActivity {
    name: string;
    type: number;
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    };
}

export class DiscordIntegration extends BaseIntegration {
    readonly id = 'discord';
    readonly name = 'Discord';
    readonly icon = '🎮';
    readonly category = 'communication' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_DISCORD_CLIENT_SECRET,
        redirectUri: 'wakey://auth/discord/callback',
        scope: 'identify guilds rpc rpc.activities.write',
        authUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token'
    };

    private currentUser?: DiscordUser;
    private rpcConnected: boolean = false;

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Update Discord Rich Presence during focus sessions and manage DND',
            features: [
                'rich-presence',
                'focus-activity',
                'dnd-sync',
                'status-update',
                'achievement-notifications'
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
            console.error('Discord connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.clearRichPresence();
        this.stopPolling();
        await this.clearTokens();
        this.currentUser = undefined;
        this.rpcConnected = false;
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

    private async fetchCurrentUser(): Promise<DiscordUser> {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        this.currentUser = await response.json();
        return this.currentUser!;
    }

    async getConnections(): Promise<DiscordConnection[]> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://discord.com/api/users/@me/connections', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Set Rich Presence to show focus session status
     * Note: This requires Discord RPC connection via local client
     */
    async setFocusPresence(sessionType: 'focus' | 'break', durationMinutes: number, taskName?: string): Promise<void> {
        const activity: DiscordActivity = {
            name: 'Wakey',
            type: 0, // Playing
            state: sessionType === 'focus' ? `Focusing for ${durationMinutes} minutes` : `Taking a ${durationMinutes} minute break`,
            details: taskName || (sessionType === 'focus' ? 'Deep Work Mode' : 'Break Time'),
            timestamps: {
                start: Date.now(),
                end: Date.now() + durationMinutes * 60 * 1000
            },
            assets: {
                large_image: 'wakey_logo',
                large_text: 'Wakey - Productivity App',
                small_image: sessionType === 'focus' ? 'focus_icon' : 'break_icon',
                small_text: sessionType === 'focus' ? 'In Focus Mode' : 'On Break'
            }
        };

        // In a real implementation, this would use Discord RPC SDK
        console.log('Setting Discord Rich Presence:', activity);

        // Store activity for webhook notification
        await this.notifyWebhook('focus_started', {
            user: this.currentUser?.username,
            session_type: sessionType,
            duration: durationMinutes,
            task: taskName
        });
    }

    async clearRichPresence(): Promise<void> {
        // Would clear Discord RPC activity
        console.log('Clearing Discord Rich Presence');
    }

    /**
     * Send notification to Discord webhook about achievements
     */
    async notifyAchievement(achievementName: string, description: string, points: number): Promise<void> {
        const webhookUrl = localStorage.getItem('discord_webhook_url');
        if (!webhookUrl) return;

        const embed = {
            title: `🏆 Achievement Unlocked!`,
            description: `**${achievementName}**\n${description}`,
            color: 0x00FF00,
            fields: [
                { name: 'Points', value: `+${points}`, inline: true },
                { name: 'Unlocked by', value: this.currentUser?.global_name || this.currentUser?.username || 'User', inline: true }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Powered by Wakey'
            }
        };

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch (error) {
            console.error('Failed to send Discord webhook:', error);
        }
    }

    private async notifyWebhook(event: string, data: any): Promise<void> {
        const webhookUrl = localStorage.getItem('discord_webhook_url');
        if (!webhookUrl) return;

        const embed = {
            title: event === 'focus_started' ? '🎯 Focus Session Started' : '📊 Wakey Event',
            description: `${data.user} has started a ${data.session_type} session!`,
            color: data.session_type === 'focus' ? 0xFF9800 : 0x4CAF50,
            fields: [
                { name: 'Duration', value: `${data.duration} minutes`, inline: true },
                { name: 'Task', value: data.task || 'General Focus', inline: true }
            ],
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch (error) {
            console.error('Failed to send Discord webhook:', error);
        }
    }

    setWebhookUrl(url: string): void {
        localStorage.setItem('discord_webhook_url', url);
    }

    getCurrentUser(): DiscordUser | undefined {
        return this.currentUser;
    }

    isRPCConnected(): boolean {
        return this.rpcConnected;
    }
}

export const discordIntegration = new DiscordIntegration();
