import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS, getCategoryColor } from '../../constants/chart-colors';

interface PieChartData {
    name: string;
    value: number;
    color?: string;
}

interface AnimatedPieChartProps {
    data: PieChartData[];
    title?: string;
    showLegend?: boolean;
    innerRadius?: number;
    height?: number;
}

export default function AnimatedPieChart({
    data,
    title,
    showLegend = true,
    innerRadius = 60,
    height = 300,
}: AnimatedPieChartProps) {
    const [isAnimated, setIsAnimated] = useState(false);

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

    // Add colors to data if not provided
    const chartData = data.map((item, index) => ({
        ...item,
        color: item.color || getCategoryColor(item.name) || Object.values(CHART_COLORS.categories)[index % Object.values(CHART_COLORS.categories).length],
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-white font-medium">{data.name}</p>
                    <p className="text-dark-300 text-sm">
                        {formatDuration(data.value)} ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-dark-300 text-sm">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full" style={{ height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4 text-center">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={isAnimated ? 100 : 0}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend content={renderLegend} />}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
