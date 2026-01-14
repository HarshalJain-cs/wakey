export declare function categorizeApp(appName: string, windowTitle: string): Promise<string>;
export declare function generateInsights(data: {
    focusHours: number;
    distractionCount: number;
    topApps: string[];
    peakHour: number;
}): Promise<string[]>;
export declare function suggestTaskDescription(title: string): Promise<string>;
export declare function isDistraction(appName: string): boolean;
export declare function queryOllama(prompt: string, model?: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map