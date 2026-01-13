import { useState, useEffect } from 'react';
import { Target, Check, Flame, TrendingUp } from 'lucide-react';

interface Goal {
    id: number;
    title: string;
    target: number;
    current: number;
    type: 'focus' | 'tasks' | 'sessions';
    period: 'daily' | 'weekly';
}

export default function GoalsWidget() {
    const [goals, setGoals] = useState<Goal[]>([
        { id: 1, title: 'Focus Time', target: 240, current: 0, type: 'focus', period: 'daily' },
        { id: 2, title: 'Complete Tasks', target: 5, current: 0, type: 'tasks', period: 'daily' },
        { id: 3, title: 'Focus Sessions', target: 4, current: 0, type: 'sessions', period: 'daily' },
    ]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const stats = await window.wakey.getTodayStats();
            const tasks = await window.wakey.getTasks() as { status: string }[];
            const completedTasks = tasks.filter(t => t.status === 'done').length;

            setGoals(prev => prev.map(goal => {
                switch (goal.type) {
                    case 'focus':
                        return { ...goal, current: stats.focusTime };
                    case 'tasks':
                        return { ...goal, current: completedTasks };
                    case 'sessions':
                        return { ...goal, current: stats.sessions };
                    default:
                        return goal;
                }
            }));

            // Simulate streak (in real app, would calculate from historical data)
            const allGoalsMet = stats.focusTime >= 60;
            setStreak(allGoalsMet ? 3 : 0);
        } catch (error) {
            console.error('Failed to load goals:', error);
        }
    };

    const getProgress = (goal: Goal) => {
        return Math.min(100, (goal.current / goal.target) * 100);
    };

    const formatValue = (goal: Goal) => {
        if (goal.type === 'focus') {
            const h = Math.floor(goal.current / 60);
            const m = goal.current % 60;
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        }
        return goal.current.toString();
    };

    const formatTarget = (goal: Goal) => {
        if (goal.type === 'focus') {
            const h = Math.floor(goal.target / 60);
            const m = goal.target % 60;
            return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
        }
        return goal.target.toString();
    };

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title">
                    <Target className="w-4 h-4 text-primary-400" />
                    Daily Goals
                </span>
                {streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full text-xs font-medium">
                        <Flame className="w-3 h-3" />
                        {streak} day streak
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {goals.map((goal) => {
                    const progress = getProgress(goal);
                    const isComplete = progress >= 100;

                    return (
                        <div key={goal.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-300">{goal.title}</span>
                                <span className={`text-sm font-medium ${isComplete ? 'text-green-400' : 'text-white'}`}>
                                    {formatValue(goal)} / {formatTarget(goal)}
                                    {isComplete && <Check className="w-4 h-4 inline ml-1" />}
                                </span>
                            </div>
                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-primary-500'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">
                        {goals.filter(g => getProgress(g) >= 100).length}/{goals.length} complete
                    </span>
                </div>
            </div>
        </div>
    );
}
