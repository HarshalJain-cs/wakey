// Multi-Model AI Service with Consensus Generation
// Supports: Groq, Ollama, OpenAI-compatible, Claude

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
    votingBreakdown: { provider: string; weight: number }[];
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Default providers
const DEFAULT_PROVIDERS: AIProvider[] = [
    {
        name: 'groq',
        model: 'llama3-8b-8192',
        priority: 1,
        enabled: true,
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    },
    {
        name: 'ollama',
        model: 'llama3.2',
        priority: 2,
        enabled: true,
        baseUrl: 'http://localhost:11434/api/generate',
    },
    {
        name: 'openai',
        model: 'gpt-3.5-turbo',
        priority: 3,
        enabled: false,
        baseUrl: 'https://api.openai.com/v1/chat/completions',
    },
    {
        name: 'claude',
        model: 'claude-3-haiku-20240307',
        priority: 4,
        enabled: false,
        baseUrl: 'https://api.anthropic.com/v1/messages',
    },
];

let providers: AIProvider[] = [...DEFAULT_PROVIDERS];
let apiKeys: Record<string, string> = {};

// Provider configuration
export function setProviderApiKey(providerName: string, key: string): void {
    apiKeys[providerName] = key;
}

export function configureProvider(name: string, config: Partial<AIProvider>): void {
    const idx = providers.findIndex(p => p.name === name);
    if (idx !== -1) {
        providers[idx] = { ...providers[idx], ...config };
    }
}

export function enableProvider(name: string, enabled: boolean): void {
    const idx = providers.findIndex(p => p.name === name);
    if (idx !== -1) {
        providers[idx].enabled = enabled;
    }
}

export function getProviders(): AIProvider[] {
    return [...providers];
}

export function getEnabledProviders(): AIProvider[] {
    return providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
}

// Individual provider calls
async function callGroq(messages: ChatMessage[], maxTokens: number = 200): Promise<string> {
    const key = apiKeys['groq'];
    if (!key) throw new Error('Groq API key not set');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: providers.find(p => p.name === 'groq')?.model || 'llama3-8b-8192',
            messages,
            max_tokens: maxTokens,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

async function callOllama(prompt: string): Promise<string> {
    const model = providers.find(p => p.name === 'ollama')?.model || 'llama3.2';

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error('Ollama not available');
    }

    const data = await response.json();
    return data.response || '';
}

async function callOpenAI(messages: ChatMessage[], maxTokens: number = 200): Promise<string> {
    const key = apiKeys['openai'];
    if (!key) throw new Error('OpenAI API key not set');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: providers.find(p => p.name === 'openai')?.model || 'gpt-3.5-turbo',
            messages,
            max_tokens: maxTokens,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

async function callClaude(messages: ChatMessage[], maxTokens: number = 200): Promise<string> {
    const key = apiKeys['claude'];
    if (!key) throw new Error('Claude API key not set');

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: providers.find(p => p.name === 'claude')?.model || 'claude-3-haiku-20240307',
            max_tokens: maxTokens,
            system: systemMessage,
            messages: userMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            })),
        }),
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
}

// Query a single provider
async function queryProvider(
    provider: AIProvider,
    messages: ChatMessage[],
    maxTokens: number
): Promise<AIResponse> {
    const startTime = Date.now();

    try {
        let response: string;

        switch (provider.name) {
            case 'groq':
                response = await callGroq(messages, maxTokens);
                break;
            case 'ollama':
                const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
                response = await callOllama(prompt);
                break;
            case 'openai':
                response = await callOpenAI(messages, maxTokens);
                break;
            case 'claude':
                response = await callClaude(messages, maxTokens);
                break;
            default:
                throw new Error(`Unknown provider: ${provider.name}`);
        }

        return {
            provider: provider.name,
            model: provider.model,
            response,
            confidence: 1.0,
            latencyMs: Date.now() - startTime,
        };
    } catch (error) {
        return {
            provider: provider.name,
            model: provider.model,
            response: '',
            confidence: 0,
            latencyMs: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Query multiple providers in parallel
export async function queryMultipleProviders(
    messages: ChatMessage[],
    maxTokens: number = 200
): Promise<AIResponse[]> {
    const enabledProviders = getEnabledProviders();

    if (enabledProviders.length === 0) {
        throw new Error('No AI providers enabled');
    }

    const queries = enabledProviders.map(provider =>
        queryProvider(provider, messages, maxTokens)
    );

    const responses = await Promise.allSettled(queries);

    return responses
        .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === 'fulfilled')
        .map(r => r.value);
}

// Calculate text similarity (simple Jaccard)
function calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
}

// Generate consensus from multiple responses
export async function generateConsensus(
    prompt: string,
    systemPrompt: string = '',
    maxTokens: number = 200
): Promise<ConsensusResult> {
    const messages: ChatMessage[] = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const responses = await queryMultipleProviders(messages, maxTokens);
    const validResponses = responses.filter(r => !r.error && r.response);

    if (validResponses.length === 0) {
        return {
            consensus: 'Unable to generate response. All providers failed.',
            confidence: 0,
            responses,
            reasoning: 'No valid responses from any provider.',
            votingBreakdown: [],
        };
    }

    if (validResponses.length === 1) {
        const r = validResponses[0];
        return {
            consensus: r.response,
            confidence: 0.7, // Lower confidence with single source
            responses,
            reasoning: `Single provider response from ${r.provider}.`,
            votingBreakdown: [{ provider: r.provider, weight: 1.0 }],
        };
    }

    // Calculate weights based on priority and latency
    const weights: { provider: string; weight: number }[] = validResponses.map(r => {
        const provider = providers.find(p => p.name === r.provider);
        const priorityWeight = provider ? (5 - provider.priority) / 4 : 0.5;
        const latencyWeight = Math.max(0.1, 1 - (r.latencyMs / 5000)); // Faster = better
        return {
            provider: r.provider,
            weight: (priorityWeight * 0.6 + latencyWeight * 0.4),
        };
    });

    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    weights.forEach(w => w.weight /= totalWeight);

    // Calculate similarity between responses
    const similarities: number[] = [];
    for (let i = 0; i < validResponses.length; i++) {
        let avgSimilarity = 0;
        for (let j = 0; j < validResponses.length; j++) {
            if (i !== j) {
                avgSimilarity += calculateSimilarity(
                    validResponses[i].response,
                    validResponses[j].response
                );
            }
        }
        similarities.push(avgSimilarity / (validResponses.length - 1));
    }

    // Select the response with highest weighted score
    let bestScore = -1;
    let bestResponse = validResponses[0];

    for (let i = 0; i < validResponses.length; i++) {
        const score = weights[i].weight * 0.5 + similarities[i] * 0.5;
        if (score > bestScore) {
            bestScore = score;
            bestResponse = validResponses[i];
        }
    }

    // Calculate overall confidence
    const avgSimilarity = similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
    const confidence = Math.min(0.95, 0.5 + avgSimilarity * 0.5);

    // Generate reasoning
    const agreementLevel = avgSimilarity > 0.7 ? 'high' : avgSimilarity > 0.4 ? 'moderate' : 'low';
    const reasoning = `${validResponses.length} providers responded with ${agreementLevel} agreement. ` +
        `Best response from ${bestResponse.provider} (${bestResponse.model}) ` +
        `with ${Math.round(confidence * 100)}% confidence.`;

    return {
        consensus: bestResponse.response,
        confidence,
        responses,
        reasoning,
        votingBreakdown: weights,
    };
}

// Simple single-provider query with fallback
export async function queryWithFallback(
    prompt: string,
    systemPrompt: string = '',
    maxTokens: number = 200
): Promise<string> {
    const messages: ChatMessage[] = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const enabledProviders = getEnabledProviders();

    for (const provider of enabledProviders) {
        try {
            const response = await queryProvider(provider, messages, maxTokens);
            if (!response.error && response.response) {
                return response.response;
            }
        } catch {
            continue;
        }
    }

    throw new Error('All AI providers failed');
}

// Model performance tracking
interface ModelStats {
    provider: string;
    totalQueries: number;
    successCount: number;
    avgLatencyMs: number;
    userRatings: number[];
}

const modelStats: Map<string, ModelStats> = new Map();

export function recordModelPerformance(
    provider: string,
    success: boolean,
    latencyMs: number,
    userRating?: number
): void {
    let stats = modelStats.get(provider);
    if (!stats) {
        stats = {
            provider,
            totalQueries: 0,
            successCount: 0,
            avgLatencyMs: 0,
            userRatings: [],
        };
        modelStats.set(provider, stats);
    }

    stats.totalQueries++;
    if (success) stats.successCount++;
    stats.avgLatencyMs = (stats.avgLatencyMs * (stats.totalQueries - 1) + latencyMs) / stats.totalQueries;
    if (userRating !== undefined) {
        stats.userRatings.push(userRating);
    }
}

export function getModelStats(): ModelStats[] {
    return Array.from(modelStats.values());
}

export function getAverageUserRating(provider: string): number | null {
    const stats = modelStats.get(provider);
    if (!stats || stats.userRatings.length === 0) return null;
    return stats.userRatings.reduce((sum, r) => sum + r, 0) / stats.userRatings.length;
}
