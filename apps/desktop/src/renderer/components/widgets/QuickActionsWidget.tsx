import { useState, useCallback } from 'react';
import {
    Play, Pause, Plus, FileText, Clock, Coffee,
    Moon, Bell, BellOff, Settings, Zap, Target,
    CheckCircle, Volume2, VolumeX, MoreHorizontal
} from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    action: () => void;
    disabled?: boolean;
}

export default function QuickActionsWidget() {
    const [isFocusing, setIsFocusing] = useState(false);
    const [dndEnabled, setDndEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const handleStartFocus = useCallback(() => {
        setIsFocusing(true);
        window.wakey?.startFocusSession?.();
    }, []);

    const handleStopFocus = useCallback(() => {
        setIsFocusing(false);
        window.wakey?.stopFocusSession?.();
    }, []);

    const handleNewTask = useCallback(() => {
        // Open task creation modal/dialog
        const event = new CustomEvent('open-new-task-modal');
        window.dispatchEvent(event);
    }, []);

    const handleQuickNote = useCallback(() => {
        const event = new CustomEvent('open-quick-note');
        window.dispatchEvent(event);
    }, []);

    const handleBreak = useCallback(() => {
        window.wakey?.triggerBreak?.();
    }, []);

    const actions: QuickAction[] = [
        {
            id: 'focus',
            label: isFocusing ? 'End Focus' : 'Start Focus',
            icon: isFocusing ? Pause : Play,
            color: isFocusing ? '#ef4444' : '#22c55e',
            action: isFocusing ? handleStopFocus : handleStartFocus
        },
        {
            id: 'task',
            label: 'New Task',
            icon: Plus,
            color: '#3b82f6',
            action: handleNewTask
        },
        {
            id: 'note',
            label: 'Quick Note',
            icon: FileText,
            color: '#8b5cf6',
            action: handleQuickNote
        },
        {
            id: 'timer',
            label: '+5 Minutes',
            icon: Clock,
            color: '#f59e0b',
            action: () => window.wakey?.extendTimer?.(5),
            disabled: !isFocusing
        },
        {
            id: 'break',
            label: 'Take Break',
            icon: Coffee,
            color: '#06b6d4',
            action: handleBreak
        },
        {
            id: 'dnd',
            label: dndEnabled ? 'DND Off' : 'DND On',
            icon: dndEnabled ? Bell : BellOff,
            color: dndEnabled ? '#22c55e' : '#6b7280',
            action: () => setDndEnabled(!dndEnabled)
        },
        {
            id: 'sound',
            label: soundEnabled ? 'Mute' : 'Unmute',
            icon: soundEnabled ? VolumeX : Volume2,
            color: '#ec4899',
            action: () => setSoundEnabled(!soundEnabled)
        },
        {
            id: 'goal',
            label: 'New Goal',
            icon: Target,
            color: '#10b981',
            action: () => {
                const event = new CustomEvent('open-new-goal-modal');
                window.dispatchEvent(event);
            }
        },
        {
            id: 'complete',
            label: 'Mark Done',
            icon: CheckCircle,
            color: '#22c55e',
            action: () => {
                // Mark current active task as done
            }
        }
    ];

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Quick Actions</h3>
                </div>
                <button className="p-1.5 text-dark-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-3 gap-2">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        disabled={action.disabled}
                        className={`p-3 rounded-xl transition-all flex flex-col items-center gap-2 group ${action.disabled
                                ? 'bg-dark-700/30 opacity-50 cursor-not-allowed'
                                : 'bg-dark-700 hover:bg-dark-600 active:scale-95'
                            }`}
                    >
                        <div
                            className="p-2 rounded-lg transition-colors"
                            style={{ backgroundColor: `${action.color}20` }}
                        >
                            <action.icon
                                className="w-5 h-5 transition-transform group-hover:scale-110"
                                style={{ color: action.color }}
                            />
                        </div>
                        <span className="text-xs text-dark-300 group-hover:text-white transition-colors text-center">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Keyboard hint */}
            <div className="mt-4 pt-3 border-t border-dark-700 text-center">
                <p className="text-xs text-dark-500">
                    Press <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-dark-300">⌘K</kbd> for command palette
                </p>
            </div>
        </div>
    );
}
