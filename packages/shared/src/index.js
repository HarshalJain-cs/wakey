// Shared types and utilities for Wakey
// App categories for auto-categorization
export const APP_CATEGORIES = {
    DEVELOPMENT: 'Development',
    COMMUNICATION: 'Communication',
    PRODUCTIVITY: 'Productivity',
    DESIGN: 'Design',
    ENTERTAINMENT: 'Entertainment',
    SOCIAL: 'Social Media',
    NEWS: 'News',
    SHOPPING: 'Shopping',
    FINANCE: 'Finance',
    EDUCATION: 'Education',
    OTHER: 'Other',
};
// Default app categorization rules
export const DEFAULT_APP_RULES = {
    // Development
    'Visual Studio Code': APP_CATEGORIES.DEVELOPMENT,
    'Code': APP_CATEGORIES.DEVELOPMENT,
    'WebStorm': APP_CATEGORIES.DEVELOPMENT,
    'PyCharm': APP_CATEGORIES.DEVELOPMENT,
    'Terminal': APP_CATEGORIES.DEVELOPMENT,
    'Windows Terminal': APP_CATEGORIES.DEVELOPMENT,
    'Git': APP_CATEGORIES.DEVELOPMENT,
    'GitHub Desktop': APP_CATEGORIES.DEVELOPMENT,
    'Postman': APP_CATEGORIES.DEVELOPMENT,
    // Communication
    'Slack': APP_CATEGORIES.COMMUNICATION,
    'Discord': APP_CATEGORIES.COMMUNICATION,
    'Microsoft Teams': APP_CATEGORIES.COMMUNICATION,
    'Zoom': APP_CATEGORIES.COMMUNICATION,
    'Outlook': APP_CATEGORIES.COMMUNICATION,
    'Mail': APP_CATEGORIES.COMMUNICATION,
    // Productivity
    'Notion': APP_CATEGORIES.PRODUCTIVITY,
    'Obsidian': APP_CATEGORIES.PRODUCTIVITY,
    'Microsoft Word': APP_CATEGORIES.PRODUCTIVITY,
    'Microsoft Excel': APP_CATEGORIES.PRODUCTIVITY,
    'Google Docs': APP_CATEGORIES.PRODUCTIVITY,
    'Todoist': APP_CATEGORIES.PRODUCTIVITY,
    // Design
    'Figma': APP_CATEGORIES.DESIGN,
    'Adobe Photoshop': APP_CATEGORIES.DESIGN,
    'Adobe Illustrator': APP_CATEGORIES.DESIGN,
    'Canva': APP_CATEGORIES.DESIGN,
    // Entertainment/Distractions
    'YouTube': APP_CATEGORIES.ENTERTAINMENT,
    'Netflix': APP_CATEGORIES.ENTERTAINMENT,
    'Spotify': APP_CATEGORIES.ENTERTAINMENT,
    'Steam': APP_CATEGORIES.ENTERTAINMENT,
    // Social
    'Twitter': APP_CATEGORIES.SOCIAL,
    'Facebook': APP_CATEGORIES.SOCIAL,
    'Instagram': APP_CATEGORIES.SOCIAL,
    'LinkedIn': APP_CATEGORIES.SOCIAL,
    'Reddit': APP_CATEGORIES.SOCIAL,
    'TikTok': APP_CATEGORIES.SOCIAL,
};
// Distraction apps (default list)
export const DEFAULT_DISTRACTIONS = [
    'YouTube',
    'Netflix',
    'TikTok',
    'Instagram',
    'Twitter',
    'Reddit',
    'Facebook',
    'Steam',
    'Discord', // Can be distraction during focus
];
// Focus quality score calculation
export function calculateFocusQuality(params) {
    let score = 100;
    // Penalize for distractions
    score -= params.distractionCount * 5;
    // Penalize for context switches (more than 3/hour is problematic)
    const switchesPerHour = (params.contextSwitches / params.focusMinutes) * 60;
    if (switchesPerHour > 3) {
        score -= (switchesPerHour - 3) * 3;
    }
    // Reward for taking breaks
    const breakCompliance = params.breaksTaken / Math.max(params.breaksRecommended, 1);
    if (breakCompliance >= 0.8) {
        score += 5;
    }
    else if (breakCompliance < 0.5) {
        score -= 10;
    }
    // Bonus for extended focus (over 45 min continuous)
    if (params.focusMinutes >= 45) {
        score += 5;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
}
// Time formatting utilities
export function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0)
        return `${mins}m`;
    if (mins === 0)
        return `${hours}h`;
    return `${hours}h ${mins}m`;
}
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
// Date utilities
export function isToday(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
}
export function getStartOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
export function getEndOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
//# sourceMappingURL=index.js.map