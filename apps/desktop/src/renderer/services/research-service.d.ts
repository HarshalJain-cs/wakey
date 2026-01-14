export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    relevanceScore?: number;
}
export interface ResearchSession {
    id: number;
    query: string;
    results: SearchResult[];
    summary: string;
    keyFindings: string[];
    sources: string[];
    createdAt: string;
    savedToKnowledge: boolean;
}
export interface ResearchConfig {
    maxResults: number;
    includeAISummary: boolean;
    autoSaveToKnowledge: boolean;
}
/**
 * Search the web using DuckDuckGo Instant Answer API
 * This is free and doesn't require an API key
 */
export declare function searchWeb(query: string): Promise<SearchResult[]>;
/**
 * Conduct a full research session with AI summarization
 */
export declare function conductResearch(query: string): Promise<ResearchSession>;
export declare function getResearchHistory(): ResearchSession[];
export declare function getResearchSession(id: number): ResearchSession | undefined;
export declare function deleteResearchSession(id: number): void;
export declare function clearResearchHistory(): void;
export declare function getResearchConfig(): ResearchConfig;
export declare function updateResearchConfig(newConfig: Partial<ResearchConfig>): void;
export declare function markAsSavedToKnowledge(sessionId: number): void;
/**
 * Generate note content from a research session
 */
export declare function generateNoteFromSession(session: ResearchSession): {
    title: string;
    content: string;
    tags: string[];
};
/**
 * Quick inline research - returns a brief answer
 */
export declare function quickResearch(question: string): Promise<string>;
//# sourceMappingURL=research-service.d.ts.map