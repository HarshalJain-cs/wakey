import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
const SESSION_DURATIONS = {
    '25': 25 * 60,
    '30': 30 * 60,
    '45': 45 * 60,
    '60': 60 * 60,
    '90': 90 * 60,
};
export default function FocusTimerWidget() {
    const [timer, setTimer] = useState({
        isRunning: false,
        timeRemaining: SESSION_DURATIONS['25'],
        mode: 'focus',
        sessionType: '25',
        sessionId: null,
        distractionCount: 0,
    });
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const startTimer = useCallback(async () => {
        // Start session in database
        const sessionId = await window.wakey.startFocusSession(timer.mode, Math.floor(timer.timeRemaining / 60));
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
    const toggleTimer = useCallback(() => {
        if (timer.isRunning) {
            pauseTimer();
        }
        else {
            startTimer();
        }
    }, [timer.isRunning, startTimer, pauseTimer]);
    const resetTimer = useCallback(() => {
        setTimer(prev => ({
            ...prev,
            isRunning: false,
            timeRemaining: SESSION_DURATIONS[prev.sessionType],
            sessionId: null,
            distractionCount: 0,
        }));
    }, []);
    const selectDuration = useCallback((type) => {
        setTimer(prev => ({
            ...prev,
            sessionType: type,
            timeRemaining: SESSION_DURATIONS[type],
            isRunning: false,
            sessionId: null,
        }));
    }, []);
    // Handle timer countdown
    useEffect(() => {
        let interval;
        if (timer.isRunning && timer.timeRemaining > 0) {
            interval = setInterval(() => {
                setTimer(prev => ({
                    ...prev,
                    timeRemaining: prev.timeRemaining - 1,
                }));
            }, 1000);
        }
        else if (timer.timeRemaining === 0 && timer.sessionId) {
            // Session complete
            const quality = Math.max(0, 100 - timer.distractionCount * 10);
            window.wakey.endFocusSession(timer.sessionId, quality, timer.distractionCount);
            // Switch mode
            setTimer(prev => ({
                ...prev,
                isRunning: false,
                mode: prev.mode === 'focus' ? 'break' : 'focus',
                timeRemaining: prev.mode === 'focus' ? 5 * 60 : SESSION_DURATIONS[prev.sessionType],
                sessionId: null,
            }));
            // Show notification
            new Notification(timer.mode === 'focus' ? '🎉 Focus Complete!' : '☕ Break Over!', {
                body: timer.mode === 'focus' ? 'Time for a break!' : 'Ready to focus again?',
            });
        }
        return () => clearInterval(interval);
    }, [timer.isRunning, timer.timeRemaining, timer.sessionId, timer.distractionCount, timer.mode, timer.sessionType]);
    // Listen for distractions
    useEffect(() => {
        window.wakey.onDistractionDetected(() => {
            if (timer.isRunning) {
                setTimer(prev => ({
                    ...prev,
                    distractionCount: prev.distractionCount + 1,
                }));
            }
        });
        // Listen for focus start command from tray
        window.wakey.onFocusStart(() => {
            if (!timer.isRunning) {
                startTimer();
            }
        });
        return () => {
            window.wakey.removeAllListeners('distraction-detected');
            window.wakey.removeAllListeners('focus-start');
        };
    }, [timer.isRunning, startTimer]);
    const progress = timer.mode === 'focus'
        ? ((SESSION_DURATIONS[timer.sessionType] - timer.timeRemaining) / SESSION_DURATIONS[timer.sessionType]) * 100
        : ((5 * 60 - timer.timeRemaining) / (5 * 60)) * 100;
    return (<div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title">
                    {timer.mode === 'focus' ? '🎯 Focus Timer' : '☕ Break Time'}
                </span>
                {timer.isRunning && timer.distractionCount > 0 && (<span className="text-xs text-red-400">
                        {timer.distractionCount} distraction{timer.distractionCount > 1 ? 's' : ''}
                    </span>)}
            </div>

            <div className="flex flex-col items-center py-4">
                {/* Timer display */}
                <div className={`relative w-40 h-40 rounded-full flex items-center justify-center ${timer.isRunning ? 'timer-active' : ''}`}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="8"/>
                        <circle cx="80" cy="80" r="70" fill="none" stroke={timer.mode === 'focus' ? '#14b8a6' : '#f59e0b'} strokeWidth="8" strokeDasharray={2 * Math.PI * 70} strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)} strokeLinecap="round" className="transition-all duration-1000"/>
                    </svg>

                    <div className="text-center z-10">
                        <div className="text-3xl font-bold text-white font-mono">{formatTime(timer.timeRemaining)}</div>
                        <div className="text-xs text-dark-400 mt-1">{timer.mode === 'focus' ? 'Focus Session' : 'Break'}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mt-6">
                    <button onClick={toggleTimer} className={`p-4 rounded-full transition-all ${timer.isRunning
            ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
            : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
                        {timer.isRunning ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
                    </button>

                    <button onClick={resetTimer} className="p-3 rounded-full bg-dark-700 text-dark-400 hover:bg-dark-600 transition-all">
                        <RotateCcw className="w-5 h-5"/>
                    </button>
                </div>

                {/* Duration selection */}
                <div className="flex items-center gap-2 mt-4">
                    {['25', '30', '45', '60', '90'].map((duration) => (<button key={duration} onClick={() => selectDuration(duration)} disabled={timer.isRunning} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${timer.sessionType === duration
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-dark-400 hover:bg-dark-600 disabled:opacity-50'}`}>
                            {duration}m
                        </button>))}
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=FocusTimerWidget.js.map