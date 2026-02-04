import { useState, useEffect } from 'react';
import {
    Moon, Sun, Clock,
    Zap, AlertCircle, RefreshCw
} from 'lucide-react';

interface SleepData {
    averageDuration: number;
    optimalDuration: number;
    sleepDebt: number;
    chronotype: 'morning-lark' | 'night-owl' | 'intermediate';
    correlations: { sleepHours: number; productivityScore: number }[];
    lastNight: { duration: number; quality: number; bedtime: string; wakeTime: string } | null;
    recommendations: string[];
}

export default function SleepInsightsWidget() {
    const [data, setData] = useState<SleepData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSleepData();
    }, []);

    const fetchSleepData = async () => {
        setLoading(true);

        // Simulate fetching sleep data (from wearables or manual input)
        await new Promise(resolve => setTimeout(resolve, 500));

        setData({
            averageDuration: 7.2,
            optimalDuration: 7.5,
            sleepDebt: 2.3,
            chronotype: 'morning-lark',
            correlations: [
                { sleepHours: 6, productivityScore: 65 },
                { sleepHours: 7, productivityScore: 82 },
                { sleepHours: 7.5, productivityScore: 91 },
                { sleepHours: 8, productivityScore: 88 },
                { sleepHours: 9, productivityScore: 78 },
            ],
            lastNight: {
                duration: 7.5,
                quality: 85,
                bedtime: '11:15 PM',
                wakeTime: '6:45 AM'
            },
            recommendations: [
                'Try sleeping 20 min earlier tonight',
                'Your optimal sleep window is 10:30 PM - 6:00 AM',
                'Reduce screen time 1 hour before bed'
            ]
        });

        setLoading(false);
    };

    const getChronotypeLabel = (type: string) => {
        switch (type) {
            case 'morning-lark': return '🌅 Morning Person';
            case 'night-owl': return '🦉 Night Owl';
            default: return '⚖️ Balanced';
        }
    };

    const getOptimalProductivity = () => {
        if (!data) return { hours: 0, score: 0 };
        const optimal = data.correlations.reduce((best, curr) =>
            curr.productivityScore > best.productivityScore ? curr : best
        );
        return { hours: optimal.sleepHours, score: optimal.productivityScore };
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

    if (!data) return null;

    const optimal = getOptimalProductivity();

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Sleep Insights</h3>
                </div>
                <span className="text-xs text-dark-500 px-2 py-1 bg-dark-700 rounded-full">
                    {getChronotypeLabel(data.chronotype)}
                </span>
            </div>

            {/* Last Night Summary */}
            {data.lastNight && (
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-300">Last Night</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">{data.lastNight.duration}h</span>
                            <div className={`px-1.5 py-0.5 rounded text-xs ${data.lastNight.quality >= 80 ? 'bg-green-500/20 text-green-400' :
                                data.lastNight.quality >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {data.lastNight.quality}% quality
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-dark-500">
                        <span>🛏️ {data.lastNight.bedtime}</span>
                        <span>☀️ {data.lastNight.wakeTime}</span>
                    </div>
                </div>
            )}

            {/* Sleep-Productivity Correlation */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-dark-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Sleep vs Productivity
                    </span>
                </div>
                <div className="h-24 flex items-end gap-1 px-2">
                    {data.correlations.map((c, i) => {
                        const isOptimal = c.sleepHours === optimal.hours;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className={`w-full rounded-t transition-all ${isOptimal
                                        ? 'bg-gradient-to-t from-green-500 to-green-400'
                                        : 'bg-dark-600 hover:bg-dark-500'
                                        }`}
                                    style={{ height: `${c.productivityScore}%` }}
                                    title={`${c.sleepHours}h → ${c.productivityScore}% productivity`}
                                />
                                <span className={`text-xs ${isOptimal ? 'text-green-400 font-medium' : 'text-dark-500'}`}>
                                    {c.sleepHours}h
                                </span>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-center text-dark-500 mt-2">
                    Your optimal: <span className="text-green-400 font-medium">{optimal.hours}h</span> sleep = <span className="text-green-400 font-medium">{optimal.score}%</span> productivity
                </p>
            </div>

            {/* Sleep Debt Warning */}
            {data.sleepDebt > 2 && (
                <div className="mb-4 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-orange-400 font-medium">Sleep Debt: {data.sleepDebt}h</p>
                        <p className="text-xs text-dark-400">Consider going to bed earlier this week</p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                    <Clock className="w-4 h-4 text-dark-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-white">{data.averageDuration}h</p>
                    <p className="text-xs text-dark-500">Avg Sleep</p>
                </div>
                <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                    <Sun className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-white">{data.optimalDuration}h</p>
                    <p className="text-xs text-dark-500">Optimal</p>
                </div>
            </div>

            {/* Top Recommendation */}
            {data.recommendations.length > 0 && (
                <div className="p-2 bg-dark-700/30 rounded-lg">
                    <p className="text-xs text-dark-500 mb-1">💡 Tip</p>
                    <p className="text-sm text-dark-300">{data.recommendations[0]}</p>
                </div>
            )}
        </div>
    );
}
