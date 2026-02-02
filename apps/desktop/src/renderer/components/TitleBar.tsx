import { Minus, Square, X } from 'lucide-react';

interface TitleBarProps {
    darkMode?: boolean;
}

export default function TitleBar({ darkMode: _darkMode }: TitleBarProps) {
    const handleMinimize = async () => {
        try {
            console.log('[TitleBar] Minimize clicked');
            if (window.wakey?.minimize) {
                await window.wakey.minimize();
            } else {
                console.error('Wakey API not available for minimize');
            }
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    };

    const handleMaximize = async () => {
        try {
            console.log('[TitleBar] Maximize clicked');
            if (window.wakey?.maximize) {
                await window.wakey.maximize();
            } else {
                console.error('Wakey API not available for maximize');
            }
        } catch (error) {
            console.error('Failed to maximize window:', error);
        }
    };

    const handleClose = async () => {
        try {
            console.log('[TitleBar] Close clicked');
            if (window.wakey?.close) {
                await window.wakey.close();
            } else {
                console.error('Wakey API not available for close');
            }
        } catch (error) {
            console.error('Failed to close window:', error);
        }
    };

    return (
        <div
            className="titlebar h-10 bg-dark-950 flex items-center justify-between px-4 border-b border-dark-800"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            {/* App title */}
            <div className="flex items-center gap-2">
                <span className="text-primary-500 font-bold text-lg">⚡</span>
                <span className="font-semibold text-white">Wakey</span>
            </div>

            {/* Window controls - must be no-drag to receive clicks */}
            <div
                className="flex items-center gap-1"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button
                    onClick={handleMinimize}
                    className="p-2 rounded hover:bg-dark-700 transition-colors"
                    title="Minimize"
                    type="button"
                >
                    <Minus className="w-4 h-4 text-dark-400" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="p-2 rounded hover:bg-dark-700 transition-colors"
                    title="Maximize"
                    type="button"
                >
                    <Square className="w-3.5 h-3.5 text-dark-400" />
                </button>
                <button
                    onClick={handleClose}
                    className="p-2 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Close to tray"
                    type="button"
                >
                    <X className="w-4 h-4 text-dark-400" />
                </button>
            </div>
        </div>
    );
}
