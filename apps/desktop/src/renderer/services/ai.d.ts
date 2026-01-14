export declare function setGroqApiKey(key: string): void;
export declare function generateProductivityInsights(data: {
    focusMinutes: number;
    distractionCount: number;
    topApps: {
        app: string;
        minutes: number;
    }[];
    sessionsCompleted: number;
}): Promise<string[]>;
export declare function categorizeAppWithAI(appName: string, windowTitle: string): Promise<string>;
export declare function suggestTaskDescription(title: string): Promise<string>;
export declare function isDistractionApp(appName: string): boolean;
export declare function isWorkApp(appName: string): boolean;
export declare function calculateFocusScore(data: {
    focusMinutes: number;
    distractionCount: number;
    contextSwitches: number;
    sessionGoalMinutes: number;
}): number;
export declare function generateDailySummary(data: {
    focusMinutes: number;
    distractionCount: number;
    topApps: {
        app: string;
        minutes: number;
    }[];
    tasksCompleted: number;
    sessionsCompleted: number;
}): Promise<string>;
//# sourceMappingURL=ai.d.ts.map