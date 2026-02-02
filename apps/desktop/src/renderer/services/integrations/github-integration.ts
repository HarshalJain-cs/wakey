// apps/desktop/src/renderer/services/integrations/github-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    labels: { name: string; color: string }[];
    assignees: { login: string }[];
    milestone?: { title: string };
    created_at: string;
    updated_at: string;
    html_url: string;
}

interface GitHubPullRequest {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    draft: boolean;
    requested_reviewers: { login: string }[];
    created_at: string;
    updated_at: string;
    merged_at?: string;
    html_url: string;
    additions?: number;
    deletions?: number;
    changed_files?: number;
}

interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    language?: string;
    stargazers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    pushed_at?: string;
}

export interface GitHubCommit {
    sha: string;
    message: string;
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
    html_url: string;
    stats?: { additions: number; deletions: number; total: number };
}

export interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    payload: any;
    created_at: string;
}

export interface GitHubUserStats {
    login: string;
    name: string;
    avatar_url: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    bio?: string;
    company?: string;
    location?: string;
}

export interface ContributionDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubDashboardData {
    user: GitHubUserStats | null;
    repositories: GitHubRepository[];
    recentCommits: GitHubCommit[];
    openPRs: GitHubPullRequest[];
    reviewRequests: GitHubPullRequest[];
    assignedIssues: GitHubIssue[];
    recentEvents: GitHubEvent[];
    contributionData: ContributionDay[][];
    stats: {
        totalCommitsThisWeek: number;
        totalPRsThisMonth: number;
        totalIssuesClosed: number;
        linesAdded: number;
        linesDeleted: number;
        streak: number;
    };
}

export class GitHubIntegration extends BaseIntegration {
    readonly id = 'github';
    readonly name = 'GitHub';
    readonly icon = '🐙';
    readonly category = 'development' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
        redirectUri: 'wakey://auth/github/callback',
        scope: 'repo user read:org',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token'
    };

    private cachedRepos: GitHubRepository[] = [];
    private cachedIssues: Map<string, GitHubIssue[]> = new Map();
    private cachedPRs: Map<string, GitHubPullRequest[]> = new Map();
    private cachedUser: GitHubUserStats | null = null;
    private cachedDashboardData: GitHubDashboardData | null = null;
    private lastDashboardFetch: Date | null = null;

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Track your GitHub issues and PRs as tasks',
            features: [
                'issue-sync',
                'pr-tracking',
                'assigned-issues',
                'review-requests',
                'activity-tracking',
                'commit-correlation',
                'contribution-graph',
                'real-time-stats'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.fetchUser();
            await this.fetchRepositories();
            await this.sync();
            this.startPolling(10 * 60 * 1000); // Sync every 10 minutes
        } catch (error) {
            console.error('GitHub connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.cachedRepos = [];
        this.cachedIssues.clear();
        this.cachedPRs.clear();
        this.cachedUser = null;
        this.cachedDashboardData = null;
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch assigned issues
            const assignedIssues = await this.fetchAssignedIssues();

            // Fetch review requests
            const reviewRequests = await this.fetchReviewRequests();

            // Sync issues as tasks
            for (const issue of assignedIssues) {
                await this.syncIssueAsTask(issue);
                result.synced++;
            }

            // Sync PRs that need review
            for (const pr of reviewRequests) {
                await this.syncPRAsTask(pr);
                result.synced++;
            }

            this.lastSyncAt = new Date();
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    // NEW: Fetch authenticated user
    async fetchUser(): Promise<GitHubUserStats> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        this.cachedUser = await response.json();
        return this.cachedUser!;
    }

    private async fetchRepositories(): Promise<GitHubRepository[]> {
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        this.cachedRepos = await response.json();
        return this.cachedRepos;
    }

    private async fetchAssignedIssues(): Promise<GitHubIssue[]> {
        const response = await fetch('https://api.github.com/issues?filter=assigned&state=open&per_page=100', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return response.json();
    }

    private async fetchReviewRequests(): Promise<GitHubPullRequest[]> {
        const response = await fetch('https://api.github.com/user/issues?filter=review-requested&state=open&per_page=100', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        // Filter to only PRs (they come through issues endpoint but have pull_request key)
        return data.filter((item: any) => item.pull_request);
    }

    // NEW: Fetch recent commits across user's repos
    async fetchRecentCommits(limit: number = 30): Promise<GitHubCommit[]> {
        await this.ensureValidToken(this.config);

        const events = await this.fetchUserEvents();
        const pushEvents = events.filter(e => e.type === 'PushEvent').slice(0, limit);

        const commits: GitHubCommit[] = [];
        for (const event of pushEvents) {
            if (event.payload.commits) {
                for (const commit of event.payload.commits) {
                    commits.push({
                        sha: commit.sha,
                        message: commit.message,
                        author: { name: commit.author?.name || '', email: commit.author?.email || '', date: event.created_at },
                        committer: { name: '', email: '', date: event.created_at },
                        html_url: `https://github.com/${event.repo.name}/commit/${commit.sha}`
                    });
                }
            }
        }

        return commits.slice(0, limit);
    }

    // NEW: Fetch user events
    async fetchUserEvents(): Promise<GitHubEvent[]> {
        await this.ensureValidToken(this.config);

        const username = this.cachedUser?.login || (await this.fetchUser()).login;

        const response = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return response.json();
    }

    // NEW: Fetch open PRs created by user
    async fetchOpenPRs(): Promise<GitHubPullRequest[]> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://api.github.com/search/issues?q=is:pr+is:open+author:@me&per_page=50', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    }

    // NEW: Fetch merged PRs (this week)
    async fetchMergedPRsThisWeek(): Promise<number> {
        await this.ensureValidToken(this.config);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const dateStr = weekAgo.toISOString().split('T')[0];

        const response = await fetch(`https://api.github.com/search/issues?q=is:pr+is:merged+author:@me+merged:>=${dateStr}&per_page=1`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) return 0;

        const data = await response.json();
        return data.total_count || 0;
    }

    // NEW: Generate contribution data from events
    async generateContributionData(): Promise<ContributionDay[][]> {
        const events = await this.fetchUserEvents();
        const contributionMap = new Map<string, number>();

        // Count contributions by date
        for (const event of events) {
            const date = event.created_at.split('T')[0];
            const count = contributionMap.get(date) || 0;

            let points = 1;
            if (event.type === 'PushEvent') points = event.payload.commits?.length || 1;
            else if (event.type === 'PullRequestEvent') points = 3;
            else if (event.type === 'IssuesEvent') points = 2;

            contributionMap.set(date, count + points);
        }

        // Generate 52 weeks of data
        const weeks: ContributionDay[][] = [];
        const today = new Date();

        for (let week = 51; week >= 0; week--) {
            const weekData: ContributionDay[] = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (week * 7 + (6 - day)));
                const dateStr = date.toISOString().split('T')[0];
                const count = contributionMap.get(dateStr) || 0;
                const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;

                weekData.push({
                    date: dateStr,
                    count,
                    level: level as 0 | 1 | 2 | 3 | 4
                });
            }
            weeks.push(weekData);
        }

        return weeks;
    }

    // NEW: Calculate coding streak
    calculateStreak(contributionData: ContributionDay[][]): number {
        const allDays = contributionData.flat().reverse();
        let streak = 0;

        // Skip today if no contributions yet
        const startIdx = allDays[0]?.count === 0 ? 1 : 0;

        for (let i = startIdx; i < allDays.length; i++) {
            if (allDays[i].count > 0) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // NEW: Get complete dashboard data
    async getDashboardData(forceRefresh = false): Promise<GitHubDashboardData> {
        // Return cached data if fresh (less than 5 minutes old)
        if (!forceRefresh && this.cachedDashboardData && this.lastDashboardFetch) {
            const ageMs = Date.now() - this.lastDashboardFetch.getTime();
            if (ageMs < 5 * 60 * 1000) {
                return this.cachedDashboardData;
            }
        }

        await this.ensureValidToken(this.config);

        // Fetch all data in parallel
        const [
            user,
            repositories,
            assignedIssues,
            reviewRequests,
            openPRs,
            recentEvents,
            contributionData,
            mergedThisWeek
        ] = await Promise.all([
            this.cachedUser || this.fetchUser(),
            this.cachedRepos.length > 0 ? this.cachedRepos : this.fetchRepositories(),
            this.fetchAssignedIssues(),
            this.fetchReviewRequests(),
            this.fetchOpenPRs(),
            this.fetchUserEvents(),
            this.generateContributionData(),
            this.fetchMergedPRsThisWeek()
        ]);

        // Extract commits from recent push events
        const recentCommits: GitHubCommit[] = [];
        for (const event of recentEvents.filter(e => e.type === 'PushEvent').slice(0, 10)) {
            if (event.payload.commits) {
                for (const commit of event.payload.commits.slice(0, 3)) {
                    recentCommits.push({
                        sha: commit.sha,
                        message: commit.message,
                        author: { name: commit.author?.name || '', email: '', date: event.created_at },
                        committer: { name: '', email: '', date: event.created_at },
                        html_url: `https://github.com/${event.repo.name}/commit/${commit.sha}`
                    });
                }
            }
        }

        // Calculate stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const commitsThisWeek = recentEvents.filter(e =>
            e.type === 'PushEvent' && new Date(e.created_at) >= weekAgo
        ).reduce((sum, e) => sum + (e.payload.commits?.length || 0), 0);

        const streak = this.calculateStreak(contributionData);

        this.cachedDashboardData = {
            user,
            repositories: repositories.slice(0, 10),
            recentCommits: recentCommits.slice(0, 10),
            openPRs,
            reviewRequests,
            assignedIssues,
            recentEvents: recentEvents.slice(0, 20),
            contributionData,
            stats: {
                totalCommitsThisWeek: commitsThisWeek,
                totalPRsThisMonth: mergedThisWeek,
                totalIssuesClosed: 0, // Would need additional API call
                linesAdded: 0,
                linesDeleted: 0,
                streak
            }
        };

        this.lastDashboardFetch = new Date();
        return this.cachedDashboardData;
    }

    private async syncIssueAsTask(issue: GitHubIssue): Promise<void> {
        // Convert GitHub issue to Wakey task
        console.log('Syncing GitHub issue as task:', issue.title);
    }

    private async syncPRAsTask(pr: GitHubPullRequest): Promise<void> {
        // Convert GitHub PR to Wakey task
        console.log('Syncing GitHub PR as task:', pr.title);
    }

    async getIssuesForRepo(owner: string, repo: string): Promise<GitHubIssue[]> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const issues = await response.json();
        this.cachedIssues.set(`${owner}/${repo}`, issues);
        return issues;
    }

    async createIssue(owner: string, repo: string, title: string, body?: string): Promise<GitHubIssue> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body })
        });

        if (!response.ok) {
            throw new Error(`Failed to create issue: ${response.status}`);
        }

        return response.json();
    }

    async closeIssue(owner: string, repo: string, issueNumber: number): Promise<void> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ state: 'closed' })
        });

        if (!response.ok) {
            throw new Error(`Failed to close issue: ${response.status}`);
        }
    }

    getRepositories(): GitHubRepository[] {
        return this.cachedRepos;
    }

    getUser(): GitHubUserStats | null {
        return this.cachedUser;
    }

}

export const githubIntegration = new GitHubIntegration();

