'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import WidgetCard from './WidgetCard';

type TimerMode = 'focus' | 'break';

interface TimerPreset {
  name: string;
  focusMinutes: number;
  breakMinutes: number;
}

const PRESETS: TimerPreset[] = [
  { name: 'Pomodoro', focusMinutes: 25, breakMinutes: 5 },
  { name: 'Deep Work', focusMinutes: 45, breakMinutes: 10 },
  { name: 'Long Focus', focusMinutes: 90, breakMinutes: 15 },
];

export default function FocusTimerWidget() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const currentPreset = PRESETS[selectedPreset];

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode;
    const minutes = targetMode === 'focus'
      ? currentPreset.focusMinutes
      : currentPreset.breakMinutes;
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    if (newMode) setMode(newMode);
  }, [mode, currentPreset]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'focus') {
        setSessionsCompleted((prev) => prev + 1);
        // Auto-switch to break
        setMode('break');
        setTimeLeft(currentPreset.breakMinutes * 60);
        // Play notification sound (if available)
        if (typeof window !== 'undefined' && 'Notification' in window) {
          new Notification('Focus session complete!', {
            body: 'Time for a break.',
            icon: '/favicon.ico',
          });
        }
      } else {
        // Break complete, ready for next focus
        setMode('focus');
        setTimeLeft(currentPreset.focusMinutes * 60);
        if (typeof window !== 'undefined' && 'Notification' in window) {
          new Notification('Break over!', {
            body: 'Ready to focus again?',
            icon: '/favicon.ico',
          });
        }
      }
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, currentPreset]);

  useEffect(() => {
    // Reset timer when preset changes
    resetTimer();
  }, [selectedPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTimer = () => {
    if (!isRunning && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((currentPreset.focusMinutes * 60 - timeLeft) / (currentPreset.focusMinutes * 60)) * 100
    : ((currentPreset.breakMinutes * 60 - timeLeft) / (currentPreset.breakMinutes * 60)) * 100;

  return (
    <WidgetCard
      title="Focus Timer"
      icon={<Timer className="w-5 h-5" />}
      action={
        <span className="text-xs text-dark-400">
          {sessionsCompleted} sessions today
        </span>
      }
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => resetTimer('focus')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
          }`}
        >
          <Brain className="w-4 h-4" />
          Focus
        </button>
        <button
          onClick={() => resetTimer('break')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'break'
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center py-8">
        {/* Progress Ring */}
        <svg className="absolute w-40 h-40 -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-dark-700"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={mode === 'focus' ? '#14b8a6' : '#22c55e'} />
              <stop offset="100%" stopColor={mode === 'focus' ? '#8b5cf6' : '#14b8a6'} />
            </linearGradient>
          </defs>
        </svg>

        {/* Time */}
        <div className="text-center z-10">
          <span className="text-4xl font-bold text-white font-mono">
            {formatTime(timeLeft)}
          </span>
          <p className="text-sm text-dark-400 mt-1 capitalize">{mode} Time</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => resetTimer()}
          className="p-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTimer}
          className={`p-4 rounded-full text-white transition-colors ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-teal-500 to-purple-500 hover:opacity-90'
              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90'
          }`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <div className="w-11" /> {/* Spacer for symmetry */}
      </div>

      {/* Preset Selector */}
      <div className="flex gap-2 mt-4">
        {PRESETS.map((preset, i) => (
          <button
            key={preset.name}
            onClick={() => setSelectedPreset(i)}
            className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
              selectedPreset === i
                ? 'bg-dark-700 text-white'
                : 'text-dark-500 hover:text-dark-300'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}
