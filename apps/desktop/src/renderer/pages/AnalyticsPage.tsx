import { useState, useEffect } from 'react';
import {
    BarChart3, Clock, Target, TrendingUp,
    Download, FileJson, FileText, Printer
} from 'lucide-react';
import { exportToCSV, exportToJSON, exportToPDF } from '../services/export-service';

interface DayStats {
    [key: string]: string | number;
    date: string;
    focusMinutes: number;
    distractions: number;
    sessions: number;
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [stats, setStats] = useState({
        focusTime: 0,
        sessions: 0,
        distractions: 0,
        topApps: [] as { app: string; minutes: number }[],
    });
    const [weekData, setWeekData] = useState<DayStats[]>([]);

    useEffect(() => {
        loadStats();
        loadRealData();
    }, [period]);

    const loadStats = async () => {
        if (!window.wakey) return;
        try {
            const data = await window.wakey.getTodayStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadRealData = async () => {
        if (!window.wakey) return;

        try {
            const today = new Date();
            let startDate: Date;

            // Calculate date range based on period
            switch (period) {
                case 'day':
                    startDate = new Date(today);
                    break;
                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    break;
                case 'month':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 29);
                    break;
                default:
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
            }

            const startStr = startDate.toISOString().split('T')[0];
            const endStr = today.toISOString().split('T')[0];

            // Fetch real data from the store
            const rangeStats = await window.wakey.getStatsRange(startStr, endStr);

            // Build complete date range (fill in missing days with zero values)
            const days: DayStats[] = [];
            const dayCount = period === 'day' ? 1 : period === 'week' ? 7 : 30;

            for (let i = dayCount - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // Find real data for this date
                const realData = rangeStats.find((s: { date: string }) => s.date === dateStr);

                days.push({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    focusMinutes: realData?.focusMinutes || 0,
                    distractions: realData?.distractions || 0,
                    sessions: realData?.sessions || 0,
                });
            }

            setWeekData(days);
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            // Fallback to empty data
            setWeekData([]);
        }
    };

    const handleExportCSV = () => {
        exportToCSV(weekData, 'wakey-analytics', [
            { key: 'date', header: 'Date' },
            { key: 'focusMinutes', header: 'Focus (min)' },
            { key: 'sessions', header: 'Sessions' },
            { key: 'distractions', header: 'Distractions' },
        ]);
        setShowExportMenu(false);
    };

    const handleExportJSON = () => {
        exportToJSON({
            exportedAt: new Date().toISOString(),
            period,
            summary: {
                totalFocusMinutes: weekData.reduce((sum, d) => sum + d.focusMinutes, 0),
                totalSessions: weekData.reduce((sum, d) => sum + d.sessions, 0),
                totalDistractions: weekData.reduce((sum, d) => sum + d.distractions, 0),
            },
            dailyData: weekData,
        }, 'wakey-analytics');
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        exportToPDF('analytics-content', 'wakey-analytics', 'Wakey Analytics Report');
        setShowExportMenu(false);
    };

    const maxFocus = Math.max(...weekData.map(d => d.focusMinutes), 1);
    const totalWeekFocus = weekData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const avgDailyFocus = Math.round(totalWeekFocus / 7);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6" id="analytics-content">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-dark-400">Track your productivity trends</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-dark-800 rounded-lg p-1">
                        {(['day', 'week', 'month'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === p
                                    ? 'bg-primary-500 text-white'
                                    : 'text-dark-400 hover:text-white'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            <span className="text-sm">Export</span>
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
                                <button
                                    onClick={handleExportCSV}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-dark-700 rounded-t-lg"
                                >
                                    <FileText className="w-4 h-4 text-green-400" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={handleExportJSON}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-dark-700"
                                >
                                    <FileJson className="w-4 h-4 text-blue-400" />
                                    Export as JSON
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-dark-700 rounded-b-lg"
                                >
                                    <Printer className="w-4 h-4 text-purple-400" />
                                    Print / PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-primary-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Total Focus</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(totalWeekFocus)}</div>
                    <div className="text-xs text-dark-500 mt-1">This week</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Target className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Avg Daily</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(avgDailyFocus)}</div>
                    <div className="text-xs text-dark-500 mt-1">Per day</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Sessions</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {weekData.reduce((sum, d) => sum + d.sessions, 0)}
                    </div>
                    <div className="text-xs text-dark-500 mt-1">Completed</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Focus Score</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {Math.max(0, 100 - stats.distractions * 5)}%
                    </div>
                    <div className="text-xs text-dark-500 mt-1">Today</div>
                </div>
            </div>

            {/* Focus Chart */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-white mb-4">Weekly Focus Time</h2>

                <div className="flex items-end gap-2 h-48">
                    {weekData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col justify-end h-40">
                                <div
                                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500"
                                    style={{ height: `${(day.focusMinutes / maxFocus) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-dark-400">{day.date}</span>
                            <span className="text-xs text-dark-500">{formatTime(day.focusMinutes)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* App Usage & Distractions */}
            <div className="grid grid-cols-2 gap-4">
                {/* Top Apps */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Top Apps Today</h2>

                    {stats.topApps.length === 0 ? (
                        <p className="text-dark-400 text-sm">No activity recorded yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topApps.slice(0, 5).map((app, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-dark-500 text-sm w-6">{i + 1}.</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-white text-sm">{app.app}</span>
                                            <span className="text-dark-400 text-sm">{app.minutes}m</span>
                                        </div>
                                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 rounded-full"
                                                style={{ width: `${(app.minutes / (stats.topApps[0]?.minutes || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Distraction Summary */}
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Distraction Summary</h2>

                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <div className="text-5xl font-bold text-white mb-2">
                                {stats.distractions}
                            </div>
                            <div className="text-dark-400">Distractions today</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-dark-900 rounded-lg p-3">
                                <div className="text-xl font-semibold text-white">
                                    {weekData.reduce((sum, d) => sum + d.distractions, 0)}
                                </div>
                                <div className="text-xs text-dark-400">This week</div>
                            </div>
                            <div className="bg-dark-900 rounded-lg p-3">
                                <div className="text-xl font-semibold text-white">
                                    {Math.round(weekData.reduce((sum, d) => sum + d.distractions, 0) / 7)}
                                </div>
                                <div className="text-xs text-dark-400">Daily avg</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
