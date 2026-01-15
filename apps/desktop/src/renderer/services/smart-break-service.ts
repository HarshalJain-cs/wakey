/**
 * @fileoverview Smart Break Detection Service
 * 
 * Detects when user should take breaks based on:
 * - Time worked continuously
 * - Eye strain patterns (context switches, time on screen)
 * - Natural break points (task completion, meeting end)
 * - Focus decline patterns
 */

export interface BreakRecommendation {
    type: 'micro' | 'short' | 'long' | 'movement' | 'eye';
    duration: number; // minutes
    reason: string;
    activity: string;
    urgency: 'low' | 'medium' | 'high';
}

interface WorkSession {
    startTime: Date;
    lastBreakTime: Date | null;
    continuousMinutes: number;  // Since last break
    contextSwitches: number;
    focusScoreHistory: number[];
}

const BREAK_TYPES: Record<string, { name: string; duration: number; activities: string[] }> = {
    micro: {
        name: 'Micro Break',
        duration: 1,
        activities: ['Take 3 deep breaths', 'Stretch your neck', 'Blink rapidly for 10 seconds'],
    },
    short: {
        name: 'Short Break',
        duration: 5,
        activities: ['Walk to get water', 'Do 10 squats', 'Chat with a colleague', 'Step outside briefly'],
    },
    long: {
        name: 'Recovery Break',
        duration: 15,
        activities: ['Take a proper snack break', 'Go for a short walk', 'Do some stretching', 'Meditate for 10 min'],
    },
    movement: {
        name: 'Movement Break',
        duration: 5,
        activities: ['Walk around the block', 'Do some jumping jacks', 'Stretch your whole body'],
    },
    eye: {
        name: 'Eye Rest',
        duration: 1,
        activities: ['Look at something 20 feet away for 20 seconds', 'Close eyes and rest', 'Blink slowly 10 times'],
    },
};

class SmartBreakService {
    private currentSession: WorkSession | null = null;
    private breakHistory: { time: Date; type: string; taken: boolean }[] = [];
    private onBreakRecommendation: ((rec: BreakRecommendation) => void) | null = null;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_smart_breaks');
            if (stored) {
                const data = JSON.parse(stored);
                this.breakHistory = data.breakHistory || [];
            }
        } catch (error) {
            console.error('Failed to load break data:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_smart_breaks', JSON.stringify({
            breakHistory: this.breakHistory.slice(-100),
        }));
    }

    /**
     * Set callback for break recommendations
     */
    setOnBreakRecommendation(callback: (rec: BreakRecommendation) => void): void {
        this.onBreakRecommendation = callback;
    }

    /**
     * Start tracking work session
     */
    startSession(): void {
        this.currentSession = {
            startTime: new Date(),
            lastBreakTime: null,
            continuousMinutes: 0,
            contextSwitches: 0,
            focusScoreHistory: [],
        };
    }

    /**
     * Update session with activity data
     */
    updateActivity(focusScore: number, hadContextSwitch: boolean): void {
        if (!this.currentSession) {
            this.startSession();
        }

        this.currentSession!.focusScoreHistory.push(focusScore);
        if (hadContextSwitch) {
            this.currentSession!.contextSwitches++;
        }

        // Calculate continuous work time
        const lastBreak = this.currentSession!.lastBreakTime || this.currentSession!.startTime;
        this.currentSession!.continuousMinutes =
            (new Date().getTime() - lastBreak.getTime()) / 60000;

        // Check if break is needed
        const recommendation = this.analyzeBreakNeed();
        if (recommendation && this.onBreakRecommendation) {
            this.onBreakRecommendation(recommendation);
        }
    }

    /**
     * Analyze if a break is needed
     */
    private analyzeBreakNeed(): BreakRecommendation | null {
        if (!this.currentSession) return null;

        const { continuousMinutes, contextSwitches, focusScoreHistory } = this.currentSession;

        // Check for urgent long break need (90+ min)
        if (continuousMinutes >= 90) {
            return this.createRecommendation('long', 'You\'ve been working for 90+ minutes', 'high');
        }

        // Check for focus decline
        if (focusScoreHistory.length >= 10) {
            const recentAvg = focusScoreHistory.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const previousAvg = focusScoreHistory.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;

            if (previousAvg - recentAvg > 15) {
                return this.createRecommendation('short', 'Your focus is declining', 'medium');
            }
        }

        // Check for excessive context switches (mental fatigue)
        if (contextSwitches > 20 && continuousMinutes > 30) {
            return this.createRecommendation('movement', 'High context switching detected', 'medium');
        }

        // Regular short break (every 25-30 min for Pomodoro-style)
        if (continuousMinutes >= 25 && continuousMinutes < 30) {
            return this.createRecommendation('short', '25 minutes of focused work completed', 'low');
        }

        // Eye break (every 20 min)
        if (continuousMinutes >= 20 && continuousMinutes < 21) {
            return this.createRecommendation('eye', '20-20-20 rule reminder', 'low');
        }

        // Micro break (every 10 min)
        if (continuousMinutes >= 50 && continuousMinutes < 51) {
            return this.createRecommendation('micro', 'Quick micro-break suggested', 'low');
        }

        return null;
    }

    private createRecommendation(
        type: BreakRecommendation['type'],
        reason: string,
        urgency: BreakRecommendation['urgency']
    ): BreakRecommendation {
        const breakInfo = BREAK_TYPES[type];
        const activity = breakInfo.activities[Math.floor(Math.random() * breakInfo.activities.length)];

        return {
            type,
            duration: breakInfo.duration,
            reason,
            activity,
            urgency,
        };
    }

    /**
     * Record that a break was taken
     */
    recordBreak(type: string, taken: boolean): void {
        this.breakHistory.push({
            time: new Date(),
            type,
            taken,
        });

        if (taken && this.currentSession) {
            this.currentSession.lastBreakTime = new Date();
            this.currentSession.contextSwitches = 0;
            this.currentSession.focusScoreHistory = [];
        }

        this.saveToStorage();
    }

    /**
     * Get break statistics
     */
    getBreakStats(): {
        takenToday: number;
        skippedToday: number;
        avgBreakInterval: number;
    } {
        const today = new Date().toISOString().split('T')[0];
        const todayBreaks = this.breakHistory.filter(
            b => b.time.toString().startsWith(today)
        );

        return {
            takenToday: todayBreaks.filter(b => b.taken).length,
            skippedToday: todayBreaks.filter(b => !b.taken).length,
            avgBreakInterval: this.currentSession?.continuousMinutes || 0,
        };
    }

    /**
     * Get all break types info
     */
    getBreakTypes(): typeof BREAK_TYPES {
        return BREAK_TYPES;
    }

    /**
     * End current session
     */
    endSession(): void {
        this.currentSession = null;
    }
}

export const smartBreakService = new SmartBreakService();
export default smartBreakService;
