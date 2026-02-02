// apps/desktop/src/renderer/lib/__tests__/validators.test.ts

import { describe, it, expect } from 'vitest';
import {
    validate,
    ValidationError,
    TaskSchema,
    GoalSchema,
    FocusSessionSchema
} from '../validators';

describe('TaskSchema', () => {
    it('should validate a valid task', () => {
        const input = {
            title: 'Test Task',
            priority: 'high' as const,
            status: 'pending' as const,
        };

        const result = validate(TaskSchema, input);

        expect(result.title).toBe('Test Task');
        expect(result.priority).toBe('high');
        expect(result.status).toBe('pending');
    });

    it('should apply default values', () => {
        const input = { title: 'Test Task' };

        const result = validate(TaskSchema, input);

        expect(result.priority).toBe('medium');
        expect(result.status).toBe('pending');
        expect(result.labels).toEqual([]);
    });

    it('should throw ValidationError for empty title', () => {
        const input = { title: '' };

        expect(() => validate(TaskSchema, input)).toThrow(ValidationError);
    });

    it('should throw ValidationError for title exceeding max length', () => {
        const input = { title: 'x'.repeat(501) };

        expect(() => validate(TaskSchema, input)).toThrow(ValidationError);
    });

    it('should validate optional fields', () => {
        const input = {
            title: 'Test Task',
            description: 'A test description',
            estimatedMinutes: 60,
        };

        const result = validate(TaskSchema, input);

        expect(result.description).toBe('A test description');
        expect(result.estimatedMinutes).toBe(60);
    });

    it('should validate recurring config', () => {
        const input = {
            title: 'Daily standup',
            recurring: {
                type: 'daily' as const,
                interval: 1,
            },
        };

        const result = validate(TaskSchema, input);

        expect(result.recurring?.type).toBe('daily');
        expect(result.recurring?.interval).toBe(1);
    });
});

describe('GoalSchema', () => {
    it('should validate a valid goal', () => {
        const input = {
            title: 'Read 12 books',
            targetValue: 12,
            unit: 'books',
            category: 'learning' as const,
        };

        const result = validate(GoalSchema, input);

        expect(result.title).toBe('Read 12 books');
        expect(result.targetValue).toBe(12);
        expect(result.currentValue).toBe(0);
    });

    it('should validate milestones', () => {
        const input = {
            title: 'Focus goal',
            targetValue: 100,
            unit: 'hours',
            category: 'productivity' as const,
            milestones: [
                { value: 25, label: '25%' },
                { value: 50, label: 'Halfway' },
            ],
        };

        const result = validate(GoalSchema, input);

        expect(result.milestones?.length).toBe(2);
    });
});

describe('FocusSessionSchema', () => {
    it('should validate a pomodoro session', () => {
        const input = {
            type: 'pomodoro' as const,
            plannedDuration: 25,
        };

        const result = validate(FocusSessionSchema, input);

        expect(result.type).toBe('pomodoro');
        expect(result.plannedDuration).toBe(25);
        expect(result.distractionBlocking).toBe('soft');
    });

    it('should reject duration over 8 hours', () => {
        const input = {
            type: 'deep-work' as const,
            plannedDuration: 500, // > 480 minutes
        };

        expect(() => validate(FocusSessionSchema, input)).toThrow(ValidationError);
    });

    it('should validate deep work session with all options', () => {
        const input = {
            type: 'deep-work' as const,
            plannedDuration: 90,
            distractionBlocking: 'strict' as const,
            ambientSound: 'rain-cafe',
            goals: ['Complete feature', 'Write tests'],
        };

        const result = validate(FocusSessionSchema, input);

        expect(result.distractionBlocking).toBe('strict');
        expect(result.ambientSound).toBe('rain-cafe');
        expect(result.goals?.length).toBe(2);
    });
});

describe('ValidationError', () => {
    it('should include error details', () => {
        try {
            validate(TaskSchema, { title: '' });
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect((error as ValidationError).errors.length).toBeGreaterThan(0);
            expect((error as ValidationError).name).toBe('ValidationError');
        }
    });
});
