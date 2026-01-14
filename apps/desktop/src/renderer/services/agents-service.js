// Autonomous Agents Framework
// Background agents for research, code review, trends, and predictions
import { queryWithFallback } from './multi-model-service';
import { getContextForQuery, createNote } from './knowledge-service';
// ==========================================
// Base Agent Class
// ==========================================
class BaseAgent {
    config = {
        enabled: false,
        interval: 60,
        settings: {},
    };
    status = 'idle';
    intervalId = null;
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    getStatus() {
        return this.status;
    }
    start() {
        if (!this.config.enabled || this.intervalId)
            return;
        this.status = 'running';
        this.run(); // Initial run
        this.intervalId = setInterval(() => {
            this.run();
        }, this.config.interval * 60 * 1000);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.status = 'idle';
    }
    pause() {
        this.stop();
        this.status = 'paused';
    }
}
// ==========================================
// Research Agent
// ==========================================
class ResearchAgent extends BaseAgent {
    type = 'research';
    name = 'Research Agent';
    description = 'Monitors topics and generates research summaries';
    topics = [];
    addTopic(topic, keywords) {
        this.topics.push({
            topic,
            keywords,
            summaries: [],
        });
    }
    removeTopic(topic) {
        this.topics = this.topics.filter(t => t.topic !== topic);
    }
    getTopics() {
        return [...this.topics];
    }
    async run() {
        if (this.topics.length === 0) {
            return { success: true, summary: 'No topics to research' };
        }
        const results = [];
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
                const response = await queryWithFallback(prompt, 'You are a research assistant. Provide concise, factual updates.', 200);
                topic.summaries.push(response);
                topic.lastUpdated = new Date().toISOString();
                results.push(`${topic.topic}: ${response}`);
                // Optionally save to notes
                if (this.config.settings.saveToNotes) {
                    createNote(`Research: ${topic.topic} - ${new Date().toLocaleDateString()}`, response, ['research', 'auto-generated', ...topic.keywords]);
                }
            }
            catch (error) {
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
    setTopics(topics) {
        this.topics = topics;
    }
}
class CodeReviewAgent extends BaseAgent {
    type = 'code-review';
    name = 'Code Review Agent';
    description = 'Analyzes code patterns and suggests improvements';
    codeSnippets = [];
    patterns = [
        { pattern: 'console.log', description: 'Debug statement left in code', severity: 'warning' },
        { pattern: 'TODO', description: 'TODO comment found', severity: 'info' },
        { pattern: 'FIXME', description: 'FIXME comment found', severity: 'warning' },
        { pattern: 'any', description: 'TypeScript any type usage', severity: 'warning' },
        { pattern: 'catch\\s*\\(', description: 'Empty or generic catch block', severity: 'warning' },
    ];
    addCodeForReview(code, language, source) {
        this.codeSnippets.push({ code, language, source });
    }
    clearPendingReviews() {
        this.codeSnippets = [];
    }
    async run() {
        if (this.codeSnippets.length === 0) {
            return { success: true, summary: 'No code to review' };
        }
        const reviews = [];
        for (const snippet of this.codeSnippets) {
            const issues = [];
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
                const suggestions = await queryWithFallback(prompt, 'You are a senior code reviewer. Be concise and specific.', 250);
                reviews.push({
                    source: snippet.source,
                    issues,
                    suggestions,
                });
            }
            catch {
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
class TrendAgent extends BaseAgent {
    type = 'trend';
    name = 'Trend Monitoring Agent';
    description = 'Monitors trends and important updates';
    sources = [];
    keywords = [];
    recentTrends = [];
    addSource(source) {
        this.sources.push(source);
    }
    removeSource(name) {
        this.sources = this.sources.filter(s => s.name !== name);
    }
    setKeywords(keywords) {
        this.keywords = keywords;
    }
    getRecentTrends() {
        return [...this.recentTrends];
    }
    async run() {
        if (this.keywords.length === 0) {
            return { success: true, summary: 'No keywords to monitor' };
        }
        try {
            const prompt = `Generate a brief trend update for these topics: ${this.keywords.join(', ')}.

For each topic, provide:
1. Current relevance (high/medium/low)
2. One key insight or development (1 sentence)

Format as a bulleted list.`;
            const response = await queryWithFallback(prompt, 'You are a trend analyst. Provide realistic, current insights.', 300);
            // Parse and store trends
            const lines = response.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
            const newTrends = lines.map((line, i) => ({
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    setRecentTrends(trends) {
        this.recentTrends = trends;
    }
}
// ==========================================
// Prediction Agent
// ==========================================
class PredictionAgent extends BaseAgent {
    type = 'prediction';
    name = 'Prediction Agent';
    description = 'Predicts tasks and activities based on patterns';
    patterns = [];
    predictions = [];
    recordActivity(activity) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const existing = this.patterns.find(p => p.dayOfWeek === dayOfWeek &&
            p.hour === hour &&
            p.activity === activity);
        if (existing) {
            existing.frequency++;
        }
        else {
            this.patterns.push({
                dayOfWeek,
                hour,
                activity,
                frequency: 1,
            });
        }
    }
    getPatterns() {
        return [...this.patterns].sort((a, b) => b.frequency - a.frequency);
    }
    getPredictions() {
        return [...this.predictions];
    }
    async run() {
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
            const response = await queryWithFallback(prompt, 'You are a productivity assistant. Base suggestions on actual patterns.', 300);
            // Parse predictions
            const newPredictions = [];
            const lines = response.split('\n').filter(l => l.trim());
            let currentPrediction = {};
            for (const line of lines) {
                const lower = line.toLowerCase();
                if (lower.includes('task') || lower.includes('title') || line.match(/^\d+\./)) {
                    if (currentPrediction.title) {
                        newPredictions.push(currentPrediction);
                    }
                    currentPrediction = {
                        title: line.replace(/^[\d.\-\*]+\s*/, '').replace(/task:?/i, '').trim(),
                        confidence: 0.7,
                        reason: '',
                    };
                }
                else if (lower.includes('why') || lower.includes('reason') || lower.includes('because')) {
                    currentPrediction.reason = line.replace(/^[\-\*]+\s*/, '').trim();
                }
                else if (lower.includes('confidence')) {
                    currentPrediction.confidence = lower.includes('high') ? 0.9 : lower.includes('low') ? 0.5 : 0.7;
                }
            }
            if (currentPrediction.title) {
                newPredictions.push(currentPrediction);
            }
            this.predictions = newPredictions.slice(0, 5);
            this.config.lastRun = new Date().toISOString();
            saveToDisk();
            return {
                success: true,
                data: this.predictions,
                summary: `Generated ${this.predictions.length} task predictions`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    setPatterns(patterns) {
        this.patterns = patterns;
    }
    setPredictions(predictions) {
        this.predictions = predictions;
    }
}
// ==========================================
// Agent Manager
// ==========================================
class AgentManager {
    agents = new Map();
    tasks = [];
    nextTaskId = 1;
    constructor() {
        // Initialize default agents
        this.agents.set('research', new ResearchAgent());
        this.agents.set('code-review', new CodeReviewAgent());
        this.agents.set('trend', new TrendAgent());
        this.agents.set('prediction', new PredictionAgent());
    }
    getAgent(type) {
        return this.agents.get(type);
    }
    getResearchAgent() {
        return this.agents.get('research');
    }
    getCodeReviewAgent() {
        return this.agents.get('code-review');
    }
    getTrendAgent() {
        return this.agents.get('trend');
    }
    getPredictionAgent() {
        return this.agents.get('prediction');
    }
    getAllAgents() {
        return Array.from(this.agents.entries()).map(([type, agent]) => ({
            type,
            name: agent.name,
            status: agent.getStatus(),
            config: agent.getConfig(),
        }));
    }
    configureAgent(type, config) {
        this.agents.get(type)?.configure(config);
    }
    startAgent(type) {
        this.agents.get(type)?.start();
    }
    stopAgent(type) {
        this.agents.get(type)?.stop();
    }
    pauseAgent(type) {
        this.agents.get(type)?.pause();
    }
    startAll() {
        this.agents.forEach(agent => agent.start());
    }
    stopAll() {
        this.agents.forEach(agent => agent.stop());
    }
    async runAgent(type) {
        const agent = this.agents.get(type);
        if (!agent)
            return null;
        const task = {
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
        }
        catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error';
            task.completedAt = new Date().toISOString();
            return { success: false, error: task.error };
        }
    }
    getRecentTasks(limit = 10) {
        return [...this.tasks]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }
    clearTasks() {
        this.tasks = [];
        saveToDisk();
    }
    setTasks(tasks, nextId) {
        this.tasks = tasks;
        this.nextTaskId = nextId;
    }
    getTasks() {
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
            nextTaskId: agentManager.nextTaskId || 1
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
            agentManager.setTasks(savedTasks, Math.max(0, ...savedTasks.map((t) => t.id)) + 1);
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
//# sourceMappingURL=agents-service.js.map