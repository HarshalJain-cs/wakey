import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Volume2, VolumeX } from 'lucide-react';

interface TimerState {
    isRunning: boolean;
    timeRemaining: number;
    mode: 'focus' | 'break';
    sessionType: string;
    sessionId: number | null;
    distractionCount: number;
}

const SESSION_PRESETS = [
    { label: 'Pomodoro', focus: 25, break: 5 },
    { label: 'Deep Work', focus: 45, break: 10 },
    { label: 'Long Focus', focus: 90, break: 15 },
];

export default function FocusPage() {
    const [timer, setTimer] = useState<TimerState>({
        isRunning: false,
        timeRemaining: 25 * 60,
        mode: 'focus',
        sessionType: 'Pomodoro',
        sessionId: null,
        distractionCount: 0,
    });
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [sessionsToday, setSessionsToday] = useState(0);
    const [focusToday, setFocusToday] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
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
        const sessionId = await window.wakey.startFocusSession(
            timer.mode,
            Math.floor(timer.timeRemaining / 60)
        );

        setTimer(prev => ({
            ...prev,
            isRunning: true,
            sessionId,
            distractionCount: 0,
        }));
    }, [timer.mode, timer.timeRemaining]);

    const pauseTimer = useCallback(() => {
        setTimer(prev => ({ ...prev, isRunning: false }));
    }, []);

    const resetTimer = useCallback(() => {
        const preset = SESSION_PRESETS[selectedPreset];
        setTimer(prev => ({
            ...prev,
            isRunning: false,
            timeRemaining: (prev.mode === 'focus' ? preset.focus : preset.break) * 60,
            sessionId: null,
            distractionCount: 0,
        }));
    }, [selectedPreset]);

    const selectPreset = (index: number) => {
        setSelectedPreset(index);
        const preset = SESSION_PRESETS[index];
        setTimer(prev => ({
            ...prev,
            sessionType: preset.label,
            timeRemaining: (prev.mode === 'focus' ? preset.focus : preset.break) * 60,
            isRunning: false,
            sessionId: null,
        }));
    };

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer.isRunning && timer.timeRemaining > 0) {
            interval = setInterval(() => {
                setTimer(prev => ({
                    ...prev,
                    timeRemaining: prev.timeRemaining - 1,
                }));
            }, 1000);
        } else if (timer.timeRemaining === 0 && timer.sessionId) {
            // Session complete
            const quality = Math.max(0, 100 - timer.distractionCount * 10);
            window.wakey.endFocusSession(timer.sessionId, quality, timer.distractionCount);

            if (soundEnabled) {
                // Play notification sound
                new Notification(timer.mode === 'focus' ? '🎉 Focus Complete!' : '☕ Break Over!', {
                    body: timer.mode === 'focus' ? 'Time for a break!' : 'Ready to focus again?',
                });
            }

            // Switch mode
            const preset = SESSION_PRESETS[selectedPreset];
            setTimer(prev => ({
                ...prev,
                isRunning: false,
                mode: prev.mode === 'focus' ? 'break' : 'focus',
                timeRemaining: (prev.mode === 'focus' ? preset.break : preset.focus) * 60,
                sessionId: null,
            }));

            loadStats();
        }

        return () => clearInterval(interval);
    }, [timer.isRunning, timer.timeRemaining, timer.sessionId, timer.distractionCount, timer.mode, selectedPreset, soundEnabled]);

    // Listen for distractions
    useEffect(() => {
        window.wakey.onDistractionDetected(() => {
            if (timer.isRunning && timer.mode === 'focus') {
                setTimer(prev => ({
                    ...prev,
                    distractionCount: prev.distractionCount + 1,
                }));
            }
        });

        return () => {
            window.wakey.removeAllListeners('distraction-detected');
        };
    }, [timer.isRunning, timer.mode]);

    const preset = SESSION_PRESETS[selectedPreset];
    const totalSeconds = (timer.mode === 'focus' ? preset.focus : preset.break) * 60;
    const progress = ((totalSeconds - timer.timeRemaining) / totalSeconds) * 100;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {timer.mode === 'focus' ? '🎯 Focus Mode' : '☕ Break Time'}
                </h1>
                <p className="text-dark-400">
                    {timer.mode === 'focus'
                        ? 'Stay focused and minimize distractions'
                        : 'Take a break, stretch, and recharge'}
                </p>
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
            <div className="flex justify-center gap-3 mb-8">
                {SESSION_PRESETS.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => selectPreset(i)}
                        disabled={timer.isRunning}
                        className={`px-6 py-3 rounded-xl transition-all ${selectedPreset === i
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 disabled:opacity-50'
                            }`}
                    >
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs opacity-75">{p.focus}m focus / {p.break}m break</div>
                    </button>
                ))}
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center gap-2 mb-8">
                <button
                    onClick={() => !timer.isRunning && setTimer(prev => ({
                        ...prev,
                        mode: 'focus',
                        timeRemaining: preset.focus * 60,
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
                        timeRemaining: preset.break * 60,
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
        </div>
    );
}
