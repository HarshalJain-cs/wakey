import { useState, useEffect } from 'react';
import {
    BarChart3, Clock, Target, TrendingUp, TrendingDown,
    Download, FileJson, FileText, Printer, Globe, Monitor,
    ArrowUp, ArrowDown, Calendar
} from 'lucide-react';
import { exportToCSV, exportToJSON, exportToPDF } from '../services/export-service';
import { AnimatedPieChart, AnimatedBarChart, AnimatedLineChart, HeatmapChart } from '../components/charts';
import { CHART_COLORS } from '../constants/chart-colors';

interface DayStats {
    [key: string]: string | number;
    date: string;
    focusMinutes: number;
    distractions: number;
    sessions: number;
}

type Period = 'day' | 'week' | 'month' | 'all';

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<Period>('week');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [_stats, setStats] = useState({
        focusTime: 0,
        sessions: 0,
        distractions: 0,
        topApps: [] as { app: string; minutes: number }[],
    });
    const [weekData, setWeekData] = useState<DayStats[]>([]);
    const [topWebsites, setTopWebsites] = useState<{ name: string; minutes: number; isDistraction: boolean }[]>([]);
    const [topApps, setTopApps] = useState<{ name: string; minutes: number; isDistraction: boolean }[]>([]);
    const [categoryData, setCategoryData] = useState<{ name: string; minutes: number }[]>([]);
    const [productiveData, setProductiveData] = useState({ productive: 0, distracting: 0 });
    const [heatmapData, setHeatmapData] = useState<{ day: string; hour: number; value: number }[]>([]);
    const [weekComparison, setWeekComparison] = useState<{
        thisWeek: { focusMinutes: number; distractions: number };
        lastWeek: { focusMinutes: number; distractions: number };
        change: { focusPercent: number; distractionsPercent: number };
    } | null>(null);
    const [allTimeStats, setAllTimeStats] = useState<{
        totalFocusMinutes: number;
        totalDistractingMinutes: number;
        totalDistractions: number;
        completedSessions: number;
        avgQuality: number;
        firstDate: string | null;
        lastDate: string | null;
        totalDays: number;
    } | null>(null);

    useEffect(() => {
        loadStats();
        loadEnhancedData();
    }, [period]);

    const getDateRange = () => {
        const today = new Date();
        let startDate: Date;

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
            case 'all':
                return { startStr: undefined, endStr: undefined };
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);
        }

        return {
            startStr: startDate.toISOString().split('T')[0],
            endStr: today.toISOString().split('T')[0],
        };
    };

    const loadStats = async () => {
        if (!window.wakey) return;
        try {
            const data = await window.wakey.getTodayStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadEnhancedData = async () => {
        if (!window.wakey) return;

        try {
            const { startStr, endStr } = getDateRange();

            // Load all data in parallel
            const [
                websites,
                apps,
                categories,
                productive,
                heatmap,
                comparison,
                allTime,
                rangeStats,
            ] = await Promise.all([
                window.wakey.getTopWebsites?.(10, startStr, endStr) || [],
                window.wakey.getTopApps?.(10, startStr, endStr) || [],
                window.wakey.getCategoryBreakdown?.(startStr, endStr) || [],
                window.wakey.getProductiveVsDistracting?.(startStr, endStr) || { productive: 0, distracting: 0 },
                window.wakey.getHourlyHeatmap?.(startStr, endStr) || [],
                window.wakey.getWeekComparison?.() || null,
                window.wakey.getAllTimeStats?.() || null,
                startStr ? window.wakey.getStatsRange(startStr, endStr!) : Promise.resolve([]),
            ]);

            setTopWebsites(websites);
            setTopApps(apps);
            setCategoryData(categories);
            setProductiveData(productive);
            setHeatmapData(heatmap);
            setWeekComparison(comparison);
            setAllTimeStats(allTime);

            // Build week data with filled days
            if (rangeStats && Array.isArray(rangeStats)) {
                const today = new Date();
                const dayCount = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 7;
                const days: DayStats[] = [];

                for (let i = dayCount - 1; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const realData = rangeStats.find((s: { date: string }) => s.date === dateStr);

                    days.push({
                        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        focusMinutes: realData?.focusMinutes || 0,
                        distractions: realData?.distractions || 0,
                        sessions: realData?.sessions || 0,
                    });
                }

                setWeekData(days);
            }
        } catch (error) {
            console.error('Failed to load enhanced analytics:', error);
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
            topApps,
            topWebsites,
            categoryBreakdown: categoryData,
        }, 'wakey-analytics');
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        exportToPDF('analytics-content', 'wakey-analytics', 'Wakey Analytics Report');
        setShowExportMenu(false);
    };

    const totalFocus = weekData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const avgDailyFocus = weekData.length > 0 ? Math.round(totalFocus / weekData.length) : 0;

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    // Prepare chart data
    const lineChartData = weekData.map(d => ({
        name: d.date,
        value: d.focusMinutes,
    }));

    const productiveChartData = [
        { name: 'Productive', value: productiveData.productive, color: CHART_COLORS.productive },
        { name: 'Distracting', value: productiveData.distracting, color: CHART_COLORS.distracting },
    ].filter(d => d.value > 0);

    const categoryChartData = categoryData.map(c => ({
        name: c.name,
        value: c.minutes,
    }));

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
                        {(['day', 'week', 'month', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === p
                                    ? 'bg-primary-500 text-white'
                                    : 'text-dark-400 hover:text-white'
                                    }`}
                            >
                                {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
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
                    <div className="text-2xl font-bold text-white">
                        {formatTime(period === 'all' && allTimeStats ? allTimeStats.totalFocusMinutes : totalFocus)}
                    </div>
                    <div className="text-xs text-dark-500 mt-1">
                        {period === 'all' ? `${allTimeStats?.totalDays || 0} days tracked` : `This ${period}`}
                    </div>
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
                        {period === 'all' && allTimeStats ? allTimeStats.completedSessions : weekData.reduce((sum, d) => sum + d.sessions, 0)}
                    </div>
                    <div className="text-xs text-dark-500 mt-1">Completed</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            {weekComparison && weekComparison.change.focusPercent >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                        </div>
                        <span className="text-dark-400 text-sm">vs Last Week</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${weekComparison && weekComparison.change.focusPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {weekComparison ? `${weekComparison.change.focusPercent >= 0 ? '+' : ''}${weekComparison.change.focusPercent}%` : '0%'}
                        </div>
                        {weekComparison && weekComparison.change.focusPercent >= 0 ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                        )}
                    </div>
                    <div className="text-xs text-dark-500 mt-1">Focus time change</div>
                </div>
            </div>

            {/* Focus Trend & Productive vs Distracting */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <AnimatedLineChart
                        data={lineChartData}
                        title="Focus Time Trend"
                        height={250}
                        lineColor={CHART_COLORS.primary}
                    />
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <AnimatedPieChart
                        data={productiveChartData}
                        title="Productive vs Distracting"
                        height={250}
                        innerRadius={50}
                    />
                </div>
            </div>

            {/* Top Apps & Top Websites */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Top 10 Apps</h2>
                    </div>
                    {topApps.length === 0 ? (
                        <p className="text-dark-400 text-sm">No app activity recorded yet</p>
                    ) : (
                        <AnimatedBarChart
                            data={topApps.map(a => ({
                                name: a.name,
                                value: a.minutes,
                                color: a.isDistraction ? CHART_COLORS.distracting : CHART_COLORS.primary,
                            }))}
                            horizontal
                            height={300}
                        />
                    )}
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Top 10 Websites</h2>
                    </div>
                    {topWebsites.length === 0 ? (
                        <p className="text-dark-400 text-sm">No website activity recorded yet</p>
                    ) : (
                        <AnimatedBarChart
                            data={topWebsites.map(w => ({
                                name: w.name,
                                value: w.minutes,
                                color: w.isDistraction ? CHART_COLORS.distracting : CHART_COLORS.primary,
                            }))}
                            horizontal
                            height={300}
                        />
                    )}
                </div>
            </div>

            {/* Category Breakdown & Heatmap */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <AnimatedPieChart
                        data={categoryChartData}
                        title="Time by Category"
                        height={300}
                        showLegend
                    />
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <HeatmapChart
                        data={heatmapData}
                        title="Activity Heatmap"
                        height={300}
                        colorScale="teal"
                    />
                </div>
            </div>

            {/* Week Comparison */}
            {weekComparison && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Week-over-Week Comparison</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">This Week Focus</div>
                            <div className="text-2xl font-bold text-white">
                                {formatTime(weekComparison.thisWeek.focusMinutes)}
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Last Week Focus</div>
                            <div className="text-2xl font-bold text-white">
                                {formatTime(weekComparison.lastWeek.focusMinutes)}
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">This Week Distractions</div>
                            <div className="text-2xl font-bold text-white">
                                {weekComparison.thisWeek.distractions}
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Distraction Change</div>
                            <div className={`text-2xl font-bold ${weekComparison.change.distractionsPercent <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {weekComparison.change.distractionsPercent <= 0 ? '' : '+'}{weekComparison.change.distractionsPercent}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Time Stats */}
            {period === 'all' && allTimeStats && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">All Time Statistics</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Total Focus Time</div>
                            <div className="text-2xl font-bold text-primary-400">
                                {formatTime(allTimeStats.totalFocusMinutes)}
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Total Sessions</div>
                            <div className="text-2xl font-bold text-white">
                                {allTimeStats.completedSessions}
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Avg Quality</div>
                            <div className="text-2xl font-bold text-white">
                                {allTimeStats.avgQuality}%
                            </div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4 text-center">
                            <div className="text-dark-400 text-sm mb-1">Days Tracked</div>
                            <div className="text-2xl font-bold text-white">
                                {allTimeStats.totalDays}
                            </div>
                        </div>
                    </div>
                    {allTimeStats.firstDate && allTimeStats.lastDate && (
                        <div className="mt-4 text-center text-dark-500 text-sm">
                            Tracking since {new Date(allTimeStats.firstDate).toLocaleDateString()} to {new Date(allTimeStats.lastDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
