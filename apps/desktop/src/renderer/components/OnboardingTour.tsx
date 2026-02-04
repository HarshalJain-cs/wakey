import { useState, useEffect, useCallback } from 'react';
import {
    X, ChevronLeft, ChevronRight, Check,
    Sparkles, Target, Zap, Users, Settings, Clock
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface TourStep {
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector for highlight
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Wakey! 🎉',
        description: 'The AI-powered productivity platform that helps you focus, track time, and build better habits.',
        position: 'center',
        icon: Sparkles
    },
    {
        id: 'focus-timer',
        title: 'Focus Timer',
        description: 'Start focused work sessions with customizable timers. Track your deep work and get AI-powered insights.',
        target: '[data-tour="focus-timer"]',
        position: 'right',
        icon: Clock
    },
    {
        id: 'tasks',
        title: 'Task Management',
        description: 'Organize your work with tasks, subtasks, and dependencies. Set priorities and track progress.',
        target: '[data-tour="tasks"]',
        position: 'right',
        icon: Target
    },
    {
        id: 'gamification',
        title: 'Stay Motivated',
        description: 'Earn XP, unlock achievements, and climb leaderboards. Building streaks keeps you on track!',
        target: '[data-tour="gamification"]',
        position: 'left',
        icon: Zap
    },
    {
        id: 'team',
        title: 'Collaborate with Your Team',
        description: 'Share goals, compete in challenges, and stay accountable with team features.',
        target: '[data-tour="team"]',
        position: 'bottom',
        icon: Users
    },
    {
        id: 'settings',
        title: 'Customize Your Experience',
        description: 'Configure integrations, notifications, themes, and more to make Wakey work for you.',
        target: '[data-tour="settings"]',
        position: 'left',
        icon: Settings
    }
];

interface OnboardingTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = TOUR_STEPS[currentStep];
    const isLastStep = currentStep === TOUR_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    // Find and highlight target element
    useEffect(() => {
        if (step.target) {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
    }, [step.target]);

    const handleNext = useCallback(() => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    }, [isLastStep, onComplete]);

    const handlePrev = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    }, [isFirstStep]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onSkip();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onSkip]);

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect || step.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const padding = 16;
        const tooltipWidth = 340;

        switch (step.position) {
            case 'top':
                return {
                    bottom: `${window.innerHeight - targetRect.top + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translateX(-50%)'
                };
            case 'bottom':
                return {
                    top: `${targetRect.bottom + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translateX(-50%)'
                };
            case 'left':
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    right: `${window.innerWidth - targetRect.left + padding}px`,
                    transform: 'translateY(-50%)'
                };
            case 'right':
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    left: `${targetRect.right + padding}px`,
                    transform: 'translateY(-50%)'
                };
            default:
                return {};
        }
    };

    const Icon = step.icon;

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onSkip}
            />

            {/* Highlight box */}
            {targetRect && (
                <div
                    className="absolute border-2 border-primary-400 rounded-xl shadow-lg shadow-primary-500/30 pointer-events-none transition-all duration-300"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)'
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="absolute w-[340px] bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 transition-all duration-300"
                style={getTooltipStyle() as React.CSSProperties}
            >
                {/* Close button */}
                <button
                    onClick={onSkip}
                    className="absolute top-3 right-3 p-1.5 text-dark-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-400" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-dark-300 text-sm mb-6">{step.description}</p>

                {/* Progress & Navigation */}
                <div className="flex items-center justify-between">
                    {/* Progress dots */}
                    <div className="flex gap-1.5">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === currentStep
                                        ? 'bg-primary-400'
                                        : i < currentStep
                                            ? 'bg-primary-600'
                                            : 'bg-dark-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-2">
                        {!isFirstStep && (
                            <button
                                onClick={handlePrev}
                                className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-dark-300" />
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                        >
                            {isLastStep ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Get Started
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

                {/* Skip link */}
                <button
                    onClick={onSkip}
                    className="w-full mt-4 text-center text-xs text-dark-500 hover:text-dark-300 transition-colors"
                >
                    Skip tour
                </button>
            </div>
        </div>,
        document.body
    );
}
