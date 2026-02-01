import { useState, useEffect } from 'react';

interface HeatmapData {
    day: string;      // Day of week (Mon, Tue, etc.)
    hour: number;     // 0-23
    value: number;    // Activity minutes
}

interface HeatmapChartProps {
    data: HeatmapData[];
    title?: string;
    height?: number;
    colorScale?: 'teal' | 'purple' | 'green' | 'blue' | 'orange' | 'cyan';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLOR_SCALES = {
    teal: ['#0d3331', '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'],
    purple: ['#3b0764', '#6b21a8', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
    green: ['#14532d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    blue: ['#172554', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    orange: ['#431407', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74'],
    cyan: ['#083344', '#0e7490', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],
};

export default function HeatmapChart({
    data,
    title,
    height = 200,
    colorScale = 'teal',
}: HeatmapChartProps) {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Create a lookup map for quick access
    const dataMap = new Map<string, number>();
    let maxValue = 0;
    let totalActivity = 0;
    data.forEach(d => {
        const key = `${d.day}-${d.hour}`;
        dataMap.set(key, d.value);
        if (d.value > maxValue) maxValue = d.value;
        totalActivity += d.value;
    });

    // Check for new users with no activity
    if (totalActivity === 0) {
        return (
            <div className="w-full" style={{ minHeight: height }}>
                {title && (
                    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                )}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-cyan-500/5 to-primary-500/5 rounded-lg border border-dark-700" style={{ height: height - 40 }}>
                    <div className="p-3 bg-cyan-500/20 rounded-full mb-3">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-white font-medium text-center mb-1">Building Your Heatmap</p>
                    <p className="text-xs text-dark-400 text-center max-w-48">
                        Your activity patterns will appear here as you use your computer
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span>Tracking active</span>
                    </div>
                </div>
            </div>
        );
    }

    const colors = COLOR_SCALES[colorScale];

    const getColor = (value: number): string => {
        if (value === 0) return '#1e293b';
        const ratio = value / maxValue;
        const index = Math.min(Math.floor(ratio * (colors.length - 1)), colors.length - 1);
        return colors[index];
    };

    const formatHour = (hour: number): string => {
        if (hour === 0) return '12a';
        if (hour === 12) return '12p';
        return hour < 12 ? `${hour}a` : `${hour - 12}p`;
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const cellSize = 16;
    const gap = 2;

    return (
        <div className="w-full" style={{ minHeight: height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}

            <div className="overflow-x-auto">
                <div className="inline-block">
                    {/* Hour labels - show all 24 hours */}
                    <div className="flex ml-10 mb-1">
                        {HOURS.map(hour => (
                            <div
                                key={hour}
                                className="text-[10px] text-dark-500 text-center"
                                style={{ width: cellSize + gap }}
                            >
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex flex-col" style={{ gap: gap }}>
                        {DAYS.map((day, dayIndex) => (
                            <div key={day} className="flex items-center">
                                <div className="w-10 text-xs text-dark-500">{day}</div>
                                <div className="flex" style={{ gap: gap }}>
                                    {HOURS.map((hour, hourIndex) => {
                                        const key = `${day}-${hour}`;
                                        const value = dataMap.get(key) || 0;
                                        const delay = (dayIndex * 24 + hourIndex) * 5;

                                        return (
                                            <div
                                                key={key}
                                                className="rounded-sm transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-white/30 group relative"
                                                style={{
                                                    width: cellSize,
                                                    height: cellSize,
                                                    backgroundColor: isAnimated ? getColor(value) : '#1e293b',
                                                    transitionDelay: `${delay}ms`,
                                                }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-800 border border-dark-600 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <div className="font-medium">{day} {formatHour(hour)}</div>
                                                    <div className="text-dark-400">{formatDuration(value)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4">
                        <span className="text-xs text-dark-500">Less</span>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <span className="text-xs text-dark-500">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
