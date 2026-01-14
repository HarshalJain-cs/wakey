// Productivity Score Service
// Multi-factor algorithm for calculating productivity score

export interface ProductivityScore {
    overall: number; // 0-100
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

// ==========================================
// Constants
// ==========================================

const WEIGHTS = {
    focus: 0.35,
    consistency: 0.25,
    efficiency: 0.25,
    goal: 0.15,
};

// ==========================================
// Score Calculation
// ==========================================

export async function calculateProductivityScore(): Promise<ProductivityScore> {
    try {
        const todayStats = await window.wakey.getTodayStats();
        const settings = await window.wakey.getSettings();

        const dailyGoal = (settings.dailyFocusGoal as number) || 240; // Default 4 hours
        const previousScore = (settings.previousProductivityScore as number) || 50;

        // 1. Focus Score (35%)
        // Based on focus time vs distraction time
        const focusTime = todayStats.focusTime || 0;
        const distractions = todayStats.distractions || 0;
        const focusScore = calculateFocusScore(focusTime, distractions);

        // 2. Consistency Score (25%)
        // Based on regular sessions throughout the day
        const sessions = todayStats.sessions || 0;
        const consistencyScore = calculateConsistencyScore(sessions);

        // 3. Efficiency Score (25%)
        // Based on focus quality and distraction avoidance
        const efficiencyScore = calculateEfficiencyScore(focusTime, distractions);

        // 4. Goal Score (15%)
        // Based on progress toward daily goal
        const goalScore = calculateGoalScore(focusTime, dailyGoal);

        // Calculate overall score
        const overall = Math.round(
            focusScore * WEIGHTS.focus +
            consistencyScore * WEIGHTS.consistency +
            efficiencyScore * WEIGHTS.efficiency +
            goalScore * WEIGHTS.goal
        );

        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (overall > previousScore + 5) trend = 'up';
        else if (overall < previousScore - 5) trend = 'down';

        // Save current score for next comparison
        await window.wakey.setSetting('previousProductivityScore', overall);

        return {
            overall,
            focusScore,
            consistencyScore,
            efficiencyScore,
            goalScore,
            trend,
            previousScore,
        };
    } catch (error) {
        console.error('Failed to calculate productivity score:', error);
        return {
            overall: 50,
            focusScore: 50,
            consistencyScore: 50,
            efficiencyScore: 50,
            goalScore: 50,
            trend: 'stable',
            previousScore: 50,
        };
    }
}

function calculateFocusScore(focusMinutes: number, distractions: number): number {
    // Base score from focus time (max 100 at 4 hours)
    const timeScore = Math.min(100, (focusMinutes / 240) * 100);

    // Penalty for distractions (each distraction reduces by 5 points)
    const penalty = Math.min(50, distractions * 5);

    return Math.max(0, Math.round(timeScore - penalty));
}

function calculateConsistencyScore(sessions: number): number {
    // Optimal is 4-8 sessions per day
    if (sessions >= 4 && sessions <= 8) return 100;
    if (sessions >= 2 && sessions < 4) return 70;
    if (sessions > 8) return 85; // Slightly lower for too many short sessions
    if (sessions === 1) return 40;
    return 0;
}

function calculateEfficiencyScore(focusMinutes: number, distractions: number): number {
    if (focusMinutes === 0) return 0;

    // Distractions per hour of focus
    const distractionsPerHour = (distractions / focusMinutes) * 60;

    if (distractionsPerHour <= 1) return 100;
    if (distractionsPerHour <= 3) return 80;
    if (distractionsPerHour <= 5) return 60;
    if (distractionsPerHour <= 10) return 40;
    return 20;
}

function calculateGoalScore(focusMinutes: number, dailyGoal: number): number {
    const progress = (focusMinutes / dailyGoal) * 100;
    return Math.min(100, Math.round(progress));
}

// ==========================================
// Score Breakdown
// ==========================================

export async function getScoreBreakdown(): Promise<ScoreBreakdown[]> {
    const score = await calculateProductivityScore();

    return [
        {
            name: 'Focus Time',
            score: score.focusScore,
            weight: WEIGHTS.focus * 100,
            description: 'Time spent in focused work',
        },
        {
            name: 'Consistency',
            score: score.consistencyScore,
            weight: WEIGHTS.consistency * 100,
            description: 'Regular sessions throughout the day',
        },
        {
            name: 'Efficiency',
            score: score.efficiencyScore,
            weight: WEIGHTS.efficiency * 100,
            description: 'Focus quality with minimal distractions',
        },
        {
            name: 'Goal Progress',
            score: score.goalScore,
            weight: WEIGHTS.goal * 100,
            description: 'Progress toward your daily goal',
        },
    ];
}

// ==========================================
// Score History
// ==========================================

export async function recordDailyScore(): Promise<void> {
    const score = await calculateProductivityScore();
    const today = new Date().toISOString().split('T')[0];

    try {
        const settings = await window.wakey.getSettings();
        const history = (settings.scoreHistory as { date: string; score: number }[]) || [];

        // Add or update today's score
        const existingIndex = history.findIndex(h => h.date === today);
        if (existingIndex >= 0) {
            history[existingIndex].score = score.overall;
        } else {
            history.push({ date: today, score: score.overall });
        }

        // Keep last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filtered = history.filter(
            h => new Date(h.date) >= thirtyDaysAgo
        );

        await window.wakey.setSetting('scoreHistory', filtered);
    } catch (error) {
        console.error('Failed to record daily score:', error);
    }
}

export async function getScoreHistory(days: number = 7): Promise<{ date: string; score: number }[]> {
    try {
        const settings = await window.wakey.getSettings();
        const history = (settings.scoreHistory as { date: string; score: number }[]) || [];

        return history
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, days);
    } catch (error) {
        console.error('Failed to get score history:', error);
        return [];
    }
}

// ==========================================
// Score Insights
// ==========================================

export function getScoreLabel(score: number): string {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Steady';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Needs Work';
    return 'Just Starting';
}

export function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
}

export function getScoreTip(score: ProductivityScore): string {
    const tips: string[] = [];

    if (score.focusScore < 50) {
        tips.push('Try longer focus sessions to boost your score');
    }
    if (score.consistencyScore < 50) {
        tips.push('Aim for 4-8 focus sessions spread throughout the day');
    }
    if (score.efficiencyScore < 50) {
        tips.push('Reduce distractions by blocking distracting apps');
    }
    if (score.goalScore < 50) {
        tips.push('Work toward completing your daily focus goal');
    }

    if (tips.length === 0) {
        return 'Great work! Keep up the momentum.';
    }

    return tips[0];
}
