/**
 * @fileoverview Predictive Task Agent Service
 * 
 * AI agent that predicts what the user will need next based on patterns:
 * - Activity pattern learning
 * - Time-of-day predictions
 * - Proactive task suggestions
 * - Pre-research common topics
 * 
 * @module services/predictive-task-service
 */

// ============================================
// Types
// ============================================

export interface ActivityPattern {
    id: string;
    activity: string;
    dayOfWeek: number;  // 0-6
    hourOfDay: number;  // 0-23
    frequency: number;
    lastOccurrence: Date;
    averageDuration: number;  // minutes
}

export interface TaskPrediction {
    id: string;
    title: string;
    description: string;
    confidence: number;  // 0-100
    reasoning: string;
    suggestedTime: Date | null;
    category: 'focus' | 'meeting' | 'break' | 'research' | 'routine';
    dismissed: boolean;
}

export interface UserContext {
    currentTime: Date;
    dayOfWeek: number;
    hourOfDay: number;
    recentApps: string[];
    currentTask: string | null;
    focusSessionActive: boolean;
    lastBreak: Date | null;
}

interface PredictiveConfig {
    enabled: boolean;
    learnFromActivity: boolean;
    maxPredictions: number;
    confidenceThreshold: number;  // Only show predictions above this %
    predictBreaks: boolean;
    predictTasks: boolean;
    predictFocus: boolean;
}

// ============================================
// Predictive Task Service
// ============================================

class PredictiveTaskService {
    private config: PredictiveConfig;
    private patterns: Map<string, ActivityPattern> = new Map();
    private predictions: TaskPrediction[] = [];
    private activityHistory: Array<{ activity: string; timestamp: Date }> = [];

    constructor() {
        this.config = this.loadConfig();
        this.loadPatterns();
    }

    private loadConfig(): PredictiveConfig {
        try {
            const stored = localStorage.getItem('wakey_predictive_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load predictive config:', error);
        }

        return {
            enabled: true,
            learnFromActivity: true,
            maxPredictions: 5,
            confidenceThreshold: 60,
            predictBreaks: true,
            predictTasks: true,
            predictFocus: true,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_predictive_config', JSON.stringify(this.config));
    }

    private loadPatterns(): void {
        try {
            const stored = localStorage.getItem('wakey_activity_patterns');
            if (stored) {
                const data = JSON.parse(stored);
                this.patterns = new Map(data.map((p: ActivityPattern) => [p.id, p]));
            }
        } catch (error) {
            console.error('Failed to load patterns:', error);
        }
    }

    private savePatterns(): void {
        const data = Array.from(this.patterns.values());
        localStorage.setItem('wakey_activity_patterns', JSON.stringify(data));
    }

    // ============================================
    // Activity Learning
    // ============================================

    /**
     * Record an activity for pattern learning
     */
    recordActivity(activity: string): void {
        if (!this.config.enabled || !this.config.learnFromActivity) {
            return;
        }

        const now = new Date();
        const dayOfWeek = now.getDay();
        const hourOfDay = now.getHours();

        // Add to history
        this.activityHistory.push({ activity, timestamp: now });

        // Keep only last 1000 activities
        if (this.activityHistory.length > 1000) {
            this.activityHistory = this.activityHistory.slice(-1000);
        }

        // Update or create pattern
        const patternKey = `${activity}_${dayOfWeek}_${hourOfDay}`;
        const existing = this.patterns.get(patternKey);

        if (existing) {
            existing.frequency++;
            existing.lastOccurrence = now;
        } else {
            this.patterns.set(patternKey, {
                id: patternKey,
                activity,
                dayOfWeek,
                hourOfDay,
                frequency: 1,
                lastOccurrence: now,
                averageDuration: 30,  // Default
            });
        }

        this.savePatterns();
    }

    /**
     * Record activity duration
     */
    recordDuration(activity: string, durationMinutes: number): void {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hourOfDay = now.getHours();

        const patternKey = `${activity}_${dayOfWeek}_${hourOfDay}`;
        const pattern = this.patterns.get(patternKey);

        if (pattern) {
            // Running average
            pattern.averageDuration = (pattern.averageDuration + durationMinutes) / 2;
            this.savePatterns();
        }
    }

    // ============================================
    // Predictions
    // ============================================

    /**
     * Generate predictions based on current context
     */
    generatePredictions(context?: Partial<UserContext>): TaskPrediction[] {
        if (!this.config.enabled) {
            return [];
        }

        const now = new Date();
        const fullContext: UserContext = {
            currentTime: now,
            dayOfWeek: now.getDay(),
            hourOfDay: now.getHours(),
            recentApps: [],
            currentTask: null,
            focusSessionActive: false,
            lastBreak: null,
            ...context,
        };

        const predictions: TaskPrediction[] = [];

        // Pattern-based predictions
        if (this.config.predictTasks) {
            predictions.push(...this.predictFromPatterns(fullContext));
        }

        // Break predictions
        if (this.config.predictBreaks) {
            const breakPrediction = this.predictBreak(fullContext);
            if (breakPrediction) {
                predictions.push(breakPrediction);
            }
        }

        // Focus predictions
        if (this.config.predictFocus) {
            const focusPrediction = this.predictFocusSession(fullContext);
            if (focusPrediction) {
                predictions.push(focusPrediction);
            }
        }

        // Time-based routine predictions
        predictions.push(...this.predictRoutines(fullContext));

        // Filter by confidence and limit
        this.predictions = predictions
            .filter(p => p.confidence >= this.config.confidenceThreshold)
            .filter(p => !p.dismissed)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, this.config.maxPredictions);

        return this.predictions;
    }

    private predictFromPatterns(context: UserContext): TaskPrediction[] {
        const predictions: TaskPrediction[] = [];
        const { dayOfWeek, hourOfDay } = context;

        // Find patterns matching current time window
        for (const pattern of this.patterns.values()) {
            if (pattern.dayOfWeek === dayOfWeek &&
                Math.abs(pattern.hourOfDay - hourOfDay) <= 1 &&
                pattern.frequency >= 3) {  // Only predict if seen at least 3 times

                const confidence = Math.min(95, 50 + pattern.frequency * 5);

                predictions.push({
                    id: `pred_${pattern.id}_${Date.now()}`,
                    title: pattern.activity,
                    description: `You usually do "${pattern.activity}" around this time.`,
                    confidence,
                    reasoning: `Based on ${pattern.frequency} occurrences on ${this.getDayName(dayOfWeek)}s around ${hourOfDay}:00`,
                    suggestedTime: new Date(),
                    category: this.categorizeActivity(pattern.activity),
                    dismissed: false,
                });
            }
        }

        return predictions;
    }

    private predictBreak(context: UserContext): TaskPrediction | null {
        if (context.focusSessionActive) {
            return null;  // Don't suggest breaks during focus
        }

        const now = context.currentTime;
        const lastBreakMs = context.lastBreak?.getTime() || 0;
        const minutesSinceBreak = (now.getTime() - lastBreakMs) / 60000;

        // Suggest break every 90 minutes
        if (minutesSinceBreak > 90) {
            return {
                id: `pred_break_${Date.now()}`,
                title: 'Take a break',
                description: 'You\'ve been working for a while. A short break can boost productivity.',
                confidence: Math.min(90, 60 + (minutesSinceBreak - 90) / 2),
                reasoning: `${Math.round(minutesSinceBreak)} minutes since last break`,
                suggestedTime: new Date(),
                category: 'break',
                dismissed: false,
            };
        }

        return null;
    }

    private predictFocusSession(context: UserContext): TaskPrediction | null {
        if (context.focusSessionActive) {
            return null;
        }

        const { hourOfDay, dayOfWeek } = context;

        // Morning focus time (9-11 AM on weekdays)
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hourOfDay >= 9 && hourOfDay <= 11) {
            return {
                id: `pred_focus_${Date.now()}`,
                title: 'Start a focus session',
                description: 'Morning is your peak productivity time. Start a deep work session.',
                confidence: 75,
                reasoning: 'Morning hours (9-11 AM) are typically best for focused work',
                suggestedTime: new Date(),
                category: 'focus',
                dismissed: false,
            };
        }

        // Afternoon focus (2-4 PM)
        if (hourOfDay >= 14 && hourOfDay <= 16) {
            return {
                id: `pred_focus_afternoon_${Date.now()}`,
                title: 'Afternoon focus block',
                description: 'Good time for a shorter focus session before the day winds down.',
                confidence: 65,
                reasoning: 'Afternoon focus block (2-4 PM) is effective for completing tasks',
                suggestedTime: new Date(),
                category: 'focus',
                dismissed: false,
            };
        }

        return null;
    }

    private predictRoutines(context: UserContext): TaskPrediction[] {
        const predictions: TaskPrediction[] = [];
        const { hourOfDay, dayOfWeek } = context;

        // Morning planning (around 9 AM on weekdays)
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hourOfDay === 9) {
            predictions.push({
                id: `pred_planning_${Date.now()}`,
                title: 'Plan your day',
                description: 'Review tasks and set priorities for the day.',
                confidence: 70,
                reasoning: 'Morning planning sets the tone for a productive day',
                suggestedTime: new Date(),
                category: 'routine',
                dismissed: false,
            });
        }

        // End of day review (around 5-6 PM)
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && (hourOfDay === 17 || hourOfDay === 18)) {
            predictions.push({
                id: `pred_review_${Date.now()}`,
                title: 'Daily review',
                description: 'Review what you accomplished and plan for tomorrow.',
                confidence: 65,
                reasoning: 'End-of-day reviews help maintain progress',
                suggestedTime: new Date(),
                category: 'routine',
                dismissed: false,
            });
        }

        // Weekly planning (Monday morning)
        if (dayOfWeek === 1 && hourOfDay >= 9 && hourOfDay <= 10) {
            predictions.push({
                id: `pred_weekly_${Date.now()}`,
                title: 'Weekly planning',
                description: 'Set goals and priorities for the week ahead.',
                confidence: 75,
                reasoning: 'Weekly planning on Mondays improves goal achievement',
                suggestedTime: new Date(),
                category: 'routine',
                dismissed: false,
            });
        }

        return predictions;
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * Get current predictions
     */
    getPredictions(): TaskPrediction[] {
        if (this.predictions.length === 0) {
            return this.generatePredictions();
        }
        return this.predictions;
    }

    /**
     * Dismiss a prediction
     */
    dismissPrediction(predictionId: string): void {
        const prediction = this.predictions.find(p => p.id === predictionId);
        if (prediction) {
            prediction.dismissed = true;
        }
    }

    /**
     * Accept a prediction (positive feedback for learning)
     */
    acceptPrediction(predictionId: string): void {
        const prediction = this.predictions.find(p => p.id === predictionId);
        if (prediction) {
            // Record as activity to strengthen the pattern
            this.recordActivity(prediction.title);
            prediction.dismissed = true;
        }
    }

    /**
     * Get patterns for analysis
     */
    getPatterns(): ActivityPattern[] {
        return Array.from(this.patterns.values())
            .sort((a, b) => b.frequency - a.frequency);
    }

    /**
     * Get top patterns
     */
    getTopPatterns(limit: number = 10): ActivityPattern[] {
        return this.getPatterns().slice(0, limit);
    }

    /**
     * Clear all patterns
     */
    clearPatterns(): void {
        this.patterns.clear();
        this.savePatterns();
    }

    // ============================================
    // Helpers
    // ============================================

    private categorizeActivity(activity: string): TaskPrediction['category'] {
        const lower = activity.toLowerCase();

        if (lower.includes('meeting') || lower.includes('call') || lower.includes('sync')) {
            return 'meeting';
        }
        if (lower.includes('break') || lower.includes('rest') || lower.includes('lunch')) {
            return 'break';
        }
        if (lower.includes('research') || lower.includes('learn') || lower.includes('read')) {
            return 'research';
        }
        if (lower.includes('focus') || lower.includes('deep work') || lower.includes('code')) {
            return 'focus';
        }
        return 'routine';
    }

    private getDayName(day: number): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    }

    // ============================================
    // Configuration
    // ============================================

    getConfig(): PredictiveConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<PredictiveConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    toggle(): void {
        this.config.enabled = !this.config.enabled;
        this.saveConfig();
    }
}

// Singleton instance
export const predictiveTaskService = new PredictiveTaskService();
export default predictiveTaskService;
