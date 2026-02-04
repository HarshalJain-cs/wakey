import { useState, useEffect } from 'react';
import {
    FileText, TrendingUp, TrendingDown, Target,
    Trophy, Clock, Zap, Brain, ChevronRight, RefreshCw,
    Calendar, Flame, AlertTriangle, Sparkles
} from 'lucide-react';

interface WeeklyReport {
    weekRange: string;
    focusHours: { current: number; previous: number; goal: number };
    productivityScore: { current: number; previous: number };
    tasksCompleted: number;
    streakDays: number;
    achievements: string[];
    topInsight: string;
    recommendations: string[];
    highlights: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
}

export default function AIReportWidget() {
    const [report, setReport] = useState<WeeklyReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Simulate fetching weekly report
        generateReport();
    }, []);

    const generateReport = async () => {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);

        setReport({
            weekRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            focusHours: { current: 24.5, previous: 21.2, goal: 25 },
            productivityScore: { current: 87, previous: 82 },
            tasksCompleted: 34,
            streakDays: 12,
            achievements: ['Focus Master', 'Early Bird', 'Streak Week'],
            topInsight: 'Your productivity peaks between 9-11 AM. Schedule deep work during this window.',
            recommendations: [
                'Take more breaks in afternoon sessions',
                'Try the 52/17 work-break ratio',
                'Start sessions 30 min earlier for best focus'
            ],
            highlights: [
                { label: 'Focus Hours', value: '24.5h', trend: 'up' },
                { label: 'Tasks Done', value: '34', trend: 'up' },
                { label: 'Avg Session', value: '48 min', trend: 'stable' },
                { label: 'Distractions', value: '8', trend: 'down' }
            ]
        });

        setLoading(false);
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-400" />;
        if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />;
        return <span className="w-3 h-3 text-dark-400">—</span>;
    };

    const getProgressPercent = () => {
        if (!report) return 0;
        return Math.min(100, (report.focusHours.current / report.focusHours.goal) * 100);
    };

    if (loading) {
        return (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Weekly AI Report</h3>
                        <p className="text-xs text-dark-500">{report.weekRange}</p>
                    </div>
                </div>
                <button
                    onClick={generateReport}
                    className="p-1.5 text-dark-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {report.highlights.map((h, i) => (
                    <div key={i} className="p-2 bg-dark-700/50 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-bold text-white">{h.value}</span>
                            {getTrendIcon(h.trend)}
                        </div>
                        <span className="text-xs text-dark-500">{h.label}</span>
                    </div>
                ))}
            </div>

            {/* Weekly Goal Progress */}
            <div className="mb-4 p-3 bg-dark-700/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-dark-300 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary-400" />
                        Weekly Focus Goal
                    </span>
                    <span className="text-sm text-white font-medium">
                        {report.focusHours.current}h / {report.focusHours.goal}h
                    </span>
                </div>
                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${getProgressPercent()}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-dark-500">
                        {report.focusHours.current > report.focusHours.previous
                            ? `↑ ${(report.focusHours.current - report.focusHours.previous).toFixed(1)}h vs last week`
                            : `↓ ${(report.focusHours.previous - report.focusHours.current).toFixed(1)}h vs last week`
                        }
                    </span>
                    <span className="text-xs text-primary-400">
                        {Math.round(getProgressPercent())}% complete
                    </span>
                </div>
            </div>

            {/* Top AI Insight */}
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-white mb-1">AI Insight</p>
                        <p className="text-xs text-dark-300">{report.topInsight}</p>
                    </div>
                </div>
            </div>

            {/* Streak & Achievements */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-dark-300">{report.streakDays} day streak</span>
                </div>
                <div className="flex gap-1">
                    {report.achievements.slice(0, 3).map((a, i) => (
                        <div key={i} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">
                            🏆 {a}
                        </div>
                    ))}
                </div>
            </div>

            {/* Expandable Recommendations */}
            {expanded && (
                <div className="mb-4 space-y-2">
                    <p className="text-xs text-dark-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Recommendations for next week
                    </p>
                    {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-dark-300">
                            <span className="text-primary-400">•</span>
                            {rec}
                        </div>
                    ))}
                </div>
            )}

            {/* Expand/Collapse */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full py-2 text-center text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center gap-1"
            >
                {expanded ? 'Show less' : 'View recommendations'}
                <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
        </div>
    );
}
