import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Loader2, Check, AlertCircle } from 'lucide-react';

interface VoiceCommand {
    phrase: string;
    action: string;
    confidence: number;
}

const EXAMPLE_COMMANDS = [
    { phrase: 'Start focus for 25 minutes', action: 'start_focus' },
    { phrase: 'Create task [title]', action: 'create_task' },
    { phrase: 'Take a break', action: 'take_break' },
    { phrase: 'Show my stats', action: 'show_stats' },
    { phrase: 'End session', action: 'end_focus' },
    { phrase: 'Add 10 minutes', action: 'extend_timer' },
];

type ListeningState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export default function VoiceCommandWidget() {
    const [state, setState] = useState<ListeningState>('idle');
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
    const [showExamples, setShowExamples] = useState(false);
    const [volume, setVolume] = useState(0);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const animationRef = useRef<number>();

    // Check for speech recognition support
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const startListening = useCallback(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setState('listening');
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const text = result[0].transcript;

            setTranscript(text);

            if (result.isFinal) {
                processCommand(text, result[0].confidence);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setState('error');
            setTimeout(() => setState('idle'), 2000);
        };

        recognition.onend = () => {
            if (state === 'listening') {
                setState('idle');
            }
        };

        recognitionRef.current = recognition;
        recognition.start();

        // Simulate volume meter (in real app, use AudioContext)
        const animateVolume = () => {
            setVolume(Math.random() * 100);
            animationRef.current = requestAnimationFrame(animateVolume);
        };
        animateVolume();
    }, [isSupported, state]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setVolume(0);
        setState('idle');
    }, []);

    const processCommand = async (text: string, confidence: number) => {
        setState('processing');

        // Simple command matching (in production, use NLP)
        const lowerText = text.toLowerCase();
        let action = 'unknown';

        if (lowerText.includes('focus') && (lowerText.includes('start') || lowerText.includes('begin'))) {
            action = 'start_focus';
            const minutes = lowerText.match(/(\d+)\s*(minute|min)/)?.[1] || '25';
            window.wakey?.startFocusSession?.(parseInt(minutes));
        } else if (lowerText.includes('break') || lowerText.includes('rest')) {
            action = 'take_break';
            window.wakey?.triggerBreak?.();
        } else if (lowerText.includes('end') || lowerText.includes('stop')) {
            action = 'end_focus';
            window.wakey?.stopFocusSession?.();
        } else if (lowerText.includes('task') || lowerText.includes('todo')) {
            action = 'create_task';
            // Extract task title after "task" or "todo"
        } else if (lowerText.includes('stats') || lowerText.includes('statistics')) {
            action = 'show_stats';
        }

        setLastCommand({ phrase: text, action, confidence });
        setState('success');

        setTimeout(() => {
            setState('idle');
            setLastCommand(null);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const getStateUI = () => {
        switch (state) {
            case 'listening':
                return (
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div
                                className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"
                                style={{ transform: `scale(${1 + volume / 200})` }}
                            />
                            <button
                                onClick={stopListening}
                                className="relative p-4 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <Mic className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <p className="text-sm text-dark-300">{transcript || 'Listening...'}</p>
                    </div>
                );
            case 'processing':
                return (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-blue-500/20 rounded-full">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                        <p className="text-sm text-dark-300">Processing "{transcript}"...</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-green-500/20 rounded-full">
                            <Check className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-sm text-green-400">{lastCommand?.phrase}</p>
                        <p className="text-xs text-dark-500">
                            Action: {lastCommand?.action} ({Math.round((lastCommand?.confidence || 0) * 100)}% confidence)
                        </p>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-red-500/20 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-sm text-red-400">Couldn't hear that. Try again.</p>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={startListening}
                            disabled={!isSupported}
                            className={`p-4 rounded-full transition-all ${isSupported
                                    ? 'bg-primary-500 hover:bg-primary-600 hover:scale-105'
                                    : 'bg-dark-600 cursor-not-allowed'
                                }`}
                        >
                            {isSupported ? (
                                <Mic className="w-6 h-6 text-white" />
                            ) : (
                                <MicOff className="w-6 h-6 text-dark-400" />
                            )}
                        </button>
                        <p className="text-sm text-dark-400">
                            {isSupported ? 'Tap to speak' : 'Voice not supported'}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Voice Commands</h3>
                </div>
                <button
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-xs text-primary-400 hover:text-primary-300"
                >
                    {showExamples ? 'Hide examples' : 'Show examples'}
                </button>
            </div>

            {/* Voice UI */}
            <div className="py-6">
                {getStateUI()}
            </div>

            {/* Examples */}
            {showExamples && (
                <div className="mt-4 pt-3 border-t border-dark-700">
                    <p className="text-xs text-dark-500 mb-2">Try saying:</p>
                    <div className="space-y-1.5">
                        {EXAMPLE_COMMANDS.map((cmd, i) => (
                            <div key={i} className="text-xs text-dark-400 flex items-center gap-2">
                                <span className="text-primary-400">•</span>
                                "{cmd.phrase}"
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Add type declarations
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
