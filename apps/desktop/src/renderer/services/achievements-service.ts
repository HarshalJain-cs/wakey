// Achievement System Service
// Gamification with badges, milestones, and progress tracking

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'focus' | 'streak' | 'milestone' | 'special';
    requirement: number;
    progress: number;
    unlockedAt?: string;
    isUnlocked: boolean;
}

export interface AchievementProgress {
    totalUnlocked: number;
    totalAchievements: number;
    recentUnlocks: Achievement[];
    nextToUnlock: Achievement | null;
}

// ==========================================
// Achievement Definitions
// ==========================================

const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
    // Focus achievements
    { id: 'first_focus', name: 'First Steps', description: 'Complete your first focus session', icon: '🎯', category: 'focus', requirement: 1 },
    { id: 'focus_10', name: 'Getting Started', description: 'Complete 10 focus sessions', icon: '🔥', category: 'focus', requirement: 10 },
    { id: 'focus_50', name: 'Focus Apprentice', description: 'Complete 50 focus sessions', icon: '⚡', category: 'focus', requirement: 50 },
    { id: 'focus_100', name: 'Focus Master', description: 'Complete 100 focus sessions', icon: '🏆', category: 'focus', requirement: 100 },
    { id: 'focus_500', name: 'Focus Legend', description: 'Complete 500 focus sessions', icon: '👑', category: 'focus', requirement: 500 },

    // Streak achievements
    { id: 'streak_3', name: 'Warming Up', description: '3-day focus streak', icon: '🔥', category: 'streak', requirement: 3 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day focus streak', icon: '💪', category: 'streak', requirement: 7 },
    { id: 'streak_14', name: 'Two Week Champion', description: '14-day focus streak', icon: '🌟', category: 'streak', requirement: 14 },
    { id: 'streak_30', name: 'Monthly Master', description: '30-day focus streak', icon: '🏅', category: 'streak', requirement: 30 },
    { id: 'streak_100', name: 'Unstoppable', description: '100-day focus streak', icon: '💎', category: 'streak', requirement: 100 },

    // Milestone achievements
    { id: 'hours_10', name: 'Time Investor', description: 'Focus for 10 total hours', icon: '⏱️', category: 'milestone', requirement: 600 },
    { id: 'hours_50', name: 'Time Master', description: 'Focus for 50 total hours', icon: '⏰', category: 'milestone', requirement: 3000 },
    { id: 'hours_100', name: 'Century Club', description: 'Focus for 100 total hours', icon: '💯', category: 'milestone', requirement: 6000 },
    { id: 'hours_500', name: 'Time Lord', description: 'Focus for 500 total hours', icon: '🌌', category: 'milestone', requirement: 30000 },

    // Special achievements
    { id: 'perfect_day', name: 'Perfect Day', description: 'Complete 8+ hours of focus in one day', icon: '✨', category: 'special', requirement: 480 },
    { id: 'early_bird', name: 'Early Bird', description: 'Start focus before 6 AM', icon: '🌅', category: 'special', requirement: 1 },
    { id: 'night_owl', name: 'Night Owl', description: 'Focus session after midnight', icon: '🦉', category: 'special', requirement: 1 },
    { id: 'zero_distractions', name: 'Laser Focus', description: 'Complete 10 sessions with zero distractions', icon: '🎯', category: 'special', requirement: 10 },
    { id: 'researcher', name: 'Knowledge Seeker', description: 'Complete 20 research sessions', icon: '🔬', category: 'special', requirement: 20 },
    { id: 'note_taker', name: 'Prolific Writer', description: 'Create 50 notes', icon: '📝', category: 'special', requirement: 50 },
];

// ==========================================
// State
// ==========================================

let achievements: Achievement[] = [];
let stats = {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    zeroDistractionSessions: 0,
    researchSessions: 0,
    notesCreated: 0,
    earlyBirdSessions: 0,
    nightOwlSessions: 0,
    lastSessionDate: '',
};

// ==========================================
// Core Functions
// ==========================================

export async function loadAchievements(): Promise<void> {
    try {
        const settings = await window.wakey.getSettings();
        const savedAchievements = settings.achievements as Achievement[] | undefined;
        const savedStats = settings.achievementStats as typeof stats | undefined;

        if (savedStats) {
            stats = { ...stats, ...savedStats };
        }

        // Initialize achievements with saved progress
        achievements = ACHIEVEMENTS.map(def => {
            const saved = savedAchievements?.find(a => a.id === def.id);
            return {
                ...def,
                progress: saved?.progress || 0,
                isUnlocked: saved?.isUnlocked || false,
                unlockedAt: saved?.unlockedAt,
            };
        });
    } catch (error) {
        console.error('Failed to load achievements:', error);
        achievements = ACHIEVEMENTS.map(def => ({
            ...def,
            progress: 0,
            isUnlocked: false,
        }));
    }
}

async function saveAchievements(): Promise<void> {
    await window.wakey.setSetting('achievements', achievements);
    await window.wakey.setSetting('achievementStats', stats);
}

// ==========================================
// Progress Tracking
// ==========================================

export async function recordFocusSession(
    minutes: number,
    distractions: number
): Promise<Achievement[]> {
    const newUnlocks: Achievement[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();

    // Update stats
    stats.totalSessions += 1;
    stats.totalMinutes += minutes;

    // Check streak
    if (stats.lastSessionDate !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.lastSessionDate === yesterdayStr) {
            stats.currentStreak += 1;
        } else if (stats.lastSessionDate !== today) {
            stats.currentStreak = 1;
        }

        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        stats.lastSessionDate = today;
    }

    // Special conditions
    if (distractions === 0) {
        stats.zeroDistractionSessions += 1;
    }
    if (hour < 6) {
        stats.earlyBirdSessions += 1;
    }
    if (hour >= 0 && hour < 5) {
        stats.nightOwlSessions += 1;
    }

    // Update achievement progress
    const updates: { id: string; progress: number }[] = [
        { id: 'first_focus', progress: stats.totalSessions },
        { id: 'focus_10', progress: stats.totalSessions },
        { id: 'focus_50', progress: stats.totalSessions },
        { id: 'focus_100', progress: stats.totalSessions },
        { id: 'focus_500', progress: stats.totalSessions },
        { id: 'streak_3', progress: stats.currentStreak },
        { id: 'streak_7', progress: stats.currentStreak },
        { id: 'streak_14', progress: stats.currentStreak },
        { id: 'streak_30', progress: stats.currentStreak },
        { id: 'streak_100', progress: stats.currentStreak },
        { id: 'hours_10', progress: stats.totalMinutes },
        { id: 'hours_50', progress: stats.totalMinutes },
        { id: 'hours_100', progress: stats.totalMinutes },
        { id: 'hours_500', progress: stats.totalMinutes },
        { id: 'zero_distractions', progress: stats.zeroDistractionSessions },
        { id: 'early_bird', progress: stats.earlyBirdSessions },
        { id: 'night_owl', progress: stats.nightOwlSessions },
    ];

    for (const update of updates) {
        const achievement = achievements.find(a => a.id === update.id);
        if (achievement && !achievement.isUnlocked) {
            achievement.progress = update.progress;
            if (achievement.progress >= achievement.requirement) {
                achievement.isUnlocked = true;
                achievement.unlockedAt = now.toISOString();
                newUnlocks.push(achievement);
            }
        }
    }

    await saveAchievements();
    return newUnlocks;
}

export async function recordResearchSession(): Promise<Achievement[]> {
    stats.researchSessions += 1;

    const achievement = achievements.find(a => a.id === 'researcher');
    const newUnlocks: Achievement[] = [];

    if (achievement && !achievement.isUnlocked) {
        achievement.progress = stats.researchSessions;
        if (achievement.progress >= achievement.requirement) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = new Date().toISOString();
            newUnlocks.push(achievement);
        }
    }

    await saveAchievements();
    return newUnlocks;
}

export async function recordNoteCreated(): Promise<Achievement[]> {
    stats.notesCreated += 1;

    const achievement = achievements.find(a => a.id === 'note_taker');
    const newUnlocks: Achievement[] = [];

    if (achievement && !achievement.isUnlocked) {
        achievement.progress = stats.notesCreated;
        if (achievement.progress >= achievement.requirement) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = new Date().toISOString();
            newUnlocks.push(achievement);
        }
    }

    await saveAchievements();
    return newUnlocks;
}

// ==========================================
// Public API
// ==========================================

export function getAllAchievements(): Achievement[] {
    return [...achievements];
}

export function getUnlockedAchievements(): Achievement[] {
    return achievements.filter(a => a.isUnlocked);
}

export function getLockedAchievements(): Achievement[] {
    return achievements.filter(a => !a.isUnlocked);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return achievements.filter(a => a.category === category);
}

export function getProgress(): AchievementProgress {
    const unlocked = getUnlockedAchievements();
    const locked = getLockedAchievements();

    // Find next closest to unlock
    const nextToUnlock = locked
        .map(a => ({ ...a, remaining: a.requirement - a.progress }))
        .sort((a, b) => (a.progress / a.requirement) - (b.progress / b.requirement))
        .reverse()[0] || null;

    return {
        totalUnlocked: unlocked.length,
        totalAchievements: achievements.length,
        recentUnlocks: unlocked
            .filter(a => a.unlockedAt)
            .sort((a, b) =>
                new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
            )
            .slice(0, 3),
        nextToUnlock,
    };
}

export function getStats() {
    return { ...stats };
}

export function getCurrentStreak(): number {
    return stats.currentStreak;
}

export function getLongestStreak(): number {
    return stats.longestStreak;
}

// ==========================================
// Initialize
// ==========================================

export async function initialize(): Promise<void> {
    await loadAchievements();
}
