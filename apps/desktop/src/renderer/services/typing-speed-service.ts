/**
 * @fileoverview Typing Speed Tracker Service
 * 
 * Measures typing speed (WPM) over time:
 * - Track words per minute
 * - Monitor typing patterns
 * - Correlate with focus states
 */

export interface TypingSession {
    id: string;
    date: string;
    startTime: Date;
    endTime: Date | null;
    totalCharacters: number;
    totalWords: number;
    durationSeconds: number;
    wpm: number;
    accuracy: number; // 0-100%
    app: string;
}

export interface TypingStats {
    averageWpm: number;
    peakWpm: number;
    totalWords: number;
    totalHours: number;
    trend: 'improving' | 'stable' | 'declining';
}

class TypingSpeedService {
    private sessions: TypingSession[] = [];
    private currentSession: {
        startTime: Date;
        characters: number;
        words: number;
        app: string;
    } | null = null;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_typing');
            if (stored) {
                this.sessions = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load typing data:', error);
        }
    }

    private saveToStorage(): void {
        // Keep last 30 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        this.sessions = this.sessions.filter(s => new Date(s.date) >= cutoff);

        localStorage.setItem('wakey_typing', JSON.stringify(this.sessions));
    }

    /**
     * Start tracking a typing session
     */
    startSession(app: string): void {
        this.currentSession = {
            startTime: new Date(),
            characters: 0,
            words: 0,
            app,
        };
    }

    /**
     * Record keystrokes
     */
    recordKeystrokes(characters: number, words: number): void {
        if (!this.currentSession) {
            this.startSession('Unknown');
        }

        this.currentSession!.characters += characters;
        this.currentSession!.words += words;
    }

    /**
     * End current session and save
     */
    endSession(): TypingSession | null {
        if (!this.currentSession) return null;

        const endTime = new Date();
        const durationSeconds = (endTime.getTime() - this.currentSession.startTime.getTime()) / 1000;

        // Only save sessions longer than 60 seconds
        if (durationSeconds < 60) {
            this.currentSession = null;
            return null;
        }

        const durationMinutes = durationSeconds / 60;
        const wpm = durationMinutes > 0 ? Math.round(this.currentSession.words / durationMinutes) : 0;

        const session: TypingSession = {
            id: `typing_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            startTime: this.currentSession.startTime,
            endTime,
            totalCharacters: this.currentSession.characters,
            totalWords: this.currentSession.words,
            durationSeconds: Math.round(durationSeconds),
            wpm,
            accuracy: 95 + Math.random() * 5, // Placeholder - needs actual error tracking
            app: this.currentSession.app,
        };

        this.sessions.push(session);
        this.currentSession = null;
        this.saveToStorage();

        return session;
    }

    /**
     * Get typing stats
     */
    getStats(days: number = 7): TypingStats {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const recentSessions = this.sessions.filter(s => new Date(s.date) >= cutoff);

        if (recentSessions.length === 0) {
            return {
                averageWpm: 0,
                peakWpm: 0,
                totalWords: 0,
                totalHours: 0,
                trend: 'stable',
            };
        }

        const averageWpm = Math.round(
            recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length
        );
        const peakWpm = Math.max(...recentSessions.map(s => s.wpm));
        const totalWords = recentSessions.reduce((sum, s) => sum + s.totalWords, 0);
        const totalSeconds = recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
        const totalHours = Math.round(totalSeconds / 3600 * 10) / 10;

        // Calculate trend
        let trend: TypingStats['trend'] = 'stable';
        if (recentSessions.length >= 4) {
            const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
            const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));

            const firstAvg = firstHalf.reduce((sum, s) => sum + s.wpm, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, s) => sum + s.wpm, 0) / secondHalf.length;

            if (secondAvg > firstAvg + 5) trend = 'improving';
            else if (secondAvg < firstAvg - 5) trend = 'declining';
        }

        return { averageWpm, peakWpm, totalWords, totalHours, trend };
    }

    /**
     * Get recent sessions
     */
    getRecentSessions(limit: number = 10): TypingSession[] {
        return this.sessions
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
            .slice(0, limit);
    }

    /**
     * Get WPM trend data for chart
     */
    getWpmTrend(days: number = 7): { date: string; wpm: number }[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        // Group by date and average
        const byDate = new Map<string, number[]>();

        this.sessions
            .filter(s => new Date(s.date) >= cutoff)
            .forEach(s => {
                const existing = byDate.get(s.date) || [];
                existing.push(s.wpm);
                byDate.set(s.date, existing);
            });

        return Array.from(byDate.entries())
            .map(([date, wpms]) => ({
                date,
                wpm: Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get speed category
     */
    getSpeedCategory(wpm: number): { category: string; description: string; emoji: string } {
        if (wpm >= 100) {
            return { category: 'Professional', description: 'Exceptional typing speed', emoji: '🚀' };
        } else if (wpm >= 70) {
            return { category: 'Fast', description: 'Above average speed', emoji: '⚡' };
        } else if (wpm >= 50) {
            return { category: 'Average', description: 'Typical typing speed', emoji: '👍' };
        } else if (wpm >= 30) {
            return { category: 'Moderate', description: 'Room for improvement', emoji: '🎯' };
        } else {
            return { category: 'Learning', description: 'Keep practicing!', emoji: '📚' };
        }
    }

    /**
     * Generate sample data
     */
    generateSampleData(): void {
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // 2-4 sessions per day
            const sessionsCount = 2 + Math.floor(Math.random() * 3);

            for (let j = 0; j < sessionsCount; j++) {
                const startTime = new Date(date);
                startTime.setHours(9 + j * 3, Math.floor(Math.random() * 60));

                const durationSeconds = 300 + Math.random() * 1800; // 5-35 min
                const wpm = 50 + Math.random() * 40; // 50-90 WPM
                const words = Math.round(wpm * durationSeconds / 60);

                this.sessions.push({
                    id: `typing_${Date.now()}_${j}`,
                    date: date.toISOString().split('T')[0],
                    startTime,
                    endTime: new Date(startTime.getTime() + durationSeconds * 1000),
                    totalCharacters: words * 5,
                    totalWords: words,
                    durationSeconds: Math.round(durationSeconds),
                    wpm: Math.round(wpm),
                    accuracy: 94 + Math.random() * 5,
                    app: ['VS Code', 'Chrome', 'Slack'][Math.floor(Math.random() * 3)],
                });
            }
        }

        this.saveToStorage();
    }
}

export const typingSpeedService = new TypingSpeedService();
export default typingSpeedService;
