import '@testing-library/jest-dom';

// Mock window.wakey API for tests
const mockWakey = {
    getSettings: async () => ({
        darkMode: true,
        notificationsEnabled: true,
        soundEnabled: true,
        dailyFocusGoal: 240,
        onboardingComplete: true,
    }),
    setSetting: async () => { },
    getTrackingStatus: async () => false,
    setTrackingStatus: async (status: boolean) => status,
    getTodayStats: async () => ({
        focusTime: 120,
        productiveTime: 100,
        distractions: 5,
        sessions: 3,
    }),
    getTasks: async () => [],
    saveTasks: async () => { },
    getNotes: async () => [],
    saveNotes: async () => { },
    getFlashcards: async () => [],
    saveFlashcards: async () => { },
    getKnowledgeGraph: async () => ({ nodes: [], edges: [] }),
    saveKnowledgeGraph: async () => { },
    getAgentTasks: async () => [],
    saveAgentTasks: async () => { },
    onTrackingToggle: () => { },
    onFocusStart: () => { },
    onNavigate: () => { },
    removeAllListeners: () => { },
};

// Assign mock to global window
Object.defineProperty(window, 'wakey', {
    value: mockWakey,
    writable: true,
});

// Mock Notification API
class MockNotification {
    static permission = 'granted' as NotificationPermission;
    static requestPermission = async () => 'granted' as NotificationPermission;

    constructor(public title: string, public options?: NotificationOptions) { }
    onclick: (() => void) | null = null;
    close = () => { };
}

Object.defineProperty(window, 'Notification', {
    value: MockNotification,
    writable: true,
});

// Suppress console errors in tests
const originalError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
        return;
    }
    originalError.call(console, ...args);
};
