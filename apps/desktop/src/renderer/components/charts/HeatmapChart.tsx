import { useState, useEffect } from 'react';
import { CHART_COLORS } from '../../constants/chart-colors';

interface HeatmapData {
    day: string;      // Day of week (Mon, Tue, etc.)
    hour: number;     // 0-23
    value: number;    // Activity minutes
}

interface HeatmapChartProps {
    data: HeatmapData[];
    title?: string;
    height?: number;
    colorScale?: 'teal' | 'purple' | 'green' | 'blue';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLOR_SCALES = {
    teal: ['#042f2e', '#134e4a', '#115e59', '#0d9488', '#14b8a6', '#2dd4bf'],
    purple: ['#2e1065', '#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa'],
    green: ['#052e16', '#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80'],
    blue: ['#082f49', '#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8'],
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
    data.forEach(d => {
        const key = `${d.day}-${d.hour}`;
        dataMap.set(key, d.value);
        if (d.value > maxValue) maxValue = d.value;
    });

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

    const cellSize = 20;
    const gap = 2;

    return (
        <div className="w-full" style={{ minHeight: height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}

            <div className="overflow-x-auto">
                <div className="inline-block">
                    {/* Hour labels */}
                    <div className="flex ml-10 mb-1">
                        {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                            <div
                                key={hour}
                                className="text-xs text-dark-500"
                                style={{ width: (cellSize + gap) * 3, textAlign: 'left' }}
                            >
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex flex-col gap-0.5">
                        {DAYS.map((day, dayIndex) => (
                            <div key={day} className="flex items-center">
                                <div className="w-10 text-xs text-dark-500">{day}</div>
                                <div className="flex gap-0.5">
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
