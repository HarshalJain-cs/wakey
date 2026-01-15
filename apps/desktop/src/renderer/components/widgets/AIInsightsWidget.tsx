import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, TrendingUp, Brain, Lightbulb, AlertCircle } from 'lucide-react';

interface Insight {
    id: number;
    text: string;
    type: 'tip' | 'warning' | 'success';
}

export default function AIInsightsWidget() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        generateInsights();
    }, []);

    const generateInsights = async () => {
        setLoading(true);
        if (!window.wakey) {
            setInsights([{
                id: 1,
                text: 'Start tracking to get personalized AI insights about your productivity!',
                type: 'tip',
            }]);
            setLoading(false);
            return;
        }
        try {
            const stats = await window.wakey.getTodayStats();

            // Generate insights based on data
            const newInsights: Insight[] = [];

            if (stats.focusTime < 30) {
                newInsights.push({
                    id: 1,
                    text: 'Start a 25-minute focus session to build momentum. Small wins lead to big progress!',
                    type: 'tip',
                });
            } else if (stats.focusTime > 120) {
                newInsights.push({
                    id: 1,
                    text: `Great job! You've focused for ${Math.floor(stats.focusTime / 60)}h ${stats.focusTime % 60}m today. Keep it up!`,
                    type: 'success',
                });
            }

            if (stats.distractions > 3) {
                newInsights.push({
                    id: 2,
                    text: `You've had ${stats.distractions} distractions today. Try using focus mode to stay on track.`,
                    type: 'warning',
                });
            } else if (stats.distractions === 0 && stats.focusTime > 0) {
                newInsights.push({
                    id: 2,
                    text: 'Zero distractions detected! Your focus is on point today. 🎯',
                    type: 'success',
                });
            }

            if (stats.sessions === 0) {
                newInsights.push({
                    id: 3,
                    text: 'No focus sessions completed yet. Start one to track your deep work!',
                    type: 'tip',
                });
            } else {
                newInsights.push({
                    id: 3,
                    text: `You've completed ${stats.sessions} focus session${stats.sessions > 1 ? 's' : ''}. ${stats.sessions >= 4 ? 'Impressive!' : 'Keep going!'}`,
                    type: 'success',
                });
            }

            if (stats.topApps.length > 0) {
                const topApp = stats.topApps[0];
                newInsights.push({
                    id: 4,
                    text: `Your most used app today is ${topApp.app} (${topApp.minutes}m). Is this aligned with your goals?`,
                    type: 'tip',
                });
            }

            setInsights(newInsights.slice(0, 3));
        } catch (error) {
            console.error('Failed to generate insights:', error);
            setInsights([{
                id: 1,
                text: 'Start tracking to get personalized AI insights about your productivity!',
                type: 'tip',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const getInsightIcon = (type: Insight['type']) => {
        switch (type) {
            case 'success': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            default: return <Lightbulb className="w-4 h-4 text-primary-400" />;
        }
    };

    const getInsightBg = (type: Insight['type']) => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            default: return 'bg-primary-500/10 border-primary-500/20';
        }
    };

    return (
        <div className="widget-card h-full flex flex-col">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    AI Insights
                </span>
                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
                    </div>
                ) : (
                    insights.map((insight) => (
                        <div
                            key={insight.id}
                            className={`p-3 rounded-lg border ${getInsightBg(insight.type)} flex items-start gap-3`}
                        >
                            {getInsightIcon(insight.type)}
                            <p className="text-sm text-dark-200 flex-1">{insight.text}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="pt-3 border-t border-dark-700 mt-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask AI about productivity..."
                        className="input-field flex-1 text-sm"
                    />
                    <button className="btn-primary text-sm px-3" disabled>
                        Ask
                    </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">AI chat coming soon with Groq API</p>
            </div>
        </div>
    );
}
