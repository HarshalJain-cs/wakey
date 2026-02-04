/**
 * Flow State Indicator Component
 * Real-time flow state detection and visualization
 * Only shows when actively in a focus session
 */

import { useState, useEffect } from 'react';
import { Brain, AlertCircle, TrendingUp, Flame, X } from 'lucide-react';

interface FlowState {
    inFlow: boolean;
    flowScore: number;
    flowDuration: number;
    distractions: number;
    contextSwitches: number;
}

interface FlowStateIndicatorProps {
    isTracking: boolean;
}

export default function FlowStateIndicator({ isTracking }: FlowStateIndicatorProps) {
    const [flowState, setFlowState] = useState<FlowState>({
        inFlow: false,
        flowScore: 0,
        flowDuration: 0,
        distractions: 0,
        contextSwitches: 0,
    });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!isTracking) {
            setFlowState(prev => ({ ...prev, inFlow: false, flowScore: 0 }));
            setIsVisible(false);
            setIsDismissed(false);
            return;
        }

        // Only show after 30 seconds of tracking to not be annoying
        const showTimer = setTimeout(() => {
            if (!isDismissed) setIsVisible(true);
        }, 30000);

        // Simulate flow state detection
        const interval = setInterval(() => {
            setFlowState(prev => {
                const newScore = Math.min(100, prev.flowScore + (Math.random() > 0.3 ? 3 : -1));
                const inFlow = newScore >= 70;

                return {
                    inFlow,
                    flowScore: newScore,
                    flowDuration: inFlow ? prev.flowDuration + 1 : 0,
                    distractions: prev.distractions,
                    contextSwitches: prev.contextSwitches,
                };
            });
        }, 60000);

        return () => {
            clearTimeout(showTimer);
            clearInterval(interval);
        };
    }, [isTracking, isDismissed]);

    // Don't show if not visible or dismissed
    if (!isTracking || !isVisible || isDismissed) return null;

    const getFlowColor = () => {
        if (flowState.flowScore >= 80) return 'from-violet-500 to-purple-600';
        if (flowState.flowScore >= 60) return 'from-blue-500 to-cyan-500';
        if (flowState.flowScore >= 40) return 'from-amber-500 to-orange-500';
        return 'from-gray-600 to-gray-700';
    };

    const getFlowLabel = () => {
        if (flowState.flowScore >= 80) return 'Deep Flow';
        if (flowState.flowScore >= 60) return 'Focused';
        if (flowState.flowScore >= 40) return 'Building';
        return 'Warming Up';
    };

    return (
        <div className="fixed bottom-4 left-4 z-30">
            <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getFlowColor()} text-white text-sm shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5"
                >
                    {flowState.inFlow ? (
                        <Flame className="w-4 h-4 animate-pulse" />
                    ) : (
                        <Brain className="w-4 h-4" />
                    )}
                    <span className="font-medium">{getFlowLabel()}</span>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                    className="ml-1 p-0.5 rounded-full hover:bg-white/20"
                    aria-label="Dismiss flow indicator"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-dark-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{getFlowLabel()}</span>
                            <span className="text-xs text-dark-400">{flowState.flowScore}%</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getFlowColor()} transition-all duration-500`}
                                style={{ width: `${flowState.flowScore}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">Distractions</span>
                            <span className="text-white">{flowState.distractions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">Context Switches</span>
                            <span className="text-white">{flowState.contextSwitches}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
