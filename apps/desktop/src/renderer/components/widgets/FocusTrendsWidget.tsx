import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Brain, Clock, Zap, Calendar } from 'lucide-react';
import { focusTrendsService, DailyStats } from '../../services/focus-trends-service';

interface FocusTrendsWidgetProps {
    className?: string;
}

export default function FocusTrendsWidget({ className = '' }: FocusTrendsWidgetProps) {
    const [trendData, setTrendData] = useState<DailyStats[]>([]);
    const [weekSummary, setWeekSummary] = useState<ReturnType<typeof focusTrendsService.getWeeklySummary> | null>(null);

    useEffect(() => {
        // Load real data from store via IPC
        const loadRealData = async () => {
            if (!window.wakey) {
                // Fallback to local service if wakey API not available
                const existingData = focusTrendsService.getDailyStats(7);
                setTrendData(existingData);
                setWeekSummary(focusTrendsService.getWeeklySummary());
                return;
            }

            try {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);

                const startStr = startDate.toISOString().split('T')[0];
                const endStr = today.toISOString().split('T')[0];

                // Fetch real data from the store
                const rangeStats = await window.wakey.getStatsRange(startStr, endStr);

                // Convert to DailyStats format
                const realData: DailyStats[] = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];

                    const dayData = rangeStats.find((s: { date: string }) => s.date === dateStr);

                    // Calculate focus score from real metrics
                    const focusMinutes = dayData?.focusMinutes || 0;
                    const distractions = dayData?.distractions || 0;
                    const sessions = dayData?.sessions || 0;

                    // Focus score calculation: base 50, +1 per 6 min focus, -5 per distraction, capped 0-100
                    const baseScore = Math.min(100, 50 + Math.floor(focusMinutes / 6));
                    const focusScore = Math.max(0, Math.min(100, baseScore - (distractions * 5)));

                    realData.push({
                        date: dateStr,
                        focusScore,
                        focusMinutes,
                        distractionMinutes: distractions * 5, // Estimate 5 min per distraction
                        deepWorkSessions: sessions,
                        contextSwitches: Math.floor(distractions * 1.5),
                        breaksTaken: Math.floor(sessions * 0.8),
                    });

                    // Also record in local service for persistence
                    focusTrendsService.recordDailyStats({
                        focusScore,
                        focusMinutes,
                        distractionMinutes: distractions * 5,
                        deepWorkSessions: sessions,
                        contextSwitches: Math.floor(distractions * 1.5),
                        breaksTaken: Math.floor(sessions * 0.8),
                    });
                }

                setTrendData(realData);
                setWeekSummary(focusTrendsService.getWeeklySummary());
            } catch (error) {
                console.error('Failed to load focus trends:', error);
                // Fallback to local service
                setTrendData(focusTrendsService.getDailyStats(7));
                setWeekSummary(focusTrendsService.getWeeklySummary());
            }
        };

        loadRealData();
    }, []);

    const maxScore = Math.max(...trendData.map(d => d.focusScore), 100);
    const maxMinutes = Math.max(...trendData.map(d => d.focusMinutes), 300);

    const formatDay = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className={`bg-dark-800 rounded-xl border border-dark-700 p-5 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-400" />
                    Focus Score Trends
                </h3>
                <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-dark-400" />
                    <span className="text-dark-400">Last 7 days</span>
                </div>
            </div>

            {/* Weekly Summary Cards */}
            {weekSummary && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-dark-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4 text-primary-400" />
                            <span className="text-xs text-dark-400">Avg Score</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white">
                                {Math.round(weekSummary.thisWeek.avgScore)}
                            </span>
                            {weekSummary.improvement !== 0 && (
                                <span className={`text-xs flex items-center ${weekSummary.improvement > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {weekSummary.improvement > 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-0.5" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 mr-0.5" />
                                    )}
                                    {Math.abs(Math.round(weekSummary.improvement))}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-dark-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span className="text-xs text-dark-400">Focus Time</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {Math.round(weekSummary.thisWeek.focusMinutes / 60)}h
                        </div>
                    </div>

                    <div className="bg-dark-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-dark-400">Deep Work</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {weekSummary.thisWeek.deepWorkSessions}
                        </div>
                    </div>
                </div>
            )}

            {/* Focus Score Chart */}
            <div className="mb-4">
                <div className="flex items-end gap-1.5 h-32">
                    {trendData.map((day, i) => {
                        const height = (day.focusScore / maxScore) * 100;
                        const isToday = i === trendData.length - 1;

                        return (
                            <div
                                key={day.date}
                                className="flex-1 flex flex-col items-center gap-1"
                            >
                                <div
                                    className="w-full relative group cursor-pointer"
                                    style={{ height: '100px' }}
                                >
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t-lg transition-all ${isToday
                                                ? 'bg-gradient-to-t from-primary-600 to-primary-400'
                                                : 'bg-gradient-to-t from-dark-600 to-dark-500 hover:from-primary-600/50 hover:to-primary-400/50'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    />

                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        <div className="font-semibold text-white">{day.focusScore}</div>
                                        <div className="text-dark-400">{Math.round(day.focusMinutes / 60)}h focus</div>
                                    </div>
                                </div>
                                <span className={`text-xs ${isToday ? 'text-primary-400 font-medium' : 'text-dark-500'}`}>
                                    {isToday ? 'Today' : formatDay(day.date)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Focus Minutes Mini Chart */}
            <div className="pt-3 border-t border-dark-700">
                <div className="flex items-center justify-between text-xs text-dark-400 mb-2">
                    <span>Daily Focus Minutes</span>
                    <span>This week</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                    {trendData.map((day) => {
                        const height = (day.focusMinutes / maxMinutes) * 100;
                        return (
                            <div
                                key={day.date}
                                className="flex-1 bg-teal-500/30 rounded-sm hover:bg-teal-500/50 transition-colors"
                                style={{ height: `${height}%` }}
                                title={`${Math.round(day.focusMinutes / 60)}h ${day.focusMinutes % 60}m`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
