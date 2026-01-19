import { useState, useEffect, useCallback } from 'react';
import { Coffee, Clock, Bell, X, Play, Pause } from 'lucide-react';

interface WorkBreakReminderProps {
    enabled?: boolean;
    workDurationMinutes?: number; // Default 45 minutes
    breakDurationMinutes?: number; // Default 5 minutes
    snoozeDurationMinutes?: number; // Default 5 minutes
    maxSnoozes?: number; // Default 3
}

/**
 * Work Break Reminder Component
 * Reminds users to take a break after extended work periods
 * Inspired by Rize Productivity Coach
 */
export default function WorkBreakReminder({
    enabled = true,
    workDurationMinutes = 45,
    breakDurationMinutes = 5,
    snoozeDurationMinutes = 5,
    maxSnoozes = 3
}: WorkBreakReminderProps) {
    const [showReminder, setShowReminder] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakTimeRemaining, setBreakTimeRemaining] = useState(breakDurationMinutes * 60);
    const [workTimeElapsed, setWorkTimeElapsed] = useState(0);
    const [snoozeCount, setSnoozeCount] = useState(0);
    const [_lastBreakTime, setLastBreakTime] = useState(Date.now());

    // Work timer - tracks time since last break
    useEffect(() => {
        if (!enabled || isOnBreak || showReminder) return;

        const interval = setInterval(() => {
            setWorkTimeElapsed(prev => {
                const newTime = prev + 1;
                if (newTime >= workDurationMinutes * 60) {
                    setShowReminder(true);
                    return workDurationMinutes * 60;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [enabled, isOnBreak, showReminder, workDurationMinutes]);

    // Break countdown timer
    useEffect(() => {
        if (!isOnBreak) return;

        if (breakTimeRemaining <= 0) {
            // Break finished
            setIsOnBreak(false);
            setShowReminder(false);
            setWorkTimeElapsed(0);
            setLastBreakTime(Date.now());
            setSnoozeCount(0);
            return;
        }

        const timer = setTimeout(() => {
            setBreakTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isOnBreak, breakTimeRemaining]);

    const startBreak = useCallback(() => {
        setIsOnBreak(true);
        setBreakTimeRemaining(breakDurationMinutes * 60);
    }, [breakDurationMinutes]);

    const snooze = useCallback(() => {
        if (snoozeCount >= maxSnoozes) return;

        setShowReminder(false);
        setSnoozeCount(prev => prev + 1);

        // Reset work timer to snooze duration
        setWorkTimeElapsed(workDurationMinutes * 60 - snoozeDurationMinutes * 60);
    }, [snoozeCount, maxSnoozes, workDurationMinutes, snoozeDurationMinutes]);

    const skipBreak = useCallback(() => {
        setShowReminder(false);
        setWorkTimeElapsed(0);
        setLastBreakTime(Date.now());
    }, []);

    const endBreakEarly = useCallback(() => {
        setIsOnBreak(false);
        setShowReminder(false);
        setWorkTimeElapsed(0);
        setLastBreakTime(Date.now());
        setSnoozeCount(0);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return mins;
    };

    if (!enabled) return null;

    return (
        <>
            {/* Break Reminder Popup */}
            {showReminder && !isOnBreak && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                    {/* Popup Card */}
                    <div
                        className="relative w-full max-w-md mx-4 animate-scaleIn"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/20 rounded-2xl">
                                        <Coffee className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Wakey Productivity Coach</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={skipBreak}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-2">
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to take a break?</h3>
                            <p className="text-slate-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                More than {workDurationMinutes} minutes passed since your last break.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 space-y-3">
                            <button
                                onClick={startBreak}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 rounded-2xl transition-all"
                            >
                                <Play className="w-5 h-5 text-white" />
                                <span className="text-white font-semibold">Start Break ({breakDurationMinutes} min)</span>
                            </button>

                            <button
                                onClick={snooze}
                                disabled={snoozeCount >= maxSnoozes}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Bell className="w-5 h-5 text-slate-300" />
                                <span className="text-slate-300 font-medium">
                                    Snooze ({snoozeDurationMinutes} min)
                                    {snoozeCount > 0 && (
                                        <span className="ml-2 text-slate-500">
                                            ({snoozeCount}/{maxSnoozes} used)
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Tip */}
                        <div className="px-6 pb-6">
                            <p className="text-slate-600 text-sm text-center">
                                💡 Taking regular breaks improves focus and prevents burnout
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Break in Progress Popup */}
            {isOnBreak && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />

                    {/* Popup Card */}
                    <div
                        className="relative w-full max-w-md mx-4 text-center"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div className="p-8">
                            {/* Icon */}
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Coffee className="w-10 h-10 text-green-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Taking a Break</h2>
                            <p className="text-slate-400 mb-8">Step away from the screen and relax</p>

                            {/* Countdown */}
                            <div className="mb-8">
                                <div className="text-6xl font-bold text-green-400 mb-2">
                                    {formatTime(breakTimeRemaining)}
                                </div>
                                <p className="text-slate-500">remaining</p>

                                {/* Progress ring */}
                                <div className="relative w-32 h-32 mx-auto mt-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-slate-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={2 * Math.PI * 56}
                                            strokeDashoffset={2 * Math.PI * 56 * (breakTimeRemaining / (breakDurationMinutes * 60))}
                                            className="text-green-500 transition-all duration-1000"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* End break early */}
                            <button
                                onClick={endBreakEarly}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-2 mx-auto"
                            >
                                <Pause className="w-4 h-4" />
                                End Break Early
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status indicator when not showing popup */}
            {!showReminder && !isOnBreak && (
                <div className="fixed bottom-4 left-4 z-40">
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/80 border border-slate-700 shadow-lg"
                        title={`Next break in ${formatMinutes(workDurationMinutes * 60 - workTimeElapsed)} min`}
                    >
                        <Coffee className="w-4 h-4 text-slate-400" />
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-1000"
                                style={{ width: `${(workTimeElapsed / (workDurationMinutes * 60)) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-400">
                            {formatMinutes(workDurationMinutes * 60 - workTimeElapsed)}m
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}

// Hook to manage work break state from parent components
export function useWorkBreakReminder() {
    const [isEnabled, setIsEnabled] = useState(true);
    const [settings, setSettings] = useState({
        workDurationMinutes: 45,
        breakDurationMinutes: 5,
        snoozeDurationMinutes: 5,
        maxSnoozes: 3
    });

    useEffect(() => {
        // Load settings from electron store
        const loadSettings = async () => {
            if (!window.wakey) return;
            const stored = await window.wakey.getSettings();
            if (stored.breakReminder !== undefined) {
                setIsEnabled(stored.breakReminder as boolean);
            }
            if (stored.workDurationMinutes !== undefined) {
                setSettings(prev => ({ ...prev, workDurationMinutes: stored.workDurationMinutes as number }));
            }
            if (stored.breakDurationMinutes !== undefined) {
                setSettings(prev => ({ ...prev, breakDurationMinutes: stored.breakDurationMinutes as number }));
            }
        };
        loadSettings();
    }, []);

    const toggleEnabled = async (enabled: boolean) => {
        setIsEnabled(enabled);
        await window.wakey?.setSetting('breakReminder', enabled);
    };

    const updateSettings = async (newSettings: Partial<typeof settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        for (const [key, value] of Object.entries(newSettings)) {
            await window.wakey?.setSetting(key, value);
        }
    };

    return { isEnabled, settings, toggleEnabled, updateSettings };
}
