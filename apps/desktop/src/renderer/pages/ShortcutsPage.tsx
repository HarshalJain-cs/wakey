import { Keyboard, Command, Search, Target, Clock, Music } from 'lucide-react';

interface Shortcut {
    keys: string[];
    action: string;
    category: string;
}

const SHORTCUTS: Shortcut[] = [
    // Global
    { keys: ['Ctrl', 'Shift', 'W'], action: 'Toggle Wakey window', category: 'Global' },
    { keys: ['Ctrl', 'Shift', 'T'], action: 'Start/Stop tracking', category: 'Global' },
    { keys: ['Ctrl', 'K'], action: 'Open command palette', category: 'Global' },
    { keys: ['Ctrl', 'Shift', 'F'], action: 'Start focus session', category: 'Global' },
    { keys: ['Escape'], action: 'Close modal/panel', category: 'Global' },

    // Navigation
    { keys: ['Ctrl', '1'], action: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['Ctrl', '2'], action: 'Go to Focus', category: 'Navigation' },
    { keys: ['Ctrl', '3'], action: 'Go to Tasks', category: 'Navigation' },
    { keys: ['Ctrl', '4'], action: 'Go to Analytics', category: 'Navigation' },
    { keys: ['Ctrl', '5'], action: 'Go to Goals', category: 'Navigation' },
    { keys: ['Ctrl', ','], action: 'Open Settings', category: 'Navigation' },

    // Focus Timer
    { keys: ['Space'], action: 'Start/Pause timer (when on Focus page)', category: 'Focus' },
    { keys: ['R'], action: 'Reset timer', category: 'Focus' },
    { keys: ['S'], action: 'Skip break', category: 'Focus' },
    { keys: ['+'], action: 'Add 5 minutes', category: 'Focus' },
    { keys: ['-'], action: 'Remove 5 minutes', category: 'Focus' },

    // Tasks
    { keys: ['N'], action: 'New task (when on Tasks page)', category: 'Tasks' },
    { keys: ['Enter'], action: 'Complete selected task', category: 'Tasks' },
    { keys: ['Delete'], action: 'Delete selected task', category: 'Tasks' },

    // Music
    { keys: ['M'], action: 'Toggle music', category: 'Music' },
    { keys: ['['], action: 'Volume down', category: 'Music' },
    { keys: [']'], action: 'Volume up', category: 'Music' },
];

const CATEGORIES = ['Global', 'Navigation', 'Focus', 'Tasks', 'Music'];

const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
        Global: <Command className="w-5 h-5" />,
        Navigation: <Search className="w-5 h-5" />,
        Focus: <Target className="w-5 h-5" />,
        Tasks: <Clock className="w-5 h-5" />,
        Music: <Music className="w-5 h-5" />,
    };
    return icons[category] || <Keyboard className="w-5 h-5" />;
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        Global: '#3b82f6',
        Navigation: '#14b8a6',
        Focus: '#f59e0b',
        Tasks: '#8b5cf6',
        Music: '#ec4899',
    };
    return colors[category] || '#6b7280';
};

export default function ShortcutsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Keyboard className="w-7 h-7 text-primary-400" />
                    Keyboard Shortcuts
                </h1>
                <p className="text-dark-400">Master Wakey with keyboard shortcuts</p>
            </div>

            {/* Quick Reference */}
            <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-xl border border-primary-500/30 p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Command className="w-5 h-5 text-primary-400" />
                    <span className="font-semibold text-white">Quick Reference</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl+K</kbd>
                        <span className="text-dark-300">Command Palette</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl+Shift+F</kbd>
                        <span className="text-dark-300">Focus Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-dark-700 rounded text-xs">Ctrl+Shift+T</kbd>
                        <span className="text-dark-300">Toggle Tracking</span>
                    </div>
                </div>
            </div>

            {/* Shortcuts by Category */}
            <div className="space-y-6">
                {CATEGORIES.map(category => (
                    <div key={category} className="space-y-3">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${getCategoryColor(category)}20` }}
                            >
                                <div style={{ color: getCategoryColor(category) }}>
                                    {getCategoryIcon(category)}
                                </div>
                            </div>
                            {category}
                        </h2>

                        <div className="bg-dark-800 rounded-xl border border-dark-700 divide-y divide-dark-700">
                            {SHORTCUTS.filter(s => s.category === category).map((shortcut, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 hover:bg-dark-700/50 transition-colors"
                                >
                                    <span className="text-dark-300">{shortcut.action}</span>
                                    <div className="flex items-center gap-1">
                                        {shortcut.keys.map((key, j) => (
                                            <span key={j} className="flex items-center">
                                                {j > 0 && <span className="text-dark-500 mx-1">+</span>}
                                                <kbd className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm font-mono text-white min-w-[40px] text-center">
                                                    {key}
                                                </kbd>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                <h3 className="font-semibold text-white mb-3">💡 Tips</h3>
                <ul className="space-y-2 text-sm text-dark-400">
                    <li>• Most shortcuts work globally, even when Wakey is minimized</li>
                    <li>• Use <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs mx-1">Ctrl+K</kbd> to quickly search for any command</li>
                    <li>• Navigation shortcuts only work when the window is focused</li>
                </ul>
            </div>
        </div>
    );
}
