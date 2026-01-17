/**
 * @fileoverview Template Library Service
 * 
 * Shareable productivity templates:
 * - Goal templates
 * - Ritual templates
 * - Project templates
 * - Community sharing
 */

export interface ProductivityTemplate {
    id: string;
    name: string;
    description: string;
    author: string;
    category: TemplateCategory;
    type: TemplateType;
    content: unknown;
    tags: string[];
    downloads: number;
    rating: number;
    createdAt: Date;
    isOfficial: boolean;
}

export type TemplateCategory =
    | 'productivity'
    | 'developer'
    | 'writer'
    | 'student'
    | 'remote-work'
    | 'health'
    | 'creative'
    | 'general';

export type TemplateType =
    | 'goal'
    | 'ritual'
    | 'project'
    | 'schedule'
    | 'challenge';

// Built-in templates
const BUILT_IN_TEMPLATES: ProductivityTemplate[] = [
    {
        id: 'dev-deep-work',
        name: 'Developer Deep Work',
        description: 'Optimized daily schedule for software developers with focus blocks and code review time',
        author: 'Wakey Team',
        category: 'developer',
        type: 'schedule',
        content: {
            blocks: [
                { time: '09:00', duration: 90, activity: 'Deep coding session 1', type: 'focus' },
                { time: '10:30', duration: 15, activity: 'Break + stretch', type: 'break' },
                { time: '10:45', duration: 45, activity: 'Code review / PRs', type: 'communication' },
                { time: '11:30', duration: 30, activity: 'Standup + communication', type: 'meeting' },
                { time: '12:00', duration: 60, activity: 'Lunch break', type: 'break' },
                { time: '13:00', duration: 90, activity: 'Deep coding session 2', type: 'focus' },
                { time: '14:30', duration: 15, activity: 'Break + walk', type: 'break' },
                { time: '14:45', duration: 75, activity: 'Meetings / collaboration', type: 'meeting' },
                { time: '16:00', duration: 60, activity: 'Deep coding session 3', type: 'focus' },
                { time: '17:00', duration: 30, activity: 'Wrap up + plan tomorrow', type: 'planning' },
            ],
        },
        tags: ['developer', 'deep-work', 'coding'],
        downloads: 1250,
        rating: 4.8,
        createdAt: new Date('2024-01-01'),
        isOfficial: true,
    },
    {
        id: 'writer-flow',
        name: 'Writer\'s Flow State',
        description: 'Morning writing routine with distraction-free focus periods',
        author: 'Wakey Team',
        category: 'writer',
        type: 'ritual',
        content: {
            steps: [
                { order: 1, action: 'Morning pages - 3 pages free writing', duration: 30 },
                { order: 2, action: 'Review yesterday\'s work', duration: 15 },
                { order: 3, action: 'Set word count goal for today', duration: 5 },
                { order: 4, action: 'Deep writing session (no distractions)', duration: 90 },
                { order: 5, action: 'Break and movement', duration: 15 },
                { order: 6, action: 'Editing session', duration: 45 },
            ],
        },
        tags: ['writer', 'creative', 'morning-routine'],
        downloads: 890,
        rating: 4.7,
        createdAt: new Date('2024-02-15'),
        isOfficial: true,
    },
    {
        id: 'student-study',
        name: 'Student Study System',
        description: 'Pomodoro-based study schedule with spaced repetition reminders',
        author: 'Wakey Team',
        category: 'student',
        type: 'schedule',
        content: {
            blocks: [
                { time: '08:00', duration: 25, activity: 'Study block 1', type: 'focus' },
                { time: '08:25', duration: 5, activity: 'Quick review', type: 'break' },
                { time: '08:30', duration: 25, activity: 'Study block 2', type: 'focus' },
                { time: '08:55', duration: 5, activity: 'Quick review', type: 'break' },
                { time: '09:00', duration: 25, activity: 'Study block 3', type: 'focus' },
                { time: '09:25', duration: 15, activity: 'Long break', type: 'break' },
            ],
        },
        tags: ['student', 'study', 'pomodoro'],
        downloads: 2100,
        rating: 4.9,
        createdAt: new Date('2024-01-20'),
        isOfficial: true,
    },
    {
        id: 'remote-balance',
        name: 'Remote Work Balance',
        description: 'Healthy boundaries for working from home with clear start/end times',
        author: 'Wakey Team',
        category: 'remote-work',
        type: 'goal',
        content: {
            goals: [
                { name: 'Start work by 9am', type: 'time', target: '09:00' },
                { name: 'End work by 6pm', type: 'time', target: '18:00' },
                { name: 'Take lunch break', type: 'duration', target: 60 },
                { name: 'No weekend work', type: 'boolean', target: false },
                { name: 'Daily movement', type: 'duration', target: 30 },
            ],
        },
        tags: ['remote', 'balance', 'boundaries'],
        downloads: 1500,
        rating: 4.6,
        createdAt: new Date('2024-03-01'),
        isOfficial: true,
    },
    {
        id: 'health-breaks',
        name: 'Healthy Break Routine',
        description: 'Regular movement and eye breaks throughout the workday',
        author: 'Wakey Team',
        category: 'health',
        type: 'ritual',
        content: {
            intervals: [
                { every: 20, action: 'Eye break (20-20-20 rule)', duration: 0.5 },
                { every: 50, action: 'Stretch break', duration: 5 },
                { every: 90, action: 'Movement break', duration: 10 },
            ],
        },
        tags: ['health', 'breaks', 'wellness'],
        downloads: 980,
        rating: 4.8,
        createdAt: new Date('2024-02-01'),
        isOfficial: true,
    },
];

class TemplateLibraryService {
    private templates: ProductivityTemplate[] = [];
    private installedTemplates: Set<string> = new Set();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_templates');
            if (stored) {
                const data = JSON.parse(stored);
                this.templates = [...BUILT_IN_TEMPLATES, ...(data.customTemplates || [])];
                this.installedTemplates = new Set(data.installed || []);
            } else {
                this.templates = BUILT_IN_TEMPLATES;
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            this.templates = BUILT_IN_TEMPLATES;
        }
    }

    private saveToStorage(): void {
        const customTemplates = this.templates.filter(t => !t.isOfficial);
        localStorage.setItem('wakey_templates', JSON.stringify({
            customTemplates,
            installed: Array.from(this.installedTemplates),
        }));
    }

    /**
     * Get all templates
     */
    getAllTemplates(): ProductivityTemplate[] {
        return this.templates;
    }

    /**
     * Get templates by category
     */
    getByCategory(category: TemplateCategory): ProductivityTemplate[] {
        return this.templates.filter(t => t.category === category);
    }

    /**
     * Get templates by type
     */
    getByType(type: TemplateType): ProductivityTemplate[] {
        return this.templates.filter(t => t.type === type);
    }

    /**
     * Search templates
     */
    search(query: string): ProductivityTemplate[] {
        const lowerQuery = query.toLowerCase();
        return this.templates.filter(t =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get popular templates
     */
    getPopular(limit: number = 10): ProductivityTemplate[] {
        return [...this.templates]
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, limit);
    }

    /**
     * Get top rated templates
     */
    getTopRated(limit: number = 10): ProductivityTemplate[] {
        return [...this.templates]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    /**
     * Install a template
     */
    installTemplate(templateId: string): boolean {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return false;

        this.installedTemplates.add(templateId);
        template.downloads++;
        this.saveToStorage();

        return true;
    }

    /**
     * Uninstall a template
     */
    uninstallTemplate(templateId: string): void {
        this.installedTemplates.delete(templateId);
        this.saveToStorage();
    }

    /**
     * Check if template is installed
     */
    isInstalled(templateId: string): boolean {
        return this.installedTemplates.has(templateId);
    }

    /**
     * Get installed templates
     */
    getInstalledTemplates(): ProductivityTemplate[] {
        return this.templates.filter(t => this.installedTemplates.has(t.id));
    }

    /**
     * Create custom template
     */
    createTemplate(template: Omit<ProductivityTemplate, 'id' | 'downloads' | 'rating' | 'createdAt' | 'isOfficial'>): ProductivityTemplate {
        const newTemplate: ProductivityTemplate = {
            ...template,
            id: `custom_${Date.now()}`,
            downloads: 0,
            rating: 0,
            createdAt: new Date(),
            isOfficial: false,
        };

        this.templates.push(newTemplate);
        this.installedTemplates.add(newTemplate.id);
        this.saveToStorage();

        return newTemplate;
    }

    /**
     * Delete custom template
     */
    deleteTemplate(templateId: string): boolean {
        const template = this.templates.find(t => t.id === templateId);
        if (!template || template.isOfficial) return false;

        this.templates = this.templates.filter(t => t.id !== templateId);
        this.installedTemplates.delete(templateId);
        this.saveToStorage();

        return true;
    }

    /**
     * Export template for sharing
     */
    exportTemplate(templateId: string): string | null {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return null;

        return JSON.stringify(template, null, 2);
    }

    /**
     * Import template from JSON
     */
    importTemplate(jsonData: string): ProductivityTemplate | null {
        try {
            const template = JSON.parse(jsonData) as ProductivityTemplate;

            // Assign new ID and mark as custom
            template.id = `imported_${Date.now()}`;
            template.isOfficial = false;
            template.downloads = 0;
            template.createdAt = new Date();

            this.templates.push(template);
            this.saveToStorage();

            return template;
        } catch (error) {
            console.error('Failed to import template:', error);
            return null;
        }
    }

    /**
     * Get all categories
     */
    getCategories(): TemplateCategory[] {
        return ['productivity', 'developer', 'writer', 'student', 'remote-work', 'health', 'creative', 'general'];
    }

    /**
     * Get all types
     */
    getTypes(): TemplateType[] {
        return ['goal', 'ritual', 'project', 'schedule', 'challenge'];
    }
}

export const templateLibraryService = new TemplateLibraryService();
export default templateLibraryService;
