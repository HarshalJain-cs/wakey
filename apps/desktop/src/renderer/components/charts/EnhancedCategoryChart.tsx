import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { ChevronDown, ChevronUp, Clock, Zap, TrendingUp } from 'lucide-react';
import { CHART_COLORS, getCategoryColor } from '../../constants/chart-colors';

interface CategoryData {
    name: string;
    value: number;
    color?: string;
    subCategories?: { name: string; value: number }[];
}

interface EnhancedCategoryChartProps {
    data: CategoryData[];
    title?: string;
    height?: number;
}

export default function EnhancedCategoryChart({
    data,
    title = "Time by Category",
    height = 350,
}: EnhancedCategoryChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Prepare chart data with colors
    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            color: item.color || getCategoryColor(item.name) ||
                Object.values(CHART_COLORS.categories)[index % Object.values(CHART_COLORS.categories).length],
        }));
    }, [data]);

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Find "Other" category for expansion
    const otherCategory = chartData.find(c => c.name.toLowerCase() === 'other');

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

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

    // Active sector rendering for hover effect
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    // Calculate insights
    const topCategory = chartData.reduce((max, c) => c.value > max.value ? c : max, chartData[0]);
    const productivityScore = useMemo(() => {
        const productiveCategories = ['Development', 'Productivity', 'Communication'];
        const productiveTime = chartData
            .filter(c => productiveCategories.includes(c.name))
            .reduce((sum, c) => sum + c.value, 0);
        return total > 0 ? Math.round((productiveTime / total) * 100) : 0;
    }, [chartData, total]);

    // Check for new users with no data
    const hasRealData = data && data.length > 0 && total > 0;

    if (!hasRealData) {
        return (
            <div className="w-full flex flex-col" style={{ height }}>
                {title && (
                    <h3 className="text-lg font-semibold text-white mb-2 flex-shrink-0">{title}</h3>
                )}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-500/5 to-cyan-500/5 rounded-lg border border-dark-700">
                    <div className="p-3 bg-primary-500/20 rounded-full mb-3">
                        <Clock className="w-6 h-6 text-primary-400" />
                    </div>
                    <p className="text-white font-medium text-center mb-1">No Activity Yet</p>
                    <p className="text-xs text-dark-400 text-center max-w-48">
                        Start using apps and we'll categorize your time automatically
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-primary-400">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                        <span>Tracking active</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col" style={{ height }}>
            {title && (
                <h3 className="text-lg font-semibold text-white mb-2 flex-shrink-0">{title}</h3>
            )}

            {/* Chart Area */}
            <div className="flex-1 min-h-0 flex">
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={isAnimated ? 80 : 0}
                                paddingAngle={1}
                                dataKey="value"
                                activeIndex={activeIndex ?? undefined}
                                activeShape={renderActiveShape}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="none"
                                        style={{ cursor: entry.name.toLowerCase() === 'other' ? 'pointer' : 'default' }}
                                        onClick={() => {
                                            if (entry.name.toLowerCase() === 'other') {
                                                setExpandedCategory(expandedCategory === 'other' ? null : 'other');
                                            }
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend & Stats */}
                <div className="w-40 flex flex-col justify-center gap-1 pl-2">
                    {chartData.slice(0, 6).map((entry, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-2 text-xs cursor-pointer hover:bg-dark-700/50 rounded px-1 py-0.5 transition-colors ${entry.name.toLowerCase() === 'other' ? 'border-l-2 border-primary-500' : ''
                                }`}
                            onClick={() => {
                                if (entry.name.toLowerCase() === 'other') {
                                    setExpandedCategory(expandedCategory === 'other' ? null : 'other');
                                }
                            }}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-dark-300 truncate flex-1">{entry.name}</span>
                            <span className="text-dark-500 text-[10px]">{formatDuration(entry.value)}</span>
                            {entry.name.toLowerCase() === 'other' && (
                                expandedCategory === 'other' ?
                                    <ChevronUp className="w-3 h-3 text-primary-400" /> :
                                    <ChevronDown className="w-3 h-3 text-dark-500" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Expanded "Other" Section */}
            {expandedCategory === 'other' && otherCategory && otherCategory.subCategories && (
                <div className="mt-2 p-2 bg-dark-900/50 rounded-lg border border-dark-700">
                    <div className="text-xs text-dark-400 mb-2">Apps in "Other" category:</div>
                    <div className="grid grid-cols-2 gap-1">
                        {otherCategory.subCategories.slice(0, 8).map((sub, i) => (
                            <div key={i} className="flex justify-between text-xs">
                                <span className="text-dark-300 truncate">{sub.name}</span>
                                <span className="text-dark-500">{formatDuration(sub.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Insights */}
            <div className="flex gap-3 mt-2 pt-2 border-t border-dark-700">
                <div className="flex items-center gap-1.5 text-xs">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-dark-400">Top:</span>
                    <span className="text-white font-medium">{topCategory?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-dark-400">Productivity:</span>
                    <span className={`font-medium ${productivityScore >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {productivityScore}%
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-dark-400">Total:</span>
                    <span className="text-white font-medium">{formatDuration(total)}</span>
                </div>
            </div>
        </div>
    );
}
