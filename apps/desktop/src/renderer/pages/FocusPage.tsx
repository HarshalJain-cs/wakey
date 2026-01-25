import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Volume2, VolumeX, Settings2, ChevronRight } from 'lucide-react';
import { audioService } from '../services/audio-service';
import { FocusPreset, pomodoroService, DEFAULT_PRESETS } from '../services/pomodoro-service';
import CustomTimerModal from '../components/CustomTimerModal';

interface TimerState {
    isRunning: boolean;
    timeRemaining: number;
    mode: 'focus' | 'break';
    sessionType: string;
    sessionId: number | null;
    distractionCount: number;
    currentCycle: number;
    totalCycles: number;
    breakIntervalRemaining: number | null;
}

export default function FocusPage() {
    const [timer, setTimer] = useState<TimerState>({
        isRunning: false,
        timeRemaining: 25 * 60,
        mode: 'focus',
        sessionType: 'Pomodoro',
        sessionId: null,
        distractionCount: 0,
        currentCycle: 1,
        totalCycles: 1,
        breakIntervalRemaining: null,
    });
    const [selectedPreset, setSelectedPreset] = useState<FocusPreset>(DEFAULT_PRESETS[0]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [sessionsToday, setSessionsToday] = useState(0);
    const [focusToday, setFocusToday] = useState(0);
    const [showCustomModal, setShowCustomModal] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        if (!window.wakey) return;
        try {
            const stats = await window.wakey.getTodayStats();
            setSessionsToday(stats.sessions);
            setFocusToday(stats.focusTime);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = useCallback(async () => {
        if (!window.wakey) {
            setTimer(prev => ({ ...prev, isRunning: true, distractionCount: 0 }));
            return;
        }
        const sessionId = await window.wakey.startFocusSession(
            timer.mode,
            Math.floor(timer.timeRemaining / 60)
        );

        // Initialize break interval timer if configured
        const breakIntervalRemaining = selectedPreset.breakInterval > 0 && timer.mode === 'focus'
            ? selectedPreset.breakInterval * 60
            : null;

        setTimer(prev => ({
            ...prev,
            isRunning: true,
            sessionId,
            distractionCount: 0,
            breakIntervalRemaining,
        }));
    }, [timer.mode, timer.timeRemaining, selectedPreset.breakInterval]);

    const pauseTimer = useCallback(() => {
        setTimer(prev => ({ ...prev, isRunning: false }));
    }, []);

    const resetTimer = useCallback(() => {
        setTimer(prev => ({
            ...prev,
            isRunning: false,
            timeRemaining: (prev.mode === 'focus' ? selectedPreset.focusDuration : selectedPreset.breakDuration) * 60,
            sessionId: null,
            distractionCount: 0,
            currentCycle: 1,
            breakIntervalRemaining: null,
        }));
    }, [selectedPreset]);

    const selectPreset = (preset: FocusPreset) => {
        setSelectedPreset(preset);
        setTimer(prev => ({
            ...prev,
            sessionType: preset.name,
            timeRemaining: (prev.mode === 'focus' ? preset.focusDuration : preset.breakDuration) * 60,
            isRunning: false,
            sessionId: null,
            currentCycle: 1,
            totalCycles: preset.cycles,
            breakIntervalRemaining: null,
        }));
    };

    const handleCustomStart = (preset: FocusPreset) => {
        setSelectedPreset(preset);
        setTimer(prev => ({
            ...prev,
            sessionType: preset.name,
            timeRemaining: preset.focusDuration * 60,
            mode: 'focus',
            isRunning: false,
            sessionId: null,
            currentCycle: 1,
            totalCycles: preset.cycles,
            breakIntervalRemaining: null,
        }));
    };

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer.isRunning && timer.timeRemaining > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    const newTimeRemaining = prev.timeRemaining - 1;
                    let newBreakIntervalRemaining = prev.breakIntervalRemaining;

                    // Check for interval break
                    if (newBreakIntervalRemaining !== null && prev.mode === 'focus') {
                        newBreakIntervalRemaining--;
                        if (newBreakIntervalRemaining <= 0 && newTimeRemaining > 0) {
                            // Trigger interval break notification
                            if (soundEnabled) {
                                audioService.playEffect('break-start');
                                new Notification('Quick Break Time!', {
                                    body: 'Take a 2-minute stretch break.',
                                });
                            }
                            // Reset interval timer
                            newBreakIntervalRemaining = selectedPreset.breakInterval * 60;
                        }
                    }

                    return {
                        ...prev,
                        timeRemaining: newTimeRemaining,
                        breakIntervalRemaining: newBreakIntervalRemaining,
                    };
                });
            }, 1000);
        } else if (timer.timeRemaining === 0 && timer.sessionId) {
            // Session/cycle complete
            const quality = Math.max(0, 100 - timer.distractionCount * 10);
            if (window.wakey) {
                window.wakey.endFocusSession(timer.sessionId, quality, timer.distractionCount);
            }

            if (timer.mode === 'focus') {
                // Focus cycle completed
                if (timer.currentCycle < timer.totalCycles) {
                    // More cycles remaining - start break
                    if (soundEnabled) {
                        audioService.playEffect('timer-complete');
                        new Notification('Focus Cycle Complete!', {
                            body: `Cycle ${timer.currentCycle}/${timer.totalCycles} done. Time for a break!`,
                        });
                    }

                    setTimer(prev => ({
                        ...prev,
                        isRunning: false,
                        mode: 'break',
                        timeRemaining: selectedPreset.breakDuration * 60,
                        sessionId: null,
                        breakIntervalRemaining: null,
                    }));
                } else {
                    // All cycles completed
                    if (soundEnabled) {
                        audioService.playEffect('session-complete');
                        new Notification('All Cycles Complete!', {
                            body: `Great work! You completed ${timer.totalCycles} focus cycle${timer.totalCycles > 1 ? 's' : ''}.`,
                        });
                    }

                    setTimer(prev => ({
                        ...prev,
                        isRunning: false,
                        mode: 'focus',
                        timeRemaining: selectedPreset.focusDuration * 60,
                        sessionId: null,
                        currentCycle: 1,
                        breakIntervalRemaining: null,
                    }));
                }
            } else {
                // Break completed - start next focus cycle
                if (soundEnabled) {
                    audioService.playEffect('break-end');
                    new Notification('Break Over!', {
                        body: `Ready for cycle ${timer.currentCycle + 1}/${timer.totalCycles}?`,
                    });
                }

                setTimer(prev => ({
                    ...prev,
                    isRunning: false,
                    mode: 'focus',
                    timeRemaining: selectedPreset.focusDuration * 60,
                    sessionId: null,
                    currentCycle: prev.currentCycle + 1,
                    breakIntervalRemaining: null,
                }));
            }

            loadStats();
        }

        return () => clearInterval(interval);
    }, [timer.isRunning, timer.timeRemaining, timer.sessionId, timer.distractionCount, timer.mode, timer.currentCycle, timer.totalCycles, selectedPreset, soundEnabled]);

    // Listen for distractions
    useEffect(() => {
        if (!window.wakey) return;

        window.wakey.onDistractionDetected(() => {
            if (timer.isRunning && timer.mode === 'focus') {
                setTimer(prev => ({
                    ...prev,
                    distractionCount: prev.distractionCount + 1,
                }));
            }
        });

        return () => {
            if (window.wakey) {
                window.wakey.removeAllListeners('distraction-detected');
            }
        };
    }, [timer.isRunning, timer.mode]);

    const totalSeconds = (timer.mode === 'focus' ? selectedPreset.focusDuration : selectedPreset.breakDuration) * 60;
    const progress = ((totalSeconds - timer.timeRemaining) / totalSeconds) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {timer.mode === 'focus' ? 'Focus Mode' : 'Break Time'}
                </h1>
                <p className="text-dark-400">
                    {timer.mode === 'focus'
                        ? 'Stay focused and minimize distractions'
                        : 'Take a break, stretch, and recharge'}
                </p>
                {timer.totalCycles > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                        {Array.from({ length: timer.totalCycles }, (_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    i < timer.currentCycle
                                        ? 'bg-primary-500'
                                        : i === timer.currentCycle - 1 && timer.mode === 'focus'
                                        ? 'bg-primary-500 animate-pulse'
                                        : 'bg-dark-600'
                                }`}
                            />
                        ))}
                        <span className="text-dark-400 text-sm ml-2">
                            Cycle {timer.currentCycle}/{timer.totalCycles}
                        </span>
                    </div>
                )}
            </div>

            {/* Timer Circle */}
            <div className="flex justify-center mb-8">
                <div className="relative w-72 h-72">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="144" cy="144" r="130"
                            fill="none" stroke="#1e293b" strokeWidth="12"
                        />
                        <circle
                            cx="144" cy="144" r="130"
                            fill="none"
                            stroke={timer.mode === 'focus' ? '#14b8a6' : '#f59e0b'}
                            strokeWidth="12"
                            strokeDasharray={2 * Math.PI * 130}
                            strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-bold text-white font-mono mb-2">
                            {formatTime(timer.timeRemaining)}
                        </div>
                        <div className="text-dark-400">{timer.sessionType}</div>
                        {timer.isRunning && timer.distractionCount > 0 && (
                            <div className="text-red-400 text-sm mt-2">
                                {timer.distractionCount} distraction{timer.distractionCount > 1 ? 's' : ''}
                            </div>
                        )}
                        {timer.breakIntervalRemaining !== null && timer.mode === 'focus' && timer.isRunning && (
                            <div className="text-yellow-400 text-xs mt-1">
                                Break in {Math.floor(timer.breakIntervalRemaining / 60)}m
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={timer.isRunning ? pauseTimer : startTimer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${timer.isRunning
                        ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                >
                    {timer.isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="w-14 h-14 rounded-full bg-dark-700 text-dark-400 hover:bg-dark-600 flex items-center justify-center transition-all"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-14 h-14 rounded-full bg-dark-700 text-dark-400 hover:bg-dark-600 flex items-center justify-center transition-all"
                >
                    {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
                {DEFAULT_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        disabled={timer.isRunning}
                        className={`px-5 py-3 rounded-xl transition-all ${selectedPreset.id === preset.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700 disabled:opacity-50'
                            }`}
                    >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs opacity-75">
                            {preset.focusDuration}m × {preset.cycles} cycle{preset.cycles > 1 ? 's' : ''}
                        </div>
                    </button>
                ))}
                <button
                    onClick={() => setShowCustomModal(true)}
                    disabled={timer.isRunning}
                    className="px-5 py-3 rounded-xl bg-dark-800 text-dark-400 hover:bg-dark-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    <Settings2 className="w-4 h-4" />
                    <div>
                        <div className="font-medium">Custom</div>
                        <div className="text-xs opacity-75">5-120 min</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center gap-2 mb-8">
                <button
                    onClick={() => !timer.isRunning && setTimer(prev => ({
                        ...prev,
                        mode: 'focus',
                        timeRemaining: selectedPreset.focusDuration * 60,
                    }))}
                    disabled={timer.isRunning}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${timer.mode === 'focus'
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-dark-800 text-dark-400'
                        }`}
                >
                    <Target className="w-4 h-4" />
                    Focus
                </button>
                <button
                    onClick={() => !timer.isRunning && setTimer(prev => ({
                        ...prev,
                        mode: 'break',
                        timeRemaining: selectedPreset.breakDuration * 60,
                    }))}
                    disabled={timer.isRunning}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${timer.mode === 'break'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-dark-800 text-dark-400'
                        }`}
                >
                    <Coffee className="w-4 h-4" />
                    Break
                </button>
            </div>

            {/* Stats */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-white mb-4">Today's Progress</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-900 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-white">{sessionsToday}</div>
                        <div className="text-dark-400 text-sm">Sessions</div>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-white">
                            {Math.floor(focusToday / 60)}h {focusToday % 60}m
                        </div>
                        <div className="text-dark-400 text-sm">Focus Time</div>
                    </div>
                </div>
            </div>

            {/* Custom Timer Modal */}
            <CustomTimerModal
                isOpen={showCustomModal}
                onClose={() => setShowCustomModal(false)}
                onStart={handleCustomStart}
                currentPreset={selectedPreset}
            />
        </div>
    );
}
