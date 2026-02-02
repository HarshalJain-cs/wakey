/**
 * @fileoverview GitHub Integration Service
 * 
 * Integration with GitHub for:
 * - Tracking commits and contributions
 * - Correlating coding activity with focus sessions
 * - Repository activity insights
 * 
 * @module services/github-integration-service
 */

// ============================================
// Types
// ============================================

export interface GitHubConfig {
    enabled: boolean;
    accessToken: string | null;
    username: string | null;
    avatarUrl: string | null;
    trackCommits: boolean;
    trackPullRequests: boolean;
    correlateWithFocus: boolean;
    lastSync: Date | null;
}

export interface GitHubCommit {
    sha: string;
    message: string;
    date: Date;
    repository: string;
    additions: number;
    deletions: number;
}

export interface GitHubContributionDay {
    date: string;
    count: number;
}

// ============================================
// GitHub Integration Service
// ============================================

class GitHubIntegrationService {
    private config: GitHubConfig;
    private readonly API_BASE = 'https://api.github.com';

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): GitHubConfig {
        try {
            const saved = localStorage.getItem('wakey_github_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
                };
            }
        } catch {
            console.error('Failed to load GitHub config');
        }
        return {
            enabled: false,
            accessToken: null,
            username: null,
            avatarUrl: null,
            trackCommits: true,
            trackPullRequests: true,
            correlateWithFocus: true,
            lastSync: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_github_config', JSON.stringify(this.config));
    }

    // Check if connected
    isConnected(): boolean {
        return this.config.enabled && !!this.config.accessToken;
    }

    // Connect with personal access token
    async connect(accessToken: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Use IPC bridge to bypass CORS in Electron renderer
            const response = await window.wakey.fetchGitHub('/user', accessToken);

            if (response.ok && response.data) {
                const user = response.data;
                this.config = {
                    ...this.config,
                    enabled: true,
                    accessToken,
                    username: user.login,
                    avatarUrl: user.avatar_url,
                    lastSync: new Date(),
                };
                this.saveConfig();
                return { success: true };
            } else {
                console.error('GitHub API error:', response.error);
                return { success: false, error: response.error || 'Invalid token or unauthorized' };
            }
        } catch (error) {
            console.error('GitHub connection error:', error);
            return { success: false, error: 'Failed to connect to GitHub' };
        }
    }

    // Disconnect
    disconnect(): void {
        this.config = {
            enabled: false,
            accessToken: null,
            username: null,
            avatarUrl: null,
            trackCommits: true,
            trackPullRequests: true,
            correlateWithFocus: true,
            lastSync: null,
        };
        this.saveConfig();
    }

    // Fetch recent commits
    async getRecentCommits(days: number = 7): Promise<GitHubCommit[]> {
        if (!this.isConnected()) return [];

        try {
            const since = new Date();
            since.setDate(since.getDate() - days);

            const response = await fetch(
                `${this.API_BASE}/users/${this.config.username}/events?per_page=100`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.accessToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                }
            );

            if (response.ok) {
                const events = await response.json();
                const commits: GitHubCommit[] = [];

                for (const event of events) {
                    if (event.type === 'PushEvent') {
                        for (const commit of event.payload.commits || []) {
                            commits.push({
                                sha: commit.sha,
                                message: commit.message.split('\n')[0],
                                date: new Date(event.created_at),
                                repository: event.repo.name,
                                additions: 0, // Would need additional API call
                                deletions: 0,
                            });
                        }
                    }
                }

                this.config.lastSync = new Date();
                this.saveConfig();
                return commits;
            }
        } catch (error) {
            console.error('Failed to fetch GitHub commits:', error);
        }

        return [];
    }

    // Get contribution calendar (last year)
    async getContributions(): Promise<GitHubContributionDay[]> {
        if (!this.isConnected()) return [];

        // GitHub's contribution data requires GraphQL API
        // For now, return demo data
        const contributions: GitHubContributionDay[] = [];
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            contributions.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 10),
            });
        }

        return contributions;
    }

    // Get today's commit count
    async getTodayCommits(): Promise<number> {
        const commits = await this.getRecentCommits(1);
        const today = new Date().toDateString();
        return commits.filter(c => c.date.toDateString() === today).length;
    }

    // Correlate commits with focus sessions
    async correlateWithFocus(focusSessions: Array<{ start: Date; end: Date }>): Promise<{
        commitsPerFocusHour: number;
        mostProductiveTime: string;
    }> {
        const commits = await this.getRecentCommits(7);

        let commitsInFocus = 0;
        let totalFocusHours = 0;
        const hourCounts: Record<number, number> = {};

        for (const session of focusSessions) {
            const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
            totalFocusHours += duration;

            for (const commit of commits) {
                if (commit.date >= session.start && commit.date <= session.end) {
                    commitsInFocus++;
                    const hour = commit.date.getHours();
                    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
            }
        }

        const mostProductiveHour = Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            commitsPerFocusHour: totalFocusHours > 0 ? commitsInFocus / totalFocusHours : 0,
            mostProductiveTime: mostProductiveHour
                ? `${parseInt(mostProductiveHour[0])}:00`
                : 'N/A',
        };
    }

    // Getters and setters
    getConfig(): GitHubConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<GitHubConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
}

export const githubService = new GitHubIntegrationService();
