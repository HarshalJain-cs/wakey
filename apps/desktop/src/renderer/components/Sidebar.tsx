import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Timer,
    CheckSquare,
    FolderKanban,
    BarChart3,
    Settings,
    Play,
    Pause,
    TrendingUp,
    Code,
    Plug,
    Brain,
    BookOpen,
    Bot,
    GraduationCap,
    Globe,
    Cloud,
    Trophy,
    Target,
    Music,
    Keyboard
} from 'lucide-react';

interface SidebarProps {
    isTracking: boolean;
    onTrackingToggle: () => void;
}

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/focus', icon: Timer, label: 'Focus' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/research', icon: Globe, label: 'Research' },
    { path: '/integrations', icon: Plug, label: 'Integrations' },
    { path: '/trader', icon: TrendingUp, label: 'Trader' },
    { path: '/developer', icon: Code, label: 'Developer' },
    { path: '/ai-consensus', icon: Brain, label: 'AI Consensus' },
    { path: '/knowledge', icon: BookOpen, label: 'Knowledge' },
    { path: '/agents', icon: Bot, label: 'Agents' },
    { path: '/flashcards', icon: GraduationCap, label: 'Flashcards' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/cloud-sync', icon: Cloud, label: 'Cloud Sync' },
    { path: '/shortcuts', icon: Keyboard, label: 'Shortcuts' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isTracking, onTrackingToggle }: SidebarProps) {
    const [stats, setStats] = useState({ focusTime: 0, sessions: 0 });
    const [currentActivity, setCurrentActivity] = useState<{ app: string; category: string } | null>(null);

    useEffect(() => {
        if (!window.wakey) return;

        const loadStats = async () => {
            if (!window.wakey) return;
            try {
                const data = await window.wakey.getTodayStats();
                setStats({ focusTime: data.focusTime, sessions: data.sessions });
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        };

        loadStats();
        const interval = setInterval(loadStats, 30000); // Refresh every 30s

        // Listen for activity updates
        window.wakey.onActivityUpdate((activity) => {
            setCurrentActivity({ app: activity.app, category: activity.category });
        });

        return () => {
            clearInterval(interval);
            window.wakey?.removeAllListeners('activity-update');
        };
    }, []);

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    return (
        <aside className="w-64 bg-dark-950 border-r border-dark-800 flex flex-col">
            {/* Tracking status */}
            <div className="p-4 border-b border-dark-800">
                <button
                    onClick={onTrackingToggle}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${isTracking
                        ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                        }`}
                >
                    {isTracking ? (
                        <>
                            <Pause className="w-5 h-5" />
                            <span>Tracking Active</span>
                            <span className="ml-auto w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            <span>Start Tracking</span>
                        </>
                    )}
                </button>

                {/* Current activity */}
                {isTracking && currentActivity && (
                    <div className="mt-3 p-2 bg-dark-800 rounded-lg">
                        <div className="text-xs text-dark-400">Current</div>
                        <div className="text-sm text-white truncate">{currentActivity.app}</div>
                        <div className="text-xs text-primary-400">{currentActivity.category}</div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                                : 'text-dark-400 hover:text-white hover:bg-dark-800'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Quick stats */}
            <div className="p-4 border-t border-dark-800">
                <div className="text-xs text-dark-500 mb-2">Today's Focus</div>
                <div className="text-2xl font-bold text-white">{formatTime(stats.focusTime)}</div>
                <div className="text-xs text-dark-400 mt-1">{stats.sessions} session{stats.sessions !== 1 ? 's' : ''} completed</div>
            </div>
        </aside>
    );
}
