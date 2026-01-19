/**
 * @fileoverview Natural Language Task Input Service
 * 
 * Parses natural language input to create tasks with metadata.
 * Examples:
 * - "Add task: review PR tomorrow high priority"
 * - "Remind me to call John at 3pm"
 * - "Complete report by Friday urgent"
 */

export interface ParsedTask {
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: Date | null;
    dueTime: string | null;
    tags: string[];
    project: string | null;
    estimatedMinutes: number | null;
}

interface PatternMatch {
    pattern: RegExp;
    type: 'priority' | 'date' | 'time' | 'duration' | 'project' | 'tag';
    extract: (match: RegExpMatchArray) => any;
}

// Date keywords with relative offsets
const DATE_KEYWORDS: Record<string, number> = {
    'today': 0,
    'tomorrow': 1,
    'day after tomorrow': 2,
    'next week': 7,
    'next monday': -1, // Special handling
    'next tuesday': -1,
    'next wednesday': -1,
    'next thursday': -1,
    'next friday': -1,
    'next saturday': -1,
    'next sunday': -1,
};

// Day name to number mapping
const DAY_NAMES: Record<string, number> = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6,
};

class NaturalLanguageTaskService {
    private patterns: PatternMatch[] = [
        // Priority patterns
        {
            pattern: /\b(urgent|asap|critical)\b/i,
            type: 'priority',
            extract: () => 'urgent',
        },
        {
            pattern: /\b(high priority|important|high)\b/i,
            type: 'priority',
            extract: () => 'high',
        },
        {
            pattern: /\b(medium priority|normal|medium)\b/i,
            type: 'priority',
            extract: () => 'medium',
        },
        {
            pattern: /\b(low priority|whenever|low)\b/i,
            type: 'priority',
            extract: () => 'low',
        },

        // Time patterns
        {
            pattern: /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
            type: 'time',
            extract: (match) => {
                let hour = parseInt(match[1]);
                const minute = match[2] ? parseInt(match[2]) : 0;
                const period = match[3]?.toLowerCase();

                if (period === 'pm' && hour < 12) hour += 12;
                if (period === 'am' && hour === 12) hour = 0;

                return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            },
        },

        // Duration patterns
        {
            pattern: /\b(\d+)\s*(hour|hr|h|minute|min|m)s?\b/i,
            type: 'duration',
            extract: (match) => {
                const value = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                if (unit.startsWith('h')) return value * 60;
                return value;
            },
        },

        // Project patterns
        {
            pattern: /#(\w+)/g,
            type: 'tag',
            extract: (match) => match[1],
        },
        {
            pattern: /\bfor\s+(\w+)\s+project\b/i,
            type: 'project',
            extract: (match) => match[1],
        },
    ];

    /**
     * Parse natural language input into structured task
     */
    parseTaskInput(input: string): ParsedTask {
        const result: ParsedTask = {
            title: input,
            priority: 'medium',
            dueDate: null,
            dueTime: null,
            tags: [],
            project: null,
            estimatedMinutes: null,
        };

        let cleanedInput = input;

        // Extract priority
        for (const pattern of this.patterns.filter(p => p.type === 'priority')) {
            const match = cleanedInput.match(pattern.pattern);
            if (match) {
                result.priority = pattern.extract(match);
                cleanedInput = cleanedInput.replace(match[0], '').trim();
                break;
            }
        }

        // Extract time
        for (const pattern of this.patterns.filter(p => p.type === 'time')) {
            const match = cleanedInput.match(pattern.pattern);
            if (match) {
                result.dueTime = pattern.extract(match);
                cleanedInput = cleanedInput.replace(match[0], '').trim();
                break;
            }
        }

        // Extract duration
        for (const pattern of this.patterns.filter(p => p.type === 'duration')) {
            const match = cleanedInput.match(pattern.pattern);
            if (match) {
                result.estimatedMinutes = pattern.extract(match);
                cleanedInput = cleanedInput.replace(match[0], '').trim();
                break;
            }
        }

        // Extract tags
        const tagPattern = /#(\w+)/g;
        let tagMatch;
        while ((tagMatch = tagPattern.exec(cleanedInput)) !== null) {
            result.tags.push(tagMatch[1]);
        }
        cleanedInput = cleanedInput.replace(/#\w+/g, '').trim();

        // Extract project
        const projectMatch = cleanedInput.match(/\bfor\s+(\w+)\s+project\b/i);
        if (projectMatch) {
            result.project = projectMatch[1];
            cleanedInput = cleanedInput.replace(projectMatch[0], '').trim();
        }

        // Extract date keywords
        result.dueDate = this.extractDate(cleanedInput);
        if (result.dueDate) {
            cleanedInput = this.removeDateFromInput(cleanedInput);
        }

        // Clean up prefixes
        cleanedInput = cleanedInput
            .replace(/^(add task|new task|create task|task|remind me to|reminder)[:.]?\s*/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        result.title = cleanedInput || input;
        return result;
    }

    private extractDate(input: string): Date | null {
        const lowerInput = input.toLowerCase();

        // Check for keyword dates
        for (const [keyword, offset] of Object.entries(DATE_KEYWORDS)) {
            if (lowerInput.includes(keyword)) {
                if (offset >= 0) {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    return date;
                } else {
                    // Handle "next [day]"
                    const dayName = keyword.replace('next ', '');
                    const targetDay = DAY_NAMES[dayName];
                    if (targetDay !== undefined) {
                        const date = new Date();
                        const currentDay = date.getDay();
                        let daysToAdd = targetDay - currentDay;
                        if (daysToAdd <= 0) daysToAdd += 7;
                        date.setDate(date.getDate() + daysToAdd);
                        return date;
                    }
                }
            }
        }

        // Check for day names
        for (const [dayName, dayNum] of Object.entries(DAY_NAMES)) {
            if (lowerInput.includes(dayName) && !lowerInput.includes('next ' + dayName)) {
                const date = new Date();
                const currentDay = date.getDay();
                let daysToAdd = dayNum - currentDay;
                if (daysToAdd < 0) daysToAdd += 7;
                date.setDate(date.getDate() + daysToAdd);
                return date;
            }
        }

        // Check for explicit date patterns (MM/DD, DD/MM, etc.)
        const datePatterns = [
            /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, // MM/DD or MM/DD/YYYY
            /\b(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\b/,   // MM-DD or MM-DD-YYYY
        ];

        for (const pattern of datePatterns) {
            const match = lowerInput.match(pattern);
            if (match) {
                const month = parseInt(match[1]) - 1;
                const day = parseInt(match[2]);
                const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
                return new Date(year < 100 ? year + 2000 : year, month, day);
            }
        }

        return null;
    }

    private removeDateFromInput(input: string): string {
        let result = input.toLowerCase();

        // Remove keyword dates
        for (const keyword of Object.keys(DATE_KEYWORDS)) {
            result = result.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
        }

        // Remove day names
        for (const dayName of Object.keys(DAY_NAMES)) {
            result = result.replace(new RegExp(`\\b(on\\s+)?${dayName}\\b`, 'gi'), '');
            result = result.replace(new RegExp(`\\bnext\\s+${dayName}\\b`, 'gi'), '');
        }

        // Remove explicit dates
        result = result.replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g, '');

        // Remove common prepositions left behind
        result = result.replace(/\b(by|on|due|before)\s*$/gi, '');

        return result.replace(/\s+/g, ' ').trim();
    }

    /**
     * Format parsed task for display
     */
    formatParsedTask(task: ParsedTask): string {
        const parts = [task.title];

        if (task.dueDate) {
            parts.push(`📅 ${task.dueDate.toLocaleDateString()}`);
        }
        if (task.dueTime) {
            parts.push(`⏰ ${task.dueTime}`);
        }
        if (task.priority !== 'medium') {
            const priorityIcons = { low: '🔵', medium: '🟡', high: '🟠', urgent: '🔴' };
            parts.push(`${priorityIcons[task.priority]} ${task.priority}`);
        }
        if (task.estimatedMinutes) {
            parts.push(`⏱️ ${task.estimatedMinutes}m`);
        }
        if (task.tags.length > 0) {
            parts.push(`🏷️ ${task.tags.map(t => '#' + t).join(' ')}`);
        }

        return parts.join(' | ');
    }
}

export const naturalLanguageTaskService = new NaturalLanguageTaskService();
export default naturalLanguageTaskService;
