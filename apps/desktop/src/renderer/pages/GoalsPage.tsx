import { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Settings2, TrendingUp, Clock, Coffee, Ban, BarChart3, Users, UserMinus } from 'lucide-react';
import { goalService, Goal, GoalTemplate, GOAL_TEMPLATES } from '../services/goal-service';

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
    const [customTarget, setCustomTarget] = useState<number>(0);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = () => {
        setGoals(goalService.getAllGoals());
    };

    const handleCreateGoal = () => {
        if (!selectedTemplate) return;
        goalService.createGoal(selectedTemplate.type, customTarget || selectedTemplate.defaultTarget);
        loadGoals();
        setShowTemplates(false);
        setSelectedTemplate(null);
    };

    const handleToggleGoal = (goalId: string) => {
        goalService.toggleGoal(goalId);
        loadGoals();
    };

    const handleDeleteGoal = (goalId: string) => {
        goalService.deleteGoal(goalId);
        loadGoals();
    };

    const getIconForType = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            'minimum-work-hours': <Clock className="w-6 h-6" />,
            'maximize-focus': <Target className="w-6 h-6" />,
            'six-hour-workday': <TrendingUp className="w-6 h-6" />,
            'limit-distractions': <Ban className="w-6 h-6" />,
            'more-breaks': <Coffee className="w-6 h-6" />,
            'maximize-category': <BarChart3 className="w-6 h-6" />,
            'reduce-meetings': <UserMinus className="w-6 h-6" />,
            'increase-meetings': <Users className="w-6 h-6" />,
        };
        return icons[type] || <Target className="w-6 h-6" />;
    };

    const getColorForType = (type: string): string => {
        const template = GOAL_TEMPLATES.find(t => t.type === type);
        return template?.color || '#14b8a6';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Target className="w-7 h-7 text-primary-400" />
                        Daily Goals
                    </h1>
                    <p className="text-dark-400">Set and track your productivity goals</p>
                </div>
                <button
                    onClick={() => setShowTemplates(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Goal
                </button>
            </div>

            {/* Active Goals */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Active Goals</h2>

                {goals.filter(g => g.isActive).length === 0 ? (
                    <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
                        <Target className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                        <p className="text-dark-400 mb-4">No active goals yet</p>
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="text-primary-400 hover:text-primary-300"
                        >
                            Add your first goal →
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {goals.filter(g => g.isActive).map(goal => (
                            <div
                                key={goal.id}
                                className="bg-dark-800 rounded-xl border border-dark-700 p-5 hover:border-dark-600 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="p-3 rounded-xl"
                                            style={{ backgroundColor: `${getColorForType(goal.type)}20` }}
                                        >
                                            <div style={{ color: getColorForType(goal.type) }}>
                                                {getIconForType(goal.type)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
                                            <p className="text-dark-400 text-sm mb-2">{goal.description}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-bold text-white">
                                                    {goal.target} {goal.unit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleGoal(goal.id)}
                                            className="p-2 text-dark-400 hover:text-yellow-400 transition-colors"
                                            title="Pause goal"
                                        >
                                            <Settings2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                                            title="Delete goal"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar placeholder */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-dark-400">Today's Progress</span>
                                        <span className="text-dark-300">0 / {goal.target} {goal.unit}</span>
                                    </div>
                                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: '0%',
                                                backgroundColor: getColorForType(goal.type)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inactive Goals */}
            {goals.filter(g => !g.isActive).length > 0 && (
                <div className="space-y-4 opacity-60">
                    <h2 className="text-lg font-semibold text-dark-400">Paused Goals</h2>
                    <div className="grid gap-3">
                        {goals.filter(g => !g.isActive).map(goal => (
                            <div
                                key={goal.id}
                                className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-dark-700 rounded-lg text-dark-500">
                                        {getIconForType(goal.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-dark-300">{goal.name}</h3>
                                        <p className="text-dark-500 text-sm">{goal.target} {goal.unit}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleGoal(goal.id)}
                                    className="px-3 py-1 text-sm bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600"
                                >
                                    Reactivate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Goal Templates Modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-3xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Choose a Goal Template</h2>
                            <p className="text-dark-400">Select a template and customize your target</p>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <div className="grid grid-cols-2 gap-4">
                                {GOAL_TEMPLATES.map(template => (
                                    <button
                                        key={template.type}
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setCustomTarget(template.defaultTarget);
                                        }}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedTemplate?.type === template.type
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{template.icon}</span>
                                            <h3 className="font-semibold text-white">{template.name}</h3>
                                        </div>
                                        <p className="text-dark-400 text-sm line-clamp-2">{template.description}</p>
                                        <div className="mt-3 text-sm">
                                            <span className="text-dark-300">Default: </span>
                                            <span className="text-white font-medium">{template.defaultTarget} {template.unit}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedTemplate && (
                            <div className="p-6 border-t border-dark-700 bg-dark-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-dark-400 mb-2">
                                            Set your target for {selectedTemplate.name}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={customTarget}
                                                onChange={(e) => setCustomTarget(Number(e.target.value))}
                                                className="input-field w-32"
                                                min="1"
                                            />
                                            <span className="text-dark-400">{selectedTemplate.unit}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowTemplates(false);
                                                setSelectedTemplate(null);
                                            }}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateGoal}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Create Goal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedTemplate && (
                            <div className="p-6 border-t border-dark-700 flex justify-end">
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
