/**
 * Test Utilities & Mock Helpers for Wakey
 * Provides reusable testing utilities, mock factories, and test helpers
 */

import { vi } from 'vitest';

// ============================================
// MOCK FACTORIES
// ============================================

/**
 * Create a mock focus session
 */
export function createMockFocusSession(overrides: Partial<FocusSession> = {}): FocusSession {
    return {
        id: `session-${Date.now()}`,
        type: 'pomodoro',
        plannedDuration: 25,
        actualDuration: 0,
        status: 'active',
        qualityScore: 0,
        distractions: 0,
        startedAt: new Date().toISOString(),
        endedAt: null,
        taskId: null,
        projectId: null,
        ...overrides,
    };
}

/**
 * Create a mock task
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
    return {
        id: `task-${Date.now()}`,
        title: 'Test Task',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: null,
        projectId: null,
        tags: [],
        estimatedMinutes: 30,
        actualMinutes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * Create a mock project
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
    return {
        id: `project-${Date.now()}`,
        name: 'Test Project',
        description: '',
        color: '#3B82F6',
        status: 'active',
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * Create mock daily stats
 */
export function createMockDailyStats(overrides: Partial<DailyStats> = {}): DailyStats {
    return {
        date: new Date().toISOString().split('T')[0],
        focusTime: 120,
        sessions: 4,
        tasksCompleted: 8,
        distractions: 3,
        productivityScore: 85,
        focusQuality: 78,
        ...overrides,
    };
}

/**
 * Create mock achievement
 */
export function createMockAchievement(overrides: Partial<Achievement> = {}): Achievement {
    return {
        id: `achievement-${Date.now()}`,
        title: 'Test Achievement',
        description: 'Achieve something great',
        icon: '🏆',
        tier: 'bronze',
        category: 'focus',
        xpReward: 100,
        unlocked: false,
        unlockedAt: null,
        progress: 0,
        target: 100,
        ...overrides,
    };
}

/**
 * Create mock user profile
 */
export function createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
    return {
        id: `user-${Date.now()}`,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        level: 1,
        xp: 0,
        totalFocusTime: 0,
        joinedAt: new Date().toISOString(),
        settings: {},
        ...overrides,
    };
}

// ============================================
// SERVICE MOCKS
// ============================================

/**
 * Create mock Electron IPC
 */
export function createMockIPC() {
    return {
        invoke: vi.fn(),
        send: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
    };
}

/**
 * Create mock window.wakey API
 */
export function createMockWakeyAPI() {
    return {
        getTodayStats: vi.fn().mockResolvedValue(createMockDailyStats()),
        startTracking: vi.fn().mockResolvedValue(true),
        stopTracking: vi.fn().mockResolvedValue(true),
        getSettings: vi.fn().mockResolvedValue({}),
        saveSettings: vi.fn().mockResolvedValue(true),
        onActivityUpdate: vi.fn(),
        onDistraction: vi.fn(),
        removeAllListeners: vi.fn(),
    };
}

/**
 * Create mock localStorage
 */
export function createMockLocalStorage(): Storage {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() { return Object.keys(store).length; },
    };
}

/**
 * Create mock fetch
 */
export function createMockFetch(response: unknown = {}, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        status: ok ? 200 : 400,
        json: vi.fn().mockResolvedValue(response),
        text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    });
}

// ============================================
// TEST HELPERS
// ============================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
    condition: () => boolean,
    timeout = 5000,
    interval = 100
): Promise<void> {
    const start = Date.now();
    while (!condition()) {
        if (Date.now() - start > timeout) {
            throw new Error('waitFor timeout');
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
}

/**
 * Wait for milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a deferred promise for testing async flows
 */
export function createDeferred<T>() {
    let resolve: (value: T) => void;
    let reject: (error: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Mock timer utilities
 */
export const timerUtils = {
    advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms),
    runAllTimers: () => vi.runAllTimers(),
    useFakeTimers: () => vi.useFakeTimers(),
    useRealTimers: () => vi.useRealTimers(),
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FocusSession {
    id: string;
    type: 'pomodoro' | 'deep-work' | 'custom';
    plannedDuration: number;
    actualDuration: number;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    qualityScore: number;
    distractions: number;
    startedAt: string;
    endedAt: string | null;
    taskId: string | null;
    projectId: string | null;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string | null;
    projectId: string | null;
    tags: string[];
    estimatedMinutes: number;
    actualMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string;
    status: 'active' | 'completed' | 'archived';
    progress: number;
    taskCount: number;
    completedTaskCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface DailyStats {
    date: string;
    focusTime: number;
    sessions: number;
    tasksCompleted: number;
    distractions: number;
    productivityScore: number;
    focusQuality: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    category: string;
    xpReward: number;
    unlocked: boolean;
    unlockedAt: string | null;
    progress: number;
    target: number;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    level: number;
    xp: number;
    totalFocusTime: number;
    joinedAt: string;
    settings: Record<string, unknown>;
}
