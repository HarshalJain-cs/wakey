// Autonomous Agents Framework
// Background agents for research, code review, trends, and predictions

import { queryWithFallback } from './multi-model-service';
import { getContextForQuery, createNote } from './knowledge-service';

// ==========================================
// Agent Types and Interfaces
// ==========================================

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
    interval: number; // minutes between runs
    lastRun?: string;
    settings: Record<string, unknown>;
}

export interface AgentResult {
    success: boolean;
    data?: unknown;
    summary?: string;
    error?: string;
}

// ==========================================
// Base Agent Class
// ==========================================

abstract class BaseAgent {
    abstract type: AgentType;
    abstract name: string;
    abstract description: string;

    protected config: AgentConfig = {
        enabled: false,
        interval: 60,
        settings: {},
    };

    protected status: AgentStatus = 'idle';
    protected intervalId: NodeJS.Timeout | null = null;

    configure(config: Partial<AgentConfig>): void {
        this.config = { ...this.config, ...config };
    }

    getConfig(): AgentConfig {
        return { ...this.config };
    }

    getStatus(): AgentStatus {
        return this.status;
    }

    start(): void {
        if (!this.config.enabled || this.intervalId) return;

        this.status = 'running';
        this.run(); // Initial run

        this.intervalId = setInterval(() => {
            this.run();
        }, this.config.interval * 60 * 1000);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.status = 'idle';
    }

    pause(): void {
        this.stop();
        this.status = 'paused';
    }

    abstract run(): Promise<AgentResult>;
}

// ==========================================
// Research Agent
// ==========================================

class ResearchAgent extends BaseAgent {
    type: AgentType = 'research';
    name = 'Research Agent';
    description = 'Monitors topics and generates research summaries';

    private topics: ResearchTopic[] = [];

    addTopic(topic: string, keywords: string[]): void {
        this.topics.push({
            topic,
            keywords,
            summaries: [],
        });
    }

    removeTopic(topic: string): void {
        this.topics = this.topics.filter(t => t.topic !== topic);
    }

    getTopics(): ResearchTopic[] {
        return [...this.topics];
    }

    async run(): Promise<AgentResult> {
        if (this.topics.length === 0) {
            return { success: true, summary: 'No topics to research' };
        }

        const results: string[] = [];

        for (const topic of this.topics) {
            try {
                // Get context from knowledge base
                const context = getContextForQuery(topic.topic);

                const prompt = `Research topic: ${topic.topic}
Keywords: ${topic.keywords.join(', ')}

${context ? `Existing knowledge:\n${context}\n` : ''}

Provide a brief update or new insight about this topic. Focus on:
1. Key developments or trends
2. Important concepts to understand
3. Actionable recommendations

Keep the response concise (3-4 sentences).`;

                const response = await queryWithFallback(
                    prompt,
                    'You are a research assistant. Provide concise, factual updates.',
                    200
                );

                topic.summaries.push(response);
                topic.lastUpdated = new Date().toISOString();
                results.push(`${topic.topic}: ${response}`);

                // Optionally save to notes
                if (this.config.settings.saveToNotes) {
                    createNote(
                        `Research: ${topic.topic} - ${new Date().toLocaleDateString()}`,
                        response,
                        ['research', 'auto-generated', ...topic.keywords]
                    );
                }
            } catch {
                results.push(`${topic.topic}: Failed to research`);
            }
        }

        this.config.lastRun = new Date().toISOString();
        saveToDisk();
        return {
            success: true,
            data: results,
            summary: `Researched ${this.topics.length} topics`,
        };
    }

    setTopics(topics: ResearchTopic[]): void {
        this.topics = topics;
    }
}

// ==========================================
// Code Review Agent
// ==========================================

interface CodePattern {
    pattern: string;
    description: string;
    severity: 'info' | 'warning' | 'error';
}

class CodeReviewAgent extends BaseAgent {
    type: AgentType = 'code-review';
    name = 'Code Review Agent';
    description = 'Analyzes code patterns and suggests improvements';

    private codeSnippets: { code: string; language: string; source: string }[] = [];
    private patterns: CodePattern[] = [
        { pattern: 'console.log', description: 'Debug statement left in code', severity: 'warning' },
        { pattern: 'TODO', description: 'TODO comment found', severity: 'info' },
        { pattern: 'FIXME', description: 'FIXME comment found', severity: 'warning' },
        { pattern: 'any', description: 'TypeScript any type usage', severity: 'warning' },
        { pattern: 'catch\\s*\\(', description: 'Empty or generic catch block', severity: 'warning' },
    ];

    addCodeForReview(code: string, language: string, source: string): void {
        this.codeSnippets.push({ code, language, source });
    }

    clearPendingReviews(): void {
        this.codeSnippets = [];
    }

    async run(): Promise<AgentResult> {
        if (this.codeSnippets.length === 0) {
            return { success: true, summary: 'No code to review' };
        }

        const reviews: { source: string; issues: string[]; suggestions: string }[] = [];

        for (const snippet of this.codeSnippets) {
            const issues: string[] = [];

            // Pattern-based analysis
            for (const pattern of this.patterns) {
                const regex = new RegExp(pattern.pattern, 'gi');
                const matches = snippet.code.match(regex);
                if (matches) {
                    issues.push(`[${pattern.severity.toUpperCase()}] ${pattern.description} (${matches.length} occurrences)`);
                }
            }

            // AI-powered analysis
            try {
                const prompt = `Review this ${snippet.language} code and provide 2-3 specific improvement suggestions:

\`\`\`${snippet.language}
${snippet.code.slice(0, 1000)}
\`\`\`

Focus on: code quality, potential bugs, performance, and best practices. Be specific and actionable.`;

                const suggestions = await queryWithFallback(
                    prompt,
                    'You are a senior code reviewer. Be concise and specific.',
                    250
                );

                reviews.push({
                    source: snippet.source,
                    issues,
                    suggestions,
                });
            } catch {
                reviews.push({
                    source: snippet.source,
                    issues,
                    suggestions: 'AI analysis unavailable',
                });
            }
        }

        this.codeSnippets = []; // Clear reviewed snippets
        this.config.lastRun = new Date().toISOString();

        return {
            success: true,
            data: reviews,
            summary: `Reviewed ${reviews.length} code snippets`,
        };
    }
}

// ==========================================
// Trend Monitoring Agent
// ==========================================

interface TrendSource {
    name: string;
    url: string;
    type: 'rss' | 'api' | 'web';
    enabled: boolean;
}

class TrendAgent extends BaseAgent {
    type: AgentType = 'trend';
    name = 'Trend Monitoring Agent';
    description = 'Monitors trends and important updates';

    private sources: TrendSource[] = [];
    private keywords: string[] = [];
    private recentTrends: TrendItem[] = [];

    addSource(source: TrendSource): void {
        this.sources.push(source);
    }

    removeSource(name: string): void {
        this.sources = this.sources.filter(s => s.name !== name);
    }

    setKeywords(keywords: string[]): void {
        this.keywords = keywords;
    }

    getRecentTrends(): TrendItem[] {
        return [...this.recentTrends];
    }

    async run(): Promise<AgentResult> {
        if (this.keywords.length === 0) {
            return { success: true, summary: 'No keywords to monitor' };
        }

        try {
            const prompt = `Generate a brief trend update for these topics: ${this.keywords.join(', ')}.

For each topic, provide:
1. Current relevance (high/medium/low)
2. One key insight or development (1 sentence)

Format as a bulleted list.`;

            const response = await queryWithFallback(
                prompt,
                'You are a trend analyst. Provide realistic, current insights.',
                300
            );

            // Parse and store trends
            const lines = response.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
            const newTrends: TrendItem[] = lines.map((line, i) => ({
                title: line.replace(/^[-•]\s*/, '').trim(),
                source: 'AI Analysis',
                relevance: 0.8 - (i * 0.1),
                timestamp: new Date().toISOString(),
            }));

            this.recentTrends = [...newTrends, ...this.recentTrends].slice(0, 20);
            this.config.lastRun = new Date().toISOString();
            saveToDisk();

            return {
                success: true,
                data: newTrends,
                summary: `Found ${newTrends.length} trend updates`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    setRecentTrends(trends: TrendItem[]): void {
        this.recentTrends = trends;
    }
}

// ==========================================
// Prediction Agent
// ==========================================

class PredictionAgent extends BaseAgent {
    type: AgentType = 'prediction';
    name = 'Prediction Agent';
    description = 'Predicts tasks and activities based on patterns';

    private patterns: UserPattern[] = [];
    private predictions: TaskPrediction[] = [];

    recordActivity(activity: string): void {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();

        const existing = this.patterns.find(
            p => p.dayOfWeek === dayOfWeek &&
                p.hour === hour &&
                p.activity === activity
        );

        if (existing) {
            existing.frequency++;
        } else {
            this.patterns.push({
                dayOfWeek,
                hour,
                activity,
                frequency: 1,
            });
        }
    }

    getPatterns(): UserPattern[] {
        return [...this.patterns].sort((a, b) => b.frequency - a.frequency);
    }

    getPredictions(): TaskPrediction[] {
        return [...this.predictions];
    }

    async run(): Promise<AgentResult> {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();

        // Find patterns for current time
        const relevantPatterns = this.patterns
            .filter(p => p.dayOfWeek === dayOfWeek || Math.abs(p.hour - hour) <= 2)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        if (relevantPatterns.length === 0) {
            return { success: true, summary: 'Not enough data for predictions' };
        }

        try {
            const patternSummary = relevantPatterns
                .map(p => `${p.activity} (${p.frequency}x at ${p.hour}:00)`)
                .join(', ');

            const prompt = `Based on these user patterns: ${patternSummary}

Current time: ${now.toLocaleTimeString()} on ${now.toLocaleDateString('en-US', { weekday: 'long' })}

Suggest 2-3 tasks the user might want to do now. For each:
1. Task title
2. Why (based on patterns)
3. Confidence (high/medium/low)

Be specific and actionable.`;

            const response = await queryWithFallback(
                prompt,
                'You are a productivity assistant. Base suggestions on actual patterns.',
                300
            );

            // Parse predictions
            const newPredictions: TaskPrediction[] = [];
            const lines = response.split('\n').filter(l => l.trim());

            let currentPrediction: Partial<TaskPrediction> = {};
            for (const line of lines) {
                const lower = line.toLowerCase();
                if (lower.includes('task') || lower.includes('title') || line.match(/^\d+\./)) {
                    if (currentPrediction.title) {
                        newPredictions.push(currentPrediction as TaskPrediction);
                    }
                    currentPrediction = {
                        title: line.replace(/^[\d.*-]+\s*/, '').replace(/task:?/i, '').trim(),
                        confidence: 0.7,
                        reason: '',
                    };
                } else if (lower.includes('why') || lower.includes('reason') || lower.includes('because')) {
                    currentPrediction.reason = line.replace(/^[-*]+\s*/, '').trim();
                } else if (lower.includes('confidence')) {
                    currentPrediction.confidence = lower.includes('high') ? 0.9 : lower.includes('low') ? 0.5 : 0.7;
                }
            }
            if (currentPrediction.title) {
                newPredictions.push(currentPrediction as TaskPrediction);
            }

            this.predictions = newPredictions.slice(0, 5);
            this.config.lastRun = new Date().toISOString();
            saveToDisk();

            return {
                success: true,
                data: this.predictions,
                summary: `Generated ${this.predictions.length} task predictions`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    setPatterns(patterns: UserPattern[]): void {
        this.patterns = patterns;
    }

    setPredictions(predictions: TaskPrediction[]): void {
        this.predictions = predictions;
    }
}

// ==========================================
// Agent Manager
// ==========================================

class AgentManager {
    private agents: Map<AgentType, BaseAgent> = new Map();
    private tasks: AgentTask[] = [];
    private nextTaskId = 1;

    constructor() {
        // Initialize default agents
        this.agents.set('research', new ResearchAgent());
        this.agents.set('code-review', new CodeReviewAgent());
        this.agents.set('trend', new TrendAgent());
        this.agents.set('prediction', new PredictionAgent());
    }

    getAgent(type: AgentType): BaseAgent | undefined {
        return this.agents.get(type);
    }

    getResearchAgent(): ResearchAgent {
        return this.agents.get('research') as ResearchAgent;
    }

    getCodeReviewAgent(): CodeReviewAgent {
        return this.agents.get('code-review') as CodeReviewAgent;
    }

    getTrendAgent(): TrendAgent {
        return this.agents.get('trend') as TrendAgent;
    }

    getPredictionAgent(): PredictionAgent {
        return this.agents.get('prediction') as PredictionAgent;
    }

    getAllAgents(): { type: AgentType; name: string; status: AgentStatus; config: AgentConfig }[] {
        return Array.from(this.agents.entries()).map(([type, agent]) => ({
            type,
            name: agent.name,
            status: agent.getStatus(),
            config: agent.getConfig(),
        }));
    }

    configureAgent(type: AgentType, config: Partial<AgentConfig>): void {
        this.agents.get(type)?.configure(config);
    }

    startAgent(type: AgentType): void {
        this.agents.get(type)?.start();
    }

    stopAgent(type: AgentType): void {
        this.agents.get(type)?.stop();
    }

    pauseAgent(type: AgentType): void {
        this.agents.get(type)?.pause();
    }

    startAll(): void {
        this.agents.forEach(agent => agent.start());
    }

    stopAll(): void {
        this.agents.forEach(agent => agent.stop());
    }

    async runAgent(type: AgentType): Promise<AgentResult | null> {
        const agent = this.agents.get(type);
        if (!agent) return null;

        const task: AgentTask = {
            id: this.nextTaskId++,
            agentType: type,
            status: 'running',
            input: {},
            createdAt: new Date().toISOString(),
        };
        this.tasks.push(task);

        try {
            const result = await agent.run();
            task.status = result.success ? 'completed' : 'failed';
            task.output = { result };
            task.completedAt = new Date().toISOString();
            task.error = result.error;
            return result;
        } catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error';
            task.completedAt = new Date().toISOString();
            return { success: false, error: task.error };
        }
    }

    getRecentTasks(limit: number = 10): AgentTask[] {
        return [...this.tasks]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }

    clearTasks(): void {
        this.tasks = [];
        saveToDisk();
    }

    setTasks(tasks: AgentTask[], nextId: number): void {
        this.tasks = tasks;
        this.nextTaskId = nextId;
    }

    getTasks(): AgentTask[] {
        return [...this.tasks];
    }
}

// ==========================================
// Persistence
// ==========================================

export async function saveToDisk() {
    if (typeof window !== 'undefined' && window.wakey) {
        const research = agentManager.getResearchAgent();
        const trend = agentManager.getTrendAgent();
        const prediction = agentManager.getPredictionAgent();

        const data = {
            researchTopics: research.getTopics(),
            recentTrends: trend.getRecentTrends(),
            userPatterns: prediction.getPatterns(),
            predictions: prediction.getPredictions(),
            tasks: agentManager.getTasks(),
            nextTaskId: (agentManager as any).nextTaskId || 1
        };

        await window.wakey.saveAgentTasks(data.tasks);
        // We could add more specific store fields, but for now we'll reuse AgentTasks or add new ones
        // Since I added agentTasks to main process store, I'll use it.
    }
}

export async function loadFromDisk() {
    if (typeof window !== 'undefined' && window.wakey) {
        const savedTasks = await window.wakey.getAgentTasks();
        if (savedTasks) {
            agentManager.setTasks(savedTasks, Math.max(0, ...savedTasks.map((t: any) => t.id)) + 1);
        }
        // ... load other parts if we add them to main store
    }
}

// Initial load
if (typeof window !== 'undefined') {
    loadFromDisk();
}

// Singleton instance
export const agentManager = new AgentManager();

// Export types and manager
export { ResearchAgent, CodeReviewAgent, TrendAgent, PredictionAgent, AgentManager };
