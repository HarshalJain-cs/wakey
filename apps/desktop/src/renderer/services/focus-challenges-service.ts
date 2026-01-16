/**
 * @fileoverview Focus Challenges Service
 * 
 * Weekly gamification challenges with local achievements:
 * - Deep Focus Week
 * - No Distraction Day
 * - Early Bird Week
 * - Break Master
 */

export interface Challenge {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'daily' | 'weekly' | 'custom';
    goal: number;
    unit: string;
    progress: number;
    startDate: Date;
    endDate: Date;
    completed: boolean;
    reward: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date | null;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Available challenges
const CHALLENGE_TEMPLATES: Omit<Challenge, 'startDate' | 'endDate' | 'progress' | 'completed'>[] = [
    {
        id: 'deep-focus-week',
        name: 'Deep Focus Week',
        description: 'Complete 10 deep work sessions (60+ min) this week',
        icon: '🧠',
        type: 'weekly',
        goal: 10,
        unit: 'sessions',
        reward: '🏆 Deep Focus Master Badge',
    },
    {
        id: 'no-distraction-day',
        name: 'Distraction Free Day',
        description: 'Keep distractions under 30 minutes today',
        icon: '🚫',
        type: 'daily',
        goal: 30,
        unit: 'max minutes',
        reward: '🎖️ Focus Champion Badge',
    },
    {
        id: 'early-bird',
        name: 'Early Bird Week',
        description: 'Start work before 9 AM for 5 days',
        icon: '🌅',
        type: 'weekly',
        goal: 5,
        unit: 'days',
        reward: '🌟 Early Riser Badge',
    },
    {
        id: 'break-master',
        name: 'Break Master',
        description: 'Take at least 4 breaks every day for a week',
        icon: '☕',
        type: 'weekly',
        goal: 7,
        unit: 'days',
        reward: '💪 Wellness Champion Badge',
    },
    {
        id: 'streak-builder',
        name: 'Streak Builder',
        description: 'Maintain a 7-day focus goal streak',
        icon: '🔥',
        type: 'weekly',
        goal: 7,
        unit: 'days',
        reward: '🔥 Streak Master Badge',
    },
    {
        id: 'pomodoro-pro',
        name: 'Pomodoro Pro',
        description: 'Complete 20 Pomodoro sessions this week',
        icon: '🍅',
        type: 'weekly',
        goal: 20,
        unit: 'sessions',
        reward: '🍅 Pomodoro Master Badge',
    },
];

// Achievements
const ACHIEVEMENTS: Achievement[] = [
    { id: 'first-focus', name: 'First Focus', description: 'Complete your first focus session', icon: '🎯', tier: 'bronze', unlockedAt: null },
    { id: 'first-deep-work', name: 'Deep Dive', description: 'Complete your first 60+ min deep work session', icon: '🧠', tier: 'bronze', unlockedAt: null },
    { id: 'week-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', tier: 'silver', unlockedAt: null },
    { id: 'month-streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💎', tier: 'gold', unlockedAt: null },
    { id: 'challenge-champ', name: 'Challenge Champion', description: 'Complete 10 challenges', icon: '🏆', tier: 'silver', unlockedAt: null },
    { id: '100-hours', name: 'Century Club', description: 'Accumulate 100 hours of focus time', icon: '💯', tier: 'gold', unlockedAt: null },
    { id: 'early-bird-master', name: 'Early Bird Master', description: 'Start before 9am for 30 days', icon: '🌅', tier: 'gold', unlockedAt: null },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Hit 100% focus score for a full day', icon: '⭐', tier: 'platinum', unlockedAt: null },
];

class FocusChallengesService {
    private activeChallenges: Challenge[] = [];
    private completedChallenges: Challenge[] = [];
    private achievements: Achievement[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_challenges');
            if (stored) {
                const data = JSON.parse(stored);
                this.activeChallenges = data.activeChallenges || [];
                this.completedChallenges = data.completedChallenges || [];
                this.achievements = data.achievements || ACHIEVEMENTS;
            } else {
                this.achievements = ACHIEVEMENTS;
            }
        } catch (error) {
            console.error('Failed to load challenges:', error);
            this.achievements = ACHIEVEMENTS;
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_challenges', JSON.stringify({
            activeChallenges: this.activeChallenges,
            completedChallenges: this.completedChallenges.slice(-50),
            achievements: this.achievements,
        }));
    }

    /**
     * Get available challenge templates
     */
    getChallengeTemplates(): typeof CHALLENGE_TEMPLATES {
        return CHALLENGE_TEMPLATES;
    }

    /**
     * Start a new challenge
     */
    startChallenge(templateId: string): Challenge | null {
        const template = CHALLENGE_TEMPLATES.find(t => t.id === templateId);
        if (!template) return null;

        // Check if already active
        if (this.activeChallenges.find(c => c.id === templateId)) {
            return null;
        }

        const now = new Date();
        const endDate = new Date(now);

        if (template.type === 'daily') {
            endDate.setHours(23, 59, 59, 999);
        } else {
            endDate.setDate(endDate.getDate() + 7);
        }

        const challenge: Challenge = {
            ...template,
            startDate: now,
            endDate,
            progress: 0,
            completed: false,
        };

        this.activeChallenges.push(challenge);
        this.saveToStorage();
        return challenge;
    }

    /**
     * Update challenge progress
     */
    updateProgress(challengeId: string, progress: number): void {
        const challenge = this.activeChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        challenge.progress = progress;

        // Check if completed
        if (progress >= challenge.goal && !challenge.completed) {
            challenge.completed = true;
            this.completedChallenges.push(challenge);

            // Check for achievements
            this.checkAchievements();
        }

        this.saveToStorage();
    }

    /**
     * Get active challenges
     */
    getActiveChallenges(): Challenge[] {
        // Clean up expired challenges
        const now = new Date();
        this.activeChallenges = this.activeChallenges.filter(c => {
            if (new Date(c.endDate) < now && !c.completed) {
                return false;
            }
            return true;
        });

        return this.activeChallenges;
    }

    /**
     * Get completed challenges
     */
    getCompletedChallenges(): Challenge[] {
        return this.completedChallenges;
    }

    /**
     * Get all achievements
     */
    getAchievements(): Achievement[] {
        return this.achievements;
    }

    /**
     * Get unlocked achievements
     */
    getUnlockedAchievements(): Achievement[] {
        return this.achievements.filter(a => a.unlockedAt !== null);
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId: string): Achievement | null {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlockedAt) return null;

        achievement.unlockedAt = new Date();
        this.saveToStorage();
        return achievement;
    }

    /**
     * Check and unlock achievements based on stats
     */
    private checkAchievements(): void {
        const completedCount = this.completedChallenges.length;

        if (completedCount >= 10) {
            this.unlockAchievement('challenge-champ');
        }
    }

    /**
     * Get challenge stats
     */
    getStats(): {
        activeChallenges: number;
        completedChallenges: number;
        unlockedAchievements: number;
        totalAchievements: number;
    } {
        return {
            activeChallenges: this.activeChallenges.length,
            completedChallenges: this.completedChallenges.length,
            unlockedAchievements: this.achievements.filter(a => a.unlockedAt).length,
            totalAchievements: this.achievements.length,
        };
    }

    /**
     * Get weekly challenges suggestion
     */
    getSuggestedChallenge(): typeof CHALLENGE_TEMPLATES[0] | null {
        const activeIds = this.activeChallenges.map(c => c.id);
        const available = CHALLENGE_TEMPLATES.filter(t => !activeIds.includes(t.id));

        if (available.length === 0) return null;

        return available[Math.floor(Math.random() * available.length)];
    }
}

export const focusChallengesService = new FocusChallengesService();
export default focusChallengesService;
