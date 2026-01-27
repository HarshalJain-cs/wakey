import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { CHART_COLORS } from '../../constants/chart-colors';

interface LineChartData {
    name: string;
    value: number;
    [key: string]: any;
}

interface AnimatedLineChartProps {
    data: LineChartData[];
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    height?: number;
    lineColor?: string;
    showArea?: boolean;
    showGrid?: boolean;
    formatValue?: (value: number) => string;
    dataKeys?: { key: string; color: string; name: string }[];
}

export default function AnimatedLineChart({
    data,
    title,
    xAxisLabel: _xAxisLabel,
    yAxisLabel: _yAxisLabel,
    height = 300,
    lineColor = CHART_COLORS.primary,
    showArea = true,
    showGrid = true,
    formatValue,
    dataKeys,
}: AnimatedLineChartProps) {
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
                    <p className="text-white font-medium mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {valueFormatter(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Use AreaChart if showArea is true for filled gradient effect
    if (showArea && (!dataKeys || dataKeys.length === 1)) {
        return (
            <div className="w-full" style={{ height }}>
                {title && (
                    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={valueFormatter}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2}
                            fill="url(#colorValue)"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Multi-line chart
    return (
        <div className="w-full" style={{ height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                    />
                    <YAxis
                        tickFormatter={valueFormatter}
                        stroke="#64748b"
                        fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {dataKeys ? (
                        dataKeys.map((dk, index) => (
                            <Line
                                key={dk.key}
                                type="monotone"
                                dataKey={dk.key}
                                name={dk.name}
                                stroke={dk.color}
                                strokeWidth={2}
                                dot={{ fill: dk.color, strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationBegin={index * 100}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                        ))
                    ) : (
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2}
                            dot={{ fill: lineColor, strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
