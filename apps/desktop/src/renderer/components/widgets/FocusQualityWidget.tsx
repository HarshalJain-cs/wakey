import { useState, useEffect } from 'react';

interface FocusQualityWidgetProps {
    score?: number; // 0-100, optional - will calculate if not provided
}

export default function FocusQualityWidget({ score: propScore }: FocusQualityWidgetProps) {
    const [score, setScore] = useState(propScore ?? 0);
    const [stats, setStats] = useState({ distractions: 0, switches: 0, breaks: 0 });

    useEffect(() => {
        // If score not provided as prop, calculate from today's stats
        if (propScore === undefined) {
            const loadStats = async () => {
                try {
                    const todayStats = await window.wakey.getTodayStats();
                    // Calculate quality score based on focus time and distractions
                    const focusMinutes = todayStats.focusTime || 0;
                    const distractions = todayStats.distractions || 0;
                    // Simple scoring: base 50 + (focus time bonus) - (distraction penalty)
                    const calculatedScore = Math.min(100, Math.max(0,
                        50 + Math.floor(focusMinutes / 10) - (distractions * 5)
                    ));
                    setScore(calculatedScore);
                    setStats({
                        distractions: distractions,
                        switches: Math.floor(distractions * 1.5),
                        breaks: todayStats.sessions || 0
                    });
                } catch (error) {
                    console.error('Failed to load stats:', error);
                }
            };
            loadStats();
        } else {
            setScore(propScore);
        }
    }, [propScore]);

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-400';
        if (s >= 60) return 'text-primary-400';
        if (s >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return 'Excellent';
        if (s >= 60) return 'Good';
        if (s >= 40) return 'Fair';
        if (s > 0) return 'Needs Work';
        return 'No Data';
    };

    return (
        <div className="widget-card h-full">
            <div className="widget-card-header">
                <span className="widget-card-title">
                    ⚡ Focus Quality
                </span>
            </div>

            <div className="flex flex-col items-center py-4">
                {/* Score gauge */}
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="10"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#0d9488" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                            {score}
                        </span>
                        <span className="text-xs text-dark-400">/ 100</span>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                        {getScoreLabel(score)}
                    </div>
                    <p className="text-xs text-dark-400 mt-1">
                        {score === 0
                            ? 'Start a focus session to see your score'
                            : 'Based on focus time, distractions & breaks'
                        }
                    </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                    <div className="text-center p-2 bg-dark-900/50 rounded-lg">
                        <div className="text-sm font-semibold text-white">{stats.distractions}</div>
                        <div className="text-xs text-dark-400">Distractions</div>
                    </div>
                    <div className="text-center p-2 bg-dark-900/50 rounded-lg">
                        <div className="text-sm font-semibold text-white">{stats.switches}</div>
                        <div className="text-xs text-dark-400">Switches</div>
                    </div>
                    <div className="text-center p-2 bg-dark-900/50 rounded-lg">
                        <div className="text-sm font-semibold text-white">{stats.breaks}</div>
                        <div className="text-xs text-dark-400">Breaks</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
