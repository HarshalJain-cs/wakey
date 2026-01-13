import FocusTimerWidget from '../components/widgets/FocusTimerWidget';
import TodayStatsWidget from '../components/widgets/TodayStatsWidget';
import FocusQualityWidget from '../components/widgets/FocusQualityWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import TaskListWidget from '../components/widgets/TaskListWidget';
import AIInsightsWidget from '../components/widgets/AIInsightsWidget';
import GoalsWidget from '../components/widgets/GoalsWidget';

interface DashboardProps {
    isTracking: boolean;
}

export default function Dashboard({ isTracking }: DashboardProps) {
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-6">
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
            </div>

            {/* Widget Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-4">
                {/* Row 1: Stats, Timer, Quality */}
                <TodayStatsWidget />
                <FocusTimerWidget />
                <FocusQualityWidget />

                {/* Row 2: Goals, Tasks, AI */}
                <GoalsWidget />
                <TaskListWidget />
                <AIInsightsWidget />

                {/* Row 3: Calendar spans 2 cols */}
                <div className="col-span-2">
                    <CalendarWidget />
                </div>
            </div>
        </div>
    );
}
