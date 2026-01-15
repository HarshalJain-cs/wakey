import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle, Trash2, Clock, Flag, ChevronDown } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in_progress' | 'done';
    created_at: string;
    completed_at?: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
    const [loading, setLoading] = useState(true);

    const priorityColors = {
        high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        if (!window.wakey) {
            setLoading(false);
            return;
        }
        try {
            const data = await window.wakey.getTasks();
            setTasks(data as Task[]);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.trim() || !window.wakey) return;

        try {
            await window.wakey.createTask(newTask, newPriority);
            setNewTask('');
            setNewPriority('medium');
            loadTasks();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const toggleTask = async (task: Task) => {
        if (!window.wakey) return;
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        try {
            await window.wakey.updateTaskStatus(task.id, newStatus);
            loadTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const removeTask = async (id: number) => {
        if (!window.wakey) return;
        try {
            await window.wakey.deleteTask(id);
            loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'todo') return t.status !== 'done';
        if (filter === 'done') return t.status === 'done';
        return true;
    });

    const completedCount = tasks.filter(t => t.status === 'done').length;
    const todoCount = tasks.filter(t => t.status !== 'done').length;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-dark-400">Manage your to-do list</p>
                </div>

                <div className="flex items-center gap-2">
                    {(['all', 'todo', 'done'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? `All (${tasks.length})` : f === 'todo' ? `To Do (${todoCount})` : `Done (${completedCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Task */}
            <div className="bg-dark-800 rounded-xl p-4 mb-6 border border-dark-700">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="What needs to be done?"
                        className="input-field flex-1"
                    />

                    <div className="relative">
                        <button
                            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${priorityColors[newPriority].bg} ${priorityColors[newPriority].text} ${priorityColors[newPriority].border}`}
                        >
                            <Flag className="w-4 h-4" />
                            {newPriority}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showPriorityDropdown && (
                            <div className="absolute top-full mt-1 right-0 bg-dark-800 border border-dark-700 rounded-lg overflow-hidden shadow-xl z-10">
                                {(['high', 'medium', 'low'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => { setNewPriority(p); setShowPriorityDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-dark-700 ${priorityColors[p].text}`}
                                    >
                                        <Flag className="w-4 h-4" />
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={addTask} className="btn-primary px-6">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-dark-400 text-lg mb-2">
                            {filter === 'done' ? 'No completed tasks yet' : filter === 'todo' ? 'All caught up!' : 'No tasks yet'}
                        </div>
                        <p className="text-dark-500 text-sm">Add a task above to get started</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-dark-800 rounded-xl p-4 border border-dark-700 flex items-center gap-4 group transition-all hover:border-dark-600 ${task.status === 'done' ? 'opacity-60' : ''
                                }`}
                        >
                            <button
                                onClick={() => toggleTask(task)}
                                className="text-dark-400 hover:text-primary-400 transition-colors"
                            >
                                {task.status === 'done' ? (
                                    <CheckCircle className="w-6 h-6 text-primary-400" />
                                ) : (
                                    <Circle className="w-6 h-6" />
                                )}
                            </button>

                            <div className="flex-1">
                                <span className={`text-lg ${task.status === 'done' ? 'line-through text-dark-500' : 'text-white'}`}>
                                    {task.title}
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-xs text-dark-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => removeTask(task.id)}
                                className="p-2 opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {tasks.length > 0 && (
                <div className="mt-6 p-4 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-between">
                    <div className="text-dark-400">
                        {completedCount} of {tasks.length} tasks completed
                    </div>
                    <div className="w-48 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
