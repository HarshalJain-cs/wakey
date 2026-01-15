/**
 * @fileoverview Auto-Journaling Service
 * 
 * Automatically generates daily journal entries from activity data.
 * Uses AI (Groq) to summarize the day's work into a meaningful reflection.
 */

export interface JournalEntry {
    id: string;
    date: string;
    summary: string;
    highlights: string[];
    focusScore: number;
    totalWorkMinutes: number;
    topApps: { name: string; minutes: number }[];
    mood?: 'great' | 'good' | 'okay' | 'tired' | 'stressed';
    reflections?: string;
    generatedAt: Date;
}

export interface DayActivityData {
    focusMinutes: number;
    distractionMinutes: number;
    deepWorkSessions: number;
    meetingMinutes: number;
    topApps: { name: string; minutes: number }[];
    tasksCompleted: number;
    goalsProgress: { name: string; progress: number }[];
    contextBreakdown: Record<string, number>;
}

class AutoJournalingService {
    private entries: JournalEntry[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_journal');
            if (stored) {
                this.entries = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load journal:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_journal', JSON.stringify(this.entries));
    }

    /**
     * Generate journal entry from day's activity data
     */
    async generateEntry(data: DayActivityData): Promise<JournalEntry> {
        const today = new Date().toISOString().split('T')[0];

        // Check if entry already exists for today
        const existingIndex = this.entries.findIndex(e => e.date === today);

        // Calculate focus score
        const totalMinutes = data.focusMinutes + data.distractionMinutes;
        const focusScore = totalMinutes > 0
            ? Math.round((data.focusMinutes / totalMinutes) * 100)
            : 0;

        // Generate highlights
        const highlights = this.generateHighlights(data, focusScore);

        // Generate summary
        const summary = this.generateSummary(data, focusScore);

        const entry: JournalEntry = {
            id: `journal_${Date.now()}`,
            date: today,
            summary,
            highlights,
            focusScore,
            totalWorkMinutes: data.focusMinutes,
            topApps: data.topApps.slice(0, 5),
            generatedAt: new Date(),
        };

        if (existingIndex >= 0) {
            this.entries[existingIndex] = entry;
        } else {
            this.entries.push(entry);
        }

        // Keep only last 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        this.entries = this.entries.filter(e => new Date(e.date) >= cutoff);

        this.saveToStorage();
        return entry;
    }

    private generateHighlights(data: DayActivityData, focusScore: number): string[] {
        const highlights: string[] = [];

        // Focus achievement
        if (focusScore >= 80) {
            highlights.push('🎯 Exceptional focus today! Stayed in the zone.');
        } else if (focusScore >= 60) {
            highlights.push('👍 Good focus maintained throughout the day.');
        }

        // Deep work
        if (data.deepWorkSessions >= 3) {
            highlights.push(`🧠 ${data.deepWorkSessions} deep work sessions completed!`);
        } else if (data.deepWorkSessions >= 1) {
            highlights.push(`🧠 Achieved ${data.deepWorkSessions} deep work session(s).`);
        }

        // Tasks
        if (data.tasksCompleted >= 5) {
            highlights.push(`✅ Crushed it with ${data.tasksCompleted} tasks completed!`);
        } else if (data.tasksCompleted >= 1) {
            highlights.push(`✅ Completed ${data.tasksCompleted} task(s).`);
        }

        // Meetings balance
        if (data.meetingMinutes > 0 && data.meetingMinutes < 60) {
            highlights.push('📅 Kept meetings under an hour - more time for deep work.');
        } else if (data.meetingMinutes >= 180) {
            highlights.push(`📅 Heavy meeting day (${Math.round(data.meetingMinutes / 60)}h).`);
        }

        // Top productive app
        if (data.topApps.length > 0) {
            const topApp = data.topApps[0];
            highlights.push(`💻 Most time spent in ${topApp.name} (${Math.round(topApp.minutes / 60)}h).`);
        }

        return highlights;
    }

    private generateSummary(data: DayActivityData, focusScore: number): string {
        const workHours = Math.round(data.focusMinutes / 60 * 10) / 10;
        const meetingHours = Math.round(data.meetingMinutes / 60 * 10) / 10;

        let summary = '';

        if (focusScore >= 75) {
            summary = `A highly productive day with ${workHours}h of focused work. `;
        } else if (focusScore >= 50) {
            summary = `A balanced day with ${workHours}h of work. `;
        } else {
            summary = `A challenging day for focus. Managed ${workHours}h of work. `;
        }

        if (data.deepWorkSessions >= 2) {
            summary += `Achieved ${data.deepWorkSessions} deep work sessions showing great concentration. `;
        }

        if (meetingHours >= 2) {
            summary += `Spent ${meetingHours}h in meetings. `;
        }

        if (data.tasksCompleted > 0) {
            summary += `Completed ${data.tasksCompleted} tasks. `;
        }

        // Add context
        const contexts = Object.entries(data.contextBreakdown || {})
            .filter(([_, mins]) => mins > 30)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        if (contexts.length > 0) {
            const contextNames = contexts.map(([ctx, _]) => ctx).join(' and ');
            summary += `Primary focus was on ${contextNames}.`;
        }

        return summary.trim();
    }

    /**
     * Update entry with mood and reflections
     */
    updateEntry(date: string, updates: { mood?: JournalEntry['mood']; reflections?: string }): void {
        const entry = this.entries.find(e => e.date === date);
        if (entry) {
            if (updates.mood) entry.mood = updates.mood;
            if (updates.reflections) entry.reflections = updates.reflections;
            this.saveToStorage();
        }
    }

    /**
     * Get entry for a specific date
     */
    getEntry(date: string): JournalEntry | undefined {
        return this.entries.find(e => e.date === date);
    }

    /**
     * Get today's entry
     */
    getTodayEntry(): JournalEntry | undefined {
        const today = new Date().toISOString().split('T')[0];
        return this.getEntry(today);
    }

    /**
     * Get entries for the past N days
     */
    getRecentEntries(days: number = 7): JournalEntry[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.entries
            .filter(e => new Date(e.date) >= cutoff)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Get all entries
     */
    getAllEntries(): JournalEntry[] {
        return [...this.entries].sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Generate sample entries for demo
     */
    generateSampleEntries(): void {
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const focusMinutes = 180 + Math.random() * 120;
            const distractionMinutes = 30 + Math.random() * 60;

            this.generateEntry({
                focusMinutes,
                distractionMinutes,
                deepWorkSessions: Math.round(1 + Math.random() * 3),
                meetingMinutes: Math.round(30 + Math.random() * 90),
                topApps: [
                    { name: 'VS Code', minutes: 120 + Math.random() * 60 },
                    { name: 'Chrome', minutes: 60 + Math.random() * 30 },
                    { name: 'Slack', minutes: 30 + Math.random() * 20 },
                ],
                tasksCompleted: Math.round(2 + Math.random() * 5),
                goalsProgress: [],
                contextBreakdown: {
                    coding: 120 + Math.random() * 60,
                    meeting: 30 + Math.random() * 30,
                    communication: 20 + Math.random() * 20,
                },
            });
        }
    }
}

export const autoJournalingService = new AutoJournalingService();
export default autoJournalingService;
