import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import WidgetMenu from './WidgetMenu';

interface WidgetState {
    isTracking: boolean;
    todayTime: string; // "3 hr 42 min"
    progress: number; // 0-100
}

export default function FloatingWidget() {
    const [state, setState] = useState<WidgetState>({
        isTracking: false,
        todayTime: '0 hr 0 min',
        progress: 0
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Listen for updates from main process
        window.wakey?.onWidgetUpdate((data) => {
            setState(prev => ({ ...prev, ...data }));
        });

        // Initial sync
        window.wakey?.requestWidgetUpdate();
    }, []);

    const handleToggleTracking = () => {
        // Toggle locally immediately for responsiveness
        setState(prev => ({ ...prev, isTracking: !prev.isTracking }));
        window.wakey?.setTrackingStatus(!state.isTracking);
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2 drag-region">
            <div className="relative bg-[#1a1b26]/90 backdrop-blur-md border border-dark-700 rounded-full shadow-2xl flex items-center px-4 py-2 gap-4 text-white min-w-[300px] select-none">

                {/* Status Indicator */}
                <div className="flex items-center gap-2 no-drag cursor-pointer" onClick={handleToggleTracking}>
                    <div className={`w-2 h-2 rounded-full ${state.isTracking ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                    <span className="text-xs font-medium text-dark-200 uppercase tracking-wider">
                        {state.isTracking ? 'TRACKING' : 'PAUSED'}
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-dark-700" />

                {/* Time Display */}
                <div className="flex flex-col min-w-[80px]">
                    <span className="text-sm font-bold leading-none mb-0.5">{state.todayTime}</span>
                    <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${state.progress}%` }}
                        />
                    </div>
                </div>

                {/* Percentage */}
                <span className="text-xs font-medium text-dark-300">
                    {Math.round(state.progress)}%
                </span>

                {/* Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="ml-auto p-1.5 hover:bg-dark-700 rounded-full transition-colors no-drag"
                >
                    <MoreHorizontal className="w-4 h-4 text-dark-300" />
                </button>

                {/* Context Menu */}
                <WidgetMenu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    isTracking={state.isTracking}
                    onToggleTracking={handleToggleTracking}
                    onOpenDashboard={() => window.wakey?.openDashboard()}
                    onOpenSettings={() => window.wakey?.openSettings()}
                    onQuit={() => window.wakey?.quitApp()}
                />
            </div>
        </div>
    );
}
