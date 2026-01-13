import { useState, useEffect } from 'react';
import {
    Search,
    Globe,
    BookOpen,
    Sparkles,
    ExternalLink,
    Save,
    Trash2,
    RefreshCw,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Copy,
    History,
} from 'lucide-react';
import {
    conductResearch,
    quickResearch,
    getResearchHistory,
    deleteResearchSession,
    clearResearchHistory,
    generateNoteFromSession,
    markAsSavedToKnowledge,
    type ResearchSession,
    type SearchResult,
} from '../services/research-service';
import { createNote } from '../services/knowledge-service';

export default function ResearchPage() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
    const [history, setHistory] = useState<ResearchSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
    const [isQuickSearching, setIsQuickSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        setHistory(getResearchHistory());
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setQuickAnswer(null);

        try {
            const session = await conductResearch(query.trim());
            setCurrentSession(session);
            setHistory(getResearchHistory());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Research failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuickSearch = async () => {
        if (!query.trim()) return;

        setIsQuickSearching(true);
        setError(null);

        try {
            const answer = await quickResearch(query.trim());
            setQuickAnswer(answer);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Quick search failed');
        } finally {
            setIsQuickSearching(false);
        }
    };

    const handleSaveToKnowledge = async (session: ResearchSession) => {
        const noteData = generateNoteFromSession(session);
        await createNote(noteData.title, noteData.content, noteData.tags);
        markAsSavedToKnowledge(session.id);
        setHistory(getResearchHistory());
        if (currentSession?.id === session.id) {
            setCurrentSession({ ...session, savedToKnowledge: true });
        }
    };

    const handleDeleteSession = (id: number) => {
        deleteResearchSession(id);
        setHistory(getResearchHistory());
        if (currentSession?.id === id) {
            setCurrentSession(null);
        }
    };

    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear all research history?')) {
            clearResearchHistory();
            setHistory([]);
            setCurrentSession(null);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const loadSession = (session: ResearchSession) => {
        setCurrentSession(session);
        setShowHistory(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-7 h-7 text-teal-400" />
                        Deep Research
                    </h1>
                    <p className="text-gray-400 mt-1">
                        AI-powered web research with summarization
                    </p>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showHistory
                        ? 'bg-teal-500 text-white'
                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                >
                    <History className="w-4 h-4" />
                    History ({history.length})
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="What would you like to research?"
                            className="w-full pl-12 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-lg"
                        />
                    </div>
                    <button
                        onClick={handleQuickSearch}
                        disabled={isQuickSearching || !query.trim()}
                        className="px-6 py-4 bg-dark-600 text-gray-300 rounded-xl hover:bg-dark-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isQuickSearching ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5" />
                        )}
                        Quick
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !query.trim()}
                        className="px-8 py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        {isSearching ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        Deep Research
                    </button>
                </div>

                {/* Quick Answer */}
                {quickAnswer && (
                    <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-teal-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-white">{quickAnswer}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(quickAnswer, 'quick')}
                                className="p-1 hover:bg-teal-500/20 rounded"
                            >
                                {copiedId === 'quick' ? (
                                    <CheckCircle className="w-4 h-4 text-teal-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {/* History Panel */}
            {showHistory && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Research History</h2>
                        {history.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No research history yet</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {history.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 cursor-pointer group"
                                    onClick={() => loadSession(session)}
                                >
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{session.query}</p>
                                        <p className="text-gray-500 text-sm">
                                            {session.results.length} results • {new Date(session.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.savedToKnowledge && (
                                            <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded">
                                                Saved
                                            </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Research Results */}
            {currentSession && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Summary */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-teal-400" />
                                AI Summary
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(currentSession.summary, 'summary')}
                                    className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white"
                                    title="Copy summary"
                                >
                                    {copiedId === 'summary' ? (
                                        <CheckCircle className="w-4 h-4 text-teal-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                {!currentSession.savedToKnowledge ? (
                                    <button
                                        onClick={() => handleSaveToKnowledge(currentSession)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 text-sm"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save to Knowledge
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        Saved
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 whitespace-pre-wrap">{currentSession.summary}</p>
                        </div>

                        {currentSession.keyFindings.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                                    Key Findings
                                </h3>
                                <ul className="space-y-2">
                                    {currentSession.keyFindings.map((finding, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300">
                                            <span className="w-5 h-5 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            {finding}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Search Results */}
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                Sources ({currentSession.results.length})
                            </h2>
                            <button
                                onClick={() => handleDeleteSession(currentSession.id)}
                                className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-red-400"
                                title="Delete session"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {currentSession.results.map((result, i) => (
                                <SourceCard key={i} result={result} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!currentSession && !showHistory && (
                <div className="bg-dark-800 rounded-xl p-12 border border-dark-700 text-center">
                    <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Start Your Research
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Enter a topic or question above to begin. Our AI will search the web,
                        analyze sources, and provide you with a comprehensive summary.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {['Quantum computing trends', 'Best productivity techniques', 'AI in finance'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => {
                                    setQuery(suggestion);
                                }}
                                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 text-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// Source Card Component
// ==========================================

function SourceCard({ result }: { result: SearchResult }) {
    const isAIGenerated = result.url === '#ai-generated' || result.url === '#';

    return (
        <div className="p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{result.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{result.snippet}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-dark-600 text-gray-400 px-2 py-1 rounded">
                            {result.source}
                        </span>
                        {result.relevanceScore !== undefined && (
                            <span className="text-xs text-gray-500">
                                {Math.round(result.relevanceScore * 100)}% relevant
                            </span>
                        )}
                    </div>
                </div>
                {!isAIGenerated && (
                    <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-teal-400 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
