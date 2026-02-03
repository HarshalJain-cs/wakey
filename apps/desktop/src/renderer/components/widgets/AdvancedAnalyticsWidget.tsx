import { useState, useEffect } from 'react';
import {
    TrendingUp, Activity, Target, Zap, Clock,
    ArrowUp, ArrowDown
} from 'lucide-react';

interface WeeklyTrend {
    day: string;
    focusTime: number;
    productivity: number;
    distractions: number;
}

interface CategoryBreakdown {
    category: string;
    minutes: number;
    color: string;
    percentage: number;
}

export default function AdvancedAnalyticsWidget() {
    const [activeTab, setActiveTab] = useState<'trends' | 'breakdown' | 'insights'>('trends');
    const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
    const [productivityChange, setProductivityChange] = useState(0);
    const [focusTimeChange, setFocusTimeChange] = useState(0);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        // Generate sample weekly trends
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const trends = days.map((day) => ({
            day,
            focusTime: Math.floor(Math.random() * 180) + 60,
            productivity: Math.floor(Math.random() * 30) + 65,
            distractions: Math.floor(Math.random() * 15)
        }));
        setWeeklyTrends(trends);

        // Category breakdown
        const categories: CategoryBreakdown[] = [
            { category: 'Development', minutes: 245, color: '#22c55e', percentage: 0 },
            { category: 'Communication', minutes: 85, color: '#3b82f6', percentage: 0 },
            { category: 'Research', minutes: 62, color: '#8b5cf6', percentage: 0 },
            { category: 'Planning', minutes: 48, color: '#f59e0b', percentage: 0 },
            { category: 'Other', minutes: 30, color: '#6b7280', percentage: 0 },
        ];
        const total = categories.reduce((sum, c) => sum + c.minutes, 0);
        categories.forEach(c => c.percentage = Math.round((c.minutes / total) * 100));
        setCategoryBreakdown(categories);

        // Calculate changes
        setProductivityChange(12);
        setFocusTimeChange(-5);
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const maxFocusTime = Math.max(...weeklyTrends.map(t => t.focusTime), 1);

    return (
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-400" />
                    Advanced Analytics
                </h2>

                {/* Tabs */}
                <div className="flex gap-1 bg-dark-900 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`px-3 py-1.5 text-xs rounded ${activeTab === 'trends' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'}`}
                    >
                        Trends
                    </button>
                    <button
                        onClick={() => setActiveTab('breakdown')}
                        className={`px-3 py-1.5 text-xs rounded ${activeTab === 'breakdown' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'}`}
                    >
                        Breakdown
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`px-3 py-1.5 text-xs rounded ${activeTab === 'insights' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'}`}
                    >
                        Insights
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'trends' && (
                <div className="space-y-5">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-900 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-dark-400 text-xs">Productivity</span>
                                <span className={`flex items-center text-xs ${productivityChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {productivityChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {Math.abs(productivityChange)}%
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white mt-2">87%</div>
                        </div>
                        <div className="bg-dark-900 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-dark-400 text-xs">Focus Time</span>
                                <span className={`flex items-center text-xs ${focusTimeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {focusTimeChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {Math.abs(focusTimeChange)}%
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white mt-2">6h 42m</div>
                        </div>
                    </div>

                    {/* Weekly Chart - Increased height for better spacing */}
                    <div className="h-48 bg-dark-900/30 rounded-lg p-4">
                        <div className="flex items-end justify-between h-36 gap-3">
                            {weeklyTrends.map((trend, idx) => {
                                const height = (trend.focusTime / maxFocusTime) * 100;
                                const isToday = idx === new Date().getDay() - 1 || (new Date().getDay() === 0 && idx === 6);
                                return (
                                    <div key={`trend-${idx}`} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full flex flex-col justify-end h-28 relative">
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {formatTime(trend.focusTime)}
                                            </div>
                                            <div
                                                className={`w-full rounded-t transition-all duration-300 cursor-pointer
                                                    ${isToday ? 'bg-gradient-to-t from-primary-500 to-cyan-500' : 'bg-primary-500/40'}
                                                    hover:brightness-125`}
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs ${isToday ? 'text-primary-400 font-semibold' : 'text-dark-500'}`}>
                                            {trend.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'breakdown' && (
                <div className="space-y-4">
                    {/* Donut Chart Representation */}
                    <div className="flex items-center gap-6">
                        <div className="relative w-28 h-28">
                            <svg className="w-28 h-28 transform -rotate-90">
                                {categoryBreakdown.reduce((acc, cat) => {
                                    const offset = acc.offset;
                                    acc.offset += cat.percentage * 2.51;
                                    acc.circles.push(
                                        <circle
                                            key={cat.category}
                                            cx="56" cy="56" r="48" fill="none"
                                            stroke={cat.color}
                                            strokeWidth="12"
                                            strokeDasharray={`${cat.percentage * 3.01} 302`}
                                            strokeDashoffset={-offset * 1.2}
                                            className="transition-all duration-500"
                                        />
                                    );
                                    return acc;
                                }, { circles: [] as JSX.Element[], offset: 0 }).circles}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                    {formatTime(categoryBreakdown.reduce((sum, c) => sum + c.minutes, 0))}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            {categoryBreakdown.map(cat => (
                                <div key={cat.category} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-sm text-dark-400 flex-1">{cat.category}</span>
                                    <span className="text-sm text-white font-medium">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar breakdown */}
                    <div className="space-y-3 mt-4">
                        {categoryBreakdown.map(cat => (
                            <div key={cat.category}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-dark-400">{cat.category}</span>
                                    <span className="text-white">{formatTime(cat.minutes)}</span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="space-y-4">
                    {/* AI-Generated Insights */}
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">Peak Performance</span>
                        </div>
                        <p className="text-sm text-dark-300">
                            Your productivity peaks between 9-11 AM. Consider scheduling deep work during this window.
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-400">Break Pattern</span>
                        </div>
                        <p className="text-sm text-dark-300">
                            You're averaging 3.2 hours between breaks. Try the 52/17 rule for better focus.
                        </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Goal Progress</span>
                        </div>
                        <p className="text-sm text-dark-300">
                            You're on track to hit your weekly focus goal. Keep up the momentum!
                        </p>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">Energy Optimization</span>
                        </div>
                        <p className="text-sm text-dark-300">
                            Tuesday and Thursday show highest energy. Plan important meetings accordingly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
