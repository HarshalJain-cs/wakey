// apps/desktop/src/renderer/lib/event-bus.ts

import mitt, { Emitter } from 'mitt';

// Type imports for event payloads
interface Task {
    id: string;
    title: string;
    status: string;
    [key: string]: unknown;
}

interface Goal {
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    [key: string]: unknown;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    [key: string]: unknown;
}

type WakeyEvents = {
    // Focus events
    'focus:started': { sessionId: string; duration: number; taskId?: string };
    'focus:paused': { sessionId: string; elapsedMinutes: number };
    'focus:resumed': { sessionId: string };
    'focus:completed': { sessionId: string; actualDuration: number; quality: number };
    'focus:abandoned': { sessionId: string; reason: string };

    // Task events
    'task:created': { task: Task };
    'task:updated': { taskId: string; changes: Partial<Task> };
    'task:completed': { task: Task };
    'task:deleted': { taskId: string };

    // Goal events
    'goal:created': { goal: Goal };
    'goal:progress': { goalId: string; progress: number; previousProgress: number };
    'goal:achieved': { goal: Goal };

    // Achievement events
    'achievement:unlocked': { achievement: Achievement };
    'streak:milestone': { days: number };
    'level:up': { newLevel: number; previousLevel: number };

    // Health events
    'burnout:warning': { riskLevel: string; score: number };
    'break:recommended': { reason: string; suggestedDuration: number };
    'health:burnout-warning': { level: 'warning' | 'critical'; message: string };

    // Integration events
    'integration:connected': { integrationId: string };
    'integration:disconnected': { integrationId: string };
    'integration:sync:started': { integrationId: string };
    'integration:sync:completed': { integrationId: string; changes: number };
    'integration:error': { integrationId: string; error: string };
    'sync:completed': { entityType: string; entityId: string };
    'sync:failed': { entityType: string; entityId: string; error: string };

    // Flow events
    'flow:entered': { flowScore: number; timestamp: Date };
    'flow:exited': { duration: number; reason: string };

    // Notifications
    'system:notification': { type: 'info' | 'warning' | 'error'; message: string };

    // System events
    'app:ready': void;
    'app:idle': { idleMinutes: number };
    'app:active': void;
    'network:online': void;
    'network:offline': void;
};

class EventBus {
    private emitter: Emitter<WakeyEvents>;
    private history: { event: keyof WakeyEvents; data: unknown; timestamp: Date }[] = [];
    private maxHistorySize = 1000;

    constructor() {
        this.emitter = mitt<WakeyEvents>();
    }

    emit<K extends keyof WakeyEvents>(event: K, data: WakeyEvents[K]): void {
        this.emitter.emit(event, data);

        // Store in history for debugging
        this.history.push({ event, data, timestamp: new Date() });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    on<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
        this.emitter.on(event, handler);
    }

    off<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
        this.emitter.off(event, handler);
    }

    once<K extends keyof WakeyEvents>(event: K, handler: (data: WakeyEvents[K]) => void): void {
        const wrappedHandler = (data: WakeyEvents[K]) => {
            this.off(event, wrappedHandler);
            handler(data);
        };
        this.on(event, wrappedHandler);
    }

    getHistory(filter?: { event?: keyof WakeyEvents; since?: Date }): typeof this.history {
        let filtered = this.history;

        if (filter?.event) {
            filtered = filtered.filter(h => h.event === filter.event);
        }
        if (filter?.since) {
            filtered = filtered.filter(h => h.timestamp >= filter.since!);
        }

        return filtered;
    }
}

export const eventBus = new EventBus();
export type { WakeyEvents };
