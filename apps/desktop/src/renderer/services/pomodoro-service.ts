/**
 * Pomodoro Service - Manages focus timer cycles, breaks, and presets
 */

export interface FocusPreset {
    id: string;
    name: string;
    focusDuration: number;      // 5-120 minutes
    breakInterval: number;       // Minutes between breaks during session (0 = no breaks)
    breakDuration: number;       // Minutes for break after session
    cycles: number;              // Number of Pomodoro cycles (1-8)
    isDefault?: boolean;
}

export interface PomodoroState {
    currentCycle: number;
    totalCycles: number;
    isInBreak: boolean;
    breakType: 'interval' | 'session' | null;
    cycleStartTime: number | null;
    sessionStartTime: number | null;
}

// Default presets
export const DEFAULT_PRESETS: FocusPreset[] = [
    {
        id: 'pomodoro',
        name: 'Pomodoro',
        focusDuration: 25,
        breakInterval: 0,
        breakDuration: 5,
        cycles: 4,
        isDefault: true,
    },
    {
        id: 'deep-work',
        name: 'Deep Work',
        focusDuration: 45,
        breakInterval: 0,
        breakDuration: 10,
        cycles: 2,
        isDefault: true,
    },
    {
        id: 'long-focus',
        name: 'Long Focus',
        focusDuration: 90,
        breakInterval: 30,
        breakDuration: 15,
        cycles: 1,
        isDefault: true,
    },
    {
        id: 'ultra-focus',
        name: 'Ultra Focus',
        focusDuration: 120,
        breakInterval: 45,
        breakDuration: 20,
        cycles: 1,
        isDefault: true,
    },
];

class PomodoroService {
    private state: PomodoroState = {
        currentCycle: 1,
        totalCycles: 1,
        isInBreak: false,
        breakType: null,
        cycleStartTime: null,
        sessionStartTime: null,
    };

    private presets: FocusPreset[] = [...DEFAULT_PRESETS];
    private listeners: Set<(state: PomodoroState) => void> = new Set();

    constructor() {
        this.loadPresets();
    }

    // Load custom presets from storage
    private async loadPresets(): Promise<void> {
        try {
            if (window.wakey?.getFocusPresets) {
                const customPresets = await window.wakey.getFocusPresets();
                if (customPresets && Array.isArray(customPresets)) {
                    this.presets = [...DEFAULT_PRESETS, ...customPresets];
                }
            }
        } catch (error) {
            console.error('Failed to load focus presets:', error);
        }
    }

    // Get all presets
    getPresets(): FocusPreset[] {
        return this.presets;
    }

    // Save a custom preset
    async savePreset(preset: Omit<FocusPreset, 'id'>): Promise<FocusPreset> {
        const newPreset: FocusPreset = {
            ...preset,
            id: `custom-${Date.now()}`,
            isDefault: false,
        };

        this.presets.push(newPreset);

        try {
            if (window.wakey?.saveFocusPreset) {
                await window.wakey.saveFocusPreset(newPreset);
            }
        } catch (error) {
            console.error('Failed to save focus preset:', error);
        }

        return newPreset;
    }

    // Delete a custom preset
    async deletePreset(id: string): Promise<void> {
        const preset = this.presets.find(p => p.id === id);
        if (preset?.isDefault) {
            throw new Error('Cannot delete default presets');
        }

        this.presets = this.presets.filter(p => p.id !== id);

        try {
            if (window.wakey?.deleteFocusPreset) {
                await window.wakey.deleteFocusPreset(id);
            }
        } catch (error) {
            console.error('Failed to delete focus preset:', error);
        }
    }

    // Start a new session with preset
    startSession(preset: FocusPreset): void {
        this.state = {
            currentCycle: 1,
            totalCycles: preset.cycles,
            isInBreak: false,
            breakType: null,
            cycleStartTime: Date.now(),
            sessionStartTime: Date.now(),
        };
        this.notifyListeners();
    }

    // Move to next cycle or end session
    nextCycle(): { completed: boolean; isBreak: boolean } {
        if (this.state.currentCycle >= this.state.totalCycles) {
            // All cycles completed
            this.reset();
            return { completed: true, isBreak: false };
        }

        // Start break before next cycle
        this.state.isInBreak = true;
        this.state.breakType = 'session';
        this.notifyListeners();

        return { completed: false, isBreak: true };
    }

    // End break and start next focus cycle
    endBreak(): void {
        this.state.currentCycle++;
        this.state.isInBreak = false;
        this.state.breakType = null;
        this.state.cycleStartTime = Date.now();
        this.notifyListeners();
    }

    // Start interval break (mid-session break)
    startIntervalBreak(): void {
        this.state.isInBreak = true;
        this.state.breakType = 'interval';
        this.notifyListeners();
    }

    // Get current state
    getState(): PomodoroState {
        return { ...this.state };
    }

    // Reset state
    reset(): void {
        this.state = {
            currentCycle: 1,
            totalCycles: 1,
            isInBreak: false,
            breakType: null,
            cycleStartTime: null,
            sessionStartTime: null,
        };
        this.notifyListeners();
    }

    // Subscribe to state changes
    subscribe(listener: (state: PomodoroState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const state = this.getState();
        this.listeners.forEach(listener => listener(state));
    }

    // Calculate total session time for a preset
    calculateTotalTime(preset: FocusPreset): number {
        const focusTime = preset.focusDuration * preset.cycles;
        const breakTime = preset.breakDuration * (preset.cycles - 1);
        return focusTime + breakTime;
    }

    // Format duration for display
    formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
}

export const pomodoroService = new PomodoroService();
