/**
 * @fileoverview Conversation Memory Service
 * 
 * Manages conversation context for AI interactions.
 * Maintains message history with truncation for context window optimization.
 * 
 * @module services/conversation-memory
 */

// ============================================
// Types
// ============================================

/**
 * Represents a conversation message
 */
export interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * Conversation context with metadata
 */
export interface ConversationContext {
    id: string;
    messages: ConversationMessage[];
    createdAt: number;
    lastActiveAt: number;
    metadata?: Record<string, unknown>;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
    /** Maximum messages to keep */
    maxMessages: number;
    /** Maximum tokens to keep (approximate) */
    maxTokens: number;
    /** Whether to include system message in truncation */
    preserveSystemMessage: boolean;
    /** How long to keep inactive conversations (ms) */
    inactivityTimeoutMs: number;
}

// ============================================
// Conversation Memory Manager
// ============================================

/**
 * Manages conversation contexts with automatic truncation and cleanup.
 */
export class ConversationMemory {
    private conversations: Map<string, ConversationContext> = new Map();
    private config: MemoryConfig;

    constructor(config: Partial<MemoryConfig> = {}) {
        this.config = {
            maxMessages: config.maxMessages ?? 20,
            maxTokens: config.maxTokens ?? 4000,
            preserveSystemMessage: config.preserveSystemMessage ?? true,
            inactivityTimeoutMs: config.inactivityTimeoutMs ?? 30 * 60 * 1000, // 30 min
        };
    }

    /**
     * Creates a new conversation.
     */
    create(id?: string, systemMessage?: string): string {
        const conversationId = id ?? this.generateId();
        const messages: ConversationMessage[] = [];

        if (systemMessage) {
            messages.push({
                role: 'system',
                content: systemMessage,
                timestamp: Date.now(),
            });
        }

        this.conversations.set(conversationId, {
            id: conversationId,
            messages,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
        });

        return conversationId;
    }

    /**
     * Adds a message to a conversation.
     */
    addMessage(
        conversationId: string,
        role: 'user' | 'assistant',
        content: string
    ): void {
        const context = this.conversations.get(conversationId);
        if (!context) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        context.messages.push({
            role,
            content,
            timestamp: Date.now(),
        });

        context.lastActiveAt = Date.now();

        // Truncate if needed
        this.truncateIfNeeded(conversationId);
    }

    /**
     * Gets conversation messages formatted for AI API.
     */
    getMessages(conversationId: string): ConversationMessage[] {
        const context = this.conversations.get(conversationId);
        if (!context) return [];
        return [...context.messages];
    }

    /**
     * Gets the full context including metadata.
     */
    getContext(conversationId: string): ConversationContext | undefined {
        return this.conversations.get(conversationId);
    }

    /**
     * Updates conversation metadata.
     */
    setMetadata(
        conversationId: string,
        metadata: Record<string, unknown>
    ): void {
        const context = this.conversations.get(conversationId);
        if (context) {
            context.metadata = { ...context.metadata, ...metadata };
        }
    }

    /**
     * Clears a conversation's messages while keeping context.
     */
    clearMessages(conversationId: string): void {
        const context = this.conversations.get(conversationId);
        if (context) {
            // Keep system message if exists
            const systemMessage = context.messages.find(m => m.role === 'system');
            context.messages = systemMessage ? [systemMessage] : [];
            context.lastActiveAt = Date.now();
        }
    }

    /**
     * Deletes a conversation entirely.
     */
    delete(conversationId: string): boolean {
        return this.conversations.delete(conversationId);
    }

    /**
     * Lists all active conversations.
     */
    listConversations(): ConversationContext[] {
        return Array.from(this.conversations.values());
    }

    /**
     * Truncates messages to fit within limits.
     */
    private truncateIfNeeded(conversationId: string): void {
        const context = this.conversations.get(conversationId);
        if (!context) return;

        // Truncate by message count
        if (context.messages.length > this.config.maxMessages) {
            const systemMessage = this.config.preserveSystemMessage
                ? context.messages.find(m => m.role === 'system')
                : undefined;

            const nonSystemMessages = context.messages.filter(m => m.role !== 'system');
            const keepCount = this.config.maxMessages - (systemMessage ? 1 : 0);
            const truncated = nonSystemMessages.slice(-keepCount);

            context.messages = systemMessage ? [systemMessage, ...truncated] : truncated;
        }

        // Truncate by approximate token count
        let totalTokens = this.estimateTokens(context.messages);
        while (totalTokens > this.config.maxTokens && context.messages.length > 1) {
            // Remove oldest non-system message
            const idx = context.messages.findIndex(m => m.role !== 'system');
            if (idx !== -1) {
                context.messages.splice(idx, 1);
                totalTokens = this.estimateTokens(context.messages);
            } else {
                break;
            }
        }
    }

    /**
     * Estimates token count (rough approximation: 4 chars per token).
     */
    private estimateTokens(messages: ConversationMessage[]): number {
        return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    }

    /**
     * Generates a unique conversation ID.
     */
    private generateId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Cleans up inactive conversations.
     */
    cleanup(): number {
        const now = Date.now();
        let cleaned = 0;

        for (const [id, context] of this.conversations.entries()) {
            if (now - context.lastActiveAt > this.config.inactivityTimeoutMs) {
                this.conversations.delete(id);
                cleaned++;
            }
        }

        return cleaned;
    }

    /**
     * Updates configuration.
     */
    configure(config: Partial<MemoryConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// ============================================
// Singleton Instance
// ============================================

/**
 * Default conversation memory instance.
 */
export const conversationMemory = new ConversationMemory();

export default conversationMemory;
