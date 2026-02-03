import { useState, useEffect } from 'react';
import { Clock, Zap, Target, Flame, Activity, Coffee, Award } from 'lucide-react';
import { streakService } from '../services/streak-service';
import { enhancedPomodoroService } from '../services/enhanced-pomodoro-service';

interface QuickStat {
    id: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: {
        direction: 'up' | 'down' | 'same';
        value: string;
    };
}

export default function QuickStatsBar() {
    const [stats, setStats] = useState<QuickStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Get real data from services
                const pomodoroStats = await enhancedPomodoroService.getSessionStats();
                const totalStreakScore = streakService.getTotalStreakScore();
                const activeStreaks = streakService.getActiveStreaks();

                // Find the longest active streak for display
                const longestStreak = activeStreaks.reduce((max, s) =>
                    s.currentStreak > max.currentStreak ? s : max,
                    { currentStreak: 0, type: 'focus-goal' as const, longestStreak: 0, lastActiveDate: '', isActive: false }
                );

                // Format focus time
                const formatTime = (minutes: number) => {
                    const h = Math.floor(minutes / 60);
                    const m = minutes % 60;
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                };

                // Calculate trends (would use historical data in production)
                const focusTrend = pomodoroStats.todayMinutes > pomodoroStats.averageMinutes ? 'up' :
                    pomodoroStats.todayMinutes < pomodoroStats.averageMinutes ? 'down' : 'same';
                const focusTrendValue = focusTrend === 'same' ? '0%' :
                    `${focusTrend === 'up' ? '+' : '-'}${Math.abs(Math.round((pomodoroStats.todayMinutes - pomodoroStats.averageMinutes) / pomodoroStats.averageMinutes * 100))}%`;

                setStats([
                    {
                        id: 'focus',
                        label: 'Focus Today',
                        value: formatTime(pomodoroStats.todayMinutes || 0),
                        icon: <Clock className="w-4 h-4" />,
                        color: 'text-primary-400',
                        trend: { direction: focusTrend as 'up' | 'down' | 'same', value: focusTrendValue }
                    },
                    {
                        id: 'sessions',
                        label: 'Sessions',
                        value: String(pomodoroStats.todaySessions || 0),
                        icon: <Target className="w-4 h-4" />,
                        color: 'text-green-400',
                        trend: pomodoroStats.todaySessions > 0 ? { direction: 'up', value: `+${pomodoroStats.todaySessions}` } : undefined
                    },
                    {
                        id: 'streak',
                        label: 'Streak',
                        value: longestStreak.currentStreak > 0 ? `${longestStreak.currentStreak} days` : '0 days',
                        icon: <Flame className="w-4 h-4" />,
                        color: 'text-orange-400'
                    },
                    {
                        id: 'score',
                        label: 'Daily Score',
                        value: String(pomodoroStats.productivityScore || 0),
                        icon: <Zap className="w-4 h-4" />,
                        color: 'text-yellow-400',
                        trend: { direction: 'same', value: '0' }
                    },
                    {
                        id: 'completed',
                        label: 'Completed',
                        value: `${pomodoroStats.completedSessions || 0}/${pomodoroStats.totalSessions || 0}`,
                        icon: <Activity className="w-4 h-4" />,
                        color: 'text-blue-400',
                        trend: pomodoroStats.completedSessions > 0 ? { direction: 'up', value: `+${pomodoroStats.completedSessions}` } : undefined
                    },
                    {
                        id: 'breaks',
                        label: 'Breaks Taken',
                        value: String(pomodoroStats.breaksTaken || 0),
                        icon: <Coffee className="w-4 h-4" />,
                        color: 'text-purple-400'
                    },
                    {
                        id: 'xp',
                        label: 'Streak Score',
                        value: `+${totalStreakScore}`,
                        icon: <Award className="w-4 h-4" />,
                        color: 'text-pink-400',
                        trend: totalStreakScore > 0 ? { direction: 'up', value: '🔥' } : undefined
                    }
                ]);
            } catch (error) {
                console.error('Failed to load quick stats:', error);
                // Fallback to empty stats
                setStats([
                    { id: 'focus', label: 'Focus Today', value: '0m', icon: <Clock className="w-4 h-4" />, color: 'text-primary-400' },
                    { id: 'sessions', label: 'Sessions', value: '0', icon: <Target className="w-4 h-4" />, color: 'text-green-400' },
                    { id: 'streak', label: 'Streak', value: '0 days', icon: <Flame className="w-4 h-4" />, color: 'text-orange-400' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadStats();

        // Refresh every 30 seconds
        const interval = setInterval(loadStats, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-dark-600">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-32 h-16 bg-dark-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-dark-600">
            {stats.map(stat => (
                <div
                    key={stat.id}
                    className="flex-shrink-0 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 hover:border-dark-600 transition-colors group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className={stat.color}>{stat.icon}</span>
                        <span className="text-xs text-dark-400">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{stat.value}</span>
                        {stat.trend && (
                            <span className={`text-xs ${stat.trend.direction === 'up' ? 'text-green-400' :
                                stat.trend.direction === 'down' ? 'text-red-400' :
                                    'text-dark-500'
                                }`}>
                                {stat.trend.value}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
