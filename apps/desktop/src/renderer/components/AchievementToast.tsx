import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Trophy, Star, Flame, Zap, Target, Award, X, ChevronRight } from 'lucide-react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: Date;
}

interface ToastNotification {
    id: string;
    type: 'achievement' | 'levelup' | 'streak' | 'challenge';
    data: Achievement | LevelUpData | StreakData | ChallengeData;
}

interface LevelUpData {
    newLevel: number;
    totalXP: number;
}

interface StreakData {
    days: number;
    milestone: boolean;
}

interface ChallengeData {
    title: string;
    xpReward: number;
}

// Toast Context
interface ToastContextType {
    showAchievement: (achievement: Achievement) => void;
    showLevelUp: (level: number, xp: number) => void;
    showStreak: (days: number) => void;
    showChallengeComplete: (title: string, xp: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

// Individual Toast Components
function AchievementToast({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
    const rarityColors = {
        common: 'from-gray-500 to-gray-400',
        rare: 'from-blue-500 to-blue-400',
        epic: 'from-purple-500 to-purple-400',
        legendary: 'from-yellow-500 to-amber-400'
    };

    const rarityBorder = {
        common: 'border-gray-500/30',
        rare: 'border-blue-500/30',
        epic: 'border-purple-500/30',
        legendary: 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
    };

    const rarityGlow = {
        common: '',
        rare: '',
        epic: 'animate-pulse',
        legendary: 'animate-pulse'
    };

    return (
        <div className={`relative overflow-hidden rounded-xl border ${rarityBorder[achievement.rarity]} bg-dark-800 backdrop-blur-sm p-4 min-w-[320px] max-w-[400px] shadow-2xl`}>
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${rarityColors[achievement.rarity]} opacity-10`} />

            {/* Legendary shimmer effect */}
            {achievement.rarity === 'legendary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-shimmer" />
            )}

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} ${rarityGlow[achievement.rarity]}`}>
                    <div className="text-white">{achievement.icon}</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase tracking-wider text-dark-400">Achievement Unlocked</span>
                        <Trophy className="w-3 h-3 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white truncate">{achievement.title}</h3>
                    <p className="text-sm text-dark-400 line-clamp-2">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3" />
                            +{achievement.xpReward} XP
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-400'
                            }`}>
                            {achievement.rarity}
                        </span>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function LevelUpToast({ data, onClose }: { data: LevelUpData; onClose: () => void }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-primary-500/50 bg-dark-800 backdrop-blur-sm p-4 min-w-[320px] shadow-2xl shadow-primary-500/20">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)]" />

            <div className="relative flex items-center gap-4">
                {/* Level Badge */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center animate-pulse">
                        <span className="text-2xl font-bold text-white">{data.newLevel}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        NEW
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm uppercase tracking-wider text-primary-400 font-semibold">Level Up!</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">You reached Level {data.newLevel}!</h3>
                    <p className="text-sm text-dark-400">Total XP: {data.totalXP.toLocaleString()}</p>
                </div>

                <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg text-dark-400">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function StreakToast({ data, onClose }: { data: StreakData; onClose: () => void }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-orange-500/50 bg-dark-800 backdrop-blur-sm p-4 min-w-[300px] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />

            <div className="relative flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 animate-bounce">
                    <Flame className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-orange-400">{data.days} Day Streak!</span>
                        {data.milestone && <span className="text-xl">🔥</span>}
                    </div>
                    <p className="text-sm text-dark-400">
                        {data.milestone ? "Amazing milestone reached!" : "Keep it going!"}
                    </p>
                </div>

                <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg text-dark-400">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function ChallengeToast({ data, onClose }: { data: ChallengeData; onClose: () => void }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-green-500/50 bg-dark-800 backdrop-blur-sm p-4 min-w-[300px] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />

            <div className="relative flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Target className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-green-400 mb-0.5">Challenge Complete</div>
                    <h3 className="text-lg font-bold text-white">{data.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3" />
                        +{data.xpReward} XP
                    </span>
                </div>

                <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg text-dark-400">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Auto-remove toasts after 5 seconds
    useEffect(() => {
        if (toasts.length === 0) return;

        const timer = setTimeout(() => {
            setToasts(prev => prev.slice(1));
        }, 5000);

        return () => clearTimeout(timer);
    }, [toasts]);

    const showAchievement = useCallback((achievement: Achievement) => {
        setToasts(prev => [...prev, {
            id: `achievement-${Date.now()}`,
            type: 'achievement',
            data: achievement
        }]);
    }, []);

    const showLevelUp = useCallback((level: number, xp: number) => {
        setToasts(prev => [...prev, {
            id: `levelup-${Date.now()}`,
            type: 'levelup',
            data: { newLevel: level, totalXP: xp }
        }]);
    }, []);

    const showStreak = useCallback((days: number) => {
        setToasts(prev => [...prev, {
            id: `streak-${Date.now()}`,
            type: 'streak',
            data: { days, milestone: days % 7 === 0 }
        }]);
    }, []);

    const showChallengeComplete = useCallback((title: string, xp: number) => {
        setToasts(prev => [...prev, {
            id: `challenge-${Date.now()}`,
            type: 'challenge',
            data: { title, xpReward: xp }
        }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showAchievement, showLevelUp, showStreak, showChallengeComplete }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        className="animate-slide-in-right"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            transform: `translateY(${index * 8}px)`
                        }}
                    >
                        {toast.type === 'achievement' && (
                            <AchievementToast
                                achievement={toast.data as Achievement}
                                onClose={() => removeToast(toast.id)}
                            />
                        )}
                        {toast.type === 'levelup' && (
                            <LevelUpToast
                                data={toast.data as LevelUpData}
                                onClose={() => removeToast(toast.id)}
                            />
                        )}
                        {toast.type === 'streak' && (
                            <StreakToast
                                data={toast.data as StreakData}
                                onClose={() => removeToast(toast.id)}
                            />
                        )}
                        {toast.type === 'challenge' && (
                            <ChallengeToast
                                data={toast.data as ChallengeData}
                                onClose={() => removeToast(toast.id)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Export achievement icon helpers
export const AchievementIcons = {
    focus: <Target className="w-6 h-6" />,
    streak: <Flame className="w-6 h-6" />,
    level: <Zap className="w-6 h-6" />,
    trophy: <Trophy className="w-6 h-6" />,
    star: <Star className="w-6 h-6" />,
    award: <Award className="w-6 h-6" />
};

export type { Achievement, ToastContextType };
