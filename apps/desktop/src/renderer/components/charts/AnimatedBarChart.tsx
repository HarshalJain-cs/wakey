import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS, SERIES_COLORS } from '../../constants/chart-colors';

interface BarChartData {
    name: string;
    value: number;
    color?: string;
}

interface AnimatedBarChartProps {
    data: BarChartData[];
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    horizontal?: boolean;
    height?: number;
    barColor?: string;
    showGrid?: boolean;
    formatValue?: (value: number) => string;
}

export default function AnimatedBarChart({
    data,
    title,
    xAxisLabel: _xAxisLabel,
    yAxisLabel: _yAxisLabel,
    horizontal = false,
    height = 300,
    barColor: _barColor = CHART_COLORS.primary,
    showGrid = true,
    formatValue,
}: AnimatedBarChartProps) {
    const [_isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-dark-400">
                No data available
            </div>
        );
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const valueFormatter = formatValue || formatDuration;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-white font-medium">{label}</p>
                    <p className="text-primary-400 text-sm">
                        {valueFormatter(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Truncate long names for display
    const truncateName = (name: string, maxLen = 12) => {
        if (name.length <= maxLen) return name;
        return name.substring(0, maxLen - 2) + '...';
    };

    const chartData = data.map((item, index) => ({
        ...item,
        displayName: truncateName(item.name),
        color: item.color || SERIES_COLORS[index % SERIES_COLORS.length],
    }));

    if (horizontal) {
        return (
            <div className="w-full" style={{ height }}>
                {title && (
                    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />}
                        <XAxis
                            type="number"
                            tickFormatter={valueFormatter}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis
                            type="category"
                            dataKey="displayName"
                            stroke="#64748b"
                            fontSize={12}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
                    <XAxis
                        dataKey="displayName"
                        stroke="#64748b"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        tickFormatter={valueFormatter}
                        stroke="#64748b"
                        fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
