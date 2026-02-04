/**
 * Productivity Digest Widget
 * Daily/weekly productivity summary with insights
 */

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    Zap,
    Calendar,
    Award,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface DigestData {
    period: 'day' | 'week';
    focusTime: number;
    focusTrend: number;
    tasksCompleted: number;
    tasksTrend: number;
    goalsProgress: number;
    streak: number;
    bestHour: number;
    worstHour: number;
    topApps: { name: string; time: number; productive: boolean }[];
    insights: string[];
    achievements: { icon: string; title: string }[];
}

const MOCK_DIGEST: DigestData = {
    period: 'day',
    focusTime: 285,
    focusTrend: 15,
    tasksCompleted: 12,
    tasksTrend: -2,
    goalsProgress: 68,
    streak: 14,
    bestHour: 10,
    worstHour: 15,
    topApps: [
        { name: 'VS Code', time: 180, productive: true },
        { name: 'Chrome', time: 95, productive: true },
        { name: 'Slack', time: 45, productive: false },
    ],
    insights: [
        'Your focus peaks at 10 AM - schedule important tasks then',
        'Context switching increased 20% this week',
        'Taking breaks improved your afternoon focus by 30%',
    ],
    achievements: [
        { icon: '🔥', title: '2-Week Streak' },
        { icon: '⚡', title: 'Power Hour' },
    ],
};

export default function ProductivityDigestWidget() {
    const [digest, setDigest] = useState<DigestData>(MOCK_DIGEST);
    const [period, setPeriod] = useState<'day' | 'week'>('day');
    const [currentInsight, setCurrentInsight] = useState(0);

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatHour = (hour: number) => {
        return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    };

    const nextInsight = () => {
        setCurrentInsight(prev => (prev + 1) % digest.insights.length);
    };

    const prevInsight = () => {
        setCurrentInsight(prev => (prev - 1 + digest.insights.length) % digest.insights.length);
    };

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Productivity Digest</h3>
                        <p className="text-xs text-dark-400">Your personalized insights</p>
                    </div>
                </div>

                {/* Period Toggle */}
                <div className="flex bg-dark-700 rounded-lg p-1">
                    <button
                        onClick={() => setPeriod('day')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${period === 'day'
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${period === 'week'
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        Week
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {/* Focus Time */}
                <div className="p-3 bg-dark-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-dark-400">Focus Time</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{formatTime(digest.focusTime)}</span>
                        <span className={`flex items-center text-xs ${digest.focusTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {digest.focusTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(digest.focusTrend)}%
                        </span>
                    </div>
                </div>

                {/* Tasks */}
                <div className="p-3 bg-dark-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-dark-400">Tasks Done</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{digest.tasksCompleted}</span>
                        <span className={`flex items-center text-xs ${digest.tasksTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {digest.tasksTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(digest.tasksTrend)}
                        </span>
                    </div>
                </div>

                {/* Goals Progress */}
                <div className="p-3 bg-dark-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-dark-400">Goals Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{digest.goalsProgress}%</span>
                        <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                style={{ width: `${digest.goalsProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Streak */}
                <div className="p-3 bg-dark-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-dark-400">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{digest.streak}</span>
                        <span className="text-xs text-dark-400">days</span>
                    </div>
                </div>
            </div>

            {/* Peak Hours */}
            <div className="px-4 pb-4">
                <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                        <div className="text-xs text-green-400 mb-0.5">Peak Hour</div>
                        <div className="text-sm font-semibold text-green-300">{formatHour(digest.bestHour)}</div>
                    </div>
                    <div className="flex-1 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                        <div className="text-xs text-red-400 mb-0.5">Low Hour</div>
                        <div className="text-sm font-semibold text-red-300">{formatHour(digest.worstHour)}</div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="px-4 pb-4">
                <div className="p-3 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-xs font-medium text-primary-300">AI Insight</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={prevInsight}
                                className="p-1 rounded hover:bg-dark-700 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-dark-400" />
                            </button>
                            <span className="text-xs text-dark-500">{currentInsight + 1}/{digest.insights.length}</span>
                            <button
                                onClick={nextInsight}
                                className="p-1 rounded hover:bg-dark-700 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-dark-400" />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-white">{digest.insights[currentInsight]}</p>
                </div>
            </div>

            {/* Recent Achievements */}
            {digest.achievements.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {digest.achievements.map((achievement, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 rounded-full text-sm"
                            >
                                <span>{achievement.icon}</span>
                                <span className="text-dark-300">{achievement.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
