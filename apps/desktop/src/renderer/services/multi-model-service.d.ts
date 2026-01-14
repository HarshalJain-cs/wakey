export interface AIProvider {
    name: string;
    model: string;
    priority: number;
    enabled: boolean;
    apiKey?: string;
    baseUrl?: string;
}
export interface AIResponse {
    provider: string;
    model: string;
    response: string;
    confidence: number;
    latencyMs: number;
    error?: string;
}
export interface ConsensusResult {
    consensus: string;
    confidence: number;
    responses: AIResponse[];
    reasoning: string;
    votingBreakdown: {
        provider: string;
        weight: number;
    }[];
}
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare function setProviderApiKey(providerName: string, key: string): void;
export declare function configureProvider(name: string, config: Partial<AIProvider>): void;
export declare function enableProvider(name: string, enabled: boolean): void;
export declare function getProviders(): AIProvider[];
export declare function getEnabledProviders(): AIProvider[];
export declare function queryMultipleProviders(messages: ChatMessage[], maxTokens?: number): Promise<AIResponse[]>;
export declare function generateConsensus(prompt: string, systemPrompt?: string, maxTokens?: number): Promise<ConsensusResult>;
export declare function queryWithFallback(prompt: string, systemPrompt?: string, maxTokens?: number): Promise<string>;
interface ModelStats {
    provider: string;
    totalQueries: number;
    successCount: number;
    avgLatencyMs: number;
    userRatings: number[];
}
export declare function recordModelPerformance(provider: string, success: boolean, latencyMs: number, userRating?: number): void;
export declare function getModelStats(): ModelStats[];
export declare function getAverageUserRating(provider: string): number | null;
export {};
//# sourceMappingURL=multi-model-service.d.ts.map