// apps/desktop/src/renderer/services/recurring-task-service.ts

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrencePattern {
    type: RecurrenceType;
    interval: number;           // Every N days/weeks/months
    daysOfWeek?: number[];      // 0-6 for Sunday-Saturday
    daysOfMonth?: number[];     // 1-31
    monthsOfYear?: number[];    // 1-12
    endDate?: Date;
    occurrences?: number;       // Max occurrences
    exceptions?: Date[];        // Skip these dates
}

export interface RecurringTask {
    id: string;
    title: string;
    description?: string;
    recurrence: RecurrencePattern;
    nextOccurrence: Date | null;
    lastCompleted?: Date;
    completedOccurrences: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Template fields
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes?: number;
    tags?: string[];
    projectId?: string;
}

interface RecurringTaskInstance {
    id: string;
    recurringTaskId: string;
    title: string;
    description?: string;
    scheduledDate: Date;
    completed: boolean;
    completedAt?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes?: number;
    tags?: string[];
    projectId?: string;
}

export class RecurringTaskService {
    private recurringTasks: Map<string, RecurringTask> = new Map();
    private instances: Map<string, RecurringTaskInstance> = new Map();
    private storageKey = 'wakey-recurring-tasks';
    private instancesKey = 'wakey-recurring-instances';

    constructor() {
        this.loadFromStorage();
    }

    private generateId(): string {
        return `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.recurringTasks = new Map(
                    data.map((t: any) => [t.id, {
                        ...t,
                        nextOccurrence: t.nextOccurrence ? new Date(t.nextOccurrence) : null,
                        lastCompleted: t.lastCompleted ? new Date(t.lastCompleted) : undefined,
                        createdAt: new Date(t.createdAt),
                        updatedAt: new Date(t.updatedAt),
                        recurrence: {
                            ...t.recurrence,
                            endDate: t.recurrence.endDate ? new Date(t.recurrence.endDate) : undefined
                        }
                    }])
                );
            }

            const instancesStored = localStorage.getItem(this.instancesKey);
            if (instancesStored) {
                const data = JSON.parse(instancesStored);
                this.instances = new Map(
                    data.map((i: any) => [i.id, {
                        ...i,
                        scheduledDate: new Date(i.scheduledDate),
                        completedAt: i.completedAt ? new Date(i.completedAt) : undefined
                    }])
                );
            }
        } catch (error) {
            console.error('Failed to load recurring tasks:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(Array.from(this.recurringTasks.values()))
            );
            localStorage.setItem(
                this.instancesKey,
                JSON.stringify(Array.from(this.instances.values()))
            );
        } catch (error) {
            console.error('Failed to save recurring tasks:', error);
        }
    }

    async createRecurringTask(
        title: string,
        recurrence: RecurrencePattern,
        options?: Partial<Omit<RecurringTask, 'id' | 'title' | 'recurrence' | 'nextOccurrence' | 'completedOccurrences' | 'active' | 'createdAt' | 'updatedAt'>>
    ): Promise<RecurringTask> {
        const now = new Date();
        const nextOccurrence = this.calculateNextOccurrence(now, recurrence);

        const recurringTask: RecurringTask = {
            id: this.generateId(),
            title,
            description: options?.description,
            recurrence,
            nextOccurrence,
            completedOccurrences: 0,
            active: true,
            createdAt: now,
            updatedAt: now,
            priority: options?.priority,
            estimatedMinutes: options?.estimatedMinutes,
            tags: options?.tags,
            projectId: options?.projectId
        };

        this.recurringTasks.set(recurringTask.id, recurringTask);

        // Generate the first instance
        if (nextOccurrence) {
            await this.generateInstance(recurringTask, nextOccurrence);
        }

        this.saveToStorage();
        return recurringTask;
    }

    calculateNextOccurrence(from: Date, pattern: RecurrencePattern): Date | null {
        const next = new Date(from);
        next.setHours(9, 0, 0, 0); // Default to 9 AM

        switch (pattern.type) {
            case 'daily':
                next.setDate(next.getDate() + pattern.interval);
                break;

            case 'weekly':
                if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
                    // Find next matching day
                    let found = false;
                    for (let i = 0; i < 7 * pattern.interval + 7; i++) {
                        next.setDate(next.getDate() + 1);
                        if (pattern.daysOfWeek.includes(next.getDay())) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) return null;
                } else {
                    next.setDate(next.getDate() + (pattern.interval * 7));
                }
                break;

            case 'monthly':
                if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
                    next.setMonth(next.getMonth() + pattern.interval);
                    const daysInMonth = this.getDaysInMonth(next);
                    next.setDate(Math.min(pattern.daysOfMonth[0], daysInMonth));
                } else {
                    next.setMonth(next.getMonth() + pattern.interval);
                }
                break;

            case 'yearly':
                next.setFullYear(next.getFullYear() + pattern.interval);
                if (pattern.monthsOfYear && pattern.monthsOfYear.length > 0) {
                    next.setMonth(pattern.monthsOfYear[0] - 1);
                }
                break;

            case 'custom':
                // Handle custom RRULE-like patterns
                next.setDate(next.getDate() + pattern.interval);
                break;
        }

        // Check end conditions
        if (pattern.endDate && next > pattern.endDate) return null;

        // Check if date is in exceptions
        if (pattern.exceptions) {
            const nextStr = next.toISOString().split('T')[0];
            if (pattern.exceptions.some(e => new Date(e).toISOString().split('T')[0] === nextStr)) {
                // Skip this date and find next
                return this.calculateNextOccurrence(next, pattern);
            }
        }

        return next;
    }

    private getDaysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    private async generateInstance(recurringTask: RecurringTask, scheduledDate: Date): Promise<RecurringTaskInstance> {
        const instance: RecurringTaskInstance = {
            id: this.generateId(),
            recurringTaskId: recurringTask.id,
            title: recurringTask.title,
            description: recurringTask.description,
            scheduledDate,
            completed: false,
            priority: recurringTask.priority,
            estimatedMinutes: recurringTask.estimatedMinutes,
            tags: recurringTask.tags,
            projectId: recurringTask.projectId
        };

        this.instances.set(instance.id, instance);
        return instance;
    }

    async completeInstance(instanceId: string): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error('Instance not found');
        }

        // Mark instance as complete
        instance.completed = true;
        instance.completedAt = new Date();

        // Update recurring task
        const recurringTask = this.recurringTasks.get(instance.recurringTaskId);
        if (recurringTask && recurringTask.active) {
            recurringTask.lastCompleted = new Date();
            recurringTask.completedOccurrences++;
            recurringTask.updatedAt = new Date();

            // Check if we've reached max occurrences
            const pattern = recurringTask.recurrence;
            if (pattern.occurrences && recurringTask.completedOccurrences >= pattern.occurrences) {
                recurringTask.active = false;
                recurringTask.nextOccurrence = null;
            } else {
                // Calculate and generate next instance
                recurringTask.nextOccurrence = this.calculateNextOccurrence(
                    new Date(),
                    recurringTask.recurrence
                );

                if (recurringTask.nextOccurrence) {
                    await this.generateInstance(recurringTask, recurringTask.nextOccurrence);
                } else {
                    recurringTask.active = false;
                }
            }
        }

        this.saveToStorage();
    }

    async skipInstance(instanceId: string): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error('Instance not found');
        }

        // Don't mark as completed, just generate next
        const recurringTask = this.recurringTasks.get(instance.recurringTaskId);
        if (recurringTask && recurringTask.active) {
            recurringTask.nextOccurrence = this.calculateNextOccurrence(
                instance.scheduledDate,
                recurringTask.recurrence
            );

            if (recurringTask.nextOccurrence) {
                await this.generateInstance(recurringTask, recurringTask.nextOccurrence);
            }
        }

        // Remove the skipped instance
        this.instances.delete(instanceId);
        this.saveToStorage();
    }

    // Natural language parsing
    parseRecurrence(text: string): RecurrencePattern | null {
        const lowered = text.toLowerCase().trim();

        // "every day" or "daily"
        if (/every\s+day|daily/i.test(lowered)) {
            return { type: 'daily', interval: 1 };
        }

        // "every N days"
        const daysMatch = lowered.match(/every\s+(\d+)\s+days?/i);
        if (daysMatch) {
            return { type: 'daily', interval: parseInt(daysMatch[1]) };
        }

        // "every weekday"
        if (/every\s+weekday/i.test(lowered)) {
            return { type: 'weekly', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] };
        }

        // "every weekend"
        if (/every\s+weekend/i.test(lowered)) {
            return { type: 'weekly', interval: 1, daysOfWeek: [0, 6] };
        }

        // Days of week
        const dayNames: Record<string, number> = {
            sunday: 0, sun: 0,
            monday: 1, mon: 1,
            tuesday: 2, tue: 2, tues: 2,
            wednesday: 3, wed: 3,
            thursday: 4, thu: 4, thur: 4, thurs: 4,
            friday: 5, fri: 5,
            saturday: 6, sat: 6
        };

        // "every monday" or "every monday and friday"
        const weekdayMatch = lowered.match(/every\s+((?:(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*(?:\s+and\s+)?)+)/i);
        if (weekdayMatch) {
            const days: number[] = [];
            for (const [name, num] of Object.entries(dayNames)) {
                if (weekdayMatch[1].includes(name)) {
                    if (!days.includes(num)) days.push(num);
                }
            }
            if (days.length > 0) {
                return { type: 'weekly', interval: 1, daysOfWeek: days.sort() };
            }
        }

        // "every week" or "weekly"
        if (/every\s+week|weekly/i.test(lowered)) {
            return { type: 'weekly', interval: 1 };
        }

        // "every N weeks"
        const weeksMatch = lowered.match(/every\s+(\d+)\s+weeks?/i);
        if (weeksMatch) {
            return { type: 'weekly', interval: parseInt(weeksMatch[1]) };
        }

        // "every month" or "monthly"
        if (/every\s+month|monthly/i.test(lowered)) {
            return { type: 'monthly', interval: 1 };
        }

        // "monthly on the 15th"
        const monthDayMatch = lowered.match(/monthly\s+on\s+(?:the\s+)?(\d+)(?:st|nd|rd|th)?/i);
        if (monthDayMatch) {
            return { type: 'monthly', interval: 1, daysOfMonth: [parseInt(monthDayMatch[1])] };
        }

        // "every N months"
        const monthsMatch = lowered.match(/every\s+(\d+)\s+months?/i);
        if (monthsMatch) {
            return { type: 'monthly', interval: parseInt(monthsMatch[1]) };
        }

        // "every year" or "yearly" or "annually"
        if (/every\s+year|yearly|annually/i.test(lowered)) {
            return { type: 'yearly', interval: 1 };
        }

        return null;
    }

    // Getters
    getRecurringTask(id: string): RecurringTask | undefined {
        return this.recurringTasks.get(id);
    }

    getAllRecurringTasks(): RecurringTask[] {
        return Array.from(this.recurringTasks.values());
    }

    getActiveRecurringTasks(): RecurringTask[] {
        return this.getAllRecurringTasks().filter(t => t.active);
    }

    getUpcomingInstances(days: number = 7): RecurringTaskInstance[] {
        const now = new Date();
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return Array.from(this.instances.values())
            .filter(i => !i.completed && i.scheduledDate >= now && i.scheduledDate <= cutoff)
            .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    }

    getTodaysInstances(): RecurringTaskInstance[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return Array.from(this.instances.values())
            .filter(i => !i.completed && i.scheduledDate >= today && i.scheduledDate < tomorrow);
    }

    getOverdueInstances(): RecurringTaskInstance[] {
        const now = new Date();
        return Array.from(this.instances.values())
            .filter(i => !i.completed && i.scheduledDate < now);
    }

    async updateRecurringTask(id: string, updates: Partial<RecurringTask>): Promise<RecurringTask | null> {
        const task = this.recurringTasks.get(id);
        if (!task) return null;

        const updated = {
            ...task,
            ...updates,
            id: task.id, // Prevent ID change
            updatedAt: new Date()
        };

        // Recalculate next occurrence if recurrence pattern changed
        if (updates.recurrence) {
            updated.nextOccurrence = this.calculateNextOccurrence(new Date(), updates.recurrence);
        }

        this.recurringTasks.set(id, updated);
        this.saveToStorage();
        return updated;
    }

    async pauseRecurringTask(id: string): Promise<void> {
        const task = this.recurringTasks.get(id);
        if (task) {
            task.active = false;
            task.updatedAt = new Date();
            this.saveToStorage();
        }
    }

    async resumeRecurringTask(id: string): Promise<void> {
        const task = this.recurringTasks.get(id);
        if (task) {
            task.active = true;
            task.nextOccurrence = this.calculateNextOccurrence(new Date(), task.recurrence);
            task.updatedAt = new Date();

            if (task.nextOccurrence) {
                await this.generateInstance(task, task.nextOccurrence);
            }
            this.saveToStorage();
        }
    }

    async deleteRecurringTask(id: string): Promise<void> {
        this.recurringTasks.delete(id);

        // Remove all related instances
        for (const [instanceId, instance] of this.instances.entries()) {
            if (instance.recurringTaskId === id) {
                this.instances.delete(instanceId);
            }
        }

        this.saveToStorage();
    }

    // Statistics
    getStatistics(): {
        total: number;
        active: number;
        paused: number;
        completedToday: number;
        streakDays: number;
    } {
        const tasks = this.getAllRecurringTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const completedToday = Array.from(this.instances.values())
            .filter(i => i.completed && i.completedAt && i.completedAt >= today && i.completedAt < tomorrow)
            .length;

        return {
            total: tasks.length,
            active: tasks.filter(t => t.active).length,
            paused: tasks.filter(t => !t.active).length,
            completedToday,
            streakDays: this.calculateStreak()
        };
    }

    private calculateStreak(): number {
        // Calculate how many consecutive days user has completed all recurring tasks
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const nextDay = new Date(checkDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayInstances = Array.from(this.instances.values())
                .filter(inst => inst.scheduledDate >= checkDate && inst.scheduledDate < nextDay);

            if (dayInstances.length === 0) continue;

            const allCompleted = dayInstances.every(inst => inst.completed);
            if (allCompleted) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}

export const recurringTaskService = new RecurringTaskService();
