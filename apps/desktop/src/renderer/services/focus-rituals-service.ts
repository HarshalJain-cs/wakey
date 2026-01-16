/**
 * @fileoverview Focus Rituals Service
 * 
 * Customizable start/end work routines to build consistency:
 * - Morning startup rituals
 * - Focus session start rituals
 * - End of day wind-down rituals
 * - Break rituals
 */

export interface RitualStep {
    id: string;
    action: string;
    durationSeconds: number;
    icon: string;
    completed: boolean;
}

export interface Ritual {
    id: string;
    name: string;
    type: 'morning' | 'focus-start' | 'break' | 'wind-down';
    steps: RitualStep[];
    enabled: boolean;
    reminderTime?: string; // HH:mm format
}

export interface RitualSession {
    ritualId: string;
    startedAt: Date;
    completedAt: Date | null;
    stepsCompleted: number;
    totalSteps: number;
}

// Default rituals
const DEFAULT_RITUALS: Ritual[] = [
    {
        id: 'morning-startup',
        name: 'Morning Startup',
        type: 'morning',
        enabled: true,
        reminderTime: '09:00',
        steps: [
            { id: 'm1', action: 'Review your goals for today', durationSeconds: 60, icon: '🎯', completed: false },
            { id: 'm2', action: 'Check calendar for meetings', durationSeconds: 30, icon: '📅', completed: false },
            { id: 'm3', action: 'Prioritize top 3 tasks', durationSeconds: 60, icon: '📝', completed: false },
            { id: 'm4', action: 'Clear desk and organize workspace', durationSeconds: 60, icon: '🧹', completed: false },
            { id: 'm5', action: 'Take 3 deep breaths', durationSeconds: 30, icon: '🧘', completed: false },
        ],
    },
    {
        id: 'focus-start',
        name: 'Focus Session Start',
        type: 'focus-start',
        enabled: true,
        steps: [
            { id: 'f1', action: 'Close unnecessary tabs and apps', durationSeconds: 30, icon: '🚫', completed: false },
            { id: 'f2', action: 'Put phone on Do Not Disturb', durationSeconds: 10, icon: '📱', completed: false },
            { id: 'f3', action: 'Set clear intention for this session', durationSeconds: 20, icon: '🎯', completed: false },
            { id: 'f4', action: 'Take a deep breath and begin', durationSeconds: 10, icon: '🧘', completed: false },
        ],
    },
    {
        id: 'break-refresh',
        name: 'Break Refresh',
        type: 'break',
        enabled: true,
        steps: [
            { id: 'b1', action: 'Stand up and stretch', durationSeconds: 30, icon: '🤸', completed: false },
            { id: 'b2', action: 'Look at something distant', durationSeconds: 20, icon: '👀', completed: false },
            { id: 'b3', action: 'Get water or a healthy snack', durationSeconds: 60, icon: '🥤', completed: false },
            { id: 'b4', action: 'Take 5 deep breaths', durationSeconds: 30, icon: '🌬️', completed: false },
        ],
    },
    {
        id: 'wind-down',
        name: 'End of Day Wind-Down',
        type: 'wind-down',
        enabled: true,
        reminderTime: '17:30',
        steps: [
            { id: 'w1', action: 'Review what you accomplished today', durationSeconds: 60, icon: '✅', completed: false },
            { id: 'w2', action: 'Note any incomplete tasks for tomorrow', durationSeconds: 60, icon: '📝', completed: false },
            { id: 'w3', action: 'Close all work applications', durationSeconds: 30, icon: '💻', completed: false },
            { id: 'w4', action: 'Write down one thing you\'re grateful for', durationSeconds: 30, icon: '🙏', completed: false },
            { id: 'w5', action: 'Take 3 deep breaths and disconnect', durationSeconds: 30, icon: '🌙', completed: false },
        ],
    },
];

class FocusRitualsService {
    private rituals: Ritual[] = [];
    private sessions: RitualSession[] = [];
    private activeSession: { ritualId: string; stepIndex: number } | null = null;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_rituals');
            if (stored) {
                const data = JSON.parse(stored);
                this.rituals = data.rituals || DEFAULT_RITUALS;
                this.sessions = data.sessions || [];
            } else {
                this.rituals = DEFAULT_RITUALS;
            }
        } catch (error) {
            console.error('Failed to load rituals:', error);
            this.rituals = DEFAULT_RITUALS;
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_rituals', JSON.stringify({
            rituals: this.rituals,
            sessions: this.sessions.slice(-50),
        }));
    }

    /**
     * Get all rituals
     */
    getAllRituals(): Ritual[] {
        return this.rituals;
    }

    /**
     * Get ritual by ID
     */
    getRitual(id: string): Ritual | undefined {
        return this.rituals.find(r => r.id === id);
    }

    /**
     * Get rituals by type
     */
    getRitualsByType(type: Ritual['type']): Ritual[] {
        return this.rituals.filter(r => r.type === type && r.enabled);
    }

    /**
     * Start a ritual session
     */
    startRitual(ritualId: string): RitualSession | null {
        const ritual = this.getRitual(ritualId);
        if (!ritual) return null;

        // Reset all steps
        ritual.steps.forEach(step => step.completed = false);

        const session: RitualSession = {
            ritualId,
            startedAt: new Date(),
            completedAt: null,
            stepsCompleted: 0,
            totalSteps: ritual.steps.length,
        };

        this.activeSession = { ritualId, stepIndex: 0 };
        this.sessions.push(session);
        this.saveToStorage();

        return session;
    }

    /**
     * Complete current step and move to next
     */
    completeStep(): RitualStep | null {
        if (!this.activeSession) return null;

        const ritual = this.getRitual(this.activeSession.ritualId);
        if (!ritual) return null;

        const currentStep = ritual.steps[this.activeSession.stepIndex];
        if (currentStep) {
            currentStep.completed = true;
        }

        // Update session
        const session = this.sessions.find(
            s => s.ritualId === this.activeSession!.ritualId && !s.completedAt
        );
        if (session) {
            session.stepsCompleted++;
        }

        // Move to next step or complete ritual
        this.activeSession.stepIndex++;
        if (this.activeSession.stepIndex >= ritual.steps.length) {
            this.completeRitual();
            return null;
        }

        this.saveToStorage();
        return ritual.steps[this.activeSession.stepIndex];
    }

    /**
     * Complete the ritual
     */
    private completeRitual(): void {
        if (!this.activeSession) return;

        const session = this.sessions.find(
            s => s.ritualId === this.activeSession!.ritualId && !s.completedAt
        );
        if (session) {
            session.completedAt = new Date();
        }

        this.activeSession = null;
        this.saveToStorage();
    }

    /**
     * Get current step
     */
    getCurrentStep(): RitualStep | null {
        if (!this.activeSession) return null;

        const ritual = this.getRitual(this.activeSession.ritualId);
        if (!ritual) return null;

        return ritual.steps[this.activeSession.stepIndex] || null;
    }

    /**
     * Get active session
     */
    getActiveSession(): { ritual: Ritual; stepIndex: number } | null {
        if (!this.activeSession) return null;

        const ritual = this.getRitual(this.activeSession.ritualId);
        if (!ritual) return null;

        return { ritual, stepIndex: this.activeSession.stepIndex };
    }

    /**
     * Cancel active ritual
     */
    cancelRitual(): void {
        if (!this.activeSession) return;

        const session = this.sessions.find(
            s => s.ritualId === this.activeSession!.ritualId && !s.completedAt
        );
        if (session) {
            session.completedAt = new Date();
        }

        this.activeSession = null;
        this.saveToStorage();
    }

    /**
     * Create custom ritual
     */
    createRitual(ritual: Omit<Ritual, 'id'>): Ritual {
        const newRitual: Ritual = {
            ...ritual,
            id: `custom_${Date.now()}`,
        };
        this.rituals.push(newRitual);
        this.saveToStorage();
        return newRitual;
    }

    /**
     * Update ritual
     */
    updateRitual(id: string, updates: Partial<Ritual>): void {
        const index = this.rituals.findIndex(r => r.id === id);
        if (index >= 0) {
            this.rituals[index] = { ...this.rituals[index], ...updates };
            this.saveToStorage();
        }
    }

    /**
     * Delete ritual
     */
    deleteRitual(id: string): void {
        this.rituals = this.rituals.filter(r => r.id !== id);
        this.saveToStorage();
    }

    /**
     * Get completed rituals today
     */
    getTodayCompletedRituals(): RitualSession[] {
        const today = new Date().toISOString().split('T')[0];
        return this.sessions.filter(
            s => s.completedAt && s.startedAt.toISOString().split('T')[0] === today
        );
    }

    /**
     * Get ritual completion stats
     */
    getStats(): { totalCompleted: number; streak: number; favoriteRitual: string | null } {
        const completedSessions = this.sessions.filter(s => s.completedAt);

        // Calculate streak (consecutive days with at least one ritual)
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            const hasRitual = completedSessions.some(
                s => s.startedAt.toISOString().split('T')[0] === dateStr
            );

            if (hasRitual) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        // Find favorite ritual
        const ritualCounts = new Map<string, number>();
        completedSessions.forEach(s => {
            ritualCounts.set(s.ritualId, (ritualCounts.get(s.ritualId) || 0) + 1);
        });

        let favoriteRitual: string | null = null;
        let maxCount = 0;
        ritualCounts.forEach((count, id) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteRitual = id;
            }
        });

        return {
            totalCompleted: completedSessions.length,
            streak,
            favoriteRitual,
        };
    }
}

export const focusRitualsService = new FocusRitualsService();
export default focusRitualsService;
