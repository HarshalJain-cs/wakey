import { useState, useEffect } from 'react';
import {
    Bot, Play, Pause, RefreshCw, Settings, Clock,
    Search, Code, TrendingUp, Lightbulb, Plus, X,
    CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import {
    agentManager,
    AgentType,
    AgentTask,
} from '../services/agents-service';

export default function AgentsPage() {
    const [agents, setAgents] = useState<ReturnType<typeof agentManager.getAllAgents>>([]);
    const [recentTasks, setRecentTasks] = useState<AgentTask[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [runningAgent, setRunningAgent] = useState<AgentType | null>(null);

    // Research agent state
    const [newTopic, setNewTopic] = useState({ topic: '', keywords: '' });
    const [researchTopics, setResearchTopics] = useState<{ topic: string; keywords: string[] }[]>([]);

    // Trend agent state
    const [trendKeywords, setTrendKeywords] = useState('');
    const [recentTrends, setRecentTrends] = useState<any[]>([]);

    // Prediction agent state
    const [predictions, setPredictions] = useState<any[]>([]);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setAgents(agentManager.getAllAgents());
        setRecentTasks(agentManager.getRecentTasks(10));
        setResearchTopics(agentManager.getResearchAgent().getTopics());
        setRecentTrends(agentManager.getTrendAgent().getRecentTrends());
        setPredictions(agentManager.getPredictionAgent().getPredictions());
    };

    const handleToggleAgent = (type: AgentType) => {
        const agent = agents.find(a => a.type === type);
        if (agent?.status === 'running') {
            agentManager.pauseAgent(type);
        } else {
            agentManager.configureAgent(type, { enabled: true });
            agentManager.startAgent(type);
        }
        refreshData();
    };

    const handleRunAgent = async (type: AgentType) => {
        setRunningAgent(type);
        await agentManager.runAgent(type);
        setRunningAgent(null);
        refreshData();
    };

    const handleAddResearchTopic = () => {
        if (!newTopic.topic.trim()) return;
        const keywords = newTopic.keywords.split(',').map(k => k.trim()).filter(k => k);
        agentManager.getResearchAgent().addTopic(newTopic.topic, keywords);
        setNewTopic({ topic: '', keywords: '' });
        refreshData();
    };

    const handleRemoveTopic = (topic: string) => {
        agentManager.getResearchAgent().removeTopic(topic);
        refreshData();
    };

    const handleSetTrendKeywords = () => {
        const keywords = trendKeywords.split(',').map(k => k.trim()).filter(k => k);
        agentManager.getTrendAgent().setKeywords(keywords);
        refreshData();
    };

    const getAgentIcon = (type: AgentType) => {
        switch (type) {
            case 'research': return Search;
            case 'code-review': return Code;
            case 'trend': return TrendingUp;
            case 'prediction': return Lightbulb;
            default: return Bot;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-400';
            case 'paused': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-400" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Bot className="w-8 h-8 text-teal-400" />
                        Autonomous Agents
                    </h1>
                    <p className="text-gray-400 mt-1">
                        AI agents that work in the background to help you stay productive
                    </p>
                </div>
                <button
                    onClick={refreshData}
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-2 gap-4">
                {agents.map(agent => {
                    const Icon = getAgentIcon(agent.type);
                    return (
                        <div
                            key={agent.type}
                            className={`bg-dark-800 rounded-xl p-6 border transition-colors cursor-pointer ${selectedAgent === agent.type
                                    ? 'border-teal-500'
                                    : 'border-dark-700 hover:border-dark-600'
                                }`}
                            onClick={() => setSelectedAgent(selectedAgent === agent.type ? null : agent.type)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg ${agent.status === 'running'
                                            ? 'bg-teal-500/20'
                                            : 'bg-dark-700'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${agent.status === 'running'
                                                ? 'text-teal-400'
                                                : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{agent.name}</h3>
                                        <p className={`text-sm capitalize ${getStatusColor(agent.status)}`}>
                                            {agent.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRunAgent(agent.type);
                                        }}
                                        disabled={runningAgent === agent.type}
                                        className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                        title="Run now"
                                    >
                                        {runningAgent === agent.type ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleAgent(agent.type);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${agent.status === 'running'
                                                ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                                                : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
                                            }`}
                                        title={agent.status === 'running' ? 'Pause' : 'Start'}
                                    >
                                        {agent.status === 'running' ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Every {agent.config.interval}m
                                </span>
                                {agent.config.lastRun && (
                                    <span>Last: {formatTime(agent.config.lastRun)}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Agent Configuration Panel */}
            {selectedAgent && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-teal-400" />
                        {agents.find(a => a.type === selectedAgent)?.name} Configuration
                    </h2>

                    {selectedAgent === 'research' && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newTopic.topic}
                                    onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                                    placeholder="Research topic"
                                    className="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />
                                <input
                                    type="text"
                                    value={newTopic.keywords}
                                    onChange={(e) => setNewTopic({ ...newTopic, keywords: e.target.value })}
                                    placeholder="Keywords (comma-separated)"
                                    className="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />
                                <button
                                    onClick={handleAddResearchTopic}
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2">
                                {researchTopics.map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                                        <div>
                                            <span className="text-white font-medium">{topic.topic}</span>
                                            <div className="flex gap-1 mt-1">
                                                {topic.keywords.map((kw, j) => (
                                                    <span key={j} className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-400">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTopic(topic.topic)}
                                            className="p-1 text-gray-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {researchTopics.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No topics added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedAgent === 'trend' && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={trendKeywords}
                                    onChange={(e) => setTrendKeywords(e.target.value)}
                                    placeholder="Keywords to monitor (comma-separated)"
                                    className="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />
                                <button
                                    onClick={handleSetTrendKeywords}
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                                >
                                    Save Keywords
                                </button>
                            </div>

                            <h3 className="text-white font-medium mt-6 mb-3">Recent Trends</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {recentTrends.map((trend, i) => (
                                    <div key={i} className="p-3 bg-dark-900 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">{trend.title}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${trend.relevance > 0.7 ? 'bg-green-500/20 text-green-400' :
                                                    trend.relevance > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {Math.round(trend.relevance * 100)}%
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">{trend.source}</span>
                                    </div>
                                ))}
                                {recentTrends.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No trends yet. Run the agent to get updates.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedAgent === 'prediction' && (
                        <div className="space-y-4">
                            <p className="text-gray-400">
                                This agent learns from your activity patterns and suggests tasks.
                            </p>

                            <h3 className="text-white font-medium mt-4 mb-3">Task Predictions</h3>
                            <div className="space-y-2">
                                {predictions.map((pred, i) => (
                                    <div key={i} className="p-4 bg-dark-900 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-medium">{pred.title}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${pred.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                                                    pred.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {Math.round(pred.confidence * 100)}% confidence
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm">{pred.reason}</p>
                                    </div>
                                ))}
                                {predictions.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        No predictions yet. The agent needs more activity data.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedAgent === 'code-review' && (
                        <div className="space-y-4">
                            <p className="text-gray-400">
                                The code review agent analyzes code snippets and provides suggestions.
                                Add code through the API or paste it below for analysis.
                            </p>
                            <div className="p-4 bg-dark-900/50 rounded-lg border border-dark-600 text-center">
                                <Code className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500">Code review integration coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Tasks */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-400" />
                    Recent Agent Activity
                </h2>
                <div className="space-y-2">
                    {recentTasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No agent activity yet. Run an agent to see results here.
                        </p>
                    ) : (
                        recentTasks.map(task => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(task.status)}
                                    <div>
                                        <span className="text-white capitalize">{task.agentType}</span>
                                        {task.error && (
                                            <p className="text-red-400 text-sm">{task.error}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {formatTime(task.createdAt)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
