import { useState, useEffect } from 'react';
import {
    Plus, FolderKanban, Clock, DollarSign,
    Trash2, Play, Pause, Users
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    description: string;
    color: string;
    hourlyRate: number;
    totalMinutes: number;
    status: 'active' | 'completed' | 'archived';
    client?: string;
    createdAt: string;
}

// Store projects in electron-store via main process
const COLORS = [
    '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#3b82f6', '#ec4899', '#10b981', '#f97316'
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: 1,
            name: 'Wakey Development',
            description: 'Building the AI productivity tracker',
            color: '#14b8a6',
            hourlyRate: 50,
            totalMinutes: 480,
            status: 'active',
            createdAt: new Date().toISOString(),
        },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [activeTimer, setActiveTimer] = useState<number | null>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimer !== null) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const formatTimerTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const calculateEarnings = (project: Project) => {
        return ((project.totalMinutes / 60) * project.hourlyRate).toFixed(2);
    };

    const toggleTimer = (projectId: number) => {
        if (activeTimer === projectId) {
            // Stop timer and add time
            setProjects(prev => prev.map(p =>
                p.id === projectId
                    ? { ...p, totalMinutes: p.totalMinutes + Math.floor(timerSeconds / 60) }
                    : p
            ));
            setActiveTimer(null);
            setTimerSeconds(0);
        } else {
            // Start timer for this project
            setActiveTimer(projectId);
            setTimerSeconds(0);
        }
    };

    const deleteProject = (id: number) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const addProject = (project: Partial<Project>) => {
        const newProject: Project = {
            id: Date.now(),
            name: project.name || 'New Project',
            description: project.description || '',
            color: project.color || COLORS[Math.floor(Math.random() * COLORS.length)],
            hourlyRate: project.hourlyRate || 0,
            totalMinutes: 0,
            status: 'active',
            client: project.client,
            createdAt: new Date().toISOString(),
        };
        setProjects(prev => [...prev, newProject]);
        setShowModal(false);
    };

    const activeProjects = projects.filter(p => p.status === 'active');
    const totalEarnings = projects.reduce((sum, p) => sum + (p.totalMinutes / 60) * p.hourlyRate, 0);
    const totalHours = projects.reduce((sum, p) => sum + p.totalMinutes, 0) / 60;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-dark-400">Track time and earnings by project</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <FolderKanban className="w-5 h-5 text-primary-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Active Projects</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{activeProjects.length}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Total Hours</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Total Earnings</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Clients</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {new Set(projects.filter(p => p.client).map(p => p.client)).size}
                    </div>
                </div>
            </div>

            {/* Active Timer */}
            {activeTimer !== null && (
                <div className="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse" />
                        <span className="text-white font-medium">
                            Tracking: {projects.find(p => p.id === activeTimer)?.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono text-white">{formatTimerTime(timerSeconds)}</span>
                        <button
                            onClick={() => toggleTimer(activeTimer)}
                            className="btn-primary"
                        >
                            <Pause className="w-5 h-5" />
                            Stop
                        </button>
                    </div>
                </div>
            )}

            {/* Project List */}
            <div className="space-y-3">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover:border-dark-600 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-4 h-12 rounded-full"
                                style={{ backgroundColor: project.color }}
                            />

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{project.name}</h3>
                                    {project.client && (
                                        <span className="text-xs px-2 py-0.5 bg-dark-700 rounded text-dark-400">
                                            {project.client}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-dark-400 mt-0.5">{project.description}</p>
                            </div>

                            <div className="text-right mr-4">
                                <div className="text-lg font-semibold text-white">{formatTime(project.totalMinutes)}</div>
                                <div className="text-sm text-green-400">${calculateEarnings(project)}</div>
                            </div>

                            <button
                                onClick={() => toggleTimer(project.id)}
                                disabled={activeTimer !== null && activeTimer !== project.id}
                                className={`p-3 rounded-lg transition-all ${activeTimer === project.id
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 disabled:opacity-50'
                                    }`}
                            >
                                {activeTimer === project.id ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                            </button>

                            <button
                                onClick={() => deleteProject(project.id)}
                                className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12">
                        <FolderKanban className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                        <p className="text-dark-400">No projects yet</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-primary-400 hover:underline"
                        >
                            Create your first project
                        </button>
                    </div>
                )}
            </div>

            {/* Add Project Modal */}
            {showModal && (
                <ProjectModal
                    onClose={() => setShowModal(false)}
                    onSave={addProject}
                />
            )}
        </div>
    );
}

// Project Modal Component
function ProjectModal({
    onClose,
    onSave
}: {
    onClose: () => void;
    onSave: (project: Partial<Project>) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [client, setClient] = useState('');
    const [hourlyRate, setHourlyRate] = useState(50);
    const [color, setColor] = useState(COLORS[0]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name, description, client, hourlyRate, color });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scaleIn">
                <h2 className="text-xl font-bold text-white mb-4">New Project</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Project"
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Client (optional)</label>
                        <input
                            type="text"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            placeholder="Client name"
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-1">Hourly Rate ($)</label>
                        <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-dark-400 mb-2">Color</label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary flex-1">
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
}
