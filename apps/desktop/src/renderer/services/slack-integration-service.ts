/**
 * @fileoverview Slack Integration Service
 * 
 * Integration with Slack for:
 * - Status updates based on focus state
 * - Slash commands for quick actions
 * - Notifications for achievements
 * - Meeting reminders
 * 
 * @module services/slack-integration-service
 */

// ============================================
// Types
// ============================================

export interface SlackConfig {
    enabled: boolean;
    accessToken: string | null;
    botToken: string | null;
    workspaceName: string | null;
    userId: string | null;
    autoUpdateStatus: boolean;
    focusStatusEmoji: string;
    focusStatusText: string;
    breakStatusEmoji: string;
    breakStatusText: string;
    notifyOnAchievements: boolean;
    notifyChannel: string | null;
}

export interface SlackStatus {
    emoji: string;
    text: string;
    expiresAt: Date | null;
}

export interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
}

export interface SlackNotification {
    id: string;
    type: 'focus_start' | 'focus_end' | 'achievement' | 'milestone' | 'break_reminder';
    message: string;
    timestamp: Date;
    sent: boolean;
}

// ============================================
// Slack Integration Service
// ============================================

class SlackIntegrationService {
    private config: SlackConfig;
    private channels: SlackChannel[] = [];
    private currentStatus: SlackStatus | null = null;
    private previousStatus: SlackStatus | null = null;
    private notificationQueue: SlackNotification[] = [];

    private readonly API_BASE = 'https://slack.com/api';

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): SlackConfig {
        try {
            const stored = localStorage.getItem('wakey_slack_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load Slack config:', error);
        }

        return {
            enabled: false,
            accessToken: null,
            botToken: null,
            workspaceName: null,
            userId: null,
            autoUpdateStatus: true,
            focusStatusEmoji: ':brain:',
            focusStatusText: 'In a focus session - response may be delayed',
            breakStatusEmoji: ':coffee:',
            breakStatusText: 'Taking a break',
            notifyOnAchievements: true,
            notifyChannel: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_slack_config', JSON.stringify(this.config));
    }

    // ============================================
    // Connection
    // ============================================

    /**
     * Check if connected to Slack
     */
    isConnected(): boolean {
        return !!this.config.accessToken && this.config.enabled;
    }

    /**
     * Get OAuth URL for Slack
     */
    getOAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scopes.join(','),
            user_scope: 'users.profile:write,users:read',
        });
        return `https://slack.com/oauth/v2/authorize?${params}`;
    }

    /**
     * Connect with OAuth token
     */
    async connect(accessToken: string, botToken?: string): Promise<boolean> {
        try {
            // Test the connection
            const response = await this.makeRequest('auth.test', { token: accessToken });

            if (response.ok) {
                this.config.accessToken = accessToken;
                this.config.botToken = botToken || null;
                this.config.userId = response.user_id;
                this.config.workspaceName = response.team;
                this.config.enabled = true;
                this.saveConfig();

                // Fetch channels
                await this.fetchChannels();

                return true;
            }

            return false;
        } catch (error) {
            console.error('Slack connection failed:', error);
            return false;
        }
    }

    /**
     * Disconnect from Slack
     */
    disconnect(): void {
        // Restore previous status before disconnecting
        if (this.previousStatus) {
            this.setStatus(this.previousStatus);
        }

        this.config.accessToken = null;
        this.config.botToken = null;
        this.config.enabled = false;
        this.config.workspaceName = null;
        this.config.userId = null;
        this.channels = [];
        this.saveConfig();
    }

    // ============================================
    // API Helpers
    // ============================================

    private async makeRequest(method: string, params: Record<string, unknown> = {}): Promise<any> {
        const token = params.token || this.config.accessToken;

        if (!token) {
            throw new Error('Slack token not configured');
        }

        const response = await fetch(`${this.API_BASE}/${method}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        return response.json();
    }

    // ============================================
    // Status Management
    // ============================================

    /**
     * Set Slack status
     */
    async setStatus(status: SlackStatus): Promise<boolean> {
        if (!this.isConnected()) {
            console.info('[Demo] Would set Slack status:', status);
            return true;
        }

        try {
            const profile: Record<string, unknown> = {
                status_emoji: status.emoji,
                status_text: status.text,
            };

            if (status.expiresAt) {
                profile.status_expiration = Math.floor(status.expiresAt.getTime() / 1000);
            }

            const response = await this.makeRequest('users.profile.set', { profile });

            if (response.ok) {
                this.currentStatus = status;
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to set Slack status:', error);
            return false;
        }
    }

    /**
     * Set focus mode status
     */
    async setFocusStatus(durationMinutes?: number): Promise<boolean> {
        if (!this.config.autoUpdateStatus) {
            return false;
        }

        // Save current status to restore later
        await this.saveCurrentStatus();

        const expiresAt = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000)
            : null;

        return this.setStatus({
            emoji: this.config.focusStatusEmoji,
            text: this.config.focusStatusText,
            expiresAt,
        });
    }

    /**
     * Set break status
     */
    async setBreakStatus(durationMinutes: number = 15): Promise<boolean> {
        if (!this.config.autoUpdateStatus) {
            return false;
        }

        return this.setStatus({
            emoji: this.config.breakStatusEmoji,
            text: this.config.breakStatusText,
            expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
        });
    }

    /**
     * Clear status (restore previous)
     */
    async clearStatus(): Promise<boolean> {
        if (this.previousStatus) {
            return this.setStatus(this.previousStatus);
        }

        return this.setStatus({
            emoji: '',
            text: '',
            expiresAt: null,
        });
    }

    private async saveCurrentStatus(): Promise<void> {
        if (!this.isConnected()) return;

        try {
            const response = await this.makeRequest('users.profile.get');

            if (response.ok && response.profile) {
                this.previousStatus = {
                    emoji: response.profile.status_emoji || '',
                    text: response.profile.status_text || '',
                    expiresAt: response.profile.status_expiration
                        ? new Date(response.profile.status_expiration * 1000)
                        : null,
                };
            }
        } catch (error) {
            console.error('Failed to save current status:', error);
        }
    }

    // ============================================
    // Channels
    // ============================================

    /**
     * Fetch available channels
     */
    async fetchChannels(): Promise<SlackChannel[]> {
        if (!this.isConnected()) {
            return this.getDemoChannels();
        }

        try {
            const response = await this.makeRequest('conversations.list', {
                types: 'public_channel,private_channel',
                limit: 100,
            });

            if (response.ok && response.channels) {
                this.channels = response.channels.map((ch: any) => ({
                    id: ch.id,
                    name: ch.name,
                    isPrivate: ch.is_private,
                }));
            }

            return this.channels;
        } catch (error) {
            console.error('Failed to fetch Slack channels:', error);
            return this.getDemoChannels();
        }
    }

    private getDemoChannels(): SlackChannel[] {
        return [
            { id: 'demo_general', name: 'general', isPrivate: false },
            { id: 'demo_random', name: 'random', isPrivate: false },
            { id: 'demo_team', name: 'team', isPrivate: false },
            { id: 'demo_productivity', name: 'productivity', isPrivate: true },
        ];
    }

    getChannels(): SlackChannel[] {
        return this.channels;
    }

    // ============================================
    // Notifications
    // ============================================

    /**
     * Send notification to channel
     */
    async sendNotification(
        type: SlackNotification['type'],
        message: string,
        channel?: string
    ): Promise<boolean> {
        const targetChannel = channel || this.config.notifyChannel;

        if (!targetChannel) {
            console.info('[Demo] Would send Slack notification:', message);
            return true;
        }

        if (!this.isConnected()) {
            // Queue for later
            this.notificationQueue.push({
                id: `notif_${Date.now()}`,
                type,
                message,
                timestamp: new Date(),
                sent: false,
            });
            return false;
        }

        try {
            const response = await this.makeRequest('chat.postMessage', {
                channel: targetChannel,
                text: message,
                mrkdwn: true,
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            return false;
        }
    }

    /**
     * Notify focus session started
     */
    async notifyFocusStart(durationMinutes: number): Promise<boolean> {
        if (!this.config.notifyOnAchievements) return false;

        return this.sendNotification(
            'focus_start',
            `:brain: Started a ${durationMinutes}-minute focus session`
        );
    }

    /**
     * Notify focus session completed
     */
    async notifyFocusComplete(durationMinutes: number, score: number): Promise<boolean> {
        if (!this.config.notifyOnAchievements) return false;

        return this.sendNotification(
            'focus_end',
            `:white_check_mark: Completed ${durationMinutes}-minute focus session with ${score}% quality score!`
        );
    }

    /**
     * Notify achievement unlocked
     */
    async notifyAchievement(achievementName: string, description: string): Promise<boolean> {
        if (!this.config.notifyOnAchievements) return false;

        return this.sendNotification(
            'achievement',
            `:trophy: Achievement Unlocked: *${achievementName}*\n${description}`
        );
    }

    /**
     * Notify milestone reached
     */
    async notifyMilestone(milestone: string): Promise<boolean> {
        if (!this.config.notifyOnAchievements) return false;

        return this.sendNotification(
            'milestone',
            `:star: Milestone Reached: ${milestone}`
        );
    }

    // ============================================
    // Configuration
    // ============================================

    getConfig(): SlackConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<SlackConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    getStatus(): SlackStatus | null {
        return this.currentStatus;
    }

    getPreviousStatus(): SlackStatus | null {
        return this.previousStatus;
    }
}

// Singleton instance
export const slackIntegrationService = new SlackIntegrationService();
export default slackIntegrationService;
