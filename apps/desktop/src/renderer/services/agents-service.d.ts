export type AgentType = 'research' | 'code-review' | 'trend' | 'prediction';
export type AgentStatus = 'idle' | 'running' | 'paused' | 'error';
export interface ResearchTopic {
    topic: string;
    keywords: string[];
    lastUpdated?: string;
    summaries: string[];
}
export interface TrendItem {
    title: string;
    source: string;
    relevance: number;
    timestamp: string;
    summary?: string;
}
export interface UserPattern {
    dayOfWeek: number;
    hour: number;
    activity: string;
    frequency: number;
}
export interface TaskPrediction {
    title: string;
    reason: string;
    confidence: number;
    suggestedTime?: string;
}
export interface AgentTask {
    id: number;
    agentType: AgentType;
    status: 'pending' | 'running' | 'completed' | 'failed';
    input: Record<string, unknown>;
    output?: Record<string, unknown>;
    scheduledAt?: string;
    completedAt?: string;
    createdAt: string;
    error?: string;
}
export interface AgentConfig {
    enabled: boolean;
    interval: number;
    lastRun?: string;
    settings: Record<string, unknown>;
}
export interface AgentResult {
    success: boolean;
    data?: unknown;
    summary?: string;
    error?: string;
}
declare abstract class BaseAgent {
    abstract type: AgentType;
    abstract name: string;
    abstract description: string;
    protected config: AgentConfig;
    protected status: AgentStatus;
    protected intervalId: NodeJS.Timeout | null;
    configure(config: Partial<AgentConfig>): void;
    getConfig(): AgentConfig;
    getStatus(): AgentStatus;
    start(): void;
    stop(): void;
    pause(): void;
    abstract run(): Promise<AgentResult>;
}
declare class ResearchAgent extends BaseAgent {
    type: AgentType;
    name: string;
    description: string;
    private topics;
    addTopic(topic: string, keywords: string[]): void;
    removeTopic(topic: string): void;
    getTopics(): ResearchTopic[];
    run(): Promise<AgentResult>;
    setTopics(topics: ResearchTopic[]): void;
}
declare class CodeReviewAgent extends BaseAgent {
    type: AgentType;
    name: string;
    description: string;
    private codeSnippets;
    private patterns;
    addCodeForReview(code: string, language: string, source: string): void;
    clearPendingReviews(): void;
    run(): Promise<AgentResult>;
}
interface TrendSource {
    name: string;
    url: string;
    type: 'rss' | 'api' | 'web';
    enabled: boolean;
}
declare class TrendAgent extends BaseAgent {
    type: AgentType;
    name: string;
    description: string;
    private sources;
    private keywords;
    private recentTrends;
    addSource(source: TrendSource): void;
    removeSource(name: string): void;
    setKeywords(keywords: string[]): void;
    getRecentTrends(): TrendItem[];
    run(): Promise<AgentResult>;
    setRecentTrends(trends: TrendItem[]): void;
}
declare class PredictionAgent extends BaseAgent {
    type: AgentType;
    name: string;
    description: string;
    private patterns;
    private predictions;
    recordActivity(activity: string): void;
    getPatterns(): UserPattern[];
    getPredictions(): TaskPrediction[];
    run(): Promise<AgentResult>;
    setPatterns(patterns: UserPattern[]): void;
    setPredictions(predictions: TaskPrediction[]): void;
}
declare class AgentManager {
    private agents;
    private tasks;
    private nextTaskId;
    constructor();
    getAgent(type: AgentType): BaseAgent | undefined;
    getResearchAgent(): ResearchAgent;
    getCodeReviewAgent(): CodeReviewAgent;
    getTrendAgent(): TrendAgent;
    getPredictionAgent(): PredictionAgent;
    getAllAgents(): {
        type: AgentType;
        name: string;
        status: AgentStatus;
        config: AgentConfig;
    }[];
    configureAgent(type: AgentType, config: Partial<AgentConfig>): void;
    startAgent(type: AgentType): void;
    stopAgent(type: AgentType): void;
    pauseAgent(type: AgentType): void;
    startAll(): void;
    stopAll(): void;
    runAgent(type: AgentType): Promise<AgentResult | null>;
    getRecentTasks(limit?: number): AgentTask[];
    clearTasks(): void;
    setTasks(tasks: AgentTask[], nextId: number): void;
    getTasks(): AgentTask[];
}
export declare function saveToDisk(): Promise<void>;
export declare function loadFromDisk(): Promise<void>;
export declare const agentManager: AgentManager;
export { ResearchAgent, CodeReviewAgent, TrendAgent, PredictionAgent, AgentManager };
//# sourceMappingURL=agents-service.d.ts.map