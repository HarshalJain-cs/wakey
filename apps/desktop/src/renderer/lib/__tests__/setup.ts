/**
 * Vitest Setup File
 * Global test configuration and setup
 */

import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.wakey API
const mockWakeyAPI = {
    getTodayStats: vi.fn().mockResolvedValue({
        focusTime: 120,
        sessions: 4,
        tasksCompleted: 8,
        productivityScore: 85,
    }),
    startTracking: vi.fn().mockResolvedValue(true),
    stopTracking: vi.fn().mockResolvedValue(true),
    getSettings: vi.fn().mockResolvedValue({}),
    saveSettings: vi.fn().mockResolvedValue(true),
    onActivityUpdate: vi.fn(),
    onDistraction: vi.fn(),
    removeAllListeners: vi.fn(),
};

Object.defineProperty(window, 'wakey', {
    writable: true,
    value: mockWakeyAPI,
});

// Reset mocks between tests
beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

// Console error filtering for expected React errors
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
    // Filter out known React testing library warnings
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render') ||
            args[0].includes('inside a test was not wrapped in act'))
    ) {
        return;
    }
    originalConsoleError.apply(console, args);
};
