import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Clock, RefreshCw, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';

interface EyeStrainState {
    enabled: boolean;
    timeUntilBreak: number; // seconds until 20-20-20 reminder
    isBreakActive: boolean;
    breakTimeRemaining: number; // 20 seconds break
    todayBreaksTaken: number;
    lastBreakTime: Date | null;
}

const WORK_INTERVAL = 20 * 60; // 20 minutes in seconds
const BREAK_DURATION = 20; // 20 seconds

// Circular countdown for work interval
function WorkCountdown({ seconds, total }: { seconds: number; total: number }) {
    const circumference = 2 * Math.PI * 28;
    const progress = seconds / total;
    const strokeDashoffset = circumference * progress;

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle
                    cx="30" cy="30" r="28"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="4"
                />
                <circle
                    cx="30" cy="30" r="28"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono text-white">{formatTime(seconds)}</span>
            </div>
        </div>
    );
}

// Break screen overlay
function BreakOverlay({ timeRemaining, onSkip }: { timeRemaining: number; onSkip: () => void }) {
    return (
        <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (timeRemaining / BREAK_DURATION)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Eye className="w-10 h-10 text-green-400 mb-1" />
                        <span className="text-3xl font-bold text-white">{timeRemaining}</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    👁️ Eye Break Time!
                </h2>
                <p className="text-dark-400 mb-6">
                    Look at something <span className="text-green-400 font-semibold">20 feet away</span> for 20 seconds
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors text-sm"
                    >
                        Skip
                    </button>
                </div>

                <p className="text-xs text-dark-500 mt-6">
                    The 20-20-20 rule helps prevent eye strain and fatigue
                </p>
            </div>
        </div>
    );
}

export default function EyeStrainTimer() {
    const [state, setState] = useState<EyeStrainState>({
        enabled: true,
        timeUntilBreak: WORK_INTERVAL,
        isBreakActive: false,
        breakTimeRemaining: BREAK_DURATION,
        todayBreaksTaken: 0,
        lastBreakTime: null
    });

    // Timer tick
    useEffect(() => {
        if (!state.enabled) return;

        const interval = setInterval(() => {
            setState(prev => {
                if (prev.isBreakActive) {
                    // Counting down break time
                    if (prev.breakTimeRemaining <= 1) {
                        // Break complete
                        return {
                            ...prev,
                            isBreakActive: false,
                            breakTimeRemaining: BREAK_DURATION,
                            timeUntilBreak: WORK_INTERVAL,
                            todayBreaksTaken: prev.todayBreaksTaken + 1,
                            lastBreakTime: new Date()
                        };
                    }
                    return {
                        ...prev,
                        breakTimeRemaining: prev.breakTimeRemaining - 1
                    };
                } else {
                    // Counting down work time
                    if (prev.timeUntilBreak <= 1) {
                        // Time for a break!
                        return {
                            ...prev,
                            isBreakActive: true
                        };
                    }
                    return {
                        ...prev,
                        timeUntilBreak: prev.timeUntilBreak - 1
                    };
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state.enabled]);

    const toggleEnabled = useCallback(() => {
        setState(prev => ({
            ...prev,
            enabled: !prev.enabled,
            timeUntilBreak: WORK_INTERVAL // Reset timer when toggling
        }));
    }, []);

    const skipBreak = useCallback(() => {
        setState(prev => ({
            ...prev,
            isBreakActive: false,
            breakTimeRemaining: BREAK_DURATION,
            timeUntilBreak: WORK_INTERVAL
        }));
    }, []);

    const takeBreakNow = useCallback(() => {
        setState(prev => ({
            ...prev,
            isBreakActive: true
        }));
    }, []);

    const formatLastBreak = () => {
        if (!state.lastBreakTime) return 'None today';
        const mins = Math.floor((Date.now() - state.lastBreakTime.getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <>
            {/* Break overlay when active */}
            {state.isBreakActive && (
                <BreakOverlay
                    timeRemaining={state.breakTimeRemaining}
                    onSkip={skipBreak}
                />
            )}

            {/* Widget */}
            <div className="widget-card h-full">
                <div className="widget-card-header">
                    <span className="widget-card-title flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary-400" />
                        Eye Strain Prevention
                    </span>
                    <button
                        onClick={toggleEnabled}
                        className={`p-1.5 rounded-lg transition-colors ${state.enabled
                                ? 'bg-primary-500/20 text-primary-400'
                                : 'bg-dark-700 text-dark-400'
                            }`}
                    >
                        {state.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Timer Section */}
                    <div className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-lg">
                        {state.enabled ? (
                            <>
                                <WorkCountdown seconds={state.timeUntilBreak} total={WORK_INTERVAL} />
                                <div className="flex-1">
                                    <div className="text-sm text-dark-400">Next eye break</div>
                                    <div className="text-lg font-semibold text-white">
                                        {Math.ceil(state.timeUntilBreak / 60)} minutes
                                    </div>
                                    <button
                                        onClick={takeBreakNow}
                                        className="mt-1 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        <Play className="w-3 h-3" />
                                        Take break now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 text-dark-400">
                                <EyeOff className="w-6 h-6" />
                                <div>
                                    <div className="text-sm">Eye strain prevention disabled</div>
                                    <div className="text-xs text-dark-500">Click to enable 20-20-20 rule</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-dark-900/50 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-400">{state.todayBreaksTaken}</div>
                            <div className="text-xs text-dark-400">Breaks Today</div>
                        </div>
                        <div className="p-2 bg-dark-900/50 rounded-lg text-center">
                            <div className="text-sm font-medium text-white">{formatLastBreak()}</div>
                            <div className="text-xs text-dark-400">Last Break</div>
                        </div>
                    </div>

                    {/* 20-20-20 Rule Explanation */}
                    <div className="p-3 bg-gradient-to-r from-primary-500/10 to-blue-500/10 rounded-lg border border-primary-500/20">
                        <div className="flex items-start gap-2">
                            <RefreshCw className="w-4 h-4 text-primary-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-white">20-20-20 Rule</div>
                                <div className="text-xs text-dark-400 mt-0.5">
                                    Every <b>20 minutes</b>, look at something <b>20 feet</b> away for <b>20 seconds</b>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievement for today */}
                    {state.todayBreaksTaken >= 6 && (
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">Great eye health today! 🎉</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
