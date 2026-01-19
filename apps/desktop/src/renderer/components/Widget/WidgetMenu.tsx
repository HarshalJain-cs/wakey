import { Play, Pause, LayoutDashboard, Settings, Power, EyeOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface WidgetMenuProps {
    isOpen: boolean;
    onClose: () => void;
    isTracking: boolean;
    onToggleTracking: () => void;
    onOpenDashboard: () => void;
    onOpenSettings: () => void;
    onHide: () => void;
    onQuit: () => void;
}

export default function WidgetMenu({
    isOpen,
    onClose,
    isTracking,
    onToggleTracking,
    onOpenDashboard,
    onOpenSettings,
    onHide,
    onQuit
}: WidgetMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute top-12 right-0 w-48 bg-[#1a1b26] border border-dark-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="p-1">
                <button
                    onClick={() => { onToggleTracking(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-dark-800 rounded-md transition-colors text-left"
                >
                    {isTracking ? <Pause className="w-4 h-4 text-orange-400" /> : <Play className="w-4 h-4 text-green-400" />}
                    <span>{isTracking ? 'Pause Tracking' : 'Resume Tracking'}</span>
                </button>

                <button
                    onClick={() => { onOpenDashboard(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-dark-800 rounded-md transition-colors text-left"
                >
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    <span>Dashboard</span>
                </button>

                <div className="h-px bg-dark-700 my-1" />

                <button
                    onClick={() => { onOpenSettings(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-dark-800 rounded-md transition-colors text-left"
                >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                </button>

                <button
                    onClick={() => { onHide(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-dark-800 rounded-md transition-colors text-left"
                >
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span>Hide Widget</span>
                </button>

                <button
                    onClick={onQuit}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-800 rounded-md transition-colors text-left"
                >
                    <Power className="w-4 h-4" />
                    <span>Quit Wakey</span>
                </button>
            </div>
        </div>
    );
}
