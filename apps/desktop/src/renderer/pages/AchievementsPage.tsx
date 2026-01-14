import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Clock, Zap, Crown, Lock } from 'lucide-react';
import * as achievementsService from '../services/achievements-service';
import type { Achievement, AchievementProgress } from '../services/achievements-service';

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [progress, setProgress] = useState<AchievementProgress | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stats, setStats] = useState<ReturnType<typeof achievementsService.getStats> | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await achievementsService.initialize();
        setAchievements(achievementsService.getAllAchievements());
        setProgress(achievementsService.getProgress());
        setStats(achievementsService.getStats());
    };

    const categories = [
        { id: 'all', name: 'All', icon: Trophy },
        { id: 'focus', name: 'Focus', icon: Target },
        { id: 'streak', name: 'Streaks', icon: Flame },
        { id: 'milestone', name: 'Milestones', icon: Clock },
        { id: 'special', name: 'Special', icon: Star },
    ];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const getProgressPercent = (a: Achievement) =>
        Math.min(100, Math.round((a.progress / a.requirement) * 100));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        Achievements
                    </h1>
                    <p className="text-dark-400">Track your productivity milestones</p>
                </div>

                {progress && (
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                            {progress.totalUnlocked}/{progress.totalAchievements}
                        </div>
                        <div className="text-sm text-dark-400">Unlocked</div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-dark-400">Current Streak</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.currentStreak} days</div>
                    </div>

                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="text-dark-400">Best Streak</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.longestStreak} days</div>
                    </div>

                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-green-400" />
                            <span className="text-dark-400">Focus Sessions</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
                    </div>

                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-dark-400">Total Focus</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {Math.floor(stats.totalMinutes / 60)}h
                        </div>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-2">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedCategory === cat.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredAchievements.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`relative bg-dark-800 rounded-xl p-4 border transition-all ${achievement.isUnlocked
                            ? 'border-yellow-500/50'
                            : 'border-dark-700 opacity-75'
                            }`}
                    >
                        {/* Lock overlay for locked achievements */}
                        {!achievement.isUnlocked && (
                            <div className="absolute inset-0 bg-dark-900/50 rounded-xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-dark-500" />
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`text-4xl ${achievement.isUnlocked ? '' : 'grayscale'}`}>
                                {achievement.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{achievement.name}</h3>
                                    {achievement.isUnlocked && (
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                    )}
                                </div>
                                <p className="text-sm text-dark-400 mb-3">{achievement.description}</p>

                                {/* Progress bar */}
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${achievement.isUnlocked ? 'bg-yellow-400' : 'bg-primary-500'
                                            }`}
                                        style={{ width: `${getProgressPercent(achievement)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-dark-500">
                                    <span>{achievement.progress} / {achievement.requirement}</span>
                                    <span>{getProgressPercent(achievement)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Unlocked date */}
                        {achievement.isUnlocked && achievement.unlockedAt && (
                            <div className="absolute top-2 right-2 text-xs text-yellow-400/70">
                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Next to unlock */}
            {progress?.nextToUnlock && (
                <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-4 border border-primary-500/30">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl">{progress.nextToUnlock.icon}</div>
                        <div className="flex-1">
                            <div className="text-sm text-primary-400">Next Achievement</div>
                            <div className="font-semibold text-white">{progress.nextToUnlock.name}</div>
                            <div className="text-sm text-dark-400">{progress.nextToUnlock.description}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {getProgressPercent(progress.nextToUnlock)}%
                            </div>
                            <div className="text-sm text-dark-400">Complete</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
