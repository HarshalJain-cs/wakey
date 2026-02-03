import { useState, useEffect, useCallback } from 'react';
import {
    Code, GitBranch, GitCommit, GitPullRequest,
    Clock, FolderGit, FileCode,
    Terminal, Coffee, Flame, BarChart3, Github, ExternalLink,
    TrendingUp, AlertTriangle, CheckCircle,
    Eye, Bug, Shield, Layers, Database, Cpu, LineChart,
    Award, Brain, GitMerge,
    RefreshCw, Star, AlertCircle, Loader2
} from 'lucide-react';
import { githubService } from '../services/github-integration-service';

// GitHub data interfaces
interface ContributionDay {
    date: string;
    count: number;
    level: number;
}

interface GitHubDashboardData {
    user: {
        login: string;
        avatar_url: string;
        name: string;
        bio: string;
        public_repos: number;
        followers: number;
        following: number;
    };
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    streak: number;
    contributionData: ContributionDay[][];
    totalContributions: number;
    recentCommits: Array<{
        sha: string;
        message: string;
        date: string;
        repo: string;
        url?: string;
    }>;
    repositories: Array<{
        name: string;
        description: string;
        stars: number;
        forks: number;
        language: string;
    }>;
    languageBreakdown: Array<{
        name: string;
        color: string;
        percentage: number;
    }>;
}

interface CodingSession {
    id: number;
    project: string;
    language: string;
    duration: number;
    commits: number;
    date: string;
}

interface LanguageStats {
    language: string;
    minutes: number;
    color: string;
}

interface CodeMetrics {
    linesWritten: number;
    linesDeleted: number;
    filesChanged: number;
    complexity: number;
    testCoverage: number;
    techDebt: number;
}

export default function DeveloperDashboard() {
    const [currentProject] = useState('wakey');
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [commits, setCommits] = useState(0);
    const [productivityScore] = useState(87);
    const [flowTimeHours] = useState(4.2);
    const [sessions] = useState<CodingSession[]>([
        { id: 1, project: 'wakey', language: 'TypeScript', duration: 120, commits: 5, date: new Date().toISOString() },
        { id: 2, project: 'api-server', language: 'Python', duration: 45, commits: 2, date: new Date().toISOString() },
        { id: 3, project: 'wakey', language: 'React', duration: 90, commits: 8, date: new Date().toISOString() },
    ]);

    // Real GitHub data state
    const [githubData, setGithubData] = useState<GitHubDashboardData | null>(null);
    const [githubLoading, setGithubLoading] = useState(false);
    const [githubConnected, setGithubConnected] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const [codeMetrics] = useState<CodeMetrics>({
        linesWritten: 2847,
        linesDeleted: 892,
        filesChanged: 47,
        complexity: 32,
        testCoverage: 78,
        techDebt: 12
    });

    const languageStats: LanguageStats[] = [
        { language: 'TypeScript', minutes: 240, color: '#3178c6' },
        { language: 'Python', minutes: 90, color: '#3776ab' },
        { language: 'JavaScript', minutes: 60, color: '#f7df1e' },
        { language: 'CSS', minutes: 30, color: '#264de4' },
        { language: 'React', minutes: 120, color: '#61dafb' },
        { language: 'SQL', minutes: 45, color: '#00758f' },
    ];

    const radarData = [
        { skill: 'Frontend', score: 85 },
        { skill: 'Backend', score: 72 },
        { skill: 'Database', score: 65 },
        { skill: 'DevOps', score: 58 },
        { skill: 'Testing', score: 78 },
        { skill: 'Security', score: 62 },
    ];

    // Load GitHub data using GraphQL for full year contributions
    const loadGitHubData = useCallback(async (_forceRefresh: boolean = false) => {
        const config = githubService.getConfig();
        if (!config.accessToken) {
            setGithubConnected(false);
            return;
        }

        setGithubLoading(true);
        if (_forceRefresh) {
            setLastRefresh(null);
        }
        try {
            // Fetch user data first to get login
            const userResponse = await window.wakey.fetchGitHub('/user', config.accessToken);
            if (!userResponse.ok) throw new Error('Failed to fetch user');
            const user = userResponse.data;
            const username = user.login;

            // GraphQL query for full year contribution data
            const graphqlQuery = `
                query {
                    user(login: "${username}") {
                        contributionsCollection {
                            contributionCalendar {
                                totalContributions
                                weeks {
                                    contributionDays {
                                        date
                                        contributionCount
                                        contributionLevel
                                    }
                                }
                            }
                            totalCommitContributions
                            totalPullRequestContributions
                            totalIssueContributions
                            totalRepositoryContributions
                        }
                        repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
                            nodes {
                                name
                                description
                                stargazerCount
                                forkCount
                                primaryLanguage {
                                    name
                                    color
                                }
                                updatedAt
                            }
                        }
                        repositoriesContributedTo(first: 100, contributionTypes: [COMMIT]) {
                            nodes {
                                primaryLanguage {
                                    name
                                    color
                                }
                            }
                        }
                    }
                }
            `;

            if (!window.wakey?.fetchGitHubGraphQL) {
                throw new Error('GitHub GraphQL bridge not available (preload not loaded)');
            }
            const graphqlResponse = await window.wakey.fetchGitHubGraphQL(graphqlQuery, config.accessToken);

            let contributionData: ContributionDay[][] = [];
            let totalContributions = 0;
            let totalCommits = 0;
            let totalPRs = 0;
            let totalIssues = 0;
            let repositories: any[] = [];
            let languageBreakdown: any[] = [];

            if (graphqlResponse.ok && graphqlResponse.data?.data?.user) {
                const userData = graphqlResponse.data.data.user;
                const calendar = userData.contributionsCollection?.contributionCalendar;
                const contributions = userData.contributionsCollection;

                // Parse contribution calendar (52 weeks = 1 year)
                if (calendar?.weeks) {
                    contributionData = calendar.weeks.map((week: any) =>
                        week.contributionDays.map((day: any) => ({
                            date: day.date,
                            count: day.contributionCount,
                            level: day.contributionLevel === 'NONE' ? 0 :
                                day.contributionLevel === 'FIRST_QUARTILE' ? 1 :
                                    day.contributionLevel === 'SECOND_QUARTILE' ? 2 :
                                        day.contributionLevel === 'THIRD_QUARTILE' ? 3 : 4
                        }))
                    );
                    totalContributions = calendar.totalContributions;
                }

                // Get contribution stats
                totalCommits = contributions?.totalCommitContributions || 0;
                totalPRs = contributions?.totalPullRequestContributions || 0;
                totalIssues = contributions?.totalIssueContributions || 0;

                // Parse repos
                repositories = userData.repositories?.nodes?.map((r: any) => ({
                    name: r.name,
                    description: r.description || '',
                    stars: r.stargazerCount,
                    forks: r.forkCount,
                    language: r.primaryLanguage?.name || 'Unknown'
                })) || [];

                // Calculate language breakdown from repos
                const langMap = new Map<string, { count: number; color: string }>();
                const allRepos = [...(userData.repositories?.nodes || []), ...(userData.repositoriesContributedTo?.nodes || [])];
                allRepos.forEach((r: any) => {
                    if (r.primaryLanguage?.name) {
                        const existing = langMap.get(r.primaryLanguage.name);
                        langMap.set(r.primaryLanguage.name, {
                            count: (existing?.count || 0) + 1,
                            color: r.primaryLanguage.color || '#666'
                        });
                    }
                });
                const totalLangRepos = Array.from(langMap.values()).reduce((sum, l) => sum + l.count, 0);
                languageBreakdown = Array.from(langMap.entries())
                    .map(([name, data]) => ({
                        name,
                        color: data.color,
                        percentage: Math.round((data.count / totalLangRepos) * 100)
                    }))
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 6);
            }

            // Fetch recent events for commits list
            const eventsResponse = await window.wakey.fetchGitHub('/users/' + username + '/events?per_page=30', config.accessToken);
            const events = eventsResponse.ok ? eventsResponse.data : [];
            const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
            const recentCommits = pushEvents.slice(0, 10).flatMap((e: any) =>
                (e.payload.commits || []).map((c: any) => ({
                    sha: c.sha?.slice(0, 7) || '',
                    message: c.message?.split('\n')[0] || '',
                    date: e.created_at,
                    repo: e.repo?.name?.split('/')[1] || 'unknown',
                    url: e.repo?.name ? `https://github.com/${e.repo.name}/commit/${c.sha}` : undefined
                }))
            ).slice(0, 10);

            // Calculate streak from contribution data
            const streak = calculateStreakFromContributions(contributionData);

            const dashboardData: GitHubDashboardData = {
                user,
                totalCommits,
                totalPRs,
                totalIssues,
                streak,
                contributionData,
                totalContributions,
                recentCommits,
                repositories,
                languageBreakdown
            };

            setGithubData(dashboardData);
            setGithubConnected(true);
            setLastRefresh(new Date());
            setCommits(totalCommits);
        } catch (error) {
            console.error('Failed to load GitHub data:', error);
            setGithubConnected(false);
        } finally {
            setGithubLoading(false);
        }
    }, []);

    // Calculate streak from contribution data
    const calculateStreakFromContributions = (weeks: ContributionDay[][]): number => {
        const allDays = weeks.flat().reverse(); // Most recent first
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];

        for (const day of allDays) {
            // Skip future days
            if (day.date > today) continue;

            if (day.count > 0) {
                streak++;
            } else if (day.date < today) {
                // Break streak on first zero day (except today)
                break;
            }
        }
        return streak;
    };

    useEffect(() => {
        loadStats();
        // Try to load GitHub data
        if (githubService.isConnected()) {
            loadGitHubData();
        }

        // Auto-refresh every 5 minutes for real-time updates
        const refreshInterval = setInterval(() => {
            if (githubService.isConnected()) {
                loadGitHubData();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [loadGitHubData]);

    const loadStats = async () => {
        if (!window.wakey) return;
        try {
            const stats = await window.wakey.getTodayStats();
            setTodayMinutes(stats.focusTime);
            setCommits(Math.floor(stats.sessions * 2));
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const totalWeekMinutes = sessions.reduce((sum, s) => sum + s.duration, 0) + todayMinutes;
    const totalLanguageMinutes = languageStats.reduce((sum, l) => sum + l.minutes, 0);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getContributionColor = (level: number) => {
        const colors = ['bg-dark-700', 'bg-green-900/60', 'bg-green-700/70', 'bg-green-500', 'bg-green-400'];
        return colors[level] || colors[0];
    };

    // Use real GitHub contribution data or generate mock
    const contributionData = githubData?.contributionData || generateMockContributionData();

    function generateMockContributionData(): ContributionDay[][] {
        const weeks: ContributionDay[][] = [];
        const today = new Date();

        for (let week = 51; week >= 0; week--) {
            const weekData: ContributionDay[] = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (week * 7 + (6 - day)));
                const count = Math.floor(Math.random() * 15);
                const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
                weekData.push({
                    date: date.toISOString().split('T')[0],
                    count,
                    level: level as 0 | 1 | 2 | 3 | 4
                });
            }
            weeks.push(weekData);
        }
        return weeks;
    }

    // Calculate real stats from GitHub data
    const githubStats = {
        activePRs: githubData?.totalPRs ?? 0,
        weeklyCommits: githubData?.totalCommits ?? 0,
        totalContributions: githubData?.totalContributions ?? 0,
        prsMerged: githubData?.totalPRs ?? 0,
        reviewsPending: 0,
        issuesAssigned: githubData?.totalIssues ?? 0,
        streak: githubData?.streak ?? 0,
        repos: githubData?.repositories?.length ?? 0
    };

    // Handle Open GitHub link
    const openGitHubProfile = () => {
        const username = githubData?.user?.login || githubService.getConfig().username;
        if (username) {
            window.open(`https://github.com/${username}`, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Code className="w-7 h-7 text-primary-400" />
                        Developer Dashboard
                    </h1>
                    <p className="text-dark-400">Track your coding sessions and productivity</p>
                </div>

                <div className="flex items-center gap-3">
                    {githubConnected && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg">
                            <Github className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Connected</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
                        <Award className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">{productivityScore}% Productivity</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-semibold">
                            {githubConnected ? githubStats.streak : 7} day streak
                        </span>
                    </div>
                </div>
            </div>

            {/* Active Project & Productivity Score */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-primary-500/20 border border-primary-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/30 rounded-lg">
                            <FolderGit className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <div className="text-sm text-dark-400">Current Project</div>
                            <div className="text-xl font-semibold text-white">{currentProject}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{formatTime(todayMinutes)}</div>
                            <div className="text-xs text-dark-400">Today</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                                {githubConnected ? githubStats.weeklyCommits : commits}
                            </div>
                            <div className="text-xs text-dark-400">Commits</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">{flowTimeHours}h</div>
                            <div className="text-xs text-dark-400">Flow Time</div>
                        </div>
                    </div>
                </div>

                {/* Productivity Score Card */}
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                            <circle
                                cx="48" cy="48" r="40" fill="none"
                                stroke="url(#productivityGradient)"
                                strokeWidth="8"
                                strokeDasharray={`${productivityScore * 2.51} 251`}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{productivityScore}</span>
                        </div>
                    </div>
                    <div className="text-sm text-dark-400 mt-2">Productivity Score</div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-dark-400 text-xs">Weekly</span>
                    </div>
                    <div className="text-xl font-bold text-white">{formatTime(totalWeekMinutes)}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <GitCommit className="w-4 h-4 text-green-400" />
                        <span className="text-dark-400 text-xs">Commits</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                        {githubConnected ? githubStats.weeklyCommits : sessions.reduce((sum, s) => sum + s.commits, 0) + commits}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-dark-400 text-xs">Lines Written</span>
                    </div>
                    <div className="text-xl font-bold text-white">{codeMetrics.linesWritten.toLocaleString()}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span className="text-dark-400 text-xs">Files Changed</span>
                    </div>
                    <div className="text-xl font-bold text-white">{codeMetrics.filesChanged}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-dark-400 text-xs">Test Coverage</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">{codeMetrics.testCoverage}%</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-dark-400 text-xs">Tech Debt</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">{codeMetrics.techDebt}h</div>
                </div>
            </div>

            {/* Contribution Heatmap - Real Data */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Github className="w-5 h-5 text-green-400" />
                        GitHub Integration
                        {githubConnected && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-2">
                                Live Data
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        {lastRefresh && (
                            <span className="text-xs text-dark-500">
                                Updated {formatRelativeTime(lastRefresh.toISOString())}
                            </span>
                        )}
                        <button
                            onClick={() => loadGitHubData()}
                            disabled={githubLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm text-dark-300 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${githubLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={openGitHubProfile}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm text-dark-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open GitHub
                        </button>
                    </div>
                </div>

                {/* GitHub Stats Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-400">{githubStats.weeklyCommits}</div>
                        <div className="text-xs text-dark-400">Commits</div>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-purple-400">{githubStats.activePRs}</div>
                        <div className="text-xs text-dark-400">PRs</div>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-yellow-400">{githubStats.issuesAssigned}</div>
                        <div className="text-xs text-dark-400">Issues</div>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-cyan-400">{githubStats.streak}</div>
                        <div className="text-xs text-dark-400">Streak</div>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-pink-400">{githubStats.repos}</div>
                        <div className="text-xs text-dark-400">Repos</div>
                    </div>
                </div>

                {/* Contribution Calendar - Full Year like GitHub */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-dark-400">
                            {githubStats.totalContributions} contributions in the last year
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(level => (
                            <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
                        ))}
                        <span>More</span>
                    </div>
                </div>

                {/* Month Labels */}
                <div className="flex gap-1 mb-1">
                    <div className="w-6" /> {/* Spacer for day labels */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                        <div key={month} className="text-[10px] text-dark-500" style={{ width: `${100 / 12}%`, minWidth: '30px' }}>
                            {month}
                        </div>
                    ))}
                </div>

                {/* Contribution Grid */}
                <div className="flex gap-[2px] overflow-x-auto pb-2">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[2px] mr-1">
                        <div className="h-[10px]" />
                        <div className="h-[10px] text-[9px] text-dark-500">Mon</div>
                        <div className="h-[10px]" />
                        <div className="h-[10px] text-[9px] text-dark-500">Wed</div>
                        <div className="h-[10px]" />
                        <div className="h-[10px] text-[9px] text-dark-500">Fri</div>
                        <div className="h-[10px]" />
                    </div>

                    {/* Weeks */}
                    {contributionData.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-[2px]">
                            {week.map((day, dayIdx) => (
                                <div
                                    key={dayIdx}
                                    className={`w-[10px] h-[10px] rounded-[2px] ${getContributionColor(day.level)} cursor-pointer hover:ring-1 hover:ring-white/30 transition-all`}
                                    title={`${day.date}: ${day.count} contributions`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Breakdown, Skill Radar & Recent Sessions */}
            <div className="grid grid-cols-3 gap-4">
                {/* Language Breakdown */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary-400" />
                        Languages
                    </h2>
                    <div className="space-y-3">
                        {languageStats.map((lang) => (
                            <div key={lang.language} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white">{lang.language}</span>
                                    <span className="text-dark-400">{formatTime(lang.minutes)}</span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${(lang.minutes / totalLanguageMinutes) * 100}%`,
                                            backgroundColor: lang.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Radar Chart */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Skill Distribution
                    </h2>
                    <div className="relative h-48 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {[1, 2, 3, 4].map(ring => (
                                <div
                                    key={ring}
                                    className="absolute border border-dark-600 rounded-full"
                                    style={{ width: `${ring * 40}px`, height: `${ring * 40}px` }}
                                />
                            ))}
                        </div>
                        {radarData.map((skill, i) => {
                            const angle = (i * 360 / radarData.length - 90) * (Math.PI / 180);
                            return (
                                <div
                                    key={skill.skill}
                                    className="absolute text-xs text-dark-400"
                                    style={{
                                        left: `${50 + Math.cos(angle) * 45}%`,
                                        top: `${50 + Math.sin(angle) * 45}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    {skill.skill}
                                </div>
                            );
                        })}
                        <div className="w-2 h-2 bg-primary-500 rounded-full absolute" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        {radarData.map(skill => (
                            <div key={skill.skill} className="flex justify-between">
                                <span className="text-dark-400">{skill.skill}</span>
                                <span className="text-white">{skill.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary-400" />
                        Recent Sessions
                    </h2>
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: languageStats.find(l => l.language === session.language)?.color || '#888',
                                        }}
                                    />
                                    <div>
                                        <div className="text-white text-sm">{session.project}</div>
                                        <div className="text-xs text-dark-400">{session.language}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white text-sm">{formatTime(session.duration)}</div>
                                    <div className="text-xs text-dark-400">{session.commits} commits</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Daily Activity Chart & Code Quality */}
            <div className="grid grid-cols-2 gap-4">
                {/* Daily Activity Chart */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-400" />
                        This Week's Activity
                    </h2>
                    <div className="flex items-end gap-2 h-32">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                            const height = [60, 85, 45, 90, 75, 20, 40][i];
                            const minutes = Math.round(height * 2.5);
                            const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex flex-col justify-end h-24 relative">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {Math.round(minutes)} min
                                        </div>
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer
                                                ${isToday ? 'bg-primary-500' : 'bg-primary-500/40'}
                                                hover:scale-x-110 hover:brightness-125 hover:shadow-lg hover:shadow-primary-500/30`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs transition-colors ${isToday ? 'text-primary-400' : 'text-dark-400 group-hover:text-white'}`}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Code Quality Metrics */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Code Quality Metrics
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-dark-900 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-dark-400">Complexity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">{codeMetrics.complexity}</div>
                                <span className="text-xs text-green-400">↓ 8%</span>
                            </div>
                            <div className="mt-2 h-1 bg-dark-700 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${100 - codeMetrics.complexity}%` }} />
                            </div>
                        </div>

                        <div className="p-4 bg-dark-900 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-dark-400">Code Review</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">94%</div>
                                <span className="text-xs text-green-400">↑ 3%</span>
                            </div>
                            <div className="mt-2 h-1 bg-dark-700 rounded-full">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '94%' }} />
                            </div>
                        </div>

                        <div className="p-4 bg-dark-900 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Bug className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-dark-400">Bug Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">2.3%</div>
                                <span className="text-xs text-red-400">↑ 0.5%</span>
                            </div>
                            <div className="mt-2 h-1 bg-dark-700 rounded-full">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '2.3%' }} />
                            </div>
                        </div>

                        <div className="p-4 bg-dark-900 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-dark-400">DB Queries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">1.2ms</div>
                                <span className="text-xs text-green-400">↓ 25%</span>
                            </div>
                            <div className="mt-2 h-1 bg-dark-700 rounded-full">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '88%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GitHub Integration - Real Data */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Github className="w-5 h-5 text-primary-400" />
                        GitHub Integration
                        {githubConnected && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                Real-Time
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadGitHubData(true)}
                            disabled={githubLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
                        >
                            {githubLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>
                        <button
                            onClick={() => window.open('https://github.com', '_blank')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open GitHub
                        </button>
                    </div>
                </div>

                {/* GitHub User Profile (if connected) */}
                {githubData?.user && (
                    <div className="flex items-center gap-4 p-4 bg-dark-900 rounded-lg mb-4 border border-dark-600">
                        <img
                            src={githubData.user.avatar_url}
                            alt={githubData.user.name}
                            className="w-12 h-12 rounded-full border-2 border-primary-500/50"
                        />
                        <div className="flex-1">
                            <div className="text-white font-semibold">{githubData.user.name}</div>
                            <div className="text-sm text-dark-400">@{githubData.user.login}</div>
                        </div>
                        <div className="flex items-center gap-6 text-center">
                            <div>
                                <div className="text-xl font-bold text-white">{githubData.user.public_repos}</div>
                                <div className="text-xs text-dark-400">Repos</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">{githubData.user.followers}</div>
                                <div className="text-xs text-dark-400">Followers</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">{githubData.user.following}</div>
                                <div className="text-xs text-dark-400">Following</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-5 gap-4">
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                        <div className="text-2xl font-bold text-white mb-1">{githubStats.activePRs}</div>
                        <div className="text-sm text-dark-400 flex items-center gap-1">
                            <GitPullRequest className="w-3 h-3" />
                            Active PRs
                        </div>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                        <div className="text-2xl font-bold text-white mb-1">{githubStats.weeklyCommits}</div>
                        <div className="text-sm text-dark-400 flex items-center gap-1">
                            <GitCommit className="w-3 h-3" />
                            Weekly Commits
                        </div>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                        <div className="text-2xl font-bold text-white mb-1">{githubStats.issuesAssigned}</div>
                        <div className="text-sm text-dark-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Assigned Issues
                        </div>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                        <div className="text-2xl font-bold text-green-400 mb-1">{githubStats.prsMerged}</div>
                        <div className="text-sm text-dark-400 flex items-center gap-1">
                            <GitMerge className="w-3 h-3" />
                            PRs Merged
                        </div>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">{githubStats.reviewsPending}</div>
                        <div className="text-sm text-dark-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Reviews Pending
                        </div>
                    </div>
                </div>

                {/* Recent Commits - Real Data */}
                <div className="mt-4 space-y-2">
                    <div className="text-sm text-dark-400 flex items-center justify-between">
                        <span>Recent Commits</span>
                        {githubData?.recentCommits && (
                            <span className="text-xs text-dark-500">
                                Showing {Math.min(githubData.recentCommits.length, 5)} of {githubData.recentCommits.length}
                            </span>
                        )}
                    </div>
                    {(githubData?.recentCommits || []).slice(0, 5).map((commit, idx) => (
                        <div key={commit.sha || idx} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg hover:bg-dark-900/80 transition-colors">
                            <GitCommit className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm truncate">{commit.message}</div>
                                <div className="text-xs text-dark-500">
                                    {formatRelativeTime(commit.date)} • {commit.sha?.slice(0, 7)}
                                </div>
                            </div>
                            {commit.url && (
                                <a
                                    href={commit.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-dark-700 rounded transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-dark-400" />
                                </a>
                            )}
                        </div>
                    ))}
                    {(!githubData?.recentCommits || githubData.recentCommits.length === 0) && (
                        <>
                            <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                                <GitCommit className="w-4 h-4 text-green-400" />
                                <div className="flex-1">
                                    <div className="text-white text-sm">feat: Add advanced developer analytics dashboard</div>
                                    <div className="text-xs text-dark-500">2 hours ago • main</div>
                                </div>
                                <GitMerge className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                                <GitCommit className="w-4 h-4 text-green-400" />
                                <div className="flex-1">
                                    <div className="text-white text-sm">fix: Team collaboration service improvements</div>
                                    <div className="text-xs text-dark-500">4 hours ago • main</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                                <GitCommit className="w-4 h-4 text-green-400" />
                                <div className="flex-1">
                                    <div className="text-white text-sm">refactor: Task dependency service optimization</div>
                                    <div className="text-xs text-dark-500">6 hours ago • feature/phase-4</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Top Repositories */}
                {githubData?.repositories && githubData.repositories.length > 0 && (
                    <div className="mt-4">
                        <div className="text-sm text-dark-400 mb-2">Top Repositories</div>
                        <div className="grid grid-cols-3 gap-2">
                            {githubData.repositories.slice(0, 6).map(repo => (
                                <div
                                    key={repo.name}
                                    className="p-3 bg-dark-900 rounded-lg hover:bg-dark-900/80 border border-dark-600 transition-colors"
                                >
                                    <div className="text-white text-sm font-medium truncate">{repo.name}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                                        {repo.language && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                                {repo.language}
                                            </span>
                                        )}
                                        {repo.stars !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                {repo.stars}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
                <button className="p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <GitPullRequest className="w-5 h-5 text-primary-400" />
                    <span className="text-white">Pull Requests</span>
                </button>
                <button className="p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <Coffee className="w-5 h-5 text-primary-400" />
                    <span className="text-white">Generate Standup</span>
                </button>
                <button className="p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <GitBranch className="w-5 h-5 text-primary-400" />
                    <span className="text-white">Branch Overview</span>
                </button>
                <button className="p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <LineChart className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Detailed Analytics</span>
                </button>
            </div>
        </div >
    );
}
