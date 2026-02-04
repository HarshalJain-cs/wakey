import { useState } from 'react';
import {
    Users, Target, Trophy, TrendingUp, Plus,
    Crown, Medal, Star, Check, ChevronRight
} from 'lucide-react';

interface TeamGoal {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline: string;
    contributors: { id: string; name: string; avatar?: string; contribution: number }[];
    status: 'active' | 'completed' | 'failed';
}

export default function TeamGoalsWidget() {
    const [goals] = useState<TeamGoal[]>([
        {
            id: '1',
            title: 'Weekly Focus Hours',
            description: 'Collective deep work time',
            targetValue: 40,
            currentValue: 32.5,
            unit: 'hours',
            deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
            contributors: [
                { id: '1', name: 'You', contribution: 12.5 },
                { id: '2', name: 'Alex', contribution: 10 },
                { id: '3', name: 'Sam', contribution: 10 },
            ],
            status: 'active'
        },
        {
            id: '2',
            title: 'Tasks Completed',
            description: 'Team productivity sprint',
            targetValue: 50,
            currentValue: 47,
            unit: 'tasks',
            deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
            contributors: [
                { id: '1', name: 'You', contribution: 18 },
                { id: '2', name: 'Alex', contribution: 15 },
                { id: '3', name: 'Sam', contribution: 14 },
            ],
            status: 'active'
        }
    ]);

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const formatDeadline = (dateStr: string) => {
        const date = new Date(dateStr);
        const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days left`;
    };

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Team Goals</h3>
                </div>
                <button className="p-1.5 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors">
                    <Plus className="w-4 h-4 text-dark-300" />
                </button>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {goals.map(goal => {
                    const progress = (goal.currentValue / goal.targetValue) * 100;
                    return (
                        <div
                            key={goal.id}
                            className="p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        {goal.title}
                                        {progress >= 100 && <Check className="w-4 h-4 text-green-400" />}
                                    </h4>
                                    <p className="text-xs text-dark-400">{goal.description}</p>
                                </div>
                                <span className="text-xs text-dark-500">{formatDeadline(goal.deadline)}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-dark-400">
                                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                                    </span>
                                    <span className="text-dark-300 font-medium">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${getProgressColor(progress)}`}
                                        style={{ width: `${Math.min(100, progress)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Contributors */}
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {goal.contributors.slice(0, 3).map((contributor, i) => (
                                        <div
                                            key={contributor.id}
                                            className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-dark-700 flex items-center justify-center text-xs text-white font-medium"
                                            title={`${contributor.name}: ${contributor.contribution} ${goal.unit}`}
                                        >
                                            {contributor.name[0]}
                                        </div>
                                    ))}
                                    {goal.contributors.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-dark-600 border-2 border-dark-700 flex items-center justify-center text-xs text-dark-300">
                                            +{goal.contributors.length - 3}
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-dark-300 transition-colors" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leaderboard preview */}
            <div className="mt-4 pt-3 border-t border-dark-700">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-dark-400 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        Top Contributors
                    </span>
                </div>
                <div className="space-y-1.5">
                    {[
                        { rank: 1, name: 'You', points: 340, icon: Crown },
                        { rank: 2, name: 'Alex', points: 285, icon: Medal },
                        { rank: 3, name: 'Sam', points: 260, icon: Star },
                    ].map(member => (
                        <div
                            key={member.rank}
                            className="flex items-center justify-between p-2 bg-dark-700/30 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <member.icon className={`w-4 h-4 ${member.rank === 1 ? 'text-yellow-400' :
                                        member.rank === 2 ? 'text-gray-400' :
                                            'text-orange-400'
                                    }`} />
                                <span className="text-sm text-dark-200">{member.name}</span>
                            </div>
                            <span className="text-xs text-dark-400">{member.points} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
