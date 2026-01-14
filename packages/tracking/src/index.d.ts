export interface ActiveWindow {
    title: string;
    id: number;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    owner: {
        name: string;
        processId: number;
        path: string;
    };
    url?: string;
}
export declare function getActiveWindow(): Promise<ActiveWindow | null>;
export declare function updateLastActivityTime(): void;
export declare function getIdleTime(): number;
export declare function isIdle(thresholdMs?: number): boolean;
export declare function captureScreenshot(savePath: string): Promise<boolean>;
export interface ActivityChange {
    previous: ActiveWindow | null;
    current: ActiveWindow | null;
    isContextSwitch: boolean;
    timestamp: number;
}
export declare function detectActivityChange(): Promise<ActivityChange | null>;
export type ActivityCallback = (activity: ActiveWindow) => void;
export declare function startTracking(callback: ActivityCallback, intervalMs?: number): void;
export declare function stopTracking(): void;
export declare function isCurrentlyTracking(): boolean;
//# sourceMappingURL=index.d.ts.map