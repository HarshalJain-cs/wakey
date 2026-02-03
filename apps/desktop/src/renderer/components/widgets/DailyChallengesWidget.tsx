import { useState, useEffect } from 'react';
import { Target, Trophy, Star, Zap, Clock, CheckCircle2, Flame, Gift } from 'lucide-react';
import { focusChallengesService } from '../../services/focus-challenges-service';

interface Challenge {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    xpReward: number;
    type: 'focus' | 'sessions' | 'streak' | 'tasks' | 'special';
    icon: React.ReactNode;
    expiresIn?: string;
}

// Progress bar with animation
function ChallengeProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
    const progress = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;

    return (
        <div className="relative w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-400' : color
                    }`}
                style={{ width: `${progress}%` }}
            />
            {isComplete && (
                <div className="absolute inset-0 bg-green-400/20 animate-pulse rounded-full" />
            )}
        </div>
    );
}

// Individual challenge card
function ChallengeCard({ challenge, onClaim }: { challenge: Challenge; onClaim: (id: string) => void }) {
    const isComplete = challenge.current >= challenge.target;
    const progress = Math.round((challenge.current / challenge.target) * 100);

    const getColor = () => {
        switch (challenge.type) {
            case 'focus': return 'bg-gradient-to-r from-primary-500/80 to-primary-400/80';
            case 'sessions': return 'bg-gradient-to-r from-purple-500/80 to-purple-400/80';
            case 'streak': return 'bg-gradient-to-r from-orange-500/80 to-orange-400/80';
            case 'tasks': return 'bg-gradient-to-r from-blue-500/80 to-blue-400/80';
            case 'special': return 'bg-gradient-to-r from-yellow-500/80 to-yellow-400/80';
            default: return 'bg-gradient-to-r from-gray-500/80 to-gray-400/80';
        }
    };

    const getBorderColor = () => {
        if (isComplete) return 'border-green-500/50';
        switch (challenge.type) {
            case 'focus': return 'border-primary-500/30';
            case 'sessions': return 'border-purple-500/30';
            case 'streak': return 'border-orange-500/30';
            case 'tasks': return 'border-blue-500/30';
            case 'special': return 'border-yellow-500/30';
            default: return 'border-dark-600';
        }
    };

    return (
        <div className={`relative p-3 rounded-lg border transition-all ${getBorderColor()} ${isComplete
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
            : 'bg-dark-900/50 hover:bg-dark-800/50'
            }`}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                    {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                        <div className="w-5 h-5 text-dark-300">{challenge.icon}</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${isComplete ? 'text-green-400' : 'text-white'
                            }`}>
                            {challenge.title}
                        </h4>
                        <span className="flex items-center gap-1 text-xs text-yellow-400 shrink-0">
                            <Star className="w-3 h-3" />
                            {challenge.xpReward} XP
                        </span>
                    </div>

                    <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">
                        {challenge.description}
                    </p>

                    {/* Progress */}
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-dark-400">
                                {challenge.current}/{challenge.target}
                            </span>
                            <span className={isComplete ? 'text-green-400' : 'text-dark-500'}>
                                {progress}%
                            </span>
                        </div>
                        <ChallengeProgressBar
                            current={challenge.current}
                            target={challenge.target}
                            color={getColor()}
                        />
                    </div>

                    {/* Expires / Claim Button */}
                    {isComplete ? (
                        <button
                            onClick={() => onClaim(challenge.id)}
                            className="mt-2 w-full py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-md hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-1"
                        >
                            <Gift className="w-3 h-3" />
                            Claim Reward
                        </button>
                    ) : challenge.expiresIn && (
                        <div className="mt-2 text-xs text-dark-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires in {challenge.expiresIn}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Map challenge type from service to widget type
function mapChallengeType(type: 'daily' | 'weekly' | 'custom'): Challenge['type'] {
    switch (type) {
        case 'daily': return 'focus';
        case 'weekly': return 'sessions';
        case 'custom': return 'special';
        default: return 'tasks';
    }
}

// Get icon for challenge based on name
function getChallengeIcon(name: string): React.ReactNode {
    if (name.toLowerCase().includes('focus') || name.toLowerCase().includes('deep')) {
        return <Clock className="w-5 h-5" />;
    }
    if (name.toLowerCase().includes('session') || name.toLowerCase().includes('pomodoro')) {
        return <Target className="w-5 h-5" />;
    }
    if (name.toLowerCase().includes('streak')) {
        return <Flame className="w-5 h-5" />;
    }
    return <CheckCircle2 className="w-5 h-5" />;
}

export default function DailyChallengesWidget() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalXP, setTotalXP] = useState(0);

    useEffect(() => {
        const loadChallenges = async () => {
            try {
                // Get real challenges from service
                const activeChallenges = focusChallengesService.getActiveChallenges();
                const stats = focusChallengesService.getStats();

                // Convert service challenges to widget format
                const widgetChallenges: Challenge[] = activeChallenges.map(c => ({
                    id: c.id,
                    title: c.name,
                    description: c.description,
                    target: c.goal,
                    current: c.progress,
                    xpReward: parseInt(c.reward.match(/\d+/)?.[0] || '50'),
                    type: mapChallengeType(c.type),
                    icon: getChallengeIcon(c.name),
                    expiresIn: c.type === 'daily' ? '8h' : c.type === 'weekly' ? '3d' : undefined
                }));

                // If no active challenges, show some defaults
                if (widgetChallenges.length === 0) {
                    widgetChallenges.push(
                        {
                            id: '1',
                            title: 'Focus Champion',
                            description: 'Complete 2 hours of focused work',
                            target: 120,
                            current: 0,
                            xpReward: 100,
                            type: 'focus',
                            icon: <Clock className="w-5 h-5" />,
                            expiresIn: '8h'
                        },
                        {
                            id: '2',
                            title: 'Streak Keeper',
                            description: 'Maintain your daily streak',
                            target: 1,
                            current: 0,
                            xpReward: 50,
                            type: 'streak',
                            icon: <Flame className="w-5 h-5" />
                        }
                    );
                }

                setChallenges(widgetChallenges);
                setTotalXP(stats.completedChallenges * 75 + stats.unlockedAchievements * 100);
            } catch (error) {
                console.error('Failed to load challenges:', error);
                // Fallback to mock data
                setChallenges([
                    {
                        id: '1',
                        title: 'Focus Champion',
                        description: 'Complete 2 hours of focused work',
                        target: 120,
                        current: 45,
                        xpReward: 100,
                        type: 'focus',
                        icon: <Clock className="w-5 h-5" />,
                        expiresIn: '8h'
                    }
                ]);
                setTotalXP(0);
            } finally {
                setLoading(false);
            }
        };

        loadChallenges();
    }, []);

    const handleClaimReward = (challengeId: string) => {
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
            // Add XP and mark as claimed
            setTotalXP(prev => prev + challenge.xpReward);
            setChallenges(prev => prev.filter(c => c.id !== challengeId));

            // Show toast notification (would integrate with toast system)
            console.log(`Claimed ${challenge.xpReward} XP!`);
        }
    };

    const completedCount = challenges.filter(c => c.current >= c.target).length;
    const pendingXP = challenges
        .filter(c => c.current >= c.target)
        .reduce((sum, c) => sum + c.xpReward, 0);

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Daily Challenges
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {totalXP.toLocaleString()} XP
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Summary */}
                    <div className="flex items-center justify-between p-2 bg-dark-900/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-dark-300">
                                {completedCount}/{challenges.length} Completed
                            </span>
                        </div>
                        {pendingXP > 0 && (
                            <span className="text-xs text-yellow-400">
                                +{pendingXP} XP pending
                            </span>
                        )}
                    </div>

                    {/* Challenge Cards */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {challenges.map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onClaim={handleClaimReward}
                            />
                        ))}
                    </div>

                    {/* All Complete State */}
                    {challenges.length === 0 && (
                        <div className="text-center py-6">
                            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold text-white">All Done!</h3>
                            <p className="text-sm text-dark-400">You've completed all challenges today</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
