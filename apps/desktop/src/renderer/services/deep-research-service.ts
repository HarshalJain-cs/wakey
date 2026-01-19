/**
 * @fileoverview Deep Research Agent Service
 * 
 * Autonomous research agent that performs background research on tasks and topics.
 * Uses multiple sources to gather, analyze, and summarize information.
 * 
 * Features:
 * - Web search integration
 * - Multi-source fact aggregation
 * - Auto-generation of research reports
 * - Background research while user works
 * 
 * @module services/deep-research-service
 */

// ============================================
// Types
// ============================================

export interface ResearchTopic {
    id: string;
    query: string;
    status: 'pending' | 'researching' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    sources: ResearchSource[];
    findings: ResearchFinding[];
    summary: string | null;
    createdAt: Date;
    completedAt: Date | null;
    confidence: number; // 0-100
}

export interface ResearchSource {
    id: string;
    url: string;
    title: string;
    snippet: string;
    reliability: number; // 0-100
    type: 'web' | 'academic' | 'news' | 'wiki' | 'github';
    timestamp: Date;
}

export interface ResearchFinding {
    id: string;
    content: string;
    sourceIds: string[];
    relevance: number; // 0-100
    category: 'fact' | 'opinion' | 'statistic' | 'definition' | 'example';
}

export interface ResearchReport {
    topicId: string;
    title: string;
    summary: string;
    keyFindings: string[];
    sources: ResearchSource[];
    recommendations: string[];
    generatedAt: Date;
    wordCount: number;
}

interface DeepResearchConfig {
    enabled: boolean;
    autoResearchTasks: boolean;
    maxConcurrentResearch: number;
    maxSourcesPerTopic: number;
    cacheHours: number;
    preferredSources: ('web' | 'academic' | 'news' | 'wiki' | 'github')[];
}

// ============================================
// Deep Research Service
// ============================================

class DeepResearchService {
    private config: DeepResearchConfig;
    private topics: Map<string, ResearchTopic> = new Map();
    private researchQueue: string[] = [];
    private isProcessing = false;

    constructor() {
        this.config = this.loadConfig();
        this.loadTopics();
    }

    private loadConfig(): DeepResearchConfig {
        try {
            const stored = localStorage.getItem('wakey_deep_research_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load research config:', error);
        }

        return {
            enabled: true,
            autoResearchTasks: true,
            maxConcurrentResearch: 3,
            maxSourcesPerTopic: 10,
            cacheHours: 24,
            preferredSources: ['web', 'wiki', 'github'],
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_deep_research_config', JSON.stringify(this.config));
    }

    private loadTopics(): void {
        try {
            const stored = localStorage.getItem('wakey_research_topics');
            if (stored) {
                const data = JSON.parse(stored);
                this.topics = new Map(data.map((t: ResearchTopic) => [t.id, t]));
            }
        } catch (error) {
            console.error('Failed to load research topics:', error);
        }
    }

    private saveTopics(): void {
        const data = Array.from(this.topics.values());
        localStorage.setItem('wakey_research_topics', JSON.stringify(data));
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * Start research on a new topic
     */
    async startResearch(query: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<ResearchTopic> {
        const topicId = `research_${Date.now()}`;

        const topic: ResearchTopic = {
            id: topicId,
            query,
            status: 'pending',
            priority,
            sources: [],
            findings: [],
            summary: null,
            createdAt: new Date(),
            completedAt: null,
            confidence: 0,
        };

        this.topics.set(topicId, topic);
        this.researchQueue.push(topicId);
        this.saveTopics();

        // Start processing if not already
        if (!this.isProcessing) {
            this.processQueue();
        }

        return topic;
    }

    /**
     * Get research topic by ID
     */
    getTopic(topicId: string): ResearchTopic | undefined {
        return this.topics.get(topicId);
    }

    /**
     * Get all research topics
     */
    getAllTopics(): ResearchTopic[] {
        return Array.from(this.topics.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    /**
     * Get recent completed research
     */
    getCompletedResearch(limit: number = 10): ResearchTopic[] {
        return this.getAllTopics()
            .filter(t => t.status === 'completed')
            .slice(0, limit);
    }

    /**
     * Get pending research count
     */
    getPendingCount(): number {
        return this.researchQueue.length;
    }

    /**
     * Auto-research a task (called when task is created)
     */
    async autoResearchTask(taskTitle: string): Promise<ResearchTopic | null> {
        if (!this.config.enabled || !this.config.autoResearchTasks) {
            return null;
        }

        // Generate research query from task
        const query = this.generateQueryFromTask(taskTitle);
        if (!query) return null;

        return this.startResearch(query, 'medium');
    }

    /**
     * Generate a research report
     */
    generateReport(topicId: string): ResearchReport | null {
        const topic = this.topics.get(topicId);
        if (!topic || topic.status !== 'completed') {
            return null;
        }

        return {
            topicId,
            title: `Research Report: ${topic.query}`,
            summary: topic.summary || 'No summary available.',
            keyFindings: topic.findings.slice(0, 5).map(f => f.content),
            sources: topic.sources,
            recommendations: this.generateRecommendations(topic),
            generatedAt: new Date(),
            wordCount: topic.summary?.split(' ').length || 0,
        };
    }

    /**
     * Cancel research
     */
    cancelResearch(topicId: string): void {
        const index = this.researchQueue.indexOf(topicId);
        if (index > -1) {
            this.researchQueue.splice(index, 1);
        }

        const topic = this.topics.get(topicId);
        if (topic && topic.status === 'pending') {
            topic.status = 'failed';
            this.saveTopics();
        }
    }

    /**
     * Clear old research
     */
    clearOldResearch(daysOld: number = 7): number {
        const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        let removed = 0;

        for (const [id, topic] of this.topics) {
            if (topic.createdAt.getTime() < cutoff) {
                this.topics.delete(id);
                removed++;
            }
        }

        this.saveTopics();
        return removed;
    }

    // ============================================
    // Research Processing
    // ============================================

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.researchQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.researchQueue.length > 0) {
            const topicId = this.researchQueue.shift()!;
            const topic = this.topics.get(topicId);

            if (!topic || topic.status !== 'pending') {
                continue;
            }

            await this.performResearch(topic);
        }

        this.isProcessing = false;
    }

    private async performResearch(topic: ResearchTopic): Promise<void> {
        topic.status = 'researching';
        this.saveTopics();

        try {
            // Step 1: Generate search queries
            const queries = this.generateSearchQueries(topic.query);

            // Step 2: Perform searches (simulated for now)
            const sources = await this.searchSources(queries);
            topic.sources = sources;

            // Step 3: Extract findings
            const findings = this.extractFindings(sources, topic.query);
            topic.findings = findings;

            // Step 4: Generate summary using AI
            topic.summary = await this.generateSummary(topic);

            // Step 5: Calculate confidence
            topic.confidence = this.calculateConfidence(topic);

            topic.status = 'completed';
            topic.completedAt = new Date();
        } catch (error) {
            console.error(`Research failed for topic ${topic.id}:`, error);
            topic.status = 'failed';
        }

        this.saveTopics();
    }

    private generateSearchQueries(query: string): string[] {
        // Generate multiple search queries for comprehensive research
        const queries = [query];

        // Add variations
        queries.push(`${query} best practices`);
        queries.push(`${query} tutorial guide`);
        queries.push(`${query} examples`);
        queries.push(`how to ${query}`);

        return queries.slice(0, 5);
    }

    private async searchSources(queries: string[]): Promise<ResearchSource[]> {
        const sources: ResearchSource[] = [];

        // Simulated search results - in production, would use SerpAPI, Perplexity, etc.
        for (const query of queries) {
            const mockSources = this.getMockSearchResults(query);
            sources.push(...mockSources);
        }

        // Deduplicate and limit
        const uniqueSources = this.deduplicateSources(sources);
        return uniqueSources.slice(0, this.config.maxSourcesPerTopic);
    }

    private getMockSearchResults(query: string): ResearchSource[] {
        // Mock search results - replace with real API calls in production
        const mockResults: ResearchSource[] = [
            {
                id: `src_${Date.now()}_1`,
                url: `https://developer.mozilla.org/en-US/docs/${encodeURIComponent(query)}`,
                title: `${query} - MDN Web Docs`,
                snippet: `Comprehensive documentation and guides for ${query}. Learn the fundamentals and best practices.`,
                reliability: 95,
                type: 'wiki',
                timestamp: new Date(),
            },
            {
                id: `src_${Date.now()}_2`,
                url: `https://github.com/topics/${encodeURIComponent(query.toLowerCase().replace(/ /g, '-'))}`,
                title: `${query} GitHub Repositories`,
                snippet: `Open source projects and examples related to ${query}. Find code samples and implementations.`,
                reliability: 85,
                type: 'github',
                timestamp: new Date(),
            },
            {
                id: `src_${Date.now()}_3`,
                url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(query.toLowerCase())}`,
                title: `${query} Questions - Stack Overflow`,
                snippet: `Community Q&A about ${query}. Find solutions to common problems and expert answers.`,
                reliability: 80,
                type: 'web',
                timestamp: new Date(),
            },
        ];

        return mockResults;
    }

    private deduplicateSources(sources: ResearchSource[]): ResearchSource[] {
        const seen = new Set<string>();
        return sources.filter(source => {
            const key = source.url;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private extractFindings(sources: ResearchSource[], _query: string): ResearchFinding[] {
        // Extract key findings from sources
        const findings: ResearchFinding[] = [];

        for (const source of sources) {
            findings.push({
                id: `finding_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                content: source.snippet,
                sourceIds: [source.id],
                relevance: Math.min(100, source.reliability + 10),
                category: this.categorizeContent(source.snippet),
            });
        }

        // Sort by relevance
        return findings.sort((a, b) => b.relevance - a.relevance);
    }

    private categorizeContent(content: string): ResearchFinding['category'] {
        const lower = content.toLowerCase();

        if (lower.includes('%') || lower.includes('statistics') || /\d+/.test(content)) {
            return 'statistic';
        }
        if (lower.includes('is defined as') || lower.includes('means')) {
            return 'definition';
        }
        if (lower.includes('example') || lower.includes('for instance')) {
            return 'example';
        }
        if (lower.includes('i think') || lower.includes('opinion') || lower.includes('believe')) {
            return 'opinion';
        }
        return 'fact';
    }

    private async generateSummary(topic: ResearchTopic): Promise<string> {
        // Generate summary from findings
        // In production, would use AI (Groq/Ollama) to generate this

        const topFindings = topic.findings.slice(0, 5);
        const sourceNames = topic.sources.slice(0, 3).map(s => s.title).join(', ');

        return `Research on "${topic.query}" found ${topic.sources.length} relevant sources including ${sourceNames}. ` +
            `Key insights: ${topFindings.map(f => f.content).join(' ')}`;
    }

    private calculateConfidence(topic: ResearchTopic): number {
        if (topic.sources.length === 0) return 0;

        // Average source reliability
        const avgReliability = topic.sources.reduce((sum, s) => sum + s.reliability, 0) / topic.sources.length;

        // Factor in number of sources
        const sourceFactor = Math.min(1, topic.sources.length / this.config.maxSourcesPerTopic);

        // Factor in consensus (how similar findings are)
        const consensusFactor = topic.findings.length > 0 ? 0.8 : 0.5;

        return Math.round(avgReliability * sourceFactor * consensusFactor);
    }

    private generateRecommendations(topic: ResearchTopic): string[] {
        const recommendations: string[] = [];

        if (topic.confidence < 70) {
            recommendations.push('Consider verifying findings with additional sources.');
        }

        if (topic.sources.filter(s => s.type === 'academic').length === 0) {
            recommendations.push('No academic sources found - consider searching scholarly databases.');
        }

        recommendations.push('Review the source links for more detailed information.');

        return recommendations;
    }

    private generateQueryFromTask(taskTitle: string): string | null {
        // Extract meaningful research query from task title
        const lower = taskTitle.toLowerCase();

        // Skip tasks that don't need research
        if (lower.includes('meeting') || lower.includes('call') || lower.includes('email')) {
            return null;
        }

        // Technical tasks
        if (lower.includes('implement') || lower.includes('build') || lower.includes('create')) {
            const techPart = taskTitle.replace(/^(implement|build|create)\s+/i, '');
            return `how to ${techPart}`;
        }

        // Research/learn tasks
        if (lower.includes('learn') || lower.includes('research') || lower.includes('understand')) {
            return taskTitle.replace(/^(learn|research|understand)\s*(about|how to)?\s*/i, '');
        }

        // Fix/debug tasks
        if (lower.includes('fix') || lower.includes('debug') || lower.includes('solve')) {
            return `${taskTitle} solution`;
        }

        return taskTitle;
    }

    // ============================================
    // Configuration
    // ============================================

    getConfig(): DeepResearchConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<DeepResearchConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    toggle(): void {
        this.config.enabled = !this.config.enabled;
        this.saveConfig();
    }
}

// Singleton instance
export const deepResearchService = new DeepResearchService();
export default deepResearchService;
