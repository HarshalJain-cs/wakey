// apps/desktop/src/renderer/services/enhanced-pomodoro-service.ts

import { v4 as generateId } from 'uuid';
import { eventBus } from '../lib/event-bus';

interface FocusPattern {
    id: string;
    name: string;
    workDuration: number;      // minutes
    shortBreak: number;
    longBreak: number;
    sessionsBeforeLong: number;
    autoStart: boolean;
    soundTheme: string;
}

interface SessionTemplate {
    id: string;
    name: string;
    pattern: FocusPattern;
    ambientSound?: string;
    distractionBlocking: 'none' | 'soft' | 'strict';
    goals: string[];
}

interface BreakSuggestion {
    duration: number;
    activity: string;
}

interface CollaborativeSession {
    id: string;
    participants: string[];
    pattern: FocusPattern;
    startTime: Date;
    status: 'waiting' | 'active' | 'break' | 'completed';
}

interface SessionStats {
    todayMinutes: number;
    todaySessions: number;
    averageMinutes: number;
    completedSessions: number;
    totalSessions: number;
    breaksTaken: number;
    productivityScore: number;
}

const BUILT_IN_PATTERNS: FocusPattern[] = [
    { id: 'classic', name: 'Classic Pomodoro', workDuration: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4, autoStart: false, soundTheme: 'default' },
    { id: 'ultradian', name: 'Ultradian Rhythm', workDuration: 90, shortBreak: 20, longBreak: 30, sessionsBeforeLong: 2, autoStart: true, soundTheme: 'nature' },
    { id: 'flowtime', name: 'Flowtime', workDuration: 52, shortBreak: 17, longBreak: 30, sessionsBeforeLong: 3, autoStart: true, soundTheme: 'ambient' },
    { id: 'sprint', name: 'Sprint Mode', workDuration: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 6, autoStart: true, soundTheme: 'energetic' },
    { id: 'deep-work', name: 'Deep Work', workDuration: 120, shortBreak: 30, longBreak: 60, sessionsBeforeLong: 2, autoStart: false, soundTheme: 'silence' },
];

const SESSION_TEMPLATES: SessionTemplate[] = [
    {
        id: 'coding',
        name: 'Coding Session',
        pattern: BUILT_IN_PATTERNS[0],
        ambientSound: 'rain-cafe',
        distractionBlocking: 'strict',
        goals: ['Complete feature', 'Fix bugs', 'Write tests']
    },
    {
        id: 'writing',
        name: 'Writing Session',
        pattern: BUILT_IN_PATTERNS[2],
        ambientSound: 'library',
        distractionBlocking: 'soft',
        goals: ['Draft content', 'Edit document', 'Research']
    },
    {
        id: 'studying',
        name: 'Study Session',
        pattern: BUILT_IN_PATTERNS[0],
        ambientSound: 'white-noise',
        distractionBlocking: 'strict',
        goals: ['Read chapter', 'Take notes', 'Practice problems']
    }
];

export class EnhancedPomodoroService {
    private currentPattern: FocusPattern = BUILT_IN_PATTERNS[0];
    private fatigueLevel: number = 0;
    private sessionQuality: number = 100;
    private todaySessions: number = 0;
    private breaksTaken: number = 0;
    private customPatterns: FocusPattern[] = [];

    getBuiltInPatterns(): FocusPattern[] {
        return BUILT_IN_PATTERNS;
    }

    getSessionTemplates(): SessionTemplate[] {
        return SESSION_TEMPLATES;
    }

    setPattern(pattern: FocusPattern): void {
        this.currentPattern = pattern;
    }

    createCustomPattern(pattern: Omit<FocusPattern, 'id'>): FocusPattern {
        const newPattern: FocusPattern = {
            ...pattern,
            id: generateId()
        };
        this.customPatterns.push(newPattern);
        return newPattern;
    }

    async getAdaptiveBreakSuggestion(): Promise<BreakSuggestion> {
        const fatigue = await this.calculateFatigueLevel();
        const timeOfDay = new Date().getHours();
        const sessionCount = await this.getTodaySessionCount();

        // AI-powered break optimization
        if (fatigue > 80) {
            return { duration: 30, activity: 'Take a walk outside' };
        } else if (fatigue > 60) {
            return { duration: 15, activity: 'Stretching exercises' };
        } else if (timeOfDay >= 14 && timeOfDay <= 16) {
            return { duration: 20, activity: 'Power nap recommended' };
        } else if (sessionCount > 6) {
            return { duration: 20, activity: 'Eye exercises and hydration' };
        }

        return { duration: this.currentPattern.shortBreak, activity: 'Quick break' };
    }

    async calculateFatigueLevel(): Promise<number> {
        // Calculate based on:
        // - Hours worked today (from real activity data)
        // - Session quality trends
        // - Time since last break
        // - Distraction frequency
        // - Time of day (circadian rhythm)

        try {
            const todayStats = await window.wakey.getTodayStats();
            const hoursWorked = todayStats.focusTime / 60; // Convert minutes to hours
            const distractionCount = todayStats.distractions;
            const currentHour = new Date().getHours();

            // Base fatigue from hours worked (0-40 points)
            const hoursFatigue = Math.min(hoursWorked * 5, 40);

            // Distraction penalty (0-20 points)
            const distractionPenalty = Math.min(distractionCount * 2, 20);

            // Session quality penalty (0-20 points)
            const qualityPenalty = (100 - this.sessionQuality) * 0.2;

            // Circadian rhythm factor (0-20 points)
            // Higher fatigue during post-lunch dip (14:00-16:00) and evening
            let circadianFatigue = 0;
            if (currentHour >= 14 && currentHour <= 16) {
                circadianFatigue = 15; // Post-lunch dip
            } else if (currentHour >= 21 || currentHour <= 6) {
                circadianFatigue = 20; // Late night / early morning
            } else if (currentHour >= 17 && currentHour <= 20) {
                circadianFatigue = 10; // Evening
            }

            this.fatigueLevel = Math.min(100, hoursFatigue + distractionPenalty + qualityPenalty + circadianFatigue);
            return this.fatigueLevel;
        } catch (error) {
            console.error('Failed to calculate fatigue from real data:', error);
            // Fallback to simple calculation
            const hoursWorked = this.todaySessions * (this.currentPattern.workDuration / 60);
            const baseFatigue = Math.min(hoursWorked * 10, 50);
            const qualityPenalty = (100 - this.sessionQuality) * 0.3;
            this.fatigueLevel = Math.min(100, baseFatigue + qualityPenalty);
            return this.fatigueLevel;
        }
    }

    async getTodaySessionCount(): Promise<number> {
        try {
            const stats = await window.wakey.getTodayStats();
            return stats.sessions;
        } catch {
            return this.todaySessions;
        }
    }

    async getSessionStats(): Promise<SessionStats> {
        try {
            const todayStats = await window.wakey.getTodayStats();
            const allTimeStats = await window.wakey.getAllTimeStats();
            const fatigue = await this.calculateFatigueLevel();

            // Calculate productivity score based on focus ratio and fatigue
            const focusRatio = todayStats.focusTime > 0
                ? todayStats.focusTime / (todayStats.focusTime + (todayStats.distractions * 5))
                : 0;
            const productivityScore = Math.round(focusRatio * 100 * (1 - fatigue / 200));

            return {
                todayMinutes: todayStats.focusTime,
                todaySessions: todayStats.sessions,
                averageMinutes: allTimeStats.totalDays > 0
                    ? Math.round(allTimeStats.totalFocusMinutes / allTimeStats.totalDays)
                    : 0,
                completedSessions: allTimeStats.completedSessions,
                totalSessions: allTimeStats.completedSessions,
                breaksTaken: this.breaksTaken,
                productivityScore: Math.max(0, Math.min(100, productivityScore))
            };
        } catch (error) {
            console.error('Failed to get session stats from real data:', error);
            // Fallback to mock data
            const sessionCount = this.todaySessions;
            const todayMinutes = sessionCount * this.currentPattern.workDuration;
            return {
                todayMinutes,
                todaySessions: sessionCount,
                averageMinutes: 120,
                completedSessions: sessionCount,
                totalSessions: sessionCount,
                breaksTaken: this.breaksTaken,
                productivityScore: Math.min(100, 60 + sessionCount * 5)
            };
        }
    }

    startSession(template?: SessionTemplate): string {
        const sessionId = generateId();
        const pattern = template?.pattern || this.currentPattern;

        eventBus.emit('focus:started', {
            sessionId,
            duration: pattern.workDuration,
            taskId: undefined
        });

        this.todaySessions++;

        return sessionId;
    }

    completeSession(sessionId: string, quality: number): void {
        this.sessionQuality = quality;

        eventBus.emit('focus:completed', {
            sessionId,
            actualDuration: this.currentPattern.workDuration,
            quality
        });
    }

    recordBreak(): void {
        this.breaksTaken++;
    }

    async exportSessions(
        format: 'csv' | 'json' | 'pdf',
        dateRange: { start: Date; end: Date }
    ): Promise<Blob> {
        // Get sessions from database
        const sessions = await this.getSessionsInRange(dateRange);

        if (format === 'json') {
            return new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
        } else if (format === 'csv') {
            const csv = this.convertToCSV(sessions);
            return new Blob([csv], { type: 'text/csv' });
        }

        // PDF would require a PDF library
        throw new Error('PDF export not yet implemented');
    }

    private async getSessionsInRange(_dateRange: { start: Date; end: Date }): Promise<unknown[]> {
        // Would query database
        return [];
    }

    private convertToCSV(data: unknown[]): string {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0] as object).join(',');
        const rows = data.map(item => Object.values(item as object).join(','));
        return [headers, ...rows].join('\n');
    }

    createCollaborativeSession(participants: string[]): CollaborativeSession {
        return {
            id: generateId(),
            participants,
            pattern: this.currentPattern,
            startTime: new Date(),
            status: 'waiting'
        };
    }
}

export const enhancedPomodoroService = new EnhancedPomodoroService();
export type { FocusPattern, SessionTemplate, BreakSuggestion, CollaborativeSession, SessionStats };
