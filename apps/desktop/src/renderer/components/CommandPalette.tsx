import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Command, Search, Timer, BarChart3, Brain,
    Settings, Moon, Sun, Cloud, Zap, X,
    ChevronRight, Keyboard, Plus, PlayCircle
} from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    description?: string;
    icon: React.ElementType;
    shortcut?: string;
    action: () => void;
    category: 'navigation' | 'action' | 'setting';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    onDarkModeToggle: () => void;
}

export default function CommandPalette({
    isOpen,
    onClose,
    darkMode,
    onDarkModeToggle
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // Define all quick actions
    const actions: QuickAction[] = [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            icon: Command,
            shortcut: 'G D',
            action: () => { navigate('/'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-focus',
            label: 'Go to Focus',
            icon: Timer,
            shortcut: 'G F',
            action: () => { navigate('/focus'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-analytics',
            label: 'Go to Analytics',
            icon: BarChart3,
            shortcut: 'G A',
            action: () => { navigate('/analytics'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-research',
            label: 'Go to Research',
            icon: Search,
            shortcut: 'G R',
            action: () => { navigate('/research'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-ai',
            label: 'Go to AI Consensus',
            icon: Brain,
            shortcut: 'G I',
            action: () => { navigate('/ai-consensus'); onClose(); },
            category: 'navigation',
        },
        {
            id: 'nav-settings',
            label: 'Go to Settings',
            icon: Settings,
            shortcut: 'G S',
            action: () => { navigate('/settings'); onClose(); },
            category: 'navigation',
        },

        // Actions
        {
            id: 'action-start-focus',
            label: 'Start Focus Session',
            description: 'Begin a new Pomodoro focus session',
            icon: PlayCircle,
            shortcut: 'Ctrl+Shift+F',
            action: () => { navigate('/focus'); onClose(); },
            category: 'action',
        },
        {
            id: 'action-add-task',
            label: 'Add New Task',
            icon: Plus,
            shortcut: 'Ctrl+N',
            action: () => { navigate('/tasks'); onClose(); },
            category: 'action',
        },
        {
            id: 'action-quick-research',
            label: 'Quick Research',
            description: 'Search the web with AI',
            icon: Search,
            shortcut: 'Ctrl+Shift+R',
            action: () => { navigate('/research'); onClose(); },
            category: 'action',
        },
        {
            id: 'action-sync',
            label: 'Sync to Cloud',
            description: 'Upload your data to the cloud',
            icon: Cloud,
            action: async () => {
                // Trigger cloud sync
                onClose();
                navigate('/cloud-sync');
            },
            category: 'action',
        },

        // Settings
        {
            id: 'setting-dark-mode',
            label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: darkMode ? Sun : Moon,
            action: () => { onDarkModeToggle(); onClose(); },
            category: 'setting',
        },
        {
            id: 'setting-tracking',
            label: 'Toggle Tracking',
            icon: Zap,
            shortcut: 'Ctrl+Shift+T',
            action: async () => {
                const status = await window.wakey.getTrackingStatus();
                await window.wakey.setTrackingStatus(!status);
                onClose();
            },
            category: 'setting',
        },
    ];

    // Filter actions based on query
    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase()) ||
        action.description?.toLowerCase().includes(query.toLowerCase())
    );

    // Group by category
    const navigationActions = filteredActions.filter(a => a.category === 'navigation');
    const actionActions = filteredActions.filter(a => a.category === 'action');
    const settingActions = filteredActions.filter(a => a.category === 'setting');

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div className="w-full max-w-xl bg-dark-800 rounded-xl border border-dark-700 shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700">
                    <Search className="w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent text-white placeholder-dark-400 outline-none"
                    />
                    <button onClick={onClose} className="p-1 text-dark-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-auto">
                    {/* Actions */}
                    {actionActions.length > 0 && (
                        <div className="p-2">
                            <div className="px-2 py-1 text-xs font-medium text-dark-500 uppercase">Actions</div>
                            {actionActions.map(action => (
                                <ActionItem key={action.id} action={action} />
                            ))}
                        </div>
                    )}

                    {/* Navigation */}
                    {navigationActions.length > 0 && (
                        <div className="p-2 border-t border-dark-700">
                            <div className="px-2 py-1 text-xs font-medium text-dark-500 uppercase">Navigation</div>
                            {navigationActions.map(action => (
                                <ActionItem key={action.id} action={action} />
                            ))}
                        </div>
                    )}

                    {/* Settings */}
                    {settingActions.length > 0 && (
                        <div className="p-2 border-t border-dark-700">
                            <div className="px-2 py-1 text-xs font-medium text-dark-500 uppercase">Settings</div>
                            {settingActions.map(action => (
                                <ActionItem key={action.id} action={action} />
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {filteredActions.length === 0 && (
                        <div className="p-8 text-center text-dark-400">
                            No commands found for "{query}"
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-dark-700 flex items-center justify-between text-xs text-dark-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Keyboard className="w-3 h-3" />
                            Navigate
                        </span>
                        <span>↵ Select</span>
                        <span>Esc Close</span>
                    </div>
                    <span>Ctrl+K to open</span>
                </div>
            </div>
        </div>
    );
}

// Action Item Component
function ActionItem({ action }: { action: QuickAction }) {
    const Icon = action.icon;

    return (
        <button
            onClick={action.action}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-dark-700 group"
        >
            <Icon className="w-4 h-4 text-dark-400 group-hover:text-primary-400" />
            <div className="flex-1">
                <div className="text-white">{action.label}</div>
                {action.description && (
                    <div className="text-xs text-dark-500">{action.description}</div>
                )}
            </div>
            {action.shortcut && (
                <kbd className="px-2 py-0.5 text-xs bg-dark-700 rounded text-dark-400">
                    {action.shortcut}
                </kbd>
            )}
            <ChevronRight className="w-4 h-4 text-dark-500 opacity-0 group-hover:opacity-100" />
        </button>
    );
}

// Hook for using command palette
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev),
    };
}
