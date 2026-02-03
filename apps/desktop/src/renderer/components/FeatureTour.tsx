import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles, Target, Clock, BarChart2, Settings, Flame, Brain, CheckCircle } from 'lucide-react';

interface TourStep {
    id: string;
    target: string; // CSS selector for the target element
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    icon: React.ReactNode;
    action?: string; // Optional action button text
}

interface FeatureTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'dashboard',
        target: '[data-tour="dashboard"]',
        title: 'Your Dashboard',
        content: 'This is your productivity command center. Track time, view stats, and manage your focus sessions all from here.',
        placement: 'bottom',
        icon: <BarChart2 className="w-5 h-5" />
    },
    {
        id: 'focus-timer',
        target: '[data-tour="focus-timer"]',
        title: 'Focus Timer',
        content: 'Start a focus session to track your productive time. Use Pomodoro or customize your own pattern.',
        placement: 'left',
        icon: <Clock className="w-5 h-5" />,
        action: 'Try it!'
    },
    {
        id: 'quick-stats',
        target: '[data-tour="quick-stats"]',
        title: 'Quick Stats',
        content: 'See your daily progress at a glance. Track focus time, sessions completed, and your current streak.',
        placement: 'bottom',
        icon: <Target className="w-5 h-5" />
    },
    {
        id: 'challenges',
        target: '[data-tour="challenges"]',
        title: 'Daily Challenges',
        content: 'Complete challenges to earn XP and level up! New challenges appear daily based on your goals.',
        placement: 'top',
        icon: <Flame className="w-5 h-5" />
    },
    {
        id: 'ai-insights',
        target: '[data-tour="ai-insights"]',
        title: 'AI Insights',
        content: 'Get personalized productivity insights powered by AI. Set up your API key in Settings to enable.',
        placement: 'left',
        icon: <Brain className="w-5 h-5" />
    },
    {
        id: 'settings',
        target: '[data-tour="settings"]',
        title: 'Settings',
        content: 'Customize Wakey to fit your workflow. Configure themes, notifications, integrations, and more.',
        placement: 'left',
        icon: <Settings className="w-5 h-5" />
    }
];

// Spotlight overlay that highlights the target element
function Spotlight({ targetRect }: { targetRect: DOMRect | null }) {
    if (!targetRect) return null;

    const padding = 8;
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const width = targetRect.width + padding * 2;
    const height = targetRect.height + padding * 2;

    return (
        <div className="fixed inset-0 z-[9998] pointer-events-none">
            {/* Dark overlay with hole for target */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            rx="12"
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.8)"
                    mask="url(#spotlight-mask)"
                />
            </svg>
            {/* Highlight border */}
            <div
                className="absolute border-2 border-primary-500 rounded-xl shadow-lg animate-pulse"
                style={{
                    left: x,
                    top: y,
                    width,
                    height,
                    boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.4)'
                }}
            />
        </div>
    );
}

// Tooltip that appears next to the target
function TourTooltip({
    step,
    targetRect,
    onNext,
    onPrev,
    onSkip,
    currentIndex,
    totalSteps
}: {
    step: TourStep;
    targetRect: DOMRect | null;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    currentIndex: number;
    totalSteps: number;
}) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!targetRect || !tooltipRef.current) return;

        const tooltip = tooltipRef.current;
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 20;

        let x = 0;
        let y = 0;

        switch (step.placement) {
            case 'bottom':
                x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                y = targetRect.bottom + padding;
                break;
            case 'top':
                x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                y = targetRect.top - tooltipRect.height - padding;
                break;
            case 'left':
                x = targetRect.left - tooltipRect.width - padding;
                y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                break;
            case 'right':
                x = targetRect.right + padding;
                y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                break;
        }

        // Keep tooltip in viewport
        x = Math.max(16, Math.min(x, window.innerWidth - tooltipRect.width - 16));
        y = Math.max(16, Math.min(y, window.innerHeight - tooltipRect.height - 16));

        setPosition({ x, y });
    }, [targetRect, step.placement]);

    const isLast = currentIndex === totalSteps - 1;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[9999] w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                opacity: targetRect ? 1 : 0,
                transition: 'opacity 0.2s, left 0.3s, top 0.3s'
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border-b border-dark-600">
                <div className="p-2 bg-primary-500/30 rounded-lg text-primary-400">
                    {step.icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <span className="text-xs text-dark-400">Step {currentIndex + 1} of {totalSteps}</span>
                </div>
                <button
                    onClick={onSkip}
                    className="p-1.5 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-sm text-dark-300 leading-relaxed">{step.content}</p>
            </div>

            {/* Progress & Navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-dark-900/50 border-t border-dark-700">
                {/* Progress dots */}
                <div className="flex gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex
                                    ? 'bg-primary-500'
                                    : i < currentIndex
                                        ? 'bg-primary-500/50'
                                        : 'bg-dark-600'
                                }`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    {currentIndex > 0 && (
                        <button
                            onClick={onPrev}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-dark-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        className="flex items-center gap-1 px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        {isLast ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Finish
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FeatureTour({ onComplete, onSkip }: FeatureTourProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);

    const currentStep = TOUR_STEPS[currentStepIndex];

    // Find and highlight the target element
    const updateTargetRect = useCallback(() => {
        if (showWelcome) {
            setTargetRect(null);
            return;
        }

        const target = document.querySelector(currentStep.target);
        if (target) {
            setTargetRect(target.getBoundingClientRect());
        } else {
            // If target not found, try to find a fallback or skip
            console.warn(`Tour target not found: ${currentStep.target}`);
            // Create a centered rect as fallback
            setTargetRect(new DOMRect(
                window.innerWidth / 2 - 150,
                window.innerHeight / 2 - 50,
                300,
                100
            ));
        }
    }, [currentStep, showWelcome]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);
        return () => {
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
        };
    }, [updateTargetRect]);

    const handleNext = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleStartTour = () => {
        setShowWelcome(false);
    };

    // Welcome screen
    if (showWelcome) {
        return (
            <div className="fixed inset-0 bg-dark-950/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
                <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Take a Quick Tour</h2>
                    <p className="text-dark-400 mb-8">
                        Let us show you around Wakey! This quick tour will help you discover all the features that will boost your productivity.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleStartTour}
                            className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Start Tour
                        </button>
                        <button
                            onClick={onSkip}
                            className="w-full py-3 text-dark-400 hover:text-white transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                    <p className="text-xs text-dark-500 mt-4">
                        You can restart the tour anytime from Settings
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Spotlight targetRect={targetRect} />
            <TourTooltip
                step={currentStep}
                targetRect={targetRect}
                onNext={handleNext}
                onPrev={handlePrev}
                onSkip={onSkip}
                currentIndex={currentStepIndex}
                totalSteps={TOUR_STEPS.length}
            />
        </>
    );
}

// Hook to manage tour state
export function useTourState() {
    const [showTour, setShowTour] = useState(false);
    const [tourCompleted, setTourCompleted] = useState(false);

    useEffect(() => {
        // Check if tour has been completed
        const checkTourStatus = async () => {
            try {
                const completed = await window.wakey?.getSetting('featureTourComplete');
                setTourCompleted(!!completed);
            } catch {
                setTourCompleted(false);
            }
        };
        checkTourStatus();
    }, []);

    const startTour = () => setShowTour(true);

    const completeTour = async () => {
        setShowTour(false);
        setTourCompleted(true);
        try {
            await window.wakey?.setSetting('featureTourComplete', true);
        } catch (error) {
            console.error('Failed to save tour completion:', error);
        }
    };

    const skipTour = () => {
        setShowTour(false);
    };

    return {
        showTour,
        tourCompleted,
        startTour,
        completeTour,
        skipTour
    };
}
