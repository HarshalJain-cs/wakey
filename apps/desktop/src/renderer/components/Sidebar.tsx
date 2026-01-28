import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
    Keyboard,
    HelpCircle,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

interface SidebarProps {
    isTracking: boolean;
    onTrackingToggle: () => void;
    onSupportClick: () => void;
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

export default function Sidebar({ isTracking, onTrackingToggle, onSupportClick }: SidebarProps) {
    const [stats, setStats] = useState({ focusTime: 0, sessions: 0 });
    const [currentActivity, setCurrentActivity] = useState<{ app: string; category: string } | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const interval = setInterval(loadStats, 30000);

        window.wakey.onActivityUpdate((activity) => {
            setCurrentActivity({ app: activity.app, category: activity.category });
        });

        return () => {
            clearInterval(interval);
            window.wakey?.removeAllListeners('activity-update');
        };
    }, []);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (isPinned) return;
        hoverTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, 300);
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
        if (!isPinned) setIsExpanded(true);
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    return (
        <>
            {/* Invisible hover trigger zone */}
            <div
                className="fixed left-0 top-8 w-5 h-full z-40"
                onMouseEnter={handleMouseEnter}
            />

            <aside
                ref={sidebarRef}
                className={`fixed left-0 top-8 h-[calc(100vh-32px)] bg-dark-950 border-r border-dark-800 
                    flex flex-col z-50 transition-all duration-300 ease-in-out
                    ${isExpanded || isPinned ? 'w-64 translate-x-0 shadow-2xl shadow-primary-500/10' : 'w-64 -translate-x-full'}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Pin Toggle Button */}
                <button
                    onClick={togglePin}
                    className={`absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-800 border border-dark-700 
                        flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 
                        transition-all z-50 ${isExpanded || isPinned ? 'opacity-100' : 'opacity-0'}`}
                    title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                    {isPinned ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {/* Tracking Status */}
                <div className="p-4 border-b border-dark-800">
                    <button
                        onClick={() => {
                            console.log('[Sidebar] Toggle tracking clicked');
                            onTrackingToggle();
                        }}
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

                    {isTracking && currentActivity && (
                        <div className="mt-3 p-2 bg-dark-800 rounded-lg">
                            <div className="text-xs text-dark-400">Current</div>
                            <div className="text-sm text-white truncate">{currentActivity.app}</div>
                            <div className="text-xs text-primary-400">{currentActivity.category}</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            preventScrollReset={true}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}

                    <button
                        onClick={onSupportClick}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-dark-400 hover:text-white hover:bg-dark-800 w-full text-left"
                    >
                        <HelpCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Support</span>
                    </button>
                </nav>

                {/* Quick Stats */}
                <div className="p-4 border-t border-dark-800">
                    <div className="text-xs text-dark-500 mb-2">Today's Focus</div>
                    <div className="text-2xl font-bold text-white">{formatTime(stats.focusTime)}</div>
                    <div className="text-xs text-dark-400 mt-1">{stats.sessions} session{stats.sessions !== 1 ? 's' : ''} completed</div>
                </div>
            </aside>

            {/* Glowing indicator when collapsed */}
            {!isExpanded && !isPinned && (
                <div
                    className="fixed left-0 top-8 w-1 h-[calc(100vh-32px)] bg-gradient-to-b from-primary-500/50 via-primary-500/20 to-transparent z-40 cursor-pointer"
                    onMouseEnter={handleMouseEnter}
                />
            )}
        </>
    );
}
