import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle, Trash2 } from 'lucide-react';
export default function TaskListWidget() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [loading, setLoading] = useState(true);
    const priorityColors = {
        high: 'text-red-400 border-red-400/30',
        medium: 'text-yellow-400 border-yellow-400/30',
        low: 'text-blue-400 border-blue-400/30',
    };
    useEffect(() => {
        loadTasks();
    }, []);
    const loadTasks = async () => {
        try {
            const data = await window.wakey.getTasks();
            setTasks(data);
        }
        catch (error) {
            console.error('Failed to load tasks:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const addTask = async () => {
        if (!newTask.trim())
            return;
        try {
            await window.wakey.createTask(newTask, 'medium');
            setNewTask('');
            setShowInput(false);
            loadTasks();
        }
        catch (error) {
            console.error('Failed to create task:', error);
        }
    };
    const toggleTask = async (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        try {
            await window.wakey.updateTaskStatus(task.id, newStatus);
            loadTasks();
        }
        catch (error) {
            console.error('Failed to update task:', error);
        }
    };
    const removeTask = async (id) => {
        try {
            await window.wakey.deleteTask(id);
            loadTasks();
        }
        catch (error) {
            console.error('Failed to delete task:', error);
        }
    };
    const completedCount = tasks.filter(t => t.status === 'done').length;
    return (<div className="widget-card h-full flex flex-col">
            <div className="widget-card-header">
                <span className="widget-card-title">✅ Tasks</span>
                <button onClick={() => setShowInput(!showInput)} className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors">
                    <Plus className="w-4 h-4"/>
                </button>
            </div>

            {showInput && (<div className="mb-4 flex gap-2">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Add a task..." className="input-field flex-1 text-sm" autoFocus/>
                    <button onClick={addTask} className="btn-primary text-sm px-3">Add</button>
                </div>)}

            <div className="flex-1 overflow-auto space-y-2">
                {loading ? (<div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"/>
                    </div>) : tasks.length === 0 ? (<div className="text-center py-8 text-dark-400">
                        <p className="text-sm">No tasks yet</p>
                        <p className="text-xs mt-1">Click + to add your first task</p>
                    </div>) : (tasks.map((task) => (<div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg bg-dark-900/50 group transition-all ${task.status === 'done' ? 'opacity-50' : ''}`}>
                            <button onClick={() => toggleTask(task)} className="text-dark-400 hover:text-primary-400 transition-colors">
                                {task.status === 'done' ? (<CheckCircle className="w-5 h-5 text-primary-400"/>) : (<Circle className="w-5 h-5"/>)}
                            </button>

                            <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-dark-500' : 'text-white'}`}>
                                {task.title}
                            </span>

                            <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                                {task.priority}
                            </span>

                            <button onClick={() => removeTask(task.id)} className="p-1 opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>)))}
            </div>

            <div className="pt-3 border-t border-dark-700 mt-3">
                <div className="text-xs text-dark-400">
                    {completedCount} of {tasks.length} completed
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=TaskListWidget.js.map