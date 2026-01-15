/**
 * @fileoverview Goal Service for Wakey
 * 
 * Manages productivity goals with 8 predefined templates.
 * 
 * @module services/goal-service
 */

// ============================================
// Types
// ============================================

/**
 * Goal template types
 */
export type GoalType =
    | 'minimum-work-hours'
    | 'maximize-focus'
    | 'six-hour-workday'
    | 'limit-distractions'
    | 'more-breaks'
    | 'maximize-category'
    | 'reduce-meetings'
    | 'increase-meetings';

/**
 * Goal configuration
 */
export interface Goal {
    id: string;
    type: GoalType;
    name: string;
    description: string;
    target: number;
    unit: string;
    isActive: boolean;
    createdAt: string;
    category?: string; // For maximize-category type
}

/**
 * Goal progress tracking
 */
export interface GoalProgress {
    goalId: string;
    current: number;
    target: number;
    percentage: number;
    isAchieved: boolean;
    date: string;
}

/**
 * Goal template definition
 */
export interface GoalTemplate {
    type: GoalType;
    name: string;
    description: string;
    icon: string;
    defaultTarget: number;
    unit: string;
    color: string;
}

// ============================================
// Goal Templates
// ============================================

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        type: 'minimum-work-hours',
        name: 'Minimum Work Hours',
        description: 'Set a goal for the minimum number of hours you want to work each day. Track your daily work time and ensure you\'re putting in the hours needed to achieve your goals.',
        icon: '⏰',
        defaultTarget: 6,
        unit: 'hours',
        color: '#3b82f6', // blue
    },
    {
        type: 'maximize-focus',
        name: 'Maximizing Focus Time',
        description: 'Increase your deep work time. It\'s a skill that allows you to quickly master complicated information and produce better results in less time. Eliminate distractions and enter flow state.',
        icon: '🎯',
        defaultTarget: 4,
        unit: 'hours',
        color: '#14b8a6', // teal
    },
    {
        type: 'six-hour-workday',
        name: 'The 6-Hour Work Day',
        description: 'The eight-hour workday is a relic of the past. Research shows six hours makes more sense for the type of knowledge work we do today. Work smarter, not longer.',
        icon: '⚡',
        defaultTarget: 6,
        unit: 'hours max',
        color: '#f59e0b', // amber
    },
    {
        type: 'limit-distractions',
        name: 'Limiting Distracting Categories',
        description: 'Nothing zaps productivity and wastes time like social media does. This goal helps you minimize time spent on distracting websites and apps, reclaiming hours of your day.',
        icon: '🚫',
        defaultTarget: 30,
        unit: 'minutes max',
        color: '#ef4444', // red
    },
    {
        type: 'more-breaks',
        name: 'Taking More Breaks',
        description: 'Increase the amount of time you spend on breaks at work. Regular breaks improve focus, creativity, and prevent burnout. Track your break time and hold yourself accountable.',
        icon: '☕',
        defaultTarget: 10,
        unit: '% of work time',
        color: '#8b5cf6', // purple
    },
    {
        type: 'maximize-category',
        name: 'Maximizing a Time Category',
        description: 'Track any time category and set a daily goal minimum for it. Perfect for maximizing productive behaviors like coding, writing, designing, learning, or any skill you want to develop.',
        icon: '📊',
        defaultTarget: 3,
        unit: 'hours',
        color: '#22c55e', // green
    },
    {
        type: 'reduce-meetings',
        name: 'Reducing Meeting Time',
        description: 'Meetings can be one of the biggest productivity killers for you and others. If you\'re responsible for scheduling meetings, use this goal to minimize them and protect your deep work time.',
        icon: '📉',
        defaultTarget: 2,
        unit: 'hours max',
        color: '#f97316', // orange
    },
    {
        type: 'increase-meetings',
        name: 'Increasing Meeting Time',
        description: 'For some professions, meeting time equals productivity. If you\'re an investor, salesperson, or manager, maximizing face-time with people directly correlates to your success.',
        icon: '📈',
        defaultTarget: 4,
        unit: 'hours',
        color: '#06b6d4', // cyan
    },
];

// ============================================
// Goal Service
// ============================================

class GoalService {
    private goals: Goal[] = [];
    private progressHistory: GoalProgress[] = [];

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Loads goals from localStorage
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_goals');
            if (stored) {
                this.goals = JSON.parse(stored);
            }
            const progress = localStorage.getItem('wakey_goal_progress');
            if (progress) {
                this.progressHistory = JSON.parse(progress);
            }
        } catch (error) {
            console.error('Failed to load goals:', error);
        }
    }

    /**
     * Saves goals to localStorage
     */
    private saveToStorage(): void {
        localStorage.setItem('wakey_goals', JSON.stringify(this.goals));
        localStorage.setItem('wakey_goal_progress', JSON.stringify(this.progressHistory));
    }

    /**
     * Creates a new goal from template
     */
    createGoal(type: GoalType, target?: number, category?: string): Goal {
        const template = GOAL_TEMPLATES.find(t => t.type === type);
        if (!template) throw new Error(`Unknown goal type: ${type}`);

        const goal: Goal = {
            id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            type,
            name: template.name,
            description: template.description,
            target: target ?? template.defaultTarget,
            unit: template.unit,
            isActive: true,
            createdAt: new Date().toISOString(),
            category,
        };

        this.goals.push(goal);
        this.saveToStorage();
        return goal;
    }

    /**
     * Gets all goals
     */
    getAllGoals(): Goal[] {
        return [...this.goals];
    }

    /**
     * Gets active goals
     */
    getActiveGoals(): Goal[] {
        return this.goals.filter(g => g.isActive);
    }

    /**
     * Toggles goal active state
     */
    toggleGoal(goalId: string): void {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.isActive = !goal.isActive;
            this.saveToStorage();
        }
    }

    /**
     * Updates goal target
     */
    updateGoalTarget(goalId: string, target: number): void {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.target = target;
            this.saveToStorage();
        }
    }

    /**
     * Deletes a goal
     */
    deleteGoal(goalId: string): void {
        this.goals = this.goals.filter(g => g.id !== goalId);
        this.saveToStorage();
    }

    /**
     * Calculates progress for a goal based on current stats
     */
    calculateProgress(goal: Goal, stats: { focusMinutes: number; distractionMinutes: number; meetingMinutes: number; breakMinutes: number; categoryMinutes: Record<string, number> }): GoalProgress {
        let current = 0;

        switch (goal.type) {
            case 'minimum-work-hours':
            case 'maximize-focus':
                current = stats.focusMinutes / 60;
                break;
            case 'six-hour-workday':
                current = Math.max(0, 6 - stats.focusMinutes / 60); // Remaining under 6h
                break;
            case 'limit-distractions':
                current = goal.target - stats.distractionMinutes; // How much under limit
                break;
            case 'more-breaks':
                current = stats.focusMinutes > 0 ? (stats.breakMinutes / stats.focusMinutes) * 100 : 0;
                break;
            case 'maximize-category':
                current = (stats.categoryMinutes[goal.category || 'Development'] || 0) / 60;
                break;
            case 'reduce-meetings':
                current = goal.target - stats.meetingMinutes / 60; // How much under limit
                break;
            case 'increase-meetings':
                current = stats.meetingMinutes / 60;
                break;
        }

        const percentage = Math.min(100, (current / goal.target) * 100);
        const isAchieved = percentage >= 100;

        return {
            goalId: goal.id,
            current: Math.round(current * 10) / 10,
            target: goal.target,
            percentage: Math.round(percentage),
            isAchieved,
            date: new Date().toISOString().split('T')[0],
        };
    }

    /**
     * Records progress for today
     */
    recordProgress(progress: GoalProgress): void {
        // Remove old progress for same goal on same day
        this.progressHistory = this.progressHistory.filter(
            p => !(p.goalId === progress.goalId && p.date === progress.date)
        );
        this.progressHistory.push(progress);
        this.saveToStorage();
    }

    /**
     * Gets progress history for a goal
     */
    getProgressHistory(goalId: string, days = 7): GoalProgress[] {
        return this.progressHistory
            .filter(p => p.goalId === goalId)
            .slice(-days);
    }

    /**
     * Gets all templates
     */
    getTemplates(): GoalTemplate[] {
        return GOAL_TEMPLATES;
    }
}

// Singleton instance
export const goalService = new GoalService();
export default goalService;
