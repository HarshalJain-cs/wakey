export declare const APP_CATEGORIES: {
    readonly DEVELOPMENT: "Development";
    readonly COMMUNICATION: "Communication";
    readonly PRODUCTIVITY: "Productivity";
    readonly DESIGN: "Design";
    readonly ENTERTAINMENT: "Entertainment";
    readonly SOCIAL: "Social Media";
    readonly NEWS: "News";
    readonly SHOPPING: "Shopping";
    readonly FINANCE: "Finance";
    readonly EDUCATION: "Education";
    readonly OTHER: "Other";
};
export type AppCategory = typeof APP_CATEGORIES[keyof typeof APP_CATEGORIES];
export declare const DEFAULT_APP_RULES: Record<string, AppCategory>;
export declare const DEFAULT_DISTRACTIONS: string[];
export declare function calculateFocusQuality(params: {
    focusMinutes: number;
    distractionCount: number;
    contextSwitches: number;
    breaksTaken: number;
    breaksRecommended: number;
}): number;
export declare function formatDuration(minutes: number): string;
export declare function formatTime(seconds: number): string;
export declare function isToday(date: Date | string): boolean;
export declare function getStartOfDay(date?: Date): Date;
export declare function getEndOfDay(date?: Date): Date;
//# sourceMappingURL=index.d.ts.map