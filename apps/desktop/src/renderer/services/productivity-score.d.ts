export interface ProductivityScore {
    overall: number;
    focusScore: number;
    consistencyScore: number;
    efficiencyScore: number;
    goalScore: number;
    trend: 'up' | 'down' | 'stable';
    previousScore: number;
}
export interface ScoreBreakdown {
    name: string;
    score: number;
    weight: number;
    description: string;
}
export declare function calculateProductivityScore(): Promise<ProductivityScore>;
export declare function getScoreBreakdown(): Promise<ScoreBreakdown[]>;
export declare function recordDailyScore(): Promise<void>;
export declare function getScoreHistory(days?: number): Promise<{
    date: string;
    score: number;
}[]>;
export declare function getScoreLabel(score: number): string;
export declare function getScoreColor(score: number): string;
export declare function getScoreTip(score: ProductivityScore): string;
//# sourceMappingURL=productivity-score.d.ts.map