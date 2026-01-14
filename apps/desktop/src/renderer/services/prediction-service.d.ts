export interface FocusPrediction {
    hour: number;
    dayOfWeek: number;
    score: number;
    confidence: number;
}
export interface FocusPattern {
    bestHours: number[];
    bestDays: string[];
    averageSessionLength: number;
    peakProductivityTime: string;
    distractionPeakTime: string;
}
export declare function loadHistoricalData(): Promise<void>;
export declare function recordSession(focusMinutes: number, distractions: number, quality: number): Promise<void>;
export declare function getPrediction(day: number, hour: number): FocusPrediction;
export declare function getBestFocusTimes(count?: number): FocusPrediction[];
export declare function getCurrentPrediction(): FocusPrediction;
export declare function getNextBestFocusTime(): {
    hour: number;
    day: string;
    score: number;
} | null;
export declare function analyzeFocusPatterns(): FocusPattern;
export declare function initialize(): Promise<void>;
//# sourceMappingURL=prediction-service.d.ts.map