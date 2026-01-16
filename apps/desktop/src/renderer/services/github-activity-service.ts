/**
 * @fileoverview GitHub Activity Integration Service
 * 
 * Fetches GitHub activity for the authenticated user:
 * - Recent commits
 * - Pull requests
 * - Issues
 * - Repository activity
 */

export interface GitHubCommit {
    sha: string;
    message: string;
    repo: string;
    date: Date;
    url: string;
}

export interface GitHubPullRequest {
    id: number;
    title: string;
    repo: string;
    state: 'open' | 'closed' | 'merged';
    createdAt: Date;
    url: string;
}

export interface GitHubIssue {
    id: number;
    title: string;
    repo: string;
    state: 'open' | 'closed';
    createdAt: Date;
    url: string;
    labels: string[];
}

export interface GitHubStats {
    totalCommitsToday: number;
    totalCommitsWeek: number;
    openPRs: number;
    openIssues: number;
    recentActivity: Array<{
        type: 'commit' | 'pr' | 'issue';
        title: string;
        repo: string;
        date: Date;
        url: string;
    }>;
}

export interface GitHubConfig {
    enabled: boolean;
    accessToken: string | null;
    username: string | null;
}

class GitHubActivityService {
    private config: GitHubConfig;
    private commits: GitHubCommit[] = [];
    private pullRequests: GitHubPullRequest[] = [];
    private issues: GitHubIssue[] = [];

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): GitHubConfig {
        try {
            const stored = localStorage.getItem('wakey_github');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load GitHub config:', error);
        }

        return {
            enabled: false,
            accessToken: null,
            username: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_github', JSON.stringify(this.config));
    }

    /**
     * Check if GitHub is configured
     */
    isConfigured(): boolean {
        return !!this.config.accessToken && this.config.enabled;
    }

    /**
     * Set access token (Personal Access Token)
     */
    setAccessToken(token: string, username: string): void {
        this.config.accessToken = token;
        this.config.username = username;
        this.config.enabled = true;
        this.saveConfig();
    }

    /**
     * Fetch user's GitHub activity
     */
    async fetchActivity(): Promise<void> {
        if (!this.isConfigured()) {
            // Load demo data
            this.loadDemoData();
            return;
        }

        try {
            // In production, this would call the GitHub API
            // For now, load demo data
            this.loadDemoData();
        } catch (error) {
            console.error('Failed to fetch GitHub activity:', error);
        }
    }

    /**
     * Load demo data for preview
     */
    private loadDemoData(): void {
        const now = new Date();

        // Demo commits
        this.commits = [
            {
                sha: 'abc123',
                message: 'feat: Add user authentication',
                repo: 'my-project',
                date: new Date(now.getTime() - 2 * 60 * 60000),
                url: 'https://github.com/user/my-project/commit/abc123',
            },
            {
                sha: 'def456',
                message: 'fix: Resolve login redirect issue',
                repo: 'my-project',
                date: new Date(now.getTime() - 5 * 60 * 60000),
                url: 'https://github.com/user/my-project/commit/def456',
            },
            {
                sha: 'ghi789',
                message: 'docs: Update README',
                repo: 'wakey',
                date: new Date(now.getTime() - 24 * 60 * 60000),
                url: 'https://github.com/user/wakey/commit/ghi789',
            },
        ];

        // Demo PRs
        this.pullRequests = [
            {
                id: 42,
                title: 'Add dark mode support',
                repo: 'my-project',
                state: 'open',
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60000),
                url: 'https://github.com/user/my-project/pull/42',
            },
            {
                id: 41,
                title: 'Refactor authentication flow',
                repo: 'my-project',
                state: 'merged',
                createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60000),
                url: 'https://github.com/user/my-project/pull/41',
            },
        ];

        // Demo issues
        this.issues = [
            {
                id: 15,
                title: 'Button hover state inconsistent',
                repo: 'my-project',
                state: 'open',
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60000),
                url: 'https://github.com/user/my-project/issues/15',
                labels: ['bug', 'ui'],
            },
        ];
    }

    /**
     * Get activity statistics
     */
    getStats(): GitHubStats {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);

        const recentActivity = [
            ...this.commits.map(c => ({
                type: 'commit' as const,
                title: c.message,
                repo: c.repo,
                date: c.date,
                url: c.url,
            })),
            ...this.pullRequests.map(pr => ({
                type: 'pr' as const,
                title: pr.title,
                repo: pr.repo,
                date: pr.createdAt,
                url: pr.url,
            })),
            ...this.issues.map(i => ({
                type: 'issue' as const,
                title: i.title,
                repo: i.repo,
                date: i.createdAt,
                url: i.url,
            })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        return {
            totalCommitsToday: this.commits.filter(c => c.date >= todayStart).length,
            totalCommitsWeek: this.commits.filter(c => c.date >= weekStart).length,
            openPRs: this.pullRequests.filter(pr => pr.state === 'open').length,
            openIssues: this.issues.filter(i => i.state === 'open').length,
            recentActivity: recentActivity.slice(0, 10),
        };
    }

    /**
     * Get recent commits
     */
    getRecentCommits(limit: number = 10): GitHubCommit[] {
        return this.commits.slice(0, limit);
    }

    /**
     * Get open PRs
     */
    getOpenPRs(): GitHubPullRequest[] {
        return this.pullRequests.filter(pr => pr.state === 'open');
    }

    /**
     * Get open issues
     */
    getOpenIssues(): GitHubIssue[] {
        return this.issues.filter(i => i.state === 'open');
    }

    /**
     * Disconnect GitHub
     */
    disconnect(): void {
        this.config.accessToken = null;
        this.config.username = null;
        this.config.enabled = false;
        this.commits = [];
        this.pullRequests = [];
        this.issues = [];
        this.saveConfig();
    }

    /**
     * Get configuration
     */
    getConfig(): GitHubConfig {
        return { ...this.config };
    }
}

export const githubActivityService = new GitHubActivityService();
export default githubActivityService;
