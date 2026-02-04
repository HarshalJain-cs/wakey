// apps/desktop/src/renderer/components/widgets/UserLevelWidget.tsx
// Phase 18: Gamification - User Level & XP Display

import React, { useState, useEffect } from 'react';
import { enhancedGamificationService, type UserLevel, type Achievement } from '../../services/enhanced-gamification-service';
import { Sparkles, Trophy, Zap, Star } from 'lucide-react';

const UserLevelWidget: React.FC = () => {
    const [userLevel, setUserLevel] = useState<UserLevel>(enhancedGamificationService.getUserLevel());
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        const level = enhancedGamificationService.getUserLevel();
        setUserLevel(level);

        const unlocked = enhancedGamificationService.getUnlockedAchievements();
        setRecentAchievements(unlocked.slice(-3).reverse());
    }, []);

    const xpProgress = (userLevel.currentXP / userLevel.requiredXP) * 100;

    const getTierColor = (tier: Achievement['tier']): string => {
        switch (tier) {
            case 'bronze': return 'text-amber-600';
            case 'silver': return 'text-gray-300';
            case 'gold': return 'text-yellow-400';
            case 'platinum': return 'text-cyan-300';
            case 'diamond': return 'text-purple-400';
            default: return 'text-dark-400';
        }
    };

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
            {/* Level Up Animation Overlay */}
            {showLevelUp && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center z-10 animate-pulse">
                    <div className="text-center">
                        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-bounce" />
                        <div className="text-xl font-bold text-white">Level Up!</div>
                        <div className="text-primary-400">Level {userLevel.level}</div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{userLevel.badge}</span>
                    <div>
                        <h3 className="font-semibold text-white">Level {userLevel.level}</h3>
                        <p className="text-xs text-primary-400">{userLevel.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-primary-500/20 rounded-full">
                    <Zap className="w-3 h-3 text-primary-400" />
                    <span className="text-xs font-medium text-primary-400">
                        {userLevel.totalXP.toLocaleString()} XP
                    </span>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
                    <span>Progress to Level {userLevel.level + 1}</span>
                    <span>{userLevel.currentXP} / {userLevel.requiredXP} XP</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                    >
                        <div className="h-full w-full bg-white/20 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Current Perks */}
            <div className="mb-4">
                <div className="text-xs text-dark-400 mb-2">Active Perks</div>
                <div className="flex flex-wrap gap-1">
                    {userLevel.perks.map((perk, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-dark-700 rounded text-xs text-dark-300">
                            <Star className="w-2.5 h-2.5 text-yellow-400" />
                            {perk}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
                <div className="pt-3 border-t border-dark-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-dark-400">Recent Achievements</span>
                    </div>
                    <div className="space-y-2">
                        {recentAchievements.map(achievement => (
                            <div
                                key={achievement.id}
                                className="flex items-center gap-2 p-2 bg-dark-700/50 rounded-lg"
                            >
                                <span className={`text-lg ${getTierColor(achievement.tier)}`}>
                                    {achievement.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-white truncate">
                                        {achievement.name}
                                    </div>
                                    <div className="text-xs text-dark-500 truncate">
                                        +{achievement.xpReward} XP
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {recentAchievements.length === 0 && (
                <div className="pt-3 border-t border-dark-700 text-center">
                    <Trophy className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                    <p className="text-xs text-dark-500">No achievements yet</p>
                    <p className="text-xs text-dark-600">Complete tasks to earn XP!</p>
                </div>
            )}
        </div>
    );
};

export default UserLevelWidget;
