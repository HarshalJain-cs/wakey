import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, TrendingUp, Brain, Lightbulb, Send, Zap, AlertTriangle, Trophy, Heart } from 'lucide-react';
import { enhancedAIInsightsService, ProactiveInsight } from '../../services/enhanced-ai-insights-service';

interface Insight {
    id: string;
    text: string;
    type: 'tip' | 'warning' | 'success' | 'opportunity' | 'coaching' | 'achievement';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    actions?: { label: string; type: string }[];
}

export default function AIInsightsWidget() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [askingAI, setAskingAI] = useState(false);

    useEffect(() => {
        generateInsights();
    }, []);

    const generateInsights = async () => {
        setLoading(true);
        try {
            // Use enhanced AI insights service
            const proactiveInsights = await enhancedAIInsightsService.generateProactiveInsights();

            // Convert to UI format
            const uiInsights: Insight[] = proactiveInsights.map((insight: ProactiveInsight) => ({
                id: insight.id,
                text: `${insight.title}: ${insight.description}`,
                type: insight.type === 'warning' ? 'warning' :
                    insight.type === 'opportunity' ? 'success' :
                        insight.type === 'achievement' ? 'achievement' :
                            insight.type === 'coaching' ? 'coaching' : 'tip',
                priority: insight.priority,
                actions: insight.actions.map(a => ({ label: a.label, type: a.type }))
            }));

            // Fallback if no insights
            if (uiInsights.length === 0) {
                setInsights([{
                    id: 'default',
                    text: 'Start tracking to get personalized AI insights about your productivity!',
                    type: 'tip',
                }]);
            } else {
                setInsights(uiInsights.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to generate insights:', error);
            setInsights([{
                id: 'error',
                text: 'Start tracking to get personalized AI insights about your productivity!',
                type: 'tip',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const askAI = async () => {
        if (!prompt.trim()) return;

        setAskingAI(true);
        try {
            const response = await enhancedAIInsightsService.queryNaturalLanguage(prompt);
            setAiResponse(response.answer);
        } catch (error) {
            console.error('AI query failed:', error);
            setAiResponse("I couldn't process that query. Try asking about your productivity, focus time, or task completion.");
        } finally {
            setAskingAI(false);
            setPrompt('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askAI();
        }
    };

    const getInsightIcon = (type: Insight['type']) => {
        switch (type) {
            case 'success':
            case 'opportunity':
                return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'achievement':
                return <Trophy className="w-4 h-4 text-yellow-400" />;
            case 'coaching':
                return <Heart className="w-4 h-4 text-pink-400" />;
            default:
                return <Lightbulb className="w-4 h-4 text-primary-400" />;
        }
    };

    const getInsightBg = (type: Insight['type'], priority?: string) => {
        if (priority === 'critical') {
            return 'bg-red-500/10 border-red-500/30';
        }
        switch (type) {
            case 'success':
            case 'opportunity':
                return 'bg-green-500/10 border-green-500/20';
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/20';
            case 'achievement':
                return 'bg-yellow-500/10 border-yellow-500/30';
            case 'coaching':
                return 'bg-pink-500/10 border-pink-500/20';
            default:
                return 'bg-primary-500/10 border-primary-500/20';
        }
    };

    return (
        <div className="widget-card h-full flex flex-col">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    AI Insights
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                        Enhanced
                    </span>
                </span>
                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
                    </div>
                ) : (
                    <>
                        {insights.map((insight) => (
                            <div
                                key={insight.id}
                                className={`p-3 rounded-lg border ${getInsightBg(insight.type, insight.priority)} flex items-start gap-3`}
                            >
                                {getInsightIcon(insight.type)}
                                <div className="flex-1">
                                    <p className="text-sm text-dark-200">{insight.text}</p>
                                    {insight.actions && insight.actions.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {insight.actions.slice(0, 2).map((action, i) => (
                                                <button
                                                    key={i}
                                                    className="text-xs px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors"
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {insight.priority === 'critical' && (
                                    <Zap className="w-4 h-4 text-red-400" />
                                )}
                            </div>
                        ))}

                        {/* AI Response */}
                        {aiResponse && (
                            <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
                                <div className="flex items-start gap-2">
                                    <Brain className="w-4 h-4 text-primary-400 mt-0.5" />
                                    <p className="text-sm text-dark-200">{aiResponse}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="pt-3 border-t border-dark-700 mt-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about productivity, focus time..."
                        className="input-field flex-1 text-sm"
                        disabled={askingAI}
                    />
                    <button
                        className="btn-primary text-sm px-3 flex items-center gap-1"
                        onClick={askAI}
                        disabled={askingAI || !prompt.trim()}
                    >
                        {askingAI ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Ask
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">
                    Natural language queries powered by AI
                </p>
            </div>
        </div>
    );
}
