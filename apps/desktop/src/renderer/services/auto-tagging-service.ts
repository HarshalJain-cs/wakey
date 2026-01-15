/**
 * @fileoverview Auto-Tagging Service
 * 
 * Automatically tags notes, tasks, and documents using AI classification.
 * Uses pattern matching and optional AI for intelligent tagging.
 */

export interface TagSuggestion {
    tag: string;
    confidence: number; // 0-1
    reason: string;
}

export interface TagCategory {
    name: string;
    tags: string[];
    color: string;
}

// Predefined tag categories
const TAG_CATEGORIES: TagCategory[] = [
    {
        name: 'Priority',
        tags: ['urgent', 'high-priority', 'low-priority', 'backlog'],
        color: '#ef4444',
    },
    {
        name: 'Type',
        tags: ['bug', 'feature', 'improvement', 'documentation', 'refactor'],
        color: '#3b82f6',
    },
    {
        name: 'Status',
        tags: ['todo', 'in-progress', 'blocked', 'review', 'done'],
        color: '#22c55e',
    },
    {
        name: 'Domain',
        tags: ['frontend', 'backend', 'database', 'api', 'devops', 'design'],
        color: '#8b5cf6',
    },
    {
        name: 'Project',
        tags: ['wakey', 'personal', 'work', 'learning'],
        color: '#f59e0b',
    },
    {
        name: 'Topic',
        tags: ['meeting', 'research', 'planning', 'coding', 'testing'],
        color: '#06b6d4',
    },
];

// Keyword patterns for auto-detection
const KEYWORD_PATTERNS: { pattern: RegExp; tag: string; confidence: number }[] = [
    // Priority
    { pattern: /\b(urgent|asap|critical|immediately)\b/i, tag: 'urgent', confidence: 0.9 },
    { pattern: /\b(important|high priority|must have)\b/i, tag: 'high-priority', confidence: 0.8 },
    { pattern: /\b(nice to have|optional|low priority)\b/i, tag: 'low-priority', confidence: 0.8 },

    // Type
    { pattern: /\b(bug|issue|error|broken|fix)\b/i, tag: 'bug', confidence: 0.85 },
    { pattern: /\b(feature|new|add|implement|create)\b/i, tag: 'feature', confidence: 0.7 },
    { pattern: /\b(improve|enhance|optimize|better)\b/i, tag: 'improvement', confidence: 0.7 },
    { pattern: /\b(docs|documentation|readme|guide)\b/i, tag: 'documentation', confidence: 0.85 },
    { pattern: /\b(refactor|cleanup|reorganize|simplify)\b/i, tag: 'refactor', confidence: 0.8 },

    // Domain
    { pattern: /\b(react|vue|angular|css|html|ui|component)\b/i, tag: 'frontend', confidence: 0.85 },
    { pattern: /\b(node|express|api|server|endpoint|route)\b/i, tag: 'backend', confidence: 0.85 },
    { pattern: /\b(sql|database|postgres|mongo|query|migration)\b/i, tag: 'database', confidence: 0.9 },
    { pattern: /\b(docker|kubernetes|ci|cd|deploy|aws|azure)\b/i, tag: 'devops', confidence: 0.85 },
    { pattern: /\b(figma|design|mockup|wireframe|prototype)\b/i, tag: 'design', confidence: 0.85 },

    // Topic
    { pattern: /\b(meeting|call|standup|sync|1:1)\b/i, tag: 'meeting', confidence: 0.9 },
    { pattern: /\b(research|investigate|explore|study)\b/i, tag: 'research', confidence: 0.8 },
    { pattern: /\b(plan|planning|roadmap|strategy|goal)\b/i, tag: 'planning', confidence: 0.75 },
    { pattern: /\b(test|testing|unit|integration|e2e)\b/i, tag: 'testing', confidence: 0.85 },
];

class AutoTaggingService {
    private customTags: string[] = [];
    private tagUsageHistory: Map<string, number> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_auto_tags');
            if (stored) {
                const data = JSON.parse(stored);
                this.customTags = data.customTags || [];
                this.tagUsageHistory = new Map(Object.entries(data.tagUsage || {}));
            }
        } catch (error) {
            console.error('Failed to load tag data:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_auto_tags', JSON.stringify({
            customTags: this.customTags,
            tagUsage: Object.fromEntries(this.tagUsageHistory),
        }));
    }

    /**
     * Suggest tags for given text content
     */
    suggestTags(text: string): TagSuggestion[] {
        const suggestions: TagSuggestion[] = [];
        const lowerText = text.toLowerCase();

        // Check keyword patterns
        for (const { pattern, tag, confidence } of KEYWORD_PATTERNS) {
            if (pattern.test(text)) {
                // Increase confidence if tag was used before
                const usageBoost = Math.min(0.1, (this.tagUsageHistory.get(tag) || 0) * 0.01);

                suggestions.push({
                    tag,
                    confidence: Math.min(1, confidence + usageBoost),
                    reason: `Matched keyword pattern`,
                });
            }
        }

        // Check for existing hashtags in text
        const hashtagPattern = /#(\w+)/g;
        let match;
        while ((match = hashtagPattern.exec(text)) !== null) {
            const tag = match[1].toLowerCase();
            if (!suggestions.find(s => s.tag === tag)) {
                suggestions.push({
                    tag,
                    confidence: 1.0,
                    reason: 'Explicit hashtag in text',
                });
            }
        }

        // Check custom tags for partial matches
        for (const customTag of this.customTags) {
            if (lowerText.includes(customTag.toLowerCase()) && !suggestions.find(s => s.tag === customTag)) {
                suggestions.push({
                    tag: customTag,
                    confidence: 0.7,
                    reason: 'Custom tag keyword match',
                });
            }
        }

        // Sort by confidence
        return suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }

    /**
     * Record tag usage to improve future suggestions
     */
    recordTagUsage(tag: string): void {
        const currentCount = this.tagUsageHistory.get(tag) || 0;
        this.tagUsageHistory.set(tag, currentCount + 1);

        // Add to custom tags if not predefined
        if (!this.isPredefinedTag(tag) && !this.customTags.includes(tag)) {
            this.customTags.push(tag);
        }

        this.saveToStorage();
    }

    /**
     * Check if tag is predefined
     */
    private isPredefinedTag(tag: string): boolean {
        return TAG_CATEGORIES.some(cat => cat.tags.includes(tag));
    }

    /**
     * Get all predefined tag categories
     */
    getCategories(): TagCategory[] {
        return TAG_CATEGORIES;
    }

    /**
     * Get all tags (predefined + custom)
     */
    getAllTags(): string[] {
        const predefined = TAG_CATEGORIES.flatMap(cat => cat.tags);
        return [...new Set([...predefined, ...this.customTags])];
    }

    /**
     * Get custom tags
     */
    getCustomTags(): string[] {
        return [...this.customTags];
    }

    /**
     * Add custom tag
     */
    addCustomTag(tag: string): void {
        if (!this.customTags.includes(tag)) {
            this.customTags.push(tag);
            this.saveToStorage();
        }
    }

    /**
     * Remove custom tag
     */
    removeCustomTag(tag: string): void {
        this.customTags = this.customTags.filter(t => t !== tag);
        this.tagUsageHistory.delete(tag);
        this.saveToStorage();
    }

    /**
     * Get most used tags
     */
    getMostUsedTags(limit: number = 10): { tag: string; count: number }[] {
        return Array.from(this.tagUsageHistory.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Get tag color
     */
    getTagColor(tag: string): string {
        const category = TAG_CATEGORIES.find(cat => cat.tags.includes(tag));
        return category?.color || '#6b7280';
    }
}

export const autoTaggingService = new AutoTaggingService();
export default autoTaggingService;
