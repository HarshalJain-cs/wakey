import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Star, ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatar?: string;
    score: number;
    change: 'up' | 'down' | 'same';
    streak: number;
    isCurrentUser: boolean;
}

type TimeRange = 'today' | 'week' | 'month' | 'allTime';

const TIME_RANGES: { id: TimeRange; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'allTime', label: 'All Time' },
];

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Crown className="w-4 h-4 text-white" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <Medal className="w-4 h-4 text-white" />
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                <Medal className="w-4 h-4 text-white" />
            </div>
        );
    }
    return (
        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
            <span className="text-sm font-bold text-dark-300">#{rank}</span>
        </div>
    );
}

// Change indicator
function ChangeIndicator({ change }: { change: 'up' | 'down' | 'same' }) {
    if (change === 'up') {
        return <ArrowUp className="w-3 h-3 text-green-400" />;
    }
    if (change === 'down') {
        return <ArrowDown className="w-3 h-3 text-red-400" />;
    }
    return <Minus className="w-3 h-3 text-dark-500" />;
}

// Leaderboard row
function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
    return (
        <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${entry.isCurrentUser
                ? 'bg-primary-500/10 border border-primary-500/30'
                : 'hover:bg-dark-700/50'
            }`}>
            <RankBadge rank={entry.rank} />

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {entry.avatar || entry.displayName.charAt(0).toUpperCase()}
            </div>

            {/* Name and streak */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-primary-400' : 'text-white'
                        }`}>
                        {entry.displayName}
                        {entry.isCurrentUser && <span className="text-xs text-dark-400 ml-1">(You)</span>}
                    </span>
                    {entry.streak >= 7 && (
                        <span className="text-xs text-orange-400">🔥{entry.streak}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs text-dark-500">
                    <ChangeIndicator change={entry.change} />
                    <span>{entry.change === 'up' ? 'Moving up' : entry.change === 'down' ? 'Dropped' : 'Steady'}</span>
                </div>
            </div>

            {/* Score */}
            <div className="text-right">
                <div className="text-sm font-bold text-white">{entry.score.toLocaleString()}</div>
                <div className="text-xs text-dark-500">points</div>
            </div>
        </div>
    );
}

export default function LeaderboardWidget() {
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, [timeRange]);

    const loadLeaderboard = async () => {
        setLoading(true);

        // Simulate loading - in production, fetch from server
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock leaderboard data
        const mockEntries: LeaderboardEntry[] = [
            { rank: 1, userId: '1', displayName: 'ProductivityPro', score: 12450, change: 'up', streak: 21, isCurrentUser: false },
            { rank: 2, userId: '2', displayName: 'FocusMaster', score: 11200, change: 'same', streak: 14, isCurrentUser: false },
            { rank: 3, userId: '3', displayName: 'DeepWorker', score: 10890, change: 'up', streak: 7, isCurrentUser: false },
            { rank: 4, userId: '4', displayName: 'You', score: 9750, change: 'up', streak: 5, isCurrentUser: true },
            { rank: 5, userId: '5', displayName: 'TaskNinja', score: 9200, change: 'down', streak: 3, isCurrentUser: false },
            { rank: 6, userId: '6', displayName: 'FlowState', score: 8900, change: 'same', streak: 0, isCurrentUser: false },
            { rank: 7, userId: '7', displayName: 'ZenCoder', score: 8650, change: 'up', streak: 2, isCurrentUser: false },
        ];

        setEntries(mockEntries);
        setCurrentUserRank(mockEntries.find(e => e.isCurrentUser)?.rank || null);
        setLoading(false);
    };

    return (
        <div className="widget-card h-full flex flex-col">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Leaderboard
                </span>
                <button
                    onClick={loadLeaderboard}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-dark-700 text-dark-400 hover:bg-dark-600 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-1 mb-3 p-1 bg-dark-900/50 rounded-lg">
                {TIME_RANGES.map(range => (
                    <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${timeRange === range.id
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white hover:bg-dark-700'
                            }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Current User Position */}
            {currentUserRank && (
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20 mb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-dark-300">Your Rank</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-400">#{currentUserRank}</span>
                        <span className="text-xs text-dark-500">of {entries.length}</span>
                    </div>
                </div>
            )}

            {/* Leaderboard List */}
            <div className="flex-1 space-y-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    entries.map(entry => (
                        <LeaderboardRow key={entry.userId} entry={entry} />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-dark-700">
                <div className="flex items-center justify-between text-xs text-dark-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{entries.length} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>Updated hourly</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
