/**
 * @fileoverview Discord Integration Service
 * 
 * Integration with Discord webhooks for:
 * - Daily productivity summaries
 * - Achievement notifications
 * - Focus session updates
 * - Milestone celebrations
 * 
 * @module services/discord-integration-service
 */

// ============================================
// Types
// ============================================

export interface DiscordConfig {
    enabled: boolean;
    webhookUrl: string | null;
    notifyDailySummary: boolean;
    notifyAchievements: boolean;
    notifyFocusSessions: boolean;
    notifyMilestones: boolean;
    summaryTime: string; // HH:MM format
    lastNotification: Date | null;
}

export interface DiscordEmbed {
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string };
    timestamp?: string;
}

// ============================================
// Discord Colors (decimal format)
// ============================================
const COLORS = {
    success: 5763719,    // #57F287 - Green
    warning: 16776960,   // #FFFF00 - Yellow
    error: 15548997,     // #ED4245 - Red
    info: 5793266,       // #5865F2 - Blurple
    focus: 3066993,      // #2ECC71 - Emerald
    achievement: 15844367, // #F1C40F - Gold
};

// ============================================
// Discord Integration Service
// ============================================

class DiscordIntegrationService {
    private config: DiscordConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): DiscordConfig {
        try {
            const saved = localStorage.getItem('wakey_discord_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    lastNotification: parsed.lastNotification ? new Date(parsed.lastNotification) : null,
                };
            }
        } catch {
            console.error('Failed to load Discord config');
        }
        return {
            enabled: false,
            webhookUrl: null,
            notifyDailySummary: true,
            notifyAchievements: true,
            notifyFocusSessions: false,
            notifyMilestones: true,
            summaryTime: '20:00',
            lastNotification: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_discord_config', JSON.stringify(this.config));
    }

    // Check if Discord is connected
    isConnected(): boolean {
        return this.config.enabled && !!this.config.webhookUrl;
    }

    // Connect with webhook URL
    async connect(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
        // Validate webhook URL format
        if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
            !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
            return { success: false, error: 'Invalid Discord webhook URL' };
        }

        // Test the webhook
        try {
            const testResult = await this.sendMessage({
                embeds: [{
                    title: '🎉 Wakey Connected!',
                    description: 'Your Wakey productivity tracker is now connected to this channel.',
                    color: COLORS.success,
                    footer: { text: 'Wakey Productivity Tracker' },
                    timestamp: new Date().toISOString(),
                }],
            }, webhookUrl);

            if (testResult) {
                this.config = {
                    ...this.config,
                    enabled: true,
                    webhookUrl,
                    lastNotification: new Date(),
                };
                this.saveConfig();
                return { success: true };
            }
        } catch (error) {
            console.error('Failed to connect Discord:', error);
        }

        return { success: false, error: 'Failed to send test message' };
    }

    // Disconnect from Discord
    disconnect(): void {
        this.config = {
            enabled: false,
            webhookUrl: null,
            notifyDailySummary: true,
            notifyAchievements: true,
            notifyFocusSessions: false,
            notifyMilestones: true,
            summaryTime: '20:00',
            lastNotification: null,
        };
        this.saveConfig();
    }

    // Send raw message to webhook
    private async sendMessage(
        payload: { content?: string; embeds?: DiscordEmbed[] },
        webhookUrl?: string
    ): Promise<boolean> {
        const url = webhookUrl || this.config.webhookUrl;
        if (!url) return false;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            return response.ok;
        } catch (error) {
            console.error('Discord webhook error:', error);
            return false;
        }
    }

    // Send daily summary
    async sendDailySummary(data: {
        focusMinutes: number;
        productivityScore: number;
        tasksCompleted: number;
        topApp: string;
        distractionMinutes: number;
    }): Promise<boolean> {
        if (!this.isConnected() || !this.config.notifyDailySummary) return false;

        const hours = Math.floor(data.focusMinutes / 60);
        const minutes = data.focusMinutes % 60;
        const focusTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return this.sendMessage({
            embeds: [{
                title: '📊 Daily Productivity Summary',
                description: `Here's how your day went!`,
                color: data.productivityScore >= 70 ? COLORS.success :
                    data.productivityScore >= 40 ? COLORS.warning : COLORS.error,
                fields: [
                    { name: '⏱️ Focus Time', value: focusTime, inline: true },
                    { name: '📈 Productivity', value: `${data.productivityScore}%`, inline: true },
                    { name: '✅ Tasks Done', value: `${data.tasksCompleted}`, inline: true },
                    { name: '💻 Top App', value: data.topApp, inline: true },
                    { name: '🚫 Distractions', value: `${Math.round(data.distractionMinutes)}m`, inline: true },
                ],
                footer: { text: 'Wakey • Keep up the great work!' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    // Send achievement notification
    async sendAchievement(name: string, description: string, icon: string = '🏆'): Promise<boolean> {
        if (!this.isConnected() || !this.config.notifyAchievements) return false;

        return this.sendMessage({
            embeds: [{
                title: `${icon} Achievement Unlocked!`,
                description: `**${name}**\n${description}`,
                color: COLORS.achievement,
                footer: { text: 'Wakey Achievements' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    // Send focus session complete
    async sendFocusComplete(durationMinutes: number, score: number): Promise<boolean> {
        if (!this.isConnected() || !this.config.notifyFocusSessions) return false;

        return this.sendMessage({
            embeds: [{
                title: '🎯 Focus Session Complete!',
                description: `Great job staying focused!`,
                color: COLORS.focus,
                fields: [
                    { name: 'Duration', value: `${durationMinutes} minutes`, inline: true },
                    { name: 'Focus Score', value: `${score}%`, inline: true },
                ],
                footer: { text: 'Wakey Focus' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    // Send milestone notification
    async sendMilestone(milestone: string, details: string): Promise<boolean> {
        if (!this.isConnected() || !this.config.notifyMilestones) return false;

        return this.sendMessage({
            embeds: [{
                title: '🌟 Milestone Reached!',
                description: `**${milestone}**\n${details}`,
                color: COLORS.achievement,
                footer: { text: 'Wakey Milestones' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    // Test webhook
    async testWebhook(): Promise<boolean> {
        if (!this.isConnected()) return false;

        return this.sendMessage({
            embeds: [{
                title: '🧪 Test Notification',
                description: 'Your Discord webhook is working correctly!',
                color: COLORS.info,
                footer: { text: 'Wakey Test' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    // Getters and setters
    getConfig(): DiscordConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<DiscordConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
}

export const discordService = new DiscordIntegrationService();
