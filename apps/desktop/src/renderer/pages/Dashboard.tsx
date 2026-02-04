import { useState, useEffect, useCallback } from 'react';
import { Settings, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import FocusTimerWidget from '../components/widgets/FocusTimerWidget';
import TodayStatsWidget from '../components/widgets/TodayStatsWidget';
import FocusQualityWidget from '../components/widgets/FocusQualityWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import TaskListWidget from '../components/widgets/TaskListWidget';
import AIInsightsWidget from '../components/widgets/AIInsightsWidget';
import GoalsWidget from '../components/widgets/GoalsWidget';
import AdvancedAnalyticsWidget from '../components/widgets/AdvancedAnalyticsWidget';
import WeeklyTrendsWidget from '../components/widgets/WeeklyTrendsWidget';
import DailyChallengesWidget from '../components/widgets/DailyChallengesWidget';
import BurnoutRiskWidget from '../components/widgets/BurnoutRiskWidget';
import EyeStrainTimer from '../components/widgets/EyeStrainTimer';
import LeaderboardWidget from '../components/widgets/LeaderboardWidget';
import PerformanceMonitorWidget from '../components/widgets/PerformanceMonitorWidget';
import AmbientSoundsWidget from '../components/widgets/AmbientSoundsWidget';
import TaskTreeWidget from '../components/widgets/TaskTreeWidget';
import WearablesHealthWidget from '../components/widgets/WearablesHealthWidget';
import UserLevelWidget from '../components/widgets/UserLevelWidget';
import RecurringTasksWidget from '../components/widgets/RecurringTasksWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import VoiceCommandWidget from '../components/widgets/VoiceCommandWidget';
import AIReportWidget from '../components/widgets/AIReportWidget';
import SleepInsightsWidget from '../components/widgets/SleepInsightsWidget';
import QuickStatsBar from '../components/QuickStatsBar';
import FirstTimeUserTips from '../components/FirstTimeUserTips';

interface DashboardProps {
    isTracking: boolean;
}

interface WidgetConfig {
    id: string;
    name: string;
    visible: boolean;
    order: number;
    colSpan: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
    // Row 1: Core Focus (3 widgets)
    { id: 'timer', name: 'Focus Timer', visible: true, order: 0, colSpan: 1 },
    { id: 'stats', name: 'Today Stats', visible: true, order: 1, colSpan: 1 },
    { id: 'quality', name: 'Focus Quality', visible: true, order: 2, colSpan: 1 },

    // Row 2: Trends + Analytics
    { id: 'trends', name: 'Weekly Trends', visible: true, order: 3, colSpan: 1 },
    { id: 'analytics', name: 'Advanced Analytics', visible: true, order: 4, colSpan: 2 },

    // Row 3: Tasks (3 widgets)
    { id: 'tasks', name: 'Task List', visible: true, order: 5, colSpan: 1 },
    { id: 'tasktree', name: 'Task Tree', visible: true, order: 6, colSpan: 1 },
    { id: 'goals', name: 'Goals', visible: true, order: 7, colSpan: 1 },

    // Row 4: Health + Wellness
    { id: 'wearables', name: 'Health & Wearables', visible: true, order: 8, colSpan: 1 },
    { id: 'eyestrain', name: 'Eye Strain Timer', visible: true, order: 9, colSpan: 1 },
    { id: 'burnout', name: 'Wellness Check', visible: true, order: 10, colSpan: 1 },

    // Row 5: Ambient + Challenges + Leaderboard
    { id: 'ambient', name: 'Ambient Sounds', visible: true, order: 11, colSpan: 1 },
    { id: 'challenges', name: 'Daily Challenges', visible: true, order: 12, colSpan: 1 },
    { id: 'leaderboard', name: 'Leaderboard', visible: true, order: 13, colSpan: 1 },

    // Row 6: AI Insights + Calendar
    { id: 'ai', name: 'AI Insights', visible: true, order: 14, colSpan: 1 },
    { id: 'calendar', name: 'Calendar', visible: true, order: 15, colSpan: 2 },

    // Row 7: Performance & Level (moved to end)
    { id: 'performance', name: 'Performance', visible: true, order: 16, colSpan: 1 },
    { id: 'userlevel', name: 'Level & XP', visible: true, order: 17, colSpan: 1 },
    { id: 'recurring', name: 'Recurring Tasks', visible: true, order: 18, colSpan: 1 },

    // Row 8: New Phase W-AF Widgets
    { id: 'quickactions', name: 'Quick Actions', visible: true, order: 19, colSpan: 1 },
    { id: 'voice', name: 'Voice Commands', visible: true, order: 20, colSpan: 1 },
    { id: 'aireport', name: 'AI Weekly Report', visible: true, order: 21, colSpan: 1 },
    { id: 'sleepinsights', name: 'Sleep Insights', visible: true, order: 22, colSpan: 1 },
];

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
    stats: TodayStatsWidget,
    timer: FocusTimerWidget,
    quality: FocusQualityWidget,
    challenges: DailyChallengesWidget,
    trends: WeeklyTrendsWidget,
    leaderboard: LeaderboardWidget,
    burnout: BurnoutRiskWidget,
    eyestrain: EyeStrainTimer,
    goals: GoalsWidget,
    tasks: TaskListWidget,
    ai: AIInsightsWidget,
    analytics: AdvancedAnalyticsWidget,
    performance: PerformanceMonitorWidget,
    ambient: AmbientSoundsWidget,
    tasktree: TaskTreeWidget,
    wearables: WearablesHealthWidget,
    userlevel: UserLevelWidget,
    calendar: CalendarWidget,
    recurring: RecurringTasksWidget,
    quickactions: QuickActionsWidget,
    voice: VoiceCommandWidget,
    aireport: AIReportWidget,
    sleepinsights: SleepInsightsWidget,
};

export default function Dashboard({ isTracking }: DashboardProps) {
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [editMode, setEditMode] = useState(false);
    const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
    const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
    const [showTips, setShowTips] = useState(true); // Default to true to show tips

    // Browser extension connection status - use timestamp to be tolerant of brief disconnections
    const [lastActivityTime, setLastActivityTime] = useState<number>(0);
    const [lastBrowserActivity, setLastBrowserActivity] = useState<{
        domain: string;
        title: string;
        category: string;
        isDistraction: boolean;
    } | null>(null);

    // Consider connected if activity received within last 60 seconds
    const extensionConnected = Date.now() - lastActivityTime < 60000;

    // Force re-render periodically to update connection status
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(interval);
    }, []);

    // Check if tips should be shown (for new users)
    useEffect(() => {
        const checkTipsVisibility = async () => {
            if (!window.wakey) {
                // Show tips by default if wakey API not available
                setShowTips(true);
                return;
            }
            try {
                const settings = await window.wakey.getSettings();
                // Show tips unless explicitly dismissed
                const tipsHidden = settings.tipsDismissed === true;
                setShowTips(!tipsHidden);
            } catch (error) {
                console.error('Failed to check tips visibility:', error);
                // Show tips by default on error
                setShowTips(true);
            }
        };
        checkTipsVisibility();
    }, []);

    const handleDismissTips = async () => {
        setShowTips(false);
        try {
            await window.wakey?.setSetting('tipsDismissed', true);
        } catch (error) {
            console.error('Failed to save tips dismissal:', error);
        }
    };

    // Listen for browser activity events from extension
    useEffect(() => {
        if (!window.wakey) return;

        // Query initial extension status
        window.wakey.getExtensionStatus().then((status) => {
            if (status.connected) {
                setLastActivityTime(Date.now());
            }
        }).catch((err) => {
            console.error('Failed to get extension status:', err);
        });

        window.wakey.onBrowserActivity((data) => {
            console.log('Browser activity received:', data);

            // Any activity from extension means it's connected
            setLastActivityTime(Date.now());

            // Handle connection status events
            if (data.type === 'extension_connected') {
                return;
            }

            if (data.type === 'extension_disconnected') {
                // Don't immediately mark as disconnected - let the timeout handle it
                return;
            }

            // Update browser activity details for actual tab events
            if (data.domain) {
                setLastBrowserActivity({
                    domain: data.domain || 'Unknown',
                    title: data.title || '',
                    category: data.category || 'Browser',
                    isDistraction: data.isDistraction || false,
                });
            }
        });

        return () => {
            window.wakey.removeAllListeners('browser-activity');
        };
    }, []);


    // Load saved layout - merge with defaults to ensure new widgets are added
    useEffect(() => {
        const loadLayout = async () => {

            if (!window.wakey) return;
            try {
                const settings = await window.wakey.getSettings();
                if (settings.dashboardLayout) {
                    const savedWidgets = settings.dashboardLayout as WidgetConfig[];
                    // Merge saved layout with defaults to add any new widgets
                    const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
                        const savedWidget = savedWidgets.find(w => w.id === defaultWidget.id);
                        if (savedWidget) {
                            // Keep saved order but ensure visibility is preserved
                            return { ...savedWidget, visible: savedWidget.visible ?? true };
                        }
                        // New widget not in saved layout - add it as visible
                        return { ...defaultWidget, visible: true };
                    });
                    setWidgets(mergedWidgets);
                }
            } catch (error) {
                console.error('Failed to load dashboard layout:', error);
            }
        };
        loadLayout();
    }, []);

    // Save layout
    const saveLayout = useCallback(async (newWidgets: WidgetConfig[]) => {
        if (!window.wakey) return;
        try {
            await window.wakey.setSetting('dashboardLayout', newWidgets);
        } catch (error) {
            console.error('Failed to save dashboard layout:', error);
        }
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, widgetId: string) => {
        setDraggedWidget(widgetId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', widgetId);
    };

    const handleDragOver = (e: React.DragEvent, widgetId: string) => {
        e.preventDefault();
        if (draggedWidget && draggedWidget !== widgetId) {
            setDragOverWidget(widgetId);
        }
    };

    const handleDragLeave = () => {
        setDragOverWidget(null);
    };

    const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
        e.preventDefault();
        if (!draggedWidget || draggedWidget === targetWidgetId) return;

        const newWidgets = [...widgets];
        const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget);
        const targetIndex = newWidgets.findIndex(w => w.id === targetWidgetId);

        // Swap positions
        const draggedOrder = newWidgets[draggedIndex].order;
        newWidgets[draggedIndex].order = newWidgets[targetIndex].order;
        newWidgets[targetIndex].order = draggedOrder;

        // Sort by order
        newWidgets.sort((a, b) => a.order - b.order);

        setWidgets(newWidgets);
        saveLayout(newWidgets);
        setDraggedWidget(null);
        setDragOverWidget(null);
    };

    const handleDragEnd = () => {
        setDraggedWidget(null);
        setDragOverWidget(null);
    };

    // Toggle widget visibility
    const toggleWidgetVisibility = (widgetId: string) => {
        const newWidgets = widgets.map(w =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w
        );
        setWidgets(newWidgets);
        saveLayout(newWidgets);
    };

    // Reset to default layout
    const resetLayout = () => {
        setWidgets(DEFAULT_WIDGETS);
        saveLayout(DEFAULT_WIDGETS);
    };

    // Get visible widgets sorted by order
    const visibleWidgets = widgets
        .filter(w => w.visible)
        .sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-6" data-tour="dashboard">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {greeting()}, User! 👋
                    </h1>
                    <p className="text-dark-400 mt-1">
                        {isTracking
                            ? "Your productivity is being tracked. Stay focused!"
                            : "Start tracking to monitor your productivity."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Edit Mode Toggle */}
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${editMode
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-dark-400 hover:text-white'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        {editMode ? 'Done' : 'Customize'}
                    </button>

                    {/* Tracking Status */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isTracking
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-dark-700 text-dark-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-primary-400 animate-pulse' : 'bg-dark-500'
                            }`} />
                        <span className="text-sm font-medium">
                            {isTracking ? 'Tracking Active' : 'Tracking Paused'}
                        </span>
                    </div>

                    {/* Browser Extension Status */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${extensionConnected
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-dark-700 text-dark-500'
                        }`}
                        title={lastBrowserActivity ? `${lastBrowserActivity.domain} - ${lastBrowserActivity.category}` : 'Browser extension not connected'}
                    >
                        <span className={`w-2 h-2 rounded-full ${extensionConnected ? 'bg-blue-400' : 'bg-dark-600'}`} />
                        <span className="text-sm font-medium">
                            {extensionConnected
                                ? (lastBrowserActivity?.domain || 'Extension Connected')
                                : 'Extension Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div data-tour="quick-stats">
                <QuickStatsBar />
            </div>

            {/* First Time User Tips */}
            {showTips && <FirstTimeUserTips onDismiss={handleDismissTips} />}

            {/* Edit Mode Panel */}
            {editMode && (
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-white">Customize Dashboard</h3>
                            <p className="text-sm text-dark-400">Drag widgets to reorder, toggle visibility</p>
                        </div>
                        <button
                            onClick={resetLayout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-400 hover:text-white bg-dark-700 rounded-lg"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Layout
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {widgets.map(widget => (
                            <button
                                key={widget.id}
                                onClick={() => toggleWidgetVisibility(widget.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${widget.visible
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'bg-dark-700 text-dark-500 border border-dark-600'
                                    }`}
                            >
                                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {widget.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Widget Grid - Mixed 3-Column Layout */}
            <div className="grid grid-cols-3 gap-5">
                {visibleWidgets.map(widget => {
                    const WidgetComponent = WIDGET_COMPONENTS[widget.id];
                    if (!WidgetComponent) return null;

                    return (
                        <div
                            key={widget.id}
                            data-tour={widget.id === 'timer' ? 'focus-timer' :
                                widget.id === 'challenges' ? 'challenges' :
                                    widget.id === 'ai' ? 'ai-insights' : undefined}
                            className={`relative ${widget.colSpan === 3 ? 'col-span-3' : widget.colSpan === 2 ? 'col-span-2' : ''} ${dragOverWidget === widget.id ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900' : ''
                                } ${draggedWidget === widget.id ? 'opacity-50' : ''}`}
                            draggable={editMode}
                            onDragStart={(e) => handleDragStart(e, widget.id)}
                            onDragOver={(e) => handleDragOver(e, widget.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, widget.id)}
                            onDragEnd={handleDragEnd}
                        >
                            {/* Drag Handle (visible in edit mode) */}
                            {editMode && (
                                <div className="absolute -top-2 -left-2 z-10 p-1 bg-dark-700 rounded-full cursor-grab active:cursor-grabbing shadow-lg">
                                    <GripVertical className="w-4 h-4 text-dark-400" />
                                </div>
                            )}

                            <WidgetComponent />
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {visibleWidgets.length === 0 && (
                <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
                    <p className="text-dark-400">No widgets visible. Click "Customize" to add widgets.</p>
                </div>
            )}
        </div>
    );
}
