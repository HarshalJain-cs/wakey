import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Zap, Crown, Lock, Gift, Share2, Calendar, Award } from 'lucide-react';
import {
    enhancedAchievementsService,
    Achievement,
    Challenge,
    AchievementShowcase
} from '../services/enhanced-achievements-service';

// Tier colors
const TIER_COLORS = {
    bronze: { bg: 'bg-orange-900/30', border: 'border-orange-600/50', text: 'text-orange-400' },
    silver: { bg: 'bg-gray-400/20', border: 'border-gray-400/50', text: 'text-gray-300' },
    gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
    platinum: { bg: 'bg-cyan-500/20', border: 'border-cyan-400/50', text: 'text-cyan-300' },
    diamond: { bg: 'bg-blue-400/20', border: 'border-blue-300/50', text: 'text-blue-300' },
};

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [showcase, setShowcase] = useState<AchievementShowcase | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTier, setSelectedTier] = useState<string>('all');
    const [showSecrets, setShowSecrets] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setAchievements(enhancedAchievementsService.getAchievements());
        setChallenges(await enhancedAchievementsService.getDailyChallenges());
        setShowcase(await enhancedAchievementsService.getAchievementShowcase());
    };

    const categories = [
        { id: 'all', name: 'All', icon: Trophy },
        { id: 'focus', name: 'Focus', icon: Target },
        { id: 'streaks', name: 'Streaks', icon: Flame },
        { id: 'productivity', name: 'Productivity', icon: Zap },
        { id: 'special', name: 'Special', icon: Star },
    ];

    const tiers = [
        { id: 'all', name: 'All Tiers' },
        { id: 'bronze', name: 'Bronze' },
        { id: 'silver', name: 'Silver' },
        { id: 'gold', name: 'Gold' },
        { id: 'platinum', name: 'Platinum' },
        { id: 'diamond', name: 'Diamond' },
    ];

    const filteredAchievements = achievements.filter(a => {
        if (selectedCategory !== 'all' && a.category.id !== selectedCategory) return false;
        if (selectedTier !== 'all' && a.tier !== selectedTier) return false;
        if (!showSecrets && a.secret && !a.unlockedAt) return false;
        return true;
    });

    const tierInfo = enhancedAchievementsService.getCurrentTier();

    const shareAchievement = async (id: string, platform: 'twitter' | 'linkedin' | 'discord') => {
        await enhancedAchievementsService.shareAchievement(id, platform);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with Tier Progress */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        Achievements
                        <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                            Enhanced
                        </span>
                    </h1>
                    <p className="text-dark-400">Track your productivity milestones and earn rewards</p>
                </div>

                {showcase && (
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <Crown className={`w-6 h-6 ${TIER_COLORS[tierInfo.tier as keyof typeof TIER_COLORS]?.text || 'text-orange-400'}`} />
                            <span className="text-2xl font-bold text-white capitalize">{tierInfo.tier}</span>
                        </div>
                        <div className="text-sm text-dark-400">
                            {showcase.totalPoints} points • {showcase.stats.unlockedAchievements}/{showcase.stats.totalAchievements} unlocked
                        </div>
                        {/* Tier progress bar */}
                        <div className="w-48 h-2 bg-dark-700 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all"
                                style={{ width: `${tierInfo.progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Challenges */}
            <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-4 border border-primary-500/30">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    Daily Challenges
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {challenges.map(challenge => (
                        <div
                            key={challenge.id}
                            className={`p-3 rounded-lg border ${challenge.completed
                                    ? 'bg-green-500/20 border-green-500/30'
                                    : 'bg-dark-800 border-dark-700'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-white">{challenge.name}</span>
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <Star className="w-4 h-4" />
                                    {challenge.reward.points}
                                </div>
                            </div>
                            <p className="text-sm text-dark-400">{challenge.description}</p>
                            {challenge.completed && (
                                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Completed!
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center flex-wrap">
                {/* Category Tabs */}
                <div className="flex gap-2">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${selectedCategory === cat.id
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

                {/* Tier Filter */}
                <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                    {tiers.map(tier => (
                        <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                </select>

                {/* Show Secrets Toggle */}
                <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showSecrets}
                        onChange={(e) => setShowSecrets(e.target.checked)}
                        className="rounded bg-dark-700 border-dark-600"
                    />
                    Show Secret Achievements
                </label>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredAchievements.map(achievement => {
                    const tierColor = TIER_COLORS[achievement.tier] || TIER_COLORS.bronze;
                    return (
                        <div
                            key={achievement.id}
                            className={`relative rounded-xl p-4 border transition-all ${achievement.unlockedAt
                                    ? `${tierColor.bg} ${tierColor.border}`
                                    : 'bg-dark-800 border-dark-700 opacity-75'
                                }`}
                        >
                            {/* Tier badge */}
                            <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full capitalize ${tierColor.bg} ${tierColor.text} ${tierColor.border} border`}>
                                {achievement.tier}
                            </div>

                            {/* Points */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-sm text-yellow-400">
                                <Star className="w-4 h-4" />
                                {achievement.points}
                            </div>

                            {/* Lock overlay */}
                            {!achievement.unlockedAt && (
                                <div className="absolute inset-0 bg-dark-900/50 rounded-xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-dark-500" />
                                </div>
                            )}

                            <div className="flex items-start gap-4 mt-6">
                                <div className={`text-4xl ${achievement.unlockedAt ? '' : 'grayscale'}`}>
                                    {achievement.icon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{achievement.name}</h3>
                                        {achievement.unlockedAt && (
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-dark-400 mb-3">{achievement.description}</p>

                                    {/* Progress bar */}
                                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${achievement.unlockedAt ? 'bg-yellow-400' : 'bg-primary-500'
                                                }`}
                                            style={{ width: `${achievement.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-dark-500">
                                        <span>{achievement.progress}%</span>
                                    </div>

                                    {/* Rewards */}
                                    {achievement.rewards.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {achievement.rewards.map((reward, i) => (
                                                <span key={i} className="text-xs bg-dark-700 px-2 py-1 rounded text-dark-300 flex items-center gap-1">
                                                    <Gift className="w-3 h-3" />
                                                    {reward.value}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Share buttons for unlocked */}
                                    {achievement.unlockedAt && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => shareAchievement(achievement.id, 'twitter')}
                                                className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                            >
                                                <Share2 className="w-3 h-3 inline mr-1" />
                                                Share
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Unlocked date */}
                            {achievement.unlockedAt && (
                                <div className="absolute bottom-2 right-2 text-xs text-dark-500">
                                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Showcase */}
            {showcase && showcase.recentUnlocks.length > 0 && (
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-yellow-400" />
                        Recent Unlocks
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {showcase.recentUnlocks.map(a => (
                            <div key={a.id} className="flex-shrink-0 text-center">
                                <div className="text-3xl mb-1">{a.icon}</div>
                                <div className="text-sm text-white">{a.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
