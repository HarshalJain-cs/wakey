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
    longDescription: string;
    objectives: string[];
    icon: string;
    defaultTarget: number;
    unit: string;
    color: string;
    isMaximum: boolean; // true = goal is to stay UNDER target, false = goal is to reach target
    customizable: {
        target: boolean;
        categories: boolean;
    };
}

// ============================================
// Goal Templates
// ============================================

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        type: 'minimum-work-hours',
        name: 'Minimum Work Hours',
        description: 'Set a goal for the minimum number of hours you want to work each day.',
        longDescription: 'Track your daily work time and ensure you\'re putting in the hours needed to achieve your goals. This helps maintain consistency and accountability in your work schedule.',
        objectives: ['Achieve more than a specified amount of work hours on a daily basis.'],
        icon: '⏰',
        defaultTarget: 6,
        unit: 'hours',
        color: '#3b82f6',
        isMaximum: false,
        customizable: { target: true, categories: false },
    },
    {
        type: 'maximize-focus',
        name: 'Maximizing Focus Time',
        description: 'Increase the amount of time for deep work.',
        longDescription: 'It\'s a skill that allows you to quickly master complicated information and produce better results in less time. Deep work is the ability to focus without distraction on a cognitively demanding task. Eliminate distractions and enter flow state to maximize your productivity.',
        objectives: ['Achieve more than a specified amount of focused work time on a daily basis.'],
        icon: '🎯',
        defaultTarget: 4,
        unit: 'hours',
        color: '#14b8a6',
        isMaximum: false,
        customizable: { target: true, categories: false },
    },
    {
        type: 'six-hour-workday',
        name: 'The 6-Hour Work Day',
        description: 'The eight-hour workday is a relic of the past.',
        longDescription: 'It\'s argued that the six-hour workday makes more sense for the type of life we live today. The internet fundamentally changed the way we live, work, and play, and the nature of work itself has transitioned from algorithmic tasks to heuristic ones that require critical thinking, problem-solving, and creativity. Six hours is approximately the total amount of time that we can truly be productive with these high cognitive tasks.',
        objectives: ['Achieve less than a specified amount of work hours on a daily basis.'],
        icon: '⚡',
        defaultTarget: 6,
        unit: 'hours max',
        color: '#f59e0b',
        isMaximum: true,
        customizable: { target: true, categories: false },
    },
    {
        type: 'limit-distractions',
        name: 'Limiting Distracting Categories',
        description: 'Nothing zaps productivity and time wasted like social media does.',
        longDescription: 'This goal helps you minimize time spent on distracting categories. By default, it tracks your daily time spent on social media sites and sets 30 minutes as the goal maximum. However, you can customize the time category tracked as well as add multiple categories that count towards the goal.',
        objectives: ['Achieve less than a specified amount of time spent in a time category on a daily basis.'],
        icon: '🚫',
        defaultTarget: 30,
        unit: 'minutes max',
        color: '#ef4444',
        isMaximum: true,
        customizable: { target: true, categories: true },
    },
    {
        type: 'more-breaks',
        name: 'Taking More Breaks',
        description: 'Increase the amount of time you spend on break at work.',
        longDescription: 'This goal helps you keep track of your break time and hold yourself accountable. Studies show that taking frequent short breaks throughout the day improves your cognition and prevents long-term burnout. It\'s easy to not take breaks due to a fear of losing momentum, especially if you feel like you are on a roll crushing task after task. However, we have a limited capacity for concentrating over extended time periods, and though we may not be practiced at recognizing the symptoms of fatigue, they unavoidably derail our work.',
        objectives: ['Achieve more than a specified amount of break time on a daily basis.'],
        icon: '☕',
        defaultTarget: 10,
        unit: '% of work time',
        color: '#8b5cf6',
        isMaximum: false,
        customizable: { target: true, categories: false },
    },
    {
        type: 'maximize-category',
        name: 'Maximizing a Time Category',
        description: 'Track any time category and set a daily goal minimum for it.',
        longDescription: 'This is useful for maximizing productive behaviors like coding, writing, designing, learning, or any skill you want to develop. You can customize the time category tracked as well as add multiple categories that count towards the goal. Perfect for holding yourself accountable to specific activities.',
        objectives: ['Achieve more than a specified amount of time spent in a time category on a daily basis.'],
        icon: '📊',
        defaultTarget: 3,
        unit: 'hours',
        color: '#22c55e',
        isMaximum: false,
        customizable: { target: true, categories: true },
    },
    {
        type: 'reduce-meetings',
        name: 'Reducing Meeting Time',
        description: 'Meetings can be one of the biggest productivity killers.',
        longDescription: 'Meetings can be one of the biggest productivity killers for you and for others. If you are responsible for scheduling meetings, use this goal to help minimize them and protect your deep work time. Unnecessary meetings fragment your schedule and prevent the long stretches of uninterrupted work needed for complex tasks.',
        objectives: ['Achieve less than a specified amount of meeting time on a daily basis.'],
        icon: '📉',
        defaultTarget: 2,
        unit: 'hours max',
        color: '#f97316',
        isMaximum: true,
        customizable: { target: true, categories: false },
    },
    {
        type: 'increase-meetings',
        name: 'Increasing Meeting Time',
        description: 'For a few professions, meeting time is equivalent to productivity.',
        longDescription: 'If you\'re an investor, salesperson, or manager, maximizing your meeting time with people correlates to success. Face-to-face interactions build relationships, close deals, and drive business forward. Use this goal to ensure you\'re spending enough time connecting with clients, prospects, and team members.',
        objectives: ['Achieve more than a specified amount of meeting time on a daily basis.'],
        icon: '📈',
        defaultTarget: 4,
        unit: 'hours',
        color: '#06b6d4',
        isMaximum: false,
        customizable: { target: true, categories: false },
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
