// AI Integration Module for Wakey
// Uses Groq (free, fast) as primary, Ollama as local fallback
import Groq from 'groq-sdk';
// Initialize Groq client (will use GROQ_API_KEY env var)
let groqClient = null;
function getGroqClient() {
    if (!groqClient) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY || '',
        });
    }
    return groqClient;
}
// App categorization using AI
export async function categorizeApp(appName, windowTitle) {
    // First, try rule-based categorization
    const ruleCategory = getRuleBasedCategory(appName);
    if (ruleCategory)
        return ruleCategory;
    // Fall back to AI categorization
    try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                {
                    role: 'system',
                    content: `You are an app categorizer. Categorize apps into one of these categories:
Development, Communication, Productivity, Design, Entertainment, Social Media, News, Shopping, Finance, Education, Other.
Respond with ONLY the category name, nothing else.`
                },
                {
                    role: 'user',
                    content: `App: ${appName}\nWindow: ${windowTitle}`
                }
            ],
            max_tokens: 20,
            temperature: 0,
        });
        return response.choices[0]?.message?.content?.trim() || 'Other';
    }
    catch (error) {
        console.error('AI categorization failed:', error);
        return 'Other';
    }
}
// Rule-based categorization (fast, no API needed)
const CATEGORY_RULES = {
    'code': 'Development',
    'visual studio': 'Development',
    'pycharm': 'Development',
    'webstorm': 'Development',
    'terminal': 'Development',
    'powershell': 'Development',
    'cmd': 'Development',
    'git': 'Development',
    'postman': 'Development',
    'slack': 'Communication',
    'discord': 'Communication',
    'teams': 'Communication',
    'zoom': 'Communication',
    'outlook': 'Communication',
    'gmail': 'Communication',
    'notion': 'Productivity',
    'obsidian': 'Productivity',
    'word': 'Productivity',
    'excel': 'Productivity',
    'docs': 'Productivity',
    'figma': 'Design',
    'photoshop': 'Design',
    'illustrator': 'Design',
    'canva': 'Design',
    'youtube': 'Entertainment',
    'netflix': 'Entertainment',
    'spotify': 'Entertainment',
    'steam': 'Entertainment',
    'twitter': 'Social Media',
    'facebook': 'Social Media',
    'instagram': 'Social Media',
    'linkedin': 'Social Media',
    'reddit': 'Social Media',
    'tiktok': 'Social Media',
};
function getRuleBasedCategory(appName) {
    const lowerName = appName.toLowerCase();
    for (const [keyword, category] of Object.entries(CATEGORY_RULES)) {
        if (lowerName.includes(keyword)) {
            return category;
        }
    }
    return null;
}
// Generate productivity insights
export async function generateInsights(data) {
    try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                {
                    role: 'system',
                    content: `You are a productivity coach. Generate 2-3 short, actionable insights based on the user's productivity data. Keep each insight to one sentence.`
                },
                {
                    role: 'user',
                    content: `Focus time: ${data.focusHours} hours
Distractions: ${data.distractionCount}
Top apps: ${data.topApps.join(', ')}
Most productive hour: ${data.peakHour}:00`
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });
        const content = response.choices[0]?.message?.content || '';
        return content.split('\n').filter(line => line.trim().length > 0);
    }
    catch (error) {
        console.error('AI insights generation failed:', error);
        return ['Start a focus session to get personalized insights!'];
    }
}
// Suggest task description
export async function suggestTaskDescription(title) {
    try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                {
                    role: 'system',
                    content: `You are a task assistant. Given a task title, suggest a brief 1-2 sentence description of what the task involves.`
                },
                {
                    role: 'user',
                    content: title
                }
            ],
            max_tokens: 100,
            temperature: 0.5,
        });
        return response.choices[0]?.message?.content?.trim() || '';
    }
    catch (error) {
        console.error('AI task suggestion failed:', error);
        return '';
    }
}
// Check if an app is a distraction
export function isDistraction(appName) {
    const distractions = [
        'youtube', 'netflix', 'tiktok', 'instagram',
        'twitter', 'reddit', 'facebook', 'steam',
        'twitch', 'hulu', 'disney+', 'prime video'
    ];
    const lowerName = appName.toLowerCase();
    return distractions.some(d => lowerName.includes(d));
}
// Ollama local fallback (when offline)
export async function queryOllama(prompt, model = 'llama3.2') {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
            }),
        });
        const data = await response.json();
        return data.response || '';
    }
    catch (error) {
        console.error('Ollama query failed:', error);
        return '';
    }
}
//# sourceMappingURL=index.js.map