/**
 * @fileoverview AI Service for Wakey Productivity Platform
 * 
 * This module provides AI-powered features using multiple providers:
 * - **Primary**: Groq API (free, fast inference with Llama models)
 * - **Fallback**: Ollama (local, offline-capable)
 * 
 * @module services/ai
 * @author Wakey Team
 * 
 * @example
 * // Generate productivity insights
 * import { generateProductivityInsights, setGroqApiKey } from './ai';
 * 
 * setGroqApiKey('your-api-key');
 * const insights = await generateProductivityInsights({
 *   focusMinutes: 120,
 *   distractionCount: 3,
 *   topApps: [{ app: 'VSCode', minutes: 90 }],
 *   sessionsCompleted: 4
 * });
 */

/** Groq API endpoint for chat completions */
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Ollama local API endpoint for text generation */
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

/** Stored API key for Groq authentication */
let groqApiKey: string | null = null;

/**
 * Sets the Groq API key for authentication.
 * Must be called before using any AI-powered features.
 * 
 * @param key - The Groq API key (obtain from https://console.groq.com)
 * 
 * @example
 * setGroqApiKey('gsk_xxxxxxxxxxxx');
 */
export function setGroqApiKey(key: string): void {
    groqApiKey = key;
}

/**
 * Represents a message in the chat completion format.
 * Compatible with OpenAI-style chat APIs.
 */
interface ChatMessage {
    /** The role of the message sender */
    role: 'system' | 'user' | 'assistant';
    /** The content of the message */
    content: string;
}

async function callGroq(messages: ChatMessage[], maxTokens: number = 200): Promise<string> {
    if (!groqApiKey) {
        throw new Error('Groq API key not set');
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
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

/**
 * Calls Ollama for local AI inference (offline fallback).
 * Kept for future implementation of offline mode.
 *
 * @internal
 * @param prompt - The prompt to send to Ollama
 * @returns The generated response
 */
export async function callOllama(prompt: string): Promise<string> {
    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error('Ollama not available');
        }

        const data = await response.json();
        return data.response || '';
    } catch {
        return '';
    }
}

/**
 * Productivity data input for AI insights generation.
 */
interface ProductivityData {
    /** Total focused minutes tracked today */
    focusMinutes: number;
    /** Number of distraction events detected */
    distractionCount: number;
    /** Top apps by usage time */
    topApps: { app: string; minutes: number }[];
    /** Number of completed focus sessions */
    sessionsCompleted: number;
}

/**
 * Generates AI-powered productivity insights based on user activity data.
 * Uses Groq API with fallback to rule-based insights if API fails.
 * 
 * @param data - User's productivity metrics for the day
 * @returns Array of 3 actionable insight strings
 * 
 * @example
 * const insights = await generateProductivityInsights({
 *   focusMinutes: 120,
 *   distractionCount: 5,
 *   topApps: [{ app: 'VSCode', minutes: 90 }],
 *   sessionsCompleted: 3
 * });
 * // Returns: ['Consider longer focus sessions...', 'Great coding progress...', ...]
 */
export async function generateProductivityInsights(data: ProductivityData): Promise<string[]> {
    const prompt = `Based on this productivity data, give 3 short, actionable insights (one sentence each):
- Focus time today: ${data.focusMinutes} minutes
- Distractions: ${data.distractionCount}
- Sessions completed: ${data.sessionsCompleted}
- Top apps: ${data.topApps.map(a => `${a.app} (${a.minutes}m)`).join(', ')}

Format: Return only 3 bullet points, no intro.`;

    try {
        const messages: ChatMessage[] = [
            { role: 'system', content: 'You are a productivity coach. Be concise and actionable.' },
            { role: 'user', content: prompt },
        ];

        const response = await callGroq(messages, 150);
        return response.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
            .map(line => line.replace(/^[-•]\s*/, '').trim())
            .slice(0, 3);
    } catch {
        // Fallback insights
        const insights: string[] = [];

        if (data.focusMinutes < 60) {
            insights.push('Try starting with a 25-minute focus session to build momentum.');
        } else if (data.focusMinutes > 180) {
            insights.push('Great focus today! Remember to take regular breaks.');
        }

        if (data.distractionCount > 5) {
            insights.push('Consider using focus mode to reduce distractions.');
        }

        if (data.sessionsCompleted === 0) {
            insights.push('Start a focus session to track your deep work.');
        }

        if (insights.length === 0) {
            insights.push('Keep up the good work! Consistency is key.');
        }

        return insights;
    }
}

/**
 * Categorizes an application using AI with rule-based fallback.
 * First attempts fast rule-based matching, then falls back to AI.
 * 
 * @param appName - The name of the application
 * @param windowTitle - The current window title
 * @returns Category string (Development, Communication, etc.)
 * 
 * @example
 * const category = await categorizeAppWithAI('Visual Studio Code', 'app.tsx');
 * // Returns: 'Development'
 */
export async function categorizeAppWithAI(appName: string, windowTitle: string): Promise<string> {
    // First try rule-based (faster)
    const ruleCategory = getRuleBasedCategory(appName);
    if (ruleCategory) return ruleCategory;

    try {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Categorize apps into: Development, Communication, Productivity, Design, Entertainment, Social Media, News, Shopping, Finance, Education, or Other. Reply with ONLY the category name.'
            },
            { role: 'user', content: `App: ${appName}\nWindow: ${windowTitle}` },
        ];

        const response = await callGroq(messages, 20);
        return response.trim() || 'Other';
    } catch {
        return 'Other';
    }
}

// Rule-based categorization (fast fallback)
const CATEGORY_RULES: Record<string, string> = {
    'code': 'Development', 'visual studio': 'Development', 'vscode': 'Development',
    'terminal': 'Development', 'powershell': 'Development', 'git': 'Development',
    'postman': 'Development', 'docker': 'Development', 'npm': 'Development',
    'slack': 'Communication', 'discord': 'Communication', 'teams': 'Communication',
    'zoom': 'Communication', 'outlook': 'Communication', 'gmail': 'Communication',
    'notion': 'Productivity', 'obsidian': 'Productivity', 'word': 'Productivity',
    'excel': 'Productivity', 'sheets': 'Productivity', 'docs': 'Productivity',
    'figma': 'Design', 'photoshop': 'Design', 'illustrator': 'Design', 'canva': 'Design',
    'youtube': 'Entertainment', 'netflix': 'Entertainment', 'spotify': 'Entertainment',
    'twitch': 'Entertainment', 'disney': 'Entertainment', 'hulu': 'Entertainment',
    'twitter': 'Social Media', 'facebook': 'Social Media', 'instagram': 'Social Media',
    'reddit': 'Social Media', 'tiktok': 'Social Media', 'linkedin': 'Social Media',
    'chrome': 'Browser', 'edge': 'Browser', 'firefox': 'Browser', 'safari': 'Browser',
};

function getRuleBasedCategory(appName: string): string | null {
    const lower = appName.toLowerCase();
    for (const [key, category] of Object.entries(CATEGORY_RULES)) {
        if (lower.includes(key)) return category;
    }
    return null;
}

/**
 * Generates a suggested description for a task based on its title.
 * Uses AI to provide context-aware task descriptions.
 * 
 * @param title - The task title to generate a description for
 * @returns Suggested 1-2 sentence description, or empty string on failure
 * 
 * @example
 * const desc = await suggestTaskDescription('Fix login bug');
 * // Returns: 'Investigate and resolve issues with the user login flow.'
 */
export async function suggestTaskDescription(title: string): Promise<string> {
    try {
        const messages: ChatMessage[] = [
            { role: 'system', content: 'Given a task title, suggest a brief 1-2 sentence description. Be concise.' },
            { role: 'user', content: title },
        ];

        return await callGroq(messages, 100);
    } catch {
        return '';
    }
}

/** List of apps commonly considered distractions */
const DISTRACTION_APPS = [
    'youtube', 'netflix', 'tiktok', 'instagram', 'twitter', 'reddit',
    'facebook', 'steam', 'twitch', 'discord', 'hulu', 'disney+',
    'prime video', 'snapchat', 'whatsapp', 'telegram',
];

/** List of apps considered work/productive */
const WORK_APPS = [
    'code', 'visual studio', 'terminal', 'notion', 'obsidian',
    'word', 'excel', 'slack', 'teams', 'zoom', 'figma',
];

/**
 * Checks if an application is classified as a distraction.
 * 
 * @param appName - Name of the application to check
 * @returns true if the app is a known distraction
 */
export function isDistractionApp(appName: string): boolean {
    const lower = appName.toLowerCase();
    return DISTRACTION_APPS.some(d => lower.includes(d));
}

/**
 * Checks if an application is classified as work-related.
 * 
 * @param appName - Name of the application to check
 * @returns true if the app is a known work app
 */
export function isWorkApp(appName: string): boolean {
    const lower = appName.toLowerCase();
    return WORK_APPS.some(w => lower.includes(w));
}

/**
 * Input parameters for focus score calculation.
 */
interface FocusScoreInput {
    /** Total minutes of focused work */
    focusMinutes: number;
    /** Number of distractions during session */
    distractionCount: number;
    /** Number of app/context switches */
    contextSwitches: number;
    /** Target minutes for the session */
    sessionGoalMinutes: number;
}

/**
 * Calculates a focus quality score (0-100) based on session metrics.
 * 
 * Scoring formula:
 * - Base score: 100
 * - Deduction: -5 points per distraction
 * - Deduction: -2 points per context switch
 * - Bonus: +10 points if goal minutes achieved
 * 
 * @param data - Focus session metrics
 * @returns Score from 0 (poor) to 100 (excellent)
 * 
 * @example
 * const score = calculateFocusScore({
 *   focusMinutes: 25,
 *   distractionCount: 2,
 *   contextSwitches: 3,
 *   sessionGoalMinutes: 25
 * });
 * // Returns: 94 (100 - 10 - 6 + 10)
 */
export function calculateFocusScore(data: FocusScoreInput): number {
    let score = 100;

    // Deduct for distractions (-5 each)
    score -= data.distractionCount * 5;

    // Deduct for context switches (-2 each)
    score -= data.contextSwitches * 2;

    // Bonus for meeting focus goal (+10)
    if (data.focusMinutes >= data.sessionGoalMinutes) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Input for daily summary generation.
 */
interface DailySummaryData {
    /** Total focused minutes */
    focusMinutes: number;
    /** Total distractions */
    distractionCount: number;
    /** Top apps by usage */
    topApps: { app: string; minutes: number }[];
    /** Tasks completed today */
    tasksCompleted: number;
    /** Focus sessions completed */
    sessionsCompleted: number;
}

/**
 * Generates an AI-powered daily productivity summary.
 * Provides encouraging feedback and highlights key achievements.
 * 
 * @param data - Daily productivity metrics
 * @returns 2-3 sentence summary of the day's productivity
 * 
 * @example
 * const summary = await generateDailySummary({
 *   focusMinutes: 240,
 *   distractionCount: 5,
 *   topApps: [{ app: 'VSCode', minutes: 180 }],
 *   tasksCompleted: 8,
 *   sessionsCompleted: 6
 * });
 */
export async function generateDailySummary(data: DailySummaryData): Promise<string> {
    const hours = Math.floor(data.focusMinutes / 60);
    const mins = data.focusMinutes % 60;

    try {
        const messages: ChatMessage[] = [
            { role: 'system', content: 'You are summarizing a user\'s productive day. Be encouraging and brief (2-3 sentences).' },
            { role: 'user', content: `Focus: ${hours}h ${mins}m, Tasks done: ${data.tasksCompleted}, Sessions: ${data.sessionsCompleted}, Distractions: ${data.distractionCount}` },
        ];

        return await callGroq(messages, 100);
    } catch {
        return `You focused for ${hours}h ${mins}m today and completed ${data.tasksCompleted} tasks across ${data.sessionsCompleted} sessions. ${data.distractionCount > 0 ? 'Try to reduce distractions tomorrow!' : 'Great focus!'}`;
    }
}
