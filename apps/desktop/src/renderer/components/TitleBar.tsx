import { Minus, Square, X } from 'lucide-react';

interface TitleBarProps {
    darkMode?: boolean;
}

export default function TitleBar({ darkMode: _darkMode }: TitleBarProps) {
    const handleMinimize = () => window.wakey?.minimize();
    const handleMaximize = () => window.wakey?.maximize();
    const handleClose = () => window.wakey?.close();

    return (
        <div className="titlebar h-10 bg-dark-950 flex items-center justify-between px-4 border-b border-dark-800">
            {/* App title */}
            <div className="flex items-center gap-2">
                <span className="text-primary-500 font-bold text-lg">⚡</span>
                <span className="font-semibold text-white">Wakey</span>
                <span className="text-xs text-dark-400 ml-2">v0.1.0</span>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleMinimize}
                    className="p-2 rounded hover:bg-dark-700 transition-colors"
                    title="Minimize"
                >
                    <Minus className="w-4 h-4 text-dark-400" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="p-2 rounded hover:bg-dark-700 transition-colors"
                    title="Maximize"
                >
                    <Square className="w-3.5 h-3.5 text-dark-400" />
                </button>
                <button
                    onClick={handleClose}
                    className="p-2 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Close to tray"
                >
                    <X className="w-4 h-4 text-dark-400" />
                </button>
            </div>
        </div>
    );
}
