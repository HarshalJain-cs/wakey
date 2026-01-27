import { useState, useEffect } from 'react';
import { X, Clock, Coffee, Repeat, Save, Trash2 } from 'lucide-react';
import { FocusPreset, pomodoroService } from '../services/pomodoro-service';

interface CustomTimerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (preset: FocusPreset) => void;
    currentPreset?: FocusPreset;
}

export default function CustomTimerModal({
    isOpen,
    onClose,
    onStart,
    currentPreset,
}: CustomTimerModalProps) {
    const [name, setName] = useState('Custom Session');
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakInterval, setBreakInterval] = useState(0);
    const [breakDuration, setBreakDuration] = useState(5);
    const [cycles, setCycles] = useState(1);
    const [savedPresets, setSavedPresets] = useState<FocusPreset[]>([]);
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [presetName, setPresetName] = useState('');

    useEffect(() => {
        if (currentPreset) {
            setName(currentPreset.name);
            setFocusDuration(currentPreset.focusDuration);
            setBreakInterval(currentPreset.breakInterval);
            setBreakDuration(currentPreset.breakDuration);
            setCycles(currentPreset.cycles);
        }
    }, [currentPreset]);

    useEffect(() => {
        const allPresets = pomodoroService.getPresets();
        setSavedPresets(allPresets.filter(p => !p.isDefault));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleStart = () => {
        const preset: FocusPreset = {
            id: 'custom-temp',
            name,
            focusDuration,
            breakInterval,
            breakDuration,
            cycles,
        };
        onStart(preset);
        onClose();
    };

    const handleSavePreset = async () => {
        if (!presetName.trim()) return;

        const newPreset = await pomodoroService.savePreset({
            name: presetName.trim(),
            focusDuration,
            breakInterval,
            breakDuration,
            cycles,
        });

        setSavedPresets(prev => [...prev, newPreset]);
        setPresetName('');
        setShowSaveForm(false);
    };

    const handleDeletePreset = async (id: string) => {
        await pomodoroService.deletePreset(id);
        setSavedPresets(prev => prev.filter(p => p.id !== id));
    };

    const handleLoadPreset = (preset: FocusPreset) => {
        setName(preset.name);
        setFocusDuration(preset.focusDuration);
        setBreakInterval(preset.breakInterval);
        setBreakDuration(preset.breakDuration);
        setCycles(preset.cycles);
    };

    const totalTime = pomodoroService.calculateTotalTime({
        id: '',
        name: '',
        focusDuration,
        breakInterval,
        breakDuration,
        cycles,
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-800 rounded-2xl w-full max-w-lg p-6 border border-dark-700 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Custom Focus Timer</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Focus Duration */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                        <Clock className="w-4 h-4" />
                        Focus Duration
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={focusDuration}
                            onChange={(e) => setFocusDuration(Number(e.target.value))}
                            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                        <div className="w-20 bg-dark-900 rounded-lg px-3 py-2 text-center">
                            <span className="text-white font-mono text-lg">{focusDuration}</span>
                            <span className="text-dark-400 text-sm ml-1">min</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>5 min</span>
                        <span>120 min</span>
                    </div>
                </div>

                {/* Break Interval (during session) */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                        <Coffee className="w-4 h-4" />
                        Break Interval (during session)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="60"
                            step="5"
                            value={breakInterval}
                            onChange={(e) => setBreakInterval(Number(e.target.value))}
                            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <div className="w-20 bg-dark-900 rounded-lg px-3 py-2 text-center">
                            <span className="text-white font-mono text-lg">{breakInterval}</span>
                            <span className="text-dark-400 text-sm ml-1">min</span>
                        </div>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">
                        {breakInterval === 0 ? 'No breaks during focus' : `Short break every ${breakInterval} minutes`}
                    </p>
                </div>

                {/* Break Duration (after session) */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                        <Coffee className="w-4 h-4" />
                        Break Duration (after cycle)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(Number(e.target.value))}
                            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <div className="w-20 bg-dark-900 rounded-lg px-3 py-2 text-center">
                            <span className="text-white font-mono text-lg">{breakDuration}</span>
                            <span className="text-dark-400 text-sm ml-1">min</span>
                        </div>
                    </div>
                </div>

                {/* Pomodoro Cycles */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                        <Repeat className="w-4 h-4" />
                        Focus Cycles
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                            <button
                                key={c}
                                onClick={() => setCycles(c)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                    cycles === c
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total Time Summary */}
                <div className="bg-dark-900 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-dark-400">Total Session Time</span>
                        <span className="text-xl font-bold text-primary-400">
                            {pomodoroService.formatDuration(totalTime)}
                        </span>
                    </div>
                    <div className="text-sm text-dark-500 mt-2">
                        {cycles} cycle{cycles > 1 ? 's' : ''} × {focusDuration}min focus
                        {cycles > 1 && ` + ${cycles - 1} × ${breakDuration}min break`}
                    </div>
                </div>

                {/* Saved Presets */}
                {savedPresets.length > 0 && (
                    <div className="mb-6">
                        <label className="text-sm font-medium text-dark-300 mb-2 block">
                            Your Presets
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {savedPresets.map((preset) => (
                                <div
                                    key={preset.id}
                                    className="flex items-center gap-1 bg-dark-700 rounded-lg px-3 py-1.5"
                                >
                                    <button
                                        onClick={() => handleLoadPreset(preset)}
                                        className="text-sm text-dark-300 hover:text-white transition-colors"
                                    >
                                        {preset.name}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePreset(preset.id)}
                                        className="p-1 text-dark-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Preset Form */}
                {showSaveForm ? (
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Preset name..."
                            className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            autoFocus
                        />
                        <button
                            onClick={handleSavePreset}
                            disabled={!presetName.trim()}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setShowSaveForm(false)}
                            className="px-4 py-2 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowSaveForm(true)}
                        className="flex items-center gap-2 text-sm text-dark-400 hover:text-white mb-6 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save as preset
                    </button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium transition-colors"
                    >
                        Start Focus
                    </button>
                </div>
            </div>
        </div>
    );
}
