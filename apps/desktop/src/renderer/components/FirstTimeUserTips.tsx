import { useState, useEffect } from 'react';
import { X, Lightbulb, ChevronRight, Sparkles } from 'lucide-react';

interface Tip {
    id: string;
    title: string;
    content: string;
    category: 'focus' | 'productivity' | 'shortcuts' | 'wellness' | 'general';
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface FirstTimeUserTipsProps {
    onDismiss?: () => void;
}

// Collection of tips for new users
const ALL_TIPS: Tip[] = [
    {
        id: 'keyboard-shortcut-focus',
        title: 'Quick Focus Session',
        content: 'Press Ctrl+Shift+F anywhere to instantly start a focus session. No need to open the app!',
        category: 'shortcuts'
    },
    {
        id: 'pomodoro-technique',
        title: 'Try the Pomodoro Technique',
        content: 'Work in 25-minute focused bursts with 5-minute breaks. This helps maintain concentration and prevents burnout.',
        category: 'focus'
    },
    {
        id: 'distraction-blocking',
        title: 'Block Distractions',
        content: 'Enable distraction blocking during focus sessions to stay on track. Add apps to your blocklist in Settings.',
        category: 'productivity'
    },
    {
        id: 'daily-streaks',
        title: 'Build Your Streak',
        content: 'Complete at least one focus session every day to build your streak. Longer streaks unlock achievements!',
        category: 'productivity'
    },
    {
        id: 'eye-strain',
        title: 'Protect Your Eyes',
        content: 'Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.',
        category: 'wellness'
    },
    {
        id: 'ai-insights',
        title: 'Enable AI Insights',
        content: 'Add your Groq API key in Settings to unlock AI-powered productivity analysis and personalized recommendations.',
        category: 'general'
    },
    {
        id: 'customize-dashboard',
        title: 'Customize Your Dashboard',
        content: 'Click the "Customize" button to drag and arrange widgets the way you like. Make Wakey truly yours!',
        category: 'general'
    },
    {
        id: 'focus-music',
        title: 'Focus Music',
        content: 'Enable ambient sounds during focus sessions to help you concentrate. Choose from rain, café, forest, and more.',
        category: 'focus'
    }
];

// Tip card component
function TipCard({ tip, onDismiss }: { tip: Tip; onDismiss: () => void }) {
    const getCategoryColor = () => {
        switch (tip.category) {
            case 'focus': return 'from-primary-500/20 to-purple-500/20 border-primary-500/30';
            case 'productivity': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
            case 'shortcuts': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
            case 'wellness': return 'from-pink-500/20 to-rose-500/20 border-pink-500/30';
            case 'general': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
            default: return 'from-dark-700 to-dark-800 border-dark-600';
        }
    };

    const getCategoryIcon = () => {
        switch (tip.category) {
            case 'focus': return '🎯';
            case 'productivity': return '⚡';
            case 'shortcuts': return '⌨️';
            case 'wellness': return '💚';
            case 'general': return '💡';
            default: return '💡';
        }
    };

    return (
        <div className={`relative p-4 rounded-xl border bg-gradient-to-br ${getCategoryColor()} overflow-hidden group`}>
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-xl" />

            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 text-dark-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon()}</span>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white mb-1">{tip.title}</h4>
                    <p className="text-sm text-dark-300 leading-relaxed">{tip.content}</p>
                    {tip.action && (
                        <button
                            onClick={tip.action.onClick}
                            className="mt-3 flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            {tip.action.label}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Floating tip notification
function FloatingTipNotification({ tip, onDismiss, onRead }: {
    tip: Tip;
    onDismiss: () => void;
    onRead: () => void;
}) {
    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slideInRight">
            <div className="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400 shrink-0">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium text-white text-sm">Pro Tip</h4>
                            <button
                                onClick={onDismiss}
                                className="p-1 text-dark-400 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-sm text-dark-300 line-clamp-2">{tip.content}</p>
                        <button
                            onClick={onRead}
                            className="mt-2 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            Learn more
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main tips panel for dashboard
export default function FirstTimeUserTips({ onDismiss }: FirstTimeUserTipsProps) {
    const [visibleTips, setVisibleTips] = useState<Tip[]>([]);
    const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load dismissed tips from storage
        const loadDismissedTips = async () => {
            try {
                const dismissed = await window.wakey?.getSetting('dismissedTips');
                if (dismissed && Array.isArray(dismissed)) {
                    setDismissedTips(new Set(dismissed));
                }
            } catch {
                // Ignore errors
            }
        };
        loadDismissedTips();
    }, []);

    useEffect(() => {
        // Show 3 random tips that haven't been dismissed
        const availableTips = ALL_TIPS.filter(t => !dismissedTips.has(t.id));
        const shuffled = [...availableTips].sort(() => Math.random() - 0.5);
        setVisibleTips(shuffled.slice(0, 3));
    }, [dismissedTips]);

    const handleDismissTip = async (tipId: string) => {
        const newDismissed = new Set(dismissedTips);
        newDismissed.add(tipId);
        setDismissedTips(newDismissed);

        try {
            await window.wakey?.setSetting('dismissedTips', Array.from(newDismissed));
        } catch (error) {
            console.error('Failed to save dismissed tips:', error);
        }
    };

    const handleDismissAll = () => {
        const allIds = ALL_TIPS.map(t => t.id);
        setDismissedTips(new Set(allIds));
        window.wakey?.setSetting('dismissedTips', allIds);
        onDismiss?.();
    };

    if (visibleTips.length === 0) {
        return null;
    }

    return (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h3 className="font-medium text-white">Getting Started Tips</h3>
                </div>
                <button
                    onClick={handleDismissAll}
                    className="text-xs text-dark-400 hover:text-white transition-colors"
                >
                    Dismiss all
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {visibleTips.map(tip => (
                    <TipCard
                        key={tip.id}
                        tip={tip}
                        onDismiss={() => handleDismissTip(tip.id)}
                    />
                ))}
            </div>
        </div>
    );
}

// Hook to manage tip notifications
export function useTipNotifications() {
    const [currentTip, setCurrentTip] = useState<Tip | null>(null);
    const [shownTips, setShownTips] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load shown tips from storage
        const loadShownTips = async () => {
            try {
                const shown = await window.wakey?.getSetting('shownTipNotifications');
                if (shown && Array.isArray(shown)) {
                    setShownTips(new Set(shown));
                }
            } catch {
                // Ignore errors
            }
        };
        loadShownTips();
    }, []);

    const showRandomTip = () => {
        const availableTips = ALL_TIPS.filter(t => !shownTips.has(t.id));
        if (availableTips.length > 0) {
            const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
            setCurrentTip(randomTip);
        }
    };

    const dismissTip = async () => {
        if (currentTip) {
            const newShown = new Set(shownTips);
            newShown.add(currentTip.id);
            setShownTips(newShown);

            try {
                await window.wakey?.setSetting('shownTipNotifications', Array.from(newShown));
            } catch (error) {
                console.error('Failed to save shown tips:', error);
            }
        }
        setCurrentTip(null);
    };

    return {
        currentTip,
        showRandomTip,
        dismissTip,
        FloatingTipNotification: currentTip ? (
            <FloatingTipNotification
                tip={currentTip}
                onDismiss={dismissTip}
                onRead={() => {
                    // Could open a modal with more details
                    dismissTip();
                }}
            />
        ) : null
    };
}
