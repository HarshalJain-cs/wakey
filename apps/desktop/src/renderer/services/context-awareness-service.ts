/**
 * @fileoverview Context Awareness Service
 * 
 * Detects user context (meeting, coding, writing, browsing, etc.)
 * based on active window and title patterns.
 */

export type WorkContext =
    | 'coding'
    | 'writing'
    | 'meeting'
    | 'browsing'
    | 'designing'
    | 'communication'
    | 'reading'
    | 'entertainment'
    | 'unknown';

export interface ContextPattern {
    context: WorkContext;
    apps: string[];
    titlePatterns: string[];
    color: string;
    icon: string;
}

export interface ContextSession {
    context: WorkContext;
    startTime: Date;
    endTime: Date | null;
    durationMinutes: number;
    apps: string[];
}

export interface DailyContextBreakdown {
    date: string;
    contexts: Record<WorkContext, number>; // minutes per context
}

// Context detection patterns
const CONTEXT_PATTERNS: ContextPattern[] = [
    {
        context: 'coding',
        apps: ['code', 'visual studio', 'intellij', 'pycharm', 'webstorm', 'sublime', 'atom', 'vim', 'nvim', 'terminal', 'iterm', 'hyper', 'cursor'],
        titlePatterns: ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rs', '.tsx', '.jsx', 'github', 'gitlab'],
        color: '#3b82f6',
        icon: '💻',
    },
    {
        context: 'writing',
        apps: ['word', 'docs', 'notion', 'obsidian', 'bear', 'ulysses', 'scrivener', 'typora', 'markdown'],
        titlePatterns: ['document', 'draft', 'note', 'blog', 'article', '.md', '.docx'],
        color: '#8b5cf6',
        icon: '✍️',
    },
    {
        context: 'meeting',
        apps: ['zoom', 'teams', 'meet', 'webex', 'slack huddle', 'discord', 'skype', 'facetime'],
        titlePatterns: ['meeting', 'call', 'standup', 'sync', 'interview', '1:1', 'one on one'],
        color: '#f59e0b',
        icon: '🎥',
    },
    {
        context: 'communication',
        apps: ['slack', 'discord', 'telegram', 'whatsapp', 'messages', 'mail', 'outlook', 'gmail'],
        titlePatterns: ['inbox', 'message', 'chat', 'email'],
        color: '#06b6d4',
        icon: '💬',
    },
    {
        context: 'designing',
        apps: ['figma', 'sketch', 'photoshop', 'illustrator', 'canva', 'xd', 'invision', 'framer'],
        titlePatterns: ['design', 'mockup', 'wireframe', 'prototype', '.fig', '.psd'],
        color: '#ec4899',
        icon: '🎨',
    },
    {
        context: 'reading',
        apps: ['kindle', 'books', 'pdf', 'preview', 'acrobat', 'pocket', 'instapaper', 'readwise'],
        titlePatterns: ['.pdf', 'article', 'documentation', 'docs', 'wiki', 'handbook'],
        color: '#22c55e',
        icon: '📚',
    },
    {
        context: 'browsing',
        apps: ['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera'],
        titlePatterns: ['search', 'google', 'bing'],
        color: '#64748b',
        icon: '🌐',
    },
    {
        context: 'entertainment',
        apps: ['youtube', 'netflix', 'spotify', 'hulu', 'disney', 'twitch', 'prime video'],
        titlePatterns: ['watch', 'video', 'playing', 'movie', 'series', 'episode'],
        color: '#ef4444',
        icon: '🎬',
    },
];

class ContextAwarenessService {
    private currentContext: WorkContext = 'unknown';
    private currentSession: ContextSession | null = null;
    private sessions: ContextSession[] = [];
    private dailyBreakdown: DailyContextBreakdown[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_context_awareness');
            if (stored) {
                const data = JSON.parse(stored);
                this.sessions = data.sessions || [];
                this.dailyBreakdown = data.dailyBreakdown || [];
            }
        } catch (error) {
            console.error('Failed to load context data:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_context_awareness', JSON.stringify({
            sessions: this.sessions.slice(-100), // Keep last 100 sessions
            dailyBreakdown: this.dailyBreakdown.slice(-30), // Keep last 30 days
        }));
    }

    /**
     * Detect context from app name and window title
     */
    detectContext(appName: string, windowTitle: string): WorkContext {
        const lowerApp = appName.toLowerCase();
        const lowerTitle = windowTitle.toLowerCase();

        for (const pattern of CONTEXT_PATTERNS) {
            // Check app name
            if (pattern.apps.some(app => lowerApp.includes(app))) {
                return pattern.context;
            }

            // Check title patterns
            if (pattern.titlePatterns.some(p => lowerTitle.includes(p))) {
                return pattern.context;
            }
        }

        return 'unknown';
    }

    /**
     * Process activity and update context
     */
    processActivity(appName: string, windowTitle: string): void {
        const newContext = this.detectContext(appName, windowTitle);
        const now = new Date();

        if (newContext !== this.currentContext) {
            // End current session
            if (this.currentSession) {
                this.currentSession.endTime = now;
                this.currentSession.durationMinutes =
                    (now.getTime() - this.currentSession.startTime.getTime()) / 60000;

                if (this.currentSession.durationMinutes >= 1) {
                    this.sessions.push(this.currentSession);
                    this.updateDailyBreakdown(this.currentSession);
                }
            }

            // Start new session
            this.currentContext = newContext;
            this.currentSession = {
                context: newContext,
                startTime: now,
                endTime: null,
                durationMinutes: 0,
                apps: [appName],
            };

            this.saveToStorage();
        } else if (this.currentSession) {
            // Add app to current session if new
            if (!this.currentSession.apps.includes(appName)) {
                this.currentSession.apps.push(appName);
            }
        }
    }

    private updateDailyBreakdown(session: ContextSession): void {
        const date = session.startTime.toISOString().split('T')[0];

        let dayBreakdown = this.dailyBreakdown.find(d => d.date === date);
        if (!dayBreakdown) {
            dayBreakdown = {
                date,
                contexts: {
                    coding: 0, writing: 0, meeting: 0, browsing: 0,
                    designing: 0, communication: 0, reading: 0,
                    entertainment: 0, unknown: 0,
                },
            };
            this.dailyBreakdown.push(dayBreakdown);
        }

        dayBreakdown.contexts[session.context] += session.durationMinutes;
    }

    /**
     * Get current context
     */
    getCurrentContext(): WorkContext {
        return this.currentContext;
    }

    /**
     * Get current session
     */
    getCurrentSession(): ContextSession | null {
        return this.currentSession;
    }

    /**
     * Get context pattern info
     */
    getContextInfo(context: WorkContext): ContextPattern | undefined {
        return CONTEXT_PATTERNS.find(p => p.context === context);
    }

    /**
     * Get all context patterns
     */
    getAllPatterns(): ContextPattern[] {
        return CONTEXT_PATTERNS;
    }

    /**
     * Get today's context breakdown
     */
    getTodayBreakdown(): Record<WorkContext, number> {
        const today = new Date().toISOString().split('T')[0];
        const dayBreakdown = this.dailyBreakdown.find(d => d.date === today);

        return dayBreakdown?.contexts || {
            coding: 0, writing: 0, meeting: 0, browsing: 0,
            designing: 0, communication: 0, reading: 0,
            entertainment: 0, unknown: 0,
        };
    }

    /**
     * Get top contexts for a period
     */
    getTopContexts(days: number = 7): { context: WorkContext; minutes: number; percentage: number }[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const totals: Record<WorkContext, number> = {
            coding: 0, writing: 0, meeting: 0, browsing: 0,
            designing: 0, communication: 0, reading: 0,
            entertainment: 0, unknown: 0,
        };

        for (const day of this.dailyBreakdown.filter(d => d.date >= cutoffStr)) {
            for (const [ctx, mins] of Object.entries(day.contexts)) {
                totals[ctx as WorkContext] += mins;
            }
        }

        const totalMinutes = Object.values(totals).reduce((a, b) => a + b, 0);

        return Object.entries(totals)
            .filter(([_, mins]) => mins > 0)
            .map(([context, minutes]) => ({
                context: context as WorkContext,
                minutes: Math.round(minutes),
                percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
            }))
            .sort((a, b) => b.minutes - a.minutes);
    }

    /**
     * Generate sample data for demo
     */
    generateSampleData(): void {
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            this.dailyBreakdown.push({
                date: dateStr,
                contexts: {
                    coding: 120 + Math.random() * 60,
                    writing: 30 + Math.random() * 30,
                    meeting: 60 + Math.random() * 60,
                    browsing: 45 + Math.random() * 30,
                    designing: Math.random() > 0.5 ? 30 + Math.random() * 30 : 0,
                    communication: 30 + Math.random() * 45,
                    reading: 15 + Math.random() * 30,
                    entertainment: 15 + Math.random() * 30,
                    unknown: 10 + Math.random() * 20,
                },
            });
        }

        this.saveToStorage();
    }
}

export const contextAwarenessService = new ContextAwarenessService();
export default contextAwarenessService;
