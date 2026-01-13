// AI Service using Groq API (free, fast inference)
// Fallback to Ollama for offline use

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Get API key from settings or environment
let groqApiKey: string | null = null;

export function setGroqApiKey(key: string): void {
    groqApiKey = key;
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
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

async function callOllama(prompt: string): Promise<string> {
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

// AI Productivity Insights
export async function generateProductivityInsights(data: {
    focusMinutes: number;
    distractionCount: number;
    topApps: { app: string; minutes: number }[];
    sessionsCompleted: number;
}): Promise<string[]> {
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

// AI App Categorization
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

// AI Task Suggestions
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

// Distraction Detection (enhanced)
const DISTRACTION_APPS = [
    'youtube', 'netflix', 'tiktok', 'instagram', 'twitter', 'reddit',
    'facebook', 'steam', 'twitch', 'discord', 'hulu', 'disney+',
    'prime video', 'snapchat', 'whatsapp', 'telegram',
];

const WORK_APPS = [
    'code', 'visual studio', 'terminal', 'notion', 'obsidian',
    'word', 'excel', 'slack', 'teams', 'zoom', 'figma',
];

export function isDistractionApp(appName: string): boolean {
    const lower = appName.toLowerCase();
    return DISTRACTION_APPS.some(d => lower.includes(d));
}

export function isWorkApp(appName: string): boolean {
    const lower = appName.toLowerCase();
    return WORK_APPS.some(w => lower.includes(w));
}

// Focus Score Calculation
export function calculateFocusScore(data: {
    focusMinutes: number;
    distractionCount: number;
    contextSwitches: number;
    sessionGoalMinutes: number;
}): number {
    let score = 100;

    // Deduct for distractions
    score -= data.distractionCount * 5;

    // Deduct for context switches
    score -= data.contextSwitches * 2;

    // Bonus for meeting focus goal
    if (data.focusMinutes >= data.sessionGoalMinutes) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
}

// Daily Summary Generation
export async function generateDailySummary(data: {
    focusMinutes: number;
    distractionCount: number;
    topApps: { app: string; minutes: number }[];
    tasksCompleted: number;
    sessionsCompleted: number;
}): Promise<string> {
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
