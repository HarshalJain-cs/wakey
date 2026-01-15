/**
 * @fileoverview Pomodoro Variations Service
 * 
 * Provides different focus timer techniques beyond classic Pomodoro:
 * - Classic Pomodoro (25/5)
 * - Long Pomodoro (50/10)
 * - Ultradian Rhythm (90/20)
 * - 52/17 Technique
 * - Flowtime (flexible)
 */

export type PomodoroTechnique =
    | 'classic'      // 25 work, 5 break
    | 'long'         // 50 work, 10 break
    | 'ultradian'    // 90 work, 20 break
    | '52-17'        // 52 work, 17 break
    | 'flowtime';    // Flexible - work until you lose focus

export interface TechniqueConfig {
    id: PomodoroTechnique;
    name: string;
    description: string;
    workMinutes: number | null; // null for flowtime
    breakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
    icon: string;
    color: string;
    bestFor: string[];
}

export const POMODORO_TECHNIQUES: TechniqueConfig[] = [
    {
        id: 'classic',
        name: 'Classic Pomodoro',
        description: 'The original technique by Francesco Cirillo. Short focused sprints with regular breaks.',
        workMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
        icon: '🍅',
        color: '#ef4444',
        bestFor: ['Getting started', 'Routine tasks', 'When easily distracted'],
    },
    {
        id: 'long',
        name: 'Long Pomodoro',
        description: 'Extended focus periods for deeper work. Good for tasks requiring more setup time.',
        workMinutes: 50,
        breakMinutes: 10,
        longBreakMinutes: 30,
        sessionsBeforeLongBreak: 2,
        icon: '⏱️',
        color: '#f59e0b',
        bestFor: ['Complex tasks', 'Creative work', 'When in the zone'],
    },
    {
        id: 'ultradian',
        name: 'Ultradian Rhythm',
        description: 'Based on natural 90-minute human energy cycles. Maximizes deep work potential.',
        workMinutes: 90,
        breakMinutes: 20,
        longBreakMinutes: 30,
        sessionsBeforeLongBreak: 2,
        icon: '🧠',
        color: '#8b5cf6',
        bestFor: ['Deep work', 'Learning', 'Problem solving'],
    },
    {
        id: '52-17',
        name: '52/17 Technique',
        description: 'Based on productivity research showing the most productive people work for 52 minutes then rest for 17.',
        workMinutes: 52,
        breakMinutes: 17,
        longBreakMinutes: 30,
        sessionsBeforeLongBreak: 3,
        icon: '📊',
        color: '#06b6d4',
        bestFor: ['Data-driven workers', 'Office work', 'Research tasks'],
    },
    {
        id: 'flowtime',
        name: 'Flowtime',
        description: 'Work until you naturally lose focus, then take a proportional break. Best for creative flow states.',
        workMinutes: null, // Flexible
        breakMinutes: 5,  // Base break, scales with work time
        longBreakMinutes: 20,
        sessionsBeforeLongBreak: 3,
        icon: '🌊',
        color: '#22c55e',
        bestFor: ['Creative work', 'Writing', 'When already focused'],
    },
];

export interface TimerState {
    technique: PomodoroTechnique;
    phase: 'work' | 'break' | 'longBreak' | 'idle';
    timeRemaining: number; // seconds
    totalTime: number; // seconds
    sessionsCompleted: number;
    isRunning: boolean;
    flowtimeStarted: Date | null; // For flowtime technique
}

class PomodoroVariationsService {
    private currentTechnique: TechniqueConfig;
    private state: TimerState;
    private timerInterval: NodeJS.Timeout | null = null;
    private onTick: ((state: TimerState) => void) | null = null;
    private onPhaseComplete: ((phase: string) => void) | null = null;

    constructor() {
        this.currentTechnique = POMODORO_TECHNIQUES[0];
        this.state = this.getInitialState();
        this.loadFromStorage();
    }

    private getInitialState(): TimerState {
        return {
            technique: this.currentTechnique.id,
            phase: 'idle',
            timeRemaining: (this.currentTechnique.workMinutes || 25) * 60,
            totalTime: (this.currentTechnique.workMinutes || 25) * 60,
            sessionsCompleted: 0,
            isRunning: false,
            flowtimeStarted: null,
        };
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_pomodoro_technique');
            if (stored) {
                const id = JSON.parse(stored) as PomodoroTechnique;
                this.setTechnique(id);
            }
        } catch (error) {
            console.error('Failed to load pomodoro settings:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_pomodoro_technique', JSON.stringify(this.currentTechnique.id));
    }

    /**
     * Set callback for timer ticks
     */
    setOnTick(callback: (state: TimerState) => void): void {
        this.onTick = callback;
    }

    /**
     * Set callback for phase completion
     */
    setOnPhaseComplete(callback: (phase: string) => void): void {
        this.onPhaseComplete = callback;
    }

    /**
     * Get all available techniques
     */
    getAllTechniques(): TechniqueConfig[] {
        return POMODORO_TECHNIQUES;
    }

    /**
     * Get current technique
     */
    getCurrentTechnique(): TechniqueConfig {
        return this.currentTechnique;
    }

    /**
     * Set active technique
     */
    setTechnique(id: PomodoroTechnique): void {
        const technique = POMODORO_TECHNIQUES.find(t => t.id === id);
        if (!technique) return;

        this.currentTechnique = technique;
        this.state = this.getInitialState();
        this.saveToStorage();
    }

    /**
     * Get current timer state
     */
    getState(): TimerState {
        return { ...this.state };
    }

    /**
     * Start the timer
     */
    start(): void {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.phase = 'work';

        if (this.currentTechnique.id === 'flowtime') {
            this.state.flowtimeStarted = new Date();
            this.state.timeRemaining = 0;
            this.state.totalTime = 0;
        }

        this.timerInterval = setInterval(() => {
            if (this.currentTechnique.id === 'flowtime') {
                // Count up for flowtime
                this.state.timeRemaining++;
                this.state.totalTime++;
            } else {
                // Count down for other techniques
                this.state.timeRemaining--;

                if (this.state.timeRemaining <= 0) {
                    this.completePhase();
                }
            }

            this.onTick?.(this.getState());
        }, 1000);
    }

    /**
     * Pause the timer
     */
    pause(): void {
        this.state.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Stop flowtime and start break
     */
    stopFlowtime(): void {
        if (this.currentTechnique.id !== 'flowtime') return;

        const workMinutes = this.state.totalTime / 60;
        const breakMinutes = Math.min(Math.round(workMinutes / 5), 20); // 1 min break per 5 min work, max 20

        this.pause();
        this.state.phase = 'break';
        this.state.timeRemaining = breakMinutes * 60;
        this.state.totalTime = breakMinutes * 60;
        this.state.sessionsCompleted++;

        this.onPhaseComplete?.('work');
    }

    /**
     * Reset the timer
     */
    reset(): void {
        this.pause();
        this.state = this.getInitialState();
    }

    /**
     * Skip to next phase
     */
    skip(): void {
        this.completePhase();
    }

    private completePhase(): void {
        this.pause();

        if (this.state.phase === 'work') {
            this.state.sessionsCompleted++;

            // Check if time for long break
            if (this.state.sessionsCompleted % this.currentTechnique.sessionsBeforeLongBreak === 0) {
                this.state.phase = 'longBreak';
                this.state.timeRemaining = this.currentTechnique.longBreakMinutes * 60;
                this.state.totalTime = this.currentTechnique.longBreakMinutes * 60;
            } else {
                this.state.phase = 'break';
                this.state.timeRemaining = this.currentTechnique.breakMinutes * 60;
                this.state.totalTime = this.currentTechnique.breakMinutes * 60;
            }

            this.onPhaseComplete?.('work');
        } else {
            // Break completed, start new work session
            this.state.phase = 'work';
            this.state.timeRemaining = (this.currentTechnique.workMinutes || 25) * 60;
            this.state.totalTime = (this.currentTechnique.workMinutes || 25) * 60;
            this.onPhaseComplete?.('break');
        }
    }

    /**
     * Format time for display
     */
    formatTime(seconds: number): string {
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

export const pomodoroVariationsService = new PomodoroVariationsService();
export default pomodoroVariationsService;
