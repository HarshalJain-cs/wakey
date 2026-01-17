import { useState, useEffect } from 'react';
import {
    Brain, Zap, MessageSquare, RefreshCw, Settings, Star,
    ChevronDown, ChevronUp, CheckCircle, XCircle, Clock,
    BarChart3, Sparkles
} from 'lucide-react';
import {
    getProviders,
    enableProvider,
    setProviderApiKey,
    generateConsensus,
    recordModelPerformance,
    AIProvider,
    ConsensusResult,
} from '../services/multi-model-service';

export default function AIConsensusPage() {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<ConsensusResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

    useEffect(() => {
        setProviders(getProviders());
    }, []);

    const handleProviderToggle = (name: string, enabled: boolean) => {
        enableProvider(name, enabled);
        setProviders(getProviders());
    };

    const handleApiKeyChange = (provider: string, key: string) => {
        setApiKeys(prev => ({ ...prev, [provider]: key }));
        setProviderApiKey(provider, key);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;

        setLoading(true);
        setResult(null);

        try {
            const consensusResult = await generateConsensus(
                prompt,
                'You are a helpful AI assistant. Provide accurate and concise responses.',
                500
            );
            setResult(consensusResult);

            // Record performance
            consensusResult.responses.forEach(r => {
                recordModelPerformance(r.provider, !r.error, r.latencyMs);
            });
        } catch (error) {
            console.error('Consensus error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRateResponse = (provider: string, rating: number) => {
        recordModelPerformance(provider, true, 0, rating);
    };

    const getStatusIcon = (enabled: boolean) => {
        return enabled ? (
            <CheckCircle className="w-4 h-4 text-teal-400" />
        ) : (
            <XCircle className="w-4 h-4 text-gray-500" />
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-teal-400" />
                        AI Consensus
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Query multiple AI models and get consensus responses
                    </p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-teal-400" />
                        Provider Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {providers.map(provider => (
                            <div
                                key={provider.name}
                                className="bg-dark-900 rounded-lg p-4 border border-dark-600"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(provider.enabled)}
                                        <span className="text-white font-medium capitalize">
                                            {provider.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({provider.model})
                                        </span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={provider.enabled}
                                            onChange={(e) => handleProviderToggle(provider.name, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                                    </label>
                                </div>
                                {provider.name !== 'ollama' && (
                                    <input
                                        type="password"
                                        placeholder={`${provider.name} API Key`}
                                        value={apiKeys[provider.name] || ''}
                                        onChange={(e) => handleApiKeyChange(provider.name, e.target.value)}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                    />
                                )}
                                {provider.name === 'ollama' && (
                                    <p className="text-xs text-gray-500">
                                        Local model - no API key required
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Query Form */}
            <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-teal-400 mt-1" />
                    <div className="flex-1">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask anything... (e.g., 'Explain quantum computing in simple terms')"
                            rows={3}
                            className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-sm text-gray-500">
                                {providers.filter(p => p.enabled).length} providers active
                            </p>
                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Get Consensus
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Results */}
            {result && (
                <div className="space-y-4">
                    {/* Consensus Response */}
                    <div className="bg-gradient-to-br from-teal-900/30 to-dark-800 rounded-xl p-6 border border-teal-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Brain className="w-5 h-5 text-teal-400" />
                                Consensus Response
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-teal-500/20 rounded-full">
                                    <span className="text-sm text-teal-400 font-medium">
                                        {Math.round(result.confidence * 100)}% Confidence
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-200 whitespace-pre-wrap">{result.consensus}</p>
                        <p className="text-sm text-gray-500 mt-4 italic">{result.reasoning}</p>
                    </div>

                    {/* Individual Responses */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-teal-400" />
                            Individual Model Responses
                        </h3>
                        <div className="space-y-3">
                            {result.responses.map((response, i) => (
                                <div
                                    key={i}
                                    className="bg-dark-900 rounded-lg border border-dark-600 overflow-hidden"
                                >
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-dark-800"
                                        onClick={() => setExpandedResponse(
                                            expandedResponse === response.provider ? null : response.provider
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {response.error ? (
                                                <XCircle className="w-5 h-5 text-red-400" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            )}
                                            <span className="text-white font-medium capitalize">
                                                {response.provider}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({response.model})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {response.latencyMs}ms
                                            </div>
                                            {!response.error && (
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRateResponse(response.provider, star);
                                                            }}
                                                            className="text-gray-500 hover:text-yellow-400 transition-colors"
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {expandedResponse === response.provider ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedResponse === response.provider && (
                                        <div className="px-4 pb-4 border-t border-dark-600">
                                            {response.error ? (
                                                <p className="text-red-400 mt-3">{response.error}</p>
                                            ) : (
                                                <p className="text-gray-300 mt-3 whitespace-pre-wrap">
                                                    {response.response}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Voting Breakdown */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Voting Weights
                        </h3>
                        <div className="space-y-3">
                            {result.votingBreakdown.map((vote, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-gray-400 w-24 capitalize">{vote.provider}</span>
                                    <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
                                            style={{ width: `${vote.weight * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-gray-400 text-sm w-12 text-right">
                                        {Math.round(vote.weight * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
