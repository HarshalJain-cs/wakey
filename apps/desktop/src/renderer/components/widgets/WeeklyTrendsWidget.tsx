import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, ArrowRight } from 'lucide-react';

interface DayData {
    day: string;
    focusMinutes: number;
    sessions: number;
    score: number;
}

interface WeeklyData {
    days: DayData[];
    totalFocusMinutes: number;
    totalSessions: number;
    averageScore: number;
    comparisonToLastWeek: number; // percentage change
    bestDay: string;
    peakHours: string;
}

// Mini bar chart for daily focus time
function DailyBarChart({ days }: { days: DayData[] }) {
    const maxMinutes = Math.max(...days.map(d => d.focusMinutes), 60);

    return (
        <div className="flex items-end justify-between gap-1 h-24 px-2">
            {days.map((day, i) => {
                const height = (day.focusMinutes / maxMinutes) * 100;
                const isToday = i === days.length - 1;

                return (
                    <div key={`day-${i}`} className="flex flex-col items-center gap-1 flex-1">
                        <div className="text-xs text-dark-500">{Math.round(day.focusMinutes)}m</div>
                        <div className="w-full flex flex-col justify-end h-16">
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 ${isToday
                                    ? 'bg-gradient-to-t from-primary-500 to-primary-400'
                                    : 'bg-gradient-to-t from-dark-600 to-dark-500'
                                    }`}
                                style={{ height: `${Math.max(height, 5)}%` }}
                            />
                        </div>
                        <div className={`text-xs ${isToday ? 'text-primary-400 font-semibold' : 'text-dark-500'}`}>
                            {day.day}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Weekly score trend line
function WeeklyScoreTrend({ days }: { days: DayData[] }) {
    const scores = days.map(d => d.score);
    const maxScore = 100;
    const points = scores.map((score, i) => ({
        x: (i / (scores.length - 1)) * 100,
        y: 100 - (score / maxScore) * 100
    }));

    const pathD = points.map((p, i) =>
        i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ');

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend = scores[scores.length - 1] - scores[0];

    return (
        <div className="p-3 bg-dark-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-dark-300">Weekly Score Trend</span>
                </div>
                <div className="flex items-center gap-1">
                    {trend >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? '+' : ''}{trend}
                    </span>
                </div>
            </div>

            <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Trend line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="url(#trendGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>

                {/* Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill={i === points.length - 1 ? '#14b8a6' : '#a855f7'}
                        className="transition-all duration-300"
                    />
                ))}
            </svg>

            <div className="flex justify-between text-xs text-dark-500 mt-1">
                <span>Avg: {avgScore}</span>
                <span>Today: {scores[scores.length - 1]}</span>
            </div>
        </div>
    );
}

export default function WeeklyTrendsWidget() {
    const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWeeklyData = async () => {
            // Simulate loading data - in production, fetch from API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate realistic mock data for the week
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const today = new Date().getDay();
            const mockDays: DayData[] = dayNames.slice(0, today === 0 ? 7 : today).map((day, i) => ({
                day,
                focusMinutes: Math.floor(Math.random() * 180) + 30,
                sessions: Math.floor(Math.random() * 6) + 1,
                score: Math.floor(Math.random() * 40) + 50
            }));

            // Add today with higher values
            if (today > 0) {
                mockDays.push({
                    day: dayNames[today - 1 < 0 ? 6 : today - 1],
                    focusMinutes: Math.floor(Math.random() * 120) + 60,
                    sessions: 5,
                    score: 78
                });
            }

            const totalFocus = mockDays.reduce((sum, d) => sum + d.focusMinutes, 0);
            const totalSessions = mockDays.reduce((sum, d) => sum + d.sessions, 0);
            const avgScore = Math.round(mockDays.reduce((sum, d) => sum + d.score, 0) / mockDays.length);
            const bestDayIdx = mockDays.reduce((best, d, i) => d.focusMinutes > mockDays[best].focusMinutes ? i : best, 0);

            setWeeklyData({
                days: mockDays,
                totalFocusMinutes: totalFocus,
                totalSessions: totalSessions,
                averageScore: avgScore,
                comparisonToLastWeek: 12, // +12% vs last week
                bestDay: mockDays[bestDayIdx]?.day || 'N/A',
                peakHours: '9-11 AM'
            });
            setLoading(false);
        };

        loadWeeklyData();
    }, []);

    const formatHours = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    Weekly Trends
                </span>
                <span className="text-xs text-dark-500">This Week</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : weeklyData && (
                <div className="space-y-4">
                    {/* Weekly Summary Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-dark-900/50 rounded-lg">
                            <div className="text-xs text-dark-400">Total Focus</div>
                            <div className="text-xl font-bold text-white">
                                {formatHours(weeklyData.totalFocusMinutes)}
                            </div>
                            <div className={`text-xs flex items-center gap-1 mt-1 ${weeklyData.comparisonToLastWeek >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {weeklyData.comparisonToLastWeek >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {weeklyData.comparisonToLastWeek}% vs last week
                            </div>
                        </div>

                        <div className="p-3 bg-dark-900/50 rounded-lg">
                            <div className="text-xs text-dark-400">Avg Score</div>
                            <div className="text-xl font-bold text-primary-400">
                                {weeklyData.averageScore}
                            </div>
                            <div className="text-xs text-dark-500 mt-1">
                                Best: {weeklyData.bestDay}
                            </div>
                        </div>
                    </div>

                    {/* Daily Focus Bar Chart */}
                    <div className="p-3 bg-dark-900/30 rounded-lg">
                        <div className="text-xs text-dark-400 mb-2">Daily Focus Time</div>
                        <DailyBarChart days={weeklyData.days} />
                    </div>

                    {/* Score Trend */}
                    <WeeklyScoreTrend days={weeklyData.days} />

                    {/* Insights */}
                    <div className="p-3 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-dark-400">Peak Productivity</div>
                                <div className="text-sm font-medium text-white">{weeklyData.peakHours}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
