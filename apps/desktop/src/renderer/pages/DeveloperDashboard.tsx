import { useState, useEffect } from 'react';
import {
    Code, GitBranch, GitCommit, GitPullRequest,
    Clock, Zap, FolderGit, FileCode,
    Terminal, Coffee, Flame, BarChart3
} from 'lucide-react';

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

export default function DeveloperDashboard() {
    const [currentProject] = useState('wakey');
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [commits, setCommits] = useState(0);
    const [streak] = useState(7);
    const [sessions] = useState<CodingSession[]>([
        { id: 1, project: 'wakey', language: 'TypeScript', duration: 120, commits: 5, date: new Date().toISOString() },
        { id: 2, project: 'api-server', language: 'Python', duration: 45, commits: 2, date: new Date().toISOString() },
    ]);

    const languageStats: LanguageStats[] = [
        { language: 'TypeScript', minutes: 240, color: '#3178c6' },
        { language: 'Python', minutes: 90, color: '#3776ab' },
        { language: 'JavaScript', minutes: 60, color: '#f7df1e' },
        { language: 'CSS', minutes: 30, color: '#264de4' },
    ];

    useEffect(() => {
        // Load stats from tracking data
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const stats = await window.wakey.getTodayStats();
            setTodayMinutes(stats.focusTime);
            // In real app, would track git commits via hooks
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-semibold">{streak} day streak</span>
                    </div>
                </div>
            </div>

            {/* Active Project */}
            <div className="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4 flex items-center justify-between">
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
                        <div className="text-2xl font-bold text-white">{commits}</div>
                        <div className="text-xs text-dark-400">Commits</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Weekly Coding</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(totalWeekMinutes)}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <GitCommit className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Total Commits</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {sessions.reduce((sum, s) => sum + s.commits, 0) + commits}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FolderGit className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Projects</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {new Set(sessions.map(s => s.project)).size}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Avg Session</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatTime(Math.round(totalWeekMinutes / Math.max(sessions.length, 1)))}
                    </div>
                </div>
            </div>

            {/* Language Breakdown & Recent Activity */}
            <div className="grid grid-cols-2 gap-4">
                {/* Language Breakdown */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary-400" />
                        Language Breakdown
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
                                        className="h-full rounded-full"
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

            {/* Daily Activity Chart */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-400" />
                    This Week's Activity
                </h2>
                <div className="flex items-end gap-2 h-32">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const height = [60, 85, 45, 90, 75, 20, 40][i];
                        const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col justify-end h-24">
                                    <div
                                        className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-primary-500' : 'bg-primary-500/40'}`}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className={`text-xs ${isToday ? 'text-primary-400' : 'text-dark-400'}`}>{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <button className="flex-1 p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <GitPullRequest className="w-5 h-5 text-primary-400" />
                    <span className="text-white">View Pull Requests</span>
                </button>
                <button className="flex-1 p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <Coffee className="w-5 h-5 text-primary-400" />
                    <span className="text-white">Generate Standup</span>
                </button>
                <button className="flex-1 p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors flex items-center justify-center gap-3">
                    <GitBranch className="w-5 h-5 text-primary-400" />
                    <span className="text-white">Branch Overview</span>
                </button>
            </div>
        </div>
    );
}
