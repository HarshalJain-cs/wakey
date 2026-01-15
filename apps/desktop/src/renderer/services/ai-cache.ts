/**
 * @fileoverview AI Response Caching Service
 * 
 * Provides caching for AI responses to reduce API calls and latency.
 * Uses in-memory LRU cache with TTL (time-to-live) support.
 * 
 * @module services/ai-cache
 */

// ============================================
// Types
// ============================================

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
    value: T;
    timestamp: number;
    hits: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
    /** Maximum number of entries */
    maxSize: number;
    /** Time-to-live in milliseconds */
    ttlMs: number;
    /** Whether caching is enabled */
    enabled: boolean;
}

// ============================================
// LRU Cache Implementation
// ============================================

/**
 * LRU (Least Recently Used) Cache with TTL support.
 * 
 * @template T - Type of cached values
 */
export class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private config: CacheConfig;
    private totalHits = 0;
    private totalMisses = 0;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize ?? 100,
            ttlMs: config.ttlMs ?? 5 * 60 * 1000, // 5 minutes default
            enabled: config.enabled ?? true,
        };
    }

    /**
     * Generates a cache key from input parameters.
     * Uses a simple hash of the stringified input.
     */
    static generateKey(input: unknown): string {
        const str = JSON.stringify(input);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `cache_${hash.toString(36)}`;
    }

    /**
     * Gets a value from cache if valid.
     * Returns undefined if not found or expired.
     */
    get(key: string): T | undefined {
        if (!this.config.enabled) return undefined;

        const entry = this.cache.get(key);
        if (!entry) {
            this.totalMisses++;
            return undefined;
        }

        // Check TTL
        if (Date.now() - entry.timestamp > this.config.ttlMs) {
            this.cache.delete(key);
            this.totalMisses++;
            return undefined;
        }

        // Update LRU order and hit count
        entry.hits++;
        this.cache.delete(key);
        this.cache.set(key, entry);
        this.totalHits++;

        return entry.value;
    }

    /**
     * Sets a value in cache.
     * Evicts oldest entries if at capacity.
     */
    set(key: string, value: T): void {
        if (!this.config.enabled) return;

        // Evict oldest if at capacity
        if (this.cache.size >= this.config.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            hits: 0,
        });
    }

    /**
     * Checks if key exists and is not expired.
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (Date.now() - entry.timestamp > this.config.ttlMs) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Deletes a specific key.
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clears all cache entries.
     */
    clear(): void {
        this.cache.clear();
        this.totalHits = 0;
        this.totalMisses = 0;
    }

    /**
     * Gets cache statistics.
     */
    getStats(): CacheStats {
        const total = this.totalHits + this.totalMisses;
        return {
            size: this.cache.size,
            hits: this.totalHits,
            misses: this.totalMisses,
            hitRate: total > 0 ? this.totalHits / total : 0,
        };
    }

    /**
     * Updates cache configuration.
     */
    configure(config: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Removes expired entries.
     */
    prune(): number {
        const now = Date.now();
        let pruned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.config.ttlMs) {
                this.cache.delete(key);
                pruned++;
            }
        }

        return pruned;
    }
}

// ============================================
// AI-Specific Cache
// ============================================

/**
 * AI response cache configuration
 */
interface AIQueryCacheKey {
    prompt: string;
    systemPrompt?: string;
    provider?: string;
    maxTokens?: number;
}

/**
 * Singleton AI response cache
 */
export const aiCache = new LRUCache<string>({
    maxSize: 200,
    ttlMs: 10 * 60 * 1000, // 10 minutes
    enabled: true,
});

/**
 * Gets cached AI response if available.
 */
export function getCachedResponse(params: AIQueryCacheKey): string | undefined {
    const key = LRUCache.generateKey(params);
    return aiCache.get(key);
}

/**
 * Caches an AI response.
 */
export function cacheResponse(params: AIQueryCacheKey, response: string): void {
    const key = LRUCache.generateKey(params);
    aiCache.set(key, response);
}

/**
 * Wrapper function for caching AI queries.
 * 
 * @example
 * const response = await withCache(
 *   { prompt: 'Hello', systemPrompt: 'Be brief' },
 *   async () => await queryAI('Hello', 'Be brief')
 * );
 */
export async function withCache<T>(
    params: AIQueryCacheKey,
    queryFn: () => Promise<T>
): Promise<T> {
    const cached = getCachedResponse(params);
    if (cached !== undefined) {
        return cached as T;
    }

    const result = await queryFn();

    if (typeof result === 'string') {
        cacheResponse(params, result);
    }

    return result;
}

export default aiCache;
