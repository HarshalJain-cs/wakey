import { useState, useEffect } from 'react';
import {
    RefreshCw, Plus, Calendar, Clock, ChevronDown,
    Check, Trash2, Edit, Repeat, MoreHorizontal
} from 'lucide-react';

interface RecurringTask {
    id: string;
    title: string;
    description?: string;
    recurrence: {
        type: 'daily' | 'weekly' | 'monthly' | 'custom';
        interval: number;
        daysOfWeek?: number[];
        daysOfMonth?: number[];
        time?: string;
    };
    nextOccurrence: string;
    completedCount: number;
    streakCount: number;
    active: boolean;
}

const RECURRENCE_OPTIONS = [
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'weekly', label: 'Weekly', icon: '📆' },
    { id: 'monthly', label: 'Monthly', icon: '🗓️' },
    { id: 'weekdays', label: 'Weekdays', icon: '💼' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurringTasksWidget() {
    const [tasks, setTasks] = useState<RecurringTask[]>([
        {
            id: '1',
            title: 'Morning Focus Session',
            description: 'Start the day with 90 minutes of deep work',
            recurrence: { type: 'daily', interval: 1, time: '09:00' },
            nextOccurrence: new Date(Date.now() + 86400000).toISOString(),
            completedCount: 24,
            streakCount: 7,
            active: true
        },
        {
            id: '2',
            title: 'Weekly Review',
            description: 'Review goals and plan next week',
            recurrence: { type: 'weekly', interval: 1, daysOfWeek: [0], time: '18:00' },
            nextOccurrence: new Date(Date.now() + 3 * 86400000).toISOString(),
            completedCount: 12,
            streakCount: 4,
            active: true
        },
        {
            id: '3',
            title: 'Monthly Retrospective',
            description: 'Deep dive into monthly productivity metrics',
            recurrence: { type: 'monthly', interval: 1, daysOfMonth: [1], time: '10:00' },
            nextOccurrence: new Date(Date.now() + 15 * 86400000).toISOString(),
            completedCount: 3,
            streakCount: 3,
            active: true
        }
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        recurrenceType: 'daily',
        time: '09:00'
    });

    const formatNextOccurrence = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.floor(diff / 86400000);

        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 7) return `In ${days} days`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getRecurrenceLabel = (task: RecurringTask) => {
        const { recurrence } = task;
        switch (recurrence.type) {
            case 'daily':
                return recurrence.interval === 1 ? 'Every day' : `Every ${recurrence.interval} days`;
            case 'weekly':
                if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                    return recurrence.daysOfWeek.map(d => DAYS_OF_WEEK[d]).join(', ');
                }
                return recurrence.interval === 1 ? 'Every week' : `Every ${recurrence.interval} weeks`;
            case 'monthly':
                return recurrence.interval === 1 ? 'Every month' : `Every ${recurrence.interval} months`;
            default:
                return 'Custom';
        }
    };

    const completeTask = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                // Calculate next occurrence
                const next = new Date();
                if (t.recurrence.type === 'daily') {
                    next.setDate(next.getDate() + t.recurrence.interval);
                } else if (t.recurrence.type === 'weekly') {
                    next.setDate(next.getDate() + 7 * t.recurrence.interval);
                } else {
                    next.setMonth(next.getMonth() + t.recurrence.interval);
                }
                return {
                    ...t,
                    completedCount: t.completedCount + 1,
                    streakCount: t.streakCount + 1,
                    nextOccurrence: next.toISOString()
                };
            }
            return t;
        }));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const addTask = () => {
        if (!newTask.title.trim()) return;

        const task: RecurringTask = {
            id: Date.now().toString(),
            title: newTask.title,
            recurrence: {
                type: newTask.recurrenceType as 'daily' | 'weekly' | 'monthly',
                interval: 1,
                time: newTask.time
            },
            nextOccurrence: new Date(Date.now() + 86400000).toISOString(),
            completedCount: 0,
            streakCount: 0,
            active: true
        };

        setTasks([task, ...tasks]);
        setNewTask({ title: '', recurrenceType: 'daily', time: '09:00' });
        setShowAddModal(false);
    };

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Recurring Tasks</h3>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                    <Plus className="w-4 h-4 text-dark-300" />
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="mb-4 p-4 bg-dark-700 rounded-lg border border-dark-600">
                    <input
                        type="text"
                        placeholder="Task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full bg-dark-800 text-white px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                    />
                    <div className="flex gap-2 mb-3">
                        {RECURRENCE_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setNewTask({ ...newTask, recurrenceType: opt.id })}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${newTask.recurrenceType === opt.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-800 text-dark-300 hover:bg-dark-600'
                                    }`}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-dark-400" />
                        <input
                            type="time"
                            value={newTask.time}
                            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                            className="bg-dark-800 text-white px-3 py-1.5 rounded-lg focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="px-3 py-1.5 text-dark-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addTask}
                            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            )}

            {/* Task List */}
            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-dark-400">
                        <Repeat className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No recurring tasks yet</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className="p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
                        >
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => completeTask(task.id)}
                                    className="mt-1 w-5 h-5 rounded-full border-2 border-dark-500 hover:border-green-500 hover:bg-green-500/20 transition-colors flex items-center justify-center group/check"
                                >
                                    <Check className="w-3 h-3 text-green-500 opacity-0 group-hover/check:opacity-100 transition-opacity" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white truncate">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-dark-400 truncate">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-dark-500 flex items-center gap-1">
                                            <Repeat className="w-3 h-3" />
                                            {getRecurrenceLabel(task)}
                                        </span>
                                        <span className="text-xs text-dark-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatNextOccurrence(task.nextOccurrence)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="text-orange-400">🔥</span>
                                        <span className="text-dark-300">{task.streakCount}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="p-1 opacity-0 group-hover:opacity-100 text-dark-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {tasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-dark-700 flex justify-between text-xs text-dark-500">
                    <span>{tasks.length} recurring tasks</span>
                    <span>{tasks.reduce((sum, t) => sum + t.completedCount, 0)} completions</span>
                </div>
            )}
        </div>
    );
}
