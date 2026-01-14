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
export declare function loadAchievements(): Promise<void>;
export declare function recordFocusSession(minutes: number, distractions: number): Promise<Achievement[]>;
export declare function recordResearchSession(): Promise<Achievement[]>;
export declare function recordNoteCreated(): Promise<Achievement[]>;
export declare function getAllAchievements(): Achievement[];
export declare function getUnlockedAchievements(): Achievement[];
export declare function getLockedAchievements(): Achievement[];
export declare function getAchievementsByCategory(category: Achievement['category']): Achievement[];
export declare function getProgress(): AchievementProgress;
export declare function getStats(): {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    zeroDistractionSessions: number;
    researchSessions: number;
    notesCreated: number;
    earlyBirdSessions: number;
    nightOwlSessions: number;
    lastSessionDate: string;
};
export declare function getCurrentStreak(): number;
export declare function getLongestStreak(): number;
export declare function initialize(): Promise<void>;
//# sourceMappingURL=achievements-service.d.ts.map