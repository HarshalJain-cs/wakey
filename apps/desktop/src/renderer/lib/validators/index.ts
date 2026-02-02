// apps/desktop/src/renderer/lib/validators/index.ts

import { z } from 'zod';

// Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  labels: z.array(z.string()).max(20).default([]),
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  estimatedMinutes: z.number().min(0).max(10080).optional(),  // Max 1 week
  recurring: z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
    interval: z.number().min(1).max(365),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    endDate: z.date().optional(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

// Goal Schema
export const GoalSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(50),
  category: z.enum(['productivity', 'health', 'learning', 'career', 'personal', 'custom']),
  deadline: z.date().optional(),
  milestones: z.array(z.object({
    value: z.number(),
    label: z.string(),
    achieved: z.boolean().default(false),
  })).max(20).optional(),
});

export type GoalInput = z.infer<typeof GoalSchema>;

// Focus Session Schema
export const FocusSessionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['pomodoro', 'deep-work', 'flowtime', 'custom']),
  plannedDuration: z.number().min(1).max(480),  // Max 8 hours
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  distractionBlocking: z.enum(['none', 'soft', 'strict']).default('soft'),
  ambientSound: z.string().optional(),
  goals: z.array(z.string()).max(5).optional(),
});

export type FocusSessionInput = z.infer<typeof FocusSessionSchema>;

// Workflow Schema
export const WorkflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  trigger: z.object({
    type: z.enum(['schedule', 'event', 'manual', 'webhook']),
    config: z.record(z.string(), z.unknown()),
  }),
  actions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.string(), z.unknown()),
    onSuccess: z.string().optional(),
    onError: z.string().optional(),
  })).min(1).max(50),
  enabled: z.boolean().default(true),
  variables: z.record(z.string(), z.unknown()).optional(),
});

export type WorkflowInput = z.infer<typeof WorkflowSchema>;

// Integration Settings Schema
export const IntegrationSettingsSchema = z.object({
  enabled: z.boolean(),
  syncInterval: z.number().min(60).max(86400).optional(),  // 1 min to 24 hours
  bidirectional: z.boolean().default(true),
  conflictResolution: z.enum(['local', 'remote', 'newer', 'ask']).default('newer'),
  filters: z.object({
    projects: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
  }).optional(),
});

export type IntegrationSettingsInput = z.infer<typeof IntegrationSettingsSchema>;

// Validator wrapper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.map(String).join('.')}: ${e.message}`);
    throw new ValidationError('Validation failed', errors);
  }

  return result.data;
}

export class ValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
