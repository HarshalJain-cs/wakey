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
    Heart,
    ChevronRight,
    ChevronLeft,
    Menu,
    Zap,
    Users,
    FileCode
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
    { path: '/workflows', icon: Zap, label: 'Workflows' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/research', icon: Globe, label: 'Research' },
    { path: '/integrations', icon: Plug, label: 'Integrations' },
    { path: '/trader', icon: TrendingUp, label: 'Trader' },
    { path: '/developer', icon: Code, label: 'Developer' },
    { path: '/api-docs', icon: FileCode, label: 'API Docs' },
    { path: '/ai-consensus', icon: Brain, label: 'AI Consensus' },
    { path: '/knowledge', icon: BookOpen, label: 'Knowledge' },
    { path: '/agents', icon: Bot, label: 'Agents' },
    { path: '/flashcards', icon: GraduationCap, label: 'Flashcards' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/health', icon: Heart, label: 'Health' },
    { path: '/cloud-sync', icon: Cloud, label: 'Cloud Sync' },
    { path: '/shortcuts', icon: Keyboard, label: 'Shortcuts' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isTracking, onTrackingToggle, onSupportClick }: SidebarProps) {
    const [stats, setStats] = useState({ focusTime: 0, sessions: 0 });
    const [currentActivity, setCurrentActivity] = useState<{ app: string; category: string } | null>(null);

    // Auto-hide sidebar state
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Handle mouse entering trigger zone (left edge)
    const handleTriggerEnter = () => {
        if (isPinned) return;
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setIsExpanded(true);
    };

    // Handle mouse leaving sidebar
    const handleSidebarLeave = () => {
        if (isPinned) return;
        hideTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, 300); // Small delay before hiding
    };

    // Handle mouse entering sidebar (cancel hide)
    const handleSidebarEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Toggle pin state
    const togglePin = () => {
        setIsPinned(!isPinned);
        if (!isPinned) {
            setIsExpanded(true);
        }
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const showSidebar = isExpanded || isPinned;

    return (
        <>
            {/* Invisible Trigger Zone - Always visible on left edge */}
            <div
                ref={triggerRef}
                onMouseEnter={handleTriggerEnter}
                className="fixed left-0 top-0 w-3 h-full z-50 cursor-pointer"
                style={{ background: 'transparent' }}
            >
                {/* Visual indicator when hovering trigger zone */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-primary-500/50 rounded-r transition-opacity duration-200 ${showSidebar ? 'opacity-0' : 'opacity-50 hover:opacity-100'}`} />
            </div>

            {/* Sidebar Overlay Background (for click-away on mobile) */}
            {showSidebar && !isPinned && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Pin/Collapse Toggle - Fixed position, always clickable */}
            {showSidebar && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePin();
                    }}
                    className="fixed left-[252px] top-1/2 -translate-y-1/2 p-2 bg-dark-800 border border-dark-700 rounded-full shadow-xl hover:bg-dark-700 hover:border-primary-500/50 transition-all duration-200 z-50"
                    title={isPinned ? 'Unpin sidebar (auto-hide)' : 'Pin sidebar (always visible)'}
                    style={{ paddingTop: '32px' }}
                >
                    {isPinned ? (
                        <ChevronLeft className="w-4 h-4 text-primary-400" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-dark-300 hover:text-white" />
                    )}
                </button>
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                onMouseEnter={handleSidebarEnter}
                onMouseLeave={handleSidebarLeave}
                className={`fixed left-0 top-0 h-full bg-dark-950/95 backdrop-blur-xl border-r border-dark-800 flex flex-col z-40 transition-all duration-300 ease-out ${showSidebar
                    ? 'w-64 translate-x-0 shadow-2xl shadow-black/50'
                    : 'w-64 -translate-x-full'
                    }`}
                style={{ paddingTop: '32px' }} // Account for title bar
            >
                {/* Tracking status */}
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
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            data-tour={path === '/settings' ? 'settings' : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm">{label}</span>
                        </NavLink>
                    ))}

                    <button
                        onClick={onSupportClick}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-dark-400 hover:text-white hover:bg-dark-800 w-full text-left"
                    >
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">Support</span>
                    </button>
                </nav>

                {/* Quick stats */}
                <div className="p-4 border-t border-dark-800 bg-dark-900/50">
                    <div className="text-xs text-dark-500 mb-2">Today's Focus</div>
                    <div className="text-2xl font-bold text-white">{formatTime(stats.focusTime)}</div>
                    <div className="text-xs text-dark-400 mt-1">{stats.sessions} session{stats.sessions !== 1 ? 's' : ''} completed</div>
                </div>
            </aside>

            {/* Floating Menu Button (visible when sidebar is hidden) */}
            {!showSidebar && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="fixed left-4 top-12 z-30 p-2 bg-dark-800/90 backdrop-blur border border-dark-700 rounded-lg shadow-lg hover:bg-dark-700 transition-all duration-200 opacity-50 hover:opacity-100"
                >
                    <Menu className="w-5 h-5 text-dark-400" />
                </button>
            )}
        </>
    );
}
