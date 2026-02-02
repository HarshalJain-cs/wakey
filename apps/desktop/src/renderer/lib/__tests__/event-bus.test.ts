// apps/desktop/src/renderer/lib/__tests__/event-bus.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus } from '../event-bus';

describe('EventBus', () => {
    beforeEach(() => {
        // Clear history between tests
        vi.clearAllMocks();
    });

    describe('emit and on', () => {
        it('should emit and receive events', () => {
            const handler = vi.fn();

            eventBus.on('focus:started', handler);
            eventBus.emit('focus:started', {
                sessionId: '123',
                duration: 25
            });

            expect(handler).toHaveBeenCalledWith({
                sessionId: '123',
                duration: 25,
            });
        });

        it('should emit events with optional properties', () => {
            const handler = vi.fn();

            eventBus.on('focus:started', handler);
            eventBus.emit('focus:started', {
                sessionId: '123',
                duration: 25,
                taskId: 'task-456'
            });

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    taskId: 'task-456',
                })
            );
        });

        it('should handle multiple handlers for same event', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            eventBus.on('task:created', handler1);
            eventBus.on('task:created', handler2);

            eventBus.emit('task:created', {
                task: { id: '1', title: 'Test', status: 'pending' }
            });

            expect(handler1).toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();
        });
    });

    describe('off', () => {
        it('should remove event handler', () => {
            const handler = vi.fn();

            eventBus.on('focus:completed', handler);
            eventBus.off('focus:completed', handler);

            eventBus.emit('focus:completed', {
                sessionId: '123',
                actualDuration: 25,
                quality: 0.9
            });

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('once', () => {
        it('should only fire handler once', () => {
            const handler = vi.fn();

            eventBus.once('achievement:unlocked', handler);

            eventBus.emit('achievement:unlocked', {
                achievement: { id: '1', name: 'First Step', description: 'Start' }
            });
            eventBus.emit('achievement:unlocked', {
                achievement: { id: '2', name: 'Streak', description: 'Keep going' }
            });

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('getHistory', () => {
        it('should track event history', () => {
            eventBus.emit('app:active', undefined);
            eventBus.emit('focus:started', { sessionId: '1', duration: 25 });

            const history = eventBus.getHistory();

            expect(history.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter history by event type', () => {
            eventBus.emit('task:created', {
                task: { id: '1', title: 'Task 1', status: 'pending' }
            });
            eventBus.emit('goal:created', {
                goal: { id: '1', title: 'Goal 1', targetValue: 10, currentValue: 0 }
            });
            eventBus.emit('task:created', {
                task: { id: '2', title: 'Task 2', status: 'pending' }
            });

            const taskHistory = eventBus.getHistory({ event: 'task:created' });

            expect(taskHistory.every(h => h.event === 'task:created')).toBe(true);
        });

        it('should filter history by date', () => {
            const beforeTime = new Date();

            // Emit some events
            eventBus.emit('app:ready', undefined);

            const history = eventBus.getHistory({ since: beforeTime });

            expect(history.every(h => h.timestamp >= beforeTime)).toBe(true);
        });
    });
});
