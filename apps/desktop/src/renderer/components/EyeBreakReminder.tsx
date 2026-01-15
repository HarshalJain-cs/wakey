import { useState, useEffect, useCallback } from 'react';
import { Eye, X, Play } from 'lucide-react';

interface EyeBreakReminderProps {
    enabled?: boolean;
    intervalMinutes?: number; // Default 20 (20-20-20 rule)
}

/**
 * Eye Break Reminder Component
 * Implements the 20-20-20 rule:
 * Every 20 minutes, look at something 20 feet away for 20 seconds
 */
export default function EyeBreakReminder({
    enabled = true,
    intervalMinutes = 20
}: EyeBreakReminderProps) {
    const [showReminder, setShowReminder] = useState(false);
    const [countdown, setCountdown] = useState(20); // 20 seconds
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeSinceLastBreak, setTimeSinceLastBreak] = useState(0);

    // Main interval timer
    useEffect(() => {
        if (!enabled || isPaused) return;

        const interval = setInterval(() => {
            setTimeSinceLastBreak(prev => {
                const newTime = prev + 1;
                if (newTime >= intervalMinutes * 60) {
                    setShowReminder(true);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [enabled, isPaused, intervalMinutes]);

    // Countdown timer for 20 seconds
    useEffect(() => {
        if (!isCountingDown) return;

        if (countdown <= 0) {
            setIsCountingDown(false);
            setShowReminder(false);
            setCountdown(20);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isCountingDown, countdown]);

    const startBreak = useCallback(() => {
        setIsCountingDown(true);
    }, []);

    const skipBreak = useCallback(() => {
        setShowReminder(false);
        setCountdown(20);
        setIsCountingDown(false);
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const progressPercent = (timeSinceLastBreak / (intervalMinutes * 60)) * 100;

    if (!enabled) return null;

    return (
        <>
            {/* Mini Status Indicator */}
            <div className="fixed bottom-4 right-4 z-40">
                <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-full ${isPaused ? 'bg-dark-700' : 'bg-dark-800'
                        } border border-dark-600 shadow-lg cursor-pointer hover:bg-dark-700 transition-all`}
                    onClick={togglePause}
                    title={isPaused ? 'Resume eye break reminders' : 'Pause eye break reminders'}
                >
                    <Eye className={`w-4 h-4 ${isPaused ? 'text-dark-500' : 'text-primary-400'}`} />
                    <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-1000"
                            style={{ width: isPaused ? '0%' : `${progressPercent}%` }}
                        />
                    </div>
                    {isPaused ? (
                        <Play className="w-3 h-3 text-dark-500" />
                    ) : (
                        <span className="text-xs text-dark-400">
                            {Math.floor((intervalMinutes * 60 - timeSinceLastBreak) / 60)}m
                        </span>
                    )}
                </div>
            </div>

            {/* Full Screen Reminder Modal */}
            {showReminder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-800 rounded-2xl border border-dark-600 p-8 max-w-md w-full mx-4 text-center">
                        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Eye className="w-10 h-10 text-primary-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isCountingDown ? 'Look Away...' : 'Eye Break Time!'}
                        </h2>

                        <p className="text-dark-400 mb-6">
                            {isCountingDown
                                ? 'Look at something 20 feet away'
                                : 'Follow the 20-20-20 rule to reduce eye strain'
                            }
                        </p>

                        {isCountingDown ? (
                            <div className="mb-6">
                                <div className="text-6xl font-bold text-primary-400 mb-4">
                                    {countdown}
                                </div>
                                <p className="text-dark-500 text-sm">seconds remaining</p>

                                {/* Circular progress */}
                                <div className="relative w-32 h-32 mx-auto mt-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-dark-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={2 * Math.PI * 56}
                                            strokeDashoffset={2 * Math.PI * 56 * (1 - countdown / 20)}
                                            className="text-primary-500 transition-all duration-1000"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-dark-700 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-primary-400">20</div>
                                        <div className="text-xs text-dark-500">minutes</div>
                                    </div>
                                    <div className="bg-dark-700 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-primary-400">20</div>
                                        <div className="text-xs text-dark-500">feet away</div>
                                    </div>
                                    <div className="bg-dark-700 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-primary-400">20</div>
                                        <div className="text-xs text-dark-500">seconds</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            {!isCountingDown && (
                                <>
                                    <button
                                        onClick={skipBreak}
                                        className="px-6 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Skip
                                    </button>
                                    <button
                                        onClick={startBreak}
                                        className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Start Break
                                    </button>
                                </>
                            )}
                            {isCountingDown && (
                                <button
                                    onClick={skipBreak}
                                    className="px-6 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-colors"
                                >
                                    Done Early
                                </button>
                            )}
                        </div>

                        <p className="text-dark-600 text-xs mt-6">
                            💡 Tip: Blink often during the break to lubricate your eyes
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
