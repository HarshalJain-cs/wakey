import { useState, useEffect } from 'react';
import { MoreHorizontal, ChevronLeft } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Listen for updates from main process
        window.wakey?.onWidgetUpdate((data) => {
            setState(prev => ({ ...prev, ...data }));
        });

        // Initial sync
        window.wakey?.requestWidgetUpdate();

        // Set initial size
        window.wakey?.resizeWidget(450, 70);
    }, []);

    // Handle collapse/expand resizing
    useEffect(() => {
        if (isCollapsed) {
            window.wakey?.resizeWidget(70, 70);
        } else {
            window.wakey?.resizeWidget(450, 70);
        }
    }, [isCollapsed]);

    const handleToggleTracking = () => {
        // Toggle locally immediately for responsiveness
        setState(prev => ({ ...prev, isTracking: !prev.isTracking }));
        window.wakey?.setTrackingStatus(!state.isTracking);
    };

    if (isCollapsed) {
        return (
            <div className="w-full h-full flex items-center justify-center p-1 drag-region">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="w-12 h-12 bg-[#0F1117] border border-white/10 rounded-lg flex items-center justify-center shadow-xl hover:bg-dark-800 transition-colors group no-drag"
                >
                    <div className={`w-3 h-3 rounded-full ${state.isTracking ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-1 drag-region">
            <div className="relative bg-[#0F1117] border border-white/10 rounded-lg shadow-2xl flex items-center px-4 py-2 gap-6 h-[56px] select-none text-white">

                {/* 1. Status Section */}
                <div className="flex flex-col justify-center min-w-[80px] cursor-pointer no-drag" onClick={handleToggleTracking}>
                    <div className="flex items-center gap-2">
                        {state.isTracking ?
                            <span className="text-base font-bold text-white tracking-wide">Tracking</span> :
                            <span className="text-base font-bold text-white tracking-wide">Paused</span>
                        }
                        <div className={`w-2 h-2 rounded-full ${state.isTracking ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">TRACKING STATUS</span>
                </div>

                <div className="w-[1px] h-8 bg-white/5" />

                {/* 2. Time Section */}
                <div className="flex flex-col justify-center min-w-[100px]">
                    <span className="text-base font-bold text-[#818cf8] tracking-wide font-mono">{state.todayTime}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">WORK HOURS</span>
                </div>

                <div className="w-[1px] h-8 bg-white/5" />

                {/* 3. Percent Section */}
                <div className="flex flex-col justify-center min-w-[50px]">
                    <span className="text-base font-bold text-gray-300 tracking-wide font-mono">{Math.round(state.progress)}%</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">PERCENT OF DAY</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 ml-2">
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors no-drag text-gray-400 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors no-drag text-gray-400 hover:text-white"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Context Menu */}
                <WidgetMenu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    isTracking={state.isTracking}
                    onToggleTracking={handleToggleTracking}
                    onOpenDashboard={() => window.wakey?.openDashboard()}
                    onOpenSettings={() => window.wakey?.openSettings()}
                    onHide={() => window.wakey?.toggleWidget()}
                    onQuit={() => window.wakey?.quitApp()}
                />
            </div>
        </div>
    );
}
